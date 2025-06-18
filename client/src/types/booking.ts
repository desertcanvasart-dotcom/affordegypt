export interface BookingData {
  // Transportation
  fromCityId: number | null;
  toCityId: number | null;
  routeId: number | null;
  vehicleTypeId: number | null;
  transportType: "route_based" | "hour_based" | null;
  transportHours: number;
  passengerCount: number;
  
  // Location
  cityId: number | null;
  
  // Guide
  tourGuideId: number | null;
  guideType: "hourly" | "daily" | null;
  guideLanguage: string | null;
  guideDays: number;
  guideHours: number;
  
  // Attractions
  selectedAttractions: number[];
  
  // Add-ons
  selectedAddOns: Array<{
    id: number;
    quantity: number;
  }>;
  
  // Travelers
  travelers: number;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PricingData {
  subtotal: string;
  commissionRate: number;
  commission: string;
  taxes: string;
  total: string;
  commissionTier: string;
}
