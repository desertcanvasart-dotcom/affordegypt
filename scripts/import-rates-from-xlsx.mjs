// Import the operator-reviewed rates workbook back into production.
//
// Counterpart to the "full rates export" workbook (Read Me / Transfers & Tours
// / Guide Rates / Entrance Fees / Add-Ons). Rows are matched on the reference
// keys the export prints — slug for service_catalog and entrance_fees,
// (city, language) for guide_rates, id for add_ons — so names and categories
// are never used for matching and are never written.
//
//   PLAN   node scripts/import-rates-from-xlsx.mjs <xlsx>
//          Diffs every sheet against prod, writes the plan + a full backup of
//          the current values, prints the changes. NO writes to prod.
//
//   APPLY  APPLY=1 node scripts/import-rates-from-xlsx.mjs <xlsx>
//          Re-reads the plan, applies it in one transaction, re-verifies.
//
// Rows present in prod but absent from the workbook are left untouched and
// reported as "unmatched" — deleting a row from the sheet is not a delete
// instruction (the sheet's own convention for retiring a service is Active=NO).

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import XLSX from "xlsx";

dotenv.config({ quiet: true });

const VEHICLES = ["sedan", "minivan", "van"];
const OUT_DIR = "data/rates-import";
const xlsxPath = process.argv[2] || "";
const apply = process.env.APPLY === "1";

if (!xlsxPath || !fs.existsSync(xlsxPath)) {
  console.error("Usage: node scripts/import-rates-from-xlsx.mjs <path-to-xlsx>   (add APPLY=1 to write)");
  process.exit(1);
}

const planPath = path.join(OUT_DIR, "plan.json");
const backupPath = path.join(OUT_DIR, "backup.json");

// ---- helpers ------------------------------------------------------------
const num = (v) => {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const bool = (v) => String(v ?? "").trim().toUpperCase() === "YES";
const money = (v) => (v === null ? null : Number(v).toFixed(2));

function rowsOf(wb, sheet) {
  const ws = wb.Sheets[sheet];
  if (!ws) throw new Error(`workbook has no "${sheet}" sheet`);
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
  const header = raw[0].map((h) => String(h ?? "").trim());
  return raw.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? null])));
}

// ---- read workbook ------------------------------------------------------
const wb = XLSX.readFile(xlsxPath);
const sheetServices = rowsOf(wb, "Transfers & Tours");
const sheetGuides = rowsOf(wb, "Guide Rates");
const sheetFees = rowsOf(wb, "Entrance Fees");
const sheetAddOns = rowsOf(wb, "Add-Ons");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const q = async (sql, params) => (await client.query(sql, params)).rows;

// ---- current prod state -------------------------------------------------
const dbServices = await q("select id, slug, name, city, category, vehicle_prices, is_active from service_catalog");
const dbGuides = await q(
  "select g.id, g.language, g.hourly_price, c.name as city from guide_rates g join cities c on c.id = g.city_id",
);
const dbFees = await q("select id, slug, city, base_price, markup_percent, price_per_person, is_active, notes from entrance_fees");
const dbAddOns = await q("select id, name, price, is_active from add_ons");

const bySlug = new Map(dbServices.map((r) => [r.slug, r]));
const feeBySlug = new Map(dbFees.map((r) => [r.slug, r]));
const addOnById = new Map(dbAddOns.map((r) => [r.id, r]));
const guideKey = (city, lang) => `${String(city).trim().toLowerCase()}|${String(lang).trim().toLowerCase()}`;
const guideByKey = new Map(dbGuides.map((r) => [guideKey(r.city, r.language), r]));

// ---- build plan ---------------------------------------------------------
const plan = { services: [], guides: [], fees: [], addOns: [] };
const problems = [];
const matched = { services: new Set(), guides: new Set(), fees: new Set(), addOns: new Set() };

