// Public, auth-free inquiry endpoint for single-service transportation
// bookings (Module 1). Customer fills the booking form on
// /services/:slug, this endpoint validates the selection against the
// service_catalog and notifies the operator + customer by email.
//
// No DB persistence: the codebase has no `inquiries`/`inquiry_items`
// tables (and no admin inquiry surface). Operator gets an email with all
// the details they need to follow up on WhatsApp; customer gets a
// confirmation. Mirrors the existing /api/contact email-only pattern.

import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { serviceCatalog, tripTypes } from "@shared/schema";
import { mailService } from "./email-client";

type VehicleSlug = "sedan" | "minivan" | "van";
const VEHICLE_LABELS: Record<VehicleSlug, string> = {
  sedan: "Sedan",
  minivan: "Minivan",
  van: "Van",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isVehicleSlug(v: unknown): v is VehicleSlug {
  return v === "sedan" || v === "minivan" || v === "van";
}

function pricesAsRecord(blob: unknown): Record<string, number> {
  const obj =
    typeof blob === "string"
      ? (JSON.parse(blob) as Record<string, unknown>)
      : (blob as Record<string, unknown> | null | undefined);
  if (!obj || typeof obj !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj)) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) out[k] = n;
  }
  return out;
}

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatEGP(n: number): string {
  return `EGP ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}`;
}

export function registerInquiryRoutes(app: Express): void {
  app.post("/api/inquiries/transportation", async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const errors: Record<string, string> = {};

      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      const vehicleSlug = body.vehicle_slug;
      const tripTypeSlug = typeof body.trip_type_slug === "string" ? body.trip_type_slug.trim() : "";
      const serviceDate = typeof body.service_date === "string" ? body.service_date.trim() : "";
      const pickupTime = typeof body.pickup_time === "string" ? body.pickup_time.trim() : "";
      const passengerCount = Number(body.passenger_count);
      const pickupNotes = typeof body.pickup_notes === "string" ? body.pickup_notes.trim() : "";
      const customerName = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
      const customerEmail = typeof body.customer_email === "string" ? body.customer_email.trim() : "";
      const customerPhone = typeof body.customer_phone === "string" ? body.customer_phone.trim() : "";
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!slug) errors.slug = "Service is required";
      if (!isVehicleSlug(vehicleSlug)) errors.vehicle_slug = "Pick a vehicle";
      if (!tripTypeSlug) errors.trip_type_slug = "Pick a trip type";
      if (!ISO_DATE_RE.test(serviceDate)) {
        errors.service_date = "Date is required (YYYY-MM-DD)";
      } else if (serviceDate < todayIsoDate()) {
        errors.service_date = "Pick a future date";
      }
      if (!TIME_RE.test(pickupTime)) errors.pickup_time = "Pickup time is required (HH:MM)";
      if (!Number.isFinite(passengerCount) || passengerCount < 1 || passengerCount > 12) {
        errors.passenger_count = "Passengers must be between 1 and 12";
      }
      if (!customerName || customerName.length < 2) errors.customer_name = "Name is required";
      if (!EMAIL_RE.test(customerEmail)) errors.customer_email = "Valid email required";
      if (!customerPhone || customerPhone.length < 5) errors.customer_phone = "WhatsApp / phone is required";

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ ok: false, errors });
      }

      // Resolve the catalog row and verify the (vehicle, trip_type) combo
      // is actually priced. This is the source-of-truth check; the
      // client-side derivation is a UX hint only.
      const [row] = await db
        .select({
          id: serviceCatalog.id,
          slug: serviceCatalog.slug,
          name: serviceCatalog.name,
          city: serviceCatalog.city,
          category: serviceCatalog.category,
          vehiclePrices: serviceCatalog.vehiclePrices,
          isActive: serviceCatalog.isActive,
        })
        .from(serviceCatalog)
        .where(and(eq(serviceCatalog.slug, slug), eq(serviceCatalog.isActive, true)))
        .limit(1);

      if (!row) {
        return res.status(404).json({ ok: false, errors: { slug: "Service not found" } });
      }

      const prices = pricesAsRecord(row.vehiclePrices);
      const priceKey = `${vehicleSlug}_${tripTypeSlug}`;
      const price = prices[priceKey];
      if (typeof price !== "number") {
        return res.status(400).json({
          ok: false,
          errors: { vehicle_slug: "This vehicle isn't available for this trip type" },
        });
      }

      // Pretty trip type label (best-effort).
      const [tt] = await db
        .select({ name: tripTypes.name })
        .from(tripTypes)
        .where(eq(tripTypes.slug, tripTypeSlug))
        .limit(1);
      const tripTypeLabel = tt?.name ?? tripTypeSlug;
      const vehicleLabel = VEHICLE_LABELS[vehicleSlug as VehicleSlug];

      const summary = {
        service_name: row.name,
        service_slug: row.slug,
        city: row.city,
        vehicle_slug: vehicleSlug,
        vehicle_label: vehicleLabel,
        trip_type_slug: tripTypeSlug,
        trip_type_label: tripTypeLabel,
        service_date: serviceDate,
        pickup_time: pickupTime,
        passenger_count: passengerCount,
        price_egp: price,
      };

      // Fire-and-forget emails. Operator first, customer second. Errors
      // are swallowed so a transient Resend failure doesn't 500 the form
      // — operator email is the only durable record so we log loudly.
      void sendOperatorEmail({
        summary,
        customerName,
        customerEmail,
        customerPhone,
        pickupNotes,
        message,
      }).catch((err) => console.error("[inquiry] operator email failed:", err));

      void sendCustomerConfirmation({
        summary,
        customerName,
        customerEmail,
      }).catch((err) => console.error("[inquiry] customer email failed:", err));

      return res.json({ ok: true, summary });
    } catch (error: any) {
      console.error("[POST /api/inquiries/transportation] Error:", error);
      return res.status(500).json({ ok: false, errors: { _global: error.message ?? "Server error" } });
    }
  });
}

