# Services Architecture — Phase 1.5

**Status:** Design — not yet implemented.
**Authors:** Islam + Claude (extended product discussion, May 2026).
**Supersedes:** the routes-based pricing model documented in `replit.md` and the assumptions baked into `server/services/pricing.ts` as of commit `bfde4a6`.

---

## 1. Conceptual model

### Why we are changing it

The current data model is built around **routes**: an origin city, a destination city, and a JSON blob of vehicle prices for that pair. Pricing is derived per (origin, destination, vehicle, trip-type), and the customer-facing wizard funnels everyone through "pick a from-city → pick a to-city → pick a vehicle."

That model fits a *transit company* — Uber, an airport-shuttle service. It does not fit AffordEgypt. The actual business is a **catalog of named travel products**:

- "Cairo Airport ⇄ Pyramids of Giza Transfer"
- "Luxor East-Bank Half-Day Tour with Karnak & Luxor Temple"
- "Cairo 8-hour Vehicle Rental with Driver"
- "Aswan to Abu Simbel Day Trip"
- "Sharm El Sheikh Sound & Light Show Transfer"

These are **products**, not routes. Some have a from→to (transfers). Some have a fixed itinerary with multiple stops (tours). Some have neither — only a duration and a city (time-block rentals). Some apply only to specific pickup zones inside a city (East Bank vs West Bank in Luxor changes the price). The route-based model has to torture all of these into "from X to Y," which obscures what the customer is actually buying.

### The new core entity

**`services`** replaces `routes` as the central entity. Each row is one distinct named product. The product has:

- a stable **slug** (URL- and code-friendly, write-once)
- a customer-facing **name**
- a **city** it operates in (for grouping / filtering)
- a **category** (`airport_transfer`, `tour_transfer`, `intercity_transfer`, `dinner_transfer`, `sound_light_show`, …)
- optional **pickup zone** for cases where pickup location materially changes price
- optional **included stops** (for tours)
- optional **duration** in hours (for time-block products)
- a **vehiclePrices** JSON blob with flat keys `{vehicle}_{tripType}` — the same shape we shipped in `bfde4a6`

Pricing has no math, no derivation, no zone-and-modifier formula. The admin types each price for each (vehicle × trip-type) combination they want to publish. Empty cells mean "not available." Same rule we landed on for routes, applied to a richer entity.

### Three customer discovery patterns

We are not picking *one* of these — all three coexist and route through the same catalog. The product team has identified three distinct customer mental models:

1. **Search-driven** — "I know where I'm going." A traveler types `Cairo Airport to Pyramids` and expects the matching product to surface in one step. Power users, returning customers, agency users. Implementation: a typeahead over service names + slugs, hitting `/services/:slug`.

2. **Filter-driven** — "I want to see specific things." A traveler picks a city + category (`Luxor` + `Tour transfer`) and expects a list of products that match. Common for first-time visitors who know they're going to Luxor but don't know the names of specific tours. Implementation: a list view with city/category facets that resolves to `/services?city=luxor&category=tour_transfer`.

3. **Browse / catalog-driven** — "Show me what you have." A traveler hits the homepage or `/services` cold and expects a curated catalog grouped by city or category. Inspirational, exploratory. Implementation: a paginated grid grouped by city → category → service, with images.

All three converge on the **same service-detail view** at `/services/:slug`: name, description, included stops, vehicle options grid, "Book this service" CTA. The discovery surface is what differs; the booking flow is identical.

---

## 2. Schema

### `services` table

```sql
CREATE TABLE services (
  id              SERIAL PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,           -- write-once; URL-safe
  name            TEXT NOT NULL,                  -- customer-facing display
  city            TEXT NOT NULL,                  -- 'Cairo' | 'Luxor' | ...
  category        TEXT NOT NULL,                  -- references service_categories.slug
  pickup_zone     TEXT,                           -- nullable; e.g. 'East Bank'
  description     TEXT,                           -- free-form marketing copy
  included_stops  JSONB,                          -- nullable; tour-specific
  vehicle_prices  JSONB NOT NULL DEFAULT '{}',    -- flat keys; see below
  duration_hours  INTEGER,                        -- nullable; for time-block rentals
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_city            ON services (city);
CREATE INDEX idx_services_category        ON services (category);
CREATE INDEX idx_services_city_category   ON services (city, category);
CREATE INDEX idx_services_active          ON services (active) WHERE active = TRUE;
CREATE INDEX idx_services_slug_lower      ON services (LOWER(slug));   -- case-insensitive lookups
```

