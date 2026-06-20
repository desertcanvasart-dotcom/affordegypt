import { z } from "zod";

// Zod request schemas for the public, internet-facing write endpoints.
// These gate untrusted input before it reaches the pricing/quote/booking
// logic. They are intentionally permissive about shape (unknown keys pass;
// see middleware/validate.ts) and lenient where the handlers already are —
// the goal is to reject malformed/abusive input, not to re-specify the whole
// contract.

// IDs and counts may arrive as numbers or numeric strings depending on the
// caller, so coerce. Bounds keep abusive payloads (absurd counts, giant
// arrays) out of the pricing engine.
const id = () => z.coerce.number().int().positive();
const count = (max: number) => z.coerce.number().int().min(1).max(max);

const idArray = z.array(id()).max(200);
const addOnArray = z
  .array(
    z.union([
      id(),
      z.object({ id: id(), quantity: count(100).optional() }),
    ]),
  )
  .max(200);

// Pricing inputs shared by /api/quotes and /api/bookings (mirrors the
// proven calcPricingSchema used by the live pricing sidebar). vehicleSlug /
// vehicleType / tripType are left as loose strings on purpose: the handlers
// run them through isVehicleSlug/isTripType guards and fall back gracefully,
// so a strict enum here would reject requests that currently succeed.
export const pricingInputSchema = z.object({
  routeId: id().nullish(),
  vehicleSlug: z.string().max(40).nullish(),
  vehicleType: z.string().max(40).nullish(),
  tripType: z.string().max(40).nullish(),
  cityId: id().nullish(),
  guideLanguage: z.string().max(60).nullish(),
  guideHours: z.coerce.number().int().positive().max(24).nullish(),
  attractionIds: idArray.optional(),
  selectedAttractions: idArray.optional(),
  addOnIds: addOnArray.optional(),
  selectedAddOns: addOnArray.optional(),
  travelers: count(50).optional(),
  passengerCount: count(50).optional(),
  serviceSlugs: z.any().optional(), // parseServiceSlugs() tolerates varied shapes
});

// POST /api/quotes — pure pricing inputs.
export const quoteRequestSchema = pricingInputSchema;

// POST /api/bookings — pricing inputs plus a few booking-level fields.
// Customer/contact fields are deliberately NOT constrained here: the handler
// runs the assembled record through insertBookingSchema.parse downstream,
// which is the authority on those. This gate only closes the pricing-input
// hole (routeId/travelers/ids/etc. previously reached the pricing engine
// unchecked).
export const bookingRequestSchema = pricingInputSchema.extend({
  quoteId: id().nullish(),
  bookingReference: z.string().max(64).optional(),
  travelDate: z.string().max(64).nullish(),
  itinerary: z.any().optional(),
});

// POST /api/route-bookings — the handler assembles the booking by hand with
// no downstream schema, so this gate is the ONLY validation. routeId and
// customer name/email are required, mirroring the handler's own checks.
export const routeBookingRequestSchema = z.object({
  routeId: id(),
  vehicleSlug: z.string().max(40).optional(),
  vehicleType: z.string().max(40).optional(),
  tripType: z.string().max(40).optional(),
  passengers: count(50).optional(),
  travelers: count(50).optional(),
  travelDate: z.string().max(64).nullish(),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email().max(320),
  customerPhone: z.string().max(64).nullish(),
  specialRequests: z.string().max(2000).nullish(),
  serviceSlugs: z.any().optional(),
});

// POST /api/reviews — public submission. Gate only: validates types/bounds
// and the required columns (customerName/rating/title/content are NOT NULL).
// Looser than the client form (min lengths relaxed) so anything the form
// accepts passes. NOTE: this does NOT strip isVerified/isActive — that
// endpoint forces these flags server-side; admins set them via the separate
// adminReviewSchema below (POST /api/admin/reviews).
export const reviewRequestSchema = z.object({
  customerName: z.string().min(1).max(120),
  customerLocation: z.string().max(120).nullish(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  tripDate: z.union([z.string(), z.null()]).optional(),
});

// POST /api/admin/reviews — admin-only review creation / CSV bulk import.
// Same fields as a public submission plus the moderation flags, which only an
// authenticated admin may set. Gate-only, so the handler still receives the
// booleans to persist.
export const adminReviewSchema = reviewRequestSchema.extend({
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
});
