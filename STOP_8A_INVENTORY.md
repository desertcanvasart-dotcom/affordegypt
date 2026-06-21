# STOP 8a — Existing-pattern inventory

Goal: surface what's actually in the repo before phase 8b/9/10/11 build on top of it. **Headline finding:** the spec's claim that "the migrations (phases 11, 14-18, 21) prepared" the inquiries / quote_versions / quote_share_tokens / audit_log tables is **false for this repo**. Only migrations `0000` through `0005` exist on disk, and none of those tables are referenced in the codebase. Phase 8b cannot proceed as written without first introducing the schema.

---

## Auth & roles

**1. Admin authentication.** Stateless JWT in the `Authorization: Bearer …` header. Tokens are issued by `POST /api/auth/login` (signed in `server/auth.ts` with `JWT_SECRET`, 30-day expiry, payload `{id, username, email, role}`). No cookies, no Express session, no third-party auth provider. See [server/auth.ts:26-45](server/auth.ts:26).

**2. SPA-side admin auth state.** Two parallel mechanisms, neither of them a route guard:

- A global React context [client/src/hooks/useAuth.tsx](client/src/hooks/useAuth.tsx) exposes `useAuth()` returning `{user, isAuthenticated, login, logout, …}` and persists the JWT under `localStorage.auth_token` plus a `cached_user` blob.
- The `/admin` page itself ([client/src/pages/admin-sidebar.tsx:20](client/src/pages/admin-sidebar.tsx:20)) keeps its own `useState(isAuthenticated)` and renders [client/src/components/admin-login.tsx](client/src/components/admin-login.tsx) as a gate. On successful login it writes the token under **both** `auth_token` and `admin-token` ([admin-login.tsx:48-51](client/src/components/admin-login.tsx:48)). Other admin pages skip this gate — they assume any token in localStorage is good enough and rely on the API 401-ing if not.

There is **no `<RequireAdmin>` route wrapper**. Any browser can navigate to `/admin/service-catalog`; the page just won't get data because the API will 401.

**3. API-side admin auth check.** Per-route via the spread-args pattern: `app.METHOD(path, ...adminAuth, handler)`, where `adminAuth = [authenticateToken, requireAdmin]` is declared once at the top of `registerRoutes` ([server/routes.ts:76](server/routes.ts:76)). Both middlewares live in [server/auth.ts:47](server/auth.ts:47) and [server/auth.ts:64](server/auth.ts:64). `requireAdmin` checks `req.user.role !== 'admin'` and 403s otherwise.

**4. Role granularity.** **There is only one role gate, `'admin'`** ([server/auth.ts:69](server/auth.ts:69)). Grep for `operations_manager`, `pricing_manager`, `viewer`, `app_role` returns zero hits across `client/`, `server/`, and `shared/`. The spec's `app_role` enum does not exist in this repo. Phases 9-11 will need to either build that out or stay single-role.

---

## Existing admin pages

**5. Admin shell / layout.** No reusable shell component. Each admin page renders its own `<div className="min-h-screen bg-gray-50">` + `<Link href="/admin"><Button>Back to admin</Button></Link>` header. See [client/src/pages/admin-service-catalog.tsx:88-106](client/src/pages/admin-service-catalog.tsx:88) for the canonical pattern. The `/admin` index ([admin-sidebar.tsx](client/src/pages/admin-sidebar.tsx)) is a single ~700-line dashboard, not a layout. There is no `client/src/components/admin/` directory.

**6. `/admin/*` SPA routes.** All defined inline in [client/src/App.tsx:85-95](client/src/App.tsx:85):

```
/admin                                          → AdminSidebar (login + dashboard)
/admin/bookings                                 → AdminBookings
/admin/reviews                                  → AdminReviews
/admin/routes                                   → AdminRoutesOverview
/admin/routes/city/:citySlug/:category?         → AdminCityRoutes
/admin/service-catalog                          → AdminServiceCatalog
/admin/service-catalog/new                      → AdminServiceCatalogEdit
/admin/service-catalog/:id/edit                 → AdminServiceCatalogEdit
/admin/trip-types                               → AdminTripTypes
/admin/service-categories                       → AdminServiceCategories
```

