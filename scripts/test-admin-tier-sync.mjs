// Verifies the Phase-3 follow-up fix: when basePriceByVehicle changes,
// pricing_tiers is updated to match, AND previously-frozen quotes retain
// their original prices.
//
// Hits the live PUT /api/routes/:id endpoint to simulate an admin edit,
// then queries the DB directly to confirm tier rows were created.
// Cleans up by restoring the original tier and JSONB.

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const BASE = process.env.APP_BASE_URL || "https://affordegypt-production.up.railway.app";

async function api(path, body, method = "POST") {
  // Retry on transient connect timeouts (Railway cold-start window).
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45000),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${text}`);
      try { return JSON.parse(text); } catch { return text; }
    } catch (err) {
      lastErr = err;
      if (attempt === 4) break;
      await new Promise((r) => setTimeout(r, 8000));
      console.log(`retry ${attempt}/3 for ${method} ${path}`);
    }
  }
  throw lastErr;
}

const client = await pool.connect();
let savedJsonBlob = null;
let savedTiers = null;
let createdQuoteId = null;
const ROUTE_ID = 1;

try {
  // Snapshot current state for cleanup
  const r0 = await client.query(`SELECT base_price_by_vehicle FROM routes WHERE id = $1`, [ROUTE_ID]);
  savedJsonBlob = r0.rows[0].base_price_by_vehicle;
  const t0 = await client.query(
    `SELECT id, vehicle_type_id, license_class_id, base_price, effective_to
     FROM pricing_tiers WHERE route_id = $1 ORDER BY id`,
    [ROUTE_ID],
  );
  savedTiers = t0.rows;
  console.log(`Snapshotted route ${ROUTE_ID}: ${savedTiers.length} tiers, JSONB has ${Object.keys(savedJsonBlob).length} vehicles`);

  // Create a frozen quote at the current (Normal Sedan) price
  const tierBefore = savedTiers.find((t) => t.vehicle_type_id === 1 && t.license_class_id === 1 && t.effective_to === null);
  if (!tierBefore) throw new Error("No active Normal Sedan tier for route 1");
  const priceBefore = parseFloat(tierBefore.base_price);

  const quote = await api("/api/quotes", {
    routeId: ROUTE_ID,
    vehicleTypeId: 1,
    licenseClassId: 1,
    travelers: 1,
  });
  createdQuoteId = quote.id;
  console.log(`Frozen quote ${createdQuoteId} at price ${priceBefore}, total=${quote.total}`);

  // Simulate admin edit: bump Sedan Normal price by 75%
  const newSedan = (priceBefore * 1.75).toFixed(2);
  console.log(`Simulating admin edit: Sedan ${priceBefore} -> ${newSedan}`);

  const adminPayload = {
    sedanPrice: newSedan,
    minivanPrice: savedJsonBlob["2"]?.["1"] ?? "0",
    vanPrice: savedJsonBlob["3"]?.["1"] ?? "0",
  };
  await api(`/api/routes/${ROUTE_ID}`, adminPayload, "PUT");

  // Verify a new Normal Sedan tier was inserted, old one closed
  const t1 = await client.query(
    `SELECT id, base_price, effective_from, effective_to
     FROM pricing_tiers
     WHERE route_id = $1 AND vehicle_type_id = 1 AND license_class_id = 1
     ORDER BY id`,
    [ROUTE_ID],
  );
  const active = t1.rows.filter((r) => r.effective_to === null);
  if (active.length !== 1) {
    throw new Error(`Expected exactly one active Normal Sedan tier, got ${active.length}`);
  }
  const activePrice = parseFloat(active[0].base_price);
  const expected = parseFloat(newSedan);
  if (Math.abs(activePrice - expected) > 0.01) {
    throw new Error(`New tier price mismatch. expected=${expected} got=${activePrice}`);
  }
  console.log(`✓ New active tier price = ${activePrice} (matches admin input ${expected})`);

  // Verify Tourism (license 2) was also synced via the 0.20 surcharge
  const tour = await client.query(
    `SELECT base_price FROM pricing_tiers
     WHERE route_id = $1 AND vehicle_type_id = 1 AND license_class_id = 2 AND effective_to IS NULL`,
    [ROUTE_ID],
  );
  const tourPrice = parseFloat(tour.rows[0].base_price);
  const tourExpected = parseFloat((expected * 1.2).toFixed(2));
  if (Math.abs(tourPrice - tourExpected) > 0.01) {
    throw new Error(`Tourism tier mismatch. expected=${tourExpected} got=${tourPrice}`);
  }
  console.log(`✓ Tourism tier auto-derived: ${tourPrice} (Normal × 1.20)`);

  // Verify the old quote is still at the original price
  const reread = await fetch(`${BASE}/api/quotes/${createdQuoteId}`).then((r) => r.json());
  const totalAfter = parseFloat(reread.total);
  if (Math.abs(totalAfter - priceBefore) > 0.01) {
    throw new Error(`Quote total drifted! before=${priceBefore} after=${totalAfter}`);
  }
  console.log(`✓ Frozen quote total still ${totalAfter} (unchanged from ${priceBefore})`);

  console.log("\n✓ PASS: admin edits propagate to pricing_tiers AND old quotes stay frozen");
} finally {
  // Cleanup
  if (savedJsonBlob) {
    await client.query(`UPDATE routes SET base_price_by_vehicle = $1 WHERE id = $2`, [
      savedJsonBlob,
      ROUTE_ID,
    ]);
  }
  if (savedTiers) {
    // Wipe and restore tiers we touched
    await client.query(
      `DELETE FROM pricing_tiers WHERE route_id = $1 AND id NOT IN (${
        savedTiers.length ? savedTiers.map((_, i) => `$${i + 2}`).join(",") : "0"
      })`,
      [ROUTE_ID, ...savedTiers.map((t) => t.id)],
    );
    for (const t of savedTiers) {
      await client.query(
        `UPDATE pricing_tiers SET base_price = $1, effective_to = $2 WHERE id = $3`,
        [t.base_price, t.effective_to, t.id],
      );
    }
    console.log(`Restored ${savedTiers.length} original tiers`);
  }
  if (createdQuoteId) {
    await client.query(`DELETE FROM quote_line_items WHERE quote_id = $1`, [createdQuoteId]);
    await client.query(`DELETE FROM quotes WHERE id = $1`, [createdQuoteId]);
    console.log(`Cleaned up quote ${createdQuoteId}`);
  }
  client.release();
  await pool.end();
}
