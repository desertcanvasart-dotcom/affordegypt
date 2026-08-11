// Build a one-shot transactional SQL file that wipes `entrance_fees` and
// reloads it from a CSV of published Ministry foreigner prices.
//
// Input CSV columns (egymonuments_foreigner_prices.csv shape):
//   name, city, foreign_adult_egp, foreign_student_egp, url, note
//
// Behavior:
//   - base_price       = foreign_adult_egp (parsed as integer EGP)
//   - markup_percent   = 10
//   - price_per_person = round(base_price * 1.10)
//   - currency         = EGP
//   - notes            = student price + url + source note, joined with " | "
//   - slug             = "{citySlug}-{slugify(name)}"
//   - Rows with non-numeric / empty foreign_adult_egp are skipped (logged).
//
// Output (no DB writes):
//   migrations-adhoc/entrance-fees-rewipe-2026-06-24.sql   wrapped in a single
//   transaction (BEGIN; TRUNCATE … RESTART IDENTITY; INSERT …; COMMIT;).
//
// Run with:
//   node scripts/import-entrance-fees-from-csv.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import csv from "csv-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CSV_PATH = path.join(REPO_ROOT, "data", "entrance-fees-import", "egymonuments_foreigner_prices.csv");
const OUT_DIR = path.join(REPO_ROOT, "migrations-adhoc");
const OUT_PATH = path.join(OUT_DIR, "entrance-fees-rewipe-2026-06-24.sql");
const MARKUP_PERCENT = 10;

// Map source-CSV city text → canonical entrance_fees.city slug.
// Anything not listed here falls through to slugify(city).
const CITY_MAP = {
  "Giza": "giza",
  "Cairo": "cairo",
  "Sharm El Sheikh": "sharm-el-sheikh",
  "Hurghada": "hurghada",
  "Luxor": "luxor",
  "Abu Simbel": "aswan",         // existing prod slug for Abu Simbel is aswan-*
  "Qena": "qena",
  "Aswan": "aswan",
  "Esna": "esna",
  "Edfu": "edfu",
  "Alexandria": "alexandria",
  "Beni Suef": "beni-suif",      // existing CITY_SLUG vocab uses 'beni-suif'
  "Minya": "al-menya",           // existing CITY_SLUG vocab uses 'al-menya'
  "Assuit": "assuit",
  "Sohag": "souhag",             // existing CITY_SLUG vocab uses 'souhag'
  "Ismailia": "ismailia",
  "Siwa": "siwa",
  "Al-Sharqia": "al-sharqia",
  "El-bahira": "el-beheira",
  "kafr el-shiekh": "kafr-el-sheikh",
};

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"`’]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function citySlug(raw) {
  const key = String(raw ?? "").trim();
  if (CITY_MAP[key]) return CITY_MAP[key];
  // Fallback: slugify literally. Logged as a warning by caller.
  return slugify(key);
}

function sqlEscape(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function buildNotes(row) {
  const parts = [];
  const student = String(row.foreign_student_egp ?? "").trim();
  if (student && student.toLowerCase() !== "varies") {
    parts.push(`Student: ${student} EGP`);
  }
  const url = String(row.url ?? "").trim();
  if (url) parts.push(url);
  const note = String(row.note ?? "").trim();
  if (note) parts.push(note);
  return parts.join(" | ");
}

async function readCsv() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`Source CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = await readCsv();

  const accepted = [];
  const skipped = [];
  const unmappedCities = new Set();
  const seenSlugs = new Map(); // slug → first index that claimed it

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const sourceName = String(r.name ?? "").trim();
    const sourceCity = String(r.city ?? "").trim();
    const adultRaw = String(r.foreign_adult_egp ?? "").trim();
    const ctx = `row${i + 2} "${sourceName}" (${sourceCity})`;

    if (!sourceName || !sourceCity) {
      skipped.push({ ctx, reason: "missing name or city" });
      continue;
    }

    if (!adultRaw || adultRaw.toLowerCase() === "varies") {
      skipped.push({ ctx, reason: `foreign_adult_egp = "${adultRaw || "<empty>"}"` });
      continue;
    }
    const base = Number(adultRaw);
    if (!Number.isFinite(base) || base <= 0) {
      skipped.push({ ctx, reason: `foreign_adult_egp not numeric: "${adultRaw}"` });
      continue;
    }

    if (!CITY_MAP[sourceCity]) unmappedCities.add(sourceCity);
    const city = citySlug(sourceCity);
    const slug = `${city}-${slugify(sourceName)}`;

    if (seenSlugs.has(slug)) {
      skipped.push({ ctx, reason: `duplicate slug "${slug}" (first seen row${seenSlugs.get(slug) + 2})` });
      continue;
    }
    seenSlugs.set(slug, i);

    const pricePerPerson = Math.round(base * (1 + MARKUP_PERCENT / 100));
    const notes = buildNotes(r);

    accepted.push({
      slug,
      city,
      name: sourceName,
      basePrice: base,
      pricePerPerson,
      notes,
    });
  }

  // ---------------- SQL output ----------------
  const lines = [];
  lines.push("-- Auto-generated by scripts/import-entrance-fees-from-csv.mjs");
  lines.push("-- Source: data/entrance-fees-import/egymonuments_foreigner_prices.csv");
  lines.push("-- Date: 2026-06-24");
  lines.push(`-- Markup: ${MARKUP_PERCENT}%`);
  lines.push(`-- Rows: ${accepted.length} accepted, ${skipped.length} skipped`);
  lines.push("");
  lines.push("BEGIN;");
  lines.push("");
  lines.push("TRUNCATE entrance_fees RESTART IDENTITY;");
  lines.push("");

  let sortOrder = 10;
  for (const a of accepted) {
    const nameTr = JSON.stringify({ en: a.name });
    lines.push(
      `INSERT INTO entrance_fees (slug, name_translations, city, base_price, markup_percent, price_per_person, currency, notes, is_active, sort_order)` +
        ` VALUES ('${sqlEscape(a.slug)}', '${sqlEscape(nameTr)}'::jsonb, '${sqlEscape(a.city)}',` +
        ` ${a.basePrice}, ${MARKUP_PERCENT}, ${a.pricePerPerson}, 'EGP',` +
        ` ${a.notes ? `'${sqlEscape(a.notes)}'` : "NULL"}, true, ${sortOrder});`
    );
    sortOrder += 10;
  }

  lines.push("");
  lines.push("COMMIT;");
  lines.push("");

  fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");

  // ---------------- Dry-run summary ----------------
  console.log(`Wrote ${OUT_PATH}`);
  console.log("");
  console.log(`Accepted: ${accepted.length}`);
  console.log(`Skipped:  ${skipped.length}`);
  console.log("");

  const perCity = {};
  for (const a of accepted) perCity[a.city] = (perCity[a.city] ?? 0) + 1;
  console.log("Per-city accepted:");
  for (const [city, n] of Object.entries(perCity).sort()) {
    console.log(`  ${city.padEnd(20)} ${n}`);
  }

  if (unmappedCities.size > 0) {
    console.log("");
    console.log("WARN — these source cities had no entry in CITY_MAP (used slugify fallback):");
    for (const c of [...unmappedCities].sort()) console.log(`  "${c}"`);
  }

  if (skipped.length > 0) {
    console.log("");
    console.log("Skipped rows:");
    for (const s of skipped) console.log(`  ${s.ctx}: ${s.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
