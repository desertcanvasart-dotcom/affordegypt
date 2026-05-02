import type { Express } from "express";
import { z } from "zod";
import { buildQuoteFromRequest } from "./services/quote-builder";
import { RoutePriceNotSetError, VEHICLE_SLUGS, TRIP_TYPES } from "./services/pricing";

// Server-side schema for /api/calculate-pricing. Bounds-check travelers
// against a hard upper limit so a tampered request can't request a quote
// for absurd numbers; tighten further once vehicle capacity is wired in.
const calcPricingSchema = z.object({
  routeId: z.number().int().positive().optional().nullable(),
  vehicleSlug: z.enum(VEHICLE_SLUGS as unknown as [string, ...string[]]).optional().nullable(),
  /** Defaults to "one_way" downstream. */
  tripType: z.enum(TRIP_TYPES as unknown as [string, ...string[]]).optional().nullable(),
  cityId: z.number().int().positive().optional().nullable(),
  guideLanguage: z.string().optional().nullable(),
  guideHours: z.number().int().positive().max(24).optional(),
  attractionIds: z.array(z.number().int().positive()).optional(),
  addOnIds: z
    .array(
      z.union([
        z.number().int().positive(),
        z.object({
          id: z.number().int().positive(),
          quantity: z.number().int().positive().max(100).optional(),
        }),
      ]),
    )
    .optional(),
  travelers: z.number().int().min(1).max(50).optional(),
});

export async function registerPricingRoutes(app: Express): Promise<void> {
  // Live pricing preview used by the booking sidebar. All math goes through
  // PricingService → quote-builder so the breakdown matches what gets frozen
  // when a quote is actually created.
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const parsed = calcPricingSchema.parse(req.body);
      const built = await buildQuoteFromRequest({
        ...parsed,
        vehicleSlug: parsed.vehicleSlug as any,
        tripType: parsed.tripType as any,
      });
      const travelers = Math.max(1, Math.floor(parsed.travelers ?? 1));

      res.json({
        subtotal: built.subtotal.toFixed(2),
        breakdown: {
          routes: built.breakdown.routes,
          guide: built.breakdown.guide,
          attractions: built.breakdown.attractions,
          addons: built.breakdown.addons,
        },
        total: built.total.toFixed(2),
        perPerson: (built.total / travelers).toFixed(2),
        currency: "EGP",
      });
    } catch (error: any) {
      if (error instanceof RoutePriceNotSetError) {
        return res.status(422).json({
          message: error.message,
          unpriced: true,
          routeId: error.routeId,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
        });
      }
      if (error?.issues) {
        return res.status(400).json({ message: "Invalid request", issues: error.issues });
      }
      console.error("[/api/calculate-pricing] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
