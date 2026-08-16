import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { MULTILINGUAL_ENABLED } from '@/config/features';
import { languageOfSlug } from '@shared/public-routes';

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

// Deliberately NOT the legacy 'language' key. That key was written by the old
// navigator.language auto-detection, so millions of returning visitors have a
// non-English value cached that they never actually chose. Reading a fresh key
// makes every one of them fall back to English until they pick a language
// themselves. Do not repoint this at 'language'.
const PREF_KEY = 'af_lang_pref';

function normalize(raw: string | null | undefined): Supported | null {
  if (!raw) return null;
  const base = raw.toLowerCase().split('-')[0];
  return (SUPPORTED as readonly string[]).includes(base) ? (base as Supported) : null;
}

/**
 * The language a path declares, or null. The rule for what counts as
 * unambiguous lives in shared/public-routes.ts, because the sitemap generator
 * has to make the same call about the same slugs — see languageOfSlug().
 */
function languageOfPath(pathname: string): Supported | null {
  const raw = pathname.split('/')[1] ?? '';
  // location.pathname is percent-encoded, and two slugs carry non-ASCII:
  // /reseñas and /enviar-reseña arrive as /rese%C3%B1as and
  // /enviar-rese%C3%B1a, which match nothing and fell back to English — on the
  // exact URLs the sitemap advertises as the Spanish alternates.
  let slug = raw;
  try {
    slug = decodeURIComponent(raw);
  } catch {
    // A malformed escape is not a slug we know; keep the raw form and miss.
  }
  return languageOfSlug(slug);
}

/** Keeps <html lang> in sync so assistive tech and crawlers see the truth. */
function syncDocumentLang(lang: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('lang', lang);
}

i18n.on('languageChanged', syncDocumentLang);

/**
 * Persists an explicit user choice and switches to it.
 * This is the ONLY path that may write a language preference.
 */
export function setLanguage(raw: string): void {
  const lang = normalize(raw);
  if (!lang) return;
  if (lang !== i18n.language) i18n.changeLanguage(lang);
  syncDocumentLang(lang);
  try {
    window.localStorage.setItem(PREF_KEY, lang);
  } catch {}
}

/**
 * Applies a previously *chosen* language after hydration.
 *
 * Only two sources count as a choice: an explicit `?lng=` in the URL, and a
 * preference this user set via the language selector. Browser locale is
 * intentionally ignored — the site is authored in English, only ~14% of
 * components are wired to i18next, and every page is prerendered in English,
 * so honouring navigator.language produced half-translated pages plus a
 * visible English→German flip a second after load (the hydration mismatch
 * behind the React #418/#423 error flood). English-by-default is correct
 * until translation coverage and per-locale prerendering exist.
 */
export function applyDetectedLanguage(): void {
  if (typeof window === 'undefined') return;

  // Language switching is off for launch (see config/features). Ignore both a
  // stored preference and ?lng= so an old localStorage value from before the
  // switch was disabled cannot strand someone on a half-translated page with
  // no visible way back — the selector that set it is no longer rendered.
  if (!MULTILINGUAL_ENABLED) {
    setLanguage('en');
    return;
  }

  let chosen: Supported | null = null;

  // The path outranks everything. /reiseziele IS the German destinations page —
  // it is registered as a route only because German exists, and a link to it
  // has already declared its language. Reading ?lng= or a stored preference
  // first meant a visitor arriving from a German search result, or opening a
  // shared /reiseziele link, got English under a German URL: the exact "worst
  // of both" that createMultilingualRoute redirects away from when the feature
  // is off. It also has to be the path for the sitemap's hreflang alternates to
  // be true, since those name a URL and promise a language.
  chosen = languageOfPath(window.location.pathname);

  if (!chosen) {
    try {
      chosen = normalize(new URLSearchParams(window.location.search).get('lng'));
    } catch {}
  }

  if (!chosen) {
    try {
      chosen = normalize(window.localStorage.getItem(PREF_KEY));
    } catch {}
  }

  if (chosen) {
    setLanguage(chosen);
  } else {
    syncDocumentLang(i18n.language || 'en');
  }
}

export default i18n;
