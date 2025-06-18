import type { Express } from "express";
import { storage } from "./database-storage";

export async function registerPricingRoutes(app: Express): Promise<void> {
  // Transfer Only pricing calculation endpoint (used by pricing sidebar)
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { 
        routeId,
        vehicleTypeId, 
        cityId,
        guideLanguage,
        guideHours = 8,
        attractionIds = [],
        addOnIds = [],
        travelers = 1
      } = req.body;

      let totalPrice = 0;
      const breakdown = {
        routes: 0,
        guide: 0,
        attractions: 0,
        addons: 0
      };

      // Calculate route pricing (divided by travelers)
      if (routeId && vehicleTypeId) {
        const route = await storage.getRoute(routeId);
        if (route && route.basePriceByVehicle) {
          const vehicleType = await storage.getVehicleType(vehicleTypeId);
          if (vehicleType) {
            const priceData = route.basePriceByVehicle as any;
            const vehicleKey = vehicleType.name.toLowerCase();
            const routePrice = priceData[vehicleKey] || 0;
            breakdown.routes = routePrice / travelers; // Divide by travelers
            totalPrice += breakdown.routes;
          }
        }
      }

      // Calculate guide pricing (day-based, divided by travelers)
      if (cityId && guideLanguage) {
        console.log(`[/api/calculate-pricing] Looking for guide in city ${cityId}, language: "${guideLanguage}"`);
        const guideRates = await storage.getGuideRates(cityId);
        console.log(`[/api/calculate-pricing] Available guide rates:`, guideRates.map(r => ({ id: r.id, language: `"${r.language}"`, hourlyPrice: r.hourlyPrice })));
        
        const guideRate = guideRates.find(rate => rate.language.trim().toLowerCase() === guideLanguage.trim().toLowerCase());
        console.log(`[/api/calculate-pricing] Found guide rate:`, guideRate);
        
        if (guideRate) {
          const dailyRate = parseFloat(guideRate.hourlyPrice); // This is actually daily rate, not hourly
          breakdown.guide = dailyRate / travelers; // Divide by travelers
          totalPrice += breakdown.guide;
          console.log(`[/api/calculate-pricing] Guide calculation: ${dailyRate} EGP daily rate ÷ ${travelers} travelers = ${breakdown.guide} per person`);
        } else {
          console.log(`[/api/calculate-pricing] No guide rate found for language "${guideLanguage}"`);
        }
      }

      // Calculate attractions (direct database values - no calculations)
      if (attractionIds.length > 0) {
        for (const attractionId of attractionIds) {
          const attraction = await storage.getAttraction(attractionId);
          if (attraction) {
            breakdown.attractions += parseFloat(attraction.ticketPrice || "0");
          }
        }
        totalPrice += breakdown.attractions;
      }

      // Calculate add-ons (direct database values - no calculations)
      if (addOnIds.length > 0) {
        for (const addOnId of addOnIds) {
          const addOn = await storage.getAddOn(addOnId);
          if (addOn) {
            breakdown.addons += parseFloat(addOn.price || "0");
          }
        }
        totalPrice += breakdown.addons;
      }

      // Multiply by travelers to get the actual total cost for all guests
      const actualTotal = totalPrice * travelers;
      
      res.json({
        subtotal: actualTotal.toFixed(0),
        breakdown,
        total: actualTotal.toFixed(0),
        currency: "EGP"
      });
    } catch (error: any) {
      console.error('[/api/calculate-pricing] Error:', error);
      res.status(500).json({ message: error.message });
    }
  });
}