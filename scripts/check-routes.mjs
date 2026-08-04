#!/usr/bin/env node
/**
 * Route surface audit: dead internal links and orphaned routes.
 *
 * WHY
 *
 * PR #46 found, by accident, that "Book Now" on a saved quote and "View
 * Confirmation" in the dashboard both pointed at /booking/:id — a path matching
 * no route in App.tsx. Every click landed on the 404 page. Nothing caught it
 * because nothing was looking: TypeScript cannot type-check a string against a
 * wouter route table, and the pages themselves render fine.
 *
 * This finds that class of bug mechanically:
 *
 *   DEAD LINK      an internal link whose path matches no registered route.
 *                  Always a bug — the user gets a 404.
 *
 *   ORPHAN ROUTE   a registered route nothing links to. Not necessarily a bug
 *                  (deep links, emails, campaign URLs are legitimate), so these
 *                  are reported for review and do not fail the run.
 *
 * Static analysis, deliberately: it runs without a browser, a server or a
 * database, so it can gate every PR.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLIENT_SRC = path.join(ROOT, "client", "src");
const APP_TSX = path.join(CLIENT_SRC, "App.tsx");
const PUBLIC_ROUTES = path.join(ROOT, "shared", "public-routes.ts");

/** Links we intentionally never resolve against the route table. */
const IGNORED_PREFIXES = ["http://", "https://", "mailto:", "tel:", "//", "#"];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "generated") continue;
      out.push(...(await walk(full)));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Every language variant of every translated slug, from the shared mapping. */
async function loadSlugMappings() {
  const src = await readFile(PUBLIC_ROUTES, "utf8");
  const byCanonical = new Map();
  // Each line inside SLUG_MAPPINGS looks like:  "canonical": "translated",
  for (const m of src.matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?\s*$/gm)) {
    const [, canonical, translated] = m;
    if (!byCanonical.has(canonical)) byCanonical.set(canonical, new Set());
    byCanonical.get(canonical).add(translated);
  }
  return byCanonical;
}

async function collectRoutes() {
  const src = await readFile(APP_TSX, "utf8");
  const routes = [];

  for (const m of src.matchAll(/<Route\s+path="([^"]+)"/g)) {
    routes.push({ pattern: m[1], kind: "explicit" });
  }

  const slugs = await loadSlugMappings();
  for (const m of src.matchAll(/createMultilingualRoute\(\s*"([^"]+)"/g)) {
    const canonical = m[1];
    const variants = slugs.get(canonical) ?? new Set([canonical]);
    for (const v of variants) {
      routes.push({ pattern: `/${v}`, kind: "multilingual", canonical });
    }
  }
  return routes;
}

