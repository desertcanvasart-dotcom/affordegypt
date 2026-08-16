#!/usr/bin/env node
/**
 * Hardcoded-string guard.
 *
 * The site ships four locales, but a string typed straight into a component
 * renders English no matter what language the visitor picked. Key-parity
 * checks can't see this: the locale files are complete, the component just
 * never asks them. That is how the Sinai guide told Spanish, French and
 * German readers for months that Moses received the Ten Commandments there
 * as settled fact, long after the English page had been corrected.
 *
 * This is a RATCHET, not a pass/fail gate. Known offenders live in
 * i18n-baseline.json and are tolerated. The build fails when:
 *
 *   1. a NEW hardcoded string appears        -> the leak is plugged at the PR
 *   2. a baseline entry is GONE              -> re-pin so it can't come back
 *
 * Rule 2 is what makes it a ratchet. Without it the baseline rots into a
 * permanent amnesty and the count never goes down.
 *
 * Out of scope on purpose:
 *   - admin/auth screens        staff-only, English is fine
 *   - shadcn primitives in ui/  no product copy
 *   - per-language blocks       content = { en, es, fr, de } is already translated
 *   - legal page bodies         English governs by explicit decision; see
 *                               LEGAL_BODIES and the notice on those pages
 *
 * Usage:
 *   node scripts/check-i18n.mjs            # check (CI)
 *   node scripts/check-i18n.mjs --update   # re-pin the baseline
 *   node scripts/check-i18n.mjs --list     # print remaining offenders as a worklist
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const BASELINE = path.join(__dirname, "i18n-baseline.json");

const args = process.argv.slice(2);
const UPDATE = args.includes("--update");
const LIST = args.includes("--list");

/**
 * Staff-only screens. English is fine here by decision, and — unlike NON_COPY
 * below — that decision travels: a component reachable only from a staff
 * screen is itself staff-only.
 */
const STAFF = /(^|\/)(admin|login|register|reset-password|user-dashboard)/;

/**
 * Excluded for carrying no product copy, NOT for being staff-only. The
 * distinction matters: App.tsx imports every page in the site, so if this
 * exemption propagated through imports the way STAFF does, the entire site
 * would exempt itself.
 */
const NON_COPY =
  /useAuth|error-boundary|client-only|seo-meta|translation-demo|App\.tsx|main\.tsx|\/ui\//;

/** Legal bodies stay English by decision; their chrome is still checked. */
const LEGAL_BODIES = /(privacy-policy|terms-of-service|cookie-policy|booking-agreement)\.tsx$/;

/** Reads identically in every target language. */
const NO_TRANSLATE = new Set([
  ...(
    "Egypt Cairo Luxor Aswan Giza Alexandria Sinai Nile Sharm Dahab Hurghada Nuweiba Taba " +
    "Koshari Molokhia Fattah Feteer Hawawshi Kunafa Basbousa Mahshi Sayadeya " +
    "EGP USD WhatsApp Facebook Instagram TripAdvisor Google Afford AffordEgypt " +
    "Abydos Karnak Philae Edfu Dendera Saqqara Dahshur Meidum Siwa Bahariya Farafra Dakhla Kharga " +
    "Sedan Minivan Van SUV"
  ).split(/\s+/),
  // Proper nouns that happen to contain a space. The list above is split on
  // whitespace, so a multi-word name could never be expressed in it — which is
  // why "Sharm El Sheikh" was reported as untranslated copy while "Cairo" and
  // "Hurghada" sitting in the same areaServed array were not. Matching is on
  // the whole string, so these exempt the names and nothing else.
  "Sharm El Sheikh",
  "Abu Simbel",
  "Marsa Alam",
  "St. Catherine",
  "Port Said",
  "Ain Sokhna",
  // Company identities. Translating either would misname a licensed operator.
  "Afford Egypt",
  "Capital Travel Service",
]);

const VISIBLE_ATTR = /\b(placeholder|aria-label|title|alt)=["']([^"'{}]{4,})["']/g;

