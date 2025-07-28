// Unified Route interface for consistent data structure across frontend components
export interface RouteData {
  id: number;
  name: string | null;
  tripType: string | null; // Converted from trip_type
  tripMode: string;
  routeCategory: string | null;
  fromCityId: number | null;
  toCityId: number | null;
  cityId: number | null;
  fromLocation: string | null;
  toLocation: string | null;
  km: string | null;
  distanceKm: number | null;
  estimatedDuration: string | null;
  routeHighlights: string | null;
  travelTips: string | null;
  pickupInstructions: string | null;
  dropoffInstructions: string | null;
  nights: number;
  displayOrder: number | null;
  
  // Pricing fields - normalized format
  basePriceByVehicle: any;
  vehiclePrices: any;
  sedanPrice: string;
  minivanPrice: string;
  vanPrice: string;
}

// City interface for consistency
export interface CityData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
}