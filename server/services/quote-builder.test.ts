// Unit tests for buildMultiCityQuote — the single pricing engine behind
// both the live preview (/api/pricing/calculate) and the frozen quote
// (/api/quotes, /api/bookings). DB lookups are stubbed via spies on the
// pricingService singleton so the tests pin the MATH: line-item shapes,
// per-person expansion, breakdown bucketing, travelers resolution, and
// the unpriced→throw contract that the API maps to 422.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({ db: {}, pool: {} }));

import { pricingService, ServicePriceNotSetError } from "./pricing";
import { buildMultiCityQuote } from "./quote-builder";

// Catalog fixture: slug → vehicle_tripType → price. Mirrors real rows
// (aswan-hotel-luxor priced one-way for all three vehicles).
const CATALOG: Record<string, Record<string, number>> = {
  "aswan-hotel-luxor": {
    sedan_one_way: 6815,
    minivan_one_way: 8075,
    van_one_way: 11790,
  },
};

const ENTRANCE_FEES: Record<string, number> = {
  "abu-simbel-sun-festival": 252, // per person
  "philae-temple": 145,
};

const GUIDE_DAILY: Record<string, number> = {
  "4:english": 2750, // cityId:language
  "4:german": 3750,
};

const ADDONS: Record<number, number> = {
  7: 45, // per person per unit
};

beforeEach(() => {
  vi.spyOn(pricingService, "getServicePrice").mockImplementation(
    async (slug, vehicleSlug, tripType) =>
      CATALOG[slug]?.[`${vehicleSlug}_${tripType}`] ?? null,
  );
  vi.spyOn(pricingService, "getEntranceFeePrice").mockImplementation(
    async (slug, travelers) => (ENTRANCE_FEES[slug] ?? 0) * travelers,
  );
  vi.spyOn(pricingService, "getGuideDailyRate").mockImplementation(
    async (cityId, language) =>
      GUIDE_DAILY[`${cityId}:${language.trim().toLowerCase()}`] ?? 0,
  );
  vi.spyOn(pricingService, "getAddOnPrice").mockImplementation(
    async (addOnId, quantity, travelers) =>
      (ADDONS[addOnId] ?? 0) * quantity * travelers,
  );
  vi.spyOn(pricingService, "getAttractionPrice").mockResolvedValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildMultiCityQuote", () => {
  it("prices a single transfer at the exact catalog price (transfers-only flow)", async () => {
    const built = await buildMultiCityQuote(
      [
        {
          cityName: "Aswan",
          selectedServices: [
            { slug: "aswan-hotel-luxor", vehicleSlug: "minivan", tripType: "one_way" },
          ],
        },
      ],
      4,
    );
    expect(built.total).toBe(8075);
    expect(built.subtotal).toBe(built.total);
    expect(built.breakdown).toEqual({ routes: 8075, guide: 0, attractions: 0, addons: 0 });
    expect(built.lineItems).toHaveLength(1);
    expect(built.lineItems[0].kind).toBe("service");
    expect(built.perCity).toEqual([
      { city: "Aswan", routes: 8075, guide: 0, attractions: 0, addOns: 0, total: 8075 },
    ]);
  });

  it("throws ServicePriceNotSetError on an unpriced combination — never a silent 0", async () => {
    await expect(
      buildMultiCityQuote(
        [
          {
            cityName: "Aswan",
            selectedServices: [
              // Row exists but has no round_trip_same_day pricing.
              { slug: "aswan-hotel-luxor", vehicleSlug: "sedan", tripType: "round_trip_same_day" },
            ],
          },
        ],
        2,
      ),
    ).rejects.toThrow(ServicePriceNotSetError);
  });

  it("charges entrance fees per person: quantity = travelers, lineTotal = fee × travelers", async () => {
    const built = await buildMultiCityQuote(
      [
        {
          cityName: "Aswan",
          selectedEntranceFees: ["abu-simbel-sun-festival"],
        },
      ],
      3,
    );
    const [item] = built.lineItems;
    expect(item.kind).toBe("attraction"); // fees accumulate into the attractions bucket
    expect(item.quantity).toBe(3);
    expect(item.unitPrice).toBe(252);
    expect(item.lineTotal).toBe(756);
    expect(built.breakdown.attractions).toBe(756);
    expect(built.total).toBe(756);
  });

  it("charges the guide daily rate once per city, only when cityId + language are set", async () => {
    const built = await buildMultiCityQuote(
      [
        { cityId: 4, cityName: "Aswan", selectedGuide: { language: "English" } },
        { cityName: "Luxor", selectedGuide: { language: "English" } }, // no cityId → no guide line
      ],
      6,
    );
    expect(built.lineItems).toHaveLength(1);
    expect(built.breakdown.guide).toBe(2750);
    expect(built.total).toBe(2750);
  });

  it("prices add-ons as base × quantity × travelers", async () => {
    const built = await buildMultiCityQuote(
      [
        {
          cityName: "Aswan",
          selectedAddOns: [{ id: 7, quantity: 2 }],
        },
      ],
      3,
    );
    const [item] = built.lineItems;
    expect(item.quantity).toBe(2);
    expect(item.lineTotal).toBe(270); // 45 × 2 × 3
    expect(built.breakdown.addons).toBe(270);
  });

  it("prices a full day (transfer + guide + fees + add-on) and keeps totals consistent", async () => {
    const built = await buildMultiCityQuote(
      [
        {
          cityId: 4,
          cityName: "Aswan",
          selectedServices: [
            { slug: "aswan-hotel-luxor", vehicleSlug: "sedan", tripType: "one_way" },
          ],
          selectedGuide: { language: "german" },
          selectedEntranceFees: ["abu-simbel-sun-festival", "philae-temple"],
          selectedAddOns: [7],
        },
      ],
      2,
    );
    // 6815 + 3750 + (252+145)×2 + 45×1×2 = 6815 + 3750 + 794 + 90
    expect(built.total).toBe(11449);
    expect(built.perCity[0].total).toBe(11449);
    // Invariant: total is exactly the sum of line items — no markup, no drift.
    const sum = built.lineItems.reduce((s, l) => s + l.lineTotal, 0);
    expect(built.total).toBe(Math.round(sum * 100) / 100);
    // Invariant: breakdown buckets partition the total.
    const b = built.breakdown;
    expect(b.routes + b.guide + b.attractions + b.addons).toBe(built.total);
  });

  it("resolves travelers: explicit argument wins, else max across cities, floor 1", async () => {
    const cities = [
      { cityName: "A", travelers: 2, selectedEntranceFees: ["philae-temple"] },
      { cityName: "B", travelers: 5 },
    ];
    const explicit = await buildMultiCityQuote(cities, 4);
    expect(explicit.travelers).toBe(4);
    expect(explicit.total).toBe(145 * 4);

    const inferred = await buildMultiCityQuote(cities);
    expect(inferred.travelers).toBe(5); // max across cities
    expect(inferred.total).toBe(145 * 5);

    const floored = await buildMultiCityQuote([{ cityName: "A" }], 0);
    expect(floored.travelers).toBe(1);
  });

  it("skips malformed entries instead of failing the whole quote", async () => {
    const built = await buildMultiCityQuote(
      [
        {
          cityName: "Aswan",
          // Missing/invalid slugs and ids must be ignored, not priced.
          selectedServices: [null as any, { slug: 42 } as any],
          selectedEntranceFees: ["", null as any, "no-such-fee"],
          selectedAddOns: [{ quantity: 2 } as any, 999],
        },
      ],
      2,
    );
    expect(built.lineItems).toHaveLength(0);
    expect(built.total).toBe(0);
  });
});
