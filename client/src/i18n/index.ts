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

/**
 * The language first paint renders in, decided before React runs.
 *
 * This used to be hardcoded 'en' so that prerendered HTML — all of it English —
 * matched what the client rendered, avoiding the hydration mismatch that once
 * produced a flood of React #418/#423 errors and a visible English→German flip
 * a second after load.
 *
 * It has to come from the URL now, because the translated routes are
 * prerendered per language. Both sides derive it from the same pure function
 * over the same path, so they cannot disagree: /reiseziele is prerendered in
 * German and hydrates in German. Anything the path does not name — the English
 * routes, the four shared slugs, the planner and booking flows — stays English
 * for first paint, and a stored preference still swaps in after hydration via
 * applyDetectedLanguage().
 */
function initialLanguage(): Supported {
  if (typeof window === 'undefined') return 'en';
  if (!MULTILINGUAL_ENABLED) return 'en';
  return languageOfPath(window.location.pathname) ?? 'en';
}

const INITIAL_LANGUAGE = initialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: INITIAL_LANGUAGE,
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

// init() does not emit languageChanged for the language it starts in, so
// without this <html lang> kept whatever index.html shipped — "en". The
// prerender then captured whichever value won a race between the snapshot and
// the idle callback that ran applyDetectedLanguage: /reiseziele came out
// lang="de" and /destinos lang="en", both with translated content. Setting it
// synchronously here makes the attribute agree with the render that produced
// it, in the browser and in Puppeteer alike.
syncDocumentLang(INITIAL_LANGUAGE);

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
 * Runs after hydration, and now only settles what first paint could not: the
 * path is already handled at init, so this is for `?lng=` and for a stored
 * preference on a URL that names no language — an English route, or one of the
 * four slugs two languages share.
 *
 * `navigator.language` is still ignored, and deliberately. Honouring it once
 * produced half-translated pages and a visible English→German flip a second
 * after load — the hydration mismatch behind the React #418/#423 flood. The
 * two conditions that reasoning waited on, full translation coverage and
 * per-locale prerendering, both exist now; browser locale is still not a
 * choice the visitor made, and a German speaker reading English on
 * /destinations can pick German once and keep it. Do not add it back without
 * checking that against the prerendered HTML, which is per-URL, not per-user.
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