function isProse(s) {
  const t = s.trim();
  if (t.length < 4 || t.length > 400) return false;
  if (!/[A-Za-z]/.test(t)) return false;
  if (/^[a-z0-9_-]+$/.test(t)) return false; // slug / enum
  if (/^[#/.]/.test(t)) return false; // route / selector
  if (/^https?:|@|\.com|\.svg|\.png|\.jpg|\.webp/.test(t)) return false;
  if (/[{}<>=]/.test(t)) return false;
  // `{triedCount > 0 && triedCount < 3 && ...}` reads to the JSX text-node rule
  // as the text " 0 && triedCount " between a > and a <. Copy never contains a
  // logical operator, so this costs nothing and removes the whole false-positive
  // class that comparisons inside JSX expressions create.
  if (/&&|\|\||=>/.test(t)) return false;
  if (/^[A-Z_]+$/.test(t)) return false; // CONSTANT
  if (/\b(px|rem|flex|grid|bg-|text-|w-full|rounded|border|gap-|mt-|mb-|p-\d)\b/.test(t)) return false;
  if (/^\d/.test(t) && !/[a-z]{3}/.test(t)) return false;
  if (NO_TRANSLATE.has(t)) return false;
  return /\s/.test(t) || /^[A-Z][a-z]{3,}$/.test(t);
}

/**
 * Line ranges holding a per-language content object. When a file defines
 * es/fr/de siblings its `en` block is translated too, so all four are skipped.
 */
function languageBlockRanges(src) {
  const lines = src.split("\n");
  const multi = /^\s*(es|fr|de):\s*\{/m.test(src);
  const key = multi ? /^(\s*)(en|es|fr|de):\s*\{\s*$/ : /^(\s*)(es|fr|de):\s*\{\s*$/;
  const ranges = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(key);
    if (!m) continue;
    const indent = m[1].length;
    for (let j = i + 1; j < lines.length; j++) {
      const c = lines[j].match(/^(\s*)\}/);
      if (c && c[1].length === indent) {
        ranges.push([i + 1, j + 1]);
        i = j;
        break;
      }
    }
  }
  return ranges;
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(path.relative(REPO, p));
  }
  return out;
}

/** `@/pages/foo` -> `client/src/pages/foo.tsx`, when that file exists. */
function resolveAlias(spec, known) {
  if (!spec.startsWith("@/")) return null;
  const rel = `client/src/${spec.slice(2)}.tsx`;
  return known.has(rel) ? rel : null;
}

/**
 * Pages that are staff-only by ROUTE rather than by filename.
 *
 * attractions-simple.tsx sits in pages/ with an innocuous name and is only
 * ever mounted at /admin/attractions, so the filename rule above never saw it
 * and 21 admin strings sat in the worklist as work nobody was ever going to
 * do. Reading the routes means a future admin page is caught whatever it is
 * called.
 */
function adminRoutedFiles(known) {
  const src = readFileSync(path.join(REPO, "client/src/App.tsx"), "utf8");
  const byComponent = new Map();
  // `const X = withSuspense(lazy(() => import("@/pages/x")))` — the arrow's
  // `=>` means this cannot be bounded on `=`; bound it on the statement.
  for (const m of src.matchAll(/(?:const|let)\s+(\w+)\s*=\s*[^;\n]*?import\("([^"]+)"\)/g)) {
    byComponent.set(m[1], m[2]);
  }
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+"([^"]+)"/g)) {
    if (!byComponent.has(m[1])) byComponent.set(m[1], m[2]);
  }

  const out = new Set();
  for (const m of src.matchAll(/path="\/admin[^"]*"\s+component=\{(\w+)\}/g)) {
    const file = resolveAlias(byComponent.get(m[1]) ?? "", known);
    if (file) out.add(file);
  }
  // A silent zero here would quietly re-admit every admin page, so it is loud.
  if (!out.size) {
    console.error("✗ check-i18n: no /admin routes resolved out of App.tsx — has the routing shape changed?");
    process.exit(1);
  }
  return out;
}

/**
 * A component whose every importer is staff-only is staff-only too:
 * add-item-modal is reachable only from admin.tsx, review-upload only from
 * admin-reviews.tsx. Iterated to a fixpoint so a chain of such components
 * resolves.
 *
 * Files with NO importer are deliberately left in scope. They are dead, and
 * dead code should be deleted rather than quietly exempted — that is how
 * contact-section and attractions-search were found.
 */
function staffOnlyByImport(files, isStaff) {
  const known = new Set(files);
  const importers = new Map(files.map((f) => [f, []]));
  for (const f of files) {
    const src = readFileSync(path.join(REPO, f), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*"(@\/[^"]+)"/g)) {
      const target = resolveAlias(m[1], known);
      if (target && target !== f) importers.get(target).push(f);
    }
  }

  const staff = new Set(files.filter(isStaff));
  for (let changed = true; changed; ) {
    changed = false;
    for (const f of files) {
      if (staff.has(f)) continue;
      const from = importers.get(f);
      if (from.length && from.every((i) => staff.has(i))) {
        staff.add(f);
        changed = true;
      }
    }
  }
  return staff;
}

