import { db } from "./db";
import { services } from "@shared/schema";

export async function seedServices() {
  try {
    // Check if services already exist
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length > 0) {
      console.log("Services already exist, skipping seed");
      return;
    }

    console.log("Seeding services data...");

    const serviceData = [
      // Transfers
      {
        title: "Airport Transfer (Cairo)",
        type: "transfer",
        description: "Private transfer from/to Cairo Airport",
        pricingMode: "per_group",
        basePrice: "450.00",
        vehicleCategory: "sedan",
        durationMinutes: 60,
        isActive: true,
        cityId: 1
      },
      {
        title: "Inter-City Transfer",
        type: "transfer", 
        description: "Private transfer between cities",
        pricingMode: "per_group",
        basePrice: "800.00",
        vehicleCategory: "suv",
        durationMinutes: 180,
        isActive: true,
        cityId: 1
      },
      // Tours
      {
        title: "Pyramids of Giza Tour",
        type: "tour",
        description: "Half-day guided tour of the Great Pyramids and Sphinx",
        pricingMode: "per_person",
        basePrice: "350.00",
        durationMinutes: 240,
        isActive: true,
        cityId: 1
      },
      {
        title: "Egyptian Museum Tour",
        type: "tour",
        description: "Guided tour of the world-famous Egyptian Museum",
        pricingMode: "per_person", 
        basePrice: "280.00",
        durationMinutes: 180,
        isActive: true,
        cityId: 1
      },
      {
        title: "Khan El Khalili Bazaar Walk",
        type: "tour",
        description: "Walking tour through historic Khan El Khalili market",
        pricingMode: "per_person",
        basePrice: "150.00", 
        durationMinutes: 120,
        isActive: true,
        cityId: 1
      },
      // Guides
      {
        title: "Professional Tour Guide",
        type: "guide",
        description: "Certified English-speaking tour guide",
        pricingMode: "per_day",
        basePrice: "600.00",
        durationMinutes: 480,
        isActive: true,
        cityId: 1
      },
      {
        title: "Multi-Language Guide",
        type: "guide",
        description: "Guide fluent in English, French, and German",
        pricingMode: "per_day",
        basePrice: "750.00",
        durationMinutes: 480,
        isActive: true,
        cityId: 1
      },
      // Add-ons
      {
        title: "Entrance Fees Package",
        type: "addon",
        description: "Entry tickets to major attractions",
        pricingMode: "per_person",
        basePrice: "250.00",
        isActive: true,
        cityId: 1
      },
      {
        title: "Traditional Lunch",
        type: "addon", 
        description: "Authentic Egyptian meal at local restaurant",
        pricingMode: "per_person",
        basePrice: "180.00",
        isActive: true,
        cityId: 1
      },
      {
        title: "Photography Service",
        type: "addon",
        description: "Professional photographer for your tour",
        pricingMode: "per_group",
        basePrice: "400.00",
        durationMinutes: 240,
        isActive: true,
        cityId: 1
      }
    ];

    await db.insert(services).values(serviceData);
    console.log(`Successfully seeded ${serviceData.length} services`);
    
  } catch (error) {
    console.error("Error seeding services:", error);
    throw error;
  }
}