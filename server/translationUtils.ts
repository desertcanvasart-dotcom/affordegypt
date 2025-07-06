import { db } from "./db";
import { cities, vehicleTypes, routes, addOns, attractions, services } from "@shared/schema";
import { eq } from "drizzle-orm";

// Translation utility functions
export interface TranslationMap {
  en: string;
  es: string;
  fr: string;
  de: string;
}

// Helper function to create translation object from English text
export function createTranslationObject(englishText: string): TranslationMap {
  return {
    en: englishText,
    es: englishText, // Will be replaced with actual translations
    fr: englishText, // Will be replaced with actual translations
    de: englishText, // Will be replaced with actual translations
  };
}

// Helper function to get translated text based on language
export function getTranslatedText(
  translationObj: TranslationMap | null,
  language: string,
  fallbackText: string = ""
): string {
  if (!translationObj) return fallbackText;
  
  const langKey = language.toLowerCase();
  switch (langKey) {
    case "spanish":
    case "es":
      return translationObj.es || translationObj.en || fallbackText;
    case "french":
    case "fr":
      return translationObj.fr || translationObj.en || fallbackText;
    case "german":
    case "de":
      return translationObj.de || translationObj.en || fallbackText;
    default:
      return translationObj.en || fallbackText;
  }
}

// Function to detect language from Accept-Language header
export function detectLanguageFromHeader(acceptLanguage: string): string {
  if (!acceptLanguage) return "en";
  
  const languages = acceptLanguage.split(",");
  for (const lang of languages) {
    const langCode = lang.split(";")[0].trim().toLowerCase();
    if (langCode.startsWith("es")) return "es";
    if (langCode.startsWith("fr")) return "fr";
    if (langCode.startsWith("de")) return "de";
    if (langCode.startsWith("en")) return "en";
  }
  
  return "en";
}

