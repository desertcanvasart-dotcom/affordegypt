# Afford Egypt — Architectural Assessment

**Date:** 2026-04-26
**Scope:** Pre-launch audit before going live on Railway
**Reviewer:** Claude (Opus 4.7)

This is an honest read of the codebase you inherited. The site will ship and run — the Railway deploy is healthy. But there are real structural issues that will cost you money or time if not addressed. Three audits below: database, pricing, overall structure. Each has a verdict, the top problems with file references, and what a clean version looks like.

---

## 1. Database Design

**Verdict:** Mediocre, not broken. Foreign keys exist and money is mostly stored as `decimal`, but the schema mixes two competing patterns (relational vs. JSONB blobs) and is missing indexes on the most common join paths.

### Top problems

1. **Three competing pricing storage patterns side by side.**
   - `basePriceByVehicle` — JSONB on the routes table
   - `vehiclePrices` — JSONB on the routes table, appears unused
   - `services.basePrice` — proper `decimal` column

   The JSONB columns are parsed as `any` in `server/database-storage.ts:170, 201, 770, 785`. There's no schema validation, no type safety — bad data can land in the column and only surface when something downstream divides by zero.

2. **Quotes are stored as one giant JSON blob** (`shared/schema.ts:167`). There is no `quote_line_items` table, no foreign keys from quote rows to the services they reference. The practical consequence: **if you change a service or attraction price tomorrow, every previously-saved quote silently re-prices itself the next time it's read.** That's how customers get charged different amounts than what they were originally quoted.

3. **No indexes on foreign-key columns.** `userId`, `bookingId`, `cityId` are joined throughout `database-storage.ts:695-696` but Postgres has to seq-scan them. Fine at low traffic, painful at scale. Also: timestamps use `timestamp` (no timezone) instead of `timestamptz` — inconsistent across the schema.

### What a clean version looks like

- Drop the JSONB pricing columns; move pricing into a normalized `pricing_tiers` table (vehicle_type_id, license_class_id, base_price, effective_date).
- Split `quotes` into a header row + a `quote_line_items` table where each line stores a **frozen unit price**. Once written, never changes.
- Index every foreign-key column plus common filter combos like `(cityId, createdAt)`.
- Use `timestamptz` everywhere.
- Promote enum-like text fields (role, paymentStatus, bookingStatus) to Postgres enums or lookup tables.

---

## 2. Pricing Structure

**Verdict:** Actively broken. This is the most urgent problem in the codebase. Four separate pricing implementations coexist and can produce different totals for the same input. Quotes are mutable. Commission is stored but never applied.

### Top problems

1. **Four pricing engines, no single source of truth:**

   | File | What it does |
   |---|---|
   | `server/pricing-engine.ts:35-50` | Hardcoded `ROUTE_PRICES[]` array |
   | `server/pricing-calculator.ts:48-63` | Reads `route.basePriceByVehicle` JSONB |
   | `server/pricing-routes.ts:28-40` | Inline math, divides by travelers |
   | `server/database-storage.ts:686-809` | Parallel logic with hardcoded `"pyramids": 15` etc. |

   Same booking, different total depending on which code path runs. There is no canonical answer to "what does this trip cost?"

2. **Quotes are not snapshots.** When a saved quote is read, the system **recomputes** add-on prices from current DB values (`/api/calculate-pricing` line 77). If you raise the price of "Pyramids attraction" tomorrow, every customer's existing quote shows the new price. A quote should be an immutable record — a financial document, not a live formula.

3. **Commission is stored, never applied.** The `commissionPct` field exists on quotes (`shared/schema.ts:169`) but `database-storage.ts:830` never multiplies by it. Pure decoration. Whatever business logic the original developer had in mind for commissions was abandoned mid-implementation.

4. **Client can influence price calculation.** `/api/calculate-pricing` accepts `travelers` from the request body and divides by it without bounds checking against booking constraints. A tampered request (e.g., `travelers: 1000`) gets a quote back that should never have been issued.

