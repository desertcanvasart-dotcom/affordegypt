# Pricing cleanup — later phase

> **Status — 2026-06-20: DONE (tables) / DEFERRED (column).**
> Dropped `pricing_tiers`, `license_classes`, `seasonal_modifiers`, and
> `commission_rules` via `migrations/0006_drop_legacy_pricing_tables.sql`
> (applied to production; the four tables were backed up to
> `backups/pricing-tables-backup-2026-06-20.sql` first — all empty except
> `license_classes`, which held 2 rows). Schema defs, types, insert-schemas,
> the dead `GET /api/license-classes` endpoint, its storage CRUD, and the
> license dimension in the legacy `seedData()` were removed. The build-time
> `scripts/generate-pricing-snapshot.mjs` was repointed from `pricing_tiers`
> to `routes.vehicle_prices`. Deleted obsolete scripts: `seed-pricing-tiers`,
> `inspect-pricing`, `verify-phase1`, `test-quote-immutability`,
> `test-admin-tier-sync`.
>
> **Still deferred:** the `routes.base_price_by_vehicle` column. It is still
> read by live routed pages (`/routes`, `/route-booking`, `/admin`,
> `/admin/routes/city/...`), so dropping it is blocked on migrating those
> pages onto `vehicle_prices` (HANDOFF.md §3 #1). Note: on the production DB
> the `routes` table itself is now empty — pricing lives in `service_catalog`.


This phase collapsed all route pricing onto a single read path:
`routes.vehicle_prices` JSONB, slug-keyed (`sedan` / `minivan` / `van`).
Pure lookup, no math, no multipliers. If a slug isn't set, the vehicle
option is unavailable for that route.

The following tables and columns are now **dead code on the route price
path** but were left in place to keep the blast radius small. Drop them
in a follow-up phase once nothing else reads them.

## Tables to drop

- `pricing_tiers` — effective-dated per-(route, vehicle, license) base prices.
  Was the primary read path before this phase. No longer read by
  `PricingService.getRoutePrice`.
- `license_classes` — Normal vs Tourism with a `surcharge_pct`. The surcharge
  was applied during `syncRouteTiers`. The whole license-class distinction
  was killed — every route now has one price per vehicle slug, full stop.
- `seasonal_modifiers` — date-range multipliers (e.g. peak season ×1.2). No
  longer applied. Pricing is now whatever the admin types in.
- `commission_rules` — booking-subtotal-keyed markup. Killed in this phase;
  quote total is now exactly the sum of line items.

## Column to drop

- `routes.base_price_by_vehicle` — legacy numeric-keyed JSONB
  (`{ "1": { "1": "4800" } }`). Superseded by `routes.vehicle_prices`.
  Frontend and backend now read only `vehicle_prices`.

## Code to delete after the tables go

- `PricingService.syncRouteTiers` — already removed.
- `PricingService.getSeasonalMultiplier` — already removed.
- `PricingService.getCommissionPct` — already removed.
- The `pricingTiers`, `licenseClasses`, `seasonalModifiers`, `commissionRules`
  table definitions in `shared/schema.ts`.
- Migrations `0001_colorful_psynapse.sql` (added pricing_tiers etc.) — leave
  the migration files but write a new migration that drops the tables.

## Verification before dropping

```sh
# Confirm nothing still reads these tables:
grep -rn "pricing_tiers\|pricingTiers\|license_classes\|licenseClasses\|seasonal_modifiers\|seasonalModifiers\|commission_rules\|commissionRules" server/ client/ shared/ scripts/
```

Should return no hits in the route price path. Some scripts in `scripts/`
(e.g. `seed-pricing-tiers.mjs`, `inspect-pricing.mjs`) still reference
`pricing_tiers` — delete those too in the same phase.
