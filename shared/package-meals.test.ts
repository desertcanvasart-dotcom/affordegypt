import { describe, expect, it } from "vitest";
import {
  applyPackageMealPolicy,
  PACKAGE_MEAL_INCLUSION,
  packageDayMeals,
} from "./package-meals";
describe("ready-made program meal policy", () => {
  it("covers dinner on arrival, all three meals on full days, and breakfast on departure", () => {
    expect(
      Array.from({ length: 8 }, (_, i) => packageDayMeals(i + 1, 8)),
    ).toEqual([
      "Dinner",
      ...Array(6).fill("Breakfast, lunch and dinner"),
      "Breakfast",
    ]);
  });
  it("replaces partial meal inclusions and preserves accommodation and exclusions", () => {
    const p = applyPackageMealPolicy({
      durationDays: 3,
      description: "A tour.",
      inclusions: [
        "Hotel accommodation",
        "Lunch on Day 2.",
        "Lunch and dinner on the cruise.",
      ],
      exclusions: ["Travel insurance."],
      itinerary: [
        { title: "Arrival", description: "Arrive.\n\nOvernight: Hotel" },
        {
          title: "Tour",
          description: "Visit.\n\nMeals: Lunch | Overnight: Cruise",
        },
        { title: "Departure", description: "Depart." },
      ],
    });
    expect(p.inclusions).toEqual([
      "Hotel accommodation",
      PACKAGE_MEAL_INCLUSION,
    ]);
    expect(p.exclusions).toEqual(["Travel insurance."]);
    expect(p.itinerary[0].description).toContain(
      "Meals: Dinner | Overnight: Hotel",
    );
    expect(p.itinerary[1].description).toContain(
      "Meals: Breakfast, lunch and dinner | Overnight: Cruise",
    );
    expect(p.itinerary[2].description).toContain("Meals: Breakfast");
  });
  it("does not duplicate meal statements on repeated saves or imports", () => {
    const p = {
      durationDays: 3,
      description: "A tour.",
      inclusions: ["Hotel"],
      itinerary: [{ title: "Arrival", description: "Arrival." }],
    };
    const once = applyPackageMealPolicy(p);
    expect(applyPackageMealPolicy(once)).toEqual(once);
  });
  it("does not turn empty draft descriptions into completed program content", () => {
    const p = applyPackageMealPolicy({
      durationDays: 3,
      description: "",
      inclusions: [],
      itinerary: [{ title: "", description: "" }],
    });
    expect(p.description).toBe("");
    expect(p.itinerary[0].description).toBe("");
  });
});
