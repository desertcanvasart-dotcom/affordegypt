import { useTranslation } from 'react-i18next';

// Original English slug to translated slug mapping
const slugMappings = {
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
    "attractions": "attractions"
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
    "attractions": "atracciones"
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
    "attractions": "attractions"
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
    "attractions": "attraktionen"
  }
};

// Get translated slug for current language
export function getTranslatedSlug(englishSlug: string): string {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as keyof typeof slugMappings;
  return slugMappings[currentLang]?.[englishSlug] || englishSlug;
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
    const translatedSlug = mapping[englishSlug];
    if (translatedSlug) {
      variants.push(translatedSlug);
    }
  }
  return variants;
}

// Hook to get translated link for navigation
export function useTranslatedLink() {
  const { i18n } = useTranslation();
  
  return function getTranslatedLink(englishSlug: string): string {
    const currentLang = i18n.language as keyof typeof slugMappings;
    const translatedSlug = slugMappings[currentLang]?.[englishSlug] || englishSlug;
    return `/${translatedSlug}`;
  };
}