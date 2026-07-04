#!/usr/bin/env node
/**
 * Production data-invariant + golden-pricing checks.
 *
 * The app's worst failure mode isn't a crash — it's "working" code over
 * missing or wrong data: an empty catalog category (the /transfers bug),
 * a price wipe from a bad CSV import, a guide language dropped by a
 * reseed. These checks hit the live public API and assert the business
 * is intact:
 *
 *   1. /api/health responds ok
 *   2. every pinned service category exists and has >= its pinned row count
 *   3. every pinned city is present in /api/services/cities
 *   4. no active transfer/tour service has an empty vehicle_prices blob
 *      (an unpriced row is invisible in pickers = silently unbookable)
 *   5. entrance-fees count >= pinned
 *   6. guide languages exactly match the pinned list
 *   7. golden itineraries price to EXACTLY their pinned totals through
 *      POST /api/pricing/calculate — the same engine that freezes quotes
 *
 * Expected values live in scripts/pricing-goldens.json. When prices or
 * inventory change ON PURPOSE, re-pin with:
 *
 *   node scripts/check-invariants.mjs --update
 *
 * Usage:
 *   node scripts/check-invariants.mjs                # check prod
 *   node scripts/check-invariants.mjs --base http://localhost:5000
 *   node scripts/check-invariants.mjs --update       # re-pin goldens
 *
 * Exit code 0 = all pass, 1 = at least one failure (CI-friendly).
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GOLDENS_PATH = path.join(__dirname, "pricing-goldens.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const baseIdx = args.indexOf("--base");
const BASE = (baseIdx !== -1 && args[baseIdx + 1]) || "https://affordegypt.com";

let failures = 0;
const pass = (msg) => console.log(`  PASS  ${msg}`);
const fail = (msg) => {
  failures++;
  console.error(`  FAIL  ${msg}`);
};

async function get(pathname) {
  const res = await fetch(`${BASE}${pathname}`);
  if (!res.ok) throw new Error(`GET ${pathname} -> HTTP ${res.status}`);
  return res.json();
}

async function post(pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${pathname} -> HTTP ${res.status}`);
  return res.json();
}

// A catalog row is "priced" when at least one vehicle_prices value is a
// positive number. Same rule as the pickers: anything else never renders.
function hasAnyPrice(vehiclePrices) {
  return Object.values(vehiclePrices ?? {}).some((v) => {
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) && n > 0;
  });
}

const goldens = JSON.parse(await readFile(GOLDENS_PATH, "utf8"));

console.log(`${UPDATE ? "Re-pinning goldens from" : "Checking invariants against"} ${BASE}\n`);

// ---------------------------------------------------------------- health
try {
  const health = await get("/api/health");
  if (health.status === "ok") pass("/api/health status ok");
  else fail(`/api/health status "${health.status}"`);
} catch (e) {
  fail(`/api/health unreachable: ${e.message}`);
}

// ------------------------------------------------- categories + row counts
for (const [category, pinned] of Object.entries(goldens.categoryCounts)) {
  try {
    const rows = await get(`/api/services?category=${encodeURIComponent(category)}`);
    if (UPDATE) {
      goldens.categoryCounts[category] = rows.length;
      pass(`pinned ${category} = ${rows.length} services`);
    } else if (rows.length >= pinned) {
      pass(`${category}: ${rows.length} services (pinned >= ${pinned})`);
    } else {
      fail(`${category}: ${rows.length} services, expected >= ${pinned} — inventory loss?`);
    }

    const unpriced = rows.filter((r) => !hasAnyPrice(r.vehicle_prices));
    if (unpriced.length === 0) {
      pass(`${category}: every service has at least one positive price`);
    } else {
      fail(
        `${category}: ${unpriced.length} service(s) with NO usable price (invisible in pickers): ${unpriced
          .map((r) => r.slug)
          .slice(0, 5)
          .join(", ")}`,
      );
    }
  } catch (e) {
    fail(`${category}: ${e.message}`);
  }
}

// ------------------------------------------------------------------ cities
try {
  const cities = await get("/api/services/cities");
  const live = new Set(cities.map((c) => c.slug));
  if (UPDATE) {
    goldens.citySlugs = cities.map((c) => c.slug).sort();
    pass(`pinned cities = ${goldens.citySlugs.join(", ")}`);
  } else {
    const missing = goldens.citySlugs.filter((s) => !live.has(s));
    if (missing.length === 0) pass(`all pinned cities present (${goldens.citySlugs.join(", ")})`);
    else fail(`cities missing from catalog: ${missing.join(", ")}`);
  }
} catch (e) {
  fail(`/api/services/cities: ${e.message}`);
}

// ----------------------------------------------------------- entrance fees
try {
  const fees = await get("/api/entrance-fees");
  if (UPDATE) {
    goldens.entranceFeeCount = fees.length;
    pass(`pinned entrance fees = ${fees.length}`);
  } else if (fees.length >= goldens.entranceFeeCount) {
    pass(`entrance fees: ${fees.length} (pinned >= ${goldens.entranceFeeCount})`);
  } else {
    fail(`entrance fees: ${fees.length}, expected >= ${goldens.entranceFeeCount}`);
  }
} catch (e) {
  fail(`/api/entrance-fees: ${e.message}`);
}

// -------------------------------------------------------- guide languages
try {
  const langs = await get("/api/pricing/languages");
  if (UPDATE) {
    goldens.guideLanguages = langs;
    pass(`pinned guide languages = ${langs.join(", ")}`);
  } else {
    const same =
      langs.length === goldens.guideLanguages.length &&
      goldens.guideLanguages.every((l) => langs.includes(l));
    if (same) pass(`guide languages match (${langs.length})`);
    else
      fail(
        `guide languages drifted: live [${langs.join(", ")}] vs pinned [${goldens.guideLanguages.join(", ")}]`,
      );
  }
} catch (e) {
  fail(`/api/pricing/languages: ${e.message}`);
}

// ------------------------------------------------------ golden itineraries
for (const golden of goldens.itineraries) {
  try {
    const result = await post("/api/pricing/calculate", golden.payload);
    const total = result.totalAmount;
    if (UPDATE) {
      golden.expectedTotal = total;
      pass(`pinned "${golden.name}" = ${total} EGP`);
    } else if (total === golden.expectedTotal) {
      pass(`"${golden.name}" prices to ${total} EGP`);
    } else {
      fail(
        `"${golden.name}" prices to ${total} EGP, pinned ${golden.expectedTotal} — unintended price change?`,
      );
    }
  } catch (e) {
    fail(`"${golden.name}": ${e.message}`);
  }
}

// ------------------------------------------------------------------ result
if (UPDATE) {
  await writeFile(GOLDENS_PATH, JSON.stringify(goldens, null, 2) + "\n");
  console.log(`\nGoldens written to ${path.relative(process.cwd(), GOLDENS_PATH)}`);
  process.exit(failures > 0 ? 1 : 0);
}

console.log(
  failures === 0
    ? "\nAll invariants hold."
    : `\n${failures} invariant(s) FAILED — the live app is likely mispricing or missing data.`,
);
process.exit(failures > 0 ? 1 : 0);
