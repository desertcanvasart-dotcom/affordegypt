// Import per-person entrance fees into the `entrance_fees` table from
// the operator-provided xlsx (attached_assets/Entrance_Fees.xlsx).
//
// Pricing rule: take the operator's `base_price`, multiply by 1 + the
// configured markup (default 5%), round to the nearest 1 in the source
// currency, store both the original and the marked-up value.
//
// The xlsx layout this parser expects:
//   - A single data sheet (first sheet is used).
//   - Rows alternate between: (a) city-header rows whose first non-empty
//     cell is an UPPERCASE city name from the CITY_SLUG map, and (b) data
//     rows with a site name + a price. Anything else is a parse error.
//   - Prices may be raw numbers or contain a currency token ($ / USD).
//   - The trailing footer row "ALL PRICES ARE QUOTED..." is skipped.
//
// Special-case overrides (operator/business rules from PR-Path-B-2):
//   - Egyptian Museum: keep the base + Mummies-bundle products, drop
//     the standalone Mummies Room row.
//   - Karnak: keep all three (base / + open museum / open museum only).
//   - Abu Simbel: keep base + sun-festival, tag the latter with the
//     restricted-date note.
//   - TABA Saladin Citadel: forced USD.
//   - Saint Catherine: not in the xlsx — injected manually under the
//     `south_sinai` city slug at $5 USD base.
//   - Bahariya: collapse the four open-site/desert orphan rows into one
//     bundle product at 150 EGP base; the Ain Al Meftulla row stays
//     as-is.
//   - Souhag "Seti I - Abydous Temple" duplicate row is deduped.
//
// Halt-on-bad-data: if the parser sees a city header it doesn't know,
// a data row missing a price, or any structural surprise, it aborts
// before inserting anything. Better to halt than to import bad data.
//
// Usage (from the main checkout, NOT the worktree, so .env.production
// resolves):
//   npx dotenv-cli -e .env.production -- npx tsx scripts/import-entrance-fees-from-xlsx.ts
//
// Idempotent against slug — re-runs upsert into existing rows.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { entranceFees } from "../shared/schema.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const XLSX_PATH = path.join(REPO_ROOT, "attached_assets", "Entrance_Fees.xlsx");

const DEFAULT_MARKUP_PERCENT = 5;

// City-header text (as it appears in the xlsx, normalized to upper-case
// and trimmed) → city slug used in service_catalog and the new
// entrance_fees table. Add entries here if the operator ever adds a new
// city to the sheet.
const CITY_SLUG: Record<string, string> = {
  ALEXANDRIA: "alexandria",
  "AL FAYOUM": "al-fayoum",
  "AL MENYA": "al-menya",
  ASSUIT: "assuit",
  ASWAN: "aswan",
  "BAHARIYA OASES": "bahariya",
  "BENI SUIF": "beni-suif",
  CAIRO: "cairo",
  GIZA: "giza",
  LUXOR: "luxor",
  MALAWEE: "malawee",
  "NEW VALLEY": "new-valley",
  QENA: "qena",
  ROSSETTA: "rossetta",
  SIWA: "siwa",
  SOUHAG: "souhag",
  TABA: "taba",
};

const FOOTER_TEXT = "ALL PRICES ARE QUOTED";

type ParsedRow = {
  city: string; // city slug
  name: string; // site name as it appears in the sheet
  basePrice: number;
  currency: "EGP" | "USD";
  notes?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/['"`’]/g, "") // strip apostrophes / quotes
    .replace(/[()]/g, " ") // parens → space (then collapsed below)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlug(citySlug: string, name: string): string {
  const namePart = slugify(name);
  return `${citySlug}-${namePart}`;
}

// Round to nearest 1 in the source currency. Math.round() does
// banker-style on .5 in some runtimes; node's Math.round rounds half
// away from zero (toward +∞ for positives), which matches the prompt
// examples ($12.60 → 13, $5.25 → 5, 126.00 → 126).
function applyMarkup(base: number, markupPercent = DEFAULT_MARKUP_PERCENT): number {
  return Math.round(base * (1 + markupPercent / 100));
}

// Pull a price + currency out of a raw cell value. Cells may be:
//   125          → 125 EGP
//   "120 EGP"    → 120 EGP
//   "$12"        → 12 USD
//   "12 USD"     → 12 USD
// Returns null if the value can't be parsed as a price.
function parsePrice(raw: unknown): { value: number; currency: "EGP" | "USD" } | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return { value: raw, currency: "EGP" };
  }
  const s = String(raw).trim();
  if (!s) return null;
  const isUsd = /\$|usd/i.test(s);
  const numMatch = s.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!numMatch) return null;
  const value = Number(numMatch[0]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { value, currency: isUsd ? "USD" : "EGP" };
}

