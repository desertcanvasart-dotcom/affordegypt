#!/usr/bin/env node
/**
 * Build-time pricing snapshot generator.
 *
 * Queries routes.vehicle_prices and guide_rates for the minimum price across
 * each service surface that the SEO Service+Offer schema renders. Writes the
 * result to:
 *
 *   - client/public/pricing-snapshot.json (copied to dist/public/ by Vite,
 *     also addressable at https://affordegypt.com/pricing-snapshot.json)
 *   - client/src/generated/pricing-snapshot.json (statically imported by
 *     service-area page components for the schema prop)
 *
 * Failure mode: if DATABASE_URL is missing, the connection fails, or any
 * service yields no price, the missing values fall back to the values in
 * scripts/pricing-snapshot-fallback.json. The build never fails on this
 * step — a stale schema is preferable to a broken one.
 *
 * Derivation itself lives in scripts/lib/derive-pricing.mjs, shared with
 * scripts/check-pricing-drift.mjs so the nightly checker and this generator
 * can never disagree about what the right price is.
 */
import "dotenv/config";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deriveFromDb, SERVICE_KEYS } from "./lib/derive-pricing.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_OUT = path.join(ROOT, "client", "public", "pricing-snapshot.json");
const SRC_OUT = path.join(ROOT, "client", "src", "generated", "pricing-snapshot.json");
const FALLBACK_PATH = path.join(__dirname, "pricing-snapshot-fallback.json");

async function loadFallback() {
  const txt = await readFile(FALLBACK_PATH, "utf8");
  return JSON.parse(txt);
}

async function main() {
  const fallback = await loadFallback();
  const services = {};
  let source = "db";
  let dbError = null;

  let derived = {};
  try {
    derived = await deriveFromDb();
  } catch (err) {
    dbError = err;
    source = "fallback";
    console.warn(
      `[pricing-snapshot] DB query failed (${err.message}); using full fallback snapshot`,
    );
  }

  const usedFallbackKeys = [];
  for (const key of Object.values(SERVICE_KEYS)) {
    const minPrice = derived[key];
    if (minPrice && minPrice !== "0") {
      services[key] = { minPrice };
    } else {
      services[key] = { ...fallback.services[key] };
      usedFallbackKeys.push(key);
    }
  }

  if (usedFallbackKeys.length > 0 && !dbError) {
    console.warn(
      `[pricing-snapshot] no DB price found for: ${usedFallbackKeys.join(", ")} — using fallback values`,
    );
    if (usedFallbackKeys.length === Object.values(SERVICE_KEYS).length) {
      source = "fallback";
    } else {
      source = "mixed";
    }
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    source,
    currency: fallback.currency,
    services,
  };

  const json = JSON.stringify(snapshot, null, 2) + "\n";
  await mkdir(path.dirname(PUBLIC_OUT), { recursive: true });
  await mkdir(path.dirname(SRC_OUT), { recursive: true });
  await writeFile(PUBLIC_OUT, json, "utf8");
  await writeFile(SRC_OUT, json, "utf8");
  console.log(
    `[pricing-snapshot] wrote ${PUBLIC_OUT} and ${SRC_OUT} (source=${source})`,
  );
}

main().catch((err) => {
  // Per spec: never fail the build on this step. Surface the error and
  // continue — but only if we managed to get a fallback file written.
  console.error("[pricing-snapshot] unexpected error:", err);
  process.exit(0);
});
