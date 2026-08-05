/**
 * Build-time feature switches.
 */

/**
 * Whether visitors can switch the site language.
 *
 * Turned OFF for launch. The translation backfill covers the long-form guide
 * bodies but not the rest of the app: the quote builder, the booking flow and
 * several shared components still emit hard-coded English, so choosing Spanish
 * produced a page that was partly Spanish and partly English. A half-translated
 * checkout reads as broken, and the money path is the worst place to show it.
 *
 * Nothing has been deleted. The four locale files, every `t()` call and the
 * translated slug table are all still here and still correct. Re-enabling is
 * this one flag, plus finishing the strings the audit in the PR description
 * lists. Keep it off until a full pass is done and verified per locale, because
 * the failure mode is silent — English simply stays on screen.
 */
export const MULTILINGUAL_ENABLED = false;
