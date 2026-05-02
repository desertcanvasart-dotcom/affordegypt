// PricingService — single source of truth for every price the app shows
// or freezes. Pure lookup, no math.
//
// Route prices live in routes.vehicle_prices as a flat JSONB keyed by
// `${vehicleSlug}_${tripType}`:
//   {
//     "sedan_one_way": 600,
//     "sedan_round_trip_same_day": 1000,
//     "sedan_round_trip_multi_day": 1200,
//     "minivan_one_way": 800,
//     ...
//     "van_round_trip_multi_day": 2000
//   }
//
// What the admin types is what the user sees and what the booking
// freezes. If a key isn't set, that combination is unavailable —
// callers get null and surface that as "not available."
//
// The legacy multiplier code (pricing_tiers, license_classes,
// seasonal_modifiers, commission_rules) is no longer read on the route
// path. See docs/PRICING_CLEANUP.md for the drop list.
//
// Add-on, attraction, and guide pricing remain pure lookups against
// their own tables. Quote totals are sum-of-line-items, period.

import { db } from "../db";
import {
  routes as routesTable,
  attractions,
  addOns,
  guideRates,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export type VehicleSlug = "sedan" | "minivan" | "van";
export type TripType = "one_way" | "round_trip_same_day" | "round_trip_multi_day";
export type VehiclePriceKey = `${VehicleSlug}_${TripType}`;
export type VehiclePrices = Partial<Record<VehiclePriceKey, number>>;

export const VEHICLE_SLUGS: readonly VehicleSlug[] = ["sedan", "minivan", "van"] as const;
export const TRIP_TYPES: readonly TripType[] = [
  "one_way",
  "round_trip_same_day",
  "round_trip_multi_day",
] as const;

export const isVehicleSlug = (v: unknown): v is VehicleSlug =>
  typeof v === "string" && (VEHICLE_SLUGS as readonly string[]).includes(v);

export const isTripType = (v: unknown): v is TripType =>
  typeof v === "string" && (TRIP_TYPES as readonly string[]).includes(v);

export const priceKey = (slug: VehicleSlug, tripType: TripType): VehiclePriceKey =>
  `${slug}_${tripType}` as VehiclePriceKey;

export class RoutePriceNotSetError extends Error {
  constructor(
    public routeId: number,
    public vehicleSlug: VehicleSlug,
    public tripType: TripType,
  ) {
    super(
      `Route ${routeId} has no price set for vehicle "${vehicleSlug}" and trip type "${tripType}"`,
    );
    this.name = "RoutePriceNotSetError";
  }
}

export type LineItemKind =
  | "route"
  | "service"
  | "addon"
  | "attraction"
  | "guide"
  | "adjustment";

export interface LineItem {
  kind: LineItemKind;
  description: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  serviceId?: number | null;
  routeId?: number | null;
  meta?: Record<string, unknown>;
}

const num = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Smallest vehicle that fits the group. paxMax: sedan ≤2, minivan ≤8, van otherwise. */
export function pickVehicleSlugForPassengers(passengers: number): VehicleSlug {
  if (passengers <= 2) return "sedan";
  if (passengers <= 8) return "minivan";
  return "van";
}

export class PricingService {
  /**
   * Pure JSONB lookup against routes.vehicle_prices. Lookup key is
   * `${vehicleSlug}_${tripType}`. Returns null when the key isn't set
   * so callers can distinguish "not priced" from "free." tripType
   * defaults to "one_way" for back-compat with single-trip flows.
   */
  async getRoutePrice(
    routeId: number,
    vehicleSlug: VehicleSlug,
    tripType: TripType = "one_way",
  ): Promise<number | null> {
    const [route] = await db
      .select({ vehiclePrices: routesTable.vehiclePrices })
      .from(routesTable)
      .where(eq(routesTable.id, routeId))
      .limit(1);

    if (!route?.vehiclePrices) return null;
    const blob =
      typeof route.vehiclePrices === "string"
        ? (JSON.parse(route.vehiclePrices) as Record<string, unknown>)
        : (route.vehiclePrices as Record<string, unknown>);

    const raw = blob?.[priceKey(vehicleSlug, tripType)];
    if (raw === undefined || raw === null || raw === "") return null;
    const price = num(raw as string | number);
    return price > 0 ? price : null;
  }

  async getAddOnPrice(addOnId: number, quantity: number, travelers: number): Promise<number> {
    const [a] = await db
      .select({ price: addOns.price, unitType: addOns.unitType })
      .from(addOns)
      .where(eq(addOns.id, addOnId))
      .limit(1);
    if (!a) return 0;
    const base = num(a.price);
    if (a.unitType === "per_person") return base * quantity * travelers;
    return base * quantity;
  }

  async getAttractionPrice(attractionId: number, travelers: number): Promise<number> {
    const [a] = await db
      .select({ ticketPrice: attractions.ticketPrice })
      .from(attractions)
      .where(eq(attractions.id, attractionId))
      .limit(1);
    return a ? num(a.ticketPrice) * travelers : 0;
  }

  /**
   * Daily rate for a guide in the given city + language. Returns 0 if no
   * matching guide exists. Comparison is case-insensitive and trimmed
   * because guide_rates language strings have inconsistent casing.
   */
  async getGuideDailyRate(cityId: number, language: string): Promise<number> {
    const rows = await db
      .select({ language: guideRates.language, hourlyPrice: guideRates.hourlyPrice })
      .from(guideRates)
      .where(eq(guideRates.cityId, cityId));
    const target = language.trim().toLowerCase();
    const match = rows.find((r) => r.language.trim().toLowerCase() === target);
    if (!match) return 0;
    // Schema column is named hourlyPrice but the live data is daily.
    return num(match.hourlyPrice);
  }

  static lineFromRoute(args: {
    routeId: number;
    description: string;
    unitPrice: number;
    quantity?: number;
    meta?: Record<string, unknown>;
  }): LineItem {
    const quantity = args.quantity ?? 1;
    return {
      kind: "route",
      routeId: args.routeId,
      description: args.description,
      unitPrice: round2(args.unitPrice),
      quantity,
      lineTotal: round2(args.unitPrice * quantity),
      meta: args.meta,
    };
  }

  static lineGeneric(args: {
    kind: LineItemKind;
    description: string;
    unitPrice: number;
    quantity?: number;
    serviceId?: number | null;
    routeId?: number | null;
    meta?: Record<string, unknown>;
  }): LineItem {
    const quantity = args.quantity ?? 1;
    return {
      kind: args.kind,
      description: args.description,
      unitPrice: round2(args.unitPrice),
      quantity,
      lineTotal: round2(args.unitPrice * quantity),
      serviceId: args.serviceId ?? null,
      routeId: args.routeId ?? null,
      meta: args.meta,
    };
  }
}

export const pricingService = new PricingService();
