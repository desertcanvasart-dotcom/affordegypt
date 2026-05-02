-- Phase 1.5 — Service Catalog (Phase A: schema + seed only).
--
-- Creates the new product-catalog model alongside the existing routes
-- table. Nothing in this migration reads, writes, or modifies routes.
-- See docs/SERVICES_ARCHITECTURE.md for the full design.
--
-- Naming: the new core table is `service_catalog` because the canonical
-- name `services` is taken by a legacy table referenced by FKs in
-- quote_line_items / booking_services. The rename to `services` happens
-- in Phase E when the legacy table is dropped. Keep `service_catalog`
-- consistent in code, types, URLs, and admin paths until then.
--
-- All statements are idempotent (IF NOT EXISTS / ON CONFLICT). Safe to
-- re-run on any DB state.

-- Trip-type vocabulary -------------------------------------------------

CREATE TABLE IF NOT EXISTS "trip_types" (
  "id"            serial PRIMARY KEY NOT NULL,
  "slug"          text NOT NULL UNIQUE,
  "name"          text NOT NULL,
  "description"   text,
  "is_active"     boolean NOT NULL DEFAULT TRUE,
  "sort_order"    integer NOT NULL DEFAULT 0,
  "created_at"    timestamptz NOT NULL DEFAULT now(),
  "updated_at"    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_trip_types_active" ON "trip_types" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_trip_types_sort"   ON "trip_types" ("sort_order");

-- Service category vocabulary ------------------------------------------

CREATE TABLE IF NOT EXISTS "service_categories" (
  "id"            serial PRIMARY KEY NOT NULL,
  "slug"          text NOT NULL UNIQUE,
  "name"          text NOT NULL,
  "description"   text,
  "is_active"     boolean NOT NULL DEFAULT TRUE,
  "sort_order"    integer NOT NULL DEFAULT 0,
  "created_at"    timestamptz NOT NULL DEFAULT now(),
  "updated_at"    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_service_categories_active" ON "service_categories" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_service_categories_sort"   ON "service_categories" ("sort_order");

-- Service catalog ------------------------------------------------------

CREATE TABLE IF NOT EXISTS "service_catalog" (
  "id"                       serial PRIMARY KEY NOT NULL,
  "slug"                     text NOT NULL UNIQUE,
  "name"                     text NOT NULL,
  "city"                     text NOT NULL,
  "category"                 text NOT NULL,
  "pickup_zone"              text,
  "description"              text,
  "included_stops"           jsonb,
  "vehicle_prices"           jsonb NOT NULL DEFAULT '{}'::jsonb,
  "duration_hours"           integer,
  "image_url"                text,
  "is_active"                boolean NOT NULL DEFAULT TRUE,
  "sort_order"               integer NOT NULL DEFAULT 0,
  "created_at"               timestamptz NOT NULL DEFAULT now(),
  "updated_at"               timestamptz NOT NULL DEFAULT now(),
  "name_translations"        jsonb,
  "description_translations" jsonb
);

CREATE INDEX IF NOT EXISTS "idx_service_catalog_city"          ON "service_catalog" ("city");
CREATE INDEX IF NOT EXISTS "idx_service_catalog_category"      ON "service_catalog" ("category");
CREATE INDEX IF NOT EXISTS "idx_service_catalog_city_category" ON "service_catalog" ("city", "category");
CREATE INDEX IF NOT EXISTS "idx_service_catalog_active"        ON "service_catalog" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_service_catalog_sort"          ON "service_catalog" ("sort_order");

-- Seed: trip types -----------------------------------------------------
-- Slugs are write-once. Re-running is a no-op.

INSERT INTO "trip_types" ("slug", "name", "sort_order") VALUES
  ('one_way',                'One-way',                  10),
  ('round_trip_same_day',    'Round-trip (same day)',    20),
  ('round_trip_multi_day',   'Round-trip (multi-day)',   30),
  ('4hr',                    '4-hour rental',            100),
  ('8hr',                    '8-hour rental',            110),
  ('12hr',                   '12-hour rental',           120)
ON CONFLICT ("slug") DO NOTHING;

-- Seed: service categories --------------------------------------------

INSERT INTO "service_categories" ("slug", "name", "sort_order") VALUES
  ('airport_transfer',   'Airport transfer',     10),
  ('intercity_transfer', 'Intercity transfer',   20),
  ('sightseeing_tour',   'Sightseeing tour',     30),
  ('dinner_transfer',    'Dinner transfer',      40),
  ('sound_light_show',   'Sound & light show',   50)
ON CONFLICT ("slug") DO NOTHING;
