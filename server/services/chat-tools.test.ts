// Pins the rules that stop the chat assistant from quoting nonsense: every
// selection is checked against the live catalog before the real quote
// builder runs, and a trip with any bad selection gets NO total (a partial
// total that silently dropped half the trip would be worse than none).
import { describe, expect, it, vi } from "vitest";

vi.mock("../db", () => ({ db: {}, pool: {} }));

import { runChatTool, priceOptions, smallestVehicleFor, type ChatToolDeps } from "./chat-tools";
import type { BuiltMultiCityQuote, MultiCityCityInput } from "./quote-builder";

const catalog = [
  {
    slug: "cairo-airport-hotel",
    name: "Airport → Hotel",
    city: "Cairo",
    category: "airport_transfer",
    pickupZone: "Cairo Airport",
    vehiclePrices: { sedan_one_way: 2025, minivan_one_way: 2475, van_one_way: 3675, hiace_one_way: 3000 },
  },
  {
    slug: "luxor-west-bank-tour",
    name: "Hotel → West Bank → Hotel",
    city: "Luxor",
    category: "tour",
    pickupZone: "Luxor Center",
    vehiclePrices: { minivan_round_trip_same_day: 1300, van_round_trip_same_day: 1900 },
  },
];
const fees = [{ slug: "luxor-valley-of-the-kings", name: "Valley of the Kings", city: "luxor", pricePerPerson: 750 }];
const packages = [
  {
    slug: "egypt-discovery-8-days",
    title: "Pyramids & Nile Cruise Discovery",
    summary: "8 days",
    durationDays: 8,
    nights: 7,
    dayTitles: ["Arrive Cairo"],
    inclusions: ["Hotels"],
    exclusions: ["Flights"],
    bookingTerms: "25% deposit",
    perPersonRates: { "2": 76955, "3": 71435, "4": 65915 },
    singleSupplement: 16390,
    version: 3,
  },
];
const guides = [
  { cityId: 3, cityName: "Luxor", language: "English", dailyRate: 2400 },
  { cityId: 1, cityName: "Cairo", language: "English", dailyRate: 2400 },
];

function makeDeps() {
  const buildQuote = vi.fn(
    async (cities: MultiCityCityInput[], travelers: number): Promise<BuiltMultiCityQuote> => ({
      lineItems: [
        {
          kind: "service",
          description: "Service: luxor-west-bank-tour — minivan (round_trip_same_day) [Luxor]",
          unitPrice: 1300,
          quantity: 1,
          lineTotal: 1300,
          meta: { serviceSlug: "luxor-west-bank-tour", vehicleSlug: "minivan", cityName: "Luxor" },
        },
      ],
      breakdown: { routes: 1300, guide: 0, attractions: 0, addons: 0 },
      subtotal: 1300,
      total: 1300,
      travelers,
      perCity: [],
    }),
  );
  const deps: ChatToolDeps = {
    loadCatalog: async () => catalog,
    loadEntranceFees: async () => fees,
    loadGuideRates: async () => guides,
    loadPackages: async () => packages,
    buildQuote,
  };
  return { deps, buildQuote };
}

const parse = (s: string) => JSON.parse(s);

describe("priceOptions", () => {
  it("keeps only the vehicles the site sells, cheapest first", () => {
    expect(priceOptions(catalog[0].vehiclePrices)).toEqual([
      { vehicle: "sedan", trip_type: "one_way", price: 2025 },
      { vehicle: "minivan", trip_type: "one_way", price: 2475 },
      { vehicle: "van", trip_type: "one_way", price: 3675 },
    ]);
  });
  it("drops zero and non-numeric prices", () => {
    expect(priceOptions({ sedan_one_way: 0, van_one_way: Number.NaN })).toEqual([]);
  });
});

