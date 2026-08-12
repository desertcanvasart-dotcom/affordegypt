#!/usr/bin/env node
/**
 * Fails when the committed pricing fallback no longer matches the catalog.
 *
 * WHY THIS EXISTS
 *
 * The build is supposed to derive prices from the database, but on Railway it
 * cannot: the Dockerfile runs `npm run build` inside the image build, where
 * service variables are not injected, so DATABASE_URL is undefined and
 * generate-pricing-snapshot.mjs falls back — silently, every deploy, exactly as
 * its own failure mode intends. That was invisible for a long time because the
 * fallback values happened to equal the database values.
 *
 * So in practice scripts/pricing-snapshot-fallback.json IS the source of truth
 * for every advertised price on the site. That is a defensible design — it
 * keeps the prerendered SEO correct and keeps a DB credential out of the image
 * build — but only if the file cannot quietly diverge from the catalog.
 *
 * This check is what makes it safe. It runs nightly with a real DATABASE_URL,
 * derives prices through the SAME module the generator uses, and fails loudly
 * on any difference. Someone changing a price in the admin UI gets told the
 * repo needs updating instead of the site advertising a rate nobody charges.
 *
 * FIXING A FAILURE
 *
 *   DATABASE_URL=... node scripts/generate-pricing-snapshot.mjs
 *   # then copy the derived values into scripts/pricing-snapshot-fallback.json
 *   # and commit — the committed file is what production actually serves.
 *
 * Unlike the generator, this script EXITS NON-ZERO on trouble. A drift checker
 * that passes when it cannot reach the database is worse than no checker.
 */
import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveFromDb, VEHICLE_SERVICES, VEHICLE_CLASSES } from "./lib/derive-pricing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FALLBACK_PATH = path.join(__dirname, "pricing-snapshot-fallback.json");

function fail(msg) {
  console.error(`\n[pricing-drift] FAIL — ${msg}\n`);
  process.exit(1);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    fail(
      "DATABASE_URL is not set. This check is meaningless without it — set the " +
        "DATABASE_URL secret on the workflow, or run it locally with one.",
    );
  }

  const committed = JSON.parse(await readFile(FALLBACK_PATH, "utf8"));

  let derived;
  let derivedVehicles;
  try {
    ({ prices: derived, vehicles: derivedVehicles } = await deriveFromDb());
  } catch (err) {
    fail(`could not derive prices from the database: ${err.message}`);
  }

  const keys = [...new Set([...Object.keys(committed.services), ...Object.keys(derived)])].sort();

  const drifted = [];
  const missing = [];

  for (const key of keys) {
    const want = derived[key];
    const have = committed.services[key]?.minPrice;

    if (want === null || want === undefined) {
      // The catalog no longer yields a price for this surface — a pinned slug
      // was renamed or deactivated. Worth failing on: the site keeps quoting a
      // price for a product the catalog can no longer produce.
      missing.push(`${key}: catalog yields no price (committed says ${have ?? "—"})`);
      continue;
    }
    if (have === undefined) {
      missing.push(`${key}: derived ${want} but the committed file has no such key`);
      continue;
    }
    if (String(have) !== String(want)) {
      drifted.push({ key, have: String(have), want: String(want) });
    }
  }

  // Per-vehicle "from" prices printed on the transfer pages. These drifted from
  // the catalog in three different directions before they were derived, which
  // is precisely why they are checked here now.
  for (const serviceKey of Object.keys(VEHICLE_SERVICES)) {
    for (const cls of VEHICLE_CLASSES) {
      const label = `${serviceKey}.${cls}`;
      const want = derivedVehicles?.[serviceKey]?.[cls];
      const have = committed.vehicles?.[serviceKey]?.[cls];
      if (want === null || want === undefined) {
        missing.push(`${label}: catalog yields no price (committed says ${have ?? "—"})`);
        continue;
      }
      if (have === undefined) {
        missing.push(`${label}: derived ${want} but the committed file has no such key`);
        continue;
      }
      if (String(have) !== String(want)) {
        drifted.push({ key: label, have: String(have), want: String(want) });
      }
    }
  }

  if (drifted.length === 0 && missing.length === 0) {
    console.log(
      `[pricing-drift] OK — all ${keys.length} service prices and ` +
        `${Object.keys(VEHICLE_SERVICES).length * VEHICLE_CLASSES.length} vehicle prices match the catalog.`,
    );
    return;
  }

  if (drifted.length > 0) {
    console.error("\n[pricing-drift] Advertised prices no longer match the catalog:\n");
    console.error(`  ${"key".padEnd(38)}${"advertised".padEnd(14)}catalog`);
    for (const d of drifted) {
      console.error(`  ${d.key.padEnd(38)}${d.have.padEnd(14)}${d.want}`);
    }
  }
  if (missing.length > 0) {
    console.error("\n[pricing-drift] Coverage problems:\n");
    for (const m of missing) console.error(`  ${m}`);
  }

  fail(
    `${drifted.length} price(s) drifted, ${missing.length} coverage problem(s). ` +
      "Regenerate and commit scripts/pricing-snapshot-fallback.json.",
  );
}

main().catch((err) => {
  console.error("[pricing-drift] unexpected error:", err);
  process.exit(1);
});
