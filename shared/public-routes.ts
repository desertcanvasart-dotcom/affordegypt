// Single source of truth for the public URL surface, shared by:
//   - client/src/utils/slugTranslation.ts (multilingual route creation + links)
//   - server/vite.ts serveStatic (real 404 status for unknown paths)
//   - scripts/generate-sitemap.mjs (hreflang alternates), run under tsx so it
//     can import this file rather than mirror it — the mirror it used to keep
//     had gone stale at English-only, which is why the sitemap advertised no
//     translated alternates at all.
//
// Pure data + pure functions only: this module is bundled into both the
// client and the server, so it must not import client or server code.

export const SLUG_MAPPINGS: Record<"en" | "es" | "fr" | "de", Record<string, string>> = {
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
  es: {
    "destinations": "destinos",
    "travel-tips": "consejos-de-viaje",
    "reviews": "reseñas",
    "submit-review": "enviar-reseña",
    "about": "acerca-de",
    "contact": "contacto",
    "budget-travel-egypt": "viaje-barato-egipto",
    "egyptian-street-food-guide": "guia-comida-callejera-egipcia",
    "nile-valley-guide": "guia-valle-del-nilo",
    "sinai-peninsula-guide": "guia-peninsula-sinai",
    "eastern-western-deserts-guide": "guia-desiertos-oriental-occidental",
    "cuisine-passport": "pasaporte-culinario",
    "booking-agreement": "acuerdo-de-reserva",
    "terms-of-service": "terminos-de-servicio",
    "privacy-policy": "politica-de-privacidad",
    "cookie-policy": "politica-de-cookies",
    "transfers": "traslados",
    "pricing-tool": "herramienta-de-precios",
    "attractions": "atracciones",
    "cairo-airport-transfers": "traslados-aeropuerto-cairo",
    "luxor-airport-transfers": "traslados-aeropuerto-luxor",
    "aswan-airport-transfers": "traslados-aeropuerto-asuán",
    "cairo-car-tour-guide-services": "servicios-auto-tour-guia-cairo",
    "luxor-car-tour-guide-services": "servicios-auto-tour-guia-luxor",
    "aswan-car-tour-guide-services": "servicios-auto-tour-guia-asuán",
  },
  fr: {
    "destinations": "destinations",
    "travel-tips": "conseils-voyage",
    "reviews": "avis",
    "submit-review": "soumettre-avis",
    "about": "a-propos",
    "contact": "contact",
    "budget-travel-egypt": "voyage-budget-egypte",
    "egyptian-street-food-guide": "guide-street-food-egyptien",
    "nile-valley-guide": "guide-vallee-du-nil",
    "sinai-peninsula-guide": "guide-peninsule-sinai",
    "eastern-western-deserts-guide": "guide-deserts-oriental-occidental",
    "cuisine-passport": "passeport-culinaire",
    "booking-agreement": "accord-de-reservation",
    "terms-of-service": "conditions-de-service",
    "privacy-policy": "politique-de-confidentialite",
    "cookie-policy": "politique-cookies",
    "transfers": "transferts",
    "pricing-tool": "outil-de-prix",
    "attractions": "attractions",
    "cairo-airport-transfers": "transferts-aeroport-caire",
    "luxor-airport-transfers": "transferts-aeroport-louxor",
    "aswan-airport-transfers": "transferts-aeroport-assouan",
    "cairo-car-tour-guide-services": "services-voiture-tour-guide-caire",
    "luxor-car-tour-guide-services": "services-voiture-tour-guide-louxor",
    "aswan-car-tour-guide-services": "services-voiture-tour-guide-assouan",
  },
  de: {
    "destinations": "reiseziele",
    "travel-tips": "reisetipps",
    "reviews": "bewertungen",
    "submit-review": "bewertung-abgeben",
    "about": "uber-uns",
    "contact": "kontakt",
    "budget-travel-egypt": "budget-reise-agypten",
    "egyptian-street-food-guide": "agyptischer-street-food-guide",
    "nile-valley-guide": "niltal-reisefuhrer",
    "sinai-peninsula-guide": "sinai-halbinsel-guide",
    "eastern-western-deserts-guide": "ostliche-westliche-wusten-guide",
    "cuisine-passport": "kulinarischer-pass",
    "booking-agreement": "buchungsvereinbarung",
    "terms-of-service": "nutzungsbedingungen",
    "privacy-policy": "datenschutzrichtlinie",
    "cookie-policy": "cookie-richtlinie",
    "transfers": "transfers",
    "pricing-tool": "preisrechner",
    "attractions": "attraktionen",
    "cairo-airport-transfers": "kairo-flughafen-transfer",
    "luxor-airport-transfers": "luxor-flughafen-transfer",
    "aswan-airport-transfers": "assuan-flughafen-transfer",
    "cairo-car-tour-guide-services": "kairo-auto-tour-reisefuehrer-service",
    "luxor-car-tour-guide-services": "luxor-auto-tour-reisefuehrer-service",
    "aswan-car-tour-guide-services": "assuan-auto-tour-reisefuehrer-service",
  },
};

