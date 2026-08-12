/**
 * BreadcrumbList JSON-LD, and the single definition of each page's trail.
 *
 * Google replaces the raw URL in a search result with the breadcrumb trail
 * when this is present. Without it these results read
 * "affordegypt.com › cairo-car-tour-guide-services", which is the least
 * readable part of an otherwise well-optimised listing.
 *
 * The trail is defined once here and consumed by both the schema and the
 * visible trail, so the two cannot disagree — a mismatch between them is one
 * of the things Search Console flags.
 */

export interface Crumb {
  name: string;
  /** Omitted on the final crumb: it is the current page. */
  url?: string;
}

const SITE = "https://affordegypt.com";

/**
 * The hierarchy claimed here is deliberately shallow.
 *
 * This site is flat — almost everything hangs directly off the homepage. The
 * one real parent is /transfers, which the three airport-transfer pages sit
 * under. Inventing a "Services" or "Guides" tier would point breadcrumbs at
 * URLs that do not resolve, which Google treats as an error rather than
 * ignoring.
 */
export const TRAILS: Record<string, Crumb[]> = {
  "/transfers": [{ name: "Home", url: "/" }, { name: "Transfers" }],
  "/destinations": [{ name: "Home", url: "/" }, { name: "Destinations" }],

  "/cairo-airport-transfers": [
    { name: "Home", url: "/" },
    { name: "Transfers", url: "/transfers" },
    { name: "Cairo Airport Transfers" },
  ],
  "/luxor-airport-transfers": [
    { name: "Home", url: "/" },
    { name: "Transfers", url: "/transfers" },
    { name: "Luxor Airport Transfers" },
  ],
  "/aswan-airport-transfers": [
    { name: "Home", url: "/" },
    { name: "Transfers", url: "/transfers" },
    { name: "Aswan Airport Transfers" },
  ],

  "/cairo-car-tour-guide-services": [
    { name: "Home", url: "/" },
    { name: "Cairo Car & Tour Guide Services" },
  ],
  "/luxor-car-tour-guide-services": [
    { name: "Home", url: "/" },
    { name: "Luxor Car & Tour Guide Services" },
  ],
  "/aswan-car-tour-guide-services": [
    { name: "Home", url: "/" },
    { name: "Aswan Car & Tour Guide Services" },
  ],

  "/nile-valley-guide": [{ name: "Home", url: "/" }, { name: "Nile Valley Guide" }],
  "/sinai-peninsula-guide": [{ name: "Home", url: "/" }, { name: "Sinai Peninsula Guide" }],
  "/eastern-western-deserts-guide": [
    { name: "Home", url: "/" },
    { name: "Eastern & Western Deserts Guide" },
  ],
  "/travel-tips": [{ name: "Home", url: "/" }, { name: "Travel Tips" }],
  "/budget-travel-egypt": [{ name: "Home", url: "/" }, { name: "Budget Travel Guide" }],
  "/egyptian-street-food-guide": [{ name: "Home", url: "/" }, { name: "Street Food Guide" }],
  "/cuisine-passport": [{ name: "Home", url: "/" }, { name: "Egyptian Cuisine Passport" }],

  "/about": [{ name: "Home", url: "/" }, { name: "About Us" }],
  "/contact": [{ name: "Home", url: "/" }, { name: "Contact Us" }],
};

export function trailFor(path: string): Crumb[] | undefined {
  return TRAILS[path];
}

/**
 * BreadcrumbList JSON-LD for a trail.
 *
 * `item` is omitted on the last crumb per Google's guidance — it is the page
 * being viewed, so pointing it at itself adds nothing.
 */
export function breadcrumbSchema(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      ...(crumb.url ? { item: `${SITE}${crumb.url === "/" ? "/" : crumb.url}` } : {}),
    })),
  };
}
