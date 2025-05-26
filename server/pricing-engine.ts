import { storage } from "./storage";

// Vehicle size categories based on passenger count
export function getVehicleCategory(passengers: number): string {
  if (passengers <= 2) return "sedan";
  if (passengers <= 8) return "minivan";
  return "van";
}

// Enhanced pricing structure
interface RoutePrice {
  routeId: number;
  vehicleCategory: string;
  carType: "normal" | "licensed_tourism";
  basePrice: number;
  pricePerPerson?: number;
}

interface GuidePrice {
  language: string;
  cityId: number;
  pricePerDay: number;
  pricePerHour: number;
}

interface AddOnPrice {
  id: number;
  name: string;
  price: number;
  pricingType: "per_unit" | "per_person" | "per_trip";
  category: string;
}

// Mock pricing data that matches your specification
const ROUTE_PRICES: RoutePrice[] = [
  // Cairo Routes
  { routeId: 1, vehicleCategory: "sedan", carType: "normal", basePrice: 50 },
  { routeId: 1, vehicleCategory: "sedan", carType: "licensed_tourism", basePrice: 65 },
  { routeId: 1, vehicleCategory: "minivan", carType: "normal", basePrice: 80 },
  { routeId: 1, vehicleCategory: "minivan", carType: "licensed_tourism", basePrice: 100 },
  { routeId: 1, vehicleCategory: "van", carType: "normal", basePrice: 120 },
  { routeId: 1, vehicleCategory: "van", carType: "licensed_tourism", basePrice: 150 },
  
  // Cairo to Alexandria Over Day
  { routeId: 2, vehicleCategory: "sedan", carType: "normal", basePrice: 120 },
  { routeId: 2, vehicleCategory: "sedan", carType: "licensed_tourism", basePrice: 150 },
  { routeId: 2, vehicleCategory: "minivan", carType: "normal", basePrice: 180 },
  { routeId: 2, vehicleCategory: "minivan", carType: "licensed_tourism", basePrice: 220 },
  { routeId: 2, vehicleCategory: "van", carType: "normal", basePrice: 280 },
  { routeId: 2, vehicleCategory: "van", carType: "licensed_tourism", basePrice: 350 },
  
  // Cairo to El Fayoum Over Day
  { routeId: 3, vehicleCategory: "sedan", carType: "normal", basePrice: 90 },
  { routeId: 3, vehicleCategory: "sedan", carType: "licensed_tourism", basePrice: 110 },
  { routeId: 3, vehicleCategory: "minivan", carType: "normal", basePrice: 140 },
  { routeId: 3, vehicleCategory: "minivan", carType: "licensed_tourism", basePrice: 170 },
  { routeId: 3, vehicleCategory: "van", carType: "normal", basePrice: 220 },
  { routeId: 3, vehicleCategory: "van", carType: "licensed_tourism", basePrice: 270 },
];

const GUIDE_PRICES: GuidePrice[] = [
  // Cairo guides
  { language: "English", cityId: 1, pricePerDay: 40, pricePerHour: 8 },
  { language: "Spanish", cityId: 1, pricePerDay: 45, pricePerHour: 9 },
  { language: "French", cityId: 1, pricePerDay: 45, pricePerHour: 9 },
  { language: "German", cityId: 1, pricePerDay: 50, pricePerHour: 10 },
  { language: "Italian", cityId: 1, pricePerDay: 45, pricePerHour: 9 },
  { language: "Japanese", cityId: 1, pricePerDay: 60, pricePerHour: 12 },
  { language: "Chinese", cityId: 1, pricePerDay: 55, pricePerHour: 11 },
  
  // Other cities (sample)
  { language: "English", cityId: 2, pricePerDay: 35, pricePerHour: 7 },
  { language: "Spanish", cityId: 2, pricePerDay: 40, pricePerHour: 8 },
];

const ADDON_PRICES: AddOnPrice[] = [
  // Per unit add-ons
  { id: 1, name: "Lunch", price: 15, pricingType: "per_unit", category: "meals" },
  { id: 2, name: "Dinner", price: 20, pricingType: "per_unit", category: "meals" },
  { id: 3, name: "Felucca Ride (Cairo)", price: 25, pricingType: "per_unit", category: "activities" },
  { id: 4, name: "Felucca Ride (Aswan)", price: 30, pricingType: "per_unit", category: "activities" },
  { id: 5, name: "Horse Carriage (Luxor)", price: 20, pricingType: "per_unit", category: "transport" },
  { id: 6, name: "Horse Carriage (Aswan)", price: 20, pricingType: "per_unit", category: "transport" },
  { id: 7, name: "Skip-the-line Entrance", price: 10, pricingType: "per_person", category: "tickets" },
  { id: 8, name: "Seating Train Ticket", price: 45, pricingType: "per_person", category: "transport" },
  { id: 9, name: "Sleeping Train Ticket", price: 85, pricingType: "per_person", category: "transport" },
  
  // Per person, per trip add-ons
  { id: 10, name: "4-day Nile Cruise", price: 280, pricingType: "per_trip", category: "cruise" },
  { id: 11, name: "5-day Nile Cruise", price: 350, pricingType: "per_trip", category: "cruise" },
  { id: 12, name: "7-day Nile Cruise", price: 490, pricingType: "per_trip", category: "cruise" },
];

