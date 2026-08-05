import { pgTable, text, serial, integer, boolean, decimal, numeric, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { withTimezone: true }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // 'user', 'admin', 'staff'
  isActive: boolean("is_active").default(true),
  emailVerified: boolean("email_verified").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    token: text("token").notNull().unique(),
    selector: text("selector").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_password_reset_user").on(t.userId)],
);

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_email_verification_user").on(t.userId)],
);

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  // Translation columns
  nameTranslations: jsonb("name_translations"), // {en: "Cairo", es: "El Cairo", fr: "Le Caire", de: "Kairo"}
  descriptionTranslations: jsonb("description_translations"),
});

export const vehicleTypes = pgTable("vehicle_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  paxMin: integer("pax_min").notNull(),
  paxMax: integer("pax_max").notNull(),
  image: text("image"),
  // Translation columns
  nameTranslations: jsonb("name_translations"),
  descriptionTranslations: jsonb("description_translations"),
});

export const routes = pgTable(
  "routes",
  {
    id: serial("id").primaryKey(),
    fromCityId: integer("from_city_id").references(() => cities.id),
    toCityId: integer("to_city_id").references(() => cities.id),
    km: decimal("km", { precision: 8, scale: 2 }),
    basePriceByVehicle: jsonb("base_price_by_vehicle"), // legacy; superseded by vehicle_prices (deferred removal — still read by some legacy/admin pages)
    fromLocation: text("from_location"),
    toLocation: text("to_location"),
    name: text("name"),
    displayOrder: integer("display_order").default(0),
    estimatedDuration: text("estimated_duration"),
    routeHighlights: text("route_highlights"),
    travelTips: text("travel_tips"),
    pickupInstructions: text("pickup_instructions"),
    dropoffInstructions: text("dropoff_instructions"),
    tripType: text("trip_type"),
    routeCategory: text("route_category"),
    cityId: integer("city_id").references(() => cities.id),
    tripMode: text("trip_mode").default("transfer"),
    nights: integer("nights").default(0),
    distanceKm: integer("distance_km"),
    vehiclePrices: jsonb("vehicle_prices"), // active route price source; flat JSONB keyed `${vehicleSlug}_${tripType}`
    // Translation columns
    nameTranslations: jsonb("name_translations"),
    fromLocationTranslations: jsonb("from_location_translations"),
    toLocationTranslations: jsonb("to_location_translations"),
    routeHighlightsTranslations: jsonb("route_highlights_translations"),
    travelTipsTranslations: jsonb("travel_tips_translations"),
    pickupInstructionsTranslations: jsonb("pickup_instructions_translations"),
    dropoffInstructionsTranslations: jsonb("dropoff_instructions_translations"),
  },
  (t) => [
    index("idx_routes_from_city").on(t.fromCityId),
    index("idx_routes_to_city").on(t.toCityId),
    index("idx_routes_city").on(t.cityId),
  ],
);

export const timeBlocks = pgTable(
  "time_blocks",
  {
    id: serial("id").primaryKey(),
    cityId: integer("city_id").references(() => cities.id).notNull(),
    hours: integer("hours").notNull(),
    basePriceByVehicle: jsonb("base_price_by_vehicle").notNull(), // JSON: {vehicle_id: {license_class_id: price}}
  },
  (t) => [index("idx_time_blocks_city").on(t.cityId)],
);

export const guideRates = pgTable(
  "guide_rates",
  {
    id: serial("id").primaryKey(),
    cityId: integer("city_id").references(() => cities.id).notNull(),
    language: text("language").notNull(),
    hourlyPrice: decimal("hourly_price", { precision: 10, scale: 2 }).notNull(),
    name: text("name").notNull(),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    image: text("image"),
  },
  (t) => [index("idx_guide_rates_city").on(t.cityId)],
);

