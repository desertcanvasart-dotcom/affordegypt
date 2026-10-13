import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import jwt from "jsonwebtoken";
import { packageFixture } from "../tests/fixtures/package-program";

// This destructive fixture test is confined to an explicitly provisioned local QA DB.
const base = process.env.PACKAGE_QA_BASE;
const connection = process.env.PACKAGE_QA_DATABASE_URL;
if (!base || !connection || !process.env.PACKAGE_QA_JWT_SECRET)
  throw new Error(
    "Set PACKAGE_QA_BASE, PACKAGE_QA_DATABASE_URL and PACKAGE_QA_JWT_SECRET for a disposable LOCAL environment",
  );
const url = new URL(base),
  dbUrl = new URL(connection);
if (
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  !["127.0.0.1", "localhost"].includes(dbUrl.hostname) ||
  dbUrl.port !== "55439"
)
  throw new Error(
    "Refusing to run outside the disposable localhost:55439 QA database",
  );
const pool = new pg.Pool({ connectionString: connection, ssl: false });
const token = jwt.sign(
  { id: 1, username: "package-qa", email: "qa@example.com", role: "admin" },
  process.env.PACKAGE_QA_JWT_SECRET,
);
async function call(
  path: string,
  method = "GET",
  body?: unknown,
  admin = false,
) {
  const r = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(admin ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: r.status, body: await r.json() };
}
try {
  await pool.query(
    "DROP TABLE IF EXISTS package_booking_requests; DROP TABLE IF EXISTS travel_packages",
  );
  const migration = await readFile(
    new URL("../migrations/0008_ready_made_packages.sql", import.meta.url),
    "utf8",
  );
  await pool.query(migration);
  await pool.query(migration);
  assert.equal((await call("/api/admin/packages")).status, 401);
  for (const slot of [1, 2, 3])
    assert.equal(
      (
        await call(
          `/api/admin/packages/${slot}`,
          "PUT",
          { ...packageFixture(slot), expectedVersion: 0 },
          true,
        )
      ).status,
      200,
    );
  assert.deepEqual((await call("/api/packages")).body, []);
  assert.equal((await call("/api/packages/qa-package-1")).status, 404);
  assert.equal(
    (
      await call(
        "/api/admin/packages/4",
        "PUT",
        { ...packageFixture(4), expectedVersion: 0 },
        true,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "/api/admin/packages/1",
        "PUT",
        {
          ...packageFixture(1),
          expectedVersion: 1,
          status: "published",
          perPersonRates: {},
        },
        true,
      )
    ).status,
    422,
  );
  const published = await call(
    "/api/admin/packages/1",
    "PUT",
    { ...packageFixture(1), expectedVersion: 1, status: "published" },
    true,
  );
  assert.equal(published.status, 200);
  assert.equal((await call("/api/packages")).body.length, 1);
  const price = await call("/api/packages/qa-package-1/price", "POST", {
    travelers: 3,
    singleRooms: 1,
  });
  assert.equal(price.body.total, 3300);
  assert.equal(price.body.doubleRooms, 1);
  assert.equal(price.body.singleRooms, 1);
  assert.equal(
    (
      await call("/api/packages/qa-package-1/price", "POST", {
        travelers: 3,
        singleRooms: 3,
      })
    ).body.total,
    3900,
  );
  assert.equal(
    (
      await call("/api/packages/qa-package-1/price", "POST", {
        travelers: 3,
        singleRooms: 0,
      })
    ).status,
    422,
  );
  const input = {
    travelers: 3,
    singleRooms: 1,
    travelDate: "2027-01-10",
    customerName: "QA Traveler",
    customerEmail: "qa@example.com",
    customerPhone: "12345678",
    specialRequests: "Test request",
    termsAccepted: true,
    expectedTotal: 3300,
    packageVersion: published.body.version,
    requestKey: randomUUID(),
  };
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        termsAccepted: false,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        expectedTotal: 1,
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        travelDate: "2020-01-01",
      })
    ).status,
    400,
  );
  const results = await Promise.all(
    Array.from({ length: 3 }, () =>
      call("/api/packages/qa-package-1/bookings", "POST", input),
    ),
  );
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 200).length, 2);
  assert.equal(new Set(results.map((r) => r.body.bookingReference)).size, 1);
  const reference = results[0].body.bookingReference;
  const detail = await call(`/api/bookings/reference/${reference}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.booking.module, "ready_made_package");
  assert.equal(detail.body.booking.bookingStatus, "pending");
  assert.equal(Number(detail.body.quote.total), 3300);
  assert.equal(detail.body.quote.jsonBlob.package.title, "Preview program 1");
  assert.deepEqual(detail.body.quote.jsonBlob.rooms, { double: 1, single: 1 });
  assert.equal(detail.body.quote.jsonBlob.itinerary.length, 3);
  assert.equal(detail.body.quote.jsonBlob.itinerary[1].date, "2027-01-11");
  assert.equal(detail.body.quote.jsonBlob.itinerary[2].travelers, 3);
  const lines = await pool.query(
    "SELECT sum(line_total)::numeric as total, count(*) as count FROM quote_line_items WHERE quote_id=$1",
    [detail.body.quote.id],
  );
  assert.equal(Number(lines.rows[0].total), 3300);
  assert.equal(Number(lines.rows[0].count), 2);
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        customerName: "Different",
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call(
        "/api/admin/packages/1",
        "PUT",
        { ...packageFixture(1), expectedVersion: 1 },
        true,
      )
    ).status,
    409,
  );
  const changed = {
    ...packageFixture(1),
    status: "published",
    perPersonRates: { ...packageFixture(1).perPersonRates, "2": 1200 },
    expectedVersion: published.body.version,
  };
  const updated = await call("/api/admin/packages/1", "PUT", changed, true);
  assert.equal(updated.status, 200);
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        requestKey: randomUUID(),
      })
    ).status,
    409,
  );
  assert.equal(
    Number(
      (await call(`/api/bookings/reference/${reference}`)).body.quote.total,
    ),
    3300,
  );
  assert.equal(
    (
      await call(
        "/api/admin/packages/1",
        "PUT",
        { ...changed, status: "draft", expectedVersion: updated.body.version },
        true,
      )
    ).status,
    200,
  );
  assert.equal((await call("/api/packages/qa-package-1")).status, 404);
  assert.equal(
    (
      await call("/api/packages/qa-package-1/bookings", "POST", {
        ...input,
        requestKey: randomUUID(),
      })
    ).status,
    404,
  );
  assert.equal(
    (await call("/api/packages/qa-package-1/bookings", "POST", input)).status,
    200,
  );
  // Leave all three sample programs published only in this disposable local DB for UI QA.
  const rows = (await call("/api/admin/packages", "GET", undefined, true)).body;
  for (const row of rows)
    assert.equal(
      (
        await call(
          `/api/admin/packages/${row.slot}`,
          "PUT",
          {
            ...packageFixture(row.slot),
            status: "published",
            expectedVersion: row.version,
          },
          true,
        )
      ).status,
      200,
    );
  assert.equal((await call("/api/packages")).body.length, 3);
  console.log(
    "PASS: migration, three slots, draft visibility, publication gates, permissions, odd-group and room pricing, concurrent idempotency, frozen quotes, outdated checkout, and unpublishing",
  );
} finally {
  await pool.end();
}
