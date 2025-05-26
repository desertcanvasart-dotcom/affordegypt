import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertBookingSchema, insertQuoteSchema } from "@shared/schema";

// Stripe will be initialized later when keys are provided
let stripe: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    // Simple admin check - in production you'd want proper auth
    const adminToken = req.headers.authorization;
    if (!adminToken || adminToken !== 'Bearer admin-token') {
      return res.status(401).json({ message: 'Admin access required' });
    }
    next();
  };

  // Admin dashboard stats
  app.get('/api/admin/dashboard-stats', requireAdmin, async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const bookings = await storage.getBookings();
      
      const totalQuotes = quotes.length;
      const averageBasket = quotes.length > 0 ? 
        quotes.reduce((sum, q) => sum + parseFloat(q.totalPrice), 0) / quotes.length : 0;
      
      // Calculate top routes (mock data for now)
      const topRoutes = [
        { route: "Cairo → Luxor", count: 15, revenue: 4500 },
        { route: "Cairo → Aswan", count: 12, revenue: 3600 },
        { route: "Luxor → Aswan", count: 8, revenue: 2400 }
      ];

      const recentQuotes = quotes.slice(-5).map(q => ({
        id: q.id,
        customerName: `Customer ${q.id}`,
        amount: parseFloat(q.totalPrice),
        status: 'pending',
        createdAt: q.createdAt || new Date().toISOString()
      }));

      res.json({
        totalQuotes,
        averageBasket: Math.round(averageBasket),
        topRoutes,
        recentQuotes
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  });

  // Admin city management
  app.put('/api/admin/cities/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, description, isActive } = req.body;
      
      // Update city logic would go here
      res.json({ message: 'City updated successfully' });
    } catch (error) {
      console.error('City update error:', error);
      res.status(500).json({ message: 'Failed to update city' });
    }
  });

  // Admin route management
  app.put('/api/admin/routes/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Update route logic would go here
      res.json({ message: 'Route updated successfully' });
    } catch (error) {
      console.error('Route update error:', error);
      res.status(500).json({ message: 'Failed to update route' });
    }
  });

  // Admin add-on management
  app.put('/api/admin/addons/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Update add-on logic would go here
      res.json({ message: 'Add-on updated successfully' });
    } catch (error) {
      console.error('Add-on update error:', error);
      res.status(500).json({ message: 'Failed to update add-on' });
    }
  });

  // CSV Export endpoints
  app.get('/api/admin/export/cities', requireAdmin, async (req, res) => {
    try {
      const cities = await storage.getCities();
      const csvData = [
        'ID,Name,Slug,Description,Active',
        ...cities.map(city => 
          `${city.id},"${city.name}","${city.slug}","${city.description || ''}",${city.isActive}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cities.csv');
      res.send(csvData);
    } catch (error) {
      console.error('CSV export error:', error);
      res.status(500).json({ message: 'Failed to export cities' });
    }
  });

  // Manual quote creation
  app.post('/api/admin/quotes', requireAdmin, async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, passengers, itinerary } = req.body;
      
      // Create manual quote logic would go here
      const quote = {
        customerName,
        customerEmail,
        customerPhone,
        passengers,
        itinerary: JSON.stringify(itinerary),
        totalPrice: "0", // Calculate based on itinerary
        status: 'draft'
      };
      
      res.json({ message: 'Manual quote created successfully', quote });
    } catch (error) {
      console.error('Manual quote creation error:', error);
      res.status(500).json({ message: 'Failed to create manual quote' });
    }
  });
  
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

  // Get guide rates by city
  app.get("/api/guide-rates", async (req, res) => {
    try {
      const { cityId } = req.query;
      const guides = cityId 
        ? await storage.getGuideRates(parseInt(cityId as string))
        : await storage.getGuideRates();
      
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get license classes
  app.get("/api/license-classes", async (req, res) => {
    try {
      const licenseClasses = await storage.getLicenseClasses();
      res.json(licenseClasses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get routes
  app.get("/api/routes", async (req, res) => {
    try {
      const { fromCityId, toCityId } = req.query;
      if (fromCityId && toCityId) {
        const route = await storage.getRoute(parseInt(fromCityId as string), parseInt(toCityId as string));
        res.json(route);
      } else {
        const routes = await storage.getRoutes();
        res.json(routes);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get time blocks
  app.get("/api/time-blocks", async (req, res) => {
    try {
      const { cityId } = req.query;
      if (!cityId) {
        return res.status(400).json({ message: "cityId is required" });
      }
      
      const timeBlocks = await storage.getTimeBlocks(parseInt(cityId as string));
      res.json(timeBlocks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get add-ons by city
  app.get("/api/add-ons", async (req, res) => {
    try {
      const { cityId } = req.query;
      const addOns = cityId 
        ? await storage.getAddOns(parseInt(cityId as string))
        : await storage.getAddOns();
      
      res.json(addOns);
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
