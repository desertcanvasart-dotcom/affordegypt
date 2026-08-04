/**
 * Step gating for the multi-city quote builder.
 *
 * Extracted from the component so the rules are testable without a browser.
 * Before this existed the builder let a visitor pick a destination, skip trip
 * length, date, and every priced service, and still land on a "Review" screen
 * showing a LE 0 total with a checkout button that silently did nothing.
 *
 * Each function returns a map of field -> message. An empty map means the
 * step may be entered; the UI renders each message beside its own field.
 */

export interface QuoteDay {
  selectedServices?: unknown[];
  selectedAttractions?: unknown[];
  selectedAddOns?: unknown[];
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

export type Blockers = Record<string, string>;

/** True when at least one day carries something that actually costs money. */
export function hasPricedSelection(days: QuoteDay[]): boolean {
  return days.some(
    (d) =>
      (d.selectedServices?.length ?? 0) > 0 ||
      (d.selectedAttractions?.length ?? 0) > 0 ||
      (d.selectedAddOns?.length ?? 0) > 0,
  );
}

export function blockersForStep(step: number, s: QuoteState): Blockers {
  const errors: Blockers = {};

  switch (step) {
    case 2:
      if (!s.destinationId) errors.destination = 'Choose where you want to go.';
      if (!s.tripDuration) errors.duration = 'Pick a trip length.';
      if (!s.travelers || s.travelers < 1) errors.travelers = 'Choose how many travelers.';
      // A missing date is fine, but only when the visitor says so. Silence is
      // not the same as "not sure yet".
      if (!s.travelDate && !s.justExploring) {
        errors.date = 'Pick a travel date, or tick "Not sure yet".';
      }
      return errors;

    case 3:
      if (s.days.length === 0) {
        errors.itinerary = 'Add at least one day to your itinerary.';
      } else if (!hasPricedSelection(s.days)) {
        errors.itinerary =
          'Add at least one service — transport, a guide, tickets or an add-on — before reviewing your price.';
      }
      return errors;

    case 4:
      if (!(s.totalAmount > 0)) {
        errors.total =
          'Your itinerary still totals LE 0. Go back and add at least one priced service before checking out.';
      }
      return errors;

    default:
      return errors;
  }
}

export function canProceedToStep(step: number, s: QuoteState): boolean {
  return Object.keys(blockersForStep(step, s)).length === 0;
}
