import { 
  users, cities, vehicleTypes, licenseClasses, routes, timeBlocks, guideRates, addOns, quotes, bookings,
  type User, type InsertUser, type City, type InsertCity,
  type VehicleType, type InsertVehicleType, type LicenseClass, type InsertLicenseClass,
  type Route, type InsertRoute, type TimeBlock, type InsertTimeBlock,
  type GuideRate, type InsertGuideRate, type AddOn, type InsertAddOn,
  type Quote, type InsertQuote, type Booking, type InsertBooking
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

  // Vehicle Types
  getVehicleTypes(): Promise<VehicleType[]>;
  getVehicleType(id: number): Promise<VehicleType | undefined>;
  createVehicleType(vehicleType: InsertVehicleType): Promise<VehicleType>;

  // Tour Guides
  getTourGuides(): Promise<TourGuide[]>;
  getTourGuidesByCity(cityId: number): Promise<TourGuide[]>;
  getTourGuide(id: number): Promise<TourGuide | undefined>;
  createTourGuide(tourGuide: InsertTourGuide): Promise<TourGuide>;

  // Add-ons
  getAddOns(): Promise<AddOn[]>;
  getAddOnsByCity(citySlug: string): Promise<AddOn[]>;
  getAddOn(id: number): Promise<AddOn | undefined>;
  createAddOn(addOn: InsertAddOn): Promise<AddOn>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking>;
  markEmailSent(id: number, emailType: 'confirmation' | 'reminder'): Promise<Booking>;

  // Commission Tiers
  getCommissionTiers(): Promise<CommissionTier[]>;
  getCommissionTier(amount: number): Promise<CommissionTier | undefined>;
  createCommissionTier(tier: InsertCommissionTier): Promise<CommissionTier>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cities: Map<number, City>;
  private vehicleTypes: Map<number, VehicleType>;
  private tourGuides: Map<number, TourGuide>;
  private addOns: Map<number, AddOn>;
  private bookings: Map<number, Booking>;
  private commissionTiers: Map<number, CommissionTier>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.cities = new Map();
    this.vehicleTypes = new Map();
    this.tourGuides = new Map();
    this.addOns = new Map();
    this.bookings = new Map();
    this.commissionTiers = new Map();
    this.currentId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed cities
    const citiesData = [
      { name: "Cairo", slug: "cairo", description: "Egypt's capital with the famous pyramids", image: "https://pixabay.com/get/gc3907a47ada5ea4d33214a9ca2f30dde8c33dd84992fa0e86609a7ed683a54adf6504d33277b05593855b5ba07cde8e8bfc9c5f7ea6d7edf8271cac45f4ee0fe_1280.jpg", isActive: true },
      { name: "Alexandria", slug: "alexandria", description: "Mediterranean coastal city", image: "https://images.unsplash.com/photo-1591608971362-f08b2a75731a", isActive: true },
      { name: "Luxor", slug: "luxor", description: "Ancient city with temples and tombs", image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb", isActive: true },
      { name: "Aswan", slug: "aswan", description: "Southern city with Nubian culture", image: "https://pixabay.com/get/ge11207c7bb7becd360c687298420ab4d813de0f967472102cf31b40082536618da844fbec5080be19d8252c5b2b66463bc5952becdf5e80a50b124fdc683c377_1280.jpg", isActive: true },
      { name: "Hurghada", slug: "hurghada", description: "Red Sea resort town", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3", isActive: true },
      { name: "Sharm El Sheikh", slug: "sharm-el-sheikh", description: "Premier diving destination", image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7", isActive: true }
    ];

    citiesData.forEach(city => {
      const newCity: City = { 
        id: this.currentId++, 
        ...city,
        description: city.description || null,
        image: city.image || null,
        isActive: city.isActive || null
      };
      this.cities.set(newCity.id, newCity);
    });

    // Seed vehicle types
    const vehicleTypesData = [
      { name: "Economy", description: "4 passengers", maxPassengers: 4, basePrice: "35.00", pricePerHour: "15.00", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2" },
      { name: "SUV", description: "7 passengers", maxPassengers: 7, basePrice: "55.00", pricePerHour: "22.00", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b" },
      { name: "Minibus", description: "15 passengers", maxPassengers: 15, basePrice: "85.00", pricePerHour: "35.00", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e" }
    ];

    vehicleTypesData.forEach(vehicle => {
      const newVehicle: VehicleType = { id: this.currentId++, ...vehicle };
      this.vehicleTypes.set(newVehicle.id, newVehicle);
    });

    // Seed tour guides
    const guidesData = [
      { name: "Ahmed Hassan", languages: ["English", "Arabic"], cityId: 1, dailyRate: "50.00", hourlyRate: "8.00", isLicensed: true, rating: "4.9", image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0" },
      { name: "Fatima Al-Zahra", languages: ["English", "French", "Arabic"], cityId: 1, dailyRate: "60.00", hourlyRate: "10.00", isLicensed: true, rating: "4.8", image: "https://images.unsplash.com/photo-1494790108755-2616b5b2e9cc" },
      { name: "Omar Mahmoud", languages: ["English", "German", "Arabic"], cityId: 3, dailyRate: "55.00", hourlyRate: "9.00", isLicensed: true, rating: "4.7", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
      { name: "Nadia Abdel", languages: ["English", "Spanish", "Arabic"], cityId: 4, dailyRate: "45.00", hourlyRate: "7.00", isLicensed: true, rating: "4.9", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80" }
    ];

    guidesData.forEach(guide => {
      const newGuide: TourGuide = { id: this.currentId++, ...guide };
      this.tourGuides.set(newGuide.id, newGuide);
    });

    // Seed add-ons
    const addOnsData = [
      { name: "Felucca Ride", description: "Traditional sailboat on the Nile", price: "25.00", priceUnit: "per_person", availableCities: ["cairo", "luxor", "aswan"], category: "experience", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce", isActive: true },
      { name: "Horse Carriage", description: "Romantic horse-drawn carriage ride", price: "30.00", priceUnit: "per_trip", availableCities: ["luxor", "aswan"], category: "experience", image: "https://images.unsplash.com/photo-1553577043-5c4a2a14a5eb", isActive: true },
      { name: "Traditional Lunch", description: "Authentic Egyptian cuisine", price: "15.00", priceUnit: "per_person", availableCities: ["cairo", "alexandria", "luxor", "aswan"], category: "meal", image: "https://images.unsplash.com/photo-1567337712816-090a14c1b9b5", isActive: true },
      { name: "Skip-the-Line Pyramids", description: "Fast-track entry to Giza pyramids", price: "20.00", priceUnit: "per_person", availableCities: ["cairo"], category: "ticket", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e", isActive: true },
      { name: "Nile Cruise Dinner", description: "Evening dinner cruise on the Nile", price: "45.00", priceUnit: "per_person", availableCities: ["cairo", "luxor", "aswan"], category: "experience", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96", isActive: true },
      { name: "Camel Ride", description: "Desert camel riding experience", price: "35.00", priceUnit: "per_person", availableCities: ["cairo", "hurghada", "sharm-el-sheikh"], category: "experience", image: "https://images.unsplash.com/photo-1542640244-6d85e3a8e9d0", isActive: true }
    ];

    addOnsData.forEach(addOn => {
      const newAddOn: AddOn = { id: this.currentId++, ...addOn };
      this.addOns.set(newAddOn.id, newAddOn);
    });

    // Seed commission tiers
    const tiersData = [
      { name: "Budget Tier", minAmount: "0.00", commissionRate: "0.1000" },
      { name: "Premium Tier", minAmount: "100.00", commissionRate: "0.0800" }
    ];

    tiersData.forEach(tier => {
      const newTier: CommissionTier = { id: this.currentId++, ...tier };
      this.commissionTiers.set(newTier.id, newTier);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email || null,
      stripeCustomerId: null, 
      stripeSubscriptionId: null 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, stripeCustomerId: customerId, stripeSubscriptionId: subscriptionId };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // City methods
  async getCities(): Promise<City[]> {
    return Array.from(this.cities.values()).filter(city => city.isActive);
  }

  async getCity(id: number): Promise<City | undefined> {
    return this.cities.get(id);
  }

  async getCityBySlug(slug: string): Promise<City | undefined> {
    return Array.from(this.cities.values()).find(city => city.slug === slug);
  }

  async createCity(insertCity: InsertCity): Promise<City> {
    const id = this.currentId++;
    const city: City = { id, ...insertCity };
    this.cities.set(id, city);
    return city;
  }

  // Vehicle type methods
  async getVehicleTypes(): Promise<VehicleType[]> {
    return Array.from(this.vehicleTypes.values());
  }

  async getVehicleType(id: number): Promise<VehicleType | undefined> {
    return this.vehicleTypes.get(id);
  }

  async createVehicleType(insertVehicleType: InsertVehicleType): Promise<VehicleType> {
    const id = this.currentId++;
    const vehicleType: VehicleType = { id, ...insertVehicleType };
    this.vehicleTypes.set(id, vehicleType);
    return vehicleType;
  }

  // Tour guide methods
  async getTourGuides(): Promise<TourGuide[]> {
    return Array.from(this.tourGuides.values());
  }

  async getTourGuidesByCity(cityId: number): Promise<TourGuide[]> {
    return Array.from(this.tourGuides.values()).filter(guide => guide.cityId === cityId);
  }

  async getTourGuide(id: number): Promise<TourGuide | undefined> {
    return this.tourGuides.get(id);
  }

  async createTourGuide(insertTourGuide: InsertTourGuide): Promise<TourGuide> {
    const id = this.currentId++;
    const tourGuide: TourGuide = { id, ...insertTourGuide };
    this.tourGuides.set(id, tourGuide);
    return tourGuide;
  }

  // Add-on methods
  async getAddOns(): Promise<AddOn[]> {
    return Array.from(this.addOns.values()).filter(addOn => addOn.isActive);
  }

  async getAddOnsByCity(citySlug: string): Promise<AddOn[]> {
    return Array.from(this.addOns.values()).filter(addOn => 
      addOn.isActive && 
      addOn.availableCities && 
      addOn.availableCities.includes(citySlug)
    );
  }

  async getAddOn(id: number): Promise<AddOn | undefined> {
    return this.addOns.get(id);
  }

  async createAddOn(insertAddOn: InsertAddOn): Promise<AddOn> {
    const id = this.currentId++;
    const addOn: AddOn = { id, ...insertAddOn };
    this.addOns.set(id, addOn);
    return addOn;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = { 
      id, 
      ...insertBooking, 
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updatedBooking = { 
      ...booking, 
      paymentStatus: status, 
      stripePaymentIntentId: paymentIntentId || booking.stripePaymentIntentId,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async markEmailSent(id: number, emailType: 'confirmation' | 'reminder'): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    
    const updateField = emailType === 'confirmation' ? 
      { confirmationEmailSent: true } : 
      { reminderEmailSent: true };
    
    const updatedBooking = { 
      ...booking, 
      ...updateField,
      updatedAt: new Date()
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Commission tier methods
  async getCommissionTiers(): Promise<CommissionTier[]> {
    return Array.from(this.commissionTiers.values()).sort((a, b) => 
      parseFloat(a.minAmount) - parseFloat(b.minAmount)
    );
  }

  async getCommissionTier(amount: number): Promise<CommissionTier | undefined> {
    const tiers = await this.getCommissionTiers();
    return tiers.reverse().find(tier => amount >= parseFloat(tier.minAmount));
  }

  async createCommissionTier(insertCommissionTier: InsertCommissionTier): Promise<CommissionTier> {
    const id = this.currentId++;
    const commissionTier: CommissionTier = { id, ...insertCommissionTier };
    this.commissionTiers.set(id, commissionTier);
    return commissionTier;
  }
}

export const storage = new MemStorage();