// City service data structure
export interface CityService {
  cityId: number;
  cityName: string;
  date: string;
  travelers: number;
  selectedRoutes: number[];
  selectedGuide?: {
    language: string;
    duration: number; // in hours
  };
  attractions?: string[];
  selectedAddOns: Array<{
    id: number;
    quantity: number;
  }>;
}

// Pricing calculation engine
export class PricingEngine {
  static calculateRoutePrice(
    routeId: number, 
    passengers: number, 
    carType: "normal" | "licensed_tourism" = "normal"
  ): number {
    const vehicleCategory = getVehicleCategory(passengers);
    const routePrice = ROUTE_PRICES.find(
      r => r.routeId === routeId && 
           r.vehicleCategory === vehicleCategory && 
           r.carType === carType
    );
    
    return routePrice?.basePrice || 0;
  }

  static calculateGuidePrice(
    language: string, 
    cityId: number, 
    duration: number,
    isFullDay: boolean = false
  ): number {
    const guide = GUIDE_PRICES.find(
      g => g.language === language && g.cityId === cityId
    );
    
    if (!guide) return 0;
    
    if (isFullDay) {
      return guide.pricePerDay;
    } else {
      return guide.pricePerHour * duration;
    }
  }

  static calculateAddOnPrice(
    addOnId: number, 
    quantity: number, 
    passengers: number
  ): number {
    const addOn = ADDON_PRICES.find(a => a.id === addOnId);
    if (!addOn) return 0;

    switch (addOn.pricingType) {
      case "per_unit":
        return addOn.price * quantity;
      case "per_person":
        return addOn.price * quantity * passengers;
      case "per_trip":
        return addOn.price * quantity; // Per person already factored in base price
      default:
        return 0;
    }
  }

  static calculateCityTotal(cityService: CityService): number {
    let total = 0;

    // Calculate routes total
    cityService.selectedRoutes.forEach(routeId => {
      total += this.calculateRoutePrice(routeId, cityService.travelers);
    });

    // Calculate guide total
    if (cityService.selectedGuide) {
      total += this.calculateGuidePrice(
        cityService.selectedGuide.language,
        cityService.cityId,
        cityService.selectedGuide.duration
      );
    }

    // Calculate add-ons total
    cityService.selectedAddOns.forEach(addOn => {
      total += this.calculateAddOnPrice(
        addOn.id,
        addOn.quantity,
        cityService.travelers
      );
    });

    return total;
  }

  static calculateTotalPerPerson(cityServices: CityService[]): {
    totalAmount: number;
    perPersonAmount: number;
    breakdown: Array<{
      cityName: string;
      amount: number;
      details: {
        routes: number;
        guide: number;
        addOns: number;
      };
    }>;
  } {
    const breakdown = cityServices.map(cityService => {
      let routesTotal = 0;
      let guideTotal = 0;
      let addOnsTotal = 0;

      // Routes
      cityService.selectedRoutes.forEach(routeId => {
        routesTotal += this.calculateRoutePrice(routeId, cityService.travelers);
      });

      // Guide
      if (cityService.selectedGuide) {
        guideTotal = this.calculateGuidePrice(
          cityService.selectedGuide.language,
          cityService.cityId,
          cityService.selectedGuide.duration
        );
      }

      // Add-ons
      cityService.selectedAddOns.forEach(addOn => {
        addOnsTotal += this.calculateAddOnPrice(
          addOn.id,
          addOn.quantity,
          cityService.travelers
        );
      });

      const cityTotal = routesTotal + guideTotal + addOnsTotal;

      return {
        cityName: cityService.cityName,
        amount: cityTotal,
        details: {
          routes: routesTotal,
          guide: guideTotal,
          addOns: addOnsTotal,
        }
      };
    });

    const totalAmount = breakdown.reduce((sum, city) => sum + city.amount, 0);
    const perPersonAmount = cityServices.length > 0 && cityServices[0].travelers > 0 
      ? totalAmount / cityServices[0].travelers 
      : 0;

    return {
      totalAmount,
      perPersonAmount: Math.round(perPersonAmount * 100) / 100,
      breakdown
    };
  }

  // Get available routes for a city
  static getAvailableRoutes(cityId: number): Array<{
    id: number;
    name: string;
    type: string;
  }> {
    // Mock data - in real implementation this would come from database
    const routes = [
      { id: 1, name: "Airport to Hotel or Vice Versa", type: "airport", fromCityId: 1 },
      { id: 2, name: "Cairo to Alexandria Over Day", type: "inter-city", fromCityId: 1 },
      { id: 3, name: "Cairo to Alexandria Over Night", type: "inter-city", fromCityId: 1 },
      { id: 4, name: "Cairo to El Fayoum Over Day", type: "inter-city", fromCityId: 1 },
      { id: 5, name: "Cairo to El Fayoum Over Night", type: "inter-city", fromCityId: 1 },
      { id: 6, name: "Day Tour in Cairo 8 Hours", type: "intra-city", fromCityId: 1 },
      { id: 7, name: "Day Tour in Cairo 12 Hours", type: "intra-city", fromCityId: 1 },
    ];

    return routes
      .filter(r => r.fromCityId === cityId)
      .map(r => ({ id: r.id, name: r.name, type: r.type }));
  }

  // Get available languages for guides
  static getAvailableLanguages(): string[] {
    return ["English", "Spanish", "French", "German", "Italian", "Japanese", "Chinese", "Arabic"];
  }

  // Get available add-ons
  static getAvailableAddOns(): AddOnPrice[] {
    return ADDON_PRICES;
  }
}

export { RoutePrice, GuidePrice, AddOnPrice };