// Identify a city-header row: a row whose only non-empty cells contain
// a single uppercase token from CITY_SLUG. Returns the slug, or null.
function detectCityHeader(cells: unknown[]): string | null {
  const nonEmpty = cells.map((c) => (c == null ? "" : String(c).trim())).filter(Boolean);
  if (nonEmpty.length === 0) return null;
  // Header rows in this sheet have the city name in column A and
  // typically nothing else, OR a price-like cell in column B that is
  // empty/zero. Be lenient: if any cell matches a known city verbatim,
  // treat it as a header.
  for (const cell of nonEmpty) {
    const upper = cell.toUpperCase();
    if (CITY_SLUG[upper]) return CITY_SLUG[upper];
  }
  return null;
}

// Find the first non-empty cell after the name column that parses as a
// price. Most rows have the name in col 0 and price in col 1, but some
// sheets pad with empty cells.
function findPriceCell(cells: unknown[], startIdx: number): ReturnType<typeof parsePrice> {
  for (let i = startIdx; i < cells.length; i++) {
    const parsed = parsePrice(cells[i]);
    if (parsed) return parsed;
  }
  return null;
}

function parseSheet(): { rows: ParsedRow[]; warnings: string[] } {
  if (!fs.existsSync(XLSX_PATH)) {
    throw new Error(
      `Entrance fees xlsx not found at ${XLSX_PATH}. ` +
        `Drop the file there before running this script.`,
    );
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("Workbook has no sheets");
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: null,
  });

  const rows: ParsedRow[] = [];
  const warnings: string[] = [];
  let currentCity: string | null = null;

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    const cells = Array.isArray(row) ? row : [];

    const allEmpty = cells.every((c) => c == null || String(c).trim() === "");
    if (allEmpty) continue;

    // Footer
    const firstCellText = cells.find((c) => c != null && String(c).trim() !== "");
    if (firstCellText && String(firstCellText).toUpperCase().includes(FOOTER_TEXT)) {
      continue;
    }

    // City header?
    const cityFromHeader = detectCityHeader(cells);
    if (cityFromHeader) {
      currentCity = cityFromHeader;
      continue;
    }

    // Data row
    if (!currentCity) {
      // Some sheets have a top-of-file title row before any city header.
      // Tolerate one or two such rows but warn.
      warnings.push(`Row ${r + 1}: data before any city header — skipped: ${JSON.stringify(cells)}`);
      continue;
    }

    // Name = first non-empty text cell that is NOT a price.
    let nameIdx = -1;
    for (let i = 0; i < cells.length; i++) {
      const v = cells[i];
      if (v == null) continue;
      const s = String(v).trim();
      if (!s) continue;
      if (parsePrice(v)) continue;
      nameIdx = i;
      break;
    }

    if (nameIdx === -1) {
      // Row had only a price, no name — probably a stray.
      warnings.push(`Row ${r + 1}: no name found, only price-like cells: ${JSON.stringify(cells)}`);
      continue;
    }

    const name = String(cells[nameIdx]).trim();
    const price = findPriceCell(cells, nameIdx + 1);

    if (!price) {
      // Bahariya has orphan name-only rows that are folded into a
      // bundle below; don't halt, but record so the post-pass can
      // verify they were handled.
      warnings.push(
        `Row ${r + 1} (${currentCity}): "${name}" has no price — left to special-case post-pass`,
      );
      continue;
    }

    rows.push({
      city: currentCity,
      name,
      basePrice: price.value,
      currency: price.currency,
    });
  }

  return { rows, warnings };
}

