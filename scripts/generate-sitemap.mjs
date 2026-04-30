#!/usr/bin/env node
/**
 * Generate dist/public/sitemap.xml from the prerender route list.
 *
 * Mirrors the PRERENDER_ROUTES array in vite.config.ts (single source of truth
 * for the public English route surface) and uses slugTranslation.ts to emit
 * hreflang alternates for each route's language variants.
 *
 * Run after `vite build`: the output goes into dist/public/ so it ships with
 * the static bundle.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist", "public", "sitemap.xml");
const SITE = "https://affordegypt.com";

// Mirror of PRERENDER_ROUTES in vite.config.ts. Keep in sync.
const ROUTES = [
  "/",
  "/about",
  "/contact",
  "/transfers",
  "/destinations",
  "/attractions",
  "/routes",
  "/pricing-tool",
  "/budget-travel-egypt",
  "/egyptian-street-food-guide",
  "/nile-valley-guide",
  "/sinai-peninsula-guide",
  "/eastern-western-deserts-guide",
  "/cuisine-passport",
  "/travel-tips",
  "/cairo-airport-transfers",
  "/luxor-airport-transfers",
  "/aswan-airport-transfers",
  "/cairo-car-tour-guide-services",
  "/luxor-car-tour-guide-services",
  "/aswan-car-tour-guide-services",
  "/booking-agreement",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
  "/reviews",
  "/submit-review",
];

// Mirror of slugMappings in client/src/utils/slugTranslation.ts. Keep in sync
// when adding new languages or pages.
const SLUG_MAPPINGS = {
  en: {
    "destinations": "destinations",
    "travel-tips": "travel-tips",
    "reviews": "reviews",
    "submit-review": "submit-review",
    "about": "about",
    "contact": "contact",
    "budget-travel-egypt": "budget-travel-egypt",
    "egyptian-street-food-guide": "egyptian-street-food-guide",
    "nile-valley-guide": "nile-valley-guide",
    "sinai-peninsula-guide": "sinai-peninsula-guide",
    "eastern-western-deserts-guide": "eastern-western-deserts-guide",
    "cuisine-passport": "cuisine-passport",
    "booking-agreement": "booking-agreement",
    "terms-of-service": "terms-of-service",
    "privacy-policy": "privacy-policy",
    "cookie-policy": "cookie-policy",
    "transfers": "transfers",
    "pricing-tool": "pricing-tool",
    "attractions": "attractions",
    "cairo-airport-transfers": "cairo-airport-transfers",
    "luxor-airport-transfers": "luxor-airport-transfers",
    "aswan-airport-transfers": "aswan-airport-transfers",
    "cairo-car-tour-guide-services": "cairo-car-tour-guide-services",
    "luxor-car-tour-guide-services": "luxor-car-tour-guide-services",
    "aswan-car-tour-guide-services": "aswan-car-tour-guide-services",
  },
};

const GUIDE_PAGES = new Set([
  "/budget-travel-egypt",
  "/egyptian-street-food-guide",
  "/nile-valley-guide",
  "/sinai-peninsula-guide",
  "/eastern-western-deserts-guide",
  "/cuisine-passport",
  "/travel-tips",
]);

const LEGAL_PAGES = new Set([
  "/booking-agreement",
  "/terms-of-service",
  "/privacy-policy",
  "/cookie-policy",
]);

function priorityFor(route) {
  if (route === "/") return "1.0";
  if (LEGAL_PAGES.has(route)) return "0.5";
  if (GUIDE_PAGES.has(route)) return "0.7";
  return "0.8";
}

function changefreqFor(route) {
  if (route === "/") return "daily";
  if (GUIDE_PAGES.has(route)) return "weekly";
  return "monthly";
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// TODO: emit hreflang alternates for es/fr/de when those routes are added to PRERENDER_ROUTES (Phase 3+).
function buildEntry(route, lastmod) {
  const enSlug = route === "/" ? "" : route.slice(1);
  const langs = Object.keys(SLUG_MAPPINGS);
  const hasTranslations = enSlug && SLUG_MAPPINGS.en[enSlug] !== undefined;

  const alternateLinks = route === "/"
    ? `    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/" />`
    : hasTranslations
    ? langs
        .map((lang) => {
          const slug = SLUG_MAPPINGS[lang]?.[enSlug];
          if (!slug) return null;
          const href = `${SITE}/${encodeURI(slug)}`;
          return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}" />`;
        })
        .filter(Boolean)
        .join("\n")
    : "";

  const loc = `${SITE}${route}`;
  const lines = [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreqFor(route)}</changefreq>`,
    `    <priority>${priorityFor(route)}</priority>`,
  ];
  if (alternateLinks) lines.push(alternateLinks);
  lines.push("  </url>");
  return lines.join("\n");
}

async function main() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const entries = ROUTES.map((r) => buildEntry(r, lastmod)).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, xml, "utf8");
  console.log(`Wrote ${OUT} (${ROUTES.length} routes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
