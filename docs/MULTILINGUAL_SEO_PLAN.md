# Multilingual SEO — Project Plan

**Status:** Not started (blocked on content). Routing prototype parked on branch
`feat/i18n-url-prefixes` (this branch), **not merged**.
**Last updated:** 2026-06-21

---

## TL;DR

The site is wired for 4 languages (en/es/fr/de) at the *chrome* level, but the
**page content is ~85% hardcoded English**. Shipping localized URLs today would
serve English text at `/es`, `/fr`, `/de` URLs — a duplicate-content /
hreflang-mismatch penalty that is **worse than having no localized pages**.

So this is fundamentally a **content-translation project** with a smaller
engineering tail. Do the content first; the engineering (most of it already
prototyped) slots in on top.

**Do NOT ship any localized URL until the corresponding page's content is fully
translated.** Partial localization is an SEO liability, not a partial win.

---

## Why it's blocked (the findings)

1. **Content is hardcoded English.** Only **6 of 49 pages** and **14 of 43
   components** use the i18n system (`useTranslation`/`t()`). The homepage's
   entire body — hero, founder block, inclusions comparison, FAQ, credentials —
   plus About, pricing-tool, travel-tips, and reviews have **zero** `t()` calls.
   The 261 locale keys in `client/src/i18n/locales/*.json` cover scattered UI
   fragments (some nav, a few pages like `destinations`), not page bodies.

2. **URL scheme can't express locale (solved in the prototype).** Today's URLs
   use translated slugs with **no language prefix**, and several collide across
   languages — `/contact` is both English and French; `/destinations` (en+fr),
   `/transfers` (en+de), `/attractions` (en+fr). hreflang requires a distinct
   URL per locale, which is impossible when the URL is ambiguous. **Fix: language
   prefixes** (`/es/...`, `/fr/...`, `/de/...`); English stays at the root. This
   is already built in the prototype.

3. **Locale was decoupled from the URL.** The app currently picks language from
   `?lng=` → `localStorage` → `navigator.language` **post-hydration**, never from
   the URL path, and locks first paint to English. The prototype changes this to
   **URL-driven** locale (deterministic, hydration-safe, what hreflang needs).

---

## URL scheme (decided)

- **English (default):** root, English slug. `/`, `/about`, `/pricing-tool`.
- **Other locales:** language prefix + translated slug.
  `/es/acerca-de`, `/fr/a-propos`, `/de/uber-uns`, and home `/es`, `/fr`, `/de`.
- **Back-compat:** old non-prefixed translated slugs (e.g. `/acerca-de`) 301 →
  prefixed (`/es/acerca-de`). Already wired in the prototype.
- Locale is derived from the **first path segment** (`es|fr|de` → that language,
  else English). Unambiguous by construction.

---

## Work breakdown

### Phase A — Content translation  ← the real work, do first
The prerequisite. Everything else is pointless without it.

- [ ] Inventory every **indexable** page and its on-page copy. Indexable set ≈ the
      26 entries in `slugMappings` (`client/src/utils/slugTranslation.ts`) + home.
      (Exclude admin, auth, `/book`, `/dashboard`, booking-confirmation.)
- [ ] Extract all hardcoded strings on those pages into i18n keys (`t('...')` +
      entries in `en.json`). Today most page bodies aren't keyed at all — this is
      the bulk of the effort. Components to convert include at minimum:
      `hero`, `founder-block`, `inclusions-comparison`, `faq-section`,
      `credentials-strip`, and the page bodies of `home`, `about`, `contact`,
      `pricing-tool`, `travel-tips`, `reviews`, and the guide/transfer pages.
- [ ] Get **professional human translations** for es/fr/de (this is travel
      marketing + legal/credentials copy — do not ship machine translation for
      money-path / trust content). Populate `es.json`, `fr.json`, `de.json`.
- [ ] Translate the **SEO meta** per page too (title, description) — not just body
      copy. These drive the SERP snippet in each language.
- [ ] Decide policy on legal pages (terms/privacy/cookie/booking-agreement):
      translate, or keep English with a note. Often kept in one authoritative
      language — confirm with the operator.
- [ ] QA each translated page for layout breakage (German runs long; Arabic, if
      ever added, is RTL).

### Phase B — Routing + URL-driven locale  ← prototype done
On branch `feat/i18n-url-prefixes`. Re-verify after rebasing on latest `main`.

- [x] `localeFromPath`, `pathForSlug`, `englishSlugFromPath`, `localizedAlternates`,
      `PREFIX_LANGS`, `ALL_LANGS` in `slugTranslation.ts`.
