import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';

import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';

const resources = {
  en: {
    translation: enTranslations
  },

  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  },
  de: {
    translation: deTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',                    // current language
    fallbackLng: 'en',            // ALWAYS keep a fallback
    ns: ['translation'],          // namespaces we use
    defaultNS: 'translation',
    keySeparator: '.',            // enable nested key lookup (blog.sinaiGuide.title)
    debug: false, // Enable manually when needed for debugging translations
    returnObjects: false,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
      lookupQuerystring: 'lng',
    },
    
    // Add missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    parseMissingKeyHandler: (key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
      }
      return key;
    },
  });

export default i18n;