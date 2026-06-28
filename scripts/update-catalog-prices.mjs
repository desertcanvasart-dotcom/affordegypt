// Reusable catalog price updater: refresh service_catalog vehicle_prices for
// a city from a CSV, IN PLACE (preserves slug/id/name/trip-type, swaps only
// the numbers). Two phases:
//
//   1. PLAN  — node scripts/update-catalog-prices.mjs <city> [csvPath]
//      Reads the CSV + the city's existing prod rows, auto-matches by a
//      normalized name signature, writes data/catalog-import/<city>.plan.json
//      and prints a review table. NO writes to prod.
//
//   2. APPLY — APPLY=1 node scripts/update-catalog-prices.mjs <city>
//      Re-reads the (reviewed) plan file, backs up current prices, then
//      PATCHes matched rows and inserts rows you marked action:"insert".
//      Verifies all CSV rows against prod afterward.
//
// Why two phases: new price sheets reformat route names ("Hotel → X → Hotel"
// instead of "<City> ↔ X"), so slug auto-matching is unreliable and some rows
// are genuine renames or new routes. The plan file is where a human resolves
// the few rows the matcher can't (set "targetId" + "action").
//
// CSV shape (header row 1, notes row 2 skipped, data row 3+):
//   Route,sedan,minivan,van
// Default csvPath: data/catalog-import/<Citycap>.csv
//
// Auth/host for APPLY: ADMIN_USERNAME/ADMIN_EMAIL + ADMIN_PASSWORD + APP_URL.
// Loads .env then .env.production (override) — prod ADMIN_PASSWORD lives there.
// dotenv-cli is not a dependency.

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

dotenv.config();
dotenv.config({ path: ".env.production", override: true });

const VEHICLES = ["sedan", "minivan", "van"];
const IMPORT_DIR = "data/catalog-import";
const BACKUP_DIR = "backups";

// Tokens stripped from names before matching: the literal "hotel" placeholder
// both conventions use for the origin, plus generic connectors. The origin
// city name is also stripped (passed in).
const STOPWORDS = new Set(["hotel", "the", "to", "a", "an", "of"]);

// ---- args ---------------------------------------------------------------
const city = process.argv[2];
if (!city) {
  console.error("Usage: node scripts/update-catalog-prices.mjs <city> [csvPath]   (add APPLY=1 to write)");
  process.exit(1);
}
const cityCap = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
const csvPath = process.argv[3] || path.join(IMPORT_DIR, `${cityCap}.csv`);
const planPath = path.join(IMPORT_DIR, `${city.toLowerCase()}.plan.json`);
const apply = process.env.APPLY === "1";

// ---- helpers ------------------------------------------------------------
function parseCsv(p) {
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  const header = (lines[0] || "").split(",").map((h) => h.trim().toLowerCase());
  const routeCol = Math.max(0, header.indexOf("route"));
  const vCol = {};
  for (const v of VEHICLES) vCol[v] = header.indexOf(v);
  for (const v of VEHICLES) if (vCol[v] < 0) throw new Error(`CSV missing "${v}" column (header: ${header.join(",")})`);
  const out = [];
  for (const line of lines.slice(2)) {
    if (!line.trim()) continue;
    // split respecting a single optional quoted route cell
    const cells = [];
    let i = 0, cur = "", q = false;
    for (; i < line.length; i++) {
      const c = line[i];
      if (c === '"') q = !q;
      else if (c === "," && !q) { cells.push(cur); cur = ""; }
      else cur += c;
    }
    cells.push(cur);
    const route = (cells[routeCol] ?? "").replace(/^"|"$/g, "").trim();
    if (!route) continue;
    const num = (x) => { const n = Number(String(x).replace(/[, ]/g, "").trim()); return Number.isFinite(n) ? n : null; };
    out.push({ route, sedan: num(cells[vCol.sedan]), minivan: num(cells[vCol.minivan]), van: num(cells[vCol.van]) });
  }
  return out;
}

// Normalized token signature for matching across naming conventions.
function sig(name, cityName) {
  let s = name.toLowerCase();
  s = s.replace(/[↔→/&+]/g, " ").replace(/[()]/g, " ");
  const cityTok = cityName.toLowerCase();
  const toks = s.split(/[^a-z0-9]+/).filter(Boolean)
    .filter((t) => t !== cityTok && !STOPWORDS.has(t));
  return [...new Set(toks)].sort().join(" ");
}

function overlap(aSig, bSig) {
  const a = new Set(aSig.split(" ").filter(Boolean));
  const b = new Set(bSig.split(" ").filter(Boolean));
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / new Set([...a, ...b]).size; // Jaccard
}

