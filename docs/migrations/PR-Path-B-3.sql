-- PR-Path-B-3 — experiences table
--
-- Purpose: create the `experiences` table for self-contained packaged
-- products (felucca rides, camel rides, balloon rides, photography
-- sessions, packaged sound & light shows). Sibling to `service_catalog`
-- (transportation), `entrance_fees` (per-person tickets), and
-- `add_ons` (extras + meals).
--
-- This file is applied MANUALLY against production. We do not use
-- migration files in this project — schema drift accumulated in
-- `migrations/` made `db:push` unsafe (see PR-Path-B-2). Apply with:
--
--   railway connect Postgres
--   \i docs/migrations/PR-Path-B-3.sql
--
-- After this DDL is applied, run the data migration in:
--   scripts/migrate-experiences-from-addons.ts
-- which moves the two misclassified experience rows out of `add_ons`,
-- deletes the misrepresented Skip-the-Line Pyramids row, and leaves
-- the standalone meal row untouched.
--
-- Idempotent: re-running this file is a no-op.

CREATE TABLE IF NOT EXISTS experiences (
  id serial PRIMARY KEY NOT NULL,
  slug text NOT NULL,
  name_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  description_translations jsonb,
  city text NOT NULL,
  price numeric(10, 2) NOT NULL,
  unit_type text NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  CONSTRAINT experiences_slug_unique UNIQUE(slug)
);
