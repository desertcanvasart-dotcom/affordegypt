export interface BookingData {
  // Transportation
  fromCityId: number | null;
  toCityId: number | null;
  vehicleTypeId: number | null;
  transportType: "route_based" | "hour_based" | null;
  transportHours: number;
  passengerCount: number;
  
  // Guide
  tourGuideId: number | null;
  guideType: "hourly" | "daily" | null;
  guideDays: number;
  guideHours: number;
  
  // Add-ons
  selectedAddOns: Array<{
    id: number;
    quantity: number;
  }>;
  
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