export const addOns = pgTable(
  "add_ons",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    unitType: text("unit_type").notNull(), // 'per_unit', 'per_person', 'per_trip'
    cityId: integer("city_id").references(() => cities.id), // null = available everywhere
    category: text("category").notNull(), // 'transport', 'experience', 'meal', 'ticket'
    image: text("image"),
    isActive: boolean("is_active").default(true),
    // Translation columns
    nameTranslations: jsonb("name_translations"),
    descriptionTranslations: jsonb("description_translations"),
  },
  (t) => [index("idx_add_ons_city").on(t.cityId)],
);

export const attractions = pgTable(
  "attractions",
  {
    id: serial("id").primaryKey(),
    cityId: integer("city_id").references(() => cities.id).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    duration: integer("duration").default(2),
    ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).default("0"),
    isActive: boolean("is_active").default(true),
    image: text("image"),
    coordinates: text("coordinates"),
    bestTimeToVisit: text("best_time_to_visit"),
    capacity: integer("capacity"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    // Translation columns
    nameTranslations: jsonb("name_translations"),
    descriptionTranslations: jsonb("description_translations"),
    bestTimeToVisitTranslations: jsonb("best_time_to_visit_translations"),
  },
  (t) => [index("idx_attractions_city").on(t.cityId)],
);

// Per-person entrance tickets to Egyptian heritage sites. Distinct from
// `service_catalog` (per-vehicle transportation) and from the legacy
// `attractions` table (which is wired into the old pricing path and will
// be retired in PR-Path-B-3 once its callers are stripped).
//
// Pricing model: operator quotes a `base_price`, we apply a 5% markup,
// store the marked-up `price_per_person` rounded to nearest 1. Both
// columns are kept for audit transparency.
export const entranceFees = pgTable("entrance_fees", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameTranslations: jsonb("name_translations").notNull().default({}),
  city: text("city").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  markupPercent: numeric("markup_percent", { precision: 5, scale: 2 }).notNull().default("5"),
  pricePerPerson: numeric("price_per_person", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EGP"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EntranceFee = typeof entranceFees.$inferSelect;
export type InsertEntranceFee = typeof entranceFees.$inferInsert;

// Self-contained packaged experiences: felucca rides, camel rides,
// balloon rides, photography sessions, packaged sound & light shows.
// Distinct from `add_ons` (extras + meals) and from `service_catalog`
// (per-vehicle transportation). Currency is implicit EGP.
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameTranslations: jsonb("name_translations").notNull().default({}),
  descriptionTranslations: jsonb("description_translations"),
  city: text("city").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unitType: text("unit_type").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

// Quotes are immutable financial documents. Once `frozenAt` is set, line
// items must not change. The `jsonBlob` column is retained for back-compat
// during the pricing rewrite (Phase 2) and will be removed in Phase 3.
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  jsonBlob: jsonb("json_blob").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  commissionPct: decimal("commission_pct", { precision: 5, scale: 4 }).notNull(),
  version: integer("version").notNull().default(1),
  frozenAt: timestamp("frozen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Frozen snapshot of every priced line in a quote. Once written, never updated.
export const quoteLineItems = pgTable(
  "quote_line_items",
  {
    id: serial("id").primaryKey(),
    quoteId: integer("quote_id").references(() => quotes.id).notNull(),
    serviceId: integer("service_id").references(() => services.id), // nullable for ad-hoc lines
    routeId: integer("route_id").references(() => routes.id),
    kind: text("kind").notNull(), // 'route', 'service', 'addon', 'attraction', 'guide', 'adjustment'
    description: text("description").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
    lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_quote_line_items_quote").on(t.quoteId),
    index("idx_quote_line_items_service").on(t.serviceId),
    index("idx_quote_line_items_route").on(t.routeId),
  ],
);

// NOTE: the pricing_tiers, seasonal_modifiers, and commission_rules tables
// were dropped (see docs/PRICING_CLEANUP.md). Route pricing now reads only
// routes.vehicle_prices; quote totals are the sum of frozen line items.

// Services catalog for Day-by-Day Custom Planner
export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    type: text("type").notNull(), // 'transfer', 'tour', 'guide', 'addon'
    title: text("title").notNull(),
    description: text("description"),
    cityId: integer("city_id").references(() => cities.id),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    pricingMode: text("pricing_mode").notNull(), // 'per_group', 'per_person'
    vehicleCategory: text("vehicle_category"), // 'sedan', 'minivan', 'van' (for transfers)
    durationMinutes: integer("duration_minutes"),
    capacity: integer("capacity"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    // Translation columns
    titleTranslations: jsonb("title_translations"),
    descriptionTranslations: jsonb("description_translations"),
  },
  (t) => [
    index("idx_services_city").on(t.cityId),
    index("idx_services_type").on(t.type),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    quoteId: integer("quote_id").references(() => quotes.id),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),

    // Payment
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    paymentStatus: text("payment_status").default("pending"), // 'pending', 'paid', 'failed', 'refunded'

    // Booking Status
    // 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'.
    // Defaults to 'pending', NOT 'confirmed': a booking is confirmed once the
    // 10% deposit clears, which is exactly what the customer's confirmation
    // email promises. Defaulting to 'confirmed' meant every unpaid request was
    // recorded as confirmed the instant the form was submitted, so the row
    // contradicted the promise and the ops alert announced
    // "PAYMENT: PENDING / BOOKING: CONFIRMED" on the same booking.
    bookingStatus: text("booking_status").default("pending"),
    bookingReference: text("booking_reference").notNull(),

    // Trip Details
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    module: text("module").notNull().default("multi_city"), // 'transfer_only', 'multi_city', 'day_by_day'
    currency: text("currency").notNull().default("EGP"),

    // Communication
    confirmationEmailSent: boolean("confirmation_email_sent").default(false),
    reminderEmailSent: boolean("reminder_email_sent").default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_bookings_user").on(t.userId),
    index("idx_bookings_quote").on(t.quoteId),
    index("idx_bookings_email").on(t.customerEmail),
    uniqueIndex("uq_bookings_reference").on(t.bookingReference),
  ],
);

// Daily breakdown for Day-by-Day bookings
export const bookingDays = pgTable(
  "booking_days",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").references(() => bookings.id).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    cityId: integer("city_id").references(() => cities.id),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_booking_days_booking").on(t.bookingId),
    index("idx_booking_days_city").on(t.cityId),
  ],
);

