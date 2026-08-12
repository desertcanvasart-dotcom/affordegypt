import { describe, expect, it } from "vitest";
import { blockersForStep, type QuoteState } from "@shared/quote-validation";
import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import fr from "../i18n/locales/fr.json";
import de from "../i18n/locales/de.json";

/**
 * The quote builder's step gating lives in shared/quote-validation.ts and returns
 * reason codes; the sentences live in the locale files under
 * quoteBuilder.blockers. Nothing connects the two at build time, and i18next
 * renders a missing key as the key itself — so a renamed code would put the
 * literal text "quoteBuilder.blockers.destination" in front of a customer, on
 * the one screen where they are deciding whether to pay us.
 */

const LOCALES = { en, es, fr, de } as const;

/** Every state that makes a step refuse, and the code it must produce. */
const CASES: Array<{ step: number; state: Partial<QuoteState>; code: string }> = [
  { step: 2, state: { destinationId: "" }, code: "destination" },
  { step: 2, state: { tripDuration: "" }, code: "duration" },
  { step: 2, state: { travelers: 0 }, code: "travelers" },
  { step: 2, state: { travelDate: "", justExploring: false }, code: "date" },
  { step: 3, state: { days: [] }, code: "emptyItinerary" },
  { step: 3, state: { days: [{ selectedServices: [] }] }, code: "noPricedService" },
  { step: 4, state: { totalAmount: 0 }, code: "zeroTotal" },
];

const complete = (over: Partial<QuoteState> = {}): QuoteState => ({
  destinationId: "1",
  tripDuration: "3-4",
  travelers: 2,
  travelDate: "2026-09-01",
  justExploring: false,
  days: [{ selectedServices: [{ slug: "x" }] }],
  totalAmount: 5625,
  ...over,
});

describe("quote builder blockers", () => {
  it.each(CASES)("step $step produces the code $code", ({ step, state, code }) => {
    const blockers = blockersForStep(step, complete(state));
    expect(Object.values(blockers)).toContain(code);
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s translates every blocker code",
    (locale) => {
      const strings = (LOCALES[locale] as any).quoteBuilder.blockers as Record<string, string>;
      for (const { code } of CASES) {
        expect(typeof strings[code], `${locale}.${code}`).toBe("string");
        expect(strings[code].trim(), `${locale}.${code}`).not.toBe("");
      }
    },
  );

  it("has no locale entries for codes the rules never emit", () => {
    const emitted = new Set(CASES.map((c) => c.code));
    const declared = Object.keys((en as any).quoteBuilder.blockers);
    expect(declared.sort()).toEqual([...emitted].sort());
  });
});