// Transfers & Tours -> service_catalog.vehicle_prices / is_active
for (const [i, row] of sheetServices.entries()) {
  const line = i + 2;
  const slug = String(row.Slug ?? "").trim();
  if (!slug) { problems.push(`Transfers row ${line}: empty Slug (new-service rows are not supported by this importer)`); continue; }
  const cur = bySlug.get(slug);
  if (!cur) { problems.push(`Transfers row ${line}: slug "${slug}" not found in service_catalog`); continue; }
  matched.services.add(slug);

  const tripType = String(row["Trip Type"] ?? "").trim();
  if (!tripType) { problems.push(`Transfers row ${line} (${slug}): empty Trip Type`); continue; }
  const curTrip = [...new Set(Object.keys(cur.vehicle_prices || {}).map((k) => k.split("_").slice(1).join("_")))];
  if (curTrip.length === 1 && curTrip[0] !== tripType) {
    problems.push(`Transfers row ${line} (${slug}): Trip Type changed "${curTrip[0]}" -> "${tripType}"`);
  }

  const next = {};
  for (const v of VEHICLES) {
    const price = num(row[`${v.charAt(0).toUpperCase() + v.slice(1)} (EGP)`]);
    if (price === null) continue;
    if (price <= 0) { problems.push(`Transfers row ${line} (${slug}): ${v} price is ${price} — blank means "not offered", never 0`); continue; }
    next[`${v}_${tripType}`] = price;
  }
  if (Object.keys(next).length === 0) problems.push(`Transfers row ${line} (${slug}): no vehicle has a price`);

  const nextActive = bool(row.Active);
  const priceChanged = JSON.stringify(sortKeys(cur.vehicle_prices || {})) !== JSON.stringify(sortKeys(next));
  const activeChanged = cur.is_active !== nextActive;
  if (priceChanged || activeChanged) {
    plan.services.push({ id: cur.id, slug, name: cur.name, city: cur.city, from: cur.vehicle_prices, to: next, fromActive: cur.is_active, toActive: nextActive });
  }
}

// Guide Rates -> guide_rates.hourly_price (stores the DAILY rate)
for (const [i, row] of sheetGuides.entries()) {
  const line = i + 2;
  const key = guideKey(row.City, row.Language);
  const cur = guideByKey.get(key);
  if (!cur) { problems.push(`Guide row ${line}: no guide_rates row for ${row.City} / ${row.Language}`); continue; }
  matched.guides.add(key);
  const rate = num(row["Daily Rate (EGP)"]);
  if (rate === null || rate <= 0) { problems.push(`Guide row ${line} (${row.City}/${row.Language}): invalid rate "${row["Daily Rate (EGP)"]}"`); continue; }
  if (money(rate) !== String(cur.hourly_price)) {
    plan.guides.push({ id: cur.id, city: cur.city, language: cur.language, from: cur.hourly_price, to: money(rate) });
  }
}

// Entrance Fees -> entrance_fees.price_per_person / is_active
for (const [i, row] of sheetFees.entries()) {
  const line = i + 2;
  const slug = String(row.Slug ?? "").trim();
  const cur = feeBySlug.get(slug);
  if (!cur) { problems.push(`Entrance row ${line}: slug "${slug}" not found in entrance_fees`); continue; }
  matched.fees.add(slug);
  const price = num(row["Price Per Person (EGP)"]);
  if (price === null || price < 0) { problems.push(`Entrance row ${line} (${slug}): invalid price "${row["Price Per Person (EGP)"]}"`); continue; }
  const nextActive = bool(row.Active);
  // base_price/markup are reference-only in the sheet; keep them coherent with
  // the charged price when the row carries no markup (which is every row today).
  const markup = Number(cur.markup_percent);
  const nextBase = markup === 0 ? money(price) : String(cur.base_price);
  if (money(price) !== String(cur.price_per_person) || cur.is_active !== nextActive || nextBase !== String(cur.base_price)) {
    plan.fees.push({ id: cur.id, slug, city: cur.city, from: cur.price_per_person, to: money(price), fromBase: cur.base_price, toBase: nextBase, fromActive: cur.is_active, toActive: nextActive });
  }
}

