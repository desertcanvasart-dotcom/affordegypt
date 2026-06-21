# AffordEgypt — current-state audit

Factual snapshot for architectural review and recovery planning. Describes the codebase as it actually exists at HEAD (`184ce5d` on branch `claude/amazing-colden-920af9`, off `main` at `dad3039`). No recommendations, no "ideal architecture" suggestions.

---

## TL;DR — the merge hypothesis, restated

The user asked: are two implementations mixed together? Based on the audit, the answer is **mostly no, but with two qualifiers**:

1. **What's actually here is a single codebase that has been through three sequential rewrite eras**, with cleanup of obsolete artifacts skipped between eras. Result: ~30% of the files in `client/src/pages/` and `client/src/components/` are dead but still on disk.
2. **A second, separate Next.js project does seem to exist somewhere** (the user's spec prompts in STOPs 7 and 8 reference Next.js paths, `pnpm`, `app/[locale]/...` routing, and migration phases 11/14-18/20/21 that were never created in this repo). That project's spec docs got pasted into this repo's prompts, but no Next.js *code* has bled in. The disconnect is at the spec/prompt layer, not the code layer.

Three eras visible in commits, docs, and dead files:
- **Era 1 — Replit / "routes" pricing** (pre-Apr 2026): Replit-hosted, four pricing engines, `routes` table as the pricing primitive, mutable quotes, partial Stripe integration, hand-rolled admin shells.
- **Era 2 — Pricing rewrite + Railway** (Apr 26-28, 2026): Phase 1-3 documented in [docs/HANDOFF.md](docs/HANDOFF.md). New `PricingService`, `pricing_tiers`, immutable quotes, Stripe deprecated, Replit artifacts left in place.
- **Era 3 — Service catalog pivot** (current): `service_catalog` table supersedes `routes`; `entrance_fees` + `experiences` split out of `add_ons`; STOP 7 added `/services` and `service-booking-form.tsx`. Older systems coexist.

Detailed findings below.

---

## 1. Stack & build

- **Frontend**: React 18 + Vite + Wouter (router) + TanStack Query + shadcn/ui + Tailwind. SPA, no SSR. Static prerender via Puppeteer at build time (`vite-plugin-prerender`-equivalent in [vite.config.ts](vite.config.ts)).
- **Backend**: Express 4, single bundled entry [server/index.ts](server/index.ts) → esbuild. JWT auth (no sessions for the API; an Express `sessions` table exists in schema but isn't wired). Drizzle ORM over Neon serverless Postgres.
- **i18n**: i18next + react-i18next, four locales (en, es, fr, de) under [client/src/i18n/locales/](client/src/i18n/locales).
- **Email**: Resend, wrapped in a SendGrid-shaped adapter at [server/email-client.ts](server/email-client.ts).
- **Build pipeline (`npm run build`)**: `generate-pricing-snapshot.mjs` → `vite build` (with prerender) → `generate-sitemap.mjs` → `esbuild server/index.ts`. Output: `dist/index.js` (server) + `dist/public/` (client + 27 prerendered route HTMLs).
- **Type-check (`npm run check`)**: `tsc`. **There is no `lint` script.**
- **Deployment targets in repo**: `Dockerfile` (Node 20 + Puppeteer), [railway.json](railway.json) (Railway primary), [.replit](.replit) (orphaned but committed). `replit.nix` does not exist.

Package manager is npm (lockfile is `package-lock.json`; no `pnpm-lock.yaml`).

---

## 2. Repo layout

```
.
├── client/
│   ├── public/                         static + generated pricing-snapshot.json
│   └── src/
│       ├── components/                 ~50 files, mix of UI + page sections
│       │   ├── day-by-day/             nested pricing-sidebar (parallel to root one)
│       │   ├── services/               service-booking-form.tsx (STOP 7)
│       │   └── ui/                     shadcn primitives (~50 files)
│       ├── generated/                  pricing-snapshot.json (build artifact, committed)
│       ├── hooks/                      useAuth, use-toast, use-mobile, useSmartTranslation, useTranslatedQuery
│       ├── i18n/locales/               en/es/fr/de JSON
│       ├── lib/                        queryClient, booking-state (Zustand), admin-fetch, analytics, utils
│       ├── pages/                      ~50 files, ≥10 are dead — see §4
│       ├── types/                      booking.ts (interfaces)
│       └── utils/                      slugTranslation, translationValidator
├── server/
│   ├── services/                       pricing.ts, quote-builder.ts (the new path)
│   ├── routes.ts                       MONOLITH, 1946 lines
│   ├── public-catalog-routes.ts        new /api/services/* + /api/entrance-fees + /api/experiences
│   ├── admin-catalog-routes.ts         /api/admin/service-catalog, /api/admin/trip-types, /api/admin/service-categories
│   ├── inquiries-routes.ts             STOP 7 — email-only POST /api/inquiries/transportation
│   ├── pricing-routes.ts               POST /api/calculate-pricing (Era 2 path)
│   ├── auth-routes.ts                  /api/auth/login, /register, /verify, /update-profile, /logout
│   ├── auth.ts                         JWT helpers + authenticateToken / requireAdmin / optionalAuth
│   ├── password-reset-routes.ts        /api/password-reset/*
│   ├── email-verification-routes.ts    /api/email-verification/*
│   ├── database-storage.ts             singleton class wrapping all CRUD; auto-seeds on construction
│   ├── db.ts                           Drizzle client + Neon pool
│   ├── email-client.ts                 mailService = Resend adapter
│   ├── email-service.ts                emailService = template generator + sender; uses mailService
│   ├── translationMiddleware.ts        createTranslatedRoute helper (active for cities/vehicles/attractions/routes)
│   ├── translationUtils.ts             includes orphaned migrateExistingDataToTranslations()
│   ├── seed-services.ts                one-shot legacy services seeder (called in index.ts)
│   ├── vite.ts                         Vite SSR middleware (dev) / static serve (prod)
│   └── index.ts                        entry: middleware → seedServices → registerRoutes → vite/static
├── shared/
│   ├── schema.ts                       28 Drizzle tables, all `insert*Schema` zod schemas
│   ├── city-detection.ts               deriveCity() + multi-word city list
│   └── types.ts                        RouteData + CityData interfaces
├── migrations/
│   ├── 0000_long_snowbird.sql          base
│   ├── 0001_colorful_psynapse.sql      routes column adds
│   ├── 0002_phase1_immutable_quotes.sql  Phase 1 quotes/pricing_tiers/...
│   ├── 0003_phase1b_timestamptz.sql    timestamptz conversion
│   ├── 0004_service_catalog.sql        Era 3 catalog
│   ├── 0005_local_transfer_category.sql
│   └── meta/_journal.json              ONLY tracks 0000 + 0001 (see §9)
├── docs/
│   ├── HANDOFF.md                      Era 2 handoff (Apr 28, 2026)
│   ├── ASSESSMENT.md                   <-- this file is at root, not docs/
│   ├── PRICING_CLEANUP.md              Phase 3 deprecation list
│   ├── SERVICES_ARCHITECTURE.md        Era 3 design draft
│   ├── SITEMAP.md
│   └── migrations/
│       └── PR-Path-B-3.sql             experiences table (manual apply, not in migrations/)
├── scripts/                             26 files, ~16 orphaned (one-shot Phase 1-3 work)
├── attached_assets/                     364 mostly-screenshot files, 1 reviews .xlsx
├── ASSESSMENT.md, Instructions.md, replit.md, CSV_IMPORT_GUIDE.md
├── STOP_8A_INVENTORY.md                 STOP 8a output (today)
├── package.json, package-lock.json, tsconfig.json, drizzle.config.ts,
├── vite.config.ts, tailwind.config.ts, postcss.config.js, components.json,
├── Dockerfile, railway.json, .replit, debug-analytics.html, generated-icon.png,
├── bulk_transfer_routes_template.csv
└── dist/                                build output (committed in this worktree)
```

---

## 3. Core app architecture

**Request lifecycle (prod):**

1. Railway boots `node dist/index.js`.
2. [server/index.ts](server/index.ts) wires JSON parsers + a request-logging middleware (lines 11-39).
3. `seedServices()` runs once if `services` table is empty (legacy day-by-day seed).
4. `registerRoutes(app)` wires the entire API surface (see §7).
5. In prod, [server/vite.ts](server/vite.ts) `serveStatic(app)` mounts the prerendered `dist/public/` and rewrites unknown paths to `index.html` (SPA fallback).
6. SPA boots from `client/src/main.tsx` → `App.tsx` → `<HelmetProvider><AuthProvider><Router/></AuthProvider></HelmetProvider>`. Routes are wired inline with Wouter.

**Env contract:** `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY` (optional — emails skip silently if missing). Stripe env vars are referenced but their endpoints are dead (see §16).

---

## 4. Pages & routing

### 4.1 Routes registered in [client/src/App.tsx](client/src/App.tsx)

Direct routes (no multilingual variants):
```
/                                                Home
/book/:id?                                        BookPage
/booking-confirmation/:reference                  BookingConfirmation
/dashboard                                        UserDashboard
/admin                                            AdminSidebar      ← also acts as the admin login gate
/admin/bookings                                   AdminBookings
/admin/reviews                                    AdminReviews
/admin/routes                                     AdminRoutesOverview
/admin/routes/city/:citySlug/:category?           AdminCityRoutes
/admin/service-catalog                            AdminServiceCatalog
/admin/service-catalog/new                        AdminServiceCatalogEdit
/admin/service-catalog/:id/edit                   AdminServiceCatalogEdit
/admin/trip-types                                 AdminTripTypes
/admin/service-categories                         AdminServiceCategories
/routes                                           RoutesSimple
/routes/book/:routeId                             RouteBooking
/route-booking                                    RouteBooking      ← duplicate of the above
/routes/:category/:citySlug                       RouteCityPage
/login, /register, /reset-password, /verify-email
/services                                         ServicesList      (STOP 7)
/services/:slug                                   ServiceDetail     (STOP 7)
*                                                 NotFound
```

Multilingual via `createMultilingualRoute(slug, Component)` (helper at [App.tsx:66](client/src/App.tsx:66)) — generates a `<Route>` per locale slug variant from `getAllSlugVariants()`:

```
transfers, pricing-tool, attractions, destinations, travel-tips, reviews,
submit-review, about, contact, budget-travel-egypt, egyptian-street-food-guide,
nile-valley-guide, sinai-peninsula-guide, eastern-western-deserts-guide,
cuisine-passport, booking-agreement, terms-of-service, privacy-policy,
cookie-policy, cairo-airport-transfers, luxor-airport-transfers,
aswan-airport-transfers, cairo-car-tour-guide-services,
luxor-car-tour-guide-services, aswan-car-tour-guide-services
```

### 4.2 Pages on disk vs wired

**~50 files in `client/src/pages/`. ≥ 10 are unreachable from any route.**

| File | Wired? | Notes |
|---|---|---|
| `home.tsx` | ✓ | Active |
| `admin-sidebar.tsx` | ✓ | The active `/admin` shell. Contains its own login gate via `<AdminLogin>`. ~700 lines. |
| `admin.tsx` | ✗ | Earlier admin shell (~270 lines). Orphan. |
| `admin-dashboard.tsx` | ✗ | Different admin shell (~750 lines). Orphan. |
| `admin-working.tsx` | ✗ | Massive admin shell (~1700 lines). Orphan with the most TS errors in the repo (see §17). |
| `routes.tsx` | ✗ | Old routes page (~255 lines). Orphan. |
| `routes-simple.tsx` | ✓ | Wired to `/routes`. |
| `routes-overview.tsx` | partially | Imported by `admin-routes-overview.tsx` only; not a public page. |
| `attractions.tsx` | ✓ | Wired (multilingual). 575 lines, has TS errors. |
| `attractions-simple.tsx` | ✗ | Simpler variant. Orphan. |
| `booking-confirmation.tsx` | ✓ | Active. |
| `booking-confirmation-broken.tsx` | ✗ | **Filename literally says "broken."** Orphan, but has a `Cannot redeclare 'generateBookingDetailsText'` TS error that pollutes `npm run check`. |
| `transfers.tsx` | ✓ | Wired (multilingual `/transfers`). Era 1 page; coexists with the new `/services` flow. |
| `services-list.tsx`, `service-detail.tsx` | ✓ | STOP 7 additions. |

### 4.3 Components — duplicates

**~60 files in `client/src/components/`** (excluding `ui/`). Duplicates by function:

| Concept | Active file | Orphan(s) |
|---|---|---|
| Top nav | [navbar.tsx](client/src/components/navbar.tsx) (imported ~20 places) | [header.tsx](client/src/components/header.tsx) (imported nowhere) |
| Hero block | [hero.tsx](client/src/components/hero.tsx) (imported by `home.tsx`) | [hero-section.tsx](client/src/components/hero-section.tsx) (imported nowhere) |
| Pricing sidebar | [components/pricing-sidebar.tsx](client/src/components/pricing-sidebar.tsx) | [components/day-by-day/pricing-sidebar.tsx](client/src/components/day-by-day/pricing-sidebar.tsx) — both exist; different consumers |
| Admin bookings | [pages/admin-bookings.tsx](client/src/pages/admin-bookings.tsx) is the routed page; it imports a component that may or may not be `components/admin-bookings.tsx` | [components/admin-bookings.tsx](client/src/components/admin-bookings.tsx) imported by `admin-sidebar.tsx` |
| Booking wizard | [booking-wizard.tsx](client/src/components/booking-wizard.tsx) | [quote-builder-wizard.tsx](client/src/components/quote-builder-wizard.tsx) — both exist; both look complete; unclear which the SPA prefers |

---

## 5. State management

- **No Redux / Jotai / Recoil / Valtio.**
- **Auth**: React Context — `AuthProvider` in [client/src/hooks/useAuth.tsx](client/src/hooks/useAuth.tsx). JWT in `localStorage.auth_token` (also mirrored as `admin-token` so the admin shell can read it). `cached_user` blob holds the last-known user.
- **Booking**: Zustand store in [client/src/lib/booking-state.ts](client/src/lib/booking-state.ts) — `transportation`, `guide`, `addOns`, `customerInfo` slices.
- **Server data**: TanStack Query with the standard `apiRequest()` helper at [client/src/lib/queryClient.ts](client/src/lib/queryClient.ts). Admin pages use a parallel `adminFetch()` helper at [client/src/lib/admin-fetch.ts](client/src/lib/admin-fetch.ts) which reads either `auth_token` or `admin-token`.
- **i18n**: i18next instance from [client/src/i18n/index.ts](client/src/i18n/index.ts).
- **localStorage keys**: `auth_token`, `admin-token`, `cached_user`, `language`.

**Coexistence note**: Both `apiRequest` (which throws on non-2xx, including 4xx with field errors) and raw `fetch` are used across the app. STOP 7's `/services` form uses raw `fetch` precisely because `apiRequest` swallows the 400 body. The two patterns don't agree; new code picks ad hoc.

---

## 6. Backend API surface

Most of the API is in the 1946-line [server/routes.ts](server/routes.ts). Sub-modules are mounted at the bottom of `registerRoutes()`:

- `await registerPricingRoutes(app)` ← Era 2 `/api/calculate-pricing`
- `registerAdminCatalogRoutes(app)` ← Era 3 admin catalog CRUD
- `registerPublicCatalogRoutes(app)` ← Era 3 public catalog reads + entrance-fees + experiences
- `registerInquiryRoutes(app)` ← STOP 7 inquiry endpoint

Auth middleware tuple: `const adminAuth = [authenticateToken, requireAdmin]`. Used as `...adminAuth` on protected routes.

### 6.1 Endpoint catalog (notable subset)

```
PUBLIC READS
GET  /api/health
GET  /api/cities                            (translated)
GET  /api/addons                            (translated)
GET  /api/attractions                       ← line 206 (with translation), line 1585 (without)  [DUPLICATE]
GET  /api/vehicle-types                     (translated)
GET  /api/guide-rates
GET  /api/license-classes
GET  /api/routes                            (translated)
GET  /api/pricing/routes
GET  /api/pricing/routes/:cityId
GET  /api/pricing/addons
GET  /api/pricing/languages
POST /api/pricing/calculate                 ← Era 1 multiplier-based pricing  [DEAD-WEIGHT?]
POST /api/calculate-pricing                 ← Era 2 service-isolation pricing (registerPricingRoutes)
GET  /api/time-blocks
GET  /api/quotes/:id
POST /api/quotes                            ← creates a frozen quote via quote-builder.ts
GET  /api/bookings/:id
GET  /api/bookings/reference/:reference
POST /api/bookings                          ← Module 2 submission, persists + emails
POST /api/route-bookings                    ← single endpoint with no siblings  [ORPHAN?]
GET  /api/services                          (registerPublicCatalogRoutes)
GET  /api/services/cities|categories|trip-types|:slug
GET  /api/entrance-fees
GET  /api/experiences
POST /api/inquiries/transportation          ← STOP 7
GET  /api/reviews
GET  /api/reviews/:id
POST /api/reviews
POST /api/create-payment-intent             ← marked DEPRECATED, returns 501-ish
POST /api/stripe-webhook                    ← marked DEPRECATED

ADMIN-PROTECTED
POST/PUT/DELETE  /api/cities/:id
POST/PUT/DELETE  /api/addons/:id
POST/PUT/DELETE  /api/attractions/:id       ← lines 218/227/239 [adminAuth]; ALSO at 1613/1645/1656 WITHOUT adminAuth  [DUPLICATE — see §16]
POST/PUT/DELETE  /api/vehicle-types/:id
POST/PUT/DELETE  /api/guide-rates/:id
POST/PUT/DELETE  /api/routes/:id
GET   /api/quotes
DELETE /api/quotes/:id
GET   /api/admin/dashboard-stats
PUT   /api/admin/cities/:id
PUT   /api/admin/routes/:id
PUT   /api/admin/addons/:id
GET   /api/admin/export/cities
POST  /api/admin/quotes
GET   /api/admin/bookings
DELETE /api/bookings/:id
PUT   /api/bookings/:id/payment-status      ← Stripe-flavoured, dead path
PUT   /api/bookings/:id/status
POST  /api/bookings/:id/send-confirmation
POST  /api/bookings/:id/send-reminder
GET   /api/reviews/all
PATCH /api/reviews/:id
DELETE /api/reviews/:id

ADMIN CATALOG (registerAdminCatalogRoutes)
GET/POST/PATCH  /api/admin/service-catalog
GET             /api/admin/service-catalog/:id
GET/POST/PATCH  /api/admin/trip-types
GET/POST/PATCH  /api/admin/service-categories

AUTH (auth-routes.ts, password-reset-routes.ts, email-verification-routes.ts)
POST /api/auth/login | register | logout
GET  /api/auth/verify
PUT  /api/auth/profile
+ password reset and email verification flows
```

### 6.2 Storage layer

Single class [server/database-storage.ts](server/database-storage.ts) (`DatabaseStorage implements IStorage`), exported as `const storage`. ~700 lines, ~100 methods. Constructor calls `seedData()` which seeds cities, vehicles, license classes, routes, guides, add-ons if `cities` is empty. Routes use `storage.getX()` consistently — except for the new Era 2/3 paths in `services/pricing.ts`, `services/quote-builder.ts`, and the catalog route files, which call `db` directly. **Two access patterns coexist** (singleton storage class vs raw Drizzle queries), split roughly by era.

### 6.3 Pricing — three implementations

| Layer | File | What it prices | Status |
|---|---|---|---|
| Era 1 — multiplier math | `routes.ts:980-1069` (`POST /api/pricing/calculate`) | `routes` table × license class × seasonal modifier × vehicle | Still mounted; unclear who calls it |
| Era 1.5 — JSONB lookup on `routes` | `storage.getRouteById()` reads `routes.vehicle_prices` | flat-keyed `${vehicle}_${tripType}` per route | Active for legacy `/transfers` |
| Era 2 — `PricingService` | [server/services/pricing.ts](server/services/pricing.ts) | unified entry: routes, services, guides, add-ons, attractions; pure JSONB lookup, no multipliers | Active via `POST /api/calculate-pricing` and `POST /api/quotes` |
| Era 3 — `service_catalog` JSONB | `service_catalog.vehicle_prices` consumed by `PricingService.getServicePrice()` and `quote-builder` via `serviceSlugs[]` field | flat-keyed | Active for `/services` flow |

`buildQuoteFromRequest()` in [server/services/quote-builder.ts](server/services/quote-builder.ts) accepts EITHER `routeId+vehicleSlug+tripType` (legacy) OR `serviceSlugs[]` (new) on the same request. This is the unification point.

### 6.4 Email layer

- [server/email-client.ts](server/email-client.ts) — `mailService` (Resend, SendGrid-shaped API).
- [server/email-service.ts](server/email-service.ts) — `emailService` + standalone helpers (booking confirmation/reminder/status, contact form, newsletter, email verification). Calls `mailService` only.
- [server/inquiries-routes.ts](server/inquiries-routes.ts) (STOP 7) — uses `mailService` directly, bypasses `emailService`.

No Sentry. Email failures are `console.error` only. Resend missing → silent skip.

---

## 7. Schema, migrations, drift

### 7.1 Tables in [shared/schema.ts](shared/schema.ts) (28)

Auth (4): `sessions`, `users`, `passwordResetTokens`, `emailVerificationTokens`.
Catalog (10): `cities`, `vehicleTypes`, `licenseClasses`, `routes`, `timeBlocks`, `guideRates`, `addOns`, `attractions`, `tripTypes`, `serviceCategories`, `serviceCatalog`. (Also `services` — Era 1 day-by-day catalog, distinct from `serviceCatalog`.)
Pricing (3): `pricingTiers`, `seasonalModifiers`, `commissionRules`.
Experiences (2): `experiences`, `entranceFees`.
Quote/Booking (6): `quotes`, `quoteLineItems`, `bookings`, `bookingDays`, `bookingServices`, `bookingAdjustments`.
Reviews (1): `reviews`.

### 7.2 Migration files vs Drizzle journal vs schema.ts — three sources, three states

| Migration file | Tracked in `_journal.json`? | Tables created |
|---|---|---|
| `0000_long_snowbird.sql` | ✓ | sessions, users, cities, vehicleTypes, licenseClasses, routes, timeBlocks, guideRates, addOns, attractions, quotes, reviews, bookings (13) |
| `0001_colorful_psynapse.sql` | ✓ | none — adds 5 columns to `routes` |
| `0002_phase1_immutable_quotes.sql` | ✗ | `quoteLineItems`, `pricingTiers`, `seasonalModifiers`, `commissionRules` |
| `0003_phase1b_timestamptz.sql` | ✗ | none — alters timestamps |
| `0004_service_catalog.sql` | ✗ | `tripTypes`, `serviceCategories`, `serviceCatalog` |
| `0005_local_transfer_category.sql` | ✗ | seed only |
| `docs/migrations/PR-Path-B-3.sql` | n/a (outside `migrations/`) | `experiences` (manual apply) |

The `_journal.json` only records 0000 + 0001. Per the comment at the top of [docs/migrations/PR-Path-B-3.sql](docs/migrations/PR-Path-B-3.sql): *"We do not use migration files in this project — schema drift accumulated in `migrations/` made `db:push` unsafe."* This is a real, declared schema-management failure. Newer migrations are now applied manually via `scripts/run-sql.mjs` or `railway connect`.

### 7.3 Tables in `schema.ts` with no `CREATE TABLE` in any migration

These are referenced as FKs by `0002+` but never created in the migration files on disk:

- `passwordResetTokens`, `emailVerificationTokens`, `services`, `bookingDays`, `bookingServices`, `bookingAdjustments`.

They presumably exist in the live DB (the app obviously runs), so they were created out-of-band — possibly by an earlier, since-deleted migration, possibly via `drizzle-kit push` before the journal was abandoned, possibly via hand-applied SQL not committed to the repo. **The repo cannot rebuild its own DB from these migrations.**

`experiences` is also created out-of-band (in `docs/migrations/PR-Path-B-3.sql`), and its column definitions diverge slightly from `schema.ts` (no timestamptz on the manual SQL).

### 7.4 Tables with overlapping purpose

| Concept | Table A | Table B | Both populated? | Notes |
|---|---|---|---|---|
| Transfer pricing | `routes` | `serviceCatalog` | Yes | `migrate-routes-to-service-catalog.mjs` is idempotent and does not delete `routes`. Eras 1+3 both work. |
| Per-vehicle pricing | `routes.basePriceByVehicle` (legacy JSON) and `routes.vehiclePrices` (newer JSON) | `pricingTiers` (normalized rows from Era 2) | Yes | `pricingTiers` was meant to be source-of-truth per `HANDOFF.md`, but legacy JSONB columns still live. [docs/PRICING_CLEANUP.md](docs/PRICING_CLEANUP.md) lists `pricing_tiers` and friends for deletion — the cleanup itself isn't done. |
| "Services" | `services` (Era 1, day-by-day planner) | `serviceCatalog` (Era 3) | Yes | Schema comment in [shared/schema.ts](shared/schema.ts) says `serviceCatalog` will be renamed to `services` once the legacy table is removed. |
| Activities/extras | `addOns` | `experiences` | `entranceFees` | Yes | All three exist; `migrate-experiences-from-addons.ts` moves rows out of `add_ons` but doesn't drop it. |
| Day-by-day services in bookings | `bookingServices` (FKs `services.id`) | `serviceCatalog`-based pricing on quotes | unclear | The booking flow's `bookingServices`/`bookingDays` tables FK the legacy `services` table; quotes reference `serviceCatalog` indirectly via slug. Two parallel link tables for "what's in this trip." |

### 7.5 Tables that look unread

- `services` — read by `seed-services.ts` (writer) and `translationUtils.ts:160` (translation walk). No active business code reads it. Quote line items have a `serviceId` FK pointing to it, but quote-builder writes `serviceCatalog` slugs into `meta` instead.
- `bookingDays`, `bookingServices`, `bookingAdjustments` — declared in schema, FK'd from `bookings`, but I found no active reader or writer in `server/` outside their own definitions.
- `commissionRules`, `seasonalModifiers` — declared, listed for deletion in [docs/PRICING_CLEANUP.md](docs/PRICING_CLEANUP.md). No active reader.
- `pricingTiers` — listed for deletion in PRICING_CLEANUP, still has seeders (`seed-pricing-tiers.mjs`) and tests (`test-admin-tier-sync.mjs`). Currently in a "deprecated but kept" limbo.

---

## 8. i18n

- Library: i18next + react-i18next. Initialised in [client/src/i18n/index.ts](client/src/i18n/index.ts) with hydration-safe initial-render lock to English.
- Locales: en/es/fr/de JSON in [client/src/i18n/locales/](client/src/i18n/locales/), three namespaces (`translation`, `blog`, `common`).
- Detection priority: `?lng=` query param → `localStorage.language` → `navigator.language` → `en`.
- Slugs: [client/src/utils/slugTranslation.ts](client/src/utils/slugTranslation.ts) provides `getAllSlugVariants(englishSlug)` so the `createMultilingualRoute(...)` helper can generate one Wouter `<Route>` per locale-slug. This means e.g. `/transfers` and `/transferencias` both render the same `Transfers` component.
- Server side: [server/translationMiddleware.ts](server/translationMiddleware.ts) wraps a few GETs (`/api/cities`, `/api/vehicle-types`, `/api/attractions`, `/api/routes`) — it reads `Accept-Language`, picks the `*_translations` JSON column, and substitutes name/description. Other endpoints don't have this. Translation columns exist on most tables but most are null.
- The orphaned `migrateExistingDataToTranslations()` in [server/translationUtils.ts](server/translationUtils.ts) is the one-shot importer; never called.

i18n is **active** but **partial** — only a handful of API responses are translated server-side; most pages render English regardless of locale and rely on i18next for static UI strings.

---

## 9. CMS / external content

**There is no CMS.** No Sanity, Contentful, Strapi, headless-WordPress, or markdown-driven content pipeline. All content sources are:

1. **Postgres tables** (DB-driven): cities, services, attractions, reviews, etc.
2. **Hardcoded React components** (page-driven): `cairo-airport-transfers.tsx`, `nile-valley-guide.tsx`, etc., are static React pages with body copy in JSX.
3. **i18n JSON files** for translatable strings.
4. **`pricing-snapshot.json`** generated at build time as a fallback for SEO when dynamic pricing fetch fails.
5. **Static images** referenced via absolute URLs to `travel2egypt.org/wp-content/...` (see [hero.tsx:21](client/src/components/hero.tsx:21)) — content lives on a sibling WordPress site.

The `attached_assets/` folder (213 MB, 364 files, mostly screenshots) is committed but appears to be development-time references, not production content.

---

## 10. Styling

- **Tailwind** is the only styling system. Config at [tailwind.config.ts](tailwind.config.ts).
- **shadcn/ui** components in `client/src/components/ui/` (~50 primitives), config at [components.json](components.json). Standard shadcn.
- **CSS variables** in `client/src/index.css` define the palette (teal primary `#19A974`, gold dark-mode accent). `.dark` class toggle. Inter / Playfair Display / JetBrains Mono fonts.
- No styled-components, no emotion, no CSS modules. No inline styles in any meaningful quantity.

Styling is the most consistent layer in the codebase.

---

## 11. SEO

- **Per-page meta**: [client/src/components/seo-meta.tsx](client/src/components/seo-meta.tsx) wraps `react-helmet-async`. `title`, `description`, `canonical` are required props (all three must be non-empty for TS to compile — STOP 7 caught two places where a missing `canonical` broke the type-check).
- **Canonical URLs**: hardcoded `https://affordegypt.com/...` strings in each page.
- **Open Graph**: `seo-meta.tsx` accepts og props but most callers only pass title/description/canonical.
- **Sitemap**: generated at build time by `scripts/generate-sitemap.mjs` → `dist/public/sitemap.xml` (27 routes per the last successful build).
- **Prerender**: at build time, Vite plugin renders the SPA into static HTML for the 27 sitemap routes (you can see them in the build output: `dist/public/cairo-airport-transfers/index.html` etc.). This is what makes the SPA SEO-indexable.
- **Pricing snapshot**: `client/public/pricing-snapshot.json` (committed) is consumed by prerender so that prices appear in static HTML. Last regenerated 2026-04-30; `source: "fallback"` suggests the dynamic fetch failed at build time and the static fallback at `scripts/pricing-snapshot-fallback.json` was used.
- **Analytics**: Google Analytics + Google Ads init in [client/src/lib/analytics.ts](client/src/lib/analytics.ts), tracked per route via `useAnalytics()` hook in `App.tsx`. There's also a `debug-analytics.html` test page at the root.

---

## 12. Auth

- **Mechanism**: stateless JWT in `Authorization: Bearer …`. 30-day expiry. Signed with `JWT_SECRET`. No refresh tokens, no session cookies.
- **Issuance**: `POST /api/auth/login` returns `{ token, user }`. Token persisted under `localStorage.auth_token` by `useAuth.tsx`, additionally mirrored as `admin-token` by `admin-login.tsx`.
- **Server check**: `authenticateToken` (token presence + verify) → `requireAdmin` (role === 'admin'). Composed as `[authenticateToken, requireAdmin]`.
- **Roles**: only `'admin'` is checked anywhere. The schema-time enum `app_role` referenced in user prompts **does not exist** in this repo — only a single `users.role` text column. No `operations_manager` / `pricing_manager` / `viewer` distinction.
- **No route guards on the SPA side**: any browser can hit `/admin/*`; pages just won't fetch data because the API will 401. `admin-sidebar.tsx` is the only page with its own gate.

---

## 13. Deployment

Three deployment targets exist on disk:

- **Railway** — primary. [railway.json](railway.json) points at `npm run build` + `npm start`. `Dockerfile` is Railway-compatible (Node 20 + Puppeteer for prerender).
- **Replit** — orphan. [.replit](.replit) is committed and references SendGrid/OpenAI/Google Analytics agent integrations. `replit.nix` does not exist, but [vite.config.ts](vite.config.ts) still loads `@replit/vite-plugin-cartographer` if `process.env.REPL_ID` is set. Per [replit.md](replit.md) (last update Aug 12, 2025), Replit was the original host. The migration to Railway happened around April 2026; Replit configs were not removed.
- **Docker** — [Dockerfile](Dockerfile) at root. Whether Railway uses it or Railway's nixpack auto-detection isn't clear from `railway.json` alone.

---

## 14. End-to-end flows (current state)

### Flow A — single transfer (Module 1, the new path)
1. Customer browses `/services` (STOP 7 page) → picks one → `/services/:slug`.
2. Detail page renders price matrix from `service_catalog.vehicle_prices` and an inline booking form ([service-booking-form.tsx](client/src/components/services/service-booking-form.tsx)).
3. Submit `POST /api/inquiries/transportation` ([server/inquiries-routes.ts](server/inquiries-routes.ts)) → server validates + verifies the (vehicle, trip_type) combo has a price → fires two emails (operator + customer) via `mailService`.
4. **No DB persistence.** No inquiry row. No tracking.

### Flow B — multi-day planner (Module 2, the old path)
1. Customer scrolls homepage hero → `#quote-builder` anchor → [multi-city-pricing-tool.tsx](client/src/components/multi-city-pricing-tool.tsx).
2. Builds an itinerary (cities, transfers, guides, attractions, add-ons). Live preview via `POST /api/pricing/calculate` (Era 1 multiplier path) **and/or** `POST /api/calculate-pricing` (Era 2 service path) — both endpoints are wired; which one fires is hard to follow.
3. On checkout: `POST /api/quotes` to freeze a `quotes` row + `quote_line_items` rows → `POST /api/bookings` to create the booking + `bookings` row + send confirmation email via `emailService`.
4. **Full booking record** with reference, status, payment-status (perpetually `pending` because Stripe is dead).

### Flow C — legacy single transfer
1. Customer hits `/transfers` (multilingual, [transfers.tsx](client/src/pages/transfers.tsx)) — the Era 1 page.
2. Inline route picker + pricing widget directly off the `routes` table.
3. Submission goes through `RouteBooking` page (`/routes/book/:routeId` and the duplicate `/route-booking`).

### Flow D — admin
1. Operator → `/admin` → [admin-sidebar.tsx](client/src/pages/admin-sidebar.tsx) (login form, then sidebar nav).
2. Sub-pages: `/admin/bookings` (bookings management), `/admin/reviews`, `/admin/routes` (legacy CRUD), `/admin/service-catalog` + `/admin/trip-types` + `/admin/service-categories` (Era 3 CRUD).
3. **No `/admin/inquiries`.** Module 1 inquiries land in email only.

Module 1 inquiries go to email; Module 2 bookings go to DB. A customer using `/services` and a customer using `/transfers` produce inquiries the operator manages in two completely different ways.

---

## 15. Suspicious / orphaned / broken — itemised

### 15.1 Files explicitly named "broken"
- [client/src/pages/booking-confirmation-broken.tsx](client/src/pages/booking-confirmation-broken.tsx) — orphan, but compiles into the project and contributes a `Cannot redeclare` TS error to `npm run check`.

### 15.2 Pages on disk, never wired
- `admin.tsx`, `admin-dashboard.tsx`, `admin-working.tsx` — three earlier admin shells.
- `routes.tsx` — earlier routes page.
- `attractions-simple.tsx` — earlier attractions page.
- `routes-overview.tsx` — referenced once by `admin-routes-overview.tsx` (via filename collision); not wired as a public page.

### 15.3 Components on disk, imported nowhere
- [client/src/components/header.tsx](client/src/components/header.tsx) — superseded by `navbar.tsx`.
- [client/src/components/hero-section.tsx](client/src/components/hero-section.tsx) — superseded by `hero.tsx`.
- `translation-demo.tsx` — i18n test scratch.

### 15.4 Server-side dead code
- `migrateExistingDataToTranslations()` in [server/translationUtils.ts](server/translationUtils.ts) — never called.
- Stripe endpoints `POST /api/create-payment-intent` and `POST /api/stripe-webhook` — explicitly `console.warn("DEPRECATED")` at runtime, no real behaviour ([routes.ts:1506](server/routes.ts:1506) and [routes.ts:1545](server/routes.ts:1545)).
- `POST /api/route-bookings` ([routes.ts:1799](server/routes.ts:1799)) — single endpoint, no GET, no other CRUD; no caller found.

### 15.5 Duplicate route registrations (Express bug surface)
**[server/routes.ts](server/routes.ts) registers `/api/attractions` CRUD twice:**
- Lines 218 / 227 / 239 — POST/PUT/DELETE **with `...adminAuth`**.
- Lines 1613 / 1645 / 1656 — POST/PUT/DELETE **without auth**.

Express runs handlers in registration order; the first handler that responds wins. So in practice the admin-protected handlers win, and the unprotected handlers are unreachable dead code. But this is a clear merge artifact and a real footgun if anyone reorders the file or deletes the first set.

GET `/api/attractions` is also registered twice (line 206 with translation middleware, line 1585 without).

### 15.6 Duplicate routes in App.tsx
- `/routes/book/:routeId` and `/route-booking` both map to `RouteBooking`.

### 15.7 TypeScript errors `npm run check` reports (none from STOP 7's code; all pre-existing)
The pre-existing errors come from these files:
- `client/src/pages/admin-working.tsx` — ~15 errors (`'cities' is of type 'unknown'`, etc.) — orphan file.
- `client/src/pages/attractions.tsx` — ~8 errors (same pattern) — wired, has untyped `useQuery` results.
- `client/src/pages/book.tsx:417` — possibly-undefined object access.
- `client/src/pages/booking-confirmation-broken.tsx` — `Cannot redeclare 'generateBookingDetailsText'` — orphan, contributes errors.
- `client/src/pages/booking-confirmation.tsx:98-103` — `'booking'/'quote' does not exist on type '{}'`.
- `client/src/pages/verify-email.tsx:58` — wrong `apiRequest` signature.
- `server/database-storage.ts:187,213,608` — `timeBlockData` implicit `any[]`, booking insert type mismatch.
- `server/email-client.ts:42` — `Resend.send` signature drift (works at runtime; type error since the SDK update).
- `server/vite.ts:39` — `allowedHosts: boolean` not assignable to `true | string[] | undefined`.

`npm run build` passes despite these, because the build pipeline does not run `tsc`; it only invokes `vite build` (which does not type-check) and `esbuild` (which does not type-check).

### 15.8 Build-output artefacts committed to source
- `dist/` — full build output (committed in this worktree; uncertain if this is normal or noise).
- `client/public/pricing-snapshot.json` — regenerated each build, committed.
- `client/src/generated/pricing-snapshot.json` — same data, also committed.

### 15.9 Stale docs
- [Instructions.md](Instructions.md) (Oct 7, 2025) describes a 5-step booking flow (Steps 1-2 complete, 3-5 in progress) that doesn't match either Module 1 or Module 2 as they currently exist.
- [replit.md](replit.md) (last update Aug 12, 2025) describes Replit hosting and a "CRITICAL PRICING ALIGNMENT FIX" that was Era 1 work, pre-dating the Era 2 pricing rewrite documented in [docs/HANDOFF.md](docs/HANDOFF.md).
- [ASSESSMENT.md](ASSESSMENT.md) (Apr 26, 2026) describes problems that [docs/HANDOFF.md](docs/HANDOFF.md) (Apr 28) declares fixed.
- [docs/PRICING_CLEANUP.md](docs/PRICING_CLEANUP.md) lists tables to delete (`pricing_tiers`, `license_classes`, `seasonal_modifiers`, `commission_rules`) — they're still present.

### 15.10 Scripts — orphans
~16 of the 26 files in `scripts/` are one-shot Phase 1-3 work that has run and won't run again: `seed-pricing-tiers.mjs`, `migrate-routes-to-service-catalog.mjs`, `migrate-vehicle-prices-to-trip-types.mjs`, `verify-phase1.mjs`, `verify-phase1b.mjs`, `check-tz.mjs`, `inspect-pricing.mjs`, `migrate-translations.ts`, etc. Several admin-management scripts overlap (`promote-admin.mjs` vs `grant-admin-by-email.ts`, `change-admin-password.ts` vs `reset-password.mjs`).

---

## 16. Two-implementation signals (sorted by confidence)

### 16.1 Strong — sequential rewrites within this repo

These are real and visible:

1. **Three pricing engines** coexist (§6.3). All three are mounted on the Express app right now.
2. **Two "services" tables** (`services` legacy + `serviceCatalog` new). Both populated; both FK'd by different layers.
3. **Three activity tables** (`addOns`, `experiences`, `entranceFees`) where one would suffice; migration is mid-flight per [scripts/migrate-experiences-from-addons.ts](scripts/migrate-experiences-from-addons.ts).
4. **Two pricing-source columns on `routes`** (`basePriceByVehicle` + `vehiclePrices`) plus a normalized `pricingTiers` table — three storage shapes for the same data.
5. **Two booking flows**: Module 1 (email-only inquiry) vs Module 2 (full DB-persisted booking). Different operator workflow, different storage, different status model.
6. **Two admin shells in active code**: the `admin-sidebar.tsx` parent (Era 1 sub-routes) + the standalone Era 3 admin pages (`/admin/service-catalog`, `/admin/trip-types`, `/admin/service-categories`). Plus three orphan admin shells on disk (Era 1 attempts).
7. **Two state-fetching helpers**: `apiRequest` (throws on 4xx) vs `adminFetch` vs raw `fetch`. New code picks ad hoc.
8. **Migration journal abandonment**: `_journal.json` only tracks 0000+0001; everything since (`0002` onward + `PR-Path-B-3.sql`) is hand-applied.

### 16.2 Strong — Replit→Railway port without cleanup

- [.replit](.replit) committed but unused.
- [vite.config.ts](vite.config.ts) loads `@replit/vite-plugin-cartographer` if `REPL_ID` is set.
- [replit.md](replit.md) describes Replit hosting, last updated post-port.
- Stripe is fully wired (schema, components, endpoints) but explicitly DEPRECATED with a note about a "Tab.travel migration" that may or may not be the current direction. `_notes.stripeRemoval` in [package.json](package.json) calls this out.
- 26-script grab-bag from Phase 1-3 cleanup is still in `scripts/`.

### 16.3 Weak — possible second-project bleed (at the spec layer only)

The user's task prompts in STOP 7 and STOP 8 reference architecture that doesn't exist here:
- Next.js paths (`app/[locale]/services/[slug]/page.tsx`, `app/api/inquiries/transportation/route.ts`).
- `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Migration phases 11, 14-18, 20, 21, 23 that don't exist on disk.
- Tables `inquiries`, `inquiry_items`, `quote_versions`, `quote_share_tokens`, `audit_log`, `app_role` enum.
- An `/admin/inquiries` page.

**No code from such a project has landed in this repo** — every audited file fits the Vite/Express/Wouter pattern. The disconnect is at the prompt level: a sibling Next.js project's spec was being driven through this Vite/Express repo. STOP 7 and STOP 8a flagged this and translated/declined accordingly.

---

## 17. Build & gate status (verified at HEAD)

- `npm run check` — **fails** with ~30 pre-existing TS errors (see §15.7). None introduced by recent commits.
- `npm run build` — **passes**. Vite + esbuild don't run `tsc`, so they ignore the type errors.
- App runs at runtime (build artifacts present in `dist/`).
- No automated test suite. Three "manual" test scripts exist (`test-booking-flow.mjs`, `test-quote-immutability.mjs`, `test-admin-tier-sync.mjs`) that hit the running server.

---

## 18. Handover summary

**You're inheriting:**

- A working app shipped through three eras of partial rewrites.
- Two booking flows that don't share a storage model (Module 1 = email; Module 2 = DB).
- Three pricing engines wired side-by-side; the dispatch logic for which one fires lives partly in `quote-builder.ts` accepting both old and new request shapes.
- Three activity-content tables in mid-migration.
- A schema in `shared/schema.ts` that the migration files alone cannot rebuild — six tables are FK'd but never `CREATE TABLE`'d in any tracked migration.
- An admin surface that's the union of three iterations: the Era 1 sidebar shell + the Era 3 catalog admin pages + ~3 orphan shells on disk.
- A pile of dead-but-compiling pages and components, contributing TS errors that `npm run check` flags but `npm run build` ignores.
- An i18n system that translates static UI everywhere but only translates a handful of API responses.
- Replit configuration committed but unused; Railway is the actual host.
- A Stripe integration that's fully scaffolded but explicitly switched off, awaiting a "Tab.travel migration" that's not in flight here.
- Five planning documents (`ASSESSMENT.md`, `Instructions.md`, `replit.md`, `docs/HANDOFF.md`, `docs/SERVICES_ARCHITECTURE.md`) written in different eras with overlapping/contradictory phase numbering.

**You are NOT inheriting:**
- Any visible Next.js code, despite spec prompts referring to Next.js conventions.
- Any `inquiries` / `inquiry_items` / `quote_versions` / `quote_share_tokens` / `audit_log` tables.
- Any granular role system beyond a single `'admin'` check.
- Any CMS, GraphQL layer, or Sanity integration.
- Any test suite worth the name.
- Any working Stripe payment flow.

The "two implementations merged" framing isn't quite right. What's here is **one implementation that was rewritten twice without the cleanup pass between rewrites**. The result reads like two implementations because of all the orphaned files, but they're chronological strata, not parallel worlds.

---

*Generated 2026-05-10 from HEAD `184ce5d`. File count and line numbers are accurate as of this commit; if you re-base on `main` (`dad3039`), the STOP 7 additions in §14/A and §15.4 won't be present yet.*
