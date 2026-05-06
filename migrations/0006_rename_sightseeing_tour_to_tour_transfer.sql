-- Rename the `sightseeing_tour` service category to `tour_transfer`.
--
-- The category was originally framed as an attraction-style listing, but
-- operationally these rows behave like transfers (priced per vehicle +
-- trip type, booked the same way as airport / intercity / local
-- transfers). Renaming aligns the slug with the data model and prepares
-- the planner for the upcoming column reshuffle, where tours sit in
-- the same column family as the other transfer types.
--
-- Two tables are affected:
--   - service_categories.slug  — the vocabulary row itself
--   - service_catalog.category — string FK by value (no DB constraint)
--
-- The category column has no foreign key, so a plain UPDATE works in
-- either order. We do both inside a single transaction for atomicity.
--
-- Idempotent: re-running is a no-op once the rename has applied.

BEGIN;

UPDATE service_categories
SET slug = 'tour_transfer',
    name = 'Tour transfer'
WHERE slug = 'sightseeing_tour';

UPDATE service_catalog
SET category = 'tour_transfer'
WHERE category = 'sightseeing_tour';

COMMIT;
