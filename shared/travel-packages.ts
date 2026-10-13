import { z } from "zod";

export const PACKAGE_TIERS = [2, 4, 6, 8, 10, 12] as const;
const money = z
  .number()
  .finite()
  .min(0)
  .max(1_000_000)
  .refine(
    (n) => Math.abs(n * 100 - Math.round(n * 100)) < 0.00001,
    "Use at most two decimal places",
  );
export const packageDaySchema = z.object({
  title: z.string().trim().max(160),
  description: z.string().trim().max(5000),
});
const imageSchema = z
  .string()
  .max(2000)
  .refine(
    (v) => !v || /^\/(?!\/)/.test(v) || /^https:\/\//.test(v),
    "Use an HTTPS image or a local /images path",
  );
export const packageContentSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().max(160),
    summary: z.string().trim().max(500),
    description: z.string().trim().max(15000),
    imageUrl: imageSchema,
    durationDays: z.number().int().min(1).max(60),
    nights: z.number().int().min(0).max(59),
    itinerary: z.array(packageDaySchema).max(60),
    inclusions: z.array(z.string().trim().min(1).max(500)).max(50),
    exclusions: z.array(z.string().trim().min(1).max(500)).max(50),
    bookingTerms: z.string().trim().max(10000),
    // Rates are EGP per traveler for the complete program, sharing a twin/double.
    perPersonRates: z.record(
      z
        .string()
        .refine(
          (k) => Array.from({ length: 11 }, (_, i) => String(i + 2)).includes(k),
          "Unknown group tier",
        ),
      money.refine((n) => n > 0, "A group rate must be positive"),
    ),
    singleSupplement: money.nullable(), // Per single room for the complete stay.
    status: z.enum(["draft", "published"]),
  })
  .strict();
export type PackageContent = z.infer<typeof packageContentSchema>;
export interface TravelPackage extends PackageContent {
  id: number;
  slot: number;
  version: number;
  updatedAt: string;
}
export type PackagePricing = {
  travelers: number;
  tier: number;
  doubleRooms: number;
  singleRooms: number;
  basePerPerson: number;
  baseTotal: number;
  supplementPerRoom: number;
  supplementTotal: number;
  total: number;
  currency: "EGP";
  packageVersion: number;
};

export function publicationIssues(pkg: PackageContent): string[] {
  const issues: string[] = [];
  if (!pkg.title || !pkg.summary || !pkg.description)
    issues.push("Add the title, summary and description");
  if (pkg.nights >= pkg.durationDays)
    issues.push("Nights must be fewer than days");
  if (
    pkg.itinerary.length !== pkg.durationDays ||
    pkg.itinerary.some((d) => !d.title || !d.description)
  )
    issues.push("Complete every itinerary day");
  if (!pkg.inclusions.length) issues.push("Add the inclusions");
  if (!pkg.bookingTerms)
    issues.push("Add booking, payment and cancellation terms");
  if (PACKAGE_TIERS.some((t) => !pkg.perPersonRates[String(t)]))
    issues.push("Set all six group rates");
  if (pkg.singleSupplement === null)
    issues.push("Set the single-room supplement (zero is allowed)");
  return issues;
}

export const packageSelectionSchema = z
  .object({
    travelers: z.number().int().min(2).max(12),
    singleRooms: z.number().int().min(0).max(12),
  })
  .strict()
  .refine(
    (v) => v.singleRooms <= v.travelers,
    "Rooms must accommodate every traveler exactly",
  );
export const packageBookingSchema = z
  .object({
    travelers: z.number().int().min(2).max(12),
    singleRooms: z.number().int().min(0).max(12),
    travelDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`);
        return (
          Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v
        );
      }, "Use a valid calendar date"),
    customerName: z.string().trim().min(2).max(200),
    customerEmail: z.string().trim().email().max(320),
    customerPhone: z.string().trim().min(5).max(64),
    specialRequests: z.string().trim().max(2000).default(""),
    termsAccepted: z.literal(true),
    expectedTotal: z.number().finite().min(0).max(24_000_000),
    packageVersion: z.number().int().positive(),
    requestKey: z.string().uuid(),
  })
  .strict()
  .refine(
    (v) =>
      packageSelectionSchema.safeParse({
        travelers: v.travelers,
        singleRooms: v.singleRooms,
      }).success,
    "Invalid room arrangement",
  );
export type PackageBookingInput = z.infer<typeof packageBookingSchema>;

export function pricePackage(
  pkg: Pick<
    TravelPackage,
    "perPersonRates" | "singleSupplement" | "version" | "nights"
  >,
  travelers: number,
  singleRooms: number,
): PackagePricing {
  packageSelectionSchema.parse({ travelers, singleRooms });
  if (pkg.nights && (travelers - singleRooms) % 2)
    throw new Error("Rooms must accommodate every traveler exactly");
  if (!pkg.nights && singleRooms)
    throw new Error(
      "Single rooms are unavailable for a package without overnight stays",
    );
  const tier = pkg.perPersonRates[String(travelers)] !== undefined
    ? travelers
    : travelers % 2 ? travelers - 1 : travelers;
  const rate = pkg.perPersonRates[String(tier)];
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error("This group size is not priced");
  if (
    singleRooms &&
    (pkg.singleSupplement === null || !Number.isFinite(pkg.singleSupplement))
  )
    throw new Error("Single rooms are not priced");
  const cents = Math.round(rate * 100);
  const supplementCents = Math.round((pkg.singleSupplement ?? 0) * 100);
  const baseTotal = (cents * travelers) / 100;
  const supplementTotal = (supplementCents * singleRooms) / 100;
  return {
    travelers,
    tier,
    doubleRooms: pkg.nights ? (travelers - singleRooms) / 2 : 0,
    singleRooms,
    basePerPerson: rate,
    baseTotal,
    supplementPerRoom: pkg.singleSupplement ?? 0,
    supplementTotal,
    total: (cents * travelers + supplementCents * singleRooms) / 100,
    currency: "EGP",
    packageVersion: pkg.version,
  };
}

export function singleRoomOptions(travelers: number): number[] {
  return Array.from(
    { length: Math.floor(travelers / 2) + 1 },
    (_, i) => (travelers % 2) + i * 2,
  );
}
