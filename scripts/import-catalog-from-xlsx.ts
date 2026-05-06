// Import service catalog rows from .xlsx files in data/catalog-import/.
//
// Each xlsx is expected to have:
//   row 1 : header (Route, sedan, minivan, van)
//   row 2 : subheader / notes (skipped)
//   row 3+: data rows
//
// Per-row derivation rules are documented inline below. The script is
// idempotent — before every POST it checks for an existing row with the
// same slug and skips if present. Run repeatedly as new sheets land in
// data/catalog-import/.
//
// Auth: reads ADMIN_EMAIL (or ADMIN_USERNAME) + ADMIN_PASSWORD and posts
// to /api/auth/login to obtain a JWT. Reads APP_URL for the target host.
//
// Usage:
//   npx dotenv-cli -e .env.production -- npx tsx scripts/import-catalog-from-xlsx.ts
//
// (TS source — invoke with tsx so the import from `shared/` resolves.)
//
// Out of scope: translations beyond English, image URLs, update-on-conflict.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import { MULTI_WORD_CITIES, deriveCity } from "../shared/city-detection.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const IMPORT_DIR = path.join(REPO_ROOT, "data", "catalog-import");

// --------------------------------------------------------------------
// Egyptian cities used for intercity detection. Order doesn't matter;
// the rule is "route name contains any of these other than origin".
// Multi-word entries must be matched as substrings.
//
// MULTI_WORD_CITIES from shared/ is folded in plus the additional
// single-word entries the destination side needs (Cairo, Luxor, etc.).
// --------------------------------------------------------------------
const EGYPTIAN_CITIES: readonly string[] = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Luxor",
  "Aswan",
  "Hurghada",
  "Safaga",
  "El-Quseir",
  "Quseir",
  "Sharm",
  "Dahab",
  "Taba",
  "Nuweiba",
  "Edfu",
  "Esna",
  "Kom Ombo",
  ...MULTI_WORD_CITIES,
];

const VEHICLE_COLUMNS = ["sedan", "minivan", "van"] as const;

// --------------------------------------------------------------------
// Trip-type derivation. Keyword matches are case-insensitive substring.
// Order matters: first match wins. "Same Day Return" overrides arrow.
// --------------------------------------------------------------------
const TRIP_TYPE_KEYWORDS: ReadonlyArray<{ match: RegExp; tripType: string }> = [
  { match: /same\s*day\s*return/i, tripType: "round_trip_same_day" },
  { match: /overnight/i, tripType: "round_trip_multi_day" },
  { match: /\(\s*12\s*hrs?\s*\)/i, tripType: "12hr" },
  { match: /\(\s*8\s*hrs?\s*\)/i, tripType: "8hr" },
  { match: /\(\s*4\s*hrs?\s*\)/i, tripType: "4hr" },
];

// Parenthetical content that should NOT be treated as a pickup zone.
const TRIP_TYPE_PAREN_PATTERNS: RegExp[] = [
  /^\s*\d+\s*hrs?\s*$/i,
  /^\s*full\s*day\s*$/i,
  /^\s*same\s*day\s*return\s*$/i,
  /^\s*overnight\s*$/i,
];

function deriveTripType(routeName: string): string | null {
  for (const { match, tripType } of TRIP_TYPE_KEYWORDS) {
    if (match.test(routeName)) return tripType;
  }
  if (routeName.includes("↔")) return "round_trip_same_day";
  if (routeName.includes("→")) return "one_way";
  return null;
}

function derivePickupZone(routeName: string, city: string): string {
  const parenMatch = routeName.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inner = parenMatch[1].trim();
    const isTripTypeParen = TRIP_TYPE_PAREN_PATTERNS.some((re) => re.test(inner));
    if (!isTripTypeParen) return inner;
  }
  return `${city} Center`;
}