interface OperatorArgs {
  summary: {
    service_name: string;
    service_slug: string;
    city: string;
    vehicle_label: string;
    trip_type_label: string;
    service_date: string;
    pickup_time: string;
    passenger_count: number;
    price_egp: number;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupNotes: string;
  message: string;
}

async function sendOperatorEmail(args: OperatorArgs): Promise<void> {
  if (!mailService.isConfigured()) {
    console.log("[inquiry] RESEND_API_KEY not set — operator email skipped");
    return;
  }
  const s = args.summary;
  const html = `
    <!DOCTYPE html>
    <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#0891b2;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;">New Transfer Inquiry</h1>
        </div>
        <div style="padding:20px;background:#f9f9f9;">
          <h2>${escapeHtml(s.service_name)}</h2>
          <p><strong>City:</strong> ${escapeHtml(s.city)}</p>
          <p><strong>Vehicle:</strong> ${escapeHtml(s.vehicle_label)} &middot; ${escapeHtml(s.trip_type_label)}</p>
          <p><strong>Date / time:</strong> ${escapeHtml(s.service_date)} at ${escapeHtml(s.pickup_time)}</p>
          <p><strong>Passengers:</strong> ${s.passenger_count}</p>
          <p><strong>Price:</strong> ${escapeHtml(formatEGP(s.price_egp))}</p>
          <hr />
          <h3>Customer</h3>
          <p><strong>Name:</strong> ${escapeHtml(args.customerName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(args.customerEmail)}</p>
          <p><strong>WhatsApp / phone:</strong> ${escapeHtml(args.customerPhone)}</p>
          ${args.pickupNotes ? `<p><strong>Pickup notes:</strong><br/>${escapeHtml(args.pickupNotes).replace(/\n/g, "<br/>")}</p>` : ""}
          ${args.message ? `<p><strong>Message:</strong><br/>${escapeHtml(args.message).replace(/\n/g, "<br/>")}</p>` : ""}
        </div>
        <div style="text-align:center;padding:20px;color:#666;font-size:14px;">
          <p>From the /services/${escapeHtml(s.service_slug)} booking form</p>
        </div>
      </div>
    </body></html>
  `;
  const text = [
    `New Transfer Inquiry`,
    ``,
    `Service: ${s.service_name} (${s.service_slug})`,
    `City: ${s.city}`,
    `Vehicle: ${s.vehicle_label} - ${s.trip_type_label}`,
    `Date / time: ${s.service_date} at ${s.pickup_time}`,
    `Passengers: ${s.passenger_count}`,
    `Price: ${formatEGP(s.price_egp)}`,
    ``,
    `Customer: ${args.customerName}`,
    `Email: ${args.customerEmail}`,
    `WhatsApp / phone: ${args.customerPhone}`,
    args.pickupNotes ? `Pickup notes: ${args.pickupNotes}` : "",
    args.message ? `Message: ${args.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await mailService.send({
    to: "info@affordegypt.com",
    from: { email: "info@affordegypt.com", name: "Afford Egypt Bookings" },
    replyTo: args.customerEmail,
    subject: `Transfer inquiry: ${s.service_name} - ${args.customerName}`,
    html,
    text,
  });
}

interface CustomerArgs {
  summary: OperatorArgs["summary"];
  customerName: string;
  customerEmail: string;
}

async function sendCustomerConfirmation(args: CustomerArgs): Promise<void> {
  if (!mailService.isConfigured()) return;
  const s = args.summary;
  const html = `
    <!DOCTYPE html>
    <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#0891b2;color:white;padding:20px;text-align:center;">
          <h1 style="margin:0;">We've received your transfer inquiry</h1>
        </div>
        <div style="padding:20px;background:#f9f9f9;">
          <p>Hi ${escapeHtml(args.customerName)},</p>
          <p>Thanks for the inquiry. We'll get back to you on WhatsApp within 1 hour during Cairo business hours.</p>
          <h3>Your selection</h3>
          <p><strong>${escapeHtml(s.service_name)}</strong></p>
          <p>${escapeHtml(s.vehicle_label)} &middot; ${escapeHtml(s.trip_type_label)}</p>
          <p>${escapeHtml(s.service_date)} at ${escapeHtml(s.pickup_time)} &middot; ${s.passenger_count} passenger${s.passenger_count === 1 ? "" : "s"}</p>
          <p><strong>${escapeHtml(formatEGP(s.price_egp))}</strong></p>
        </div>
        <div style="text-align:center;padding:20px;color:#666;font-size:14px;">
          <p>Afford Egypt &middot; Operated by Travel2Egypt &middot; ETAA-licensed since 2020</p>
        </div>
      </div>
    </body></html>
  `;
  const text = [
    `Hi ${args.customerName},`,
    ``,
    `Thanks for the inquiry. We'll get back to you on WhatsApp within 1 hour during Cairo business hours.`,
    ``,
    `Your selection:`,
    `${s.service_name}`,
    `${s.vehicle_label} - ${s.trip_type_label}`,
    `${s.service_date} at ${s.pickup_time} - ${s.passenger_count} passenger(s)`,
    `${formatEGP(s.price_egp)}`,
    ``,
    `Afford Egypt`,
  ].join("\n");

  await mailService.send({
    to: args.customerEmail,
    from: { email: "info@affordegypt.com", name: "Afford Egypt" },
    subject: `We received your transfer inquiry: ${s.service_name}`,
    html,
    text,
  });
}