### What a clean version looks like

- One `PricingService` class. Every code path that needs a price calls it. Delete the other three.
- DB-backed lookup tables for: pricing tiers, seasonal modifiers, commission rules. **Zero hardcoded prices in code.**
- Quote creation **freezes line-item unit prices** into `quote_line_items` rows that never change.
- Commission is applied at quote creation, not at read time.
- Server validates traveler counts against vehicle capacity before issuing a quote; never trusts the client number.

**This is the only audit item that can directly cost you money. Fix this before you start marketing.**

---

## 3. Overall Code Structure

**Verdict:** Half-finished refactor. The bones are okay; the execution shows signs of someone iterating, getting partway, and stopping.

### Top problems

1. **`routes.ts` is 1,900 lines doing everything**, and `enhanced-routes.ts` is another **911 lines duplicating some endpoints**. Both files define `/api/cities`, `/api/vehicle-types`, etc. Classic signal of an extraction that was started and abandoned. It's not always clear which version is actually wired up at runtime.

2. **Two storage implementations.**
   - `server/storage.ts` (350 lines) — an in-memory `MemStorage` class with mock seed data, **never instantiated in production**.
   - `server/database-storage.ts` (882 lines) — the real one, used everywhere.

   The first is dead code. It will silently drift out of sync with the real one.

3. **Three auth libraries imported, roughly one used.**
   - Custom JWT in `server/auth.ts:26-37`
   - `passport` referenced in `email-service.ts`
   - `openid-client` imported, no clear usage

   Auth complexity is the #1 source of security bugs. Pick one approach.

4. **TypeScript discipline is loose.**
   - `server/database-storage.ts` has 10+ explicit `any` (lines 115, 119, 170, 201, 622, 676, 680, 770, 785).
   - `routes.ts:400` reads `req.body` with no Zod validation. Most endpoints don't validate input.
   - The result: bad client input crashes the server instead of returning 400.

5. **One-off scripts living in `server/`.** `test-translations.ts` and `migrate-translations.ts` should be in `scripts/` (which already exists), clearly marked as run-once.

### What a clean version looks like

- One router setup, decomposed by domain into a few small files (`routes/quotes.ts`, `routes/bookings.ts`, etc.). Routes are thin — they validate input and call a service. Logic lives in services.
- One storage layer. Delete `MemStorage`.
- One auth approach. JWT in HttpOnly cookies + refresh tokens, OR OAuth via `openid-client`. Not both.
- Zod schemas on every `req.body` — wired through a shared middleware so it's hard to forget.
- Dead/one-shot scripts moved to `scripts/`.

---

## Priority order, if/when you tackle this

1. **Pricing rewrite + immutable quotes (#2 + #1.2).** Highest risk: directly affects what customers pay. Doing both together makes sense because they share the new `quote_line_items` table.
2. **Schema cleanup (#1.3): indexes, timestamptz, drop JSONB pricing.** Low risk, high payoff. Do this in the same migration as #1.
3. **Delete dead code: `MemStorage`, unused auth libraries, scripts in `server/`.** Pure win. An afternoon's work.
4. **Consolidate `routes.ts` + `enhanced-routes.ts` into a domain-split router.** Long but reversible. Do incrementally, one domain at a time.
5. **Tighten TypeScript: Zod at all boundaries, eliminate `any` in storage layer.** Ongoing background work.

---

## What I'd ship today vs. fix first

**Ship today:** The site as-is can serve traffic. Deploy is healthy on Railway. Reads, writes, and basic flows work.

**Fix before you take real bookings:** Items #1 and #2 from the priority list. The pricing inconsistency and mutable quotes are not theoretical risks — they will cause a customer dispute the first time you change a price, and you'll have no defensible record of what was originally quoted.

**Fix when convenient:** Everything else. None of it is on fire; all of it is technical debt that will compound.
