import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertBookingSchema, insertQuoteSchema } from "@shared/schema";

// Stripe will be initialized later when keys are provided
let stripe: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Cities CRUD endpoints
  app.get("/api/cities", async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cities", async (req, res) => {
    try {
      const city = await storage.createCity(req.body);
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/cities/:id", async (req, res) => {
    try {
      const city = await storage.updateCity(parseInt(req.params.id), req.body);
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cities/:id", async (req, res) => {
    try {
      await storage.deleteCity(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add-ons CRUD endpoints
  app.get("/api/addons", async (req, res) => {
    try {
      const addOns = await storage.getAddOns();
      res.json(addOns);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/addons", async (req, res) => {
    try {
      const addOn = await storage.createAddOn(req.body);
      res.json(addOn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/addons/:id", async (req, res) => {
    try {
      const addOn = await storage.updateAddOn(parseInt(req.params.id), req.body);
      res.json(addOn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/addons/:id", async (req, res) => {
    try {
      await storage.deleteAddOn(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Attractions CRUD endpoints
  app.get("/api/attractions", async (req, res) => {
    try {
      const attractions = await storage.getAttractions();
      res.json(attractions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attractions", async (req, res) => {
    try {
      const attraction = await storage.createAttraction(req.body);
      res.json(attraction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/attractions/:id", async (req, res) => {
    try {
      const attraction = await storage.updateAttraction(parseInt(req.params.id), req.body);
      res.json(attraction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/attractions/:id", async (req, res) => {
    try {
      await storage.deleteAttraction(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Vehicle Types CRUD endpoints
  app.get("/api/vehicle-types", async (req, res) => {
    try {
      const vehicles = await storage.getVehicleTypes();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/vehicle-types", async (req, res) => {
    try {
      const vehicle = await storage.createVehicleType(req.body);
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/vehicle-types/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicleType(parseInt(req.params.id), req.body);
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/vehicle-types/:id", async (req, res) => {
    try {
      await storage.deleteVehicleType(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Guide Rates CRUD endpoints
  app.get("/api/guide-rates", async (req, res) => {
    try {
      const guides = await storage.getGuideRates();
      res.json(guides);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/guide-rates", async (req, res) => {
    try {
      const guide = await storage.createGuideRate(req.body);
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/guide-rates/:id", async (req, res) => {
    try {
      const guide = await storage.updateGuideRate(parseInt(req.params.id), req.body);
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/guide-rates/:id", async (req, res) => {
    try {
      await storage.deleteGuideRate(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
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

  // Multi-city pricing tool endpoints
  app.get("/api/pricing/routes", async (req, res) => {
    try {
      // Return all available routes from database
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error('Routes fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch routes' });
    }
  });

  app.get("/api/pricing/routes/:cityId", async (req, res) => {
    try {
      const { cityId } = req.params;
      
      // Available routes for each city based on your specification
      const routesByCity = {
        1: [ // Cairo
          { id: 1, name: "Airport to Hotel or Vice Versa", type: "airport" },
          { id: 2, name: "Cairo to Alexandria Over Day", type: "inter-city" },
          { id: 3, name: "Cairo to Alexandria Over Night", type: "inter-city" },
          { id: 4, name: "Cairo to El Fayoum Over Day", type: "inter-city" },
          { id: 5, name: "Cairo to El Fayoum Over Night", type: "inter-city" },
          { id: 6, name: "Day Tour in Cairo 8 Hours", type: "intra-city" },
          { id: 7, name: "Day Tour in Cairo 12 Hours", type: "intra-city" },
          { id: 8, name: "Sound & Light Show", type: "activity" }
        ],
        2: [ // Alexandria
          { id: 9, name: "Alexandria to Cairo Over Day", type: "inter-city" },
          { id: 10, name: "Alexandria City Tour", type: "intra-city" },
          { id: 11, name: "Airport Transfer Alexandria", type: "airport" }
        ],
        3: [ // Luxor
          { id: 12, name: "Luxor to Aswan Over Day", type: "inter-city" },
          { id: 13, name: "East Bank Tour", type: "intra-city" },
          { id: 14, name: "West Bank Tour", type: "intra-city" },
          { id: 15, name: "Airport Transfer Luxor", type: "airport" }
        ],
        4: [ // Aswan
          { id: 16, name: "Aswan to Abu Simbel", type: "inter-city" },
          { id: 17, name: "Aswan City Tour", type: "intra-city" },
          { id: 18, name: "Airport Transfer Aswan", type: "airport" }
        ]
      };

      const routes = routesByCity[parseInt(cityId)] || [];
      res.json(routes);
    } catch (error) {
      console.error('Routes fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch routes' });
    }
  });

  app.get("/api/pricing/languages", async (req, res) => {
    try {
      const languages = [
        "English", "Spanish", "French", "German", 
        "Italian", "Japanese", "Chinese", "Arabic"
      ];
      res.json(languages);
    } catch (error) {
      console.error('Languages fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch languages' });
    }
  });

  app.get("/api/pricing/addons", async (req, res) => {
    try {
      const addOns = [
        { id: 1, name: "Lunch", price: 15, type: "per_unit", category: "meals" },
        { id: 2, name: "Dinner", price: 20, type: "per_unit", category: "meals" },
        { id: 3, name: "Felucca Ride", price: 25, type: "per_unit", category: "activities" },
        { id: 4, name: "Horse Carriage", price: 20, type: "per_unit", category: "transport" },
        { id: 5, name: "Skip-the-line Entrance", price: 10, type: "per_person", category: "tickets" },
        { id: 6, name: "Seating Train Ticket", price: 45, type: "per_person", category: "transport" },
        { id: 7, name: "Sleeping Train Ticket", price: 85, type: "per_person", category: "transport" },
        { id: 8, name: "4-day Nile Cruise", price: 280, type: "per_trip", category: "cruise" },
        { id: 9, name: "5-day Nile Cruise", price: 350, type: "per_trip", category: "cruise" },
        { id: 10, name: "7-day Nile Cruise", price: 490, type: "per_trip", category: "cruise" }
      ];
      res.json(addOns);
    } catch (error) {
      console.error('Add-ons fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch add-ons' });
    }
  });

  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const { cityServices } = req.body;
      
      // Calculate pricing based on your specification
      let totalAmount = 0;
      const breakdown = [];

      for (const cityService of cityServices) {
        let cityTotal = 0;
        const travelers = cityService.travelers || 1;

        // Vehicle category based on passenger count
        const getVehiclePrice = (basePrice: number, passengers: number) => {
          if (passengers <= 2) return basePrice; // Sedan
          if (passengers <= 8) return basePrice * 1.6; // Minivan
          return basePrice * 2.4; // Van
        };

        // Calculate routes
        let routesTotal = 0;
        if (cityService.selectedRoutes) {
          cityService.selectedRoutes.forEach(routeId => {
            // Base prices for different route types
            const routePrices = {
              1: 50, 2: 120, 3: 150, 4: 90, 5: 110, 6: 80, 7: 120, 8: 40,
              9: 120, 10: 60, 11: 50, 12: 100, 13: 70, 14: 80, 15: 50,
              16: 180, 17: 60, 18: 50
            };
            const basePrice = routePrices[routeId] || 50;
            routesTotal += getVehiclePrice(basePrice, travelers);
          });
        }

        // Calculate guide pricing
        let guideTotal = 0;
        if (cityService.selectedGuide) {
          const guidePrices = {
            "English": 40, "Spanish": 45, "French": 45, "German": 50,
            "Italian": 45, "Japanese": 60, "Chinese": 55, "Arabic": 35
          };
          guideTotal = guidePrices[cityService.selectedGuide.language] || 40;
        }

        // Calculate attractions
        let attractionsTotal = 0;
        if (cityService.selectedAttractions) {
          // Define attraction prices per person based on city
          const attractionPrices = {
            "pyramids": 15, "khan_khalili": 8, "al_muizz": 5, "citadel": 12, 
            "coptic": 8, "egyptian_museum": 18, "cairo_tower": 10,
            "alexandria_library": 12, "qaitbay_citadel": 8, "montaza_palace": 10, "catacombs": 15,
            "luxor_temple": 12, "valley_kings": 20, "karnak_temple": 15, "hatshepsut_temple": 12,
            "abu_simbel": 35, "philae_temple": 15, "high_dam": 8, "unfinished_obelisk": 5,
            "hurghada_marina": 10, "desert_safari": 45, "snorkeling": 35,
            "sharm_old_market": 8, "ras_mohammed": 25, "colored_canyon": 30
          };
          
          cityService.selectedAttractions.forEach(attraction => {
            const price = attractionPrices[attraction] || 10; // Default $10 per person
            attractionsTotal += price * travelers;
          });
        }

        // Calculate add-ons
        let addOnsTotal = 0;
        if (cityService.selectedAddOns) {
          cityService.selectedAddOns.forEach(addOn => {
            const prices = { 1: 15, 2: 20, 3: 25, 4: 20, 5: 10, 6: 45, 7: 85, 8: 280, 9: 350, 10: 490 };
            const types = { 1: "unit", 2: "unit", 3: "unit", 4: "unit", 5: "person", 6: "person", 7: "person", 8: "trip", 9: "trip", 10: "trip" };
            
            const basePrice = prices[addOn.id] || 0;
            const pricingType = types[addOn.id] || "unit";
            
            if (pricingType === "person") {
              addOnsTotal += basePrice * addOn.quantity * travelers;
            } else {
              addOnsTotal += basePrice * addOn.quantity;
            }
          });
        }

        cityTotal = routesTotal + guideTotal + attractionsTotal + addOnsTotal;
        totalAmount += cityTotal;

        breakdown.push({
          cityName: cityService.cityName,
          amount: cityTotal,
          details: { routes: routesTotal, guide: guideTotal, attractions: attractionsTotal, addOns: addOnsTotal }
        });
      }

      const firstService = cityServices[0];
      const travelers = firstService?.travelers || 1;
      const perPersonAmount = Math.round((totalAmount / travelers) * 100) / 100;

      res.json({
        totalAmount,
        perPersonAmount,
        breakdown,
        travelers
      });
    } catch (error) {
      console.error('Pricing calculation error:', error);
      res.status(500).json({ message: 'Failed to calculate pricing' });
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

  // Create route
  app.post("/api/routes", async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.fromCityId || !req.body.toCityId) {
        console.error('Missing required fields:', { fromCityId: req.body.fromCityId, toCityId: req.body.toCityId });
        return res.status(400).json({ message: "fromCityId and toCityId are required" });
      }

      const routeData = {
        fromCityId: parseInt(req.body.fromCityId),
        toCityId: parseInt(req.body.toCityId),
        km: req.body.km || req.body.distance || "0",
        basePriceByVehicle: {
          sedan: req.body.sedanPrice || req.body.basePrice || 0,
          minivan: req.body.minivanPrice || (req.body.basePrice ? req.body.basePrice * 1.4 : 0),
          van: req.body.vanPrice || (req.body.basePrice ? req.body.basePrice * 1.8 : 0)
        }
      };

      console.log('Creating route with data:', routeData);
      const route = await storage.createRoute(routeData);
      res.json(route);
    } catch (error: any) {
      console.error('Route creation error:', error);
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  // Update route
  app.put("/api/routes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updatedRoute = await storage.updateRoute(parseInt(id), req.body);
      res.json(updatedRoute);
    } catch (error: any) {
      console.error('Route update error:', error);
      res.status(500).json({ message: "Failed to update route" });
    }
  });

  // Delete route
  app.delete("/api/routes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteRoute(parseInt(id));
      res.json({ message: "Route deleted successfully" });
    } catch (error: any) {
      console.error('Route deletion error:', error);
      res.status(500).json({ message: "Failed to delete route" });
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

  // Attractions CRUD operations
  app.get("/api/attractions", async (req, res) => {
    try {
      const { cityId } = req.query;
      let attractions;
      if (cityId) {
        attractions = await storage.getAttractions(parseInt(cityId as string));
      } else {
        attractions = await storage.getAttractions();
      }
      res.json(attractions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attraction = await storage.getAttraction(parseInt(id));
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/attractions", async (req, res) => {
    try {
      // Validate and clean the incoming data
      const attractionData = {
        cityId: parseInt(req.body.cityId),
        name: req.body.name,
        description: req.body.description || null,
        category: req.body.category || 'General',
        duration: parseInt(req.body.duration) || 2,
        ticketPrice: req.body.ticketPrice ? parseFloat(req.body.ticketPrice).toString() : "0",
        isActive: req.body.isActive !== false,
        image: req.body.image || null,
        coordinates: req.body.coordinates || null,
        bestTimeToVisit: req.body.bestTimeToVisit || null,
        capacity: req.body.capacity ? parseInt(req.body.capacity) : null
      };

      // Validate required fields
      if (!attractionData.name || !attractionData.cityId) {
        return res.status(400).json({ message: "Name and city are required" });
      }

      const attraction = await storage.createAttraction(attractionData);
      res.json(attraction);
    } catch (error: any) {
      console.error('Attraction creation error:', error);
      res.status(500).json({ message: "Failed to create attraction" });
    }
  });

  app.put("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attraction = await storage.updateAttraction(parseInt(id), req.body);
      res.json(attraction);
    } catch (error: any) {
      console.error('Attraction update error:', error);
      res.status(500).json({ message: "Failed to update attraction" });
    }
  });

  app.delete("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAttraction(parseInt(id));
      res.json({ message: "Attraction deleted successfully" });
    } catch (error: any) {
      console.error('Attraction deletion error:', error);
      res.status(500).json({ message: "Failed to delete attraction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
