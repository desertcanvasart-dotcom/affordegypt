import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';

import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';

const resources = {
  en: {
    translation: enTranslations,
    blog: enTranslations.blog,
    common: enTranslations
  },
  es: {
    translation: esTranslations,
    blog: esTranslations.blog,
    common: esTranslations
  },
  fr: {
    translation: frTranslations,
    blog: frTranslations.blog,
    common: frTranslations
  },
  de: {
    translation: deTranslations,
    blog: deTranslations.blog,
    common: deTranslations
  }
};

// Hydration-safe init: lock first paint to English so prerendered HTML matches
// what React renders on the client. Real language detection runs post-hydration
// from main.tsx via applyDetectedLanguage().
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    initImmediate: false,
    ns: ['translation', 'blog', 'common'],
    defaultNS: 'translation',
    keySeparator: '.',
    debug: false,
    returnObjects: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    saveMissing: process.env.NODE_ENV === 'development',
    parseMissingKeyHandler: (key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
      }
      return key;
    },
  });

const SUPPORTED = ['en', 'es', 'fr', 'de'] as const;
type Supported = (typeof SUPPORTED)[number];

function normalize(raw: string | null | undefined): Supported | null {
  if (!raw) return null;
  const base = raw.toLowerCase().split('-')[0];
  return (SUPPORTED as readonly string[]).includes(base) ? (base as Supported) : null;
}

// Reimplements i18next-browser-languagedetector's priority chain
// (querystring 'lng' -> localStorage 'language' -> navigator.language) without
// running synchronously during init. Caches the detected value to localStorage
// to mirror the previous { caches: ['localStorage'] } behaviour.
export function applyDetectedLanguage(): void {
  if (typeof window === 'undefined') return;
  let detected: Supported | null = null;

  try {
    const qs = new URLSearchParams(window.location.search).get('lng');
    detected = normalize(qs);
  } catch {}

  if (!detected) {
    try {
      detected = normalize(window.localStorage.getItem('language'));
    } catch {}
  }

  if (!detected) {
    try {
      detected = normalize(window.navigator.language);
    } catch {}
  }

  if (detected && detected !== i18n.language) {
    i18n.changeLanguage(detected);
    try {
      window.localStorage.setItem('language', detected);
    } catch {}
  } else if (detected) {
    try {
      window.localStorage.setItem('language', detected);
    } catch {}
  }
}

export default i18n;
