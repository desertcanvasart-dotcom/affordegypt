import type { Express } from "express";
import { storage } from "../database-storage";
import { emailService } from "../email-service";
import { insertBookingSchema } from "@shared/schema";
import { validateBody } from "../middleware/validate";
import { bookingRequestSchema, routeBookingRequestSchema } from "../request-schemas";
import { adminAuth, parseServiceSlugs } from "./shared";
import { buildQuoteFromRequest, persistFrozenQuote } from "../services/quote-builder";
import {
  pickVehicleSlugForPassengers,
  RoutePriceNotSetError,
  ServicePriceNotSetError,
  isVehicleSlug,
  isTripType,
  type VehicleSlug,
  type TripType,
} from "../services/pricing";

// Bookings: customer creation (full itinerary + transfer-only), public/admin
// reads, and admin status/payment/email actions. The server always recomputes
// totals and freezes a quote; client-supplied totals are never trusted.
// Extracted from routes.ts (see refactor: split routes).
export function registerBookingRoutes(app: Express): void {
  // Create booking
  app.post("/api/bookings", validateBody(bookingRequestSchema), async (req, res) => {
    try {
      // Generate booking reference if not provided
      const bookingReference =
        req.body.bookingReference || storage.generateBookingReference();

      // Server-side pricing: ignore client-supplied totalAmount and recompute
      // from the same fields the live preview uses. Persisting the quote
      // freezes the line items so this booking's total can never silently
      // change later.
      let quoteId = req.body.quoteId;
      let serverTotal: string | null = null;

      if (!quoteId) {
        const built = await buildQuoteFromRequest({
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

        if (built.lineItems.length > 0) {
          const persisted = await persistFrozenQuote(built, {
            itinerary: req.body.itinerary,
            travelers: req.body.travelers || 1,
            travelDate: req.body.travelDate,
            source: "POST /api/bookings",
          });
          quoteId = persisted.quoteId;
          serverTotal = persisted.total;
        }
      }

      // Prepare booking data with required fields. totalAmount is taken
      // from the freshly priced quote when we computed one; otherwise we
      // fall back to a passed-in quoteId's value (looked up below).
      let totalAmount = serverTotal;
      if (!totalAmount && quoteId) {
        const existing = await storage.getQuote(quoteId);
        totalAmount = existing?.total ?? "0";
      }

      const bookingData = {
        ...req.body,
        bookingReference,
        totalAmount: totalAmount ?? "0",
        quoteId,
        startDate: req.body.travelDate ? new Date(req.body.travelDate) : null,
        paymentStatus: "pending",
        bookingStatus: "confirmed",
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);

      // Send confirmation email
      try {
        if (booking.quoteId) {
          const quote = await storage.getQuote(booking.quoteId);
          if (quote) {
            const emailSent = await emailService.sendBookingConfirmation(
              booking,
              quote,
            );
            if (emailSent) {
              console.log(
                `Confirmation email sent for booking ${booking.bookingReference}`,
              );
              // Mark email as sent in the database
              await storage.markEmailSent(booking.id, "confirmation");
            } else {
              console.log(
                `Failed to send confirmation email for booking ${booking.bookingReference}`,
              );
            }
          }
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the booking creation if email fails
      }

      res.json(booking);
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
      console.error("Booking creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get booking by reference (public endpoint)
  app.get("/api/bookings/reference/:reference", async (req, res) => {
    try {
      const booking = await storage.getBookingByReference(req.params.reference);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Get associated quote data
      let quote = null;
      if (booking.quoteId) {
        quote = await storage.getQuote(booking.quoteId);
      }

      res.json({
        booking,
        quote: quote
          ? {
              id: quote.id,
              jsonBlob: quote.jsonBlob,
              total: quote.total,
              commissionPct: quote.commissionPct,
            }
          : null,
      });
    } catch (error: any) {
      console.error("Booking reference lookup error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all bookings (admin endpoint)
  app.get("/api/admin/bookings", ...adminAuth, async (req, res) => {
    try {
      const bookings = await storage.getBookings();

      // Get quote data for each booking that has a quoteId
      const bookingsWithQuotes = await Promise.all(
        bookings.map(async (booking) => {
          if (booking.quoteId) {
            const quote = await storage.getQuote(booking.quoteId);
            return {
              ...booking,
              quote: quote
                ? {
                    id: quote.id,
                    jsonBlob: quote.jsonBlob,
                    total: quote.total,
                    commissionPct: quote.commissionPct,
                  }
                : null,
            };
          }
          return {
            ...booking,
            quote: null,
          };
        }),
      );

      res.json(bookingsWithQuotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete booking endpoint (admin only)
  app.delete("/api/bookings/:id", ...adminAuth, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);

      // Get booking to verify it exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Delete the booking
      await storage.deleteBooking(bookingId);

      res.json({ message: "Booking deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Route-only booking endpoint (transportation only)
  // Simple single-route booking. Mirrors /api/bookings: server recomputes
  // the total via PricingService and freezes a quote so the booking has an
  // immutable financial record. Client-supplied totalAmount is ignored.
  // Accepts `vehicleSlug` ("sedan" | "minivan" | "van") directly, or
  // legacy `vehicleType` string. If neither is supplied, picks by pax count.
  app.post("/api/route-bookings", validateBody(routeBookingRequestSchema), async (req, res) => {
    try {
      const {
        routeId,
        vehicleSlug: rawVehicleSlug,
        vehicleType,
        tripType: rawTripType,
        passengers,
        travelers,
        travelDate,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
      } = req.body;

      if (!routeId || !customerName || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: "Missing required booking information",
        });
      }

      const pax = Math.max(1, Math.floor(passengers ?? travelers ?? 1));
      const candidate =
        typeof rawVehicleSlug === "string"
          ? rawVehicleSlug.toLowerCase()
          : typeof vehicleType === "string"
            ? vehicleType.toLowerCase()
            : null;
      const vehicleSlug: VehicleSlug = isVehicleSlug(candidate)
        ? candidate
        : pickVehicleSlugForPassengers(pax);
      const tripType: TripType = isTripType(rawTripType) ? rawTripType : "one_way";

      let built;
      try {
        built = await buildQuoteFromRequest({
          routeId,
          vehicleSlug,
          tripType,
          travelers: pax,
          serviceSlugs: parseServiceSlugs(req.body.serviceSlugs),
        });
      } catch (err) {
        if (err instanceof RoutePriceNotSetError) {
          return res.status(422).json({
            success: false,
            unpriced: true,
            routeId: err.routeId,
            vehicleSlug: err.vehicleSlug,
            tripType: err.tripType,
            message: err.message,
          });
        }
        if (err instanceof ServicePriceNotSetError) {
          return res.status(422).json({
            success: false,
            unpriced: true,
            slug: err.slug,
            vehicleSlug: err.vehicleSlug,
            tripType: err.tripType,
            message: err.message,
          });
        }
        throw err;
      }

      if (built.lineItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No price found for that route + vehicle combination",
        });
      }

      const persisted = await persistFrozenQuote(built, {
        source: "POST /api/route-bookings",
        request: { routeId, vehicleType, passengers: pax, travelDate, specialRequests },
      });

      const bookingReference =
        `RT${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

      const booking = await storage.createBooking({
        bookingReference,
        quoteId: persisted.quoteId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        totalAmount: persisted.total,
        startDate: travelDate ? new Date(travelDate) : null,
        paymentStatus: "pending",
        bookingStatus: "confirmed",
        module: "transfer_only",
      } as any);

      // Send confirmation email
      try {
        const quote = await storage.getQuote(persisted.quoteId);
        if (quote) {
          const emailSent = await emailService.sendBookingConfirmation(booking, quote);
          if (emailSent) {
            await storage.markEmailSent(booking.id, "confirmation");
          }
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      res.json({
        success: true,
        bookingReference,
        booking,
        message: "Route booking submitted successfully. We'll contact you to confirm details.",
      });
    } catch (error: any) {
      console.error("Route booking error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process route booking. Please try again.",
      });
    }
  });

  // Update booking status endpoint
  app.put("/api/bookings/:id/status", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateBookingStatus(id, status);
      res.json({ message: "Booking status updated successfully" });
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update payment status endpoint
  app.put("/api/bookings/:id/payment-status", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;

      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateBookingPaymentStatus(id, paymentStatus);
      res.json({ message: "Payment status updated successfully" });
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Email notification endpoints
  app.post("/api/bookings/:id/send-confirmation", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.quoteId === null) {
        return res
          .status(400)
          .json({ message: "Booking has no associated quote" });
      }

      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const emailSent = await emailService.sendBookingConfirmation(
        booking,
        quote,
      );
      if (emailSent) {
        await storage.markEmailSent(booking.id, "confirmation");
        res.json({ message: "Confirmation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send confirmation email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings/:id/send-reminder", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.quoteId === null) {
        return res
          .status(400)
          .json({ message: "Booking has no associated quote" });
      }

      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const emailSent = await emailService.sendBookingReminder(booking, quote);
      if (emailSent) {
        await storage.markEmailSent(booking.id, "reminder");
        res.json({ message: "Reminder email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reminder email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}
