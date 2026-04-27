// Apply a single SQL file to the database in DATABASE_URL.
// Usage: node scripts/run-sql.mjs <path-to-sql>
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(file), "utf8");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log(`Applied ${file}`);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
} finally {
  await pool.end();
}
