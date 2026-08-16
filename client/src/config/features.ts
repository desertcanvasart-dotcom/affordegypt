/**
 * Build-time feature switches.
 */

/**
 * Whether visitors can switch the site language.
 *
 * ON since 2026-08-16. It was off for launch because the backfill covered the
 * long-form guides but not the app around them — the quote builder, the
 * booking flow and several shared components still emitted hard-coded English,
 * so choosing Spanish produced a half-Spanish checkout, and the money path is
 * the worst place to show that.
 *
 * Those strings are done. The condition this comment used to set — "a full pass
 * done and verified per locale" — was checked before flipping, by walking the
 * public routes in German, French and Spanish and grepping the rendered text
 * for English function words. That is what turned up the last three leaks: the
 * navbar and credentials-strip "Operated by …" lines and the floating
 * "WhatsApp Us" button, none of which the guard can see, because their text
 * sits beside a JSX expression or lives in App.tsx (excluded as NON_COPY).
 *
 * Two things this flag does NOT promise:
 *
 *  - Catalog content is still English. Service names ("Hotel → Luxor → Hotel
 *    (with Visits)"), attraction names and add-on notes come from the database,
 *    which has no translated columns, so a German visitor gets a German
 *    interface around English product names. That is a data problem.
 *  - The translations have not been read by a native speaker. They render and
 *    say the right thing; whether they read well is unverified.
 *
 * Turning it off again is this one flag and is safe: the English slugs stay
 * routed and the selector stops rendering.
 */
export const MULTILINGUAL_ENABLED = true;