// Individual services within each booking day
export const bookingServices = pgTable(
  "booking_services",
  {
    id: serial("id").primaryKey(),
    bookingDayId: integer("booking_day_id").references(() => bookingDays.id).notNull(),
    serviceId: integer("service_id").references(() => services.id).notNull(),
    passengers: integer("passengers").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    startTime: text("start_time"),
    endTime: text("end_time"),
    meta: jsonb("meta"),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_booking_services_day").on(t.bookingDayId),
    index("idx_booking_services_service").on(t.serviceId),
  ],
);

// Booking adjustments for discounts and surcharges
export const bookingAdjustments = pgTable(
  "booking_adjustments",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id").references(() => bookings.id).notNull(),
    type: text("type").notNull(), // 'discount', 'surcharge', 'tax'
    description: text("description").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    percentage: decimal("percentage", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_booking_adjustments_booking").on(t.bookingId)],
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerLocation: text("customer_location"),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tripDate: timestamp("trip_date", { withTimezone: true }),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =====================================================================
// Phase 1.5 — Service Catalog
// =====================================================================
// New product-catalog model that supersedes the routes-based pricing.
// See docs/SERVICES_ARCHITECTURE.md for the full design.
//
// Naming convention note: the canonical entity name is "services" but
// that table name is taken by a legacy table (Day-by-Day Custom Planner)
// that's still referenced by quote_line_items.service_id and a couple of
// dead admin paths. The new catalog uses `service_catalog` for now and
// will be renamed to `services` in Phase E when the legacy table is
// dropped. To keep the eventual rename mechanical, *all* code references
// in this phase use the `serviceCatalog` / `ServiceCatalogItem` /
// `/admin/service-catalog` naming consistently. Don't mix in `services`.

// Trip-type vocabulary. Globally extensible by admin. Slugs appear inside
// service_catalog.vehicle_prices keys (`${vehicle_slug}_${trip_type_slug}`)
// and are part of the durable contract — write-once. Renaming a slug
// after a price has been keyed against it leaves orphan keys.
//
// Row type is `TripTypeRow` to avoid colliding with the literal
// `TripType` union in server/services/pricing.ts. The literal stays as
// the runtime-validated set of slugs that the pricing service accepts;
// this table is the admin-editable master list. The two will be
// reconciled in a later phase (pricing service loads slugs from the
// table at startup instead of hard-coding them).
export const tripTypes = pgTable(
  "trip_types",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_trip_types_active").on(t.isActive),
    index("idx_trip_types_sort").on(t.sortOrder),
  ],
);

// Category vocabulary for service_catalog. Table (not enum) so admin can
// add new product lines (cooking_class, balloon_ride, wellness_retreat)
// without a deploy. Soft-delete via is_active.
export const serviceCategories = pgTable(
  "service_categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_service_categories_active").on(t.isActive),
    index("idx_service_categories_sort").on(t.sortOrder),
  ],
);

