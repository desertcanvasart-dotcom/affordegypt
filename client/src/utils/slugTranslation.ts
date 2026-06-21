import { useTranslation } from 'react-i18next';

// Original English slug to translated slug mapping
export const slugMappings = {
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
    "aswan-car-tour-guide-services": "aswan-car-tour-guide-services"
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
    "aswan-car-tour-guide-services": "servicios-auto-tour-guia-asuán"
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
    "aswan-car-tour-guide-services": "services-voiture-tour-guide-assouan"
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
    "aswan-car-tour-guide-services": "assuan-auto-tour-reisefuehrer-service"
  }
};

// Get translated slug for current language
export function getTranslatedSlug(englishSlug: string): string {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof typeof slugMappings;
  return (slugMappings[currentLang] as any)?.[englishSlug] || englishSlug;
}

// Get original English slug from any translated slug
export function getOriginalSlug(translatedSlug: string): string {
  // Check all languages to find the original English slug
  for (const [lang, mapping] of Object.entries(slugMappings)) {
    for (const [englishSlug, translatedSlugValue] of Object.entries(mapping)) {
      if (translatedSlugValue === translatedSlug) {
        return englishSlug;
      }
    }
  }
  return translatedSlug; // Return as-is if not found
}

// Check if a slug is valid in any language
export function isValidSlug(slug: string): boolean {
  for (const mapping of Object.values(slugMappings)) {
    if (Object.values(mapping).includes(slug)) {
      return true;
    }
  }
  return false;
}

// Get all possible slugs for a given English slug
export function getAllSlugVariants(englishSlug: string): string[] {
  const variants = [];
  for (const mapping of Object.values(slugMappings)) {
    const translatedSlug = (mapping as any)[englishSlug];
    if (translatedSlug) {
      variants.push(translatedSlug);
    }
  }
  return variants;
}

// Hook to get translated link for navigation (locale-aware, prefixed)
export function useTranslatedLink() {
  const { i18n } = useTranslation();

  return function getTranslatedLink(englishSlug: string): string {
    return pathForSlug(englishSlug, normalizeLang(i18n.language));
  };
}

// ---------------------------------------------------------------------------
// URL-prefix scheme. Non-English locales live under a path prefix
// (/es/<translated-slug>, /fr/..., /de/...); English stays at the root
// (/<english-slug>, and / for home). The prefix — not the slug — determines
// locale, which keeps every URL unambiguous even when a translated slug
// happens to equal the English one (e.g. fr "contact" == en "contact").
// ---------------------------------------------------------------------------

export const PREFIX_LANGS = ["es", "fr", "de"] as const;
export const ALL_LANGS = ["en", "es", "fr", "de"] as const;
export type Lang = (typeof ALL_LANGS)[number];

function normalizeLang(raw: string | null | undefined): Lang {
  const base = (raw || "en").toLowerCase().split("-")[0];
  return (ALL_LANGS as readonly string[]).includes(base) ? (base as Lang) : "en";
}

/** Locale from a pathname: first segment "es"|"fr"|"de" → that lang, else "en". */
export function localeFromPath(pathname: string): Lang {
  const seg = pathname.split("/").filter(Boolean)[0];
  return (PREFIX_LANGS as readonly string[]).includes(seg as any) ? (seg as Lang) : "en";
}

/** Localized path for an English slug. "" / "/" = home. */
export function pathForSlug(englishSlug: string, lang: Lang): string {
  const clean = englishSlug.replace(/^\//, "");
  if (clean === "") return lang === "en" ? "/" : `/${lang}`;
  if (lang === "en") return `/${clean}`;
  const translated = (slugMappings[lang] as any)?.[clean] || clean;
  return `/${lang}/${translated}`;
}

/** The English slug for whatever page a (possibly prefixed) path points at. */
export function englishSlugFromPath(pathname: string): string {
  let segs = pathname.split("/").filter(Boolean);
  if (segs.length && (PREFIX_LANGS as readonly string[]).includes(segs[0] as any)) {
    segs = segs.slice(1);
  }
  if (segs.length === 0) return ""; // home
  return getOriginalSlug(segs[0]);
}

/** hreflang alternates for a page: one entry per language + x-default (en). */
export function localizedAlternates(
  englishSlug: string,
): { hreflang: string; path: string }[] {
  const out: { hreflang: string; path: string }[] = ALL_LANGS.map((l) => ({
    hreflang: l as string,
    path: pathForSlug(englishSlug, l),
  }));
  out.push({ hreflang: "x-default", path: pathForSlug(englishSlug, "en") });
  return out;
}