-- Phase 1.5 — add `local_transfer` service category.
--
-- Sort order 25 places it between `intercity_transfer` (20) and
-- `sightseeing_tour` (30) without colliding with existing seeds:
-- airport_transfer=10, intercity_transfer=20, sightseeing_tour=30,
-- dinner_transfer=40, sound_light_show=50.
--
-- Idempotent: ON CONFLICT (slug) DO NOTHING.

INSERT INTO service_categories (slug, name, sort_order, is_active)
VALUES ('local_transfer', 'Local transfer', 25, true)
ON CONFLICT (slug) DO NOTHING;