- [x] `createMultilingualRoute` registers English at root + `/es|fr|de/<slug>` +
      back-compat redirects (skips redirect on collision slugs).
- [x] `/es`, `/fr`, `/de` home routes.
- [x] i18n init `lng` from `window.location.pathname`; `applyDetectedLanguage`
      path-based.
- [x] `<Router>` effect syncs `i18n.language` to the path on client navigation.
- [ ] Behavior change to confirm with operator: first-time visitors are NOT
      auto-redirected to their browser language (each URL = one language). If an
      auto-redirect on `/` is desired, add it carefully so it never affects the
      prerendered/canonical English `/`.

### Phase C — SEO plumbing
- [ ] `SeoMeta` (`client/src/components/seo-meta.tsx`): emit per-page
      `<link rel="alternate" hreflang>` for en/es/fr/de + `x-default` (use
      `localizedAlternates(englishSlug)`), a **per-locale canonical** (self), and
      `og:locale` + `og:locale:alternate`. SeoMeta will need the page's English
      slug — pass it as a prop or derive via `englishSlugFromPath(location)`.
- [ ] `scripts/generate-sitemap.mjs`: emit every page in all 4 locales with
      `xhtml:link` hreflang alternates + `x-default`. The hreflang skeleton/TODO is
      already there (~line 122) — wire it to the real slug map.
- [ ] `vite.config.ts` `PRERENDER_ROUTES`: add all localized routes
      (~26 pages × 3 prefixed locales ≈ 78 new routes, ~104 total). Confirm the
      prerenderer renders each in the correct language (it will, via URL-driven
      init) and that `maxConcurrentRoutes`/timeout still complete the build.
- [ ] `client/index.html`: `<html lang>` is static `en` — set it per-locale
      (e.g. in `SeoMeta` via Helmet `htmlAttributes={{ lang }}`).

### Phase D — Internal links + language switcher
- [ ] Convert internal `<Link href="/...">` to locale-aware paths via
      `useTranslatedLink()` / `pathForSlug(slug, currentLang)`, so a Spanish
      visitor's clicks stay on `/es/...`. This is a site-wide sweep — without it,
      a click drops the user (and crawlers) back to English URLs.
- [ ] `language-selector.tsx`: on change, **navigate** to the localized path of the
      current page in the new language (compute via `englishSlugFromPath` +
      `pathForSlug`), then `changeLanguage`. Today it only calls `changeLanguage`
      (no navigation), which would desync URL and language under the new scheme.

### Phase E — Verification (before merge)
- [ ] `npm run check` (tsc) clean.
- [ ] Full `npm run build` — confirm Puppeteer prerenders all ~104 routes without
      timeout/errors, and spot-check prerendered HTML for, e.g., `/es/acerca-de`:
      Spanish body text present, correct `<html lang="es">`, self-canonical,
      hreflang cluster present.
- [ ] Validate `sitemap.xml` has all locales + hreflang.
- [ ] Crawl test (Screaming Frog or similar) for hreflang reciprocity and no
      mismatched/duplicate content.
- [ ] Old non-prefixed translated URLs 301 to prefixed; no redirect loops.

---

## Gotchas / risks

- **Don't merge Phase B/C/D without Phase A.** Localized URLs serving English is a
  net SEO negative.
- **Prerender count:** ~104 routes lengthens the build and is resource-heavy. Watch
  `vite.config.ts` prerender concurrency/timeout.
- **Hydration:** locale must be a pure function of the URL (it is, in the
  prototype) so prerendered HTML matches first client paint. Don't reintroduce
  `navigator.language` into first paint.
- **Collisions:** the prefix scheme resolves them; never go back to prefix-less
  translated slugs.
- **`og-default.jpg`** is shared; fine, but a localized share image is a nice-to-have.

---

## Effort estimate (rough)

- Phase A (content + professional translation): **the majority** — days to weeks
  depending on translation turnaround. This is the gate.
- Phases B–D (engineering): ~2–4 focused days (B is largely done).
- Phase E (verification): ~0.5–1 day.

## Pointers

- Routing prototype: branch `feat/i18n-url-prefixes`, commit `c3ff91a`
  (`client/src/{App.tsx,i18n/index.ts,utils/slugTranslation.ts}`).
- Slug map: `client/src/utils/slugTranslation.ts` (`slugMappings`).
- Locale strings: `client/src/i18n/locales/{en,es,fr,de}.json`.
- SEO component: `client/src/components/seo-meta.tsx`.
- Sitemap generator: `scripts/generate-sitemap.mjs`.
- Prerender list: `vite.config.ts` `PRERENDER_ROUTES`.
