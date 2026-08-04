import { useTranslation } from 'react-i18next';

// Slug data lives in shared/public-routes.ts so the server can 404
// unknown paths against the same list. Import keeps this module's API stable.
import { SLUG_MAPPINGS as slugMappings } from "@shared/public-routes";

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

// Hook to get translated link for navigation
export function useTranslatedLink() {
  const { i18n } = useTranslation();
  
  return function getTranslatedLink(englishSlug: string): string {
    const currentLang = i18n.language as keyof typeof slugMappings;
    const translatedSlug = (slugMappings[currentLang] as any)?.[englishSlug] || englishSlug;
    return `/${translatedSlug}`;
  };
}