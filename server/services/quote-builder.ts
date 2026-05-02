// Quote builder — turns a booking request into a list of priced line items
// using the PricingService, then writes those lines as immutable rows in
// quote_line_items and marks the parent quote as frozen.
//
// Route prices are pure JSONB lookups keyed by vehicle slug. If the slug
// isn't priced for the route, getRoutePrice returns null and we throw
// RoutePriceNotSetError so the API can return 422 — never silently
// substitute math or a fallback.
//
// Commission markup was killed in the pricing-simplification phase. Quote
// total is now exactly the sum of line items.

import { db } from "../db";
import { quoteLineItems, quotes } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  pricingService,
  RoutePriceNotSetError,
  type LineItem,
  type VehicleSlug,
  type TripType,
  PricingService,
} from "./pricing";

export interface QuoteRequest {
  routeId?: number | null;
  vehicleSlug?: VehicleSlug | null;
  /** One-way is the default for back-compat with single-trip flows. */
  tripType?: TripType | null;
  cityId?: number | null;
  guideLanguage?: string | null;
  guideHours?: number | null;
  attractionIds?: number[];
  addOnIds?: Array<number | { id: number; quantity?: number }>;
  travelers?: number;
}

export interface QuoteBreakdown {
  routes: number;
  guide: number;
  attractions: number;
  addons: number;
}

export interface BuiltQuote {
  lineItems: LineItem[];
  breakdown: QuoteBreakdown;
  subtotal: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Builds line items from a flat single-route quote request. Throws
 * RoutePriceNotSetError if a route is requested with an unpriced
 * vehicle slug — callers map that to a 422 with `{ unpriced: true }`.
 */
export async function buildQuoteFromRequest(req: QuoteRequest): Promise<BuiltQuote> {
  const travelers = Math.max(1, Math.floor(req.travelers ?? 1));
  const lineItems: LineItem[] = [];
  const breakdown: QuoteBreakdown = { routes: 0, guide: 0, attractions: 0, addons: 0 };

  // Route
  if (req.routeId && req.vehicleSlug) {
    const tripType: TripType = req.tripType ?? "one_way";
    const routeUnit = await pricingService.getRoutePrice(
      req.routeId,
      req.vehicleSlug,
      tripType,
    );
    if (routeUnit === null) {
      throw new RoutePriceNotSetError(req.routeId, req.vehicleSlug, tripType);
    }
    const item = PricingService.lineFromRoute({
      routeId: req.routeId,
      description: `Route #${req.routeId} — ${req.vehicleSlug} (${tripType})`,
      unitPrice: routeUnit,
      quantity: 1,
      meta: { vehicleSlug: req.vehicleSlug, tripType, travelers },
    });
    lineItems.push(item);
    breakdown.routes = item.lineTotal;
  }

  // Guide (daily rate, charged once per booking)
  if (req.cityId && req.guideLanguage) {
    const daily = await pricingService.getGuideDailyRate(req.cityId, req.guideLanguage);
    if (daily > 0) {
      const days = Math.max(1, Math.ceil((req.guideHours ?? 8) / 8));
      const item = PricingService.lineGeneric({
        kind: "guide",
        description: `Guide (${req.guideLanguage}) — ${days} day${days > 1 ? "s" : ""}`,
        unitPrice: daily,
        quantity: days,
        meta: { cityId: req.cityId, language: req.guideLanguage, travelers },
      });
      lineItems.push(item);
      breakdown.guide = item.lineTotal;
    }
  }

  // Attractions (per-person)
  if (req.attractionIds && req.attractionIds.length > 0) {
    for (const attractionId of req.attractionIds) {
      const total = await pricingService.getAttractionPrice(attractionId, travelers);
      if (total > 0) {
        const unit = total / travelers;
        const item = PricingService.lineGeneric({
          kind: "attraction",
          description: `Attraction #${attractionId}`,
          unitPrice: unit,
          quantity: travelers,
          meta: { attractionId, travelers },
        });
        lineItems.push(item);
        breakdown.attractions += item.lineTotal;
      }
    }
  }

  // Add-ons
  if (req.addOnIds && req.addOnIds.length > 0) {
    for (const raw of req.addOnIds) {
      const addOnId = typeof raw === "number" ? raw : raw.id;
      const quantity = typeof raw === "number" ? 1 : Math.max(1, Math.floor(raw.quantity ?? 1));
      const total = await pricingService.getAddOnPrice(addOnId, quantity, travelers);
      if (total > 0) {
        const unit = total / quantity;
        const item = PricingService.lineGeneric({
          kind: "addon",
          description: `Add-on #${addOnId}`,
          unitPrice: unit,
          quantity,
          meta: { addOnId, travelers },
        });
        lineItems.push(item);
        breakdown.addons += item.lineTotal;
      }
    }
  }

  const subtotal = round2(lineItems.reduce((s, l) => s + l.lineTotal, 0));
  // Total === subtotal. No commission, no markup. Sum of line items, period.
  return { lineItems, breakdown, subtotal, total: subtotal };
}

/**
 * Persist a built quote: writes the parent quotes row plus one
 * quote_line_items row per line, and sets frozen_at = now() so the
 * snapshot is immutable. commission_pct is hard-zero (column not yet
 * dropped — see docs/PRICING_CLEANUP.md).
 */
export async function persistFrozenQuote(
  built: BuiltQuote,
  jsonBlob: Record<string, unknown>,
): Promise<{ quoteId: number; total: string }> {
  const total = built.total.toFixed(2);

  const [quote] = await db
    .insert(quotes)
    .values({
      jsonBlob,
      total,
      commissionPct: "0.0000",
      frozenAt: new Date(),
      version: 1,
    })
    .returning({ id: quotes.id });

  if (built.lineItems.length > 0) {
    await db.insert(quoteLineItems).values(
      built.lineItems.map((li, idx) => ({
        quoteId: quote.id,
        serviceId: li.serviceId ?? null,
        routeId: li.routeId ?? null,
        kind: li.kind,
        description: li.description,
        unitPrice: li.unitPrice.toFixed(2),
        quantity: li.quantity.toFixed(2),
        lineTotal: li.lineTotal.toFixed(2),
        sortOrder: idx,
        meta: li.meta ?? null,
      })),
    );
  }

  return { quoteId: quote.id, total };
}

/**
 * Read all frozen line items for a quote. Returns [] if the quote was
 * created before line-item freezing was wired up; callers should fall
 * back to jsonBlob in that case.
 */
export async function getFrozenLineItems(quoteId: number) {
  return db
    .select()
    .from(quoteLineItems)
    .where(eq(quoteLineItems.quoteId, quoteId))
    .orderBy(quoteLineItems.sortOrder);
}