Note: there is **no `/admin/catalog/services`** — the spec's STOP 9 reference to that path is wrong. The catalog admin lives at `/admin/service-catalog`.

**7. Catalog admin pages render.** Build verified clean (`npm run check && npm run build`). I did not run `npm run dev` in this audit; pages compile, are wired into App.tsx, and use the working `/api/admin/service-catalog` endpoints. Confidence: high they render given the same query/JWT setup is shared with `/admin/bookings`, which has been live.

**8. Admin table / list pattern.** No reusable list component. The standard recipe (per [admin-service-catalog.tsx](client/src/pages/admin-service-catalog.tsx)):

- `useQuery` with key `["/api/admin/...", {filters}]` and a `queryFn` that builds a `URLSearchParams` and calls `adminFetch(...)`.
- Filter UI: ad-hoc `<Input>` for search + `<Select>` for category/status, all driven by local `useState`.
- Table: shadcn `<Table>` from [client/src/components/ui/table.tsx](client/src/components/ui/table.tsx).
- **No pagination.** Lists return everything from the server in one shot. For ~163 catalog rows that's fine; for an inquiry inbox that grows unbounded, phase 9 will have to add paging or a date-range filter.
- **No multi-column sort.** Server orders rows; client renders.

**9. Admin form pattern.** Two patterns coexist — phase 8b/9 should pick one and stick:

- **Public-form pattern** (uses `react-hook-form` + Zod, e.g. [client/src/pages/contact.tsx:32-43](client/src/pages/contact.tsx:32) and `service-booking-form.tsx`): `useForm({resolver: zodResolver(...)})`, `<Form>` shell, mutation via `useMutation(apiRequest)`, `useToast` for success.
- **Admin-form pattern** (manual `useState`, no react-hook-form, e.g. [client/src/pages/admin-service-catalog-edit.tsx:86](client/src/pages/admin-service-catalog-edit.tsx:86)): single `useState<FormState>`, `adminFetch(url, {method, body: JSON.stringify(...)})`, errors stored locally as `{message, issues}` and rendered inline. No reusable error-display component; pages roll their own.

For phase 9 (inbox detail + status transitions) I'd recommend the admin-form pattern to stay consistent with the rest of `/admin/*`.

---

## Existing API endpoints

**10. `/api/admin/*` routes.** Spread across two files. Concrete endpoints:

From [server/routes.ts](server/routes.ts):
```
GET    /api/admin/dashboard-stats
PUT    /api/admin/cities/:id
PUT    /api/admin/routes/:id
PUT    /api/admin/addons/:id
GET    /api/admin/export/cities
POST   /api/admin/quotes
GET    /api/admin/bookings
```

From [server/admin-catalog-routes.ts](server/admin-catalog-routes.ts):
```
GET    /api/admin/service-catalog
GET    /api/admin/service-catalog/:id
POST   /api/admin/service-catalog
PATCH  /api/admin/service-catalog/:id
GET    /api/admin/trip-types
POST   /api/admin/trip-types
PATCH  /api/admin/trip-types/:id
GET    /api/admin/service-categories
POST   /api/admin/service-categories
PATCH  /api/admin/service-categories/:id
```

