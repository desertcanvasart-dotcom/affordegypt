// Reset a user's password by email. One-shot admin tool.
// Usage: node scripts/reset-password.mjs EMAIL NEW_PASSWORD
import bcrypt from "bcrypt";
import pg from "pg";

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/reset-password.mjs EMAIL NEW_PASSWORD");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const hash = await bcrypt.hash(password, 10);
const r = await pool.query(
  "UPDATE users SET password = $1 WHERE email = $2 RETURNING id, username, email, role",
  [hash, email.toLowerCase().trim()],
);
if (r.rowCount === 0) {
  console.error(`No user with email ${email}`);
  process.exit(1);
}
console.log("Password reset for:", r.rows[0]);
await pool.end();