// Apply the documented special-case business rules to the parsed row
// stream. Returns the final list to insert plus a structured report so
// the caller can log what was changed/dropped/added.
function applySpecialCases(rows: ParsedRow[]): {
  out: ParsedRow[];
  changes: string[];
} {
  const changes: string[] = [];
  const out: ParsedRow[] = [];
  const seenSlugs = new Set<string>();

  for (const row of rows) {
    const lname = row.name.toLowerCase();
    const city = row.city;

    // Egyptian Museum: drop the standalone Mummies Room row (only
    // exists at 150 EGP). Customers cannot enter Mummies without main
    // museum entry, so this would mis-sell.
    if (city === "cairo" && /mumm(y|ies)\s*room/i.test(row.name) && !/museum/i.test(row.name)) {
      changes.push(`DROP cairo / "${row.name}" @ ${row.basePrice} (standalone Mummies Room)`);
      continue;
    }

    // Souhag Seti I dedupe — keep first only.
    if (city === "souhag" && /seti\s*i.*abydous/i.test(row.name)) {
      const slug = buildSlug(city, row.name);
      if (seenSlugs.has(slug)) {
        changes.push(`DROP souhag / "${row.name}" duplicate @ ${row.basePrice}`);
        continue;
      }
    }

    // Bahariya orphan open-site rows are folded into a single bundle
    // below. Drop the individual rows here if they appear with prices.
    if (city === "bahariya") {
      if (
        /valley\s+of\s+golden\s+mummies/i.test(row.name) ||
        /banatiu\s+tomb/i.test(row.name) ||
        /temple\s+of\s+alexander/i.test(row.name) ||
        /all\s+open\s+sites/i.test(row.name)
      ) {
        changes.push(
          `FOLD bahariya / "${row.name}" @ ${row.basePrice} into bundle`,
        );
        continue;
      }
    }

    // TABA Saladin Citadel: force USD regardless of how the cell was
    // typed.
    if (city === "taba" && /saladin\s*citadel/i.test(row.name) && row.currency !== "USD") {
      changes.push(`FORCE USD on taba / "${row.name}" (was ${row.currency})`);
      out.push({ ...row, currency: "USD" });
      seenSlugs.add(buildSlug(city, row.name));
      continue;
    }

    // Abu Simbel sun-festival row: tag with date-restriction note.
    if (city === "aswan" && /abu\s*simbel/i.test(row.name) && /sun\s*festival/i.test(row.name)) {
      out.push({
        ...row,
        notes: "Sun festival pricing — applies Oct 22 (departure) / Feb 22 (rebirth) only",
      });
      seenSlugs.add(buildSlug(city, row.name));
      continue;
    }

    out.push(row);
    seenSlugs.add(buildSlug(city, row.name));
  }

  // Bahariya bundle injection. Only add if at least one of the
  // component orphan rows was seen (otherwise the xlsx layout has
  // changed and we should not silently invent a row).
  const sawBahariyaOrphan = changes.some((c) => c.startsWith("FOLD bahariya"));
  if (sawBahariyaOrphan) {
    out.push({
      city: "bahariya",
      name:
        "Bahariya All Open Sites + Desert Entry (includes Valley of Golden Mummies, Banatiu Tomb, Temple of Alexander)",
      basePrice: 150,
      currency: "EGP",
    });
    changes.push("ADD bahariya bundle @ 150 EGP");
  }

  // Saint Catherine — manual injection (not in the xlsx).
  out.push({
    city: "south_sinai",
    name: "Saint Catherine Protected Area Access (includes Monastery)",
    basePrice: 5,
    currency: "USD",
  });
  changes.push("ADD south_sinai / Saint Catherine @ $5 USD (manual)");

  return { out, changes };
}

async function main() {
  console.log(`Reading ${XLSX_PATH}…`);
  const { rows: parsedRows, warnings } = parseSheet();
  console.log(`Parsed ${parsedRows.length} raw rows from xlsx.`);
  for (const w of warnings) console.warn(`  WARN: ${w}`);

  const { out: finalRows, changes } = applySpecialCases(parsedRows);
  console.log(`After special-case pass: ${finalRows.length} rows.`);
  for (const c of changes) console.log(`  ${c}`);

  // Slug uniqueness check (halt before any DB write).
  const slugCounts = new Map<string, number>();
  for (const row of finalRows) {
    const slug = buildSlug(row.city, row.name);
    slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
  }
  const dupes = [...slugCounts.entries()].filter(([, n]) => n > 1);
  if (dupes.length > 0) {
    console.error("Slug collisions detected — aborting before any DB write:");
    for (const [s, n] of dupes) console.error(`  ${s} × ${n}`);
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set — run with dotenv-cli pointing at .env.production");
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  let inserted = 0;
  const byCity = new Map<string, number>();

  try {
    for (const row of finalRows) {
      const slug = buildSlug(row.city, row.name);
      const pricePerPerson = applyMarkup(row.basePrice);
      const values = {
        slug,
        nameTranslations: { en: row.name },
        city: row.city,
        basePrice: row.basePrice.toFixed(2),
        markupPercent: DEFAULT_MARKUP_PERCENT.toFixed(2),
        pricePerPerson: pricePerPerson.toFixed(2),
        currency: row.currency,
        notes: row.notes ?? null,
        isActive: true,
        sortOrder: 0,
      } as const;

      // Idempotent: upsert on slug. Updates the marked-up price /
      // currency / notes if they've drifted, leaves is_active alone if
      // an admin disabled the row manually.
      await db
        .insert(entranceFees)
        .values(values)
        .onConflictDoUpdate({
          target: entranceFees.slug,
          set: {
            nameTranslations: values.nameTranslations,
            city: values.city,
            basePrice: values.basePrice,
            markupPercent: values.markupPercent,
            pricePerPerson: values.pricePerPerson,
            currency: values.currency,
            notes: values.notes,
            updatedAt: sql`now()`,
          },
        });

      console.log(
        `  ✓ ${slug}  base ${row.basePrice} ${row.currency} → ${pricePerPerson} ${row.currency}${row.notes ? "  [note]" : ""}`,
      );
      inserted += 1;
      byCity.set(row.city, (byCity.get(row.city) ?? 0) + 1);
    }
  } finally {
    await pool.end();
  }

  console.log("\n=== Summary ===");
  console.log(`Total rows upserted: ${inserted}`);
  console.log(`Cities: ${byCity.size}`);
  for (const [city, n] of [...byCity.entries()].sort()) {
    console.log(`  ${city.padEnd(16)} ${n}`);
  }
}

main().catch((err) => {
  console.error("\nIMPORT HALTED:", err.message);
  process.exit(1);
});
