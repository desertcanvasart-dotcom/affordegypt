// FULL catalog replace: wipe service_catalog and rebuild it from the per-city
// CSVs in a directory (one file per city; city comes from the FILENAME, since
// the route names don't contain the city).
//
//   DRY RUN : node scripts/replace-catalog-from-csvs.mjs <dir>
//             Parses every CSV, derives city/category/trip-type/slug/prices,
//             writes a full preview to backups/catalog-replace-preview.json,
//             prints per-city breakdowns + any flags. NO writes.
//
//   APPLY   : APPLY=1 STAMP=<tag> node scripts/replace-catalog-from-csvs.mjs <dir>
//             Backs up the ENTIRE current service_catalog to
//             backups/service_catalog-full-backup-<tag>.json, then in ONE
//             transaction: DELETE all rows + INSERT the rebuilt set. Verifies.
//
// Reads DATABASE_URL (loads .env then .env.production override) — points at
// live prod. No hard FK references service_catalog, and bookings/quotes freeze
// their line items, so existing bookings are unaffected (only new quotes use
// the new catalog). Slugs/IDs change.

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

dotenv.config();
dotenv.config({ path: ".env.production", override: true });

const VEHICLES = ["sedan", "minivan", "van"];
const BACKUP_DIR = "backups";

const dir = process.argv[2];
if (!dir) { console.error("Usage: node scripts/replace-catalog-from-csvs.mjs <dir>   (APPLY=1 to write)"); process.exit(1); }
const apply = process.env.APPLY === "1";

// Known Egyptian cities/destinations for intercity detection.
const CITIES = ["Cairo","Giza","Alexandria","Luxor","Aswan","Hurghada","Safaga","El-Quseir","Quseir","Marsa Alam","Marsa Matruh","Matrouh","Sharm","Dahab","Taba","Nuweiba","Abu Simbel","Siwa","Sohag","Asyut","El-Minya","Minya","Port Said","Fayoum"," Smailia","Ain Sokhna"];

function cityFromFilename(file) {
  let base = file.replace(/\.csv$/i, "");
  base = base.replace(/[\s\-]+$/g, "").trim();        // strip trailing " - ", spaces
  base = base.replace(/\s+/g, " ").trim();
  // Title-case each word
  return base.split(" ").map((w) => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w).join(" ");
}

function parseCsvLine(line) {
  const cells = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') q = !q;
    else if (c === "," && !q) { cells.push(cur); cur = ""; }
    else cur += c;
  }
  cells.push(cur);
  return cells;
}

function parseFile(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const out = [];
  for (const line of lines.slice(2)) {           // row1 header, row2 notes
    if (!line.trim()) continue;
    const cells = parseCsvLine(line);
    const route = (cells[0] ?? "").replace(/^"|"$/g, "").trim();
    if (!route) continue;
    const num = (x) => { const n = Number(String(x ?? "").replace(/[, ]/g, "").trim()); return Number.isFinite(n) ? n : null; };
    out.push({ route, sedan: num(cells[1]), minivan: num(cells[2]), van: num(cells[3]) });
  }
  return out;
}

