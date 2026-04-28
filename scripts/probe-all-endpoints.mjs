// Walk every public GET endpoint on the live site and record its status.
// Reports any non-2xx, slow, or empty responses.

const BASE = process.env.APP_BASE_URL || "https://affordegypt.com";

const endpoints = [
  "/",
  "/api/health",
  "/api/cities",
  "/api/vehicle-types",
  "/api/license-classes",
  "/api/routes",
  "/api/guide-rates",
  "/api/time-blocks",
  "/api/add-ons",
  "/api/addons",
  "/api/attractions",
  "/api/reviews",
  "/api/reviews/all",
  "/api/quotes",
  "/api/admin/bookings",
  "/api/pricing/routes",
  "/api/pricing/languages",
  "/api/pricing/addons",
];

const results = [];
for (const path of endpoints) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "GET",
      headers: { accept: "application/json,text/html" },
      signal: AbortSignal.timeout(20000),
    });
    const ms = Date.now() - start;
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const issue = res.status >= 400
      ? `HTTP ${res.status}`
      : ms > 3000 ? `slow (${ms}ms)`
      : (parsed && Array.isArray(parsed) && parsed.length === 0) ? "empty array"
      : null;
    results.push({ path, status: res.status, ms, issue, sample: text.slice(0, 100) });
    console.log(`${res.status === 200 ? "✓" : "✗"} ${res.status} ${path} (${ms}ms)${issue ? `  ← ${issue}` : ""}`);
  } catch (err) {
    results.push({ path, status: "ERROR", ms: Date.now() - start, issue: err.message });
    console.log(`✗ ERROR ${path}: ${err.message}`);
  }
}

const problems = results.filter((r) => r.issue);
console.log(`\n--- summary: ${problems.length}/${results.length} endpoints have issues ---`);
for (const p of problems) {
  console.log(`  ${p.path} → ${p.issue}`);
}
