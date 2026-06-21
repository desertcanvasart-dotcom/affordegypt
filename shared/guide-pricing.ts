// Single source of truth for guide pricing.
//
// Guides are priced by language at a standard DAILY rate, the same across
// every city. NB: the guide_rates.hourly_price column historically stores this
// DAILY value (see server/services/pricing.ts getGuideDailyRate).
//
// This drives three things that must never drift apart:
//   1. the languages offered in the planner (/api/pricing/languages),
//   2. the fresh-DB seed (server/database-storage.ts), and
//   3. the prod seed script (scripts/seed-guide-rates.ts).
export const GUIDE_DAILY_PRICE_BY_LANGUAGE: Record<string, string> = {
  English: "2750.00",
  Spanish: "3750.00",
  French: "3750.00",
  German: "3750.00",
  Italian: "3750.00",
  Japanese: "5750.00",
  Chinese: "5750.00",
  Dutch: "5750.00",
  Korean: "5750.00",
};

export const GUIDE_LANGUAGES = Object.keys(GUIDE_DAILY_PRICE_BY_LANGUAGE);
