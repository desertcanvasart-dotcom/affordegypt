# Ready-made packages

This feature provides three program slots, featured on the homepage after publication, a `/packages` catalog, `/packages/:slug` details and a booking request form. `/admin/packages` is linked from the existing admin dashboard. No real programs or prices are seeded: slots are empty until the operator saves them.

## Pricing and rooms

Prices are EGP **per traveler for the complete program**, sharing a twin/double room. Configure rates for groups of 2, 4, 6, 8, 10 and 12. The selected tier's rate is multiplied by the actual number of travelers.

Odd groups use the previous even tier: 3 → 2, 5 → 4, 7 → 6, 9 → 8, 11 → 10. A single-room supplement is charged **per single room for the entire stay**. Enter zero if included. If the operator quotes a supplement per night, convert it to the complete-stay amount before saving.

Examples with a two-person rate of 1,000 EGP per person and a 300 EGP single supplement:

| Travelers | Twin/double rooms | Single rooms | Calculation | Total EGP |
|---|---:|---:|---|---:|
| 2 | 1 | 0 | 2 × 1,000 | 2,000 |
| 3 | 1 | 1 | 3 × 1,000 + 300 | 3,300 |
| 3 | 0 | 3 | 3 × 1,000 + 3 × 300 | 3,900 |

The form automatically chooses shared rooms plus one single for odd groups, and lets customers choose additional single rooms. It only offers configurations where two travelers per twin/double and one per single accommodate the group exactly. Packages without overnight stays have no room allocation or supplement. The current scope is 2–12 travelers; children, triple rooms, seasonal prices and hotel upgrades are not modeled yet.

Server-side pricing uses `PricingService.priceReadyMadePackage`, backed by the shared integer-cent calculator in `shared/travel-packages.ts`. USD/EUR/GBP estimates reuse the existing currency feature. Bookings and frozen quotes stay in EGP.

## Publishing

Each package has a fixed slot (1–3), unique URL slug, title, summary, overview, image, days/nights, itinerary, inclusions, exclusions, six group rates, single supplement and package-specific terms. Drafts may have incomplete content; publishing requires completed itinerary days, core copy, inclusions, all rates and booking/payment/cancellation terms.

The slug is fixed after the first save. Version checks prevent one admin from overwriting a newer edit. Saving a published package as a draft unpublishes it. Existing bookings keep their original program and pricing snapshots.

The homepage section stays hidden while there are no published programs. Program content is currently authored in one language, consistent with the existing service catalog; interface copy is available in English, Spanish, French and German.

## Booking contract

- `GET /api/packages` and `GET /api/packages/:slug`: published programs only.
- `POST /api/packages/:slug/price`: `{ travelers, singleRooms }` → server price breakdown, tier, rooms and package version.
- `POST /api/packages/:slug/bookings`: group, rooms, date, contact details, requests, explicit terms acceptance, expected total/version and UUID request key.
- `GET /api/admin/packages`: authenticated admin list.
- `PUT /api/admin/packages/:slot`: complete authored content plus `expectedVersion` (zero for a new slot).

The booking transaction locks the selected program, recalculates prices, compares the preview total/version, and writes the quote, frozen line items, pending booking and idempotency record together. A price or terms change returns 409 and makes the customer review and accept again. Concurrent retries with the same request key return the original booking; reuse with different details returns 409.

The snapshot includes program content, departure dates, traveler counts, room allocation, price tier, supplements, requests and acceptance time. Package requests appear in the existing admin booking list. Confirmation pages, downloadable confirmations and email include package details and terms. Package requests do not inherit the custom planner's fixed 10% deposit/cancellation promises. Email delivery is attempted after commit and cannot invalidate a recorded booking. The form requests availability; it does not charge a card or promise confirmed accommodation.

Published detail URLs receive their own server HTML metadata and a clean application root. Missing/draft package pages return 404 in production. This avoids hydrating a package page over the prerendered homepage. Package catalog prerendering starts without remote package data; live content loads after hydration. `/packages` is included in the build sitemap.

