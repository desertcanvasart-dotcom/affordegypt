import { describe, expect, it } from "vitest";
import {
  blockersForStep,
  canProceedToStep,
  hasPricedSelection,
  type QuoteState,
} from "./quote-validation";

const base: QuoteState = {
  destinationId: "1",
  tripDuration: "3-4",
  travelers: 2,
  travelDate: "2026-11-02",
  justExploring: false,
  days: [{ selectedServices: [{ id: 1 }] }],
  totalAmount: 5625,
};

const state = (over: Partial<QuoteState> = {}): QuoteState => ({ ...base, ...over });

describe("step 2 gate (leaving Trip Overview)", () => {
  it("passes on a fully answered overview", () => {
    expect(blockersForStep(2, state())).toEqual({});
  });

  it("blocks a missing destination", () => {
    expect(blockersForStep(2, state({ destinationId: "" }))).toHaveProperty("destination");
  });

  it("blocks a missing trip length", () => {
    expect(blockersForStep(2, state({ tripDuration: "" }))).toHaveProperty("duration");
  });

  it("blocks a missing date when the visitor has not opted out", () => {
    const blockers = blockersForStep(2, state({ travelDate: "", justExploring: false }));
    expect(blockers.date).toMatch(/Not sure yet/);
  });

  it('accepts a missing date once "Not sure yet" is ticked', () => {
    expect(blockersForStep(2, state({ travelDate: "", justExploring: true }))).toEqual({});
  });

  it("blocks zero travelers", () => {
    expect(blockersForStep(2, state({ travelers: 0 }))).toHaveProperty("travelers");
  });

  it("reports every missing field at once, not just the first", () => {
    const blockers = blockersForStep(
      2,
      state({ destinationId: "", tripDuration: "", travelDate: "" }),
    );
    expect(Object.keys(blockers).sort()).toEqual(["date", "destination", "duration"]);
  });

  // The exact regression from the audit: destination only, nothing else.
  it("blocks the audit's repro — Cairo picked, trip length and date empty", () => {
    const blockers = blockersForStep(
      2,
      state({ destinationId: "1", tripDuration: "", travelDate: "", justExploring: false }),
    );
    expect(Object.keys(blockers)).toContain("duration");
    expect(Object.keys(blockers)).toContain("date");
  });
});

describe("step 3 gate (entering Review)", () => {
  it("blocks an empty itinerary", () => {
    expect(blockersForStep(3, state({ days: [] }))).toHaveProperty("itinerary");
  });

  it("blocks a day with nothing priced on it", () => {
    const blockers = blockersForStep(3, state({ days: [{ selectedServices: [] }] }));
    expect(blockers.itinerary).toMatch(/at least one service/);
  });

  it.each([
    ["a service", { selectedServices: [{ id: 1 }] }],
    ["an attraction", { selectedAttractions: [{ id: 2 }] }],
    ["an add-on", { selectedAddOns: [{ id: 3 }] }],
    // The 2026-08-11 live-site regression: a guide is priced (the blocker
    // message even says so) but lives in its own field, and a guide-only
    // itinerary was blocked from Review.
    ["only a guide", { selectedGuide: { language: "English", duration: 8 } }],
  ])("passes when the day has %s", (_label, day) => {
    expect(blockersForStep(3, state({ days: [day] }))).toEqual({});
  });

  it("passes when any one of several days is priced", () => {
    expect(
      blockersForStep(3, state({ days: [{ selectedServices: [] }, { selectedAddOns: [{ id: 9 }] }] })),
    ).toEqual({});
  });
});

describe("step 4 gate (entering Checkout)", () => {
  it("blocks a LE 0 total", () => {
    expect(blockersForStep(4, state({ totalAmount: 0 })).total).toMatch(/LE 0/);
  });

  it("blocks a negative total", () => {
    expect(blockersForStep(4, state({ totalAmount: -1 }))).toHaveProperty("total");
  });

  it("passes a priced itinerary", () => {
    expect(blockersForStep(4, state({ totalAmount: 5625 }))).toEqual({});
  });
});

describe("hasPricedSelection", () => {
  it("is false for no days and for empty days", () => {
    expect(hasPricedSelection([])).toBe(false);
    expect(hasPricedSelection([{}, { selectedServices: [] }])).toBe(false);
  });
});

describe("canProceedToStep", () => {
  it("mirrors blockersForStep", () => {
    expect(canProceedToStep(4, state({ totalAmount: 0 }))).toBe(false);
    expect(canProceedToStep(4, state())).toBe(true);
  });

  it("never blocks step 1", () => {
    expect(canProceedToStep(1, state({ destinationId: "", totalAmount: 0, days: [] }))).toBe(true);
  });
});
