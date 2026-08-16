/**
 * Shared pricing derivation, used by BOTH:
 *
 *   - scripts/generate-pricing-snapshot.mjs (build time)
 *   - scripts/check-pricing-drift.mjs       (nightly CI)
 *
 * These must not be separate implementations. A drift checker that derives
 * prices differently from the generator would compare two of its own opinions
 * and pass while the site is wrong — the exact failure mode it exists to catch.
 *
 * Cities (Cairo=1, Luxor=3, Aswan=4) are referenced by id because the
 * production seed pins them. If the seed shifts, update CITY_IDS.
 */
import pg from "pg";

export const CITY_IDS = { cairo: 1, luxor: 3, aswan: 4 };

export const SERVICE_KEYS = {
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
  // The cheapest in-town ride anywhere in the catalog. /transfers lists
  // intercity, airport and in-town side by side, and its "from" price was
  // quoting luxor-airport-transfer because that was the lowest key that
  // existed — 1,200 against a real floor of 700. Deliberately not pinned to a
  // city or a slug: the page is national, so the number has to be too.
  intownTransfer: "in-town-transfer",
  /**
   * Cheapest airport transfer in the country.
   *
   * The three keys above are per-city and were the only airport prices the
   * snapshot knew, so "from" on a national page could not go below the
   * cheapest of those three — 1,200, Luxor. The catalog sells airport
   * transfers from five cities, and the actual floor is Hurghada at 1,000;
   * Marsa Alam at 1,050 also undercut Luxor. A per-city minimum cannot answer
   * a national question, however many cities you add.
   */
  airportTransferFloor: "airport-transfer-floor",
};

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
 * slug is documented write-once in shared/schema.ts, so pinning is stable.
 *
 * duration_hours would be the principled filter, but it is NULL on all 71
 * tour_transfer rows in production — the column exists and was never populated.
 */
export const PINNED_SLUGS = {
  cairoCar: "cairo-hotel-full-day-pyramids-hotel-8-hrs-3-visits",
  luxorCar: "luxor-hotel-city-full-day-8-hrs",
  aswanCar: "aswan-hotel-full-day-in-town-8-hrs",
  aswanAbuSimbelCar: "aswan-hotel-abu-simbel-hotel-same-day",
};

/**
 * Services whose pages advertise a per-vehicle "from" price, not just a single
 * minimum. These were hand-typed in the locale files and drifted from the
 * catalog in three different directions before being derived here.
 */
export const VEHICLE_SERVICES = {
  [SERVICE_KEYS.cairoAirport]: "Cairo",
  [SERVICE_KEYS.luxorAirport]: "Luxor",
  [SERVICE_KEYS.aswanAirport]: "Aswan",
};

/** Vehicle classes the transfer pages show a card for. */
export const VEHICLE_CLASSES = ["sedan", "minivan", "van"];

/** Cheapest positive value across a set of flat JSONB vehicle_prices blobs. */
function minAcrossVehiclePrices(rows) {
  let min = Infinity;
  for (const r of rows) {
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
  return min === Infinity ? null : Math.round(min).toString();
}

/**
 * Cheapest price per vehicle class across a city's airport_transfer rows.
 *
 * Taken per class rather than per row on purpose: "From X" on a vehicle card
 * means the cheapest that vehicle goes for on any eligible route. In Luxor the
 * cheapest sedan and the cheapest van are on different rows, so no single row
 * produces all three numbers.
 *
 * Keys are matched by prefix because the JSONB blobs qualify them by trip type
 * (sedan_one_way, sedan_round_trip_same_day, ...).
 */
async function getAirportTransferVehicleMins(c, cityName) {
  const { rows } = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE category = 'airport_transfer'
       AND is_active = true
       AND LOWER(city) = LOWER($1)`,
    [cityName],
  );
  const mins = {};
  for (const r of rows) {
    let blob = r.vehicle_prices;
    if (typeof blob === "string") {
      try {
        blob = JSON.parse(blob);
      } catch {
        continue;
      }
    }
    if (!blob || typeof blob !== "object") continue;
    for (const [rawKey, rawValue] of Object.entries(blob)) {
      const cls = VEHICLE_CLASSES.find((v) => rawKey.startsWith(v));
      if (!cls) continue;
      const n = Number(rawValue);
      if (!Number.isFinite(n) || n <= 0) continue;
      if (mins[cls] === undefined || n < mins[cls]) mins[cls] = n;
    }
  }
  const out = {};
  for (const cls of VEHICLE_CLASSES) {
    out[cls] = mins[cls] === undefined ? null : Math.round(mins[cls]).toString();
  }
  return out;
}

/**
 * Minimum airport-transfer price for a city, from active airport_transfer rows.
 * (The legacy routes table is empty in prod — querying it always fell back to
 * the stale fallback file, which is how the schema once advertised LE 600
 * transfers that don't exist.)
 */
async function getAirportTransferMin(c, cityName) {
  const { rows } = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE category = 'airport_transfer'
       AND is_active = true
       AND LOWER(city) = LOWER($1)`,
    [cityName],
  );
  return rows.length ? minAcrossVehiclePrices(rows) : null;
}