// Identify the full origin-city name that prefixes the route, if it
// matches a known Egyptian city. Used to avoid treating the origin's
// own name as evidence of an intercity transfer.
function deriveOriginFullName(routeName: string): string | null {
  const lower = routeName.toLowerCase().trim();
  // Sort longest-first so "Sharm El Sheikh" wins over "Sharm".
  const sorted = [...EGYPTIAN_CITIES].sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    if (lower.startsWith(c.toLowerCase())) return c.toLowerCase();
  }
  return null;
}

function deriveCategory(routeName: string, city: string): string {
  const lower = routeName.toLowerCase();
  if (lower.includes("airport") || lower.includes("station / hotel"))
    return "airport_transfer";
  if (lower.includes("dinner") || lower.includes("lunch"))
    return "dinner_transfer";
  if (lower.includes("sound & light") || lower.includes("sound and light"))
    return "sound_light_show";
  if (lower.includes("local transfer")) return "local_transfer";

  // Intercity: contains a known Egyptian city other than the origin.
  const cityLower = city.toLowerCase();
  const originFull = deriveOriginFullName(routeName); // may be multi-word
  for (const other of EGYPTIAN_CITIES) {
    const o = other.toLowerCase();
    if (o === cityLower) continue;
    if (originFull && (o === originFull || originFull.includes(o))) continue;
    if (lower.includes(o)) return "intercity_transfer";
  }
  return "sightseeing_tour";
}

function deriveSlug(routeName: string): string {
  let s = routeName.toLowerCase();
  s = s.replace(/↔/g, "-");
  s = s.replace(/→/g, "-");
  s = s.replace(/\+/g, " and ");
  s = s.replace(/&/g, " and ");
  // Strip parens, keep their content.
  s = s.replace(/[()]/g, " ");
  // Replace any non-alphanum run with single hyphen.
  s = s.replace(/[^a-z0-9]+/g, "-");
  // Strip leading/trailing hyphens, collapse repeats.
  s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s;
}

// --------------------------------------------------------------------
// Sheet reading
// --------------------------------------------------------------------

interface SheetData {
  headers: string[];
  rows: Array<{ rowNumber: number; cells: unknown[] }>;
}

function readSheetRows(filePath: string): SheetData {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: "",
    raw: true,
  });
  if (aoa.length < 3) return { headers: [], rows: [] };

  const headers = (aoa[0] as unknown[]).map((h) =>
    String(h ?? "").trim().toLowerCase(),
  );
  const rows: SheetData["rows"] = [];
  for (let i = 2; i < aoa.length; i++) {
    rows.push({ rowNumber: i + 1, cells: aoa[i] as unknown[] });
  }
  return { headers, rows };
}

function cellNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[,  ]/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

// --------------------------------------------------------------------
// API client
// --------------------------------------------------------------------

