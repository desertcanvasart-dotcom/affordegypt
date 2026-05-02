// One-shot migration: reshape routes.vehicle_prices from the legacy
// per-vehicle shape ({ sedan: 600, minivan: 800, van: 1100 }) to the
// flat per-(vehicle × trip type) shape:
//
//   {
//     "sedan_one_way": 600,
//     "minivan_one_way": 800,
//     "van_one_way": 1100
//   }
//
// Bare slug keys (sedan / minivan / van) get rewritten as the matching
// `_one_way` key — that's the only trip type that ever existed under
// the legacy shape.
//
// Idempotency: if any key in vehicle_prices already contains an
// underscore, the row is considered already migrated and skipped. Safe
// to re-run after admin edits add new trip-type prices.
//
// Per-row log: {routeId, before, after, action}.
// Final summary: counts of migrated, skipped, empty, errored rows.
//
// Usage (local first; only run on prod after confirming the local diff):
//   node scripts/migrate-vehicle-prices-to-trip-types.mjs

import "dotenv/config";
import pg from "pg";

const KNOWN_SLUGS = new Set(["sedan", "minivan", "van"]);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const isAlreadyFlat = (vp) =>
  vp && typeof vp === "object" && Object.keys(vp).some((k) => k.includes("_"));

const migrateOne = (vp) => {
  if (!vp || typeof vp !== "object") return null;
  const out = {};
  for (const [k, v] of Object.entries(vp)) {
    if (!KNOWN_SLUGS.has(k)) {
      // Defensive: copy through any unknown-but-present key so we never
      // lose data. Shouldn't happen given the seed is sedan/minivan/van.
      out[k] = v;
      continue;
    }
    out[`${k}_one_way`] = v;
  }
  return out;
};

let migrated = 0;
let skipped = 0;
let empty = 0;
let errored = 0;

try {
  const { rows } = await pool.query(
    "SELECT id, vehicle_prices FROM routes ORDER BY id",
  );
  console.log(`Inspecting ${rows.length} route(s).`);

  for (const r of rows) {
    const vp = r.vehicle_prices;
    if (!vp || typeof vp !== "object" || Object.keys(vp).length === 0) {
      console.log(`route ${r.id}: empty/null vehicle_prices — skip`);
      empty += 1;
      continue;
    }
    if (isAlreadyFlat(vp)) {
      console.log(`route ${r.id}: already flat — skip   before=${JSON.stringify(vp)}`);
      skipped += 1;
      continue;
    }
    const next = migrateOne(vp);
    if (next === null) {
      console.log(`route ${r.id}: failed to compute next shape — error`);
      errored += 1;
      continue;
    }
    try {
      await pool.query(
        "UPDATE routes SET vehicle_prices = $1::jsonb WHERE id = $2",
        [JSON.stringify(next), r.id],
      );
      console.log(
        `route ${r.id}: migrated   before=${JSON.stringify(vp)}   after=${JSON.stringify(next)}`,
      );
      migrated += 1;
    } catch (err) {
      console.error(`route ${r.id}: UPDATE failed — ${err.message}`);
      errored += 1;
    }
  }

  console.log("\n--- summary ---");
  console.log(`migrated: ${migrated}`);
  console.log(`skipped (already flat): ${skipped}`);
  console.log(`empty (no prices set): ${empty}`);
  console.log(`errored: ${errored}`);
  if (errored > 0) process.exitCode = 1;
} finally {
  await pool.end();
}