// The single trip-type suffix shared by a row's price keys (sedan_X, van_X…).
function suffixOf(prices) {
  const keys = Object.keys(prices || {});
  const suffixes = new Set();
  for (const k of keys) { const m = k.match(/^(sedan|minivan|van)_(.+)$/); if (m) suffixes.add(m[2]); }
  return suffixes.size === 1 ? [...suffixes][0] : null; // null = ambiguous/none
}

async function connect() {
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  return c;
}
async function fetchCityRows(c, cityName) {
  const r = await c.query(
    "select id, slug, name, city, category, pickup_zone, vehicle_prices from service_catalog where lower(city)=lower($1) order by id",
    [cityName],
  );
  return r.rows;
}
async function login() {
  const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
  const username = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!appUrl || !username || !password) throw new Error("APP_URL / ADMIN_USERNAME / ADMIN_PASSWORD required for APPLY");
  const r = await fetch(`${appUrl}/api/auth/login`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(`login failed: ${r.status} ${await r.text()}`);
  return { appUrl, token: (await r.json()).token };
}

// ---- PLAN ---------------------------------------------------------------
async function plan() {
  const rows = parseCsv(csvPath);
  const c = await connect();
  const prod = await fetchCityRows(c, cityCap);
  await c.end();

  const prodSig = prod.map((p) => ({ ...p, _sig: sig(p.name, cityCap) }));
  const usedIds = new Set();
  const updates = [], needsReview = [];

  for (const row of rows) {
    const rsig = sig(row.route, cityCap);
    // best available exact-signature match first, else best Jaccard
    let best = null, bestScore = 0;
    for (const p of prodSig) {
      if (usedIds.has(p.id)) continue;
      const score = p._sig === rsig ? 1 : overlap(rsig, p._sig);
      if (score > bestScore) { bestScore = score; best = p; }
    }
    const newPrices = { sedan: row.sedan, minivan: row.minivan, van: row.van };
    if (best && bestScore >= 0.999) {
      usedIds.add(best.id);
      const suffix = suffixOf(best.vehicle_prices);
      const old = suffix ? { sedan: best.vehicle_prices[`sedan_${suffix}`], minivan: best.vehicle_prices[`minivan_${suffix}`], van: best.vehicle_prices[`van_${suffix}`] } : null;
      updates.push({ csvRoute: row.route, targetId: best.id, targetName: best.name, suffix, old, new: newPrices, auto: true });
    } else {
      const suggestions = prodSig
        .filter((p) => !usedIds.has(p.id))
        .map((p) => ({ id: p.id, name: p.name, score: +overlap(rsig, p._sig).toFixed(2) }))
        .sort((a, b) => b.score - a.score).slice(0, 3);
      needsReview.push({
        csvRoute: row.route,
        new: newPrices,
        action: "skip",                 // <- set to "update" or "insert"
        targetId: null,                  // <- for action:"update", the existing row id
        insert: { name: `${cityCap} → ${row.route.replace(/^Hotel\s*→\s*/, "").replace(/\s*→\s*Hotel.*$/, "")}`, category: "tour_transfer", tripType: "round_trip_same_day" },
        suggestions,
      });
    }
  }

  const touched = new Set(updates.map((u) => u.targetId));
  const untouchedProd = prod.filter((p) => !touched.has(p.id)).map((p) => ({ id: p.id, name: p.name }));

  const planObj = { city: cityCap, csvPath, updates, needsReview, untouchedProd };
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
  fs.writeFileSync(planPath, JSON.stringify(planObj, null, 2));

  // ---- print review ----
  console.log(`\nPLAN for ${cityCap}  (csv: ${csvPath})`);
  console.log(`CSV rows: ${rows.length} | prod rows: ${prod.length} | auto-matched: ${updates.length} | needs review: ${needsReview.length}\n`);
  let changed = 0;
  for (const u of updates) {
    const same = u.old && u.old.sedan === u.new.sedan && u.old.minivan === u.new.minivan && u.old.van === u.new.van;
    if (!same) changed++;
    const oldStr = u.old ? `${u.old.sedan}/${u.old.minivan}/${u.old.van}` : "(no recognizable key!)";
    console.log(`  [${String(u.targetId).padStart(3)}] ${u.csvRoute} -> ${u.targetName} | ${u.suffix ?? "?"}`);
    console.log(`        ${oldStr} -> ${u.new.sedan}/${u.new.minivan}/${u.new.van}${same ? "  (no change)" : ""}`);
  }
  if (needsReview.length) {
    console.log(`\n  NEEDS REVIEW (edit ${planPath}, set action+targetId):`);
    for (const n of needsReview) {
      console.log(`   - "${n.csvRoute}"  new ${n.new.sedan}/${n.new.minivan}/${n.new.van}`);
      console.log(`       suggestions: ${n.suggestions.map((s) => `${s.id} ${s.name} (${s.score})`).join("  |  ") || "(none)"}`);
    }
  }
  if (untouchedProd.length) {
    console.log(`\n  Prod rows NOT in CSV (${untouchedProd.length}): ${untouchedProd.map((p) => `${p.id} ${p.name}`).join(", ")}`);
  }
  console.log(`\nWrote ${planPath}. Will change ${changed} prices on APPLY (plus any reviewed rows).`);
  console.log(`Review the plan, then run:  APPLY=1 node scripts/update-catalog-prices.mjs ${city}`);
}

