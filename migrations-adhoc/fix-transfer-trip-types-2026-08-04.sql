-- Fix the ↔ trip-type mislabeling from the 2026-06-28 catalog rebuild.
--
-- "↔" in the operator's workbooks means a point-to-point transfer bookable in
-- either direction — a ONE-WAY product. The June 28 importer stored those rows
-- as round_trip_same_day, so 28 airport/station/intercity transfers were sold
-- as "Round-trip (same day)" at one-way rates, with one-way unbookable.
-- Excursion-shaped ↔ rows (City Tour, Sea & Return, Abu Dabbab Trip, Sharm
-- El-Luli) genuinely include the return leg and are not touched.
--
-- Each UPDATE renames `${vehicle}_round_trip_same_day` keys to
-- `${vehicle}_one_way` — VALUES UNCHANGED. The final INSERT restores the
-- missing Cairo "Airport ↔ Hotel" product (source workbook row
-- "Cairo ↔ Airport / Station"; same rate as cairo-airport-station).
-- The guard `vehicle_prices ? 'sedan_round_trip_same_day'` makes each UPDATE
-- a no-op if the row was already migrated.
--
-- Equivalent to: APPLY=1 node scripts/fix-transfer-trip-types.mjs
-- (the script additionally writes a JSON backup of the 28 rows first).

BEGIN;

