// End-to-end smoke test mirroring what the booking UI does:
//   1. Fetch cities, vehicle types, a route's available options
//   2. Compute live pricing (preview)
//   3. Create a booking with that exact selection
//   4. Read it back, verify the total matches the preview total
//   5. Verify the booking's quote has frozen line items
//
// Cleans up the booking + quote it creates.

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
});

const BASE = process.env.APP_BASE_URL || "https://affordegypt-production.up.railway.app";

async function api(path, body, method = "POST") {
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { "content-type": "application/json" },
        body: body !== undefined ? JSON.stringify(body) : undefined,
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

const get = (p) => api(p, undefined, "GET");

const client = await pool.connect();
let createdBookingId = null;
let createdQuoteId = null;

try {
  // 1. Fetch the data the UI fetches at startup
  console.log("→ GET /api/cities");
  const cities = await get("/api/cities");
  if (!Array.isArray(cities) || cities.length === 0) throw new Error("no cities");
  console.log(`  ${cities.length} cities (${cities[0].name}…)`);

  console.log("→ GET /api/vehicle-types");
  const vehicles = await get("/api/vehicle-types");
  if (!Array.isArray(vehicles) || vehicles.length === 0) throw new Error("no vehicle types");
  console.log(`  ${vehicles.length} vehicle types`);

  console.log("→ GET /api/routes");
  const routes = await get("/api/routes");
  if (!Array.isArray(routes) || routes.length === 0) throw new Error("no routes");
  const route = routes[0];
  console.log(`  ${routes.length} routes; using #${route.id} (${route.name ?? "unnamed"})`);

  // 2. Live pricing preview, like the sidebar does
  console.log("→ POST /api/calculate-pricing");
  const preview = await api("/api/calculate-pricing", {
    routeId: route.id,
    vehicleTypeId: vehicles[0].id,
    travelers: 2,
  });
  console.log(`  preview total = ${preview.total} ${preview.currency} (per person ${preview.perPerson})`);
  if (parseFloat(preview.total) <= 0) throw new Error("preview returned non-positive total");

  // 3. Submit the booking with the same selection
  console.log("→ POST /api/bookings");
  const booking = await api("/api/bookings", {
    routeId: route.id,
    vehicleTypeId: vehicles[0].id,
    licenseClassId: 1,
    travelers: 2,
    customerName: "E2E Test",
    customerEmail: "e2e-test@example.com",
    customerPhone: "+201000000000",
    travelDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  });
  createdBookingId = booking.id;
  createdQuoteId = booking.quoteId;
  console.log(`  booking ${booking.id} created. ref=${booking.bookingReference} total=${booking.totalAmount} quoteId=${booking.quoteId}`);

  if (parseFloat(booking.totalAmount) <= 0) throw new Error("booking totalAmount is zero");
  if (!booking.quoteId) throw new Error("booking has no quote attached");

  // 4. Server-side total must match the live preview total
  if (Math.abs(parseFloat(booking.totalAmount) - parseFloat(preview.total)) > 0.01) {
    throw new Error(`Total mismatch: preview=${preview.total} booking=${booking.totalAmount}`);
  }
  console.log(`  ✓ booking total matches preview total (${booking.totalAmount})`);

  // 5. Quote must have frozen line items
  console.log(`→ GET /api/quotes/${booking.quoteId}`);
  const quote = await get(`/api/quotes/${booking.quoteId}`);
  if (!quote.frozenAt) throw new Error("quote not frozen");
  if (!Array.isArray(quote.lineItems) || quote.lineItems.length === 0) {
    throw new Error("quote has no frozen line items");
  }
  console.log(`  ✓ quote has ${quote.lineItems.length} frozen line items, frozenAt=${quote.frozenAt}`);

  // 6. Tamper attempt: try to send a fake low total. Server should ignore.
  console.log("→ POST /api/bookings with tampered totalAmount=1");
  const tampered = await api("/api/bookings", {
    routeId: route.id,
    vehicleTypeId: vehicles[0].id,
    licenseClassId: 1,
    travelers: 2,
    customerName: "Tamper Test",
    customerEmail: "tamper@example.com",
    customerPhone: "+201000000001",
    travelDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    totalAmount: "1.00",
  });
  if (parseFloat(tampered.totalAmount) <= 1.5) {
    throw new Error(`Server accepted tampered total ${tampered.totalAmount} — recompute is broken`);
  }
  console.log(`  ✓ server ignored client total, computed ${tampered.totalAmount} instead`);

  // Cleanup the tampered booking too
  await client.query(`DELETE FROM bookings WHERE id = $1`, [tampered.id]);
  if (tampered.quoteId) {
    await client.query(`DELETE FROM quote_line_items WHERE quote_id = $1`, [tampered.quoteId]);
    await client.query(`DELETE FROM quotes WHERE id = $1`, [tampered.quoteId]);
  }

  console.log("\n✓ PASS: full booking flow works end-to-end with server-side pricing integrity");
} finally {
  if (createdBookingId) {
    await client.query(`DELETE FROM bookings WHERE id = $1`, [createdBookingId]);
  }
  if (createdQuoteId) {
    await client.query(`DELETE FROM quote_line_items WHERE quote_id = $1`, [createdQuoteId]);
    await client.query(`DELETE FROM quotes WHERE id = $1`, [createdQuoteId]);
  }
  client.release();
  await pool.end();
}
