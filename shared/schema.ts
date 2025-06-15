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

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  isActive: boolean("is_active").default(true),
});

export const vehicleTypes = pgTable("vehicle_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  paxMin: integer("pax_min").notNull(),
  paxMax: integer("pax_max").notNull(),
  image: text("image"),
});

export const licenseClasses = pgTable("license_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // 'Normal', 'Tourism'
  surchargePct: decimal("surcharge_pct", { precision: 5, scale: 4 }).notNull(),
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  fromCityId: integer("from_city_id").references(() => cities.id).notNull(),
  toCityId: integer("to_city_id").references(() => cities.id).notNull(),
  fromLocation: text("from_location"), // For intra-city routes: "Airport", "Downtown", etc.
  toLocation: text("to_location"), // For intra-city routes: "Hotel", "Train Station", etc.
  name: text("name"), // Custom route name: "Cairo City Tour", "Airport Transfer", etc.
  tripType: text("trip_type").default("transfer"), // "transfer", "day-trip", "overnight", "multi-day"
  km: decimal("km", { precision: 8, scale: 2 }).notNull(),
  estimatedDuration: text("estimated_duration"), // Duration like "2 hours", "45 minutes", etc.
  routeHighlights: text("route_highlights"), // Key attractions or stops along the route
  travelTips: text("travel_tips"), // Important travel information for this route
  pickupInstructions: text("pickup_instructions"), // Specific pickup location details
  dropoffInstructions: text("dropoff_instructions"), // Specific dropoff location details
  basePriceByVehicle: jsonb("base_price_by_vehicle").notNull(), // JSON: {vehicle_id: {license_class_id: price}}
  displayOrder: integer("display_order").default(0), // Controls display order in pricing tool
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
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  jsonBlob: jsonb("json_blob").notNull(), // Complete quote data
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  commissionPct: decimal("commission_pct", { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  
  // Communication
  confirmationEmailSent: boolean("confirmation_email_sent").default(false),
  reminderEmailSent: boolean("reminder_email_sent").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export const insertVehicleTypeSchema = createInsertSchema(vehicleTypes).omit({ id: true });
export const insertLicenseClassSchema = createInsertSchema(licenseClasses).omit({ id: true });
export const insertRouteSchema = createInsertSchema(routes).omit({ id: true }).extend({
  tripType: z.enum(["transfer", "day-trip", "overnight", "multi-day"]).default("transfer")
});
export const insertTimeBlockSchema = createInsertSchema(timeBlocks).omit({ id: true });
export const insertGuideRateSchema = createInsertSchema(guideRates).omit({ id: true });
export const insertAddOnSchema = createInsertSchema(addOns).omit({ id: true });
export const insertAttractionSchema = createInsertSchema(attractions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });
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
  totalAmount: z.string().optional(),
  customerPhone: z.string().nullable().optional(),
  stripePaymentIntentId: z.string().nullable().optional(),
  paymentStatus: z.string().optional(),
  bookingStatus: z.string().optional(),
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional()
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

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
