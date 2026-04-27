// Seed pricing_tiers from the legacy routes.base_price_by_vehicle JSONB.
//
// Idempotent: an INSERT is only issued when no tier exists for
// (route_id, vehicle_type_id, license_class_id). To re-run cleanly after
// schema changes, set REPLACE=1 to delete existing tiers first.

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const replace = process.env.REPLACE === "1";

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (replace) {
      const r = await client.query(`DELETE FROM pricing_tiers WHERE route_id IS NOT NULL`);
      console.log(`Deleted ${r.rowCount} route-scoped pricing tiers (REPLACE=1)`);
    }

    const routes = await client.query(`
      SELECT id, base_price_by_vehicle
      FROM routes
      WHERE base_price_by_vehicle IS NOT NULL
    `);

    let inserted = 0;
    let skipped = 0;
    let malformed = 0;

    for (const row of routes.rows) {
      const blob = row.base_price_by_vehicle;
      if (typeof blob !== "object" || blob === null) {
        malformed += 1;
        continue;
      }
      for (const [vehicleId, byLicense] of Object.entries(blob)) {
        if (typeof byLicense !== "object" || byLicense === null) {
          malformed += 1;
          continue;
        }
        for (const [licenseId, price] of Object.entries(byLicense)) {
          const v = parseInt(vehicleId, 10);
          const l = parseInt(licenseId, 10);
          const p = typeof price === "string" ? parseFloat(price) : price;
          if (!Number.isFinite(v) || !Number.isFinite(l) || !Number.isFinite(p)) {
            malformed += 1;
            continue;
          }

          const existing = await client.query(
            `SELECT id FROM pricing_tiers
             WHERE route_id = $1 AND vehicle_type_id = $2 AND license_class_id = $3
               AND effective_to IS NULL
             LIMIT 1`,
            [row.id, v, l],
          );
          if (existing.rowCount > 0) {
            skipped += 1;
            continue;
          }

          await client.query(
            `INSERT INTO pricing_tiers
             (route_id, vehicle_type_id, license_class_id, base_price, notes)
             VALUES ($1, $2, $3, $4, $5)`,
            [row.id, v, l, p.toFixed(2), "Seeded from routes.base_price_by_vehicle"],
          );
          inserted += 1;
        }
      }
    }

    await client.query("COMMIT");
    console.log(
      `pricing_tiers seed complete — inserted: ${inserted}, skipped (already present): ${skipped}, malformed: ${malformed}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
