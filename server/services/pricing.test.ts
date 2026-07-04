// Unit tests for the pure (non-DB) parts of the pricing service:
// vehicle selection, price-key construction, type guards, and line-item
// math. DB-backed lookups are covered end-to-end by
// scripts/check-invariants.mjs against the live API.
import { describe, expect, it, vi } from "vitest";

// pricing.ts imports ../db at module scope, which throws without
// DATABASE_URL and opens a pg pool with one. Stub it — nothing in these
// tests touches the database.
vi.mock("../db", () => ({ db: {}, pool: {} }));

import {
  PricingService,
  pickVehicleSlugForPassengers,
  priceKey,
  catalogPriceKey,
  isVehicleSlug,
  isTripType,
  isCatalogTripType,
  VEHICLE_SLUGS,
  CATALOG_TRIP_TYPES,
} from "./pricing";

describe("pickVehicleSlugForPassengers", () => {
  it("assigns sedan for groups of 1–2", () => {
    expect(pickVehicleSlugForPassengers(1)).toBe("sedan");
    expect(pickVehicleSlugForPassengers(2)).toBe("sedan");
  });

  it("assigns minivan for groups of 3–8", () => {
    expect(pickVehicleSlugForPassengers(3)).toBe("minivan");
    expect(pickVehicleSlugForPassengers(8)).toBe("minivan");
  });

  it("assigns van for groups of 9+", () => {
    expect(pickVehicleSlugForPassengers(9)).toBe("van");
    expect(pickVehicleSlugForPassengers(15)).toBe("van");
    expect(pickVehicleSlugForPassengers(50)).toBe("van");
  });
});

describe("price keys", () => {
  it("builds `${vehicle}_${tripType}` keys — the durable JSONB contract", () => {
    expect(priceKey("sedan", "one_way")).toBe("sedan_one_way");
    expect(priceKey("van", "round_trip_multi_day")).toBe("van_round_trip_multi_day");
    expect(catalogPriceKey("minivan", "8hr")).toBe("minivan_8hr");
  });
});

describe("type guards", () => {
  it("accepts every canonical slug and trip type", () => {
    for (const v of VEHICLE_SLUGS) expect(isVehicleSlug(v)).toBe(true);
    for (const t of CATALOG_TRIP_TYPES) expect(isCatalogTripType(t)).toBe(true);
    expect(isTripType("one_way")).toBe(true);
  });

  it("rejects unknown values, null, and non-strings", () => {
    expect(isVehicleSlug("limousine")).toBe(false);
    expect(isVehicleSlug(null)).toBe(false);
    expect(isVehicleSlug(3)).toBe(false);
    expect(isTripType("8hr")).toBe(false); // hourly rentals are catalog-only
    expect(isCatalogTripType("weekly")).toBe(false);
  });
});

describe("PricingService.lineGeneric", () => {
  it("computes lineTotal = unitPrice × quantity, rounded to 2dp", () => {
    const li = PricingService.lineGeneric({
      kind: "service",
      description: "test",
      unitPrice: 33.333,
      quantity: 3,
    });
    expect(li.unitPrice).toBe(33.33);
    expect(li.lineTotal).toBe(100); // 33.333 * 3 = 99.999 → 100.00
  });

  it("defaults quantity to 1 and nulls the id fields", () => {
    const li = PricingService.lineGeneric({
      kind: "guide",
      description: "guide",
      unitPrice: 2750,
    });
    expect(li.quantity).toBe(1);
    expect(li.lineTotal).toBe(2750);
    expect(li.serviceId).toBeNull();
    expect(li.routeId).toBeNull();
  });
});