Field notes:

- **`slug`** is the durable identifier. URLs (`/services/cairo-airport-to-pyramids`), API paths, line-item snapshots, and any cross-references all key off slug. Treated as **write-once**: editing a slug after a service has been booked breaks the snapshot trail. Admin UI must make the slug input read-only after the first save.
- **`name`** is what customers see. Editable freely. Updates do not cascade into frozen quotes — each line item snapshots the name at booking time.
- **`city`** is a string from the supported set: `Cairo`, `Luxor`, `Aswan`, `Hurghada`, `Sharm El Sheikh`, `Alexandria`, `Siwa`. Stored as text rather than a foreign-key to `cities` because (a) we already query `cities` separately for display and (b) keeping it as text lets the admin add a city to the supported set without a schema change. The cities table can stay where it is for marketing/SEO content; the services table just needs the label.
- **`category`** references `service_categories.slug` (see the table-vs-enum discussion below). Required.
- **`pickup_zone`** is nullable. Used when pricing differs by pickup location *within a city* — e.g., a Luxor tour has different prices for an East Bank pickup vs a West Bank pickup. When non-null, customers see this as part of the service name or as a sub-selector on the detail page. **Open question** below: is pickup zone a separate dimension on the price grid, or do we model it by creating two distinct services (`luxor-east-bank-half-day`, `luxor-west-bank-half-day`)? Initial recommendation: separate services. Pickup-zone field stays as a label/grouping aid.
- **`description`** is plain text or markdown — TBD which we render. Customer-facing.
- **`included_stops`** is nullable JSONB. For tours: `[{"name": "Karnak Temple", "duration_minutes": 90}, {"name": "Luxor Temple", "duration_minutes": 60}]`. For non-tours, leave null.
- **`vehicle_prices`** is JSONB. Flat keys: `{vehicle_slug}_{trip_type_slug}`. See "Vehicle prices key vocabulary" below.
- **`duration_hours`** is nullable. Set for time-block products like "Cairo 8-hour rental." Null for fixed-itinerary products. Used to display "8 hours" on the product card and as the basis for the trip-type slug (`8hr`).
- **`active`** is a soft-delete flag. Inactive services are hidden from the customer catalog but remain visible to admin (so historical bookings can still resolve their snapshot context) and any frozen line item still references the slug.
- **`sort_order`** controls display order within a category. Lower number = earlier.
- **`created_at` / `updated_at`** are timestamptz. Updated_at is bumped by application code on every PATCH.

### `trip_types` table

