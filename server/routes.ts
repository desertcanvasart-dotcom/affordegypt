import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";

// Stripe will be initialized later when keys are provided
let stripe: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all cities
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get vehicle types
  app.get("/api/vehicle-types", async (req, res) => {
    try {
      const vehicleTypes = await storage.getVehicleTypes();
      res.json(vehicleTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get tour guides by city
  app.get("/api/tour-guides", async (req, res) => {
    try {
      const { cityId } = req.query;
      let guides;
      
      if (cityId) {
        guides = await storage.getTourGuidesByCity(parseInt(cityId as string));
      } else {
        guides = await storage.getTourGuides();
      }
      
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get add-ons by city
  app.get("/api/add-ons", async (req, res) => {
    try {
      const { citySlug } = req.query;
      let addOns;
      
      if (citySlug) {
        addOns = await storage.getAddOnsByCity(citySlug as string);
      } else {
        addOns = await storage.getAddOns();
      }
      
      res.json(addOns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get commission tiers
  app.get("/api/commission-tiers", async (req, res) => {
    try {
      const tiers = await storage.getCommissionTiers();
      res.json(tiers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calculate pricing
  app.post("/api/calculate-pricing", async (req, res) => {
    try {
      const { 
        vehicleTypeId, 
        transportType, 
        transportHours = 1,
        tourGuideId, 
        guideType, 
        guideDays = 0, 
        guideHours = 0,
        selectedAddOns = [],
        passengerCount = 1
      } = req.body;

      let subtotal = 0;

      // Calculate transportation cost
      if (vehicleTypeId) {
        const vehicle = await storage.getVehicleType(vehicleTypeId);
        if (vehicle) {
          if (transportType === "route_based") {
            subtotal += parseFloat(vehicle.basePrice);
          } else if (transportType === "hour_based" && vehicle.pricePerHour) {
            subtotal += parseFloat(vehicle.pricePerHour) * transportHours;
          }
        }
      }

      // Calculate guide cost
      if (tourGuideId) {
        const guide = await storage.getTourGuide(tourGuideId);
        if (guide) {
          if (guideType === "daily") {
            subtotal += parseFloat(guide.dailyRate) * guideDays;
          } else if (guideType === "hourly") {
            subtotal += parseFloat(guide.hourlyRate) * guideHours;
          }
        }
      }

      // Calculate add-ons cost
      for (const addon of selectedAddOns) {
        const addOnItem = await storage.getAddOn(addon.id);
        if (addOnItem) {
          const price = parseFloat(addOnItem.price);
          if (addOnItem.priceUnit === "per_person") {
            subtotal += price * addon.quantity * passengerCount;
          } else {
            subtotal += price * addon.quantity;
          }
        }
      }

      // Get commission tier
      const commissionTier = await storage.getCommissionTier(subtotal);
      const commissionRate = commissionTier ? parseFloat(commissionTier.commissionRate) : 0.10;
      const commission = subtotal * commissionRate;
      
      // Calculate taxes (5%)
      const taxes = subtotal * 0.05;
      
      const total = subtotal + commission + taxes;

      res.json({
        subtotal: subtotal.toFixed(2),
        commissionRate: commissionRate,
        commission: commission.toFixed(2),
        taxes: taxes.toFixed(2),
        total: total.toFixed(2),
        commissionTier: commissionTier?.name || "Budget Tier"
      });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get booking
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ 
        message: "Payment processing not configured. Please contact support." 
      });
    }
    
    try {
      const { amount, bookingId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || ""
        }
      });

      // Update booking with payment intent ID
      if (bookingId) {
        await storage.updateBookingPaymentStatus(
          bookingId, 
          "processing", 
          paymentIntent.id
        );
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Webhook to handle payment confirmation
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const bookingId = paymentIntent.metadata.bookingId;
          
          if (bookingId) {
            await storage.updateBookingPaymentStatus(
              parseInt(bookingId), 
              "paid", 
              paymentIntent.id
            );
          }
          break;
        
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          const failedBookingId = failedPayment.metadata.bookingId;
          
          if (failedBookingId) {
            await storage.updateBookingPaymentStatus(
              parseInt(failedBookingId), 
              "failed"
            );
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