-- Airport ↔ High Dam Harbour (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":3895,"sedan_one_way":1125,"minivan_one_way":2135}'::jsonb
  WHERE slug = 'aswan-airport-high-dam-harbour' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Hotel (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":3010,"sedan_one_way":1475,"minivan_one_way":1750}'::jsonb
  WHERE slug = 'aswan-airport-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- High Dam ↔ Hotel (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":3525,"sedan_one_way":1775,"minivan_one_way":2085}'::jsonb
  WHERE slug = 'aswan-high-dam-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- North Docks ↔ Hotel (Aswan Bridge) (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":2080,"sedan_one_way":1065,"minivan_one_way":1340}'::jsonb
  WHERE slug = 'aswan-north-docks-hotel-aswan-bridge' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Philae ↔ Heiba Island Hotel (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":1905,"sedan_one_way":1145,"minivan_one_way":1355}'::jsonb
  WHERE slug = 'aswan-philae-heiba-island-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Station ↔ High Dam Harbour (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":4395,"sedan_one_way":1125,"minivan_one_way":2135}'::jsonb
  WHERE slug = 'aswan-station-high-dam-harbour' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Station ↔ Hotel (Aswan)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":1685,"sedan_one_way":915,"minivan_one_way":1105}'::jsonb
  WHERE slug = 'aswan-station-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Sphinx Airport ↔ Hotel (Cairo)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":4875,"sedan_one_way":2475,"minivan_one_way":3075}'::jsonb
  WHERE slug = 'cairo-sphinx-airport-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ El-Gouna (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":4285,"sedan_one_way":2795,"minivan_one_way":2960}'::jsonb
  WHERE slug = 'hurghada-airport-el-gouna' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ El-Quseir (to Acacia) (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":9120,"sedan_one_way":5855,"minivan_one_way":6395}'::jsonb
  WHERE slug = 'hurghada-airport-el-quseir-to-acacia' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Local Hotels (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":2250,"sedan_one_way":1130,"minivan_one_way":1345}'::jsonb
  WHERE slug = 'hurghada-airport-local-hotels' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Makadi (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":3095,"sedan_one_way":1520,"minivan_one_way":1720}'::jsonb
  WHERE slug = 'hurghada-airport-makadi' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Marsa Alam (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":12345,"sedan_one_way":8905,"minivan_one_way":9750}'::jsonb
  WHERE slug = 'hurghada-airport-marsa-alam' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Nefertari (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":5480,"sedan_one_way":3335,"minivan_one_way":3700}'::jsonb
  WHERE slug = 'hurghada-airport-nefertari' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Port Ghalib (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":9650,"sedan_one_way":6375,"minivan_one_way":7095}'::jsonb
  WHERE slug = 'hurghada-airport-port-ghalib' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Safaga (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":4940,"sedan_one_way":3420,"minivan_one_way":3625}'::jsonb
  WHERE slug = 'hurghada-airport-safaga' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Sahl Hashish (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":2910,"sedan_one_way":1420,"minivan_one_way":1585}'::jsonb
  WHERE slug = 'hurghada-airport-sahl-hashish' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Shams Alam (Hurghada)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":12295,"sedan_one_way":8715,"minivan_one_way":9650}'::jsonb
  WHERE slug = 'hurghada-airport-shams-alam' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ El-Modira (Luxor)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":3960,"sedan_one_way":2135,"minivan_one_way":2685}'::jsonb
  WHERE slug = 'luxor-airport-el-madira' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Hotel (Luxor)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":2135,"sedan_one_way":1115,"minivan_one_way":1340}'::jsonb
  WHERE slug = 'luxor-airport-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Hotel (South City) (Luxor)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":2770,"sedan_one_way":1510,"minivan_one_way":1820}'::jsonb
  WHERE slug = 'luxor-airport-hotel-south-city' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Station ↔ Hotel (Luxor)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":1265,"sedan_one_way":870,"minivan_one_way":1025}'::jsonb
  WHERE slug = 'luxor-station-hotel' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Station ↔ Hotel (South City) (Luxor)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":1510,"sedan_one_way":935,"minivan_one_way":1265}'::jsonb
  WHERE slug = 'luxor-station-hotel-south-city' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ North Hotels (Marsa Alam)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":6545,"sedan_one_way":3275,"minivan_one_way":3720}'::jsonb
  WHERE slug = 'marsa-alam-airport-north-hotels' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ Shams Alam Hotels (Marsa Alam)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":8965,"sedan_one_way":4640,"minivan_one_way":5280}'::jsonb
  WHERE slug = 'marsa-alam-airport-shams-alam-hotels' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Airport ↔ South Hotels (Marsa Alam)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":7660,"sedan_one_way":3675,"minivan_one_way":4125}'::jsonb
  WHERE slug = 'marsa-alam-airport-south-hotels' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- North Hotels ↔ Hurghada (Marsa Alam)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":9910,"sedan_one_way":4900,"minivan_one_way":5425}'::jsonb
  WHERE slug = 'marsa-alam-north-hotels-hurghada' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- South Hotels ↔ Hurghada (Marsa Alam)
UPDATE service_catalog SET vehicle_prices = '{"van_one_way":11515,"sedan_one_way":5250,"minivan_one_way":5795}'::jsonb
  WHERE slug = 'marsa-alam-south-hotels-hurghada' AND vehicle_prices ? 'sedan_round_trip_same_day';

-- Restore Cairo Airport ↔ Hotel (one-way, sedan/minivan/van)
INSERT INTO service_catalog (slug, name, city, category, pickup_zone, vehicle_prices, name_translations, is_active, sort_order)
SELECT 'cairo-airport-hotel', 'Airport ↔ Hotel', 'Cairo', 'airport_transfer', 'Cairo Center',
       '{"sedan_one_way":2025,"minivan_one_way":2475,"van_one_way":3675}'::jsonb,
       '{"en":"Airport ↔ Hotel"}'::jsonb, true, 0
WHERE NOT EXISTS (SELECT 1 FROM service_catalog WHERE slug = 'cairo-airport-hotel');

COMMIT;

-- Verify: expect 0 rows
-- SELECT slug FROM service_catalog
--  WHERE slug IN ('aswan-airport-high-dam-harbour','aswan-airport-hotel','aswan-high-dam-hotel','aswan-north-docks-hotel-aswan-bridge','aswan-philae-heiba-island-hotel','aswan-station-high-dam-harbour','aswan-station-hotel','cairo-sphinx-airport-hotel','hurghada-airport-el-gouna','hurghada-airport-el-quseir-to-acacia','hurghada-airport-local-hotels','hurghada-airport-makadi','hurghada-airport-marsa-alam','hurghada-airport-nefertari','hurghada-airport-port-ghalib','hurghada-airport-safaga','hurghada-airport-sahl-hashish','hurghada-airport-shams-alam','luxor-airport-el-madira','luxor-airport-hotel','luxor-airport-hotel-south-city','luxor-station-hotel','luxor-station-hotel-south-city','marsa-alam-airport-north-hotels','marsa-alam-airport-shams-alam-hotels','marsa-alam-airport-south-hotels','marsa-alam-north-hotels-hurghada','marsa-alam-south-hotels-hurghada')
--    AND vehicle_prices ? 'sedan_round_trip_same_day';