```sql
CREATE TABLE trip_types (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,         -- write-once; used in price keys
  name          TEXT NOT NULL,                -- display: "One-way", "Round-trip same day"
  description   TEXT,                         -- optional admin-facing note
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Initial seed:

| slug                        | name                       | sort_order |
|-----------------------------|----------------------------|------------|
| `one_way`                   | One-way                    | 10         |
| `round_trip_same_day`       | Round-trip (same day)      | 20         |
| `round_trip_multi_day`      | Round-trip (multi-day)     | 30         |
| `4hr`                       | 4-hour rental              | 100        |
| `8hr`                       | 8-hour rental              | 110        |
| `12hr`                      | 12-hour rental             | 120        |

Trip-type slugs are part of the durable contract: they appear in `vehicle_prices` keys, in line-item meta, in URLs (potentially), and in client-side type definitions. **Write-once.** Renaming a slug after a service has been priced against it leaves orphan keys and breaks lookups. Admin UI must make slug read-only after first save.

The trip-type vocabulary is **globally extensible** by admin — the table is the source of truth, not a TypeScript enum. New product lines (overnight desert camp = `2_day`, multi-day Nile cruise = `4_day_5_day`, half-day = `4hr` already covers it) can be added without engineering involvement.

**Vocabulary fragmentation risk.** Without discipline an admin will create `8hr`, `8_hour`, `8h`, `eighthour` over the years. Mitigations:
- Slug input enforces `[a-z0-9_]+` regex with no spaces or hyphens.
- Admin form pre-fills slug from name (lowercase, snake_case).
- A "merge" operation in the admin UI to consolidate duplicates by reassigning all `vehicle_prices` keys (deferred — first solve this organizationally, not technically).

### `service_categories` — table or enum?

Two options, with the tradeoff documented:

#### Option A: dedicated `service_categories` table

```sql
CREATE TABLE service_categories (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Pros:
- Admin can add new categories (`cooking_class`, `balloon_ride`, `wellness_retreat`) without a deploy or a DDL migration.
- Soft-delete via `active` lets a category hide from the customer-facing filter without orphaning historical services.
- Display fields (icon path, color theme, marketing tagline) can be added without a code change.
- Translation columns (`name_translations`, `description_translations`) can be added if/when we re-internationalize.

Cons:
- Extra join on every catalog query.
- TypeScript types for category names become string-typed rather than a discriminated union.
- One more admin surface to maintain (`/admin/service-categories`).

#### Option B: `category` as a TypeScript enum + Postgres CHECK constraint

```sql
ALTER TABLE services
  ADD CONSTRAINT services_category_check
  CHECK (category IN (
    'airport_transfer',
    'tour_transfer',
    'intercity_transfer',
    'dinner_transfer',
    'sound_light_show'
  ));
```

Pros:
- Type-safe in TypeScript; exhaustiveness checks at compile time.
- Simpler queries (no join).
- Fewer admin surfaces.

Cons:
- Adding a new category is a code change + DDL migration.
- No soft-delete semantic.
- No place to hang display metadata.

#### Recommendation

**Option A (table).** Categories *will* grow over time. AffordEgypt's stated direction includes diversifying beyond transfers and tours into experiences (cooking, ballooning, wellness). The cost of each new category being a deploy outweighs the cost of one more admin section. Worth confirming with Islam before implementation.

Initial seed for `service_categories`:

| slug                  | name                   | sort_order |
|-----------------------|------------------------|------------|
| `airport_transfer`    | Airport transfer       | 10         |
| `intercity_transfer`  | Intercity transfer     | 20         |
| `tour_transfer`       | Tour transfer          | 30         |
| `dinner_transfer`     | Dinner transfer        | 40         |
| `sound_light_show`    | Sound & light show     | 50         |

### Vehicle prices key vocabulary

Same shape as the routes-based system shipped in `bfde4a6`, but the trip-type vocabulary is now extensible:

```jsonc
{
  "sedan_one_way":              600,
  "sedan_round_trip_same_day":  1000,
  "sedan_4hr":                  1200,
  "sedan_8hr":                  2000,
  "minivan_one_way":            800,
  "minivan_8hr":                2600,
  "van_one_way":                1100,
  "van_8hr":                    3400
}
```

Lookup contract:

- `vehiclePrices[`${vehicle_slug}_${trip_type_slug}`]` returns the price.
- Missing key = unavailable. The customer wizard hides that vehicle/trip-type combination. The booking API returns 422 with `{unpriced: true, vehicleSlug, tripType}` (mirrors today's behavior).
- Empty `{}` is a valid stored value; means the service has zero pricing set and is unbookable. Admin UI shows it but blocks customer booking.

Validation rules (server-side, on POST/PATCH `/api/services`):
- Every key matches `^([a-z0-9]+)_([a-z0-9_]+)$`.
- The `vehicle_slug` part exists in `vehicle_types.name` (lowercased).
- The `trip_type_slug` part exists in `trip_types.slug` and `trip_types.active = true` at write time.
- Prices are positive numbers. Reject zero, negative, and non-numeric.
- Validation is at write time only. A trip type going inactive *later* does not retroactively invalidate stored keys — the lookup just stops returning them in customer-facing UIs (since the trip-type filter excludes inactive types).

---

## 3. Migration path from the current schema

### Strategy

- The new tables live alongside `routes`, `pricing_tiers`, `vehicle_types`, etc.
- Existing pages (`/transfers`, `/admin/routes/...`) continue to read `routes` until cutover.
- A one-shot migration script copies every routes row into a corresponding services row.
- After verification, the legacy `/admin/routes/...` editor is removed and the `routes` table is dropped (along with `pricing_tiers`, `license_classes`, `seasonal_modifiers`, `commission_rules`, `routes.base_price_by_vehicle` — all already noted in `docs/PRICING_CLEANUP.md`).

### DDL migration (new tables only)

A new Drizzle migration creates `services`, `trip_types`, and `service_categories`. Seeds the two reference tables with the values listed above. Does not touch `routes`.

### Data migration script

`scripts/migrate-routes-to-services.mjs`. Behavior:

1. Read every row from `routes`.
2. For each row, derive a `services` row:
   - **`slug`**: derived from cities + locations. E.g. `routes.fromLocation = "Cairo Airport"` and `routes.toLocation = "Cairo Hotel"` → slug `cairo-airport-to-cairo-hotel`. Fall back to `${fromCity}-to-${toCity}-${tripMode}` if locations are null. If a slug collision exists, append `-2`, `-3`, etc.
   - **`name`**: `"${fromLocation} → ${toLocation}"` if locations are present, else `"${fromCity} → ${toCity}"`.
   - **`city`**: the relevant city. For intra-city routes, use `cityId`'s name. For inter-city routes, use `fromCityId`'s name (the departure city). Resolve the city ID to a name via the `cities` table.
   - **`category`**: heuristic, based on substring matches:
     - if `fromLocation` or `toLocation` contains "airport" (case-insensitive) → `airport_transfer`
     - else if `routeCategory = 'inter_city'` → `intercity_transfer`
     - else if `tripMode` is `day_trip` or `multi_day` or `overnight` → `tour_transfer`
     - else → `airport_transfer` (defensive default)
   - **`pickup_zone`**: null. Pickup zones are a Luxor-specific concept that isn't represented in `routes`; admin will fill in on a per-service basis after migration.
   - **`description`**: copy `routes.routeHighlights` if present, else null.
   - **`included_stops`**: null (routes have no stop concept).
   - **`vehicle_prices`**: copy `routes.vehiclePrices` *verbatim*. After commit `bfde4a6`, this is already in flat-key shape (`sedan_one_way`, `sedan_round_trip_same_day`, …). Migration is a one-line copy.
   - **`duration_hours`**: copy from `routes.estimatedDuration` only if it's a clean integer hour count. Otherwise null.
   - **`active`**: `true`.
   - **`sort_order`**: copy `routes.displayOrder`.
3. Idempotent: skip rows where a service with the derived slug already exists. Log skip reason.
4. Per-row log: `routeId → serviceSlug` with category and price-key count.
5. Final summary: migrated, skipped (slug collision), errored.
6. **Does not delete the routes row.** Routes table stays intact during transition.

Run order on prod:
```
node scripts/migrate-routes-to-services.mjs
```
Run twice to confirm idempotency before considering it done.

### Cutover and cleanup

After migration is verified and the new admin/customer surfaces are live:

1. Add a banner to `/admin/routes/*` pages: "Legacy editor — new entries should go in /admin/services."
2. Wait one or two release cycles to confirm no regressions.
3. Migrate any data drift back into services (script run again).
4. Remove `/admin/routes/*` UI and `route-edit-modal.tsx`.
5. Drop `routes`, `pricing_tiers`, `license_classes`, `seasonal_modifiers`, `commission_rules` tables in a final migration.
6. Delete dead server code (`/api/route-bookings`, `/api/pricing/calculate` multi-city endpoint, `database-storage.ts` route methods).
7. `docs/PRICING_CLEANUP.md` is the running checklist for this cleanup phase — extend it with the routes-table drop.

---

## 4. Admin UI sections

### `/admin/services` — list view

Default landing for the new admin section. Layout:

- Top bar: city filter (dropdown), category filter (dropdown), active/inactive toggle, search box (matches name + slug), "+ Add service" button.
- Table columns: Name, City, Category, Pickup zone (if non-null), Vehicle pricing summary ("3 vehicles × 2 trip types = 6 prices set"), Active toggle, Edit button.
- Sort: by `sort_order ASC, name ASC` within the current city/category filter.
- Empty state: "No services match these filters. [Add the first service for {city}.]"

### `/admin/services/new` and `/admin/services/:id/edit` — service editor

A single form with these sections, top to bottom:

1. **Identity**
   - Slug (text input; pre-filled from name; read-only after first save)
   - Name (text input; required)
   - Active (toggle; default true)
   - Sort order (number input; default 0)

2. **Classification**
   - City (dropdown of supported cities; required)
   - Category (dropdown of active service_categories; required)
   - Pickup zone (text input; optional)

3. **Description**
   - Description (textarea; optional; markdown supported)

4. **Tour-specific**
   - Duration in hours (number input; optional; only relevant for time-block products)
   - Included stops (repeater: name + duration_minutes; optional; only relevant for tour_transfer)

5. **Vehicle pricing grid** — the centerpiece
   - Rows: every vehicle from `vehicle_types` (currently sedan, minivan, van).
   - Columns: every active trip type from `trip_types` (ordered by sort_order). Today that's 6: One-way, Round-trip same day, Round-trip multi-day, 4hr, 8hr, 12hr.
   - Each cell is an independent number input, optional. Empty input = key not stored = combination unavailable to customers.
   - Validation on save: at least one cell across the entire grid is filled. If zero cells, block save with "Enter at least one price, or the service is unbookable."
   - Cells display the existing value if the service already has it; blank otherwise.
   - Cells are visually grouped by vehicle (a horizontal row per vehicle) with the trip-type label as column headers.

6. **Save / Cancel** buttons.

### `/admin/trip-types` — CRUD

Simple table. Columns: Slug (read-only after first save), Name, Active toggle, Sort order, Edit, Delete.

Add-trip-type form: Slug (write-once, validated regex), Name, Description (optional), Active toggle, Sort order.

Delete is soft (sets active=false) when any service has a price keyed against this trip type. Hard delete only if no service references it.

### `/admin/service-categories` — CRUD (assuming Option A)

Same layout as trip-types. Slug, Name, Description, Active, Sort order. Soft-delete when services reference; hard-delete otherwise.

### Legacy `/admin/routes/*` views

Stay functional throughout the transition. Add a top banner: "Legacy view. New services should be added in [/admin/services]." Remove only after the data migration is confirmed and all production routes are mirrored as services.

The three current admin entry points for routes (per the earlier audit) — `/admin` sidebar, `/admin/routes`, `/admin/dashboard` — all keep their existing route editor (`route-edit-modal.tsx`). The in-progress refactor unifying them through `RouteEditModal` (uncommitted in this worktree) becomes moot once routes are deleted; it can either be completed for the transition window or abandoned in favor of pointing all three at the new `/admin/services` surface. **Open question** below.

---

## 5. Customer-facing wizard paths

### The three discovery paths

**Search (typeahead).** Anywhere in the site (header search box, homepage hero), the customer types a destination or product name. A debounced `GET /api/services/search?q=cairo airport` returns matching services ranked by name and slug similarity. Picking a result navigates directly to `/services/:slug`.

**Filter.** A landing page like `/services?city=cairo&category=airport_transfer` shows a list of services matching those filters. Users can refine by adding more filters. List items are cards with name, image, starting price (the lowest priced cell on the grid), and a "View details" CTA. Picking a card navigates to `/services/:slug`.

**Browse.** `/services` (no filters) shows the full catalog grouped first by city, then by category. Each group is a horizontally scrollable carousel of service cards. The homepage hero contains entry points into all three patterns: a search box, a "Pick your city" filter shortcut, and a "Browse all services" link.

All three converge on `/services/:slug`.

### `/services/:slug` — service detail

Layout:

- Header: service name, city, category badge, pickup zone (if non-null).
- Description block (rendered markdown).
- Included stops (if non-empty): bulleted list with optional durations.
- Vehicle pricing grid: rows = vehicles, columns = trip types. Only cells with prices are clickable; unpriced cells render as "—" or are hidden entirely (TBD UX choice). Each clickable cell is essentially a "Book {vehicle} for {trip type} — {price} EGP" CTA.
- Single "Book this service" CTA below the grid that opens a checkout flow with the customer's chosen (vehicle, trip-type) preselected.

### Multi-day planner (Door 2)

`/plan-trip` route. The customer builds an itinerary day by day:

- Day 1: pick a city → pick a service from that city's catalog → pick (vehicle, trip-type).
- Day 2: same. (Same city allowed; different city allowed.)
- Day N: same.
- Right-side sidebar shows running total in EGP, updated live as services are added or removed.
- Single submission at the end creates one frozen quote with N line items (one per day).

The multi-day planner is the canonical "build-your-own-trip" surface. Single-service booking (`/services/:slug` "Book this service") is the canonical "single-service" surface. Both submit through the same booking API (`/api/multi-day-bookings` with `days.length === 1` for the single case, or a dedicated `/api/service-bookings` — TBD which is cleaner).

### Homepage hero

The current homepage hero is built around route-based search (from-city → to-city). It needs rework to surface the three new entry points:

- Hero search input: typeahead into services.
- Hero filter shortcut: "Pick your city" → drops into `/services?city={city}`.
- Hero browse: "Or browse all transfers and tours" link → `/services`.
- A second hero block (below the fold or rotating) for "Plan a multi-day trip" → `/plan-trip`.

The exact UX is **deferred to a separate design pass.**

---

## 6. API endpoints

### Services CRUD (admin) and read (public)

| Method | Path                              | Auth   | Purpose                                       |
|--------|-----------------------------------|--------|-----------------------------------------------|
| GET    | `/api/services`                   | public | List active services. Filters: `city`, `category`, `q` (search). |
| GET    | `/api/services/:slug`             | public | Single service by slug.                       |
| GET    | `/api/services/by-id/:id`         | admin  | Single service by numeric ID (admin lookups). |
| GET    | `/api/services/search?q=`         | public | Typeahead search; returns `[ {slug, name, city, category} ]`. |
| POST   | `/api/services`                   | admin  | Create service.                               |
| PATCH  | `/api/services/:id`               | admin  | Update service. Slug is rejected if changed.  |
| DELETE | `/api/services/:id`               | admin  | Soft-delete (sets active=false). Hard-delete only via separate explicit endpoint. |

### Trip types CRUD (admin) and read (public + admin)

| Method | Path                       | Auth   | Purpose                              |
|--------|----------------------------|--------|--------------------------------------|
| GET    | `/api/trip-types`          | public | List active trip types.              |
| GET    | `/api/trip-types?all=1`    | admin  | Include inactive (for admin editor). |
| POST   | `/api/trip-types`          | admin  | Create.                              |
| PATCH  | `/api/trip-types/:id`      | admin  | Update. Slug rejected if changed.    |
| DELETE | `/api/trip-types/:id`      | admin  | Soft-delete if referenced; else hard-delete. |

### Service categories CRUD (admin) and read (public + admin)

Same shape as trip-types if Option A is chosen. Skip if Option B (enum).

### Booking endpoints

| Method | Path                          | Auth   | Purpose                                |
|--------|-------------------------------|--------|----------------------------------------|
| POST   | `/api/service-bookings`       | public | Single-service booking.                |
| POST   | `/api/multi-day-bookings`     | public | Multi-day itinerary booking.           |
| GET    | `/api/bookings/:id`           | public | Frozen booking with line items.        |
| GET    | `/api/bookings/reference/:r`  | public | Lookup by reference (current pattern). |
| POST   | `/api/services/calculate-pricing` | public | Live price preview, mirrors today's `/api/calculate-pricing`. |

### Quote freezing pattern (unchanged)

The existing frozen-quote pattern from `bfde4a6` carries over:

- Every booking creates a `quotes` row (immutable once `frozen_at` is set).
- Each line item in `quote_line_items` snapshots: `serviceSlug`, `serviceNameSnapshot`, `vehicleSlug`, `tripTypeSlug`, `unitPrice`, `quantity`, `lineTotal`, `meta` (city, category, pickup zone for the audit trail).
- Bookings reference the quote ID; the booking row holds the customer details and frozen `total_amount`.
- Re-pricing the underlying service has zero effect on existing bookings — they read frozen line items, never re-compute.

### Endpoints that become legacy

These continue to work during the transition window, then are removed after the routes table drop:

- `POST /api/route-bookings`
- `POST /api/calculate-pricing` (route-based; the services variant supersedes)
- `POST /api/pricing/calculate` (multi-city composer; replaced by `/api/multi-day-bookings`)
- `POST /api/quotes` (route-based path; the services variant supersedes)
- `GET /api/routes` and route-create/update endpoints

---

## 7. Backward compatibility / rollout

### Phases

**Phase A — schema deployed, no UI yet.**
- DDL migration creates `services`, `trip_types`, `service_categories` and seeds them.
- `scripts/migrate-routes-to-services.mjs` runs against prod. Logs reviewed.
- New tables are populated and queryable; nothing references them yet.
- Old surfaces (`/transfers`, `/admin/routes/*`) unchanged.

**Phase B — admin surfaces launch.**
- `/admin/services`, `/admin/services/:id/edit`, `/admin/trip-types`, `/admin/service-categories` all live.
- `/admin/routes/*` gets a banner: "Legacy view — add new services in /admin/services."
- Admin starts using the new surface for new entries; existing migrated services are editable.
- Edits in `/admin/services` write to `services`. Edits in `/admin/routes/*` write to `routes`. **Two parallel write paths during this phase** — risk noted.

**Phase C — customer surfaces launch.**
- `/services` (catalog), `/services/:slug` (detail), `/plan-trip` (multi-day) all live.
- Old `/transfers` page stays live and reads from `routes` (unchanged from today).
- Homepage hero reworked to surface the new entry points alongside (or instead of) the legacy transfer search. Marketing decides the rollout messaging.

**Phase D — cutover.**
- `/transfers` redirects to `/services`.
- `/admin/routes/*` removed.
- `route-edit-modal.tsx` removed.
- The in-progress sidebar refactor (uncommitted in this worktree) becomes moot.
- A week of monitoring; rollback plan is restoring the old code from the prior tag.

**Phase E — cleanup.**
- DDL migration drops `routes`, `pricing_tiers`, `license_classes`, `seasonal_modifiers`, `commission_rules`.
- Drops `routes.base_price_by_vehicle` (already on the cleanup list).
- Server-side dead-code deletion: `pricing-routes.ts` (multi-city), route handlers, legacy storage methods.
- `docs/PRICING_CLEANUP.md` updated and closed.

### Risk: dual-write window

During Phase B, two admin surfaces can write to two underlying tables. If an admin edits a service in `/admin/services` and then edits the *legacy* equivalent route in `/admin/routes/*`, the two diverge.

Mitigations:
- Banner on `/admin/routes/*` strongly discourages new edits.
- Migration script can be re-run to overwrite services rows from routes drift (idempotent enough that it's safe).
- Phase B kept as short as possible — days, not weeks.
- Cutover (Phase D) made explicit and announced so admin knows the legacy surface goes away.

### Risk: customer-facing parity

`/services` must show every product `/transfers` shows, or worse, before the cutover. A pre-cutover checklist:
- Every routes row has a corresponding services row (script verifies).
- Every priced (vehicle, trip-type) combination on routes is also priced on services (script verifies).
- A spot-check of 10 randomly selected services vs their routes equivalents — same name, same prices, same vehicles available.

---

## 8. Open questions / decisions deferred

These are real questions surfaced during the design pass that need an answer before or during implementation. Listed in roughly the order they'll matter.

### Schema / data model

1. **Categories: table or enum?** Recommendation is table (Option A). Confirm with Islam.
2. **Pickup zone: separate dimension or separate services?** Recommendation is separate services (so `luxor-east-bank-half-day` and `luxor-west-bank-half-day` are distinct rows with their own price grids). The `pickup_zone` field stays as a label/grouping aid. Confirm.
3. **Translations.** Routes had `nameTranslations`, `descriptionTranslations` JSONB columns. Services likely needs the same eventually. Worth adding the columns now (even if unused) to avoid a future migration? Or wait until i18n is reactivated?
4. **Images per service.** Customers will expect photos on the catalog and detail pages. Schema doesn't include image URLs — needs an `image_url` (single hero) or an `images` JSONB array. Decide before the customer-facing UI is built.
5. **Pricing variants beyond vehicle × trip-type.** Some services may have add-ons priced separately (e.g., "+200 EGP for English-speaking driver"). Today the routes architecture handles add-ons via the `add_ons` table. Should service-level add-ons be linked to specific services, or stay in the global `add_ons` table with optional `service_id` foreign keys?
6. **Seasonal pricing.** Removed from the simplified pricing layer (`bfde4a6`). If/when peak-season pricing comes back, it would attach to services. Defer until needed.

### UX / customer surface

7. **Homepage hero design.** The new entry points (search, filter shortcut, browse, multi-day planner) all need to fit visually. Defer to a separate design pass; this doc just declares they exist.
8. **Phase 2 SEO landing pages.** AffordEgypt has SEO landing pages like `/cairo-airport-transfers`, `/luxor-airport-transfers`, `/cairo-car-tour-guide-services`. How do those map to services? One page per service? One page per `(city, category)` aggregation? The existing pages are templated; the question is whether they pull from `services` or stay as static hand-written marketing pages. Probably the latter for now, with a "View bookable services" CTA into the catalog.
9. **Soft-redirect from "Browse Transfers" to multi-day planner.** Earlier conversations suggested some customers should be steered into the multi-day planner even when they came in looking for a single transfer (because most multi-day customers are higher-margin). When and how? A nudge banner ("Planning multiple days? Save with a custom itinerary →") on the single-service detail page is a low-risk default. More aggressive funneling needs UX testing.
10. **Unpriced cells: hide or show "—"?** On the customer-facing service detail page, when a (vehicle, trip-type) cell is unpriced, do we (a) hide that vehicle entirely if it has no priced trip type, (b) show all vehicles but render unpriced cells as "—", (c) show all vehicles and grey out unbookable cells with a tooltip "not available — contact us"? Default recommendation: (b) — full grid, dashes for unpriced, no tooltip. Simplest mental model.

### Admin surface

11. **In-progress sidebar refactor (uncommitted in this worktree).** Three options: (i) finish it so all current route-edit entry points share one component for the transition window; (ii) abandon it and let the legacy editor be untouched until cutover deletes it; (iii) point all three legacy entry points at the new `/admin/services` instead. (iii) is cleanest if Phase B can be short; (i) is safest if the transition runs longer.
12. **Bulk import.** The current admin has a CSV bulk-import for routes. Services should support the same. Schema needs to be defined for the CSV columns (slug, name, city, category, vehicle_prices as a single string column? or one column per (vehicle × trip-type) pair?). Defer until volume is needed.

### API / backend

13. **`/api/service-bookings` vs `/api/multi-day-bookings`.** Should single-service bookings just go through `/api/multi-day-bookings` with `days.length === 1`, simplifying the API surface? Or keep two endpoints for cleanliness? Slight preference for one endpoint with a flexible payload.
14. **Search ranking.** The typeahead search needs a ranking function. Trigram similarity on name + slug? Substring match? Postgres full-text search? Defer the implementation but earmark "typeahead is non-trivial" in the Phase C estimate.
15. **Validation strictness on `vehicle_prices` keys.** The validation rules above reject keys that reference inactive trip types at write time. What happens when an admin tries to edit a service that *already* has a key referencing a now-inactive trip type? Render the cell read-only with a "this trip type was deactivated" note? Allow editing? Block save until the orphan key is cleared? Recommendation: render read-only, allow save (don't force the admin to deal with someone else's deactivation as a precondition for unrelated edits).

### Migration

16. **Slug derivation collisions.** The migration script appends `-2`, `-3` on collision. Alternative: log the collision and skip, requiring manual resolution. Skip is safer (doesn't auto-create confusing duplicates) but requires admin intervention. Recommendation: skip and log.
17. **Rollback plan.** If services launches and we discover a critical bug after some customer bookings reference services, what's the rollback? The frozen-quote pattern means existing bookings are safe regardless. The rollback is "stop writing to services, revert the customer-facing UI, leave the data in place." Document this explicitly in the deployment runbook.

---

## Appendix A — Glossary

- **Service** — a named, bookable travel product. Replaces the routes-based mental model.
- **Slug** — a URL- and code-friendly identifier for a service or trip type. Write-once.
- **Trip type** — a packaging dimension: one-way, round-trip, time-block rental. Globally extensible via `trip_types`.
- **Vehicle slug** — `sedan`, `minivan`, `van`. Comes from `vehicle_types.name` lowercased.
- **Price key** — `${vehicle_slug}_${trip_type_slug}` — the lookup key in `vehicle_prices` JSONB.
- **Pickup zone** — a label inside a city distinguishing materially different pickup areas (East Bank vs West Bank in Luxor). Often handled by creating separate services rather than as a price-grid dimension.
- **Frozen quote** — an immutable line-item snapshot created at booking time. Re-pricing the underlying service has no effect.
- **Phase A/B/C/D/E** — the rollout phases described in section 7.

## Appendix B — Relationship to existing docs

- **`docs/PRICING_CLEANUP.md`** — already lists tables and columns to drop after the simplified pricing layer is fully canonical. This doc extends that list with `routes` itself, to be dropped at end of Phase E.
- **`docs/HANDOFF.md`** — operational handoff doc; should be updated post-cutover to reflect services as the canonical entity.
- **`docs/SITEMAP.md`** — needs to add `/services`, `/services/:slug`, `/plan-trip`, `/admin/services`, `/admin/trip-types`, `/admin/service-categories` once those pages exist.
- **`replit.md`** — top-level project description still describes the routes-based model. Update during Phase D cutover to reflect services as the core entity.

## Appendix C — What this doc deliberately does NOT cover

- Specific React component file layout for the new admin surfaces.
- Specific Drizzle migration file content (`migrations/00XX_services.sql`) — that's an implementation artifact.
- Marketing copy or visual design for the homepage hero rework.
- SEO meta tag strategy for `/services/:slug` pages — Phase 2 marketing concern.
- Image hosting / CDN choice — implementation concern.
- Caching / CDN edge strategy — implementation concern.
- Email confirmation template changes — should mostly carry over from today's pattern.
- Payment gateway integration (Tab.travel) — already in flight, separate workstream, doesn't depend on services architecture.

---

**End of design.** Implementation should reference this doc as the source of truth. Any deviation requires a doc update first, code second.