async function login(
  appUrl: string,
  username: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${appUrl}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`login failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("login response missing token");
  return data.token;
}

async function getBySlug(
  appUrl: string,
  token: string,
  slug: string,
): Promise<{ slug: string } | null> {
  // The list endpoint doesn't accept ?slug= — use ?q= and exact-match
  // the slug client-side.
  const url = `${appUrl}/api/admin/service-catalog?q=${encodeURIComponent(slug)}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET service-catalog failed: ${res.status} ${text}`);
  }
  const rows = (await res.json()) as Array<{ slug: string }>;
  return Array.isArray(rows) ? rows.find((r) => r.slug === slug) ?? null : null;
}

async function postCatalog(
  appUrl: string,
  token: string,
  payload: Record<string, unknown>,
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${appUrl}/api/admin/service-catalog`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

// --------------------------------------------------------------------
// Main
// --------------------------------------------------------------------

interface FileCounts {
  imported: number;
  skipped: number;
  errors: number;
}

async function main() {
  const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");
  const username = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!appUrl) throw new Error("APP_URL is not set");
  if (!username) throw new Error("ADMIN_EMAIL (or ADMIN_USERNAME) is not set");
  if (!password) throw new Error("ADMIN_PASSWORD is not set");

  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`Import dir not found: ${IMPORT_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMPORT_DIR)
    .filter((f) => f.toLowerCase().endsWith(".xlsx") && !f.startsWith("~$"))
    .sort();
  if (files.length === 0) {
    console.error(`No .xlsx files in ${IMPORT_DIR}`);
    process.exit(1);
  }

  console.log(`Logging in as ${username} at ${appUrl}…`);
  const token = await login(appUrl, username, password);
  console.log("Logged in.");

  const summary = {
    imported: 0,
    skipped: 0,
    errors: 0,
    perFile: {} as Record<string, FileCounts>,
  };

  for (const file of files) {
    const filePath = path.join(IMPORT_DIR, file);
    console.log(`\n=== ${file} ===`);
    const counts: FileCounts = { imported: 0, skipped: 0, errors: 0 };

    let parsed: SheetData;
    try {
      parsed = readSheetRows(filePath);
    } catch (err: any) {
      console.error(`  ERROR reading sheet: ${err.message}`);
      summary.errors++;
      counts.errors++;
      summary.perFile[file] = counts;
      continue;
    }

    const { headers, rows } = parsed;
    const colIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      colIndex[h] = i;
    });
    const routeCol = colIndex["route"] ?? 0;

    for (const { rowNumber, cells } of rows) {
      const routeName = String(cells[routeCol] ?? "").trim();
      if (!routeName) continue;

      const ctx = `${file}:row${rowNumber} "${routeName}"`;

      try {
        const tripType = deriveTripType(routeName);
        if (!tripType) {
          console.warn(`  WARN no arrow / trip-type detected — skip (${ctx})`);
          summary.errors++;
          counts.errors++;
          continue;
        }

        const city = deriveCity(routeName);
        const category = deriveCategory(routeName, city);
        const pickupZone = derivePickupZone(routeName, city);
        const slug = deriveSlug(routeName);

        const vehiclePrices: Record<string, number> = {};
        for (const v of VEHICLE_COLUMNS) {
          const idx = colIndex[v];
          if (idx === undefined) continue;
          const n = cellNumber(cells[idx]);
          if (n === null) continue;
          vehiclePrices[`${v}_${tripType}`] = n;
        }

        if (Object.keys(vehiclePrices).length === 0) {
          console.warn(`  WARN no prices in row — skip (${ctx})`);
          summary.errors++;
          counts.errors++;
          continue;
        }

        const existing = await getBySlug(appUrl, token, slug);
        if (existing) {
          console.log(`  SKIP slug-already-exists: ${slug} (${ctx})`);
          summary.skipped++;
          counts.skipped++;
          continue;
        }

        const payload = {
          slug,
          name: routeName,
          city,
          category,
          pickupZone,
          vehiclePrices,
          nameTranslations: { en: routeName },
        };

        const { status, body } = await postCatalog(appUrl, token, payload);
        if (status === 201) {
          console.log(`  OK ${slug} → ${category} / ${tripType}`);
          summary.imported++;
          counts.imported++;
        } else if (status === 422 && body?.code === "duplicate_slug") {
          console.log(`  SKIP slug-already-exists (422): ${slug} (${ctx})`);
          summary.skipped++;
          counts.skipped++;
        } else {
          console.error(
            `  ERROR POST ${status} (${ctx}): ${JSON.stringify(body)}`,
          );
          summary.errors++;
          counts.errors++;
        }
      } catch (err: any) {
        console.error(`  ERROR ${ctx}: ${err.message}`);
        summary.errors++;
        counts.errors++;
      }
    }

    summary.perFile[file] = counts;
    console.log(
      `  ${file}: imported=${counts.imported} skipped=${counts.skipped} errors=${counts.errors}`,
    );
  }

  console.log("\n=== Summary ===");
  console.log(`Imported: ${summary.imported}`);
  console.log(`Skipped (already exists): ${summary.skipped}`);
  console.log(`Errors: ${summary.errors}`);
  console.log("\nPer-file:");
  for (const [file, c] of Object.entries(summary.perFile)) {
    console.log(
      `  ${file}: imported=${c.imported} skipped=${c.skipped} errors=${c.errors}`,
    );
  }

  if (summary.errors > 0) process.exit(2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