/** wouter pattern -> RegExp. `:p` matches a segment, `:p?` makes it optional. */
function patternToRegex(pattern) {
  let re = pattern
    .split("/")
    .map((seg) => {
      if (!seg) return "";
      if (seg.startsWith(":")) return seg.endsWith("?") ? "(?:[^/]+)?" : "[^/]+";
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  // `/book/:id?` must also match `/book`
  re = re.replace(/\/\(\?:\[\^\/\]\+\)\?$/, "(?:/[^/]+)?");
  return new RegExp(`^${re}/?$`);
}

async function collectLinks(files) {
  const links = [];
  const patterns = [
    /href="(\/[^"#?]*)"/g,
    /href=\{`(\/[^`]*)`\}/g,
    /href=\{"(\/[^"]*)"\}/g,
    /setLocation\(\s*"(\/[^"]*)"/g,
    /setLocation\(\s*`(\/[^`]*)`/g,
    /window\.location\.href\s*=\s*"(\/[^"]*)"/g,
    /window\.location\.href\s*=\s*`(\/[^`]*)`/g,
    /<Redirect\s+to="(\/[^"]*)"/g,
  ];

  // Translated links are built from a canonical slug rather than written as a
  // literal path: getTranslatedLink("contact") -> "/contact" | "/kontakt" | ...
  // Without this, every page reached through the footer or navbar looks
  // orphaned, which would bury the real findings in noise.
  const SLUG_HELPER = /(?:getTranslatedLink|useTranslatedLink\(\)\s*\(|getTranslatedSlug)\(\s*["'`]([^"'`]+)["'`]/g;

  for (const file of files) {
    const src = await readFile(file, "utf8");
    const lines = src.split("\n");
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        let raw = m[1];
        if (IGNORED_PREFIXES.some((p) => raw.startsWith(p))) continue;
        // Template interpolation -> a wildcard segment, so `/book/${id}` is
        // checked against the route shape rather than a literal.
        const target = raw.replace(/\$\{[^}]*\}/g, "__PARAM__").split(/[?#]/)[0];
        if (!target.startsWith("/")) continue;
        const before = src.slice(0, m.index).split("\n").length;
        links.push({
          target,
          file: path.relative(ROOT, file),
          line: before,
          text: lines[before - 1]?.trim().slice(0, 90) ?? "",
        });
      }
    }

    for (const m of src.matchAll(SLUG_HELPER)) {
      const before = src.slice(0, m.index).split("\n").length;
      links.push({
        target: `/${m[1]}`,
        file: path.relative(ROOT, file),
        line: before,
        text: lines[before - 1]?.trim().slice(0, 90) ?? "",
        viaSlugHelper: true,
      });
    }
  }
  return links;
}

function matches(target, routes) {
  const probe = target.replace(/__PARAM__/g, "x");
  return routes.some((r) => patternToRegex(r.pattern).test(probe));
}

async function main() {
  const files = await walk(CLIENT_SRC);
  const routes = await collectRoutes();
  const links = await collectLinks(files);

  const dead = [];
  const seenDead = new Set();
  for (const link of links) {
    if (matches(link.target, routes)) continue;
    const key = `${link.file}:${link.line}:${link.target}`;
    if (seenDead.has(key)) continue;
    seenDead.add(key);
    dead.push(link);
  }

  // Orphans: only meaningful for canonical English routes. Language variants
  // are reached via the language switcher, not by hardcoded links, so counting
  // them as orphans would be pure noise.
  const linkTargets = links.map((l) => l.target.replace(/__PARAM__/g, "x"));
  const orphans = routes
    .filter((r) => r.kind === "explicit" || r.canonical === undefined || r.pattern === `/${r.canonical}`)
    .filter((r) => r.pattern !== "/")
    .filter((r) => !linkTargets.some((t) => patternToRegex(r.pattern).test(t)));

  console.log(
    `[routes] ${routes.length} route patterns, ${links.length} internal links across ${files.length} files\n`,
  );

  if (orphans.length > 0) {
    console.log(`[routes] ${orphans.length} route(s) with no literal link (review, not necessarily a bug):`);
    for (const o of orphans) console.log(`    ${o.pattern}`);
    console.log(
      "\n    Some of these ARE reachable: link targets computed at runtime\n" +
        "    (e.g. blog-grid's POST_ROUTES lookup) can't be resolved statically,\n" +
        "    and deep links from email or ad campaigns never appear in source.\n" +
        "    This list is for human review; only DEAD LINKS below fail the run.\n",
    );
  }

  if (dead.length === 0) {
    console.log("[routes] OK — every internal link resolves to a registered route.");
    return;
  }

  console.error(`[routes] ${dead.length} DEAD LINK(S) — these render the 404 page:\n`);
  for (const d of dead) {
    console.error(`    ${d.target}`);
    console.error(`      ${d.file}:${d.line}`);
    console.error(`      ${d.text}\n`);
  }
  console.error("[routes] FAIL — fix the paths above or register the missing routes.\n");
  process.exit(1);
}

main().catch((err) => {
  console.error("[routes] unexpected error:", err);
  process.exit(1);
});