// The catalog of named, bookable travel products.
//
// vehicle_prices is JSONB with flat keys `${vehicleSlug}_${tripTypeSlug}`,
// e.g. {"sedan_one_way": 600, "minivan_8hr": 2600}. Missing keys mean
// "not priced for that combination" — same shape and rule as the
// routes-based system shipped in commit bfde4a6, just on a richer entity.
//
// Translation columns are nullable JSONB and unused at Phase A; populated
// when i18n is reactivated (kept in the schema to avoid a future
// migration). image_url is nullable; multi-image support deferred.
export const serviceCatalog = pgTable(
  "service_catalog",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),         // write-once; URL-safe
    name: text("name").notNull(),                  // customer-facing
    city: text("city").notNull(),                  // 'Cairo' | 'Luxor' | ...
    category: text("category").notNull(),          // FK by value to service_categories.slug
    pickupZone: text("pickup_zone"),               // optional label
    description: text("description"),              // free-form
    includedStops: jsonb("included_stops"),        // tour-specific JSON array
    vehiclePrices: jsonb("vehicle_prices").notNull().default({}), // flat keys
    durationHours: integer("duration_hours"),      // for time-block products
    imageUrl: text("image_url"),                   // single hero image
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    // Translation columns (unused at Phase A; reserved for i18n revival)
    nameTranslations: jsonb("name_translations"),
    descriptionTranslations: jsonb("description_translations"),
  },
  (t) => [
    index("idx_service_catalog_city").on(t.city),
    index("idx_service_catalog_category").on(t.category),
    index("idx_service_catalog_city_category").on(t.city, t.category),
    index("idx_service_catalog_active").on(t.isActive),
    index("idx_service_catalog_sort").on(t.sortOrder),
  ],
);

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export const insertVehicleTypeSchema = createInsertSchema(vehicleTypes).omit({ id: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true }).extend({
  routeCategory: z.string().optional(),
  tripMode: z.string().optional(),
  tripType: z.string().optional(),
  nights: z.number().min(0).optional(),
  fromCityId: z.number().optional(),
  toCityId: z.number().optional(),
  cityId: z.number().optional(),
  km: z.string().optional(),
  distanceKm: z.number().optional(),
  displayOrder: z.number().optional()
});
export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({ id: true });
export const insertGuideRateSchema = createInsertSchema(guideRates).omit({ id: true });
export const insertAddOnSchema = createInsertSchema(addOns).omit({ id: true });
export const insertAttractionSchema = createInsertSchema(attractions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  frozenAt: true,
  version: true,
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({
  id: true,
  createdAt: true,
}).extend({
  kind: z.enum(["route", "service", "addon", "attraction", "guide", "adjustment"]),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  type: z.enum(["transfer", "tour", "guide", "addon"]),
  pricingMode: z.enum(["per_group", "per_person"]),
  vehicleCategory: z.enum(["sedan", "minivan", "van"]).optional(),
  durationMinutes: z.number().optional(),
  capacity: z.number().optional(),
  isActive: z.boolean().optional()
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  confirmationEmailSent: true,
  reminderEmailSent: true
}).extend({
  quoteId: z.number().nullable().optional(),
  bookingReference: z.string().optional(),
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  customerPhone: z.string().nullable().optional(),
  stripePaymentIntentId: z.string().nullable().optional(),
  paymentStatus: z.string().optional(),
  bookingStatus: z.string().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  module: z.enum(["transfer_only", "multi_city", "day_by_day"]).optional(),
  currency: z.string().optional()
});

export const insertBookingDaySchema = createInsertSchema(bookingDays).omit({
  id: true,
  createdAt: true
}).extend({
  date: z.date(),
  cityId: z.number().optional(),
  notes: z.string().optional()
});

export const insertBookingServiceSchema = createInsertSchema(bookingServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  passengers: z.number().min(1).default(1),
  unitPrice: z.string(),
  subtotal: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  sortOrder: z.number().optional()
});