// Trip type — order matters. Returns {tripType, why}.
//
// "↔" in the operator's workbooks means a point-to-point transfer bookable in
// either direction — a ONE-WAY product (Airport ↔ Hotel, Station ↔ Hotel).
// It does NOT mean round trip; genuine round trips are written
// "Hotel → X → Hotel", "Same Day Return", "Over Day", etc. Excursion-shaped
// names (City Tour, Sea & Return, ... Trip) include the return leg by nature
// and stay round-trip regardless of the arrow used.
function deriveTripType(route) {
  const n = route.toLowerCase();
  const hr = n.match(/\(\s*(\d+)\s*hrs?\b/);
  if (hr) return { tripType: `${hr[1]}hr`, why: `(${hr[1]} hrs)` };
  if (/next day return|overnight|over\s*night/.test(n)) return { tripType: "round_trip_multi_day", why: "overnight/next-day" };
  if (/same day return|\(\s*same day\s*\)/.test(n)) return { tripType: "round_trip_same_day", why: "same-day-return" };
  if (/over\s*day/.test(n)) return { tripType: "round_trip_same_day", why: "over-day" };
  if (/city tour|&\s*return|\btrip\b|sound\s*&?\s*(and\s*)?light|sharm el-luli/.test(n)) return { tripType: "round_trip_same_day", why: "excursion" };
  if (/→\s*(hotels?|airport)\b\s*(\(|$|→)/i.test(route)) return { tripType: "round_trip_same_day", why: "returns to origin" };
  if (route.includes("↔")) return { tripType: "one_way", why: "↔ = either direction" };
  if (route.includes("→")) return { tripType: "one_way", why: "→" };
  return { tripType: "one_way", why: "default" };
}

function deriveCategory(route, city) {
  const n = route.toLowerCase();
  if (/airport/.test(n)) return "airport_transfer";
  if (/sound\s*&?\s*(and)?\s*light/.test(n)) return "sound_light_show";
  if (/dinner|cruise|evening/.test(n)) return "dinner_transfer";
  if (/local transfer|city transfer/.test(n)) return "local_transfer";
  const cl = city.toLowerCase();
  for (const other of CITIES) {
    const o = other.toLowerCase().trim();
    if (!o || o === cl) continue;
    if (cl.includes(o) || o.includes(cl)) continue; // same city variants
    if (n.includes(o)) return "intercity_transfer";
  }
  return "tour_transfer";
}

function deriveSlug(route) {
  return route.toLowerCase()
    .replace(/↔/g, "-").replace(/→/g, "-")
    .replace(/\+/g, " and ").replace(/&/g, " and ")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const TRIP_PARENS = [/^\d+\s*hrs?\b/i, /full day/i, /same day/i, /over\s*day/i, /overnight/i, /next day/i, /with visits?/i];
function derivePickupZone(route, city) {
  const m = route.match(/\(([^)]+)\)/);
  if (m) { const inner = m[1].trim(); if (!TRIP_PARENS.some((re) => re.test(inner))) return inner; }
  return `${city} Center`;
}

// ---- build the rebuilt set --------------------------------------------
const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".csv") && !f.startsWith("~"));
const rows = [];
const slugSeen = new Map();
const flags = [];
for (const file of files.sort()) {
  const city = cityFromFilename(file);
  const parsed = parseFile(path.join(dir, file));
  for (const p of parsed) {
    const { tripType, why } = deriveTripType(p.route);
    const category = deriveCategory(p.route, city);
    let slug = `${deriveSlug(city)}-${deriveSlug(p.route)}`;
    if (slugSeen.has(slug)) { const k = (slugSeen.get(slug) || 1) + 1; slugSeen.set(slug, k); slug = `${slug}-${k}`; flags.push(`dup slug -> ${slug} (${city}: ${p.route})`); }
    else slugSeen.set(slug, 1);
    const vehiclePrices = {};
    for (const v of VEHICLES) if (p[v] != null) vehiclePrices[`${v}_${tripType}`] = p[v];
    if (Object.keys(vehiclePrices).length === 0) flags.push(`NO PRICES (${city}: ${p.route})`);
    rows.push({ slug, name: p.route, city, category, pickupZone: derivePickupZone(p.route, city), tripType, why, vehiclePrices });
  }
}

// ---- preview -----------------------------------------------------------
fs.mkdirSync(BACKUP_DIR, { recursive: true });
fs.writeFileSync(path.join(BACKUP_DIR, "catalog-replace-preview.json"), JSON.stringify(rows, null, 2));

const byCity = {};
for (const r of rows) {
  byCity[r.city] ??= { n: 0, trip: {}, cat: {} };
  byCity[r.city].n++;
  byCity[r.city].trip[r.tripType] = (byCity[r.city].trip[r.tripType] || 0) + 1;
  byCity[r.city].cat[r.category] = (byCity[r.city].cat[r.category] || 0) + 1;
}
console.log(`\nParsed ${files.length} files -> ${rows.length} rows\n`);
for (const [city, s] of Object.entries(byCity)) {
  console.log(`${city}: ${s.n} rows`);
  console.log(`   trip: ${Object.entries(s.trip).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`   cat : ${Object.entries(s.cat).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}
if (flags.length) { console.log(`\nFLAGS (${flags.length}):`); for (const f of flags) console.log("  - " + f); }
else console.log("\nNo flags.");
console.log(`\nFull preview -> ${path.join(BACKUP_DIR, "catalog-replace-preview.json")}`);

if (!apply) {
  console.log("\nDRY RUN — no writes. Review, then run APPLY=1 STAMP=<tag> to wipe+rebuild.");
  process.exit(0);
}

// ---- APPLY: backup + transactional wipe & rebuild ----------------------
const stamp = process.env.STAMP || "manual";
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const backup = await c.query("select * from service_catalog order by id");
const backupPath = path.join(BACKUP_DIR, `service_catalog-full-backup-${stamp}.json`);
fs.writeFileSync(backupPath, JSON.stringify(backup.rows, null, 2));
console.log(`\nBacked up ${backup.rows.length} current rows -> ${backupPath}`);

try {
  await c.query("BEGIN");
  const del = await c.query("DELETE FROM service_catalog");
  let ins = 0;
  for (const r of rows) {
    await c.query(
      `INSERT INTO service_catalog (slug, name, city, category, pickup_zone, vehicle_prices, name_translations, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true,0)`,
      [r.slug, r.name, r.city, r.category, r.pickupZone, JSON.stringify(r.vehiclePrices), JSON.stringify({ en: r.name })],
    );
    ins++;
  }
  await c.query("COMMIT");
  console.log(`Deleted ${del.rowCount}, inserted ${ins}. Committed.`);
} catch (e) {
  await c.query("ROLLBACK");
  console.error("FAILED — rolled back. No changes made.", e.message);
  await c.end();
  process.exit(2);
}

const after = await c.query("select city, count(*)::int n from service_catalog group by city order by n desc");
console.log("Post-wipe city counts:", JSON.stringify(after.rows));
await c.end();
