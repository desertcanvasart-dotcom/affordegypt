import pg from "pg";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});
const r = await pool.query(`
  SELECT table_name, column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND data_type = 'timestamp without time zone'
`);
if (r.rows.length === 0) {
  console.log("All timestamp columns are timestamptz. ✓");
} else {
  console.error("Still without timezone:", r.rows);
  process.exit(1);
}
await pool.end();