describe("smallestVehicleFor", () => {
  it("matches the site's capacity rule (sedan ≤2, minivan ≤8, van ≤15)", () => {
    expect(smallestVehicleFor(2)).toBe("sedan");
    expect(smallestVehicleFor(3)).toBe("minivan");
    expect(smallestVehicleFor(9)).toBe("van");
    expect(smallestVehicleFor(16)).toBeNull();
  });
});

describe("search_services", () => {
  it("filters by city and words, and returns sold options only", async () => {
    const { deps } = makeDeps();
    const out = parse((await runChatTool("search_services", { city: "cairo", query: "airport" }, deps)).content);
    expect(out.results).toHaveLength(1);
    expect(out.results[0].slug).toBe("cairo-airport-hotel");
    expect(out.results[0].options.map((o: { vehicle: string }) => o.vehicle)).not.toContain("hiace");
  });
  it("lists the cities served when nothing matches", async () => {
    const { deps } = makeDeps();
    const out = parse((await runChatTool("search_services", { city: "Siwa" }, deps)).content);
    expect(out.results).toEqual([]);
    expect(out.cities_served).toEqual(["Cairo", "Luxor"]);
  });
});

describe("list_guides", () => {
  it("errors for a city with no guides instead of inventing one", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("list_guides", { city: "Marsa Alam" }, deps);
    expect(r.isError).toBe(true);
  });
});

describe("calculate_quote", () => {
  const goodTrip = {
    travelers: 4,
    days: [
      {
        city: "Luxor",
        services: [{ slug: "luxor-west-bank-tour", vehicle: "minivan", trip_type: "round_trip_same_day" }],
        guide_language: "english",
        entrance_fees: ["luxor-valley-of-the-kings"],
      },
    ],
  };

  it("prices a valid trip through the real builder and returns a verified quote", async () => {
    const { deps, buildQuote } = makeDeps();
    const r = await runChatTool("calculate_quote", goodTrip, deps);
    expect(r.isError).toBe(false);
    expect(buildQuote).toHaveBeenCalledWith(
      [
        {
          cityName: "Day 1 · Luxor",
          travelers: 4,
          cityId: 3,
          selectedGuide: { language: "English" },
          selectedServices: [{ slug: "luxor-west-bank-tour", vehicleSlug: "minivan", tripType: "round_trip_same_day" }],
          selectedEntranceFees: ["luxor-valley-of-the-kings"],
        },
      ],
      4,
    );
    expect(r.quote).toMatchObject({ kind: "custom", total: 1300, perPerson: 325, travelers: 4, currency: "EGP" });
    expect(r.quote!.lines[0].label).toBe("Hotel → West Bank → Hotel (minivan)");
  });

  it.each([
    ["an unknown slug", { slug: "made-up", vehicle: "minivan", trip_type: "round_trip_same_day" }, /unknown service/],
    ["an unpriced trip type", { slug: "luxor-west-bank-tour", vehicle: "minivan", trip_type: "one_way" }, /no minivan price/],
    ["a vehicle too small for the group", { slug: "luxor-west-bank-tour", vehicle: "sedan", trip_type: "round_trip_same_day" }, /seats 2.*use minivan/],
    ["a vehicle the site doesn't sell", { slug: "cairo-airport-hotel", vehicle: "hiace", trip_type: "one_way" }, /belongs to Cairo|vehicle must be/],
  ])("refuses the whole quote for %s", async (_label, service, message) => {
    const { deps, buildQuote } = makeDeps();
    const r = await runChatTool(
      "calculate_quote",
      { travelers: 4, days: [{ city: "Luxor", services: [goodTrip.days[0].services[0], service] }] },
      deps,
    );
    expect(r.isError).toBe(true);
    expect(parse(r.content).error).toMatch(message);
    expect(r.quote).toBeUndefined();
    expect(buildQuote).not.toHaveBeenCalled();
  });

  it("refuses a service priced in another city", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool(
      "calculate_quote",
      { travelers: 2, days: [{ city: "Luxor", services: [{ slug: "cairo-airport-hotel", vehicle: "sedan", trip_type: "one_way" }] }] },
      deps,
    );
    expect(parse(r.content).error).toMatch(/belongs to Cairo/);
  });

  it("refuses a guide language that isn't offered in that city", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("calculate_quote", { travelers: 2, days: [{ city: "Luxor", guide_language: "Klingon" }] }, deps);
    expect(r.isError).toBe(true);
  });

  it("sends groups above 15 to a custom quote", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("calculate_quote", { ...goodTrip, travelers: 20 }, deps);
    expect(parse(r.content).error).toMatch(/custom quote/);
  });
});

