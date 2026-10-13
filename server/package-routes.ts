import { packageDatesAvailable } from "@shared/package-availability";
import { applyPackageMealPolicy } from "@shared/package-meals";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderPackagePage } from "./services/package-page";
import { PricingService } from "./services/pricing";
import type { Express, Response } from "express";
import { and, asc, eq, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";
import {
  bookings,
  quotes,
  quoteLineItems,
  travelPackages,
  packageBookingRequests,
} from "@shared/schema";
import {
  packageBookingSchema,
  packageContentSchema,
  packageSelectionSchema,
  publicationIssues,
  type TravelPackage,
} from "@shared/travel-packages";
import { adminAuth } from "./routes/shared";
import { emailService } from "./email-service";
import { storage } from "./database-storage";

const publicStatus = eq(travelPackages.status, "published");
const present = (row: typeof travelPackages.$inferSelect): TravelPackage => ({
  ...row,
  status: row.status as TravelPackage["status"],
  singleSupplement:
    row.singleSupplement === null ? null : Number(row.singleSupplement),
  updatedAt: row.updatedAt.toISOString(),
});
class PackageError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function respondError(res: Response, err: unknown) {
  if (err instanceof PackageError)
    return res.status(err.status).json({ message: err.message });
  if ((err as { code?: string })?.code === "42P01")
    return res.status(503).json({ message: "Packages are not available yet" });
  console.error("Package API error", err);
  return res
    .status(500)
    .json({ message: "Unable to process this package request" });
}

export function registerPackageRoutes(app: Express) {
  app.get("/packages/:slug", async (req, res, next) => {
    if (process.env.NODE_ENV !== "production") return next();
    try {
      const [row] = await db
        .select()
        .from(travelPackages)
        .where(and(publicStatus, eq(travelPackages.slug, req.params.slug)));
      const shell = await readFile(
        path.resolve("dist/public/index.html"),
        "utf8",
      );
      res
        .status(row ? 200 : 404)
        .type("html")
        .send(renderPackagePage(shell, row ? present(row) : undefined));
    } catch (err) {
      console.error("Package page unavailable", err);
      res.status(503).type("text").send("Packages are temporarily unavailable");
    }
  });
  app.get("/api/packages", async (_req, res) => {
    try {
      res.json(
        (
          await db
            .select()
            .from(travelPackages)
            .where(publicStatus)
            .orderBy(asc(travelPackages.slot))
        ).map(present),
      );
    } catch (err) {
      respondError(res, err);
    }
  });
  app.get("/api/packages/:slug", async (req, res) => {
    try {
      const [row] = await db
        .select()
        .from(travelPackages)
        .where(and(publicStatus, eq(travelPackages.slug, req.params.slug)));
      if (!row) return res.status(404).json({ message: "Package not found" });
      res.json(present(row));
    } catch (err) {
      respondError(res, err);
    }
  });
  app.post("/api/packages/:slug/price", async (req, res) => {
    const parsed = packageSelectionSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: "Invalid traveler or room selection" });
    try {
      const [row] = await db
        .select()
        .from(travelPackages)
        .where(and(publicStatus, eq(travelPackages.slug, req.params.slug)));
      if (!row) return res.status(404).json({ message: "Package not found" });
      try {
        res.json(
          PricingService.priceReadyMadePackage(
            present(row),
            parsed.data.travelers,
            parsed.data.singleRooms,
          ),
        );
      } catch (err) {
        res.status(422).json({ message: (err as Error).message });
      }
    } catch (err) {
      respondError(res, err);
    }
  });
  app.get("/api/admin/packages", ...adminAuth, async (_req, res) => {
    try {
      res.json(
        (
          await db
            .select()
            .from(travelPackages)
            .orderBy(asc(travelPackages.slot))
        ).map(present),
      );
    } catch (err) {
      respondError(res, err);
    }
  });
  app.put("/api/admin/packages/:slot", ...adminAuth, async (req, res) => {
    const slot = Number(req.params.slot);
    if (![1, 2, 3].includes(slot))
      return res
        .status(400)
        .json({ message: "Only three package slots are available" });
    const { expectedVersion, ...content } = req.body ?? {};
    const parsed = packageContentSchema.safeParse(content);
    if (!parsed.success)
      return res.status(400).json({
        message: "Invalid package content",
        issues: parsed.error.issues,
      });
    parsed.data = applyPackageMealPolicy(parsed.data);
    if (parsed.data.nights >= parsed.data.durationDays)
      return res
        .status(400)
        .json({ message: "Nights must be fewer than days" });
    if (parsed.data.status === "published") {
      const issues = publicationIssues(parsed.data);
      if (issues.length)
        return res.status(422).json({ message: issues.join(". ") });
    }
    try {
      const saved = await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(784331, ${slot})`);
        const [old] = await tx
          .select()
          .from(travelPackages)
          .where(eq(travelPackages.slot, slot))
          .for("update");
        if ((old?.version ?? 0) !== expectedVersion)
          throw new PackageError(
            409,
            "This package changed. Reload before saving.",
          );
        if (old && old.slug !== parsed.data.slug)
          throw new PackageError(409, "The saved URL slug cannot be changed");
        const value = {
          ...parsed.data,
          singleSupplement:
            parsed.data.singleSupplement === null
              ? null
              : parsed.data.singleSupplement.toFixed(2),
          updatedAt: new Date(),
        };
        if (old)
          return (
            await tx
              .update(travelPackages)
              .set({ ...value, version: old.version + 1 })
              .where(eq(travelPackages.slot, slot))
              .returning()
          )[0];
        return (
          await tx
            .insert(travelPackages)
            .values({ ...value, slot })
            .returning()
        )[0];
      });
      res.json(present(saved));
    } catch (err) {
      if ((err as { code?: string })?.code === "23505")
        return res
          .status(409)
          .json({ message: "That package URL is already in use" });
      respondError(res, err);
    }
  });
  app.post("/api/packages/:slug/bookings", async (req, res) => {
    const parsed = packageBookingSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Invalid booking details",
        issues: parsed.error.issues,
      });
    const input = parsed.data;
    const requestHash = createHash("sha256")
      .update(JSON.stringify({ slug: req.params.slug, ...input }))
      .digest("hex");
    try {
      const result = await db.transaction(async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${input.requestKey}, 0))`,
        );
        const [previous] = await tx
          .select()
          .from(packageBookingRequests)
          .where(eq(packageBookingRequests.requestKey, input.requestKey));
        if (previous) {
          if (previous.requestHash !== requestHash)
            throw new PackageError(
              409,
              "This request key was already used with different details",
            );
          const [booking] = await tx
            .select()
            .from(bookings)
            .where(eq(bookings.id, previous.bookingId));
          return { booking, created: false };
        }
        const today = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Africa/Cairo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());
        if (input.travelDate < today)
          throw new PackageError(
            400,
            "Choose today or a future departure date",
          );
        const [row] = await tx
          .select()
          .from(travelPackages)
          .where(and(publicStatus, eq(travelPackages.slug, req.params.slug)))
          .for("share");
        if (!row) throw new PackageError(404, "Package not found");
        const pkg = present(row);
        if (!packageDatesAvailable(input.travelDate, pkg.durationDays))
          throw new PackageError(400, "Tours are unavailable from 24 December to 7 January, inclusive. Choose dates outside this period.");
        let pricing;
        try {
          pricing = PricingService.priceReadyMadePackage(
            pkg,
            input.travelers,
            input.singleRooms,
          );
        } catch (err) {
          throw new PackageError(422, (err as Error).message);
        }
        if (
          pricing.total !== input.expectedTotal ||
          pkg.version !== input.packageVersion
        )
          throw new PackageError(
            409,
            "The package changed. Refresh the price before booking.",
          );
        const startDate = new Date(`${input.travelDate}T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + pkg.durationDays - 1);
        const snapshot = {
          source: "ready_made_package",
          package: pkg,
          pricing,
          travelers: input.travelers,
          rooms: { double: pricing.doubleRooms, single: pricing.singleRooms },
          travelDate: input.travelDate,
          specialRequests: input.specialRequests,
          termsAcceptedAt: new Date().toISOString(),
          itinerary: pkg.itinerary.map((day, index) => ({
            day: index + 1,
            dayNumber: index + 1,
            travelers: input.travelers,
            date: new Date(startDate.getTime() + index * 86400000)
              .toISOString()
              .slice(0, 10),
            cityName: day.title,
            city: day.title,
            description: day.description,
          })),
        };
        const [quote] = await tx
          .insert(quotes)
          .values({
            jsonBlob: snapshot,
            total: pricing.total.toFixed(2),
            commissionPct: "0",
            frozenAt: new Date(),
          })
          .returning();
        const lines = [
          {
            quoteId: quote.id,
            kind: "package",
            description: pkg.title,
            unitPrice: pricing.basePerPerson.toFixed(2),
            quantity: String(input.travelers),
            lineTotal: pricing.baseTotal.toFixed(2),
            sortOrder: 0,
            meta: { packageSlug: pkg.slug, tier: pricing.tier },
          },
        ];
        if (pricing.singleRooms)
          lines.push({
            quoteId: quote.id,
            kind: "adjustment",
            description: "Single-room supplement",
            unitPrice: pricing.supplementPerRoom.toFixed(2),
            quantity: String(pricing.singleRooms),
            lineTotal: pricing.supplementTotal.toFixed(2),
            sortOrder: 1,
            meta: { packageSlug: pkg.slug, tier: pricing.tier },
          });
        await tx.insert(quoteLineItems).values(lines);
        const [booking] = await tx
          .insert(bookings)
          .values({
            quoteId: quote.id,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            bookingReference: `PKG-${randomBytes(6).toString("hex").toUpperCase()}`,
            startDate,
            endDate,
            totalAmount: pricing.total.toFixed(2),
            module: "ready_made_package",
            currency: "EGP",
            bookingStatus: "pending",
            paymentStatus: "pending",
          })
          .returning();
        await tx.insert(packageBookingRequests).values({
          requestKey: input.requestKey,
          requestHash,
          bookingId: booking.id,
        });
        return { booking, created: true };
      });
      // Email failure never rolls back a successfully recorded request.
      if (result.created) {
        try {
          const quote = await storage.getQuote(result.booking.quoteId!);
          if (
            quote &&
            (await emailService.sendBookingConfirmation(result.booking, quote))
          )
            await storage.markEmailSent(result.booking.id, "confirmation");
        } catch (err) {
          console.error("Package confirmation email failed", err);
        }
      }
      res.status(result.created ? 201 : 200).json({
        bookingReference: result.booking.bookingReference,
        totalAmount: result.booking.totalAmount,
        bookingStatus: result.booking.bookingStatus,
      });
    } catch (err) {
      respondError(res, err);
    }
  });
}