// Add-Ons -> add_ons.price / is_active (matched on the id column)
const addOnIdCol = Object.keys(sheetAddOns[0] ?? {}).find((k) => k === "" || k.toLowerCase() === "id") ?? "";
for (const [i, row] of sheetAddOns.entries()) {
  const line = i + 2;
  const id = num(row[addOnIdCol]);
  const cur = id === null ? null : addOnById.get(id);
  if (!cur) { problems.push(`Add-On row ${line}: id "${row[addOnIdCol]}" not found in add_ons`); continue; }
  matched.addOns.add(id);
  const price = num(row["Price (EGP, per person)"]);
  if (price === null || price < 0) { problems.push(`Add-On row ${line} (${cur.name}): invalid price "${row["Price (EGP, per person)"]}"`); continue; }
  const nextActive = bool(row.Active);
  if (money(price) !== String(cur.price) || cur.is_active !== nextActive) {
    plan.addOns.push({ id: cur.id, name: cur.name, from: cur.price, to: money(price), fromActive: cur.is_active, toActive: nextActive });
  }
}

function sortKeys(o) {
  return Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
}

// ---- unmatched prod rows (present in DB, absent from the workbook) -------
const unmatched = {
  services: dbServices.filter((r) => !matched.services.has(r.slug)).map((r) => ({ id: r.id, slug: r.slug, name: r.name, city: r.city })),
  guides: dbGuides.filter((r) => !matched.guides.has(guideKey(r.city, r.language))).map((r) => ({ id: r.id, city: r.city, language: r.language })),
  fees: dbFees.filter((r) => !matched.fees.has(r.slug)).map((r) => ({ id: r.id, slug: r.slug })),
  addOns: dbAddOns.filter((r) => !matched.addOns.has(r.id)).map((r) => ({ id: r.id, name: r.name })),
};

// ---- report -------------------------------------------------------------
const fmt = (n) => Number(n).toLocaleString("en-US");
console.log(`\n${apply ? "APPLY" : "PLAN"} — ${path.basename(xlsxPath)}\n`);

console.log(`Transfers & Tours: ${sheetServices.length} sheet rows, ${plan.services.length} changed`);
for (const s of plan.services) {
  const keys = [...new Set([...Object.keys(s.from || {}), ...Object.keys(s.to)])].sort();
  const parts = keys
    .filter((k) => (s.from || {})[k] !== s.to[k])
    .map((k) => `${k}: ${s.from?.[k] === undefined ? "—" : fmt(s.from[k])} → ${s.to[k] === undefined ? "—" : fmt(s.to[k])}`);
  if (s.fromActive !== s.toActive) parts.push(`active: ${s.fromActive} → ${s.toActive}`);
  console.log(`  [${s.id}] ${s.city} · ${s.name}\n        ${parts.join("\n        ")}`);
}

console.log(`\nGuide Rates: ${sheetGuides.length} sheet rows, ${plan.guides.length} changed`);
for (const g of plan.guides) console.log(`  [${g.id}] ${g.city} · ${g.language}: ${fmt(g.from)} → ${fmt(g.to)}`);

console.log(`\nEntrance Fees: ${sheetFees.length} sheet rows, ${plan.fees.length} changed`);
for (const f of plan.fees) {
  const bits = [];
  if (String(f.from) !== String(f.to)) bits.push(`${fmt(f.from)} → ${fmt(f.to)}`);
  if (f.fromActive !== f.toActive) bits.push(`active: ${f.fromActive} → ${f.toActive}`);
  console.log(`  [${f.id}] ${f.slug}: ${bits.join(", ")}`);
}

console.log(`\nAdd-Ons: ${sheetAddOns.length} sheet rows, ${plan.addOns.length} changed`);
for (const a of plan.addOns) {
  const bits = [];
  if (String(a.from) !== String(a.to)) bits.push(`${fmt(a.from)} → ${fmt(a.to)}`);
  if (a.fromActive !== a.toActive) bits.push(`active: ${a.fromActive} → ${a.toActive}`);
  console.log(`  [${a.id}] ${a.name}: ${bits.join(", ")}`);
}

