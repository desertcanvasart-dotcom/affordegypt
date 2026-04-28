// Seed the attractions table with the data that used to live as a hardcoded
// map in calculateQuotePrice. Idempotent: skips rows whose name already
// exists. Prices are USD-equivalent values from the original code.

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

// City lookup by name → id, populated below
const cityMap = {};

// Each entry: { citySlug, name, category, ticketPrice, duration }
// citySlug must match cities.slug in the DB.
const attractions = [
  // Cairo
  { citySlug: "cairo", name: "Pyramids of Giza", category: "historical", ticketPrice: "15.00", duration: 3 },
  { citySlug: "cairo", name: "Khan el-Khalili", category: "cultural", ticketPrice: "8.00", duration: 2 },
  { citySlug: "cairo", name: "Al Muizz Street", category: "cultural", ticketPrice: "5.00", duration: 2 },
  { citySlug: "cairo", name: "Citadel of Saladin", category: "historical", ticketPrice: "12.00", duration: 2 },
  { citySlug: "cairo", name: "Coptic Cairo", category: "historical", ticketPrice: "8.00", duration: 2 },
  { citySlug: "cairo", name: "Egyptian Museum", category: "museum", ticketPrice: "18.00", duration: 3 },
  { citySlug: "cairo", name: "Cairo Tower", category: "landmark", ticketPrice: "10.00", duration: 1 },

  // Alexandria
  { citySlug: "alexandria", name: "Bibliotheca Alexandrina", category: "cultural", ticketPrice: "12.00", duration: 2 },
  { citySlug: "alexandria", name: "Qaitbay Citadel", category: "historical", ticketPrice: "8.00", duration: 2 },
  { citySlug: "alexandria", name: "Montaza Palace", category: "landmark", ticketPrice: "10.00", duration: 2 },
  { citySlug: "alexandria", name: "Catacombs of Kom el Shoqafa", category: "historical", ticketPrice: "15.00", duration: 2 },
  { citySlug: "alexandria", name: "Antiquities of Rosetta City", category: "historical", ticketPrice: "10.00", duration: 2 },

  // Luxor
  { citySlug: "luxor", name: "Luxor Temple", category: "historical", ticketPrice: "12.00", duration: 2 },
  { citySlug: "luxor", name: "Valley of the Kings", category: "historical", ticketPrice: "20.00", duration: 3 },
  { citySlug: "luxor", name: "Karnak Temple", category: "historical", ticketPrice: "15.00", duration: 3 },
  { citySlug: "luxor", name: "Hatshepsut Temple", category: "historical", ticketPrice: "12.00", duration: 2 },

  // Aswan
  { citySlug: "aswan", name: "Abu Simbel Temples", category: "historical", ticketPrice: "35.00", duration: 4 },
  { citySlug: "aswan", name: "Philae Temple", category: "historical", ticketPrice: "15.00", duration: 2 },
  { citySlug: "aswan", name: "High Dam", category: "landmark", ticketPrice: "8.00", duration: 1 },
  { citySlug: "aswan", name: "Unfinished Obelisk", category: "historical", ticketPrice: "5.00", duration: 1 },

  // Hurghada
  { citySlug: "hurghada", name: "Hurghada Marina", category: "leisure", ticketPrice: "10.00", duration: 2 },
  { citySlug: "hurghada", name: "Desert Safari", category: "adventure", ticketPrice: "45.00", duration: 6 },
  { citySlug: "hurghada", name: "Snorkeling Trip", category: "adventure", ticketPrice: "35.00", duration: 4 },

  // Sharm El Sheikh
  { citySlug: "sharm-el-sheikh", name: "Old Market", category: "cultural", ticketPrice: "8.00", duration: 2 },
  { citySlug: "sharm-el-sheikh", name: "Ras Mohammed National Park", category: "adventure", ticketPrice: "25.00", duration: 5 },
  { citySlug: "sharm-el-sheikh", name: "Colored Canyon", category: "adventure", ticketPrice: "30.00", duration: 5 },
];

const client = await pool.connect();
try {
  // Build city slug → id map
  const cities = await client.query(`SELECT id, slug FROM cities`);
  for (const c of cities.rows) cityMap[c.slug] = c.id;
  console.log(`Loaded ${cities.rows.length} cities`);

  let inserted = 0;
  let skippedNoCity = 0;
  let skippedExisting = 0;

  for (const a of attractions) {
    const cityId = cityMap[a.citySlug];
    if (!cityId) {
      console.warn(`No city for slug "${a.citySlug}" — skipping ${a.name}`);
      skippedNoCity += 1;
      continue;
    }

    const exists = await client.query(
      `SELECT id FROM attractions WHERE name = $1 AND city_id = $2 LIMIT 1`,
      [a.name, cityId],
    );
    if (exists.rowCount > 0) {
      skippedExisting += 1;
      continue;
    }

    await client.query(
      `INSERT INTO attractions (city_id, name, category, ticket_price, duration, is_active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [cityId, a.name, a.category, a.ticketPrice, a.duration],
    );
    inserted += 1;
  }

  console.log(`\nSeed complete — inserted: ${inserted}, already present: ${skippedExisting}, missing city: ${skippedNoCity}`);
  const total = await client.query(`SELECT count(*) FROM attractions`);
  console.log(`attractions row count now: ${total.rows[0].count}`);
} finally {
  client.release();
  await pool.end();
}
