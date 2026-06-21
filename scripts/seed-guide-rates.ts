// Seed guide_rates with real per-language daily pricing, standard across every
// city. Replaces any existing rows (the prior seed rows were placeholder
// 7-10 EGP values). Idempotent: re-running produces the same final state.
//
// guide_rates.hourly_price stores the DAILY rate (legacy column name).
//
// Run against prod (DATABASE_URL in .env points at the live DB):
//   npx tsx scripts/seed-guide-rates.ts
// or with an explicit env file:
//   npx dotenv-cli -e .env.production -- npx tsx scripts/seed-guide-rates.ts

import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { cities, guideRates } from "../shared/schema.ts";
import { GUIDE_DAILY_PRICE_BY_LANGUAGE } from "../shared/guide-pricing.ts";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL must be set");

  const pool = new pg.Pool({
    connectionString,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  try {
    const allCities = await db
      .select({ id: cities.id, name: cities.name })
      .from(cities);
    if (allCities.length === 0) {
      throw new Error("No cities found — refusing to seed guide rates.");
    }

    const rows = allCities.flatMap((city) =>
      Object.entries(GUIDE_DAILY_PRICE_BY_LANGUAGE).map(([language, price]) => ({
        cityId: city.id,
        language,
        hourlyPrice: price,
        name: `${language} Guide`,
      })),
    );

    const before = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(guideRates);
    await db.delete(guideRates);
    await db.insert(guideRates).values(rows);
    const after = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(guideRates);

    console.log(`Cities (${allCities.length}): ${allCities.map((c) => c.name).join(", ")}`);
    console.log(`Languages (${Object.keys(GUIDE_DAILY_PRICE_BY_LANGUAGE).length}): ${Object.keys(GUIDE_DAILY_PRICE_BY_LANGUAGE).join(", ")}`);
    console.log(`guide_rates rows: ${before[0].n} -> ${after[0].n} (inserted ${rows.length})`);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