// Exact-match app routes that exist outside the slug-mapped surface.
// Mirror of the static <Route> entries in client/src/App.tsx.
const STATIC_PATHS = new Set([
  "/",
  "/dashboard",
  "/login",
  "/register",
  "/reset-password",
  "/verify-email",
  "/route-booking", // legacy → client-side redirect to /pricing-tool
]);

// Parameterized route families (path itself or any subpath is valid).
const PATH_PREFIXES = [
  "/book", // /book/:id?
  "/booking-confirmation", // /booking-confirmation/:reference
  "/admin", // admin surface (noindex, but real pages)
  "/routes", // legacy → client-side redirects to /pricing-tool
];

// Every valid top-level public slug, across all languages.
const SLUG_SET: Set<string> = new Set(
  Object.values(SLUG_MAPPINGS).flatMap((mapping) => Object.values(mapping)),
);

/**
 * Whether a request path corresponds to a real app route. Used by the
 * production static handler to serve the SPA shell with a real 404 status
 * for unknown URLs (instead of a soft-404 200) so crawlers drop dead links.
 */
export type SupportedLanguage = keyof typeof SLUG_MAPPINGS;

/**
 * The language a slug unambiguously belongs to, or null.
 *
 * Four slugs are shared between languages — French keeps the English
 * "destinations", "contact" and "attractions"; German keeps "transfers" — so
 * they identify a page without identifying a language.
 *
 * Both callers depend on agreeing about this, and for opposite reasons:
 * i18n's applyDetectedLanguage() will not switch language on an ambiguous slug
 * (it would force French on an English reader, or vice versa), and the sitemap
 * will not advertise one as an hreflang alternate (it would promise Google a
 * language that URL does not serve). If they disagreed, the sitemap would
 * announce a translation the app declines to render — so the rule lives here,
 * once.
 */
export function languageOfSlug(slug: string): SupportedLanguage | null {
  if (!slug) return null;
  const claimants = (Object.keys(SLUG_MAPPINGS) as SupportedLanguage[]).filter(
    (lang) => Object.values(SLUG_MAPPINGS[lang]).includes(slug),
  );
  return claimants.length === 1 ? claimants[0] : null;
}

/**
 * The canonical URL a page should declare for the language it is being served
 * in.
 *
 * Pages pass their English canonical as a literal. Once the translated slugs
 * became real routes that was actively harmful: /reiseziele declared
 * <link rel="canonical" href=".../destinations">, which tells Google the German
 * page is a duplicate of the English one and to drop it — taking the hreflang
 * alternates down with it, since an alternate has to be self-canonical to
 * count. Every translated page was doing this.
 *
 * So when the current path is a translated variant of the same page, the
 * canonical follows it. Anything else — a path that is not a translated
 * sibling, an unknown slug, a malformed URL — is returned untouched, because
 * guessing is worse than the caller's explicit value.
 */
export function canonicalForPath(canonical: string, pathname: string): string {
  let url: URL;
  try {
    url = new URL(canonical);
  } catch {
    return canonical;
  }

  const canonicalSlug = url.pathname.split("/")[1] ?? "";
  let currentSlug = pathname.split("/")[1] ?? "";
  try {
    currentSlug = decodeURIComponent(currentSlug);
  } catch {
    /* keep the raw form; it will simply not match */
  }
  if (!canonicalSlug || !currentSlug || currentSlug === canonicalSlug) return canonical;

  // Same page, another language? Find the English key the canonical names, and
  // check the current slug is one of that key's translations.
  const enKey = Object.entries(SLUG_MAPPINGS.en).find(
    ([, slug]) => slug === canonicalSlug,
  )?.[0];
  if (!enKey) return canonical;

  const isSibling = (Object.keys(SLUG_MAPPINGS) as SupportedLanguage[]).some(
    (lang) => SLUG_MAPPINGS[lang][enKey] === currentSlug,
  );
  if (!isSibling) return canonical;

  url.pathname = `/${currentSlug}`;
  return url.toString();
}

export function isKnownPublicPath(rawPath: string): boolean {
  let pathname = rawPath.split("?")[0].split("#")[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return false; // malformed escape sequence — not a real route
  }
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (STATIC_PATHS.has(pathname)) return true;
  if (
    PATH_PREFIXES.some(
      (prefix) =>
        pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }
  // "/<slug>" with no further segments
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 && SLUG_SET.has(segments[0]);
}
