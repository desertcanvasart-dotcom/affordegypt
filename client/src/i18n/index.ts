import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { localeFromPath } from '@/utils/slugTranslation';

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

// Hydration-safe init: the locale is derived from the URL path prefix
// (/es,/fr,/de → that language; otherwise English). The prerenderer and the
// client read the same URL, so first paint matches the prerendered HTML.
const initialLng =
  typeof window !== 'undefined' ? localeFromPath(window.location.pathname) : 'en';
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
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

// Locale is determined solely by the URL path prefix (see localeFromPath), so
// rendered language always matches the URL — a hard requirement for hreflang.
// Runs post-hydration to confirm; ongoing client navigations are handled by the
// effect in <Router>.
export function applyDetectedLanguage(): void {
  if (typeof window === 'undefined') return;
  const detected = localeFromPath(window.location.pathname);
  if (detected !== i18n.language) i18n.changeLanguage(detected);
}

export default i18n;
