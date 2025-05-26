import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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
  maxPassengers: integer("max_passengers").notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }),
  image: text("image"),
});

export const tourGuides = pgTable("tour_guides", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  languages: text("languages").array().notNull(),
  cityId: integer("city_id").references(() => cities.id),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  isLicensed: boolean("is_licensed").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  image: text("image"),
});

export const addOns = pgTable("add_ons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceUnit: text("price_unit").notNull(), // 'per_person', 'per_trip', 'per_unit'
  availableCities: text("available_cities").array(), // city slugs where this add-on is available
  category: text("category").notNull(), // 'transport', 'experience', 'meal', 'ticket'
  image: text("image"),
  isActive: boolean("is_active").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  passengerCount: integer("passenger_count").notNull(),
  
  // Transportation details
  fromCityId: integer("from_city_id").references(() => cities.id),
  toCityId: integer("to_city_id").references(() => cities.id),
  vehicleTypeId: integer("vehicle_type_id").references(() => vehicleTypes.id),
  transportType: text("transport_type").notNull(), // 'route_based', 'hour_based'
  transportHours: integer("transport_hours"),
  
  // Guide details
  tourGuideId: integer("tour_guide_id").references(() => tourGuides.id),
  guideType: text("guide_type"), // 'hourly', 'daily'
  guideDays: integer("guide_days"),
  guideHours: integer("guide_hours"),
  
  // Add-ons
  selectedAddOns: jsonb("selected_add_ons"), // Array of {id, quantity}
  
  // Pricing
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  
  // Payment
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paymentStatus: text("payment_status").default("pending"), // 'pending', 'paid', 'failed'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commissionTiers = pgTable("commission_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({ id: true });

export const insertVehicleTypeSchema = createInsertSchema(vehicleTypes).omit({ id: true });

export const insertTourGuideSchema = createInsertSchema(tourGuides).omit({ id: true });

export const insertAddOnSchema = createInsertSchema(addOns).omit({ id: true });

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  userId: true,
  createdAt: true, 
  updatedAt: true 
});

export const insertCommissionTierSchema = createInsertSchema(commissionTiers).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type City = typeof cities.$inferSelect;
export type InsertCity = z.infer<typeof insertCitySchema>;

export type VehicleType = typeof vehicleTypes.$inferSelect;
export type InsertVehicleType = z.infer<typeof insertVehicleTypeSchema>;

export type TourGuide = typeof tourGuides.$inferSelect;
export type InsertTourGuide = z.infer<typeof insertTourGuideSchema>;

export type AddOn = typeof addOns.$inferSelect;
export type InsertAddOn = z.infer<typeof insertAddOnSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type CommissionTier = typeof commissionTiers.$inferSelect;
export type InsertCommissionTier = z.infer<typeof insertCommissionTierSchema>;
