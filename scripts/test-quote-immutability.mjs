// Verifies the Phase 2 invariant: once a quote is frozen, changing the
// underlying pricing tier does NOT change the quote's total or line totals.
// Cleans up everything it creates so it can run repeatedly.

import pg from "pg";
import { setTimeout as sleep } from "node:timers/promises";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const BASE = process.env.APP_BASE_URL || "https://affordegypt-production.up.railway.app";

async function api(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

const client = await pool.connect();
let createdQuoteId = null;
let bumpedTierId = null;
let originalPrice = null;
try {
  // Pick a tier we can bump
  const r = await client.query(
    `SELECT id, route_id, vehicle_type_id, license_class_id, base_price
     FROM pricing_tiers
     WHERE route_id IS NOT NULL AND effective_to IS NULL
     ORDER BY id LIMIT 1`,
  );
  if (r.rowCount === 0) throw new Error("No pricing_tiers seeded");
  const tier = r.rows[0];
  console.log(`Using tier ${tier.id}: route=${tier.route_id} v=${tier.vehicle_type_id} l=${tier.license_class_id} price=${tier.base_price}`);

  // Create quote at current price via API
  const quote = await api("/api/quotes", {
    routeId: tier.route_id,
    vehicleTypeId: tier.vehicle_type_id,
    licenseClassId: tier.license_class_id,
    travelers: 2,
  });
  createdQuoteId = quote.id;
  const totalBefore = quote.total;
  const lineTotalBefore = quote.lineItems?.[0]?.lineTotal;
  console.log(`Quote ${createdQuoteId} created. total=${totalBefore} lineTotal=${lineTotalBefore} frozenAt=${quote.frozenAt}`);

  if (!quote.frozenAt) throw new Error("Quote was not frozen on creation");
  if (!lineTotalBefore) throw new Error("Quote has no line items");

  // Bump the tier price by 50%
  bumpedTierId = tier.id;
  originalPrice = tier.base_price;
  const newPrice = (parseFloat(tier.base_price) * 1.5).toFixed(2);
  await client.query(`UPDATE pricing_tiers SET base_price = $1 WHERE id = $2`, [newPrice, tier.id]);
  console.log(`Bumped tier ${tier.id} price ${tier.base_price} → ${newPrice}`);

  // Re-read the quote
  const reread = await fetch(`${BASE}/api/quotes/${createdQuoteId}`).then((r) => r.json());
  const totalAfter = reread.total;
  const lineTotalAfter = reread.lineItems?.[0]?.lineTotal;
  console.log(`Quote re-read. total=${totalAfter} lineTotal=${lineTotalAfter}`);

  if (totalBefore !== totalAfter) {
    throw new Error(`FAIL: quote total changed. before=${totalBefore} after=${totalAfter}`);
  }
  if (lineTotalBefore !== lineTotalAfter) {
    throw new Error(`FAIL: line total changed. before=${lineTotalBefore} after=${lineTotalAfter}`);
  }

  console.log("\n✓ PASS: quote total and line total are immutable across tier price change");
} finally {
  // Cleanup: restore tier, delete quote + line items
  if (bumpedTierId && originalPrice !== null) {
    await client.query(`UPDATE pricing_tiers SET base_price = $1 WHERE id = $2`, [originalPrice, bumpedTierId]);
    console.log(`Restored tier ${bumpedTierId} price`);
  }
  if (createdQuoteId) {
    await client.query(`DELETE FROM quote_line_items WHERE quote_id = $1`, [createdQuoteId]);
    await client.query(`DELETE FROM quotes WHERE id = $1`, [createdQuoteId]);
    console.log(`Cleaned up quote ${createdQuoteId}`);
  }
  client.release();
  await pool.end();
}