describe("calculate_quote, day by day", () => {
  it("sends one builder entry per day, so a 3-day guide is charged 3 times", async () => {
    const { deps, buildQuote } = makeDeps();
    const r = await runChatTool(
      "calculate_quote",
      {
        travelers: 2,
        days: [
          { city: "Luxor", guide_language: "English" },
          { city: "Luxor", guide_language: "English" },
          { city: "Cairo", guide_language: "English" },
        ],
      },
      deps,
    );
    expect(r.isError).toBe(false);
    const sent = buildQuote.mock.calls[0][0];
    expect(sent.map((d) => d.cityName)).toEqual(["Day 1 · Luxor", "Day 2 · Luxor", "Day 3 · Cairo"]);
    expect(sent.map((d) => d.cityId)).toEqual([3, 3, 1]);
    expect(sent.every((d) => d.selectedGuide?.language === "English")).toBe(true);
  });

  it("names the day in each problem", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool(
      "calculate_quote",
      { travelers: 2, days: [{ city: "Luxor", guide_language: "English" }, { city: "Luxor", guide_language: "Klingon" }] },
      deps,
    );
    expect(parse(r.content).error).toMatch(/^day 2: no Klingon-speaking guide/);
  });

  it("caps custom trips at 21 days", async () => {
    const { deps } = makeDeps();
    const days = Array.from({ length: 22 }, () => ({ city: "Luxor", guide_language: "English" }));
    const r = await runChatTool("calculate_quote", { travelers: 2, days }, deps);
    expect(parse(r.content).error).toMatch(/up to 21 days/);
  });
});

describe("packages", () => {
  it("lists published packages with their own booking terms", async () => {
    const { deps } = makeDeps();
    const out = parse((await runChatTool("list_packages", {}, deps)).content);
    expect(out.packages[0]).toMatchObject({ slug: "egypt-discovery-8-days", days: 8, booking_terms: "25% deposit" });
  });

  it("prices a group sharing doubles, with a link to book", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("price_package", { slug: "egypt-discovery-8-days", travelers: 4 }, deps);
    expect(r.isError).toBe(false);
    expect(r.quote).toMatchObject({
      kind: "package",
      bookUrl: "/packages/egypt-discovery-8-days",
      total: 263660, // 4 × 65,915
      perPerson: 65915,
    });
  });

  it("defaults an odd group to one single room and adds the supplement", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("price_package", { slug: "egypt-discovery-8-days", travelers: 3 }, deps);
    // 3 × 71,435 + 1 × 16,390
    expect(r.quote!.total).toBe(230695);
    expect(r.quote!.lines).toHaveLength(2);
  });

  it("refuses an impossible room split instead of guessing", async () => {
    const { deps } = makeDeps();
    const r = await runChatTool("price_package", { slug: "egypt-discovery-8-days", travelers: 4, single_rooms: 1 }, deps);
    expect(r.isError).toBe(true);
    expect(parse(r.content).error).toMatch(/possible single-room counts are 0, 2, 4/);
  });

  it("refuses groups outside 2–12 and unknown packages", async () => {
    const { deps } = makeDeps();
    expect((await runChatTool("price_package", { slug: "egypt-discovery-8-days", travelers: 1 }, deps)).isError).toBe(true);
    expect((await runChatTool("price_package", { slug: "nope", travelers: 2 }, deps)).isError).toBe(true);
  });
});