## Deployment

Apply `migrations/0008_ready_made_packages.sql` to the intended database before enabling the feature. It creates two additive tables: `travel_packages` and `package_booking_requests`, with a database constraint limiting slots to 1–3. It does not alter existing booking records or populate sample programs. The migration is safe to run again. Use the project's existing reviewed migration procedure; do not use schema push against production.

No additional API key or environment variable is required. Existing database, authentication and email settings are reused. The migration has been tested on a disposable local PostgreSQL database, but has not been applied to production.

## Verification

Run `npm run check`, `npm test`, `npm run check:i18n`, `npm run check:routes` and `npm run build`.

The optional `scripts/check-package-bookings.ts` exercises real PostgreSQL transactions against a disposable local app. It requires `PACKAGE_QA_BASE`, `PACKAGE_QA_DATABASE_URL` and `PACKAGE_QA_JWT_SECRET`. It refuses remote hosts or a database port other than 55439. **It drops and recreates the package tables in that local QA database**, applies the migration twice, and creates disposable fixture programs; never point it at an ordinary development database. Its fixtures live in `tests/fixtures/package-program.ts` and are never used by production startup.

The QA covers three-slot limits, admin authorization, draft visibility, publishing prerequisites, odd-group and multiple-single pricing, concurrent duplicate submissions, immutable line totals, stale checkout rejection and unpublishing. Browser QA covers desktop/mobile rendering, changing rooms, submitting a local booking, confirmation details and saving admin content.

## Information needed for the three real programs

For each program: title, preferred URL slug, short summary, days/nights, day-by-day itinerary, accommodation details, inclusions/exclusions, a main image, per-person EGP rates for all six group tiers, full-stay single-room supplement, and booking/payment/cancellation terms. Program text can be supplied naturally; it does not need to follow a JSON template.

Verified: full production build (including prerendering), TypeScript, translation and route checks, PostgreSQL/API QA against the production bundle, desktop/mobile browser QA and production package-page metadata/hydration. The three real program manifests are complete; the production migration, imports and publication remain deployment steps.

## Program two: Egypt Discovery

The operator supplied an 8-day / 7-night Egypt Discovery program. Its authored content is saved in `content/packages/egypt-discovery-8-days.json`, assigned to slot 2. It preserves the Cairo–Aswan–Nile cruise–Luxor–Cairo itinerary, stated accommodation, sightseeing and meals. Travel insurance is an additional exclusion requested by the operator.

The program remains a draft with the operator's booking terms recorded. Full-trip EGP rates per traveler are 76,955 / 65,915 / 60,548 / 58,262 / 58,179 / 56,784 for groups of 2 / 4 / 6 / 8 / 10 / 12. The full-stay single-room supplement is EGP 16,390 per single room. Hotel/cruise categories and a departure airport transfer on Day 8 were not specified and have not been added. The operator subsequently expanded meal coverage to include all meals from arrival dinner through departure breakfast. The existing Giza image is a representative cover asset.

After applying the package migration, import it with the intended database environment:

```
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-8-days.json
```

The importer creates draft content in an empty slot and skips a program that was already imported, preserving any subsequent admin edits and prices. It refuses to replace a different real program. A disposable `qa-package-2` placeholder can be replaced only in a local database. Imports never publish a program.

## Meal policy for every program

All ready-made programs include dinner on arrival day, breakfast/lunch/dinner on each full intervening day, and breakfast on departure day. The “Open your wallet once” messaging appears on the homepage section, package catalog and detail pages. Package cards also state the meal boundary explicitly. This policy applies to ready-made programs, while the custom planner retains its separately selected add-ons.

The shared normalizer in `shared/package-meals.ts` updates program inclusions, overview copy and daily meal notes. Admin saves and program imports apply it automatically, so future programs use the same policy. Current local program definitions and the authored Egypt Discovery JSON have been amended; existing frozen booking snapshots are preserved. Travel insurance remains excluded.

