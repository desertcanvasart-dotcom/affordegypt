import type { Express } from "express";
import { storage } from "../database-storage";
import { validateBody } from "../middleware/validate";
import { quoteRequestSchema } from "../request-schemas";
import { adminAuth, parseServiceSlugs } from "./shared";
import {
  buildQuoteFromRequest,
  buildMultiCityQuote,
  persistFrozenQuote,
  getFrozenLineItems,
} from "../services/quote-builder";
import {
  isVehicleSlug,
  isTripType,
  RoutePriceNotSetError,
  ServicePriceNotSetError,
} from "../services/pricing";

// Quotes: server recomputes and freezes totals; client-supplied totals are
// never trusted. Extracted from routes.ts (see refactor: split routes).
export function registerQuoteRoutes(app: Express): void {
  app.get("/api/quotes", ...adminAuth, async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);

      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      // Return frozen line items so callers can render an immutable
      // breakdown without re-pricing. Empty for quotes created before
      // Phase 2 — they only have jsonBlob.
      const lineItems = await getFrozenLineItems(id);
      res.json({ ...quote, lineItems });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a frozen quote. Server recomputes totals from the request
  // fields; client-supplied total is ignored. Returns the new quote with
  // its frozen line items.
  app.post("/api/quotes", validateBody(quoteRequestSchema), async (req, res) => {
    try {
      // Multi-city planner sends a `cityServices` itinerary; price the whole
      // thing through the shared builder (same one the preview uses) so the
      // frozen total matches what was previewed. Otherwise fall back to the
      // single-trip request shape.
      const cityServices = req.body.cityServices;
      const built =
        Array.isArray(cityServices) && cityServices.length > 0
          ? await buildMultiCityQuote(cityServices, req.body.travelers)
          : await buildQuoteFromRequest({
              routeId: req.body.routeId ?? null,
              vehicleSlug: isVehicleSlug(req.body.vehicleSlug) ? req.body.vehicleSlug : null,
              tripType: isTripType(req.body.tripType) ? req.body.tripType : "one_way",
              cityId: req.body.cityId ?? null,
              guideLanguage: req.body.guideLanguage ?? null,
              guideHours: req.body.guideHours ?? null,
              attractionIds: req.body.attractionIds ?? req.body.selectedAttractions ?? [],
              addOnIds: req.body.addOnIds ?? req.body.selectedAddOns ?? [],
              travelers: req.body.travelers ?? req.body.passengerCount ?? 1,
              serviceSlugs: parseServiceSlugs(req.body.serviceSlugs),
            });

      const persisted = await persistFrozenQuote(built, {
        request: req.body,
        source: "POST /api/quotes",
      });

      const quote = await storage.getQuote(persisted.quoteId);
      res.json({
        ...quote,
        breakdown: built.breakdown,
        lineItems: built.lineItems,
      });
    } catch (error: any) {
      if (error instanceof RoutePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          routeId: error.routeId,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
      if (error instanceof ServicePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          slug: error.slug,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
      console.error("Error creating quote:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/quotes/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuote(id);
      res.json({ message: "Quote deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
