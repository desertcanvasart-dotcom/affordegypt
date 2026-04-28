import pg from "pg";
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});
const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promote-admin.mjs EMAIL");
  process.exit(1);
}
const r = await pool.query(
  "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, username, email, role",
  [email.toLowerCase().trim()],
);
if (r.rowCount === 0) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}
console.log("Promoted:", r.rows[0]);
await pool.end();