console.log(`\nIn prod but NOT in the workbook (left untouched):`);
console.log(`  services ${unmatched.services.length}, guide rates ${unmatched.guides.length}, entrance fees ${unmatched.fees.length}, add-ons ${unmatched.addOns.length}`);
for (const s of unmatched.services) console.log(`    [${s.id}] ${s.city} · ${s.name} (${s.slug})`);
for (const g of unmatched.guides) console.log(`    [${g.id}] guide ${g.city} · ${g.language}`);
for (const f of unmatched.fees) console.log(`    [${f.id}] fee ${f.slug}`);
for (const a of unmatched.addOns) console.log(`    [${a.id}] add-on ${a.name}`);

if (problems.length) {
  console.log(`\n!! ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
}

const total = plan.services.length + plan.guides.length + plan.fees.length + plan.addOns.length;
console.log(`\nTotal rows to write: ${total}\n`);

// ---- write plan + backup ------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(planPath, JSON.stringify({ source: xlsxPath, plan, unmatched, problems }, null, 2));
fs.writeFileSync(backupPath, JSON.stringify({ dbServices, dbGuides, dbFees, dbAddOns }, null, 2));
console.log(`plan  -> ${planPath}\nbackup -> ${backupPath}`);

// ---- apply --------------------------------------------------------------
if (!apply) {
  console.log(`\nDry run only. Re-run with APPLY=1 to write.\n`);
  await client.end();
  process.exit(0);
}

if (problems.length) {
  console.error(`\nRefusing to apply: resolve the ${problems.length} problem(s) above first.\n`);
  await client.end();
  process.exit(1);
}

await client.query("begin");
try {
  for (const s of plan.services) {
    await client.query("update service_catalog set vehicle_prices = $1, is_active = $2, updated_at = now() where id = $3", [JSON.stringify(s.to), s.toActive, s.id]);
  }
  for (const g of plan.guides) {
    await client.query("update guide_rates set hourly_price = $1 where id = $2", [g.to, g.id]);
  }
  for (const f of plan.fees) {
    await client.query("update entrance_fees set price_per_person = $1, base_price = $2, is_active = $3, updated_at = now() where id = $4", [f.to, f.toBase, f.toActive, f.id]);
  }
  for (const a of plan.addOns) {
    await client.query("update add_ons set price = $1, is_active = $2 where id = $3", [a.to, a.toActive, a.id]);
  }
  await client.query("commit");
} catch (err) {
  await client.query("rollback");
  console.error("\nAPPLY FAILED — transaction rolled back, nothing was written.\n", err);
  await client.end();
  process.exit(1);
}

// ---- verify -------------------------------------------------------------
let bad = 0;
for (const s of plan.services) {
  const [r] = await q("select vehicle_prices, is_active from service_catalog where id = $1", [s.id]);
  if (JSON.stringify(sortKeys(r.vehicle_prices)) !== JSON.stringify(sortKeys(s.to)) || r.is_active !== s.toActive) { bad++; console.error(`  MISMATCH service ${s.id}`); }
}
for (const g of plan.guides) {
  const [r] = await q("select hourly_price from guide_rates where id = $1", [g.id]);
  if (String(r.hourly_price) !== String(g.to)) { bad++; console.error(`  MISMATCH guide ${g.id}`); }
}
for (const f of plan.fees) {
  const [r] = await q("select price_per_person, is_active from entrance_fees where id = $1", [f.id]);
  if (String(r.price_per_person) !== String(f.to) || r.is_active !== f.toActive) { bad++; console.error(`  MISMATCH fee ${f.id}`); }
}
for (const a of plan.addOns) {
  const [r] = await q("select price, is_active from add_ons where id = $1", [a.id]);
  if (String(r.price) !== String(a.to) || r.is_active !== a.toActive) { bad++; console.error(`  MISMATCH add-on ${a.id}`); }
}

console.log(bad === 0 ? `\nApplied and verified ${total} row(s).\n` : `\nApplied, but ${bad} row(s) failed verification.\n`);
await client.end();
process.exit(bad === 0 ? 0 : 1);
