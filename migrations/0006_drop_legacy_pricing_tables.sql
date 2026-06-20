-- 0006_drop_legacy_pricing_tables.sql
--
-- Drops the dead pricing tables that were superseded when route pricing was
-- collapsed onto routes.vehicle_prices and quote totals became the sum of
-- frozen line items. See docs/PRICING_CLEANUP.md.
--
-- None of these are read by application code any longer (verified by grep over
-- server/, client/, shared/). At drop time, production row counts were:
--   pricing_tiers       0
--   seasonal_modifiers  0
--   commission_rules    0
--   license_classes     2  (Normal, Tourism)
-- All four were backed up to backups/pricing-tables-backup-2026-06-20.sql first.
--
-- Idempotent (IF EXISTS) and safe to re-run. Drop order matters: pricing_tiers
-- holds the only foreign key into this set (-> license_classes), so it goes
-- first; the rest have no incoming dependencies.

DROP TABLE IF EXISTS pricing_tiers;
DROP TABLE IF EXISTS seasonal_modifiers;
DROP TABLE IF EXISTS commission_rules;
DROP TABLE IF EXISTS license_classes;
