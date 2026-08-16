/**
 * Verifiable facts about the operator, in one place.
 *
 * These were previously retyped per component and had already diverged: the
 * credentials strip claimed "2,500+ travellers" while the review page claimed
 * "2,000+". On a site whose entire pitch is transparent pricing, two numbers
 * for one fact is the same defect class as the guide-rate copy fixed in #41.
 *
 * Rule for this file: only claims that can be substantiated on request. Nothing
 * derivable from live data belongs here — review counts and average ratings
 * come from /api/reviews, and destination counts from /api/cities, so they stay
 * true on their own instead of drifting the moment reality moves.
 */

export const OPERATOR = {
  legalName: 'Capital Travel Service',
  etaaLicence: 'ETAA 2179',
  licensedSince: 2003,

  /**
   * The business address, retyped in five places before it lived here and
   * already diverged into three answers: the footer and the transactional
   * mail said "Giza, Egypt", the contact page said "Downtown Cairo, Egypt",
   * and the LocalBusiness schema carried no street at all. A visitor
   * comparing the contact page with the footer saw two different cities.
   *
   * Structured parts are kept separate because schema.org PostalAddress wants
   * them apart, and a single joined string cannot be split back reliably.
   */
  address: {
    street: '1 Farouk Mahmoud St',
    locality: 'Giza',
    region: 'Cairo',
    country: 'EG',
    /** One-line form for the footer, contact page and mail signature. */
    full: '1 Farouk Mahmoud St, Giza, Cairo',
  },
} as const;

/**
 * Effective and last-updated dates for the legal pages.
 *
 * "March 2, 2020" and "August 5, 2026" were typed into all four of
 * privacy-policy, terms-of-service, booking-agreement and cookie-policy —
 * eight copies of two facts, already formatted in English, so a German reader
 * got an English date in the middle of a translated document and any revision
 * meant editing four files without missing one.
 *
 * Stored as ISO so the pages can format them in the reader's language. Update
 * `lastUpdated` when the wording of a policy actually changes.
 */
export const LEGAL_DATES = {
  effective: '2020-03-02',
  lastUpdated: '2026-08-05',
} as const;

/**
 * Cumulative travellers served by the operator.
 *
 * NOT derivable from this app's database — it predates the site and covers the
 * parent agency's own bookings. The conservative of the two figures previously
 * in the codebase is used deliberately: understating a trust claim is
 * recoverable, overstating one is not. Confirm against the agency's records
 * before raising it.
 */
export const TRAVELLERS_SERVED = '2,000+';
