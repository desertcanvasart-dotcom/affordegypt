import { 
  users, cities, vehicleTypes, licenseClasses, routes, timeBlocks, guideRates, addOns, attractions, quotes, bookings,
  type User, type InsertUser, type City, type InsertCity,
  type VehicleType, type InsertVehicleType, type LicenseClass, type InsertLicenseClass,
  type Route, type InsertRoute, type TimeBlock, type InsertTimeBlock,
  type GuideRate, type InsertGuideRate, type AddOn, type InsertAddOn,
  type Attraction, type InsertAttraction,
  type Quote, type InsertQuote, type Booking, type InsertBooking
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;

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

  // Pricing Engine
  calculateQuotePrice(itinerary: any[], addons: any[], passengers: number): Promise<{
    subtotal: number;
    commissionPct: number;
    grandTotal: number;
    breakdown: any[];
  }>;
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

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId })
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
    return await db.select().from(routes);
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
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const bookingData = {
      ...insertBooking,
      bookingReference: this.generateBookingReference()
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

  // Enhanced pricing engine following your pseudo-code
  async calculateQuotePrice(itinerary: any[], addons: any[], passengers: number): Promise<{
    subtotal: number;
    commissionPct: number;
    grandTotal: number;
    breakdown: any[];
  }> {
    let subtotal = 0;
    const breakdown = [];

    // Calculate itinerary costs
    for (const leg of itinerary) {
      let legCost = 0;
      
      if (leg.mode === "route") {
        const route = await this.getRoute(leg.fromCityId, leg.toCityId);
        if (route) {
          const pricing = route.basePriceByVehicle as any;
          legCost = parseFloat(pricing[leg.vehicleId]?.[leg.licenseClassId] || "0");
        }
      } else if (leg.mode === "hourly") {
        const timeBlock = await this.getTimeBlock(leg.cityId, leg.hours);
        if (timeBlock) {
          const pricing = timeBlock.basePriceByVehicle as any;
          legCost = parseFloat(pricing[leg.vehicleId]?.[leg.licenseClassId] || "0");
        }
      }

      subtotal += legCost;
      breakdown.push({
        type: "transport",
        description: `${leg.mode === "route" ? "Route" : "Hourly"} transport`,
        cost: legCost
      });

      // Add guide cost if specified
      if (leg.guideId && leg.guideHours) {
        const guide = await this.getGuideRate(leg.guideId);
        if (guide) {
          const guideCost = parseFloat(guide.hourlyPrice) * leg.guideHours;
          subtotal += guideCost;
          breakdown.push({
            type: "guide",
            description: `${guide.name} (${guide.language})`,
            cost: guideCost
          });
        }
      }
    }

    // Add-ons calculation
    for (const item of addons) {
      const addOn = await this.getAddOn(item.id);
      if (addOn) {
        let itemCost = 0;
        if (addOn.unitType === "per_person") {
          itemCost = parseFloat(addOn.price) * item.quantity * passengers;
        } else {
          itemCost = parseFloat(addOn.price) * item.quantity;
        }
        
        subtotal += itemCost;
        breakdown.push({
          type: "addon",
          description: addOn.name,
          cost: itemCost
        });
      }
    }

    // Commission calculation: 10% if < $1000, 8% if >= $1000
    const commissionPct = subtotal < 1000 ? 0.10 : 0.08;
    const grandTotal = subtotal * (1 + commissionPct);

    return {
      subtotal,
      commissionPct,
      grandTotal,
      breakdown
    };
  }
}

export const storage = new DatabaseStorage();