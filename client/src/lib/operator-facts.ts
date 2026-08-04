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