// ---- APPLY --------------------------------------------------------------
async function applyPlan() {
  if (!fs.existsSync(planPath)) throw new Error(`No plan file at ${planPath}. Run the plan phase first.`);
  const planObj = JSON.parse(fs.readFileSync(planPath, "utf8"));

  const c = await connect();
  const prod = await fetchCityRows(c, cityCap);
  const byId = new Map(prod.map((p) => [p.id, p]));
  // backup
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = (process.env.STAMP || "manual");
  const backupPath = path.join(BACKUP_DIR, `${city.toLowerCase()}-prices-backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(prod, null, 2));
  await c.end();
  console.log(`Backed up ${prod.length} ${cityCap} rows -> ${backupPath}`);

  const { appUrl, token } = await login();

  // Build the work list: auto updates + reviewed rows.
  const work = [];
  for (const u of planObj.updates) {
    if (!u.suffix) { console.warn(`  SKIP id ${u.targetId} (${u.csvRoute}): no single trip-type key`); continue; }
    work.push({ kind: "patch", id: u.targetId, prices: { [`sedan_${u.suffix}`]: u.new.sedan, [`minivan_${u.suffix}`]: u.new.minivan, [`van_${u.suffix}`]: u.new.van }, label: u.csvRoute });
  }
  const inserts = [];
  for (const n of planObj.needsReview || []) {
    if (n.action === "update") {
      const row = byId.get(n.targetId);
      if (!row) { console.warn(`  SKIP review "${n.csvRoute}": targetId ${n.targetId} not found`); continue; }
      const suffix = suffixOf(row.vehicle_prices);
      if (!suffix) { console.warn(`  SKIP review "${n.csvRoute}": id ${n.targetId} has no single trip-type key`); continue; }
      work.push({ kind: "patch", id: n.targetId, prices: { [`sedan_${suffix}`]: n.new.sedan, [`minivan_${suffix}`]: n.new.minivan, [`van_${suffix}`]: n.new.van }, label: n.csvRoute });
    } else if (n.action === "insert") {
      const tt = n.insert?.tripType || "round_trip_same_day";
      const name = n.insert?.name || `${cityCap} → ${n.csvRoute}`;
      const slug = name.toLowerCase().replace(/[↔→]/g, "-").replace(/\+/g, " and ").replace(/&/g, " and ").replace(/[()]/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      inserts.push({
        slug, name, city: cityCap, category: n.insert?.category || "tour_transfer",
        pickupZone: n.insert?.pickupZone || `${cityCap} Center`,
        vehiclePrices: { [`sedan_${tt}`]: n.new.sedan, [`minivan_${tt}`]: n.new.minivan, [`van_${tt}`]: n.new.van },
        nameTranslations: { en: name },
      });
    } // action:"skip" -> ignored
  }

  let ok = 0, fail = 0;
  for (const w of work) {
    const r = await fetch(`${appUrl}/api/admin/service-catalog/${w.id}`, {
      method: "PATCH", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ vehiclePrices: w.prices }),
    });
    if (r.ok) ok++; else { fail++; console.error(`  PATCH FAIL id ${w.id} (${w.label}): ${r.status} ${await r.text()}`); }
  }
  let inserted = 0;
  for (const p of inserts) {
    const r = await fetch(`${appUrl}/api/admin/service-catalog`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(p),
    });
    if (r.ok) { inserted++; const b = await r.json(); console.log(`  INSERT ok: ${b.slug} (id ${b.id})`); }
    else { fail++; console.error(`  INSERT FAIL ${p.slug}: ${r.status} ${await r.text()}`); }
  }
  console.log(`\nApplied: ${ok} patched, ${inserted} inserted, ${fail} failed`);
  process.exit(fail ? 2 : 0);
}

if (apply) await applyPlan(); else await plan();
