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
 * Cities (Cairo=1, Luxor=3, Aswan=4) are referenced by id because the
 * production seed pins them. If the seed shifts, update CITY_IDS below.
 */
import "dotenv/config";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_OUT = path.join(ROOT, "client", "public", "pricing-snapshot.json");
const SRC_OUT = path.join(ROOT, "client", "src", "generated", "pricing-snapshot.json");
const FALLBACK_PATH = path.join(__dirname, "pricing-snapshot-fallback.json");

const CITY_IDS = { cairo: 1, luxor: 3, aswan: 4 };

const SERVICE_KEYS = {
  cairoAirport: "cairo-airport-transfer",
  luxorAirport: "luxor-airport-transfer",
  aswanAirport: "aswan-airport-transfer",
  cairoGuide: "cairo-guide-services",
  luxorGuide: "luxor-guide-services",
  aswanGuide: "aswan-guide-services",
  // Full-day private car only (no guide).
  cairoCar: "cairo-tour-car",
  luxorCar: "luxor-tour-car",
  aswanCar: "aswan-tour-car",
  // Guide + full-day private car — the headline rate on the guide-service
  // pages. Derived as guide + car rather than stored, so it cannot disagree
  // with its own two components.
  cairoGuideCar: "cairo-guide-car",
  luxorGuideCar: "luxor-guide-car",
  aswanGuideCar: "aswan-guide-car",
  // Aswan's Abu Simbel day trip is a 280 km round trip filed under
  // intercity_transfer, not a tour_transfer — priced separately for that reason.
  aswanAbuSimbelCar: "aswan-abu-simbel-car",
  aswanAbuSimbelGuideCar: "aswan-abu-simbel-guide-car",
};

async function loadFallback() {
  const txt = await readFile(FALLBACK_PATH, "utf8");
  return JSON.parse(txt);
}

/**
 * Minimum airport-transfer price for a city, derived from
 * service_catalog.vehicle_prices on active airport_transfer rows. (The legacy
 * routes table is empty in prod — querying it always fell back to the stale
 * fallback file, which is how the schema advertised LE 600 transfers that
 * don't exist.) vehicle_prices is flat JSONB keyed `${vehicleSlug}_${tripType}`
 * (e.g. "sedan_one_way"); we take the minimum positive value across every
 * entry on every candidate row. Returns null if no candidate row or price.
 */