/**
 * Cheapest in-town transfer in the catalog, across every city.
 *
 * No city filter and no pinned slug: this backs the "from" price on
 * /transfers, which lists every city's transfers together, so pinning it
 * anywhere would advertise one city's floor as the whole page's.
 *
 * local_transfer only. The other two categories on that page price higher
 * (airport from 1,000, intercity from 2,800 at the time of writing), so the
 * page minimum is the in-town minimum — but taking it from this category by
 * name rather than as a MIN across all three keeps the number's meaning
 * stable if that ordering ever changes.
 */
async function getIntownTransferMin(c) {
  const { rows } = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE category = 'local_transfer'
       AND is_active = true`,
  );
  return rows.length ? minAcrossVehiclePrices(rows) : null;
}

/**
 * Cheapest airport transfer across every city, not just the three with pages.
 *
 * getAirportTransferMin() above answers "what does this city start at", which
 * is what a city page needs. This answers "what does the country start at",
 * which is what /transfers needs, and the two are not the same question: the
 * floor is in Hurghada, which has no page and therefore no per-city key.
 */
async function getAirportTransferFloor(c) {
  const { rows } = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE category = 'airport_transfer'
       AND is_active = true`,
  );
  return rows.length ? minAcrossVehiclePrices(rows) : null;
}

/**
 * Minimum guide daily rate for a city. The schema column is named hourlyPrice
 * but per server/services/pricing.ts the live data is actually daily — we
 * honor that convention here.
 */
async function getGuideMin(c, cityId) {
  const { rows } = await c.query(
    `SELECT MIN(CAST(hourly_price AS NUMERIC)) AS min
     FROM guide_rates
     WHERE city_id = $1 AND CAST(hourly_price AS NUMERIC) > 0`,
    [cityId],
  );
  const min = rows[0]?.min;
  if (min === null || min === undefined) return null;
  return Math.round(Number(min)).toString();
}

/** Cheapest vehicle price on one pinned catalog row. */
async function getSlugMin(c, slug) {
  const { rows } = await c.query(
    `SELECT vehicle_prices FROM service_catalog
     WHERE slug = $1 AND is_active = true`,
    [slug],
  );
  return rows.length ? minAcrossVehiclePrices(rows) : null;
}

/** guide day rate + car, or null if either side is missing. */
function sumPrices(a, b) {
  if (!a || !b) return null;
  const total = Number(a) + Number(b);
  return Number.isFinite(total) && total > 0 ? Math.round(total).toString() : null;
}

/**
 * Every snapshot value, derived from the live database.
 *
 * Returns { prices, vehicles }: `prices` is the single minimum per service that
 * the Offer schema advertises, `vehicles` is the per-class "from" price the
 * transfer pages print on their vehicle cards. Both callers — the generator and
 * the nightly drift checker — read the same result, so they cannot form
 * separate opinions about what the right price is.
 *
 * Throws if DATABASE_URL is absent or the connection fails — callers decide
 * whether that is fatal (drift check) or a fallback trigger (generator).
 */
export async function deriveFromDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  const c = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
  await c.connect();
  try {
    const out = {};
    out[SERVICE_KEYS.cairoAirport] = await getAirportTransferMin(c, "Cairo");
    out[SERVICE_KEYS.luxorAirport] = await getAirportTransferMin(c, "Luxor");
    out[SERVICE_KEYS.aswanAirport] = await getAirportTransferMin(c, "Aswan");
    out[SERVICE_KEYS.intownTransfer] = await getIntownTransferMin(c);
    out[SERVICE_KEYS.airportTransferFloor] = await getAirportTransferFloor(c);
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

    const vehicles = {};
    for (const [serviceKey, cityName] of Object.entries(VEHICLE_SERVICES)) {
      vehicles[serviceKey] = await getAirportTransferVehicleMins(c, cityName);
    }

    return { prices: out, vehicles };
  } finally {
    await c.end();
  }
}
