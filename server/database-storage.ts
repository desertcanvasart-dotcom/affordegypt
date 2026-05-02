import { 
  users, cities, vehicleTypes, licenseClasses, routes, timeBlocks, guideRates, addOns, attractions, quotes, bookings, reviews,
  services, bookingDays, bookingServices, bookingAdjustments,
  type User, type InsertUser, type City, type InsertCity,
  type VehicleType, type InsertVehicleType, type LicenseClass, type InsertLicenseClass,
  type Route, type InsertRoute, type TimeBlock, type InsertTimeBlock,
  type GuideRate, type InsertGuideRate, type AddOn, type InsertAddOn,
  type Attraction, type InsertAttraction,
  type Quote, type InsertQuote, type Booking, type InsertBooking,
  type Review, type InsertReview,
  type Service, type InsertService,
  type BookingDay, type InsertBookingDay,
  type BookingService, type InsertBookingService,
  type BookingAdjustment, type InsertBookingAdjustment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deactivateUser(id: number): Promise<User>;
  activateUser(id: number): Promise<User>;

  // Cities
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;
  getCityBySlug(slug: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  updateCity(id: number, city: Partial<InsertCity>): Promise<City>;
  deleteCity(id: number): Promise<void>;

  // Vehicle Types
  getVehicleTypes(): Promise<VehicleType[]>;
  getVehicleType(id: number): Promise<VehicleType | undefined>;
  createVehicleType(vehicleType: InsertVehicleType): Promise<VehicleType>;
  updateVehicleType(id: number, vehicleType: Partial<InsertVehicleType>): Promise<VehicleType>;
  deleteVehicleType(id: number): Promise<void>;

  // License Classes
  getLicenseClasses(): Promise<LicenseClass[]>;
  getLicenseClass(id: number): Promise<LicenseClass | undefined>;
  createLicenseClass(licenseClass: InsertLicenseClass): Promise<LicenseClass>;
  updateLicenseClass(id: number, licenseClass: Partial<InsertLicenseClass>): Promise<LicenseClass>;
  deleteLicenseClass(id: number): Promise<void>;

  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(fromCityId: number, toCityId: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: number, route: Partial<InsertRoute>): Promise<Route>;
  deleteRoute(id: number): Promise<void>;

  // Time Blocks
  getTimeBlocks(cityId: number): Promise<TimeBlock[]>;
  getTimeBlock(cityId: number, hours: number): Promise<TimeBlock | undefined>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<InsertTimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: number): Promise<void>;

  // Guide Rates
  getGuideRates(cityId?: number): Promise<GuideRate[]>;
  getGuideRate(id: number): Promise<GuideRate | undefined>;
  createGuideRate(guideRate: InsertGuideRate): Promise<GuideRate>;
  updateGuideRate(id: number, guideRate: Partial<InsertGuideRate>): Promise<GuideRate>;
  deleteGuideRate(id: number): Promise<void>;

  // Add-ons
  getAddOns(cityId?: number): Promise<AddOn[]>;
  getAddOn(id: number): Promise<AddOn | undefined>;
  createAddOn(addOn: InsertAddOn): Promise<AddOn>;
  updateAddOn(id: number, addOn: Partial<InsertAddOn>): Promise<AddOn>;
  deleteAddOn(id: number): Promise<void>;

  // Attractions
  getAttractions(cityId?: number): Promise<Attraction[]>;
  getAttraction(id: number): Promise<Attraction | undefined>;
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;
  updateAttraction(id: number, attraction: Partial<InsertAttraction>): Promise<Attraction>;
  deleteAttraction(id: number): Promise<void>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  deleteQuote(id: number): Promise<void>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  markEmailSent(id: number, emailType: 'confirmation' | 'reminder'): Promise<Booking>;
  generateBookingReference(): string;
  deleteBooking(id: number): Promise<void>;

  // Reviews
  getActiveReviews(): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;

}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Check if data already exists
    const existingCities = await db.select().from(cities).limit(1);
    if (existingCities.length > 0) return;

    // Seed cities
    const cityData = [
      { name: "Cairo", slug: "cairo", description: "Egypt's capital with the famous pyramids", image: "https://pixabay.com/get/gc3907a47ada5ea4d33214a9ca2f30dde8c33dd84992fa0e86609a7ed683a54adf6504d33277b05593855b5ba07cde8e8bfc9c5f7ea6d7edf8271cac45f4ee0fe_1280.jpg", isActive: true },
      { name: "Alexandria", slug: "alexandria", description: "Mediterranean coastal city", image: "https://images.unsplash.com/photo-1591608971362-f08b2a75731a", isActive: true },
      { name: "Luxor", slug: "luxor", description: "Ancient city with temples and tombs", image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb", isActive: true },
      { name: "Aswan", slug: "aswan", description: "Southern city with Nubian culture", image: "https://pixabay.com/get/ge11207c7bb7becd360c687298420ab4d813de0f967472102cf31b40082536618da844fbec5080be19d8252c5b2b66463bc5952becdf5e80a50b124fdc683c377_1280.jpg", isActive: true },
      { name: "Hurghada", slug: "hurghada", description: "Red Sea resort town", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3", isActive: true },
      { name: "Sharm El Sheikh", slug: "sharm-el-sheikh", description: "Premier diving destination", image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7", isActive: true }
    ];

    const createdCities = await db.insert(cities).values(cityData).returning();

    // Seed vehicle types
    const vehicleData = [
      { name: "Sedan", description: "Comfortable 4-seater", paxMin: 1, paxMax: 4, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2" },
      { name: "Minivan", description: "Spacious 7-seater", paxMin: 5, paxMax: 7, image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b" },
      { name: "Van", description: "Large group transport", paxMin: 8, paxMax: 15, image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e" }
    ];

    const createdVehicles = await db.insert(vehicleTypes).values(vehicleData).returning();

    // Seed license classes
    const licenseData = [
      { name: "Normal", surchargePct: "0.0000" },
      { name: "Tourism", surchargePct: "0.2000" } // 20% surcharge
    ];

    const createdLicenses = await db.insert(licenseClasses).values(licenseData).returning();

    // Seed routes with pricing matrix
    const routeData = [];
    for (let i = 0; i < createdCities.length; i++) {
      for (let j = 0; j < createdCities.length; j++) {
        if (i !== j) {
          const distance = Math.floor(Math.random() * 500) + 50; // Random distance 50-550km
          const basePrices: any = {};
          
          createdVehicles.forEach(vehicle => {
            basePrices[vehicle.id] = {};
            createdLicenses.forEach(license => {
              // Base price calculation: $0.50 per km for sedan, scale up for larger vehicles
              const multiplier = vehicle.name === "Sedan" ? 0.5 : vehicle.name === "Minivan" ? 0.7 : 0.9;
              const basePrice = distance * multiplier;
              const licenseMultiplier = 1 + parseFloat(license.surchargePct);
              basePrices[vehicle.id][license.id] = (basePrice * licenseMultiplier).toFixed(2);
            });
          });

          routeData.push({
            fromCityId: createdCities[i].id,
            toCityId: createdCities[j].id,
            km: distance.toString(),
            basePriceByVehicle: basePrices
          });
        }
      }
    }

    await db.insert(routes).values(routeData);

    // Seed time blocks
    const timeBlockData = [];
    const hourOptions = [2, 4, 6, 8, 12, 24];
    
    createdCities.forEach(city => {
      hourOptions.forEach(hours => {
        const basePrices: any = {};
        
        createdVehicles.forEach(vehicle => {
          basePrices[vehicle.id] = {};
          createdLicenses.forEach(license => {
            // Hourly rate: $15-25 per hour depending on vehicle
            const hourlyRate = vehicle.name === "Sedan" ? 15 : vehicle.name === "Minivan" ? 20 : 25;
            const basePrice = hourlyRate * hours;
            const licenseMultiplier = 1 + parseFloat(license.surchargePct);
            basePrices[vehicle.id][license.id] = (basePrice * licenseMultiplier).toFixed(2);
          });
        });

        timeBlockData.push({
          cityId: city.id,
          hours,
          basePriceByVehicle: basePrices
        });
      });
    });

    await db.insert(timeBlocks).values(timeBlockData);

    // Seed guide rates
    const guideData = [
      { cityId: createdCities[0].id, language: "English", hourlyPrice: "8.00", name: "Ahmed Hassan", rating: "4.9", image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0" },
      { cityId: createdCities[0].id, language: "French", hourlyPrice: "10.00", name: "Fatima Al-Zahra", rating: "4.8", image: "https://images.unsplash.com/photo-1494790108755-2616b5b2e9cc" },
      { cityId: createdCities[2].id, language: "English", hourlyPrice: "9.00", name: "Omar Mahmoud", rating: "4.7", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
      { cityId: createdCities[3].id, language: "Spanish", hourlyPrice: "7.00", name: "Nadia Abdel", rating: "4.9", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" }
    ];

    await db.insert(guideRates).values(guideData);

    // Seed add-ons
    const addOnData = [
      { name: "Felucca Ride", description: "Traditional sailboat on the Nile", price: "25.00", unitType: "per_person", cityId: createdCities[0].id, category: "experience", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce", isActive: true },
      { name: "Horse Carriage", description: "Romantic horse-drawn carriage ride", price: "30.00", unitType: "per_trip", cityId: createdCities[2].id, category: "experience", image: "https://images.unsplash.com/photo-1553577043-5c4a2a14a5eb", isActive: true },
      { name: "Traditional Lunch", description: "Authentic Egyptian cuisine", price: "15.00", unitType: "per_person", cityId: null, category: "meal", image: "https://images.unsplash.com/photo-1567337712816-090a14c1b9b5", isActive: true },
      { name: "Skip-the-Line Pyramids", description: "Fast-track entry to Giza pyramids", price: "20.00", unitType: "per_person", cityId: createdCities[0].id, category: "ticket", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e", isActive: true }
    ];

    await db.insert(addOns).values(addOnData);

    // Seed services for Day-by-Day Custom Planner
    const serviceData = [
      // Transfer Services
      { type: "transfer", title: "Airport Transfer - Cairo", description: "Comfortable transfer from Cairo Airport to city center", cityId: createdCities[0].id, basePrice: "450.00", pricingMode: "per_group", vehicleCategory: "Sedan", durationMinutes: 60, capacity: 4, isActive: true },
      { type: "transfer", title: "Airport Transfer - Luxor", description: "Transfer from Luxor Airport to hotels", cityId: createdCities[2].id, basePrice: "380.00", pricingMode: "per_group", vehicleCategory: "Sedan", durationMinutes: 45, capacity: 4, isActive: true },
      { type: "transfer", title: "Hotel to Pyramids Transfer", description: "Private transfer from Cairo hotels to Giza Pyramids", cityId: createdCities[0].id, basePrice: "320.00", pricingMode: "per_group", vehicleCategory: "Sedan", durationMinutes: 45, capacity: 4, isActive: true },
      
      // Tour Services
      { type: "tour", title: "Half-Day Pyramids Tour", description: "Visit the Great Pyramid, Sphinx, and pyramid complex", cityId: createdCities[0].id, basePrice: "850.00", pricingMode: "per_person", durationMinutes: 240, capacity: 15, isActive: true },
      { type: "tour", title: "Full-Day Cairo City Tour", description: "Comprehensive tour of Islamic Cairo, Coptic Quarter, and Khan el-Khalili", cityId: createdCities[0].id, basePrice: "1200.00", pricingMode: "per_person", durationMinutes: 480, capacity: 15, isActive: true },
      { type: "tour", title: "Valley of the Kings Tour", description: "Explore ancient tombs and temples in Luxor's west bank", cityId: createdCities[2].id, basePrice: "950.00", pricingMode: "per_person", durationMinutes: 300, capacity: 12, isActive: true },
      { type: "tour", title: "Karnak Temple Complex", description: "Visit the massive temple complex dedicated to Amun-Ra", cityId: createdCities[2].id, basePrice: "650.00", pricingMode: "per_person", durationMinutes: 180, capacity: 20, isActive: true },
      { type: "tour", title: "Alexandria Day Trip", description: "Explore the Mediterranean city with library and catacombs", cityId: createdCities[1].id, basePrice: "1100.00", pricingMode: "per_person", durationMinutes: 480, capacity: 15, isActive: true },
      
      // Guide Services
      { type: "guide", title: "Professional Egyptologist Guide", description: "Expert guide with archaeology background", cityId: null, basePrice: "600.00", pricingMode: "per_group", durationMinutes: 480, capacity: 15, isActive: true },
      { type: "guide", title: "Local Cultural Guide", description: "Knowledgeable local guide for cultural experiences", cityId: null, basePrice: "400.00", pricingMode: "per_group", durationMinutes: 240, capacity: 10, isActive: true },
      { type: "guide", title: "Multilingual Tour Guide", description: "Guide fluent in English, German, French, and Arabic", cityId: null, basePrice: "500.00", pricingMode: "per_group", durationMinutes: 480, capacity: 12, isActive: true },
      
      // Add-on Services
      { type: "addon", title: "Traditional Egyptian Lunch", description: "Authentic local cuisine at traditional restaurant", cityId: null, basePrice: "180.00", pricingMode: "per_person", isActive: true },
      { type: "addon", title: "Entrance Tickets Bundle", description: "Combined entrance tickets for major attractions", cityId: null, basePrice: "350.00", pricingMode: "per_person", isActive: true },
      { type: "addon", title: "Camel Ride Experience", description: "30-minute camel ride around the pyramids", cityId: createdCities[0].id, basePrice: "120.00", pricingMode: "per_person", durationMinutes: 30, isActive: true },
      { type: "addon", title: "Felucca Sailing Trip", description: "Traditional sailboat experience on the Nile", cityId: createdCities[2].id, basePrice: "200.00", pricingMode: "per_person", durationMinutes: 90, capacity: 8, isActive: true },
      { type: "addon", title: "Sound & Light Show", description: "Evening show at the pyramids with narration", cityId: createdCities[0].id, basePrice: "250.00", pricingMode: "per_person", durationMinutes: 60, isActive: true }
    ];

    await db.insert(services).values(serviceData);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deactivateUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async activateUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // City methods
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).where(eq(cities.isActive, true));
  }

  async getCity(id: number): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.id, id));
    return city;
  }

  async getCityBySlug(slug: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
    return city;
  }

  async createCity(insertCity: InsertCity): Promise<City> {
    const [city] = await db.insert(cities).values(insertCity).returning();
    return city;
  }

  async updateCity(id: number, updateData: Partial<InsertCity>): Promise<City> {
    const [city] = await db.update(cities)
      .set(updateData)
      .where(eq(cities.id, id))
      .returning();
    return city;
  }

  async deleteCity(id: number): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  // Vehicle type methods
  async getVehicleTypes(): Promise<VehicleType[]> {
    return await db.select().from(vehicleTypes);
  }

  async getVehicleType(id: number): Promise<VehicleType | undefined> {
    const [vehicleType] = await db.select().from(vehicleTypes).where(eq(vehicleTypes.id, id));
    return vehicleType;
  }

  async createVehicleType(insertVehicleType: InsertVehicleType): Promise<VehicleType> {
    const [vehicleType] = await db.insert(vehicleTypes).values(insertVehicleType).returning();
    return vehicleType;
  }

  async updateVehicleType(id: number, updateData: Partial<InsertVehicleType>): Promise<VehicleType> {
    const [vehicleType] = await db.update(vehicleTypes)
      .set(updateData)
      .where(eq(vehicleTypes.id, id))
      .returning();
    return vehicleType;
  }

  async deleteVehicleType(id: number): Promise<void> {
    await db.delete(vehicleTypes).where(eq(vehicleTypes.id, id));
  }

  // License class methods
  async getLicenseClasses(): Promise<LicenseClass[]> {
    return await db.select().from(licenseClasses);
  }

  async getLicenseClass(id: number): Promise<LicenseClass | undefined> {
    const [licenseClass] = await db.select().from(licenseClasses).where(eq(licenseClasses.id, id));
    return licenseClass;
  }

  async createLicenseClass(insertLicenseClass: InsertLicenseClass): Promise<LicenseClass> {
    const [licenseClass] = await db.insert(licenseClasses).values(insertLicenseClass).returning();
    return licenseClass;
  }

  async updateLicenseClass(id: number, updateData: Partial<InsertLicenseClass>): Promise<LicenseClass> {
    const [licenseClass] = await db.update(licenseClasses)
      .set(updateData)
      .where(eq(licenseClasses.id, id))
      .returning();
    return licenseClass;
  }

  async deleteLicenseClass(id: number): Promise<void> {
    await db.delete(licenseClasses).where(eq(licenseClasses.id, id));
  }

  // Route methods
  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes).orderBy(routes.displayOrder, routes.routeCategory, routes.name, routes.id);
  }

  async getRoute(fromCityId: number, toCityId: number): Promise<Route | undefined> {
    const [route] = await db.select().from(routes)
      .where(and(eq(routes.fromCityId, fromCityId), eq(routes.toCityId, toCityId)));
    return route;
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const [route] = await db.insert(routes).values(insertRoute).returning();
    return route;
  }

  async updateRoute(id: number, updateData: Partial<InsertRoute>): Promise<Route> {
    const [route] = await db
      .update(routes)
      .set(updateData)
      .where(eq(routes.id, id))
      .returning();
    return route;
  }

  async deleteRoute(id: number): Promise<void> {
    await db
      .delete(routes)
      .where(eq(routes.id, id));
  }

  // Time block methods
  async getTimeBlocks(cityId: number): Promise<TimeBlock[]> {
    return await db.select().from(timeBlocks).where(eq(timeBlocks.cityId, cityId));
  }

  async getTimeBlock(cityId: number, hours: number): Promise<TimeBlock | undefined> {
    const [timeBlock] = await db.select().from(timeBlocks)
      .where(and(eq(timeBlocks.cityId, cityId), eq(timeBlocks.hours, hours)));
    return timeBlock;
  }

  async createTimeBlock(insertTimeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const [timeBlock] = await db.insert(timeBlocks).values(insertTimeBlock).returning();
    return timeBlock;
  }

  async updateTimeBlock(id: number, updateData: Partial<InsertTimeBlock>): Promise<TimeBlock> {
    const [timeBlock] = await db.update(timeBlocks)
      .set(updateData)
      .where(eq(timeBlocks.id, id))
      .returning();
    return timeBlock;
  }

  async deleteTimeBlock(id: number): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }

  // Guide rate methods
  async getGuideRates(cityId?: number): Promise<GuideRate[]> {
    if (cityId) {
      return await db.select().from(guideRates).where(eq(guideRates.cityId, cityId));
    }
    return await db.select().from(guideRates);
  }

  async getGuideRate(id: number): Promise<GuideRate | undefined> {
    const [guideRate] = await db.select().from(guideRates).where(eq(guideRates.id, id));
    return guideRate;
  }

  async createGuideRate(insertGuideRate: InsertGuideRate): Promise<GuideRate> {
    const [guideRate] = await db.insert(guideRates).values(insertGuideRate).returning();
    return guideRate;
  }

  async updateGuideRate(id: number, updateData: Partial<InsertGuideRate>): Promise<GuideRate> {
    const [guideRate] = await db.update(guideRates)
      .set(updateData)
      .where(eq(guideRates.id, id))
      .returning();
    return guideRate;
  }

  async deleteGuideRate(id: number): Promise<void> {
    await db.delete(guideRates).where(eq(guideRates.id, id));
  }

  // Add-on methods
  async getAddOns(cityId?: number): Promise<AddOn[]> {
    if (cityId) {
      return await db.select().from(addOns)
        .where(and(eq(addOns.isActive, true), eq(addOns.cityId, cityId)));
    }
    return await db.select().from(addOns).where(eq(addOns.isActive, true));
  }

  async getAddOn(id: number): Promise<AddOn | undefined> {
    const [addOn] = await db.select().from(addOns).where(eq(addOns.id, id));
    return addOn;
  }

  async createAddOn(insertAddOn: InsertAddOn): Promise<AddOn> {
    const [addOn] = await db.insert(addOns).values(insertAddOn).returning();
    return addOn;
  }

  async updateAddOn(id: number, updateData: Partial<InsertAddOn>): Promise<AddOn> {
    const [addOn] = await db.update(addOns)
      .set(updateData)
      .where(eq(addOns.id, id))
      .returning();
    return addOn;
  }

  async deleteAddOn(id: number): Promise<void> {
    await db.delete(addOns).where(eq(addOns.id, id));
  }

  // Attraction methods
  async getAttractions(cityId?: number): Promise<Attraction[]> {
    if (cityId) {
      return await db.select().from(attractions)
        .where(and(eq(attractions.isActive, true), eq(attractions.cityId, cityId)));
    }
    return await db.select().from(attractions).where(eq(attractions.isActive, true));
  }

  async getAttraction(id: number): Promise<Attraction | undefined> {
    const [attraction] = await db.select().from(attractions).where(eq(attractions.id, id));
    return attraction;
  }

  async createAttraction(insertAttraction: InsertAttraction): Promise<Attraction> {
    const [attraction] = await db.insert(attractions).values(insertAttraction).returning();
    return attraction;
  }

  async updateAttraction(id: number, updateData: Partial<InsertAttraction>): Promise<Attraction> {
    const [attraction] = await db.update(attractions)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(attractions.id, id))
      .returning();
    return attraction;
  }

  async deleteAttraction(id: number): Promise<void> {
    await db.delete(attractions).where(eq(attractions.id, id));
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }

  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    return quote;
  }

  async deleteQuote(id: number): Promise<void> {
    await db.delete(quotes).where(eq(quotes.id, id));
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingReference, reference));
    return booking;
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingData = {
      ...insertBooking,
      bookingReference: insertBooking.bookingReference || this.generateBookingReference(),
      quoteId: insertBooking.quoteId || null
    };
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  async updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking> {
    const updateData: any = { 
      paymentStatus: status,
      updatedAt: new Date()
    };
    if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;
    
    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ 
        bookingStatus: status,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async markEmailSent(id: number, emailType: 'confirmation' | 'reminder'): Promise<Booking> {
    const updateField = emailType === 'confirmation' ? 
      { confirmationEmailSent: true } : 
      { reminderEmailSent: true };
    
    const [booking] = await db
      .update(bookings)
      .set({
        ...updateField,
        updatedAt: new Date()
      })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  generateBookingReference(): string {
    const prefix = 'AE';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Reviews methods
  async getActiveReviews(): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(and(eq(reviews.isActive, true)))
      .orderBy(desc(reviews.createdAt));
  }

  async getAllReviews(): Promise<Review[]> {
    return await db.select().from(reviews)
      .orderBy(desc(reviews.createdAt));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db.update(reviews)
      .set({ ...reviewData, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: number): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

}

export const storage = new DatabaseStorage();