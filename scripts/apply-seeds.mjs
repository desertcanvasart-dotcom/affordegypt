// scripts/apply-seeds.mjs
//
// Purpose
//   Applies the Phase A schema + seeds from migrations/0004_service_catalog.sql
//   to whatever Postgres the DATABASE_URL env var points at. One-shot,
//   idempotent: re-running on a partially- or fully-applied DB is safe.
//
// Usage
//   # Inline (visible in shell history — fine for ephemeral / dev):
//   DATABASE_URL="postgres://..." node scripts/apply-seeds.mjs
//
//   # Recommended for production (secret stays out of history):
//   dotenv -e .env.production -- node scripts/apply-seeds.mjs
//
// Why it runs the whole SQL file
//   migrations/0004_service_catalog.sql is written to be idempotent end-to-end:
//     - CREATE TABLE IF NOT EXISTS         → no-op if tables already exist
//     - CREATE INDEX IF NOT EXISTS         → no-op if indexes already exist
//     - INSERT ... ON CONFLICT (slug) DO NOTHING → no duplicates on re-run
//   Running the whole file is simpler and strictly safer than parsing the
//   file to extract just the INSERT statements, and it self-heals if the
//   target DB is missing any of the DDL too (e.g. schema applied via
//   drizzle-kit push but missing one of the indexes).
//
// Exit codes
//   0  success
//   1  any error (missing DATABASE_URL, connection failure, SQL failure, …)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.resolve(__dirname, "..", "migrations", "0004_service_catalog.sql");

function fail(msg) {
  console.error(`apply-seeds: ${msg}`);
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url || url.trim() === "") {
  fail("DATABASE_URL is not set. Pass it inline (DATABASE_URL=… node …) or via dotenv-cli (dotenv -e .env.production -- node …).");
}

// Extract just the hostname so the operator can confirm which environment
// they're hitting. Never log the URL itself — it contains credentials.
let dbHost;
try {
  dbHost = new URL(url).hostname;
} catch {
  fail("DATABASE_URL is not a valid URL.");
}

if (!fs.existsSync(SQL_PATH)) {
  fail(`Cannot find SQL file at ${SQL_PATH}`);
}
const sqlText = fs.readFileSync(SQL_PATH, "utf8");

const pool = new pg.Pool({
  connectionString: url,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

console.log(`apply-seeds: connecting to ${dbHost}`);
console.log(`apply-seeds: running ${path.relative(path.resolve(__dirname, ".."), SQL_PATH)}`);

try {
  // node-postgres' simple query protocol (no parameters) accepts multiple
  // semicolon-separated statements in a single query call. The whole file
  // runs as one round-trip; if any statement throws, the rest don't run.
  await pool.query(sqlText);

  const counts = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS n FROM trip_types"),
    pool.query("SELECT COUNT(*)::int AS n FROM service_categories"),
    pool.query("SELECT COUNT(*)::int AS n FROM service_catalog"),
  ]);

  console.log("");
  console.log("Seeds applied. Row counts:");
  console.log(`  trip_types:          ${counts[0].rows[0].n}`);
  console.log(`  service_categories:  ${counts[1].rows[0].n}`);
  console.log(`  service_catalog:     ${counts[2].rows[0].n}`);
} catch (err) {
  console.error("");
  console.error("apply-seeds: failed.");
  console.error(err?.stack ?? err?.message ?? String(err));
  await pool.end().catch(() => {});
  process.exit(1);
} finally {
  await pool.end().catch(() => {});
}
