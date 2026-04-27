// PricingService — single source of truth for every price the app computes.
//
// Replaces four legacy code paths:
//   - server/pricing-engine.ts (hardcoded ROUTE_PRICES + ADDON_PRICES, dead code)
//   - server/pricing-calculator.ts (read basePriceByVehicle JSONB, dead code)
//   - server/pricing-routes.ts /api/calculate-pricing inline math
//   - server/database-storage.ts calculateQuotePrice with hardcoded attraction
//     and guide price maps
//
// Routes pricing comes from pricing_tiers (effective-dated). For routes that
// have no tier yet, the legacy basePriceByVehicle JSONB is read as a
// fallback — Phase 3 removes that column.
//
// Seasonal modifiers and commission rules are read from their tables every
// call. Empty tables = no modifier / no commission, which is the default.

import { db } from "../db";
import {
  pricingTiers,
  seasonalModifiers,
  commissionRules,
  routes as routesTable,
  timeBlocks,
  vehicleTypes,
  licenseClasses,
  attractions,
  addOns,
  guideRates,
} from "@shared/schema";
import { and, eq, isNull, lte, gte, or, sql } from "drizzle-orm";

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

export class PricingService {
  /**
   * Look up route price from pricing_tiers; fall back to the legacy
   * basePriceByVehicle JSONB if no tier exists. Returns 0 if neither
   * source has a value.
   */
  async getRoutePrice(
    routeId: number,
    vehicleTypeId: number,
    licenseClassId: number,
    asOf: Date = new Date(),
  ): Promise<number> {
    const tier = await db
      .select({ basePrice: pricingTiers.basePrice })
      .from(pricingTiers)
      .where(
        and(
          eq(pricingTiers.routeId, routeId),
          eq(pricingTiers.vehicleTypeId, vehicleTypeId),
          eq(pricingTiers.licenseClassId, licenseClassId),
          lte(pricingTiers.effectiveFrom, asOf),
          or(isNull(pricingTiers.effectiveTo), gte(pricingTiers.effectiveTo, asOf)),
        ),
      )
      .limit(1);

    if (tier.length > 0) return num(tier[0].basePrice);

    // Legacy fallback: basePriceByVehicle JSONB at routes.{vehicleId}.{licenseClassId}
    const [route] = await db
      .select({ basePriceByVehicle: routesTable.basePriceByVehicle })
      .from(routesTable)
      .where(eq(routesTable.id, routeId))
      .limit(1);

    if (!route?.basePriceByVehicle) return 0;
    const blob = route.basePriceByVehicle as Record<string, Record<string, string>>;
    const fallback = blob?.[vehicleTypeId]?.[licenseClassId];
    if (fallback !== undefined) {
      console.warn(
        `[pricing] using legacy basePriceByVehicle fallback for route ${routeId}; seed pricing_tiers to remove this warning`,
      );
      return num(fallback);
    }
    return 0;
  }

  /**
   * Hourly time-block transport price. Stored as JSONB until a future phase
   * normalizes it into pricing_tiers.
   */
  async getTimeBlockPrice(
    timeBlockId: number,
    vehicleTypeId: number,
    licenseClassId: number,
  ): Promise<number> {
    const [tb] = await db
      .select({ basePriceByVehicle: timeBlocks.basePriceByVehicle })
      .from(timeBlocks)
      .where(eq(timeBlocks.id, timeBlockId))
      .limit(1);
    if (!tb) return 0;
    const blob = tb.basePriceByVehicle as Record<string, Record<string, string>>;
    return num(blob?.[vehicleTypeId]?.[licenseClassId]);
  }