function scan() {
  const found = [];
  const files = walk(path.join(REPO, "client/src")).sort();
  const known = new Set(files);
  const adminRouted = adminRoutedFiles(known);
  const staff = staffOnlyByImport(files, (f) => STAFF.test(f) || adminRouted.has(f));

  for (const rel of files) {
    if (NON_COPY.test(rel) || staff.has(rel)) continue;
    const src = readFileSync(path.join(REPO, rel), "utf8");
    const legalBody = LEGAL_BODIES.test(rel);
    const ranges = languageBlockRanges(src);
    const lines = src.split("\n");
    lines.forEach((line, i) => {
      const ln = i + 1;
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      if (ranges.some(([a, b]) => ln >= a && ln <= b)) return;
      if (/i18n-exempt/.test(line)) return; // deliberate, justified in a comment
      // schema.org vocabulary: "@type": "Offer" is a machine-read constant, not
      // copy. Translating it would break the structured data.
      if (/"@(type|context|id)"/.test(line)) return;
      const hits = new Set();
      for (const m of line.matchAll(/>([^<>{}\n]{4,})</g)) hits.add(m[1]);
      // A JSX text node split across lines: the tag closes on an earlier line
      // and reopens on a later one, so the text sits alone. Missing these is
      // how "Start Chat" stayed invisible to the first version of this check.
      const bare = line.trim();
      if (/^[A-Z][A-Za-z0-9 ,'\u2019&:%!?.-]{3,}$/.test(bare)) {
        const prev = lines.slice(0, i).reverse().find((l) => l.trim());
        const next = lines.slice(i + 1).find((l) => l.trim());
        if (prev?.trim().endsWith(">") && next?.trim().startsWith("<")) hits.add(bare);
      }
      for (const m of line.matchAll(VISIBLE_ATTR)) hits.add(m[2]);
      for (const m of line.matchAll(/\b[a-zA-Z]+:\s*["']([^"'\n]{4,})["']/g)) hits.add(m[1]);
      // String arrays: features: ["Licensed Egyptologist", "Private vehicle"].
      // The key:"value" pattern above stops at the bracket, so every element of
      // every list of labels was invisible.
      //
      // Quote types are matched as matching PAIRS, not as a ["'] character
      // class: "don't" would otherwise split at the apostrophe and yield the
      // fragment "t" plus whatever followed. Elements must also start with a
      // capital or digit, which keeps lowercase lookup keys ("beni suef") out.
      for (const m of line.matchAll(/"([A-Z0-9][^"\n]{3,})"\s*[,\]]/g)) hits.add(m[1]);
      for (const m of line.matchAll(/'([A-Z0-9][^'\n]{3,})'\s*[,\]]/g)) hits.add(m[1]);
      for (const h of hits) {
        if (!isProse(h)) continue;
        // Legal bodies: only long-form prose is exempt, labels still count.
        if (legalBody && h.trim().length > 40) continue;
        found.push({ file: rel, text: h.trim() });
      }
    });
  }
  return found;
}

/**
 * Identity is file+text, not file+line, so reformatting doesn't churn the
 * baseline. The separator must be a character that cannot occur in either
 * half, and the text is full of spaces and punctuation — hence NUL.
 */
const SEP = "\u0000";
const idOf = (v) => `${v.file}${SEP}${v.text}`;
const unId = (id) => id.split(SEP);

const found = scan();

if (UPDATE) {
  const pinned = [...new Set(found.map(idOf))].sort();
  writeFileSync(BASELINE, JSON.stringify({ allowed: pinned.map(unId) }, null, 2) + "\n");
  console.log(`re-pinned ${pinned.length} known hardcoded strings`);
  process.exit(0);
}

let baseline = { allowed: [] };
try {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
} catch {
  console.error(`No baseline at ${path.relative(REPO, BASELINE)} — create it with --update`);
  process.exit(1);
}

const allowed = new Set(baseline.allowed.map(([f, t]) => `${f}${SEP}${t}`));
const foundIds = new Set(found.map(idOf));

const added = found.filter((v) => !allowed.has(idOf(v)));
const fixed = [...allowed].filter((id) => !foundIds.has(id));

if (LIST) {
  const byFile = {};
  for (const v of found) (byFile[v.file] ??= []).push(v.text);
  for (const [f, l] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${String(l.length).padStart(4)}  ${f}`);
    for (const t of l) console.log(`      ${JSON.stringify(t.slice(0, 90))}`);
  }
  console.log(`\ntotal remaining: ${found.length}`);
  process.exit(0);
}

let bad = false;

if (added.length) {
  bad = true;
  console.error(`\n✗ ${added.length} NEW hardcoded string(s) — these render English in every locale:\n`);
  for (const v of added.slice(0, 40)) console.error(`    ${v.file}\n      ${JSON.stringify(v.text)}`);
  if (added.length > 40) console.error(`    …and ${added.length - 40} more`);
  console.error(`\n  Move them into client/src/i18n/locales/*.json and read them with t().`);
  console.error(`  If a string genuinely must stay literal, add an "i18n-exempt" comment on the line.\n`);
}

if (fixed.length) {
  bad = true;
  console.error(`\n✗ ${fixed.length} baseline entr(ies) no longer present — re-pin so they can't come back:\n`);
  for (const id of fixed.slice(0, 20)) {
    const [f, t] = unId(id);
    console.error(`    ${f}\n      ${JSON.stringify(t)}`);
  }
  if (fixed.length > 20) console.error(`    …and ${fixed.length - 20} more`);
  console.error(`\n  Run: node scripts/check-i18n.mjs --update\n`);
}

if (!bad)
  console.log(
    `✓ i18n guard: no new hardcoded strings (${allowed.size} known, baseline holding)`,
  );
process.exit(bad ? 1 : 0);
