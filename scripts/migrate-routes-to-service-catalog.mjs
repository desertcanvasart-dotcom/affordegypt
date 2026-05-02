// One-shot migration: copy each row from `routes` into `service_catalog`.
//
// See docs/SERVICES_ARCHITECTURE.md §3 for the design. Summary:
//   - Read every routes row.
//   - Derive a service_catalog row with slug, name, city, category,
//     vehicle_prices (verbatim — already in flat-key shape after bfde4a6),
//     and a few defaults.
//   - Idempotent: skip if a service_catalog row already exists with
//     the derived slug. Slug collisions are LOGGED, not auto-suffixed —
//     manual resolution required (per the doc's recommendation).
//   - The routes row is NOT deleted. Routes table stays alive during
//     the Phase A → E transition.
//
// Run order on prod:
//   node scripts/migrate-routes-to-service-catalog.mjs
//
// Run twice to confirm idempotency before considering it done.

import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

// --- helpers ----------------------------------------------------------

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isAirportName = (s) => typeof s === "string" && /airport/i.test(s);

const deriveCategory = (route) => {
  if (isAirportName(route.from_location) || isAirportName(route.to_location)) {
    return "airport_transfer";
  }
  if (route.route_category === "inter_city") return "intercity_transfer";
  if (["day_trip", "multi_day", "overnight"].includes(route.trip_mode)) {
    return "sightseeing_tour";
  }
  return "airport_transfer"; // defensive default per doc §3
};

const deriveSlug = (route, cityNameById) => {
  const fromBit =
    route.from_location || cityNameById.get(route.from_city_id) || `city-${route.from_city_id ?? "x"}`;
  const toBit =
    route.to_location || cityNameById.get(route.to_city_id) || `city-${route.to_city_id ?? "x"}`;
  const tripBit = route.trip_mode && route.trip_mode !== "transfer" ? `-${route.trip_mode}` : "";
  const base = `${slugify(fromBit)}-to-${slugify(toBit)}${tripBit}`;
  return base.replace(/--+/g, "-");
};

const deriveName = (route, cityNameById) => {
  const fromBit = route.from_location || cityNameById.get(route.from_city_id) || `City ${route.from_city_id ?? "?"}`;
  const toBit = route.to_location || cityNameById.get(route.to_city_id) || `City ${route.to_city_id ?? "?"}`;
  return `${fromBit} → ${toBit}`;
};

const deriveCity = (route, cityNameById) => {
  // Intra-city: use cityId. Inter-city: use departure city.
  const id = route.city_id ?? route.from_city_id;
  return cityNameById.get(id) ?? null;
};

const deriveDurationHours = (route) => {
  // routes.estimatedDuration is free text ("45 min", "5 hours"). Only
  // pull a number if it parses to a clean integer hour count. Otherwise
  // leave null — admin will fill in if it's actually a time-block product.
  const raw = route.estimated_duration;
  if (typeof raw !== "string") return null;
  const m = raw.match(/^(\d+)\s*h(our)?s?$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// --- main -------------------------------------------------------------

let migrated = 0;
let skippedExists = 0;
let skippedCollision = 0;
let errored = 0;

try {
  // Pre-load city names for slug/name derivation.
  const { rows: cityRows } = await pool.query("SELECT id, name FROM cities");
  const cityNameById = new Map(cityRows.map((c) => [c.id, c.name]));

  const { rows: routes } = await pool.query("SELECT * FROM routes ORDER BY id");
  console.log(`Inspecting ${routes.length} route(s).`);

  // Pre-load existing service_catalog slugs so we can detect collisions
  // without round-tripping per row. Refreshed after each successful
  // insert so a same-batch collision is also caught.
  const { rows: existingRows } = await pool.query("SELECT slug FROM service_catalog");
  const existingSlugs = new Set(existingRows.map((r) => r.slug));

  for (const route of routes) {
    const city = deriveCity(route, cityNameById);
    if (!city) {
      console.warn(`route ${route.id}: cannot resolve city (city_id=${route.city_id}, from_city_id=${route.from_city_id}) — error`);
      errored += 1;
      continue;
    }

    const slug = deriveSlug(route, cityNameById);
    if (!slug || slug === "to") {
      console.warn(`route ${route.id}: derived empty slug — error`);
      errored += 1;
      continue;
    }

    if (existingSlugs.has(slug)) {
      // Two distinct cases: (a) we already migrated this route on a prior
      // run — that's idempotent, count as exists; (b) two different routes
      // would derive to the same slug — that's a real collision needing
      // manual resolution. Disambiguate by checking whether the existing
      // service_catalog row has the same name we'd derive.
      const expectedName = deriveName(route, cityNameById);
      const { rows: matching } = await pool.query(
        "SELECT id, name FROM service_catalog WHERE slug = $1",
        [slug],
      );
      const existing = matching[0];
      if (existing && existing.name === expectedName) {
        console.log(`route ${route.id}: already migrated as service_catalog.${existing.id} "${slug}" — skip`);
        skippedExists += 1;
      } else {
        console.warn(
          `route ${route.id}: slug collision — "${slug}" already exists with different name (${existing?.name ?? "?"} vs would-be "${expectedName}"). Skipping; resolve manually.`,
        );
        skippedCollision += 1;
      }
      continue;
    }

    const category = deriveCategory(route);
    const name = deriveName(route, cityNameById);
    const description = route.route_highlights || null;
    const durationHours = deriveDurationHours(route);
    const vehiclePrices = route.vehicle_prices ?? {};
    const sortOrder = route.display_order ?? 0;

    try {
      const { rows: inserted } = await pool.query(
        `INSERT INTO service_catalog
           (slug, name, city, category, description,
            vehicle_prices, duration_hours, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, TRUE)
         RETURNING id`,
        [
          slug,
          name,
          city,
          category,
          description,
          JSON.stringify(vehiclePrices),
          durationHours,
          sortOrder,
        ],
      );
      const newId = inserted[0].id;
      existingSlugs.add(slug);
      const priceKeyCount = Object.keys(vehiclePrices).length;
      console.log(
        `route ${route.id} → service_catalog.${newId}  slug="${slug}"  city="${city}"  category=${category}  prices=${priceKeyCount}`,
      );
      migrated += 1;
    } catch (err) {
      console.error(`route ${route.id}: INSERT failed — ${err.message}`);
      errored += 1;
    }
  }

  console.log("\n--- summary ---");
  console.log(`routes inspected:           ${routes.length}`);
  console.log(`migrated:                   ${migrated}`);
  console.log(`skipped (already migrated): ${skippedExists}`);
  console.log(`skipped (slug collision):   ${skippedCollision}`);
  console.log(`errored:                    ${errored}`);
  if (errored > 0 || skippedCollision > 0) process.exitCode = 1;
} finally {
  await pool.end();
}
