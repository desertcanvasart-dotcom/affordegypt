/**
 * Step gating for the multi-city quote builder.
 *
 * Extracted from the component so the rules are testable without a browser.
 * Before this existed the builder let a visitor pick a destination, skip trip
 * length, date, and every priced service, and still land on a "Review" screen
 * showing a LE 0 total with a checkout button that silently did nothing.
 *
 * Each function returns a map of field -> reason code. An empty map means the
 * step may be entered; the UI renders each reason beside its own field.
 *
 * The values are codes, not sentences, so that the rules stay language-free:
 * the builder is translated, and English baked in here would have surfaced as
 * English on a Spanish page. The client maps each code through
 * `quoteBuilder.blockers.<code>`.
 */

export interface QuoteDay {
  selectedServices?: unknown[];
  selectedAttractions?: unknown[];
  selectedAddOns?: unknown[];
  selectedGuide?: unknown;
}

export interface QuoteState {
  destinationId: string;
  tripDuration: string;
  travelers: number;
  travelDate: string | null;
  /** The visitor explicitly said they have no date yet. */
  justExploring: boolean;
  days: QuoteDay[];
  totalAmount: number;
}

/** Reason a step is blocked. Keys of `quoteBuilder.blockers` in the locale files. */
export type BlockerCode =
  | "destination"
  | "duration"
  | "travelers"
  | "date"
  | "emptyItinerary"
  | "noPricedService"
  | "zeroTotal";

export type Blockers = Record<string, BlockerCode>;

/** True when at least one day carries something that actually costs money. */
export function hasPricedSelection(days: QuoteDay[]): boolean {
  return days.some(
    (d) =>
      (d.selectedServices?.length ?? 0) > 0 ||
      (d.selectedAttractions?.length ?? 0) > 0 ||
      (d.selectedAddOns?.length ?? 0) > 0 ||
      // The guide lives in its own field, not in selectedServices. Omitting it
      // here blocked guide-only itineraries from Review — while the blocker
      // message promised that "a guide" counts.
      d.selectedGuide != null,
  );
}

export function blockersForStep(step: number, s: QuoteState): Blockers {
  const errors: Blockers = {};

  switch (step) {
    case 2:
      if (!s.destinationId) errors.destination = 'destination';
      if (!s.tripDuration) errors.duration = 'duration';
      if (!s.travelers || s.travelers < 1) errors.travelers = 'travelers';
      // A missing date is fine, but only when the visitor says so. Silence is
      // not the same as "not sure yet".
      if (!s.travelDate && !s.justExploring) {
        errors.date = 'date';
      }
      return errors;

    case 3:
      if (s.days.length === 0) {
        errors.itinerary = 'emptyItinerary';
      } else if (!hasPricedSelection(s.days)) {
        errors.itinerary = 'noPricedService';
      }
      return errors;

    case 4:
      if (!(s.totalAmount > 0)) {
        errors.total = 'zeroTotal';
      }
      return errors;

    default:
      return errors;
  }
}

export function canProceedToStep(step: number, s: QuoteState): boolean {
  return Object.keys(blockersForStep(step, s)).length === 0;
}

/**
 * How many day cards step 2 should open with for the trip length picked in
 * step 1. Before this the builder always opened Day 1 only, so a "3–4 days"
 * visitor had to add three days by hand, and a careless one reviewed — and
 * booked — "1 Day".
 *
 * Short ranges open at their upper bound (easier to delete a day than to
 * notice one is missing). Long ranges open at their lower bound so a 15+
 * day trip doesn't start as a wall of empty cards. "Not sure" opens one.
 */
export function daysForDuration(duration: string): number {
  switch (duration) {
    case "1-2": return 2;
    case "3-4": return 4;
    case "5-7": return 7;
    case "8-14": return 8;
    case "15+": return 15;
    default: return 1;
  }
}
