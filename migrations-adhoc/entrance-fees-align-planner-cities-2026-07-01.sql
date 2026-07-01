-- Align entrance_fees.city with the customer planner's day-cities so
-- high-value sites actually surface. The planner matches
-- entrance_fees.city == <day city name> (lowercased), and it has no
-- "Giza" city (Giza sites are planned from Cairo) and uses spaced
-- "sharm el sheikh".
--
-- Slugs are intentionally left unchanged (write-once identifiers).
-- Only the mutable `city` filter column is updated.
--
-- Reversal:
--   UPDATE entrance_fees SET city='giza' WHERE slug LIKE 'giza-%';
--   UPDATE entrance_fees SET city='sharm-el-sheikh'
--     WHERE slug='sharm-el-sheikh-sharm-el-sheikh-museum';

BEGIN;

-- Giza → Cairo (Giza plateau, Saqqara, Dahshur, GEM, Memphis): 5 rows
UPDATE entrance_fees SET city = 'cairo', updated_at = now() WHERE city = 'giza';

-- sharm-el-sheikh → sharm el sheikh (Sharm El Sheikh Museum): 1 row
UPDATE entrance_fees SET city = 'sharm el sheikh', updated_at = now() WHERE city = 'sharm-el-sheikh';

COMMIT;
