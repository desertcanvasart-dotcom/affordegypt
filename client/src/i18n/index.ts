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
    fallbackLng: 'en',
    debug: true,
    returnObjects: false,
    keySeparator: '.',
    nsSeparator: ':',
    
    // Language normalization to handle en-US -> en mapping
    load: 'languageOnly',  // This loads 'en' when it detects 'en-US'
    supportedLngs: ['en', 'es', 'fr', 'de'],
    nonExplicitSupportedLngs: true,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
  });

export default i18n;