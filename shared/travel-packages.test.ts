import { describe, expect, it } from "vitest";
import {
  PACKAGE_TIERS,
  pricePackage,
  singleRoomOptions,
  publicationIssues,
  packageContentSchema,
  packageBookingSchema,
} from "./travel-packages";
const pkg = {
  perPersonRates: {
    "2": 1000,
    "4": 900,
    "6": 800,
    "8": 700,
    "10": 600,
    "12": 500,
  },
  singleSupplement: 300,
  nights: 4,
  version: 1,
};
const program = {
  slug: "sample",
  title: "Sample",
  summary: "Summary",
  description: "Description",
  imageUrl: "",
  durationDays: 2,
  nights: 1,
  itinerary: [
    { title: "Day 1", description: "Details" },
    { title: "Day 2", description: "Details" },
  ],
  inclusions: ["Hotel"],
  exclusions: [],
  bookingTerms: "To be confirmed",
  perPersonRates: pkg.perPersonRates,
  singleSupplement: 300,
  status: "draft" as const,
};
describe("ready-made package pricing", () => {
  it.each(PACKAGE_TIERS)("uses the explicit %i-person tier", (count) => {
    const priced = pricePackage(pkg, count, 0);
    expect(priced.total).toBe(
      pkg.perPersonRates[String(count) as keyof typeof pkg.perPersonRates] *
        count,
    );
    expect(priced.doubleRooms).toBe(count / 2);
  });
  it.each([3, 5, 7, 9, 11])(
    "uses the previous even tier for %i travelers plus one single",
    (count) => {
      const p = pricePackage(pkg, count, 1);
      expect(p.tier).toBe(count - 1);
      expect(p.baseTotal).toBe(
        pkg.perPersonRates[
          String(count - 1) as keyof typeof pkg.perPersonRates
        ] * count,
      );
      expect(p.supplementTotal).toBe(300);
      expect(p.doubleRooms * 2 + p.singleRooms).toBe(count);
    },
  );
  it("charges the supplement per single room for the entire stay, not per night", () => {
    expect(pricePackage(pkg, 3, 1).total).toBe(3300);
    expect(pricePackage(pkg, 3, 3).total).toBe(3900);
    expect(pricePackage(pkg, 4, 2).total).toBe(4200);
  });
  it("rejects impossible room arrangements, missing tiers and unpriced singles", () => {
    for (const [count, singles] of [
      [3, 0],
      [4, 1],
      [3, 4],
      [1, 1],
      [13, 1],
      [3.5, 1],
    ])
      expect(() => pricePackage(pkg, count, singles)).toThrow();
    expect(() => pricePackage({ ...pkg, perPersonRates: {} }, 2, 0)).toThrow();
    expect(() =>
      pricePackage({ ...pkg, singleSupplement: null }, 3, 1),
    ).toThrow();
  });
  it("uses integer cents so totals equal frozen line amounts", () => {
    const p = pricePackage(
      { ...pkg, perPersonRates: { "2": 1234.56 }, singleSupplement: 789.12 },
      3,
      1,
    );
    expect(p.total).toBe(4492.8);
    expect(p.baseTotal).toBe(3703.68);
  });
  it("allows odd day-tour groups without inventing hotel rooms", () => {
    const p = pricePackage({ ...pkg, nights: 0 }, 3, 0);
    expect(p.total).toBe(3000);
    expect(p.doubleRooms).toBe(0);
    expect(() => pricePackage({ ...pkg, nights: 0 }, 3, 1)).toThrow();
  });
  it("offers exactly the single-room counts that fit the group", () => {
    expect(singleRoomOptions(3)).toEqual([1, 3]);
    expect(singleRoomOptions(4)).toEqual([0, 2, 4]);
    expect(singleRoomOptions(12)).toEqual([0, 2, 4, 6, 8, 10, 12]);
  });
});
describe("package publishing and booking validation", () => {
  it("accepts incomplete drafts but requires complete content and six rates for publication", () => {
    expect(packageContentSchema.safeParse(program).success).toBe(true);
    expect(publicationIssues(program)).toEqual([]);
    expect(
      publicationIssues({
        ...program,
        perPersonRates: {},
        singleSupplement: null,
        itinerary: [],
      }),
    ).toHaveLength(3);
    expect(publicationIssues({ ...program, singleSupplement: 0 })).toEqual([]);
  });
  it("rejects unknown rates, unsafe image sources, invalid precision, and extra fields", () => {
    for (const change of [
      { perPersonRates: { "3": 1000 } },
      { perPersonRates: { "2": 1.001 } },
      { imageUrl: "javascript:alert(1)" },
      { imageUrl: "//evil.test/image" },
      { slot: 4 },
    ])
      expect(
        packageContentSchema.safeParse({ ...program, ...change }).success,
      ).toBe(false);
  });
  it("requires valid dates, explicit consent, contact details and price/version acknowledgement", () => {
    const input = {
      travelers: 3,
      singleRooms: 1,
      travelDate: "2026-12-01",
      customerName: "Test Traveler",
      customerEmail: "test@example.com",
      customerPhone: "123456",
      specialRequests: "",
      termsAccepted: true,
      expectedTotal: 3300,
      packageVersion: 1,
      requestKey: "e5eb2b28-090f-4b10-a820-7c6a3d80e80e",
    };
    expect(packageBookingSchema.safeParse(input).success).toBe(true);
    for (const change of [
      { travelDate: "2026-02-30" },
      { termsAccepted: false },
      { expectedTotal: -1 },
      { packageVersion: 0 },
      { total: 1 },
      { requestKey: "not-a-uuid" },
      { customerEmail: "invalid" },
    ])
      expect(
        packageBookingSchema.safeParse({ ...input, ...change }).success,
      ).toBe(false);
  });
});
