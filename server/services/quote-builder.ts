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
import { quoteLineItems, quotes, attractions } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  pricingService,
  RoutePriceNotSetError,
  ServicePriceNotSetError,
  type LineItem,
  type VehicleSlug,
  type TripType,
  type CatalogTripType,
  PricingService,
} from "./pricing";

export interface CatalogServiceRequest {
  slug: string;
  vehicleSlug: VehicleSlug;
  tripType: CatalogTripType;
}

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
  /**
   * Catalog selections from the new planner. Each entry is priced as a
   * separate line item against service_catalog.vehicle_prices. Throws
   * ServicePriceNotSetError on any unpriced combination.
   */
  serviceSlugs?: CatalogServiceRequest[];
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

  // Catalog services (one line item per selection). Priced identically
  // to routes — JSONB lookup keyed `${vehicleSlug}_${tripType}` against
  // service_catalog.vehicle_prices. Each entry is its own line; the
  // total accumulates into `breakdown.routes` since these are the new
  // route-equivalent in the catalog model.
  if (req.serviceSlugs && req.serviceSlugs.length > 0) {
    for (const entry of req.serviceSlugs) {
      const unit = await pricingService.getServicePrice(
        entry.slug,
        entry.vehicleSlug,
        entry.tripType,
      );
      if (unit === null) {
        throw new ServicePriceNotSetError(entry.slug, entry.vehicleSlug, entry.tripType);
      }
      const item = PricingService.lineGeneric({
        kind: "service",
        description: `Service: ${entry.slug} — ${entry.vehicleSlug} (${entry.tripType})`,
        unitPrice: unit,
        quantity: 1,
        meta: {
          serviceSlug: entry.slug,
          vehicleSlug: entry.vehicleSlug,
          tripType: entry.tripType,
          travelers,
        },
      });
      lineItems.push(item);
      breakdown.routes += item.lineTotal;
    }
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

// One city's selections in a multi-city itinerary, as sent by the planner.
export interface MultiCityCityInput {
  cityId?: number | null;
  cityName?: string | null;
  travelers?: number | null;
  selectedServices?: CatalogServiceRequest[];
  selectedGuide?: { language?: string | null } | null;
  selectedAttractions?: Array<number | string | { id?: number; name?: string }>;
  selectedEntranceFees?: string[];
  selectedAddOns?: Array<number | { id: number; quantity?: number }>;
}

export interface PerCityBreakdown {
  city: string;
  routes: number;
  guide: number;
  attractions: number;
  addOns: number;
  total: number;
}

export interface BuiltMultiCityQuote extends BuiltQuote {
  travelers: number;
  perCity: PerCityBreakdown[];
}

/**
 * Builds line items for a whole multi-city itinerary, pricing every city's
 * transfers, guide, attractions, and add-ons through the SAME PricingService
 * methods as buildQuoteFromRequest — so single-trip and multi-city stay
 * consistent. Used by both the preview (/api/pricing/calculate) and the
 * freeze (/api/quotes) so the previewed total always equals the frozen total.
 * Throws ServicePriceNotSetError on an unpriced catalog combination (the
 * picker already excludes those; surfacing 422 beats silently dropping it).
 */
export async function buildMultiCityQuote(
  cityServices: MultiCityCityInput[],
  travelersInput?: number | null,
): Promise<BuiltMultiCityQuote> {
  // One global travelers count: explicit arg, else the max any city carries.
  const travelers = Math.max(
    1,
    Math.floor(
      travelersInput ??
        cityServices.reduce(
          (m, c) => Math.max(m, Math.floor(c.travelers ?? 1)),
          1,
        ),
    ),
  );

  const lineItems: LineItem[] = [];
  const breakdown: QuoteBreakdown = { routes: 0, guide: 0, attractions: 0, addons: 0 };
  const perCity: PerCityBreakdown[] = [];

  // Resolve attraction names → ids lazily (the planner sends names; the
  // attractions table may be empty, in which case nothing resolves).
  let attractionByName: Map<string, number> | null = null;
  const resolveAttraction = async (
    raw: number | string | { id?: number; name?: string },
  ): Promise<number | null> => {
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && typeof raw.id === "number") return raw.id;
    if (typeof raw === "string" || (raw && typeof raw === "object" && raw.name)) {
      const name = (typeof raw === "string" ? raw : raw.name ?? "").trim().toLowerCase();
      if (!name) return null;
      if (!attractionByName) {
        const rows = await db
          .select({ id: attractions.id, name: attractions.name })
          .from(attractions);
        attractionByName = new Map(rows.map((r) => [r.name.trim().toLowerCase(), r.id]));
      }
      return attractionByName.get(name) ?? null;
    }
    return null;
  };

  for (const city of cityServices) {
    const cityName = city.cityName ?? "Itinerary";
    let cRoutes = 0, cGuide = 0, cAttractions = 0, cAddOns = 0;

    // Catalog services (transfers/tours) — flat vehicle price, one line each.
    for (const sel of city.selectedServices ?? []) {
      if (!sel || typeof sel.slug !== "string") continue;
      const unit = await pricingService.getServicePrice(sel.slug, sel.vehicleSlug, sel.tripType);
      if (unit === null) {
        throw new ServicePriceNotSetError(sel.slug, sel.vehicleSlug, sel.tripType);
      }
      const item = PricingService.lineGeneric({
        kind: "service",
        description: `Service: ${sel.slug} — ${sel.vehicleSlug} (${sel.tripType}) [${cityName}]`,
        unitPrice: unit,
        quantity: 1,
        meta: { serviceSlug: sel.slug, vehicleSlug: sel.vehicleSlug, tripType: sel.tripType, cityName, travelers },
      });
      lineItems.push(item);
      cRoutes += item.lineTotal;
    }

    // Guide — daily rate, charged once per city.
    const lang = city.selectedGuide?.language;
    if (city.cityId && lang) {
      const daily = await pricingService.getGuideDailyRate(city.cityId, lang);
      if (daily > 0) {
        const item = PricingService.lineGeneric({
          kind: "guide",
          description: `Guide (${lang}) [${cityName}]`,
          unitPrice: daily,
          quantity: 1,
          meta: { cityId: city.cityId, language: lang, cityName, travelers },
        });
        lineItems.push(item);
        cGuide += item.lineTotal;
      }
    }

    // Attractions — per-person (ticket × travelers).
    for (const raw of city.selectedAttractions ?? []) {
      const attractionId = await resolveAttraction(raw);
      if (attractionId === null) continue;
      const total = await pricingService.getAttractionPrice(attractionId, travelers);
      if (total > 0) {
        const item = PricingService.lineGeneric({
          kind: "attraction",
          description: `Attraction #${attractionId} [${cityName}]`,
          unitPrice: total / travelers,
          quantity: travelers,
          meta: { attractionId, cityName, travelers },
        });
        lineItems.push(item);
        cAttractions += item.lineTotal;
      }
    }

    // Entrance fees — per-person (price_per_person × travelers), slug-keyed.
    // Accumulated into the attractions bucket (admission tickets); the planner
    // labels this "Entrance fees".
    for (const slug of city.selectedEntranceFees ?? []) {
      if (typeof slug !== "string" || !slug) continue;
      const total = await pricingService.getEntranceFeePrice(slug, travelers);
      if (total > 0) {
        const item = PricingService.lineGeneric({
          kind: "attraction",
          description: `Entrance: ${slug} [${cityName}]`,
          unitPrice: total / travelers,
          quantity: travelers,
          meta: { entranceFeeSlug: slug, cityName, travelers },
        });
        lineItems.push(item);
        cAttractions += item.lineTotal;
      }
    }

    // Add-ons — per-person or flat, per getAddOnPrice's unitType.
    for (const raw of city.selectedAddOns ?? []) {
      const addOnId = typeof raw === "number" ? raw : raw?.id;
      const quantity = typeof raw === "number" ? 1 : Math.max(1, Math.floor(raw?.quantity ?? 1));
      if (typeof addOnId !== "number") continue;
      const total = await pricingService.getAddOnPrice(addOnId, quantity, travelers);
      if (total > 0) {
        const item = PricingService.lineGeneric({
          kind: "addon",
          description: `Add-on #${addOnId} [${cityName}]`,
          unitPrice: total / quantity,
          quantity,
          meta: { addOnId, cityName, travelers },
        });
        lineItems.push(item);
        cAddOns += item.lineTotal;
      }
    }

    breakdown.routes += cRoutes;
    breakdown.guide += cGuide;
    breakdown.attractions += cAttractions;
    breakdown.addons += cAddOns;
    perCity.push({
      city: cityName,
      routes: round2(cRoutes),
      guide: round2(cGuide),
      attractions: round2(cAttractions),
      addOns: round2(cAddOns),
      total: round2(cRoutes + cGuide + cAttractions + cAddOns),
    });
  }

  const subtotal = round2(lineItems.reduce((s, l) => s + l.lineTotal, 0));
  return { lineItems, breakdown, subtotal, total: subtotal, travelers, perCity };
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