export const insertBookingAdjustmentSchema = createInsertSchema(bookingAdjustments).omit({
  id: true,
  createdAt: true
}).extend({
  type: z.enum(["discount", "surcharge", "tax"]),
  amount: z.string(),
  percentage: z.string().optional()
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  rating: z.number().min(1).max(5),
  tripDate: z.date().nullable().optional(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional()
});

// Phase 1.5 — Service Catalog insert schemas
export const insertTripTypeRowSchema = createInsertSchema(tripTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().regex(/^[a-z0-9_]+$/, "Slug must be lowercase letters, numbers, underscores"),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const insertServiceCatalogItemSchema = createInsertSchema(serviceCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  vehiclePrices: z.record(z.string(), z.number().positive()).default({}),
  includedStops: z.array(z.object({
    name: z.string(),
    durationMinutes: z.number().int().positive().optional(),
  })).optional().nullable(),
  durationHours: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().url().optional().nullable(),
  pickupZone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  nameTranslations: z.record(z.string(), z.string()).optional().nullable(),
  descriptionTranslations: z.record(z.string(), z.string()).optional().nullable(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type VehicleType = typeof vehicleTypes.$inferSelect;
export type InsertVehicleType = z.infer<typeof insertVehicleTypeSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;

export type GuideRate = typeof guideRates.$inferSelect;
export type InsertGuideRate = z.infer<typeof insertGuideRateSchema>;

export type AddOn = typeof addOns.$inferSelect;
export type InsertAddOn = z.infer<typeof insertAddOnSchema>;

export type Attraction = typeof attractions.$inferSelect;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;


export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingDay = typeof bookingDays.$inferSelect;
export type InsertBookingDay = z.infer<typeof insertBookingDaySchema>;

export type BookingService = typeof bookingServices.$inferSelect;
export type InsertBookingService = z.infer<typeof insertBookingServiceSchema>;

export type BookingAdjustment = typeof bookingAdjustments.$inferSelect;
export type InsertBookingAdjustment = z.infer<typeof insertBookingAdjustmentSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Phase 1.5 — Service Catalog types
export type TripTypeRow = typeof tripTypes.$inferSelect;
export type InsertTripTypeRow = z.infer<typeof insertTripTypeRowSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type ServiceCatalogItem = typeof serviceCatalog.$inferSelect;
export type InsertServiceCatalogItem = z.infer<typeof insertServiceCatalogItemSchema>;
