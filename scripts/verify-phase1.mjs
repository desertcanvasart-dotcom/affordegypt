import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const tables = ["quote_line_items", "pricing_tiers", "seasonal_modifiers", "commission_rules"];
const cols = [
  ["quotes", "version"],
  ["quotes", "frozen_at"],
];
const indexes = [
  "idx_quote_line_items_quote",
  "idx_pricing_tiers_lookup",
  "idx_bookings_user",
  "idx_routes_from_city",
  "uq_bookings_reference",
];

const t = await pool.query(
  `SELECT table_name FROM information_schema.tables WHERE table_name = ANY($1)`,
  [tables],
);
const c = await pool.query(
  `SELECT table_name, column_name FROM information_schema.columns
   WHERE (table_name, column_name) IN (${cols.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(",")})`,
  cols.flat(),
);
const i = await pool.query(
  `SELECT indexname FROM pg_indexes WHERE indexname = ANY($1)`,
  [indexes],
);

console.log("Tables present:", t.rows.map((r) => r.table_name).sort());
console.log("Columns present:", c.rows.map((r) => `${r.table_name}.${r.column_name}`).sort());
console.log("Indexes present:", i.rows.map((r) => r.indexname).sort());

const missingTables = tables.filter((x) => !t.rows.some((r) => r.table_name === x));
const missingCols = cols.filter(([t, c]) => !i.rows.some((r) => r.table_name === t && r.column_name === c));
const missingIdx = indexes.filter((x) => !i.rows.some((r) => r.indexname === x));

if (missingTables.length || missingIdx.length) {
  console.error("MISSING tables:", missingTables, "indexes:", missingIdx);
  process.exit(1);
}
console.log("\nAll Phase 1a artefacts present.");
await pool.end();