// Migration function to populate translation columns with existing data
export async function migrateExistingDataToTranslations() {
  console.log("Starting migration of existing data to translation columns...");
  
  try {
    // Migrate cities
    console.log("Migrating cities...");
    const citiesData = await db.select().from(cities);
    for (const city of citiesData) {
      await db.update(cities)
        .set({
          nameTranslations: createTranslationObject(city.name),
          descriptionTranslations: city.description 
            ? createTranslationObject(city.description)
            : null,
        })
        .where(eq(cities.id, city.id));
    }
    
    // Migrate vehicle types
    console.log("Migrating vehicle types...");
    const vehicleTypesData = await db.select().from(vehicleTypes);
    for (const vehicle of vehicleTypesData) {
      await db.update(vehicleTypes)
        .set({
          nameTranslations: createTranslationObject(vehicle.name),
          descriptionTranslations: vehicle.description 
            ? createTranslationObject(vehicle.description)
            : null,
        })
        .where(eq(vehicleTypes.id, vehicle.id));
    }
    
    // Migrate routes
    console.log("Migrating routes...");
    const routesData = await db.select().from(routes);
    for (const route of routesData) {
      await db.update(routes)
        .set({
          nameTranslations: route.name 
            ? createTranslationObject(route.name)
            : null,
          fromLocationTranslations: route.fromLocation 
            ? createTranslationObject(route.fromLocation)
            : null,
          toLocationTranslations: route.toLocation 
            ? createTranslationObject(route.toLocation)
            : null,
          routeHighlightsTranslations: route.routeHighlights 
            ? createTranslationObject(route.routeHighlights)
            : null,
          travelTipsTranslations: route.travelTips 
            ? createTranslationObject(route.travelTips)
            : null,
          pickupInstructionsTranslations: route.pickupInstructions 
            ? createTranslationObject(route.pickupInstructions)
            : null,
          dropoffInstructionsTranslations: route.dropoffInstructions 
            ? createTranslationObject(route.dropoffInstructions)
            : null,
        })
        .where(eq(routes.id, route.id));
    }
    
    // Migrate add-ons
    console.log("Migrating add-ons...");
    const addOnsData = await db.select().from(addOns);
    for (const addon of addOnsData) {
      await db.update(addOns)
        .set({
          nameTranslations: createTranslationObject(addon.name),
          descriptionTranslations: addon.description 
            ? createTranslationObject(addon.description)
            : null,
        })
        .where(eq(addOns.id, addon.id));
    }
    
    // Migrate attractions
    console.log("Migrating attractions...");
    const attractionsData = await db.select().from(attractions);
    for (const attraction of attractionsData) {
      await db.update(attractions)
        .set({
          nameTranslations: createTranslationObject(attraction.name),
          descriptionTranslations: attraction.description 
            ? createTranslationObject(attraction.description)
            : null,
          bestTimeToVisitTranslations: attraction.bestTimeToVisit 
            ? createTranslationObject(attraction.bestTimeToVisit)
            : null,
        })
        .where(eq(attractions.id, attraction.id));
    }
    
    // Migrate services
    console.log("Migrating services...");
    const servicesData = await db.select().from(services);
    for (const service of servicesData) {
      await db.update(services)
        .set({
          titleTranslations: createTranslationObject(service.title),
          descriptionTranslations: service.description 
            ? createTranslationObject(service.description)
            : null,
        })
        .where(eq(services.id, service.id));
    }
    
    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Function to apply translations to database response
export function applyTranslationsToResponse(
  data: any,
  language: string,
  tableType: string
): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => applyTranslationsToResponse(item, language, tableType));
  }
  
  // Handle single objects
  const result = { ...data };
  
  switch (tableType) {
    case "cities":
      if (result.nameTranslations) {
        result.name = getTranslatedText(result.nameTranslations, language, result.name);
      }
      if (result.descriptionTranslations) {
        result.description = getTranslatedText(result.descriptionTranslations, language, result.description);
      }
      break;
      
    case "vehicleTypes":
      if (result.nameTranslations) {
        result.name = getTranslatedText(result.nameTranslations, language, result.name);
      }
      if (result.descriptionTranslations) {
        result.description = getTranslatedText(result.descriptionTranslations, language, result.description);
      }
      break;
      
    case "routes":
      if (result.nameTranslations) {
        result.name = getTranslatedText(result.nameTranslations, language, result.name);
      }
      if (result.fromLocationTranslations) {
        result.fromLocation = getTranslatedText(result.fromLocationTranslations, language, result.fromLocation);
      }
      if (result.toLocationTranslations) {
        result.toLocation = getTranslatedText(result.toLocationTranslations, language, result.toLocation);
      }
      if (result.routeHighlightsTranslations) {
        result.routeHighlights = getTranslatedText(result.routeHighlightsTranslations, language, result.routeHighlights);
      }
      if (result.travelTipsTranslations) {
        result.travelTips = getTranslatedText(result.travelTipsTranslations, language, result.travelTips);
      }
      if (result.pickupInstructionsTranslations) {
        result.pickupInstructions = getTranslatedText(result.pickupInstructionsTranslations, language, result.pickupInstructions);
      }
      if (result.dropoffInstructionsTranslations) {
        result.dropoffInstructions = getTranslatedText(result.dropoffInstructionsTranslations, language, result.dropoffInstructions);
      }
      break;
      
    case "addOns":
      if (result.nameTranslations) {
        result.name = getTranslatedText(result.nameTranslations, language, result.name);
      }
      if (result.descriptionTranslations) {
        result.description = getTranslatedText(result.descriptionTranslations, language, result.description);
      }
      break;
      
    case "attractions":
      if (result.nameTranslations) {
        result.name = getTranslatedText(result.nameTranslations, language, result.name);
      }
      if (result.descriptionTranslations) {
        result.description = getTranslatedText(result.descriptionTranslations, language, result.description);
      }
      if (result.bestTimeToVisitTranslations) {
        result.bestTimeToVisit = getTranslatedText(result.bestTimeToVisitTranslations, language, result.bestTimeToVisit);
      }
      break;
      
    case "services":
      if (result.titleTranslations) {
        result.title = getTranslatedText(result.titleTranslations, language, result.title);
      }
      if (result.descriptionTranslations) {
        result.description = getTranslatedText(result.descriptionTranslations, language, result.description);
      }
      break;
  }
  
  // Clean up translation columns from response
  delete result.nameTranslations;
  delete result.descriptionTranslations;
  delete result.titleTranslations;
  delete result.fromLocationTranslations;
  delete result.toLocationTranslations;
  delete result.routeHighlightsTranslations;
  delete result.travelTipsTranslations;
  delete result.pickupInstructionsTranslations;
  delete result.dropoffInstructionsTranslations;
  delete result.bestTimeToVisitTranslations;
  
  return result;
}