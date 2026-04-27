import pg from "pg";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});
const r = await pool.query("SHOW timezone; SELECT now() AT TIME ZONE 'UTC' as utc_now, now() as server_now");
console.log("Timezone setting:", r[0]?.rows ?? r.rows);
const r2 = await pool.query("SELECT current_setting('TimeZone') as tz, now() as server_now");
console.log(r2.rows);
await pool.end();