Many other `...adminAuth` mutations live under `/api/cities`, `/api/addons`, `/api/routes`, `/api/vehicle-types`, `/api/guide-rates`, `/api/attractions` (i.e. they're admin-only but not namespaced). Phase 9 should put inquiries under `/api/admin/inquiries` to follow the catalog naming.

**11. Standard response shapes.** No global wrapper.

- **Success on read**: bare JSON of the row(s) (e.g. `res.json(rows)` or `res.json(row)`).
- **Success on write**: bare JSON of the inserted/updated row, sometimes with status 201 (e.g. [admin-catalog-routes.ts:134](server/admin-catalog-routes.ts:134)).
- **Validation error (Zod)**: `400 { message: "Validation error", issues: error.issues }` ([admin-catalog-routes.ts:137](server/admin-catalog-routes.ts:137)).
- **Other 4xx**: `{ message: string }`.
- **5xx**: `{ message: error.message }` after `console.error(...)` — no Sentry capture (see Q14 deviation note).

The `/api/inquiries/transportation` endpoint I shipped in STOP 7 uses a different shape: `{ ok: false, errors: {field: msg} }`. That was deliberate to give the form field-level error rendering, but it's an outlier vs. the rest of the codebase. Phase 8b should keep it for back-compat (the SPA reads `data.errors[field]`) and use the `{message, issues}` shape for new admin endpoints.

**12. Request body validation.** **Zod, via `drizzle-zod`'s `createInsertSchema(...)`.** All insert schemas are exported from [shared/schema.ts](shared/schema.ts) (`insertCitySchema`, `insertServiceCatalogItemSchema`, etc.), then `.parse(req.body)` is called inside the route. Zod errors are caught with `if (error?.issues)` and returned as the 400 shape above. There is **no express-validator and no global Zod middleware** — every route does its own `.parse(...)`. Phase 8b will need to add `insertInquirySchema` and `insertInquiryItemSchema` once the tables land.

---

## Drizzle schema confirmation

**13. The required tables are not in the schema.** [shared/schema.ts](shared/schema.ts) defines: `sessions`, `users`, `passwordResetTokens`, `emailVerificationTokens`, `cities`, `vehicleTypes`, `licenseClasses`, `routes`, `timeBlocks`, `guideRates`, `addOns`, `attractions`, `entranceFees`, `experiences`, `quotes`, `quoteLineItems`, `pricingTiers`, `seasonalModifiers`, `commissionRules`, `services`, `bookings`, `bookingDays`, `bookingServices`, `bookingAdjustments`, `reviews`, `tripTypes`, `serviceCategories`, `serviceCatalog`. **Missing:**

| Table | In schema.ts? | In migrations/? |
|---|---|---|
| `inquiries` | ❌ | ❌ |
| `inquiry_items` | ❌ | ❌ |
| `quote_versions` | ❌ | ❌ |
| `quote_line_items` | ✅ (already exists, used by /api/quotes — but the spec's "phase 21" version with version FK does **not** exist) | only as the existing `quotes`/`quote_line_items` shape from `0002_phase1_immutable_quotes.sql` |
| `quote_share_tokens` | ❌ | ❌ |
| `audit_log` | ❌ | ❌ |

Note: `quote_line_items` exists, but it FKs `quote_id` directly to `quotes.id`, not to a `quote_versions.id`. The spec's "operator generates draft quote → versioned, with rate-review banner" flow assumes a different shape (`quotes` parent + `quote_versions` rev history + line items per version). Reusing the existing flat `quotes`/`quote_line_items` is one option; introducing the versioned shape is another. Phase 10 design call.

**14. Tables that exist in DB but not schema.ts.** **None of the missing tables exist in DB either** — the migration files on disk are only:

```
0000_long_snowbird.sql            base schema
0001_colorful_psynapse.sql        early extension
0002_phase1_immutable_quotes.sql  the existing quotes/quote_line_items
0003_phase1b_timestamptz.sql      tz fix-up
0004_service_catalog.sql          STOPs 1-6 catalog work
0005_local_transfer_category.sql  category fix-up
```

There is no `phase 11`, `14-18`, `20`, or `21` migration file. The `inquiry_items_transportation_triple_consistency` constraint the spec references in 8b doesn't exist. **Phase 8b cannot insert into `inquiries`/`inquiry_items` until those tables are created in a new migration AND the corresponding Drizzle definitions are added to `shared/schema.ts`.**

There is also no `app_role` enum in the database. Single-role auth (`role text` on `users`) is what's there.

This is the same disconnect that surfaced in STOP 7 — the spec assumes a sibling Next.js project's migration history that this Vite/Express repo never received.

---

## Existing inquiry-related code

**15. References to inquiry / quote-version tables in the codebase.** Grep across `client/src`, `server/`, and `shared/` for `inquiries|inquiry_items|quote_versions|quote_share|app_role|audit_log`:

```
server/routes.ts:11           import { registerInquiryRoutes } from "./inquiries-routes";
server/inquiries-routes.ts    (the email-only endpoint from STOP 7)
```

Plus `client/src/components/services/service-booking-form.tsx` and `client/src/pages/contact.tsx:324` mention "inquiry" / "inquiries" in user-facing copy. **No partial wiring exists** — no rows are read from or written to any inquiry/quote-version table because none exist.

**16. Module 2 (planner) submission path.** The planner does **not** use the email-only inquiry pattern at all — it goes straight to a full booking. From [client/src/components/multi-city-pricing-tool.tsx:1678-1707](client/src/components/multi-city-pricing-tool.tsx:1678):

1. `POST /api/quotes` — calls `buildQuoteFromRequest` and `persistFrozenQuote` to write a row into the existing `quotes` table with frozen `quote_line_items`.
2. `POST /api/bookings` — creates a `bookings` row tied to that `quoteId`, sends a confirmation email via `emailService.sendBookingConfirmation`.

So the two submission paths are asymmetric:

| Module | Path | Persists? | Sends email? |
|---|---|---|---|
| Module 1 (`service-booking-form.tsx`) | `POST /api/inquiries/transportation` | ❌ (email-only) | ✅ (operator + customer) |
| Module 2 (`multi-city-pricing-tool.tsx`) | `POST /api/quotes` → `POST /api/bookings` | ✅ (`quotes`, `quote_line_items`, `bookings`) | ✅ (booking confirmation) |

8b assumes both should push into a unified `inquiries`/`inquiry_items` model. That's a sensible end state, but it requires:

- Building the `inquiries` and `inquiry_items` tables.
- Deciding whether Module 2 stops creating `bookings` rows on submit (so it becomes a true inquiry, like the spec says) OR continues creating bookings AND also writes an inquiry shadow row (more work, more state).
- Deciding what the `app_role` matrix looks like, since 8b doesn't currently care but 9-11 do.

Sentry is **not wired** anywhere in this repo (no `Sentry`/`@sentry` imports; the spec's "log to Sentry tags `{layer: 'email', email_type: ...}`" instruction has no place to land). Email failures are currently `console.error` only (see `server/inquiries-routes.ts` and `server/email-service.ts`).

`db.transaction(...)` is also not used anywhere yet; 8b would be the first transactional path. No technical blocker — Drizzle `db` from [server/db.ts](server/db.ts) supports it — but worth flagging that there's no precedent to copy.

---

## What this means for phase 8b

To proceed faithfully to spec, 8b would need to grow to include:

1. A new migration creating `inquiries` (id, customer_*, status enum, source enum, timestamps), `inquiry_items` (id, inquiry_id FK, component_type enum, service_catalog_id, vehicle_slug, trip_type_slug, service_date, quantity, notes, plus the polymorphic FKs for guide/entrance_fee/add_on items).
2. Drizzle table definitions + insert schemas in `shared/schema.ts`.
3. The triple-consistency check constraint mentioned in spec (currently doesn't exist, so phase 20 didn't happen here either).
4. Actual transactional INSERTs in both `/api/inquiries/transportation` and the planner's submission path.
5. A decision on what to do with Module 2's existing `quotes` + `bookings` writes (keep, replace, or shadow).

Items 1-3 are non-trivial schema work the spec assumed was already done. Worth confirming with the user before authorizing 8b implementation:

- Is there a sibling migration repo / Supabase project these phase-11/14-18/20/21 migrations actually landed in, that this repo needs to mirror?
- Or do you want me to design and ship those migrations as part of 8b (effectively rolling phase 8a's missing prep work into 8b)?
- For Module 2: keep dual-write (booking + inquiry shadow) or strip the `bookings` write so Module 2 becomes a pure inquiry like Module 1?
- Single-role admin (current state) acceptable for 9-11, or build the `app_role` enum / permissions in 8b?