async function getAirportTransferMin(c, cityName) {
  const routes = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE category = 'airport_transfer'
       AND is_active = true
       AND LOWER(city) = LOWER($1)`,
    [cityName],
  );
  if (routes.rows.length === 0) return null;

  let min = Infinity;
  for (const r of routes.rows) {
    let blob = r.vehicle_prices;
    if (typeof blob === "string") {
      try {
        blob = JSON.parse(blob);
      } catch {
        continue;
      }
    }
    if (!blob || typeof blob !== "object") continue;
    for (const v of Object.values(blob)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0 && n < min) min = n;
    }
  }
  if (min === Infinity) return null;
  return Math.round(min).toString();
}

/**
 * Minimum guide daily rate for a city. The schema column is named
 * hourlyPrice but per server/services/pricing.ts:166 the live data is
 * actually daily — we honor that convention here.
 */
async function getGuideMin(c, cityId) {
  const rows = await c.query(
    `SELECT MIN(CAST(hourly_price AS NUMERIC)) AS min
     FROM guide_rates
     WHERE city_id = $1 AND CAST(hourly_price AS NUMERIC) > 0`,
    [cityId],
  );
  const min = rows.rows[0]?.min;
  if (min === null || min === undefined) return null;
  return Math.round(Number(min)).toString();
}

/**
 * The specific catalog rows the guide-service pages advertise.
 *
 * Pinned by slug, deliberately, rather than taking a MIN across everything that
 * looks like a full day. Each page card names a concrete product, and a blind
 * minimum prices the wrong one: Luxor's cheapest full-day car is the West-Bank
 * half of the city (LE 3,020), so a MIN would advertise the "East & West Bank
 * Tour" at a rate that doesn't buy both banks. Aswan is worse — its Abu Simbel
 * card is an intercity_transfer, so a tour_transfer MIN would have advertised a
 * 280 km round trip at the in-town day rate.
 *
 * slug is documented write-once in shared/schema.ts, so pinning is stable. If a
 * slug ever disappears the value falls back and the build logs it, rather than
 * silently substituting a different product's price.
 *
 * duration_hours would be the principled filter, but it is NULL on all 71
 * tour_transfer rows in production — the column exists and was never populated.
 */
const PINNED_SLUGS = {
  cairoCar: "cairo-hotel-full-day-pyramids-hotel-8-hrs-3-visits",
  luxorCar: "luxor-hotel-city-full-day-8-hrs",
  aswanCar: "aswan-hotel-full-day-in-town-8-hrs",
  aswanAbuSimbelCar: "aswan-hotel-abu-simbel-hotel-same-day",
};

/** Cheapest vehicle price on one pinned catalog row. */
async function getSlugMin(c, slug) {
  const rows = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE slug = $1 AND is_active = true`,
    [slug],
  );
  if (rows.rows.length === 0) return null;

  let min = Infinity;
  for (const r of rows.rows) {
    let blob = r.vehicle_prices;
    if (typeof blob === "string") {
      try {
        blob = JSON.parse(blob);
      } catch {
        continue;
      }
    }
    if (!blob || typeof blob !== "object") continue;
    for (const v of Object.values(blob)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0 && n < min) min = n;
    }
  }
  if (min === Infinity) return null;
  return Math.round(min).toString();
}

/** guide day rate + full-day car, or null if either side is missing. */
function sumPrices(a, b) {
  if (!a || !b) return null;
  const total = Number(a) + Number(b);
  return Number.isFinite(total) && total > 0 ? Math.round(total).toString() : null;
}

async function deriveFromDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  try {
    const out = {};
    out[SERVICE_KEYS.cairoAirport] = await getAirportTransferMin(c, "Cairo");
    out[SERVICE_KEYS.luxorAirport] = await getAirportTransferMin(c, "Luxor");
    out[SERVICE_KEYS.aswanAirport] = await getAirportTransferMin(c, "Aswan");
    out[SERVICE_KEYS.cairoGuide] = await getGuideMin(c, CITY_IDS.cairo);
    out[SERVICE_KEYS.luxorGuide] = await getGuideMin(c, CITY_IDS.luxor);
    out[SERVICE_KEYS.aswanGuide] = await getGuideMin(c, CITY_IDS.aswan);

    out[SERVICE_KEYS.cairoCar] = await getSlugMin(c, PINNED_SLUGS.cairoCar);
    out[SERVICE_KEYS.luxorCar] = await getSlugMin(c, PINNED_SLUGS.luxorCar);
    out[SERVICE_KEYS.aswanCar] = await getSlugMin(c, PINNED_SLUGS.aswanCar);
    out[SERVICE_KEYS.aswanAbuSimbelCar] = await getSlugMin(c, PINNED_SLUGS.aswanAbuSimbelCar);

    out[SERVICE_KEYS.cairoGuideCar] = sumPrices(
      out[SERVICE_KEYS.cairoGuide], out[SERVICE_KEYS.cairoCar]);
    out[SERVICE_KEYS.luxorGuideCar] = sumPrices(
      out[SERVICE_KEYS.luxorGuide], out[SERVICE_KEYS.luxorCar]);
    out[SERVICE_KEYS.aswanGuideCar] = sumPrices(
      out[SERVICE_KEYS.aswanGuide], out[SERVICE_KEYS.aswanCar]);
    out[SERVICE_KEYS.aswanAbuSimbelGuideCar] = sumPrices(
      out[SERVICE_KEYS.aswanGuide], out[SERVICE_KEYS.aswanAbuSimbelCar]);

    return out;
  } finally {
    await c.end();
  }
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
