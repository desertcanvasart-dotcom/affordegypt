-- Phase 1a: Add tables for immutable quotes + pricing source of truth.
-- All statements are idempotent so this can be run on any DB state.

-- New tables -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS "quote_line_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "quote_id" integer NOT NULL REFERENCES "quotes"("id"),
  "service_id" integer REFERENCES "services"("id"),
  "route_id" integer REFERENCES "routes"("id"),
  "kind" text NOT NULL,
  "description" text NOT NULL,
  "unit_price" numeric(10, 2) NOT NULL,
  "quantity" numeric(10, 2) NOT NULL DEFAULT '1',
  "line_total" numeric(10, 2) NOT NULL,
  "sort_order" integer DEFAULT 0,
  "meta" jsonb,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "pricing_tiers" (
  "id" serial PRIMARY KEY NOT NULL,
  "route_id" integer REFERENCES "routes"("id"),
  "vehicle_type_id" integer REFERENCES "vehicle_types"("id"),
  "license_class_id" integer REFERENCES "license_classes"("id"),
  "base_price" numeric(10, 2) NOT NULL,
  "effective_from" timestamp NOT NULL DEFAULT now(),
  "effective_to" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "seasonal_modifiers" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "multiplier" numeric(6, 4) NOT NULL,
  "applies_to" text NOT NULL DEFAULT 'all',
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "commission_rules" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "min_booking_value" numeric(10, 2),
  "max_booking_value" numeric(10, 2),
  "percentage" numeric(5, 4) NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- Quote immutability columns -------------------------------------------

ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1;
ALTER TABLE "quotes" ADD COLUMN IF NOT EXISTS "frozen_at" timestamp;

-- Indexes (all idempotent via IF NOT EXISTS) ---------------------------

CREATE INDEX IF NOT EXISTS "idx_quote_line_items_quote" ON "quote_line_items" ("quote_id");
CREATE INDEX IF NOT EXISTS "idx_quote_line_items_service" ON "quote_line_items" ("service_id");
CREATE INDEX IF NOT EXISTS "idx_quote_line_items_route" ON "quote_line_items" ("route_id");

CREATE INDEX IF NOT EXISTS "idx_pricing_tiers_route" ON "pricing_tiers" ("route_id");
CREATE INDEX IF NOT EXISTS "idx_pricing_tiers_vehicle" ON "pricing_tiers" ("vehicle_type_id");
CREATE INDEX IF NOT EXISTS "idx_pricing_tiers_lookup" ON "pricing_tiers" ("route_id", "vehicle_type_id", "license_class_id");

CREATE INDEX IF NOT EXISTS "idx_seasonal_modifiers_active" ON "seasonal_modifiers" ("is_active", "start_date", "end_date");

CREATE INDEX IF NOT EXISTS "idx_password_reset_user" ON "password_reset_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_email_verification_user" ON "email_verification_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_routes_from_city" ON "routes" ("from_city_id");
CREATE INDEX IF NOT EXISTS "idx_routes_to_city" ON "routes" ("to_city_id");
CREATE INDEX IF NOT EXISTS "idx_routes_city" ON "routes" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_time_blocks_city" ON "time_blocks" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_guide_rates_city" ON "guide_rates" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_add_ons_city" ON "add_ons" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_attractions_city" ON "attractions" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_services_city" ON "services" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_services_type" ON "services" ("type");
CREATE INDEX IF NOT EXISTS "idx_bookings_user" ON "bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_quote" ON "bookings" ("quote_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_email" ON "bookings" ("customer_email");
CREATE UNIQUE INDEX IF NOT EXISTS "uq_bookings_reference" ON "bookings" ("booking_reference");
CREATE INDEX IF NOT EXISTS "idx_booking_days_booking" ON "booking_days" ("booking_id");
CREATE INDEX IF NOT EXISTS "idx_booking_days_city" ON "booking_days" ("city_id");
CREATE INDEX IF NOT EXISTS "idx_booking_services_day" ON "booking_services" ("booking_day_id");
CREATE INDEX IF NOT EXISTS "idx_booking_services_service" ON "booking_services" ("service_id");
CREATE INDEX IF NOT EXISTS "idx_booking_adjustments_booking" ON "booking_adjustments" ("booking_id");