  async getAddOnPrice(
    addOnId: number,
    quantity: number,
    travelers: number,
  ): Promise<number> {
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

  async getAttractionPrice(
    attractionId: number,
    travelers: number,
  ): Promise<number> {
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
    // Phase 3 will rename and reconcile; for now treat the value as daily.
    return num(match.hourlyPrice);
  }

  /**
   * Multiplier from seasonal_modifiers active on the given date. Multiple
   * matching modifiers compound. Empty table = 1.0 (no change).
   */
  async getSeasonalMultiplier(
    date: Date,
    appliesTo: "route" | "service" | "addon" | "all" = "all",
  ): Promise<number> {
    const rows = await db
      .select({
        multiplier: seasonalModifiers.multiplier,
        appliesTo: seasonalModifiers.appliesTo,
      })
      .from(seasonalModifiers)
      .where(
        and(
          eq(seasonalModifiers.isActive, true),
          lte(seasonalModifiers.startDate, date),
          gte(seasonalModifiers.endDate, date),
        ),
      );
    return rows
      .filter((r) => r.appliesTo === "all" || r.appliesTo === appliesTo)
      .reduce((acc, r) => acc * num(r.multiplier), 1);
  }

  /**
   * Commission percentage matching the booking subtotal. Empty rules = 0.
   * If multiple rules match, the first is used (stable order by id).
   */
  async getCommissionPct(subtotal: number): Promise<number> {
    const rows = await db
      .select({
        percentage: commissionRules.percentage,
        minBookingValue: commissionRules.minBookingValue,
        maxBookingValue: commissionRules.maxBookingValue,
      })
      .from(commissionRules)
      .where(eq(commissionRules.isActive, true))
      .orderBy(commissionRules.id);
    for (const r of rows) {
      const min = r.minBookingValue !== null ? num(r.minBookingValue) : -Infinity;
      const max = r.maxBookingValue !== null ? num(r.maxBookingValue) : Infinity;
      if (subtotal >= min && subtotal <= max) return num(r.percentage);
    }
    return 0;
  }

  /**
   * Vehicle type that fits the given passenger count, by paxMax. Returns
   * the smallest vehicle that can hold the group.
   */
  async pickVehicleTypeForPassengers(passengers: number): Promise<number | null> {
    const rows = await db
      .select({ id: vehicleTypes.id, paxMax: vehicleTypes.paxMax })
      .from(vehicleTypes)
      .orderBy(vehicleTypes.paxMax);
    const fit = rows.find((r) => r.paxMax >= passengers);
    return fit?.id ?? null;
  }

  /**
   * Sync pricing_tiers from the legacy basePriceByVehicle JSONB shape.
   * Called when admin endpoints write to that column so the new pricing
   * lookup stays in step with admin edits.
   *
   * Input shape: { "1": { "1": "150.50" }, "2": { "1": "210.70" }, ... }
   * where the outer key is vehicleTypeId and "1" is the Normal license
   * class (the only one the admin UI sets directly).
   *
   * Tourism (and any other class) prices are derived from the Normal base
   * price times (1 + surcharge_pct) as defined in license_classes. This
   * preserves the convention the seed data follows and means changing a
   * surcharge updates downstream prices on the next sync.
   *
   * The previous tier for each (route, vehicle, license) combo is closed
   * by setting effective_to = now(); a new tier is inserted with
   * effective_from = now(). Old quotes referencing the old tier are
   * unaffected — they have frozen line items.
   */
  async syncRouteTiers(
    routeId: number,
    basePriceByVehicle: Record<string, Record<string, string | number>> | null,
  ): Promise<{ closed: number; inserted: number }> {
    if (!basePriceByVehicle || typeof basePriceByVehicle !== "object") {
      return { closed: 0, inserted: 0 };
    }

    const classes = await db
      .select({ id: licenseClasses.id, surchargePct: licenseClasses.surchargePct })
      .from(licenseClasses);

    if (classes.length === 0) return { closed: 0, inserted: 0 };

    const now = new Date();
    let closed = 0;
    let inserted = 0;

    for (const [vehicleKey, byLicense] of Object.entries(basePriceByVehicle)) {
      const vehicleId = parseInt(vehicleKey, 10);
      if (!Number.isFinite(vehicleId)) continue;
      const normalRaw = byLicense?.["1"];
      const normalPrice = num(normalRaw);
      if (normalPrice <= 0) continue;

      for (const cls of classes) {
        const surcharge = num(cls.surchargePct);
        const newPrice = round2(normalPrice * (1 + surcharge));

        const close = await db
          .update(pricingTiers)
          .set({ effectiveTo: now })
          .where(
            and(
              eq(pricingTiers.routeId, routeId),
              eq(pricingTiers.vehicleTypeId, vehicleId),
              eq(pricingTiers.licenseClassId, cls.id),
              isNull(pricingTiers.effectiveTo),
            ),
          )
          .returning({ id: pricingTiers.id });
        closed += close.length;

        await db.insert(pricingTiers).values({
          routeId,
          vehicleTypeId: vehicleId,
          licenseClassId: cls.id,
          basePrice: newPrice.toFixed(2),
          effectiveFrom: now,
          notes: "Synced from admin edit",
        });
        inserted += 1;
      }
    }

    return { closed, inserted };
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
