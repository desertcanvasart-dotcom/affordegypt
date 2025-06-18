import { storage } from "./storage";

export interface PricingBreakdown {
  routes: number;
  guide: number;
  attractions: number;
  addons: number;
  total: number;
  currency: "EGP";
}

export class PricingCalculator {
  /**
   * Calculate guide pricing using database rates only
   */
  static async calculateGuidePrice(cityId: number, language: string, hours: number = 8): Promise<number> {
    const guideRates = await storage.getGuideRates(cityId);
    const guideRate = guideRates.find(rate => rate.language.trim().toLowerCase() === language.trim().toLowerCase());
    
    if (!guideRate) {
      console.warn(`No guide rate found for ${language} in city ${cityId}`);
      return 0;
    }
    
    return parseFloat(guideRate.hourlyPrice) * hours;
  }

  /**
   * Calculate attraction pricing using database values only
   */
  static async calculateAttractionPrice(attractionIds: number[], travelers: number = 1): Promise<number> {
    let total = 0;
    
    for (const attractionId of attractionIds) {
      const attraction = await storage.getAttraction(attractionId);
      if (attraction) {
        total += parseFloat(attraction.ticketPrice) * travelers;
      }
    }
    
    return total;
  }

  /**
   * Calculate route pricing using database values only
   */
  static async calculateRoutePrice(routeId: number, vehicleTypeId: number): Promise<number> {
    const route = await storage.getRoute(routeId);
    if (!route || !route.basePriceByVehicle) {
      return 0;
    }

    const vehicleType = await storage.getVehicleType(vehicleTypeId);
    if (!vehicleType) {
      return 0;
    }

    const priceData = route.basePriceByVehicle as any;
    const vehicleKey = vehicleType.name.toLowerCase();
    
    return priceData[vehicleKey] || 0;
  }

  /**
   * Calculate addon pricing using database values only
   */
  static async calculateAddOnPrice(addOnIds: number[], travelers: number = 1): Promise<number> {
    let total = 0;
    
    for (const addOnId of addOnIds) {
      const addOn = await storage.getAddOn(addOnId);
      if (addOn) {
        const basePrice = parseFloat(addOn.price);
        if (addOn.unitType === "per_person") {
          total += basePrice * travelers;
        } else {
          total += basePrice;
        }
      }
    }
    
    return total;
  }

  /**
   * Calculate comprehensive pricing breakdown
   */
  static async calculateComprehensivePricing(params: {
    routeId?: number;
    vehicleTypeId?: number;
    cityId?: number;
    guideLanguage?: string;
    guideHours?: number;
    attractionIds?: number[];
    addOnIds?: number[];
    travelers?: number;
  }): Promise<PricingBreakdown> {
    const travelers = params.travelers || 1;
    
    // Calculate route pricing
    let routePrice = 0;
    if (params.routeId && params.vehicleTypeId) {
      routePrice = await this.calculateRoutePrice(params.routeId, params.vehicleTypeId);
    }

    // Calculate guide pricing
    let guidePrice = 0;
    if (params.cityId && params.guideLanguage) {
      guidePrice = await this.calculateGuidePrice(params.cityId, params.guideLanguage, params.guideHours);
    }

    // Calculate attraction pricing
    let attractionPrice = 0;
    if (params.attractionIds && params.attractionIds.length > 0) {
      attractionPrice = await this.calculateAttractionPrice(params.attractionIds, travelers);
    }

    // Calculate addon pricing
    let addonPrice = 0;
    if (params.addOnIds && params.addOnIds.length > 0) {
      addonPrice = await this.calculateAddOnPrice(params.addOnIds, travelers);
    }

    const total = routePrice + guidePrice + attractionPrice + addonPrice;

    return {
      routes: routePrice,
      guide: guidePrice,
      attractions: attractionPrice,
      addons: addonPrice,
      total,
      currency: "EGP"
    };
  }
}