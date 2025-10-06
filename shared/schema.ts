import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(), // Hashed token for security
  selector: text("selector").notNull().unique(), // Public token selector
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const licenseClasses = pgTable("license_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // 'Normal', 'Tourism'
  surchargePct: decimal("surcharge_pct", { precision: 5, scale: 4 }).notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  fromCityId: integer("from_city_id").references(() => cities.id),
  toCityId: integer("to_city_id").references(() => cities.id),
  km: decimal("km", { precision: 8, scale: 2 }), // Keep existing column
  basePriceByVehicle: jsonb("base_price_by_vehicle"), // Keep existing column
  fromLocation: text("from_location"),
  toLocation: text("to_location"),
  name: text("name"),
  displayOrder: integer("display_order").default(0),
  estimatedDuration: text("estimated_duration"),
  routeHighlights: text("route_highlights"),
  travelTips: text("travel_tips"),
  pickupInstructions: text("pickup_instructions"),
  dropoffInstructions: text("dropoff_instructions"),
  tripType: text("trip_type"), // Keep existing column
  routeCategory: text("route_category"),
  cityId: integer("city_id").references(() => cities.id),
  tripMode: text("trip_mode").default("transfer"),
  nights: integer("nights").default(0),
  distanceKm: integer("distance_km"),
  vehiclePrices: jsonb("vehicle_prices"),
  // Translation columns
  nameTranslations: jsonb("name_translations"),
  fromLocationTranslations: jsonb("from_location_translations"),
  toLocationTranslations: jsonb("to_location_translations"),
  routeHighlightsTranslations: jsonb("route_highlights_translations"),
  travelTipsTranslations: jsonb("travel_tips_translations"),
  pickupInstructionsTranslations: jsonb("pickup_instructions_translations"),
  dropoffInstructionsTranslations: jsonb("dropoff_instructions_translations"),
});

export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  hours: integer("hours").notNull(),
  basePriceByVehicle: jsonb("base_price_by_vehicle").notNull(), // JSON: {vehicle_id: {license_class_id: price}}
});

export const guideRates = pgTable("guide_rates", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  language: text("language").notNull(),
  hourlyPrice: decimal("hourly_price", { precision: 10, scale: 2 }).notNull(),
  name: text("name").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  image: text("image"),
});

export const addOns = pgTable("add_ons", {
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
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").references(() => cities.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  duration: integer("duration").default(2), // hours
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  image: text("image"),
  coordinates: text("coordinates"),
  bestTimeToVisit: text("best_time_to_visit"),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Translation columns
  nameTranslations: jsonb("name_translations"),
  descriptionTranslations: jsonb("description_translations"),
  bestTimeToVisitTranslations: jsonb("best_time_to_visit_translations"),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  jsonBlob: jsonb("json_blob").notNull(), // Complete quote data
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  commissionPct: decimal("commission_pct", { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services catalog for Day-by-Day Custom Planner
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'transfer', 'tour', 'guide', 'addon'
  title: text("title").notNull(),
  description: text("description"),
  cityId: integer("city_id").references(() => cities.id),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricingMode: text("pricing_mode").notNull(), // 'per_group', 'per_person'
  vehicleCategory: text("vehicle_category"), // 'sedan', 'minivan', 'van' (for transfers)
  durationMinutes: integer("duration_minutes"), // for tours/guides
  capacity: integer("capacity"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Translation columns
  titleTranslations: jsonb("title_translations"),
  descriptionTranslations: jsonb("description_translations"),
});

export const bookings = pgTable("bookings", {
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
  bookingStatus: text("booking_status").default("confirmed"), // 'confirmed', 'in_progress', 'completed', 'cancelled'
  bookingReference: text("booking_reference").notNull(), // Unique booking reference
  
  // Trip Details
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  module: text("module").notNull().default("multi_city"), // 'transfer_only', 'multi_city', 'day_by_day'
  currency: text("currency").notNull().default("EGP"),
  
  // Communication
  confirmationEmailSent: boolean("confirmation_email_sent").default(false),
  reminderEmailSent: boolean("reminder_email_sent").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily breakdown for Day-by-Day bookings
export const bookingDays = pgTable("booking_days", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  date: timestamp("date").notNull(),
  cityId: integer("city_id").references(() => cities.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual services within each booking day
export const bookingServices = pgTable("booking_services", {
  id: serial("id").primaryKey(),
  bookingDayId: integer("booking_day_id").references(() => bookingDays.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  passengers: integer("passengers").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  startTime: text("start_time"), // e.g., "09:00"
  endTime: text("end_time"), // e.g., "17:00"
  meta: jsonb("meta"), // origin/destination, guide language, pickup details, etc.
  sortOrder: integer("sort_order").default(0), // for drag-and-drop ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking adjustments for discounts and surcharges
export const bookingAdjustments = pgTable("booking_adjustments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  type: text("type").notNull(), // 'discount', 'surcharge', 'tax'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerLocation: text("customer_location"), // e.g., "London, UK"
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  tripDate: timestamp("trip_date"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
export const insertLicenseClassSchema = createInsertSchema(licenseClasses).omit({ id: true });
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
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });

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

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type VehicleType = typeof vehicleTypes.$inferSelect;
export type InsertVehicleType = z.infer<typeof insertVehicleTypeSchema>;

export type LicenseClass = typeof licenseClasses.$inferSelect;
export type InsertLicenseClass = z.infer<typeof insertLicenseClassSchema>;

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