## Program three: Egypt Discovery with Red Sea Escape

`content/packages/egypt-discovery-11-days.json` contains the operator's 11-day / 10-night private guided program, assigned to slot 3. It includes Cairo, the Cairo–Aswan sleeper train, Aswan sightseeing and sunset felucca sailing, Abu Simbel, three nights on the Nile cruise, Luxor's West Bank, Hurghada, return to Cairo and the Day 10 Nile dinner cruise. Arrival and departure airport transfers are included as specified in this program.

The accommodation is four Cairo hotel nights, one Aswan hotel night, three Nile cruise nights, one Hurghada hotel night and one sleeper-train night. The common meal policy applies: arrival dinner, three meals on every full intervening day, and departure breakfast. Travel insurance remains excluded, together with the source program's flights/visa, drinks/personal expenses, tips and optional excursions. Hotel and cruise categories have not been invented.

The program remains a draft with the operator's booking terms recorded. Full-trip EGP rates per traveler are 85,699 / 77,400 / 71,900 / 70,200 / 69,780 / 68,165 for groups of 2 / 4 / 6 / 8 / 10 / 12. The full-stay single-room supplement is EGP 21,750 per single room. The Giza image is a representative existing cover asset. Import the draft using the same safe importer:

```
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-11-days.json
```

## Program one: Cairo, Pyramids and Luxor

`content/packages/egypt-discovery-cairo-luxor-6-days.json` contains the operator's six-day / five-night Cairo-Luxor-Cairo program, assigned to slot 1. It preserves Giza sightseeing, Islamic Cairo, overnight sleeping trains in both directions, Luxor's East Bank temples and West Bank monuments. The common meal policy applies, and travel insurance is an additional exclusion requested by the operator.

The source does not specify all accommodation inclusions or hotel categories, so these have not been invented. The draft includes the operator's booking terms and uses the existing Giza cover image. Full-trip EGP rates per traveler are 51,000 / 44,700 / 44,000 / 43,500 / 42,950 / 39,900 for groups of 2 / 4 / 6 / 8 / 10 / 12. The full-stay single-room supplement is EGP 12,600 per single room. Import it with:

```
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-cairo-luxor-6-days.json
```

## Current operator booking terms

All three authored programs and local drafts now use the latest cancellation schedule, replacing the earlier policies: 60+ days no charge; 59–30 days 25%; 29–15 days 50%; 14–7 days 75%; 6 days or fewer 100%, all as percentages of the total tour price. A 25% deposit is required on confirmation; balance is due 30 days before departure. Availability excludes 24 December–7 January inclusive. Force majeure is handled with flexible individual review for government restrictions, airline disruptions, official do-not-travel warnings, war and civil unrest. Date changes are available subject to availability, with possible administration fees depending on the booked travel period. No fixed force-majeure refund or fee amount has been invented. Bookings now reject any tour dates overlapping the holiday exclusion. All three programs are published in the isolated local preview; authored import manifests remain drafts for safe production import.

Children's terms: under 2 free, 2–under 6 at 25%, 6–under 12 at 50%, 12+ full adult price. Maximum one child sharing parents' room; additional airfare charges may apply if included. Family quotes require confirmation because the existing calculator uses adult rates and has no age/child room-allocation fields.

## Release checklist

Before starting the new server against production, apply the additive migration using the intended database connection:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0008_ready_made_packages.sql
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-cairo-luxor-6-days.json
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-8-days.json
npx tsx scripts/import-package-program.ts content/packages/egypt-discovery-11-days.json
```

Use the application's existing database environment for the imports (including its PGSSL setting). Imports create drafts; existing same-slug programs are preserved rather than overwritten. Review and publish all three in `/admin/packages` to show them in the homepage section that replaces the former inclusions comparison. The isolated local preview is already published; this does not publish the production database. Verify the three images, detailed pages, prices and booking terms after deployment. Existing bookings retain frozen snapshots.
