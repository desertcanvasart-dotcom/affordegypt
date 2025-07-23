/**
 * Translation validation utilities
 * Helps ensure translation completeness across all languages
 */

import enTranslations from '../i18n/locales/en.json';
import esTranslations from '../i18n/locales/es.json';
import frTranslations from '../i18n/locales/fr.json';
import deTranslations from '../i18n/locales/de.json';

type TranslationObject = Record<string, any>;
type LanguageCode = 'en' | 'es' | 'fr' | 'de';

const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
};

/**
 * Flatten nested translation object to dot notation keys
 * @param obj - Translation object
 * @param prefix - Current prefix for nested keys
 * @returns Flattened object with dot notation keys
 */
function flattenTranslations(obj: TranslationObject, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenTranslations(value, newKey));
    } else if (typeof value === 'string') {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Get all translation keys from English (reference) translations
 * @returns Array of all translation keys
 */
export function getAllTranslationKeys(): string[] {
  const flattened = flattenTranslations(enTranslations);
  return Object.keys(flattened);
}

/**
 * Check for missing translations in a specific language
 * @param language - Language code to check
 * @returns Array of missing translation keys
 */
export function getMissingTranslations(language: LanguageCode): string[] {
  if (language === 'en') return []; // English is the reference
  
  const englishKeys = flattenTranslations(enTranslations);
  const targetKeys = flattenTranslations(translations[language]);
  
  const missingKeys: string[] = [];
  
  for (const key of Object.keys(englishKeys)) {
    if (!targetKeys[key]) {
      missingKeys.push(key);
    }
  }
  
  return missingKeys;
}

/**
 * Check for extra translations that don't exist in English
 * @param language - Language code to check
 * @returns Array of extra translation keys
 */
export function getExtraTranslations(language: LanguageCode): string[] {
  if (language === 'en') return []; // English is the reference
  
  const englishKeys = flattenTranslations(enTranslations);
  const targetKeys = flattenTranslations(translations[language]);
  
  const extraKeys: string[] = [];
  
  for (const key of Object.keys(targetKeys)) {
    if (!englishKeys[key]) {
      extraKeys.push(key);
    }
  }
  
  return extraKeys;
}

/**
 * Validate all translations and return a comprehensive report
 * @returns Validation report for all languages
 */
export function validateAllTranslations() {
  const report = {
    totalKeys: getAllTranslationKeys().length,
    languages: {} as Record<LanguageCode, {
      missing: string[];
      extra: string[];
      completeness: number;
    }>
  };
  
  const languages: LanguageCode[] = ['es', 'fr', 'de'];
  
  for (const lang of languages) {
    const missing = getMissingTranslations(lang);
    const extra = getExtraTranslations(lang);
    const completeness = Math.round(((report.totalKeys - missing.length) / report.totalKeys) * 100);
    
    report.languages[lang] = {
      missing,
      extra,
      completeness
    };
  }
  
  return report;
}

/**
 * Log translation validation report to console
 * Use this in development to check translation completeness
 */
export function logTranslationReport() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const report = validateAllTranslations();
  
  console.group('🌍 Translation Validation Report');
  console.log(`Total translation keys: ${report.totalKeys}`);
  
  for (const [lang, data] of Object.entries(report.languages)) {
    console.group(`${lang.toUpperCase()} - ${data.completeness}% complete`);
    
    if (data.missing.length > 0) {
      console.warn(`Missing ${data.missing.length} translations:`, data.missing);
    } else {
      console.log('✅ All translations present');
    }
    
    if (data.extra.length > 0) {
      console.info(`Extra ${data.extra.length} translations:`, data.extra);
    }
    
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Run validation in development mode
if (process.env.NODE_ENV === 'development') {
  // Uncomment to see translation report on app load
  // logTranslationReport();
}