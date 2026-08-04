// Fix the ↔ trip-type mislabeling from the 2026-06-28 catalog rebuild.
//
// In the operator's workbooks "↔" means a point-to-point transfer bookable in
// either direction — a ONE-WAY product. The importer's deriveTripType read it
// as "round_trip_same_day", so 28 airport/station/harbour/intercity rows are
// live labeled "Round-trip (same day)" at one-way prices. Excursion-shaped ↔
// rows (City Tour, Sea & Return, Abu Dabbab Trip, Sharm El-Luli) really do
// include the return leg and are NOT touched.
//
// This script, per slug in FLIP_SLUGS, renames every `${vehicle}_round_trip_same_day`
// key in service_catalog.vehicle_prices to `${vehicle}_one_way` (values
// unchanged), and inserts the missing Cairo "Airport ↔ Hotel" row (the source
// workbook's "Cairo ↔ Airport / Station" — same rate as the existing
// cairo-airport-station row, which an admin edit had narrowed to Station only).
//
//   DRY RUN : node scripts/fix-transfer-trip-types.mjs
//   APPLY   : APPLY=1 node scripts/fix-transfer-trip-types.mjs
//
// Reads DATABASE_URL (.env then .env.production override) — points at live
// prod. Backs up affected rows to backups/ before writing; all writes in one
// transaction. Frozen quotes/bookings are unaffected.

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

dotenv.config();
dotenv.config({ path: ".env.production", override: true });

const apply = process.env.APPLY === "1";
const VEHICLES = ["sedan", "minivan", "van"];
const BACKUP_DIR = "backups";

const FLIP_SLUGS = [
  "aswan-airport-high-dam-harbour",
  "aswan-airport-hotel",
  "aswan-high-dam-hotel",
  "aswan-north-docks-hotel-aswan-bridge",
  "aswan-philae-heiba-island-hotel",
  "aswan-station-high-dam-harbour",
  "aswan-station-hotel",
  "cairo-sphinx-airport-hotel",
  "hurghada-airport-el-gouna",
  "hurghada-airport-el-quseir-to-acacia",
  "hurghada-airport-local-hotels",
  "hurghada-airport-makadi",
  "hurghada-airport-marsa-alam",
  "hurghada-airport-nefertari",
  "hurghada-airport-port-ghalib",
  "hurghada-airport-safaga",
  "hurghada-airport-sahl-hashish",
  "hurghada-airport-shams-alam",
  "luxor-airport-el-madira",
  "luxor-airport-hotel",
  "luxor-airport-hotel-south-city",
  "luxor-station-hotel",
  "luxor-station-hotel-south-city",
  "marsa-alam-airport-north-hotels",
  "marsa-alam-airport-shams-alam-hotels",
  "marsa-alam-airport-south-hotels",
  "marsa-alam-north-hotels-hurghada",
  "marsa-alam-south-hotels-hurghada",
];

const NEW_ROW = {
  slug: "cairo-airport-hotel",
  name: "Airport ↔ Hotel",
  city: "Cairo",
  category: "airport_transfer",
  pickupZone: "Cairo Center",
  vehiclePrices: { sedan_one_way: 2025, minivan_one_way: 2475, van_one_way: 3675 },
};

const c = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const { rows: current } = await c.query(
  "SELECT id, slug, name, vehicle_prices FROM service_catalog WHERE slug = ANY($1) ORDER BY slug",
  [FLIP_SLUGS],
);

const missing = FLIP_SLUGS.filter((s) => !current.some((r) => r.slug === s));
if (missing.length) {
  console.error(`ABORT: ${missing.length} slug(s) not found in service_catalog: ${missing.join(", ")}`);
  await c.end();
  process.exit(2);
}

const updates = [];
const problems = [];
for (const row of current) {
  const prices = typeof row.vehicle_prices === "string" ? JSON.parse(row.vehicle_prices) : row.vehicle_prices ?? {};
  const next = {};
  let flipped = 0;
  for (const [key, value] of Object.entries(prices)) {
    const veh = VEHICLES.find((v) => key === `${v}_round_trip_same_day`);
    if (veh) {
      const target = `${veh}_one_way`;
      if (prices[target] !== undefined) { problems.push(`${row.slug}: both ${key} and ${target} set`); continue; }
      next[target] = value;
      flipped++;
    } else {
      next[key] = value;
    }
  }
  if (flipped === 0) problems.push(`${row.slug}: no round_trip_same_day keys to flip (already migrated?)`);
  updates.push({ id: row.id, slug: row.slug, name: row.name, before: prices, after: next });
}

const { rows: dupe } = await c.query("SELECT 1 FROM service_catalog WHERE slug = $1", [NEW_ROW.slug]);
const insertNeeded = dupe.length === 0;
if (!insertNeeded) problems.push(`${NEW_ROW.slug}: already exists — skipping insert`);

console.log(`\n${updates.length} rows to flip round_trip_same_day -> one_way:\n`);
for (const u of updates) console.log(`  ${u.slug}\n    before: ${JSON.stringify(u.before)}\n    after : ${JSON.stringify(u.after)}`);
console.log(`\nInsert ${NEW_ROW.slug}: ${insertNeeded ? JSON.stringify(NEW_ROW.vehiclePrices) : "SKIP (exists)"}`);
if (problems.length) { console.log(`\nPROBLEMS (${problems.length}):`); for (const p of problems) console.log("  - " + p); }

if (problems.some((p) => !p.endsWith("skipping insert"))) {
  console.error("\nABORT: unexpected state — resolve problems above before applying.");
  await c.end();
  process.exit(2);
}

if (!apply) {
  console.log("\nDRY RUN — no writes. Run APPLY=1 to migrate.");
  await c.end();
  process.exit(0);
}

fs.mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const backupPath = path.join(BACKUP_DIR, `trip-type-fix-backup-${stamp}.json`);
fs.writeFileSync(backupPath, JSON.stringify(current, null, 2));
console.log(`\nBacked up ${current.length} rows -> ${backupPath}`);

try {
  await c.query("BEGIN");
  for (const u of updates) {
    await c.query("UPDATE service_catalog SET vehicle_prices = $1 WHERE id = $2", [JSON.stringify(u.after), u.id]);
  }
  if (insertNeeded) {
    await c.query(
      `INSERT INTO service_catalog (slug, name, city, category, pickup_zone, vehicle_prices, name_translations, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)`,
      [NEW_ROW.slug, NEW_ROW.name, NEW_ROW.city, NEW_ROW.category, NEW_ROW.pickupZone,
       JSON.stringify(NEW_ROW.vehiclePrices), JSON.stringify({ en: NEW_ROW.name })],
    );
  }
  await c.query("COMMIT");
} catch (e) {
  await c.query("ROLLBACK");
  console.error("FAILED — rolled back. No changes made.", e.message);
  await c.end();
  process.exit(2);
}

// Verify
const { rows: after } = await c.query(
  "SELECT slug, vehicle_prices FROM service_catalog WHERE slug = ANY($1)",
  [[...FLIP_SLUGS, NEW_ROW.slug]],
);
let bad = 0;
for (const r of after) {
  const prices = typeof r.vehicle_prices === "string" ? JSON.parse(r.vehicle_prices) : r.vehicle_prices ?? {};
  if (Object.keys(prices).some((k) => k.endsWith("_round_trip_same_day"))) { bad++; console.error(`  VERIFY FAIL: ${r.slug} still has round_trip_same_day keys`); }
}
console.log(bad === 0
  ? `Applied: ${updates.length} rows flipped${insertNeeded ? `, ${NEW_ROW.slug} inserted` : ""}. Verified ${after.length} rows clean.`
  : `VERIFY FAILED on ${bad} row(s) — inspect immediately (backup at ${backupPath}).`);
await c.end();
process.exit(bad === 0 ? 0 : 1);
