import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertBookingSchema, insertQuoteSchema } from "@shared/schema";
import { emailService } from "./email-service";
import { setupAuthRoutes } from "./auth-routes";
import { authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { registerPricingRoutes } from "./pricing-routes";
import { createTranslatedRoute } from "./translationMiddleware";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";

// Stripe will be initialized later when keys are provided
let stripe: any = null;

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Setup authentication routes
  setupAuthRoutes(app);

  // Cities CRUD endpoints
  app.get(
    "/api/cities",
    ...createTranslatedRoute(async (req, res) => {
      try {
        const cities = await storage.getCities();
        res.json(cities);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }, "cities"),
  );

  app.post("/api/cities", async (req, res) => {
    try {
      // Generate slug if not provided
      const slug =
        req.body.slug ||
        req.body.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-") // Replace multiple hyphens with single
          .trim("-"); // Remove leading/trailing hyphens

      // Check for existing city with same name or slug
      const existingCities = await storage.getCities();
      const nameExists = existingCities.some(
        (city) =>
          city.name.toLowerCase().trim() === req.body.name.toLowerCase().trim(),
      );
      const slugExists = existingCities.some((city) => city.slug === slug);

      if (nameExists) {
        return res.status(400).json({
          message: `A city with the name "${req.body.name}" already exists`,
        });
      }
      if (slugExists) {
        return res.status(400).json({
          message: `A city with this URL slug already exists. Try a different name.`,
        });
      }

      const cityData = { ...req.body, slug };
      const city = await storage.createCity(cityData);
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
  app.get(
    "/api/addons",
    ...createTranslatedRoute(async (req, res) => {
      try {
        const addOns = await storage.getAddOns();
        res.json(addOns);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }, "addOns"),
  );

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
      const addOn = await storage.updateAddOn(
        parseInt(req.params.id),
        req.body,
      );
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
  app.get(
    "/api/attractions",
    ...createTranslatedRoute(async (req, res) => {
      try {
        const attractions = await storage.getAttractions();
        res.json(attractions);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }, "attractions"),
  );

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
      const attraction = await storage.updateAttraction(
        parseInt(req.params.id),
        req.body,
      );
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
  app.get(
    "/api/vehicle-types",
    ...createTranslatedRoute(async (req, res) => {
      try {
        const vehicles = await storage.getVehicleTypes();
        res.json(vehicles);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }, "vehicleTypes"),
  );

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
      const vehicle = await storage.updateVehicleType(
        parseInt(req.params.id),
        req.body,
      );
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
      const guide = await storage.updateGuideRate(
        parseInt(req.params.id),
        req.body,
      );
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
    if (!adminToken || adminToken !== "Bearer admin-token") {
      return res.status(401).json({ message: "Admin access required" });
    }
    next();
  };

  // Admin dashboard stats
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      const bookings = await storage.getBookings();

      const totalQuotes = quotes.length;
      const averageBasket =
        quotes.length > 0
          ? quotes.reduce((sum, q) => sum + parseFloat(q.total), 0) /
            quotes.length
          : 0;

      // Calculate top routes (mock data for now)
      const topRoutes = [
        { route: "Cairo → Luxor", count: 15, revenue: 4500 },
        { route: "Cairo → Aswan", count: 12, revenue: 3600 },
        { route: "Luxor → Aswan", count: 8, revenue: 2400 },
      ];

      const recentQuotes = quotes.slice(-5).map((q) => ({
        id: q.id,
        customerName: `Customer ${q.id}`,
        amount: parseFloat(q.total),
        status: "pending",
        createdAt: q.createdAt || new Date().toISOString(),
      }));

      res.json({
        totalQuotes,
        averageBasket: Math.round(averageBasket),
        topRoutes,
        recentQuotes,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Admin city management
  app.put("/api/admin/cities/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, description, isActive } = req.body;

      // Update city logic would go here
      res.json({ message: "City updated successfully" });
    } catch (error) {
      console.error("City update error:", error);
      res.status(500).json({ message: "Failed to update city" });
    }
  });

  // Admin route management
  app.put("/api/admin/routes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Update route logic would go here
      res.json({ message: "Route updated successfully" });
    } catch (error) {
      console.error("Route update error:", error);
      res.status(500).json({ message: "Failed to update route" });
    }
  });

  // Admin add-on management
  app.put("/api/admin/addons/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Update add-on logic would go here
      res.json({ message: "Add-on updated successfully" });
    } catch (error) {
      console.error("Add-on update error:", error);
      res.status(500).json({ message: "Failed to update add-on" });
    }
  });

  // CSV Export endpoints
  app.get("/api/admin/export/cities", requireAdmin, async (req, res) => {
    try {
      const cities = await storage.getCities();
      const csvData = [
        "ID,Name,Slug,Description,Active",
        ...cities.map(
          (city) =>
            `${city.id},"${city.name}","${city.slug}","${city.description || ""}",${city.isActive}`,
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=cities.csv");
      res.send(csvData);
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ message: "Failed to export cities" });
    }
  });

  // Manual quote creation
  app.post("/api/admin/quotes", requireAdmin, async (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        passengers,
        itinerary,
      } = req.body;

      // Create manual quote logic would go here
      const quote = {
        customerName,
        customerEmail,
        customerPhone,
        passengers,
        itinerary: JSON.stringify(itinerary),
        totalPrice: "0", // Calculate based on itinerary
        status: "draft",
      };

      res.json({ message: "Manual quote created successfully", quote });
    } catch (error) {
      console.error("Manual quote creation error:", error);
      res.status(500).json({ message: "Failed to create manual quote" });
    }
  });

  // Multi-city pricing tool endpoints
  app.get("/api/pricing/routes", async (req, res) => {
    try {
      // Return all available routes from database
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Routes fetch error:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/pricing/routes/:cityId", async (req, res) => {
    try {
      const { cityId } = req.params;
      const cityIdNum = parseInt(cityId);

      // Get routes and cities from database
      const allRoutes = await storage.getRoutes();
      const cities = await storage.getCities();

      // Helper function to get city name by ID
      const getCityNameById = (id: number) => {
        const city = cities.find((c) => c.id === id);
        return city ? city.name : "Unknown";
      };

      // Filter routes for the specified city (either fromCityId or toCityId matches)
      const routes = allRoutes
        .filter(
          (route) =>
            route.fromCityId === cityIdNum || route.toCityId === cityIdNum,
        )
        .map((route) => {
          const fromCityName = getCityNameById(route.fromCityId || 0);
          const toCityName = getCityNameById(route.toCityId || 0);
          return {
            id: route.id,
            name: route.name || `${fromCityName} → ${toCityName}`,
            type:
              route.fromCityId === route.toCityId ? "intra-city" : "inter-city",
          };
        });

      res.json(routes);
    } catch (error) {
      console.error("Routes fetch error:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.get("/api/pricing/languages", async (req, res) => {
    try {
      const languages = [
        "English",
        "Spanish",
        "French",
        "German",
        "Italian",
        "Japanese",
        "Chinese",
        "Arabic",
      ];
      res.json(languages);
    } catch (error) {
      console.error("Languages fetch error:", error);
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get("/api/pricing/addons", async (req, res) => {
    try {
      const addOns = await storage.getAddOns();
      // Map database fields to expected frontend format
      const formattedAddOns = addOns.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: parseFloat(addon.price),
        type: addon.unitType, // Use the correct unitType from database
        category: addon.category,
      }));
      res.json(formattedAddOns);
    } catch (error) {
      console.error("Add-ons fetch error:", error);
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });

  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const { cityServices } = req.body;

      console.log("=== PRICING CALCULATION DEBUG ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      console.log("Number of city services:", cityServices?.length || 0);

      // Calculate pricing based on your specification
      let totalAmount = 0;
      const breakdown = [];

      for (const cityService of cityServices) {
        let cityTotal = 0;
        const travelers = cityService.travelers || 1;

        // Vehicle pricing is already handled by selecting the correct vehicle type in the database

        // Calculate routes using database pricing (MULTI-CITY TOUR: divided by travelers)
        let routesTotal = 0;
        if (
          cityService.selectedRoutes &&
          cityService.selectedRoutes.length > 0
        ) {
          for (const routeId of cityService.selectedRoutes) {
            try {
              // Get route from database
              const routes = await storage.getRoutes();
              const route = routes.find((r) => r.id === routeId);

              if (route && route.basePriceByVehicle) {
                // Parse the JSON pricing data
                const pricing =
                  typeof route.basePriceByVehicle === "string"
                    ? JSON.parse(route.basePriceByVehicle)
                    : route.basePriceByVehicle;

                // Determine vehicle type name based on passenger count
                let vehicleTypeName = "sedan"; // Default to sedan
                if (travelers > 8) vehicleTypeName = "van";
                else if (travelers > 2) vehicleTypeName = "minivan";

                // Get pricing for the appropriate vehicle type
                const routePrice = pricing[vehicleTypeName]
                  ? parseFloat(pricing[vehicleTypeName]) / travelers // Multi-city tour: divide by travelers
                  : 1500 / travelers; // Fallback price divided by travelers

                routesTotal += routePrice;
              } else {
                // Fallback pricing if route not found
                routesTotal += 3000 / travelers; // Default price divided by travelers
              }
            } catch (error) {
              console.error("Error calculating route price:", error);
              routesTotal += 3000 / travelers; // Fallback price divided by travelers
            }
          }
        }

        // Calculate guide pricing using database rates (day-based, shared cost divided by travelers)
        let guideTotal = 0;
        if (cityService.selectedGuide) {
          console.log(
            `Looking for guide in city ${cityService.cityId}, language: "${cityService.selectedGuide.language}"`,
          );
          const guideRates = await storage.getGuideRates(cityService.cityId);
          console.log(
            `Available guide rates:`,
            guideRates.map((r) => ({
              id: r.id,
              language: `"${r.language}"`,
              hourlyPrice: r.hourlyPrice,
            })),
          );

          const guideRate = guideRates.find(
            (rate) =>
              rate.language.trim().toLowerCase() ===
              cityService.selectedGuide.language.trim().toLowerCase(),
          );
          console.log(`Found guide rate:`, guideRate);

          if (guideRate) {
            const dailyRate = parseFloat(guideRate.hourlyPrice); // This is actually daily rate, not hourly
            guideTotal = dailyRate / travelers; // Per-person share of total guide cost
            console.log(
              `Guide calculation: ${dailyRate} EGP daily rate ÷ ${travelers} travelers = ${guideTotal} per person`,
            );
          } else {
            console.log(
              `No guide rate found for language "${cityService.selectedGuide.language}"`,
            );
          }
        }

        // Calculate attractions using database values (per person pricing)
        let attractionsTotal = 0;
        if (cityService.selectedAttractions) {
          for (const attractionItem of cityService.selectedAttractions) {
            try {
              // Handle both ID numbers and attraction names/objects
              let attractionId;
              if (typeof attractionItem === "number") {
                attractionId = attractionItem;
              } else if (typeof attractionItem === "string") {
                // If it's a string name, find the attraction by name
                const attractions = await storage.getAttractions();
                const attraction = attractions.find(
                  (a) => a.name === attractionItem,
                );
                attractionId = attraction ? attraction.id : null;
              } else if (attractionItem.id) {
                attractionId = attractionItem.id;
              }

              if (attractionId) {
                const attraction = await storage.getAttraction(attractionId);
                if (attraction) {
                  attractionsTotal += parseFloat(attraction.ticketPrice || "0"); // Per person price
                }
              }
            } catch (error) {
              console.error(
                "Error processing attraction:",
                attractionItem,
                error,
              );
            }
          }
        }

        // Calculate add-ons (per person pricing for Multi-City Tour)
        let addOnsTotal = 0;
        if (cityService.selectedAddOns) {
          for (const addOn of cityService.selectedAddOns) {
            const addOnItem = await storage.getAddOn(addOn.id);
            if (addOnItem) {
              const basePriceEGP = parseFloat(addOnItem.price); // Per person price
              addOnsTotal += basePriceEGP; // Per person
            }
          }
        }

        // Multi-city tour: all costs are per person, cityTotal is per person
        cityTotal = routesTotal + guideTotal + attractionsTotal + addOnsTotal;
        totalAmount += cityTotal; // cityTotal is already per person

        breakdown.push({
          city: cityService.cityName,
          routes: routesTotal,
          guide: guideTotal,
          attractions: attractionsTotal,
          addOns: addOnsTotal,
          total: cityTotal,
        });
      }

      const firstService = cityServices[0];
      const travelers = firstService?.travelers || 1;

      // For Multi-City Tour module: totalAmount is sum of per-person costs, so multiply by travelers for actual total
      const actualTotalAmount = Math.round(totalAmount * travelers);
      const perPersonAmount = Math.round(totalAmount);

      res.json({
        totalAmount: actualTotalAmount,
        perPersonAmount,
        travelers,
        breakdown,
      });
    } catch (error) {
      console.error("Pricing calculation error:", error);
      res.status(500).json({ message: "Failed to calculate pricing" });
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
  app.get(
    "/api/routes",
    ...createTranslatedRoute(async (req, res) => {
      try {
        const { fromCityId, toCityId } = req.query;
        if (fromCityId && toCityId) {
          const route = await storage.getRoute(
            parseInt(fromCityId as string),
            parseInt(toCityId as string),
          );
          res.json(route);
        } else {
          const routes = await storage.getRoutes();

          // Transform routes to normalize all data for frontend consistency
          const transformedRoutes = routes.map((route) => {
            let normalizedPricing = {};
            let sedanPrice = "0";
            let minivanPrice = "0";
            let vanPrice = "0";

            // Handle pricing from both old and new formats
            const pricingSource =
              route.vehiclePrices || route.basePriceByVehicle;
            if (pricingSource) {
              const pricing =
                typeof pricingSource === "string"
                  ? JSON.parse(pricingSource)
                  : pricingSource;

              // Check if it's the old format with string keys
              if (
                pricing.sedan !== undefined ||
                pricing.minivan !== undefined ||
                pricing.van !== undefined
              ) {
                sedanPrice = (pricing.sedan || 0).toString();
                minivanPrice = (pricing.minivan || 0).toString();
                vanPrice = (pricing.van || 0).toString();

                normalizedPricing = {
                  "1": { "1": sedanPrice },
                  "2": { "1": minivanPrice },
                  "3": { "1": vanPrice },
                };
              } else {
                // Already in new format or handle new format
                normalizedPricing = pricing;
                sedanPrice = pricing["1"]?.["1"] || "0";
                minivanPrice = pricing["2"]?.["1"] || "0";
                vanPrice = pricing["3"]?.["1"] || "0";
              }
            }

            // Comprehensive field transformation for frontend compatibility
            return {
              id: route.id,
              name: route.name,
              tripType: route.tripType, // Already in camelCase from database
              tripMode: route.tripMode || "transfer",
              routeCategory: route.routeCategory,
              fromCityId: route.fromCityId,
              toCityId: route.toCityId,
              cityId: route.cityId,
              fromLocation: route.fromLocation,
              toLocation: route.toLocation,
              km: route.km,
              distanceKm: route.distanceKm,
              estimatedDuration: route.estimatedDuration,
              routeHighlights: route.routeHighlights,
              travelTips: route.travelTips,
              pickupInstructions: route.pickupInstructions,
              dropoffInstructions: route.dropoffInstructions,
              nights: route.nights || 0,
              displayOrder: route.displayOrder || 0,

              // Pricing fields - normalized
              basePriceByVehicle: normalizedPricing,
              vehiclePrices: normalizedPricing,
              sedanPrice,
              minivanPrice,
              vanPrice,
            };
          });

          res.json(transformedRoutes);
        }
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }, "routes"),
  );

  // Create route
  app.post("/api/routes", async (req, res) => {
    try {
      console.log("=== ROUTE POST REQUEST BODY ===");
      console.log("Full request body:", JSON.stringify(req.body, null, 2));
      console.log("tripMode value:", req.body.tripMode);
      console.log("tripMode type:", typeof req.body.tripMode);

      // Validate required fields
      if (!req.body.fromCityId || !req.body.toCityId) {
        console.error("Missing required fields:", {
          fromCityId: req.body.fromCityId,
          toCityId: req.body.toCityId,
        });
        return res
          .status(400)
          .json({ message: "fromCityId and toCityId are required" });
      }

      const fromCityId = parseInt(req.body.fromCityId);
      const toCityId = parseInt(req.body.toCityId);

      console.log("=== ROUTE CREATION ATTEMPT ===");
      console.log("Request body keys:", Object.keys(req.body));
      console.log("tripMode in request:", req.body.tripMode);

      // Temporarily skip uniqueness check to allow route creation
      console.log("SKIPPING UNIQUENESS CHECK FOR DEBUGGING");

      // Prepare route data with new route category structure
      const routeData = {
        routeCategory: req.body.routeCategory || "inter_city",
        fromCityId:
          req.body.routeCategory === "inter_city"
            ? parseInt(req.body.fromCityId)
            : undefined,
        toCityId:
          req.body.routeCategory === "inter_city"
            ? parseInt(req.body.toCityId)
            : undefined,
        cityId:
          req.body.routeCategory === "intra_city"
            ? parseInt(req.body.cityId)
            : undefined,
        fromLocation: req.body.fromLocation || null,
        toLocation: req.body.toLocation || null,
        name: req.body.name || null,
        tripMode: req.body.tripMode || "transfer",
        nights: req.body.nights || 0,
        distanceKm: req.body.distanceKm
          ? parseInt(req.body.distanceKm)
          : undefined,
        km: req.body.distanceKm ? req.body.distanceKm.toString() : "0", // Legacy field compatibility
        estimatedDuration: req.body.estimatedDuration || null,
        routeHighlights: req.body.routeHighlights || null,
        travelTips: req.body.travelTips || null,
        pickupInstructions: req.body.pickupInstructions || null,
        dropoffInstructions: req.body.dropoffInstructions || null,
        displayOrder: req.body.displayOrder || 0,
        vehiclePrices: req.body.vehiclePrices || {
          sedan: req.body.sedanPrice || "0",
          minivan: req.body.minivanPrice || "0",
          van: req.body.vanPrice || "0",
        },
        basePriceByVehicle:
          req.body.basePriceByVehicle ||
          (() => {
            const prices = req.body.vehiclePrices || {
              sedan: req.body.sedanPrice || "0",
              minivan: req.body.minivanPrice || "0",
              van: req.body.vanPrice || "0",
            };
            return {
              "1": { "1": prices.sedan.toString() },
              "2": { "1": prices.minivan.toString() },
              "3": { "1": prices.van.toString() },
            };
          })(),
      };

      console.log("Creating route with data:", routeData);
      const route = await storage.createRoute(routeData);
      res.json(route);
    } catch (error: any) {
      console.error("Route creation error:", error);

      // Check for unique constraint violation on display_order per destination
      if (
        error.message &&
        (error.message.includes("unique_display_order_inter_city") ||
          error.message.includes("unique_display_order_intra_city"))
      ) {
        const destinationType =
          req.body.routeCategory === "inter_city" ? "departure city" : "city";
        return res.status(400).json({
          message: `Display order ${req.body.displayOrder} is already taken for this ${destinationType}. Please choose a different display order.`,
        });
      }

      res.status(500).json({ message: "Failed to create route" });
    }
  });

  // Update route
  app.put("/api/routes/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Prepare update data with proper pricing structure
      const updateData = {
        ...req.body,
        fromCityId: req.body.fromCityId
          ? parseInt(req.body.fromCityId)
          : undefined,
        toCityId: req.body.toCityId ? parseInt(req.body.toCityId) : undefined,
        displayOrder:
          req.body.displayOrder !== undefined
            ? parseInt(req.body.displayOrder)
            : undefined,
        // Synchronize km and distanceKm fields to fix frontend-backend data mismatch
        ...(req.body.km !== undefined && {
          km: req.body.km,
          distanceKm: parseInt(req.body.km) || 0
        }),
        ...(req.body.distanceKm !== undefined && {
          distanceKm: req.body.distanceKm,
          km: req.body.distanceKm.toString()
        }),
        // Handle vehiclePrices properly
        vehiclePrices:
          req.body.vehiclePrices ||
          (req.body.sedanPrice || req.body.minivanPrice || req.body.vanPrice
            ? {
                sedan: req.body.sedanPrice || "0",
                minivan: req.body.minivanPrice || "0",
                van: req.body.vanPrice || "0",
              }
            : undefined),
        // Ensure basePriceByVehicle is properly formatted if provided (legacy compatibility)
        basePriceByVehicle:
          req.body.basePriceByVehicle ||
          (req.body.sedanPrice || req.body.minivanPrice || req.body.vanPrice
            ? {
                "1": { "1": req.body.sedanPrice || "0" },
                "2": { "1": req.body.minivanPrice || "0" },
                "3": { "1": req.body.vanPrice || "0" },
              }
            : undefined),
      };

      // Remove undefined values to avoid overwriting existing data
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      console.log("Updating route with data:", updateData);
      const updatedRoute = await storage.updateRoute(parseInt(id), updateData);
      res.json(updatedRoute);
    } catch (error: any) {
      console.error("Route update error:", error);

      // Check for unique constraint violation on display_order per destination
      if (
        error.message &&
        (error.message.includes("unique_display_order_inter_city") ||
          error.message.includes("unique_display_order_intra_city"))
      ) {
        const destinationType =
          req.body.routeCategory === "inter_city" ? "departure city" : "city";
        return res.status(400).json({
          message: `Display order ${req.body.displayOrder} is already taken for this ${destinationType}. Please choose a different display order.`,
        });
      }

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
      console.error("Route deletion error:", error);
      res.status(500).json({ message: "Failed to delete route" });
    }
  });

  // CSV Import endpoint for bulk route upload
  app.post(
    "/api/routes/import-csv",
    upload.single("csvFile"),
    async (req, res) => {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const results: any[] = [];
      const errors: string[] = [];
      let successCount = 0;

      try {
        // Get all cities for name-to-ID mapping
        const cities = await storage.getCities();
        const cityMap = new Map(
          cities.map((city) => [city.name.toLowerCase(), city.id]),
        );

        // Parse CSV file
        await new Promise((resolve, reject) => {
          fs.createReadStream(req.file!.path)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", resolve)
            .on("error", reject);
        });

        // Process each row
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNum = i + 1;

          try {
            // Validate required fields
            const requiredFields = [
              "route_name",
              "from_city_name",
              "to_city_name",
              "distance_km",
              "trip_mode",
            ];
            for (const field of requiredFields) {
              if (!row[field] || row[field].trim() === "") {
                throw new Error(`Missing required field: ${field}`);
              }
            }

            // Map city names to IDs
            const fromCityId = cityMap.get(
              row.from_city_name.toLowerCase().trim(),
            );
            const toCityId = cityMap.get(row.to_city_name.toLowerCase().trim());

            if (!fromCityId) {
              throw new Error(`From city "${row.from_city_name}" not found`);
            }
            if (!toCityId) {
              throw new Error(`To city "${row.to_city_name}" not found`);
            }

            // Validate trip mode
            const validTripModes = [
              "transfer",
              "day_trip",
              "overnight",
              "multi_day",
            ];
            if (!validTripModes.includes(row.trip_mode)) {
              throw new Error(
                `Invalid trip mode: ${row.trip_mode}. Must be one of: ${validTripModes.join(", ")}`,
              );
            }

            // Calculate nights based on trip mode
            const nights =
              row.trip_mode === "overnight"
                ? 1
                : row.trip_mode === "multi_day"
                  ? 2
                  : 0;

            // Validate and parse prices
            const sedanPrice = parseFloat(row.sedan_price) || 0;
            const minivanPrice = parseFloat(row.minivan_price) || 0;
            const vanPrice = parseFloat(row.van_price) || 0;
            const coachPrice = parseFloat(row.coach_price) || 0;

            // Create route category (inter_city for different cities, intra_city for same city)
            const routeCategory =
              fromCityId === toCityId ? "intra_city" : "inter_city";

            // Prepare route data
            const routeData = {
              routeCategory,
              fromCityId:
                routeCategory === "inter_city" ? fromCityId : undefined,
              toCityId: routeCategory === "inter_city" ? toCityId : undefined,
              cityId: routeCategory === "intra_city" ? fromCityId : undefined,
              fromLocation: row.from_location?.trim() || null,
              toLocation: row.to_location?.trim() || null,
              name: row.route_name?.trim() || null,
              tripMode: row.trip_mode,
              nights,
              distanceKm: parseInt(row.distance_km) || 0,
              km: row.distance_km?.toString() || "0",
              estimatedDuration: row.estimated_duration?.trim() || null,
              routeHighlights: row.route_highlights?.trim() || null,
              travelTips: row.travel_tips?.trim() || null,
              pickupInstructions: row.pickup_instructions?.trim() || null,
              dropoffInstructions: row.dropoff_instructions?.trim() || null,
              displayOrder: parseInt(row.display_order) || 0,
              vehiclePrices: {
                sedan: sedanPrice.toString(),
                minivan: minivanPrice.toString(),
                van: vanPrice.toString(),
                coach: coachPrice.toString(),
              },
              basePriceByVehicle: {
                "1": { "1": sedanPrice.toString() },
                "2": { "1": minivanPrice.toString() },
                "3": { "1": vanPrice.toString() },
                "4": { "1": coachPrice.toString() },
              },
            };

            // Create the route
            await storage.createRoute(routeData);
            successCount++;
          } catch (error: any) {
            errors.push(`Row ${rowNum}: ${error.message}`);
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return results
        res.json({
          success: true,
          message: `Successfully imported ${successCount} routes`,
          totalRows: results.length,
          successCount,
          errorCount: errors.length,
          errors: errors.slice(0, 10), // Limit to first 10 errors
        });
      } catch (error: any) {
        // Clean up uploaded file on error
        if (req.file?.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        console.error("CSV import error:", error);
        res.status(500).json({ message: `Import failed: ${error.message}` });
      }
    },
  );

  // Get time blocks
  app.get("/api/time-blocks", async (req, res) => {
    try {
      const { cityId } = req.query;
      if (!cityId) {
        return res.status(400).json({ message: "cityId is required" });
      }

      const timeBlocks = await storage.getTimeBlocks(
        parseInt(cityId as string),
      );
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

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Generate booking reference if not provided
      const bookingReference =
        req.body.bookingReference || storage.generateBookingReference();

      // Create quote first if itinerary data is provided
      let quoteId = req.body.quoteId;
      if (!quoteId && req.body.itinerary) {
        const quoteData = {
          jsonBlob: {
            itinerary: req.body.itinerary,
            travelers: req.body.travelers || 1,
            travelDate: req.body.travelDate,
          },
          total: req.body.totalAmount || "0",
          commissionPct: "0.15",
        };
        const quote = await storage.createQuote(quoteData);
        quoteId = quote.id;
      }

      // Prepare booking data with required fields
      const bookingData = {
        ...req.body,
        bookingReference,
        totalAmount: req.body.totalAmount || "0",
        quoteId: quoteId,
        startDate: req.body.travelDate ? new Date(req.body.travelDate) : null,
        paymentStatus: "pending",
        bookingStatus: "confirmed",
      };

      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);

      // Send confirmation email
      try {
        if (booking.quoteId) {
          const quote = await storage.getQuote(booking.quoteId);
          if (quote) {
            const emailSent = await emailService.sendBookingConfirmation(
              booking,
              quote,
            );
            if (emailSent) {
              console.log(
                `Confirmation email sent for booking ${booking.bookingReference}`,
              );
              // Mark email as sent in the database
              await storage.markEmailSent(booking.id, "confirmation");
            } else {
              console.log(
                `Failed to send confirmation email for booking ${booking.bookingReference}`,
              );
            }
          }
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the booking creation if email fails
      }

      res.json(booking);
    } catch (error: any) {
      console.error("Booking creation error:", error);
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

  // Get booking by reference (public endpoint)
  app.get("/api/bookings/reference/:reference", async (req, res) => {
    try {
      const booking = await storage.getBookingByReference(req.params.reference);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Get associated quote data
      let quote = null;
      if (booking.quoteId) {
        quote = await storage.getQuote(booking.quoteId);
      }

      res.json({
        booking,
        quote: quote
          ? {
              id: quote.id,
              jsonBlob: quote.jsonBlob,
              total: quote.total,
              commissionPct: quote.commissionPct,
            }
          : null,
      });
    } catch (error: any) {
      console.error("Booking reference lookup error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all bookings (admin endpoint)
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();

      // Get quote data for each booking that has a quoteId
      const bookingsWithQuotes = await Promise.all(
        bookings.map(async (booking) => {
          if (booking.quoteId) {
            const quote = await storage.getQuote(booking.quoteId);
            return {
              ...booking,
              quote: quote
                ? {
                    id: quote.id,
                    jsonBlob: quote.jsonBlob,
                    total: quote.total,
                    commissionPct: quote.commissionPct,
                  }
                : null,
            };
          }
          return {
            ...booking,
            quote: null,
          };
        }),
      );

      res.json(bookingsWithQuotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete booking endpoint (admin only)
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);

      // Get booking to verify it exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Delete the booking
      await storage.deleteBooking(bookingId);

      res.json({ message: "Booking deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Route-only booking endpoint (transportation only)
  app.post("/api/route-bookings", async (req, res) => {
    try {
      const {
        routeId,
        vehicleType,
        passengers,
        travelDate,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalAmount,
        bookingType,
      } = req.body;

      // Validate required fields
      if (
        !routeId ||
        !vehicleType ||
        !passengers ||
        !customerName ||
        !customerEmail ||
        !totalAmount
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required booking information",
        });
      }

      // Generate unique booking reference
      const bookingReference =
        `RT${Date.now()}${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

      // Create simplified booking data for route-only bookings
      const routeBookingData = {
        bookingReference,
        quoteId: null, // No quote needed for simple route bookings
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        totalAmount: totalAmount.toString(),
        status: "pending",
        bookingType: "route-only",
        routeDetails: {
          routeId,
          vehicleType,
          passengers,
          travelDate,
          specialRequests: specialRequests || null,
        },
      };

      const booking = await storage.createBooking(routeBookingData);

      // Send confirmation email
      try {
        // Create a mock quote for email purposes
        const mockQuote = {
          id: 0,
          createdAt: null,
          jsonBlob: routeBookingData.routeDetails,
          total: totalAmount.toString(),
          commissionPct: "0",
        } as any;

        const emailSent = await emailService.sendBookingConfirmation(
          booking,
          mockQuote,
        );

        if (emailSent) {
          console.log(
            `Confirmation email sent for booking ${bookingReference}`,
          );
          // Mark email as sent in the database
          await storage.markEmailSent(booking.id, "confirmation");
        } else {
          console.log(
            `Failed to send confirmation email for booking ${bookingReference}`,
          );
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      res.json({
        success: true,
        bookingReference,
        booking,
        message:
          "Route booking submitted successfully. We'll contact you to confirm details.",
      });
    } catch (error: any) {
      console.error("Route booking error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process route booking. Please try again.",
      });
    }
  });

  // Stripe payment route for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({
        message: "Payment processing not configured. Please contact support.",
      });
    }

    try {
      const { amount, bookingId } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || "",
        },
      });

      // Update booking with payment intent ID
      if (bookingId) {
        await storage.updateBookingPaymentStatus(
          bookingId,
          "processing",
          paymentIntent.id,
        );
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({
        message: "Error creating payment intent: " + error.message,
      });
    }
  });

  // Webhook to handle payment confirmation
  app.post("/api/stripe-webhook", async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          const bookingId = paymentIntent.metadata.bookingId;

          if (bookingId) {
            await storage.updateBookingPaymentStatus(
              parseInt(bookingId),
              "paid",
              paymentIntent.id,
            );
          }
          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          const failedBookingId = failedPayment.metadata.bookingId;

          if (failedBookingId) {
            await storage.updateBookingPaymentStatus(
              parseInt(failedBookingId),
              "failed",
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
        category: req.body.category || "General",
        duration: parseInt(req.body.duration) || 2,
        ticketPrice: req.body.ticketPrice
          ? parseFloat(req.body.ticketPrice).toString()
          : "0",
        isActive: req.body.isActive !== false,
        image: req.body.image || null,
        coordinates: req.body.coordinates || null,
        bestTimeToVisit: req.body.bestTimeToVisit || null,
        capacity: req.body.capacity ? parseInt(req.body.capacity) : null,
      };

      // Validate required fields
      if (!attractionData.name || !attractionData.cityId) {
        return res.status(400).json({ message: "Name and city are required" });
      }

      const attraction = await storage.createAttraction(attractionData);
      res.json(attraction);
    } catch (error: any) {
      console.error("Attraction creation error:", error);
      res.status(500).json({ message: "Failed to create attraction" });
    }
  });

  app.put("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attraction = await storage.updateAttraction(parseInt(id), req.body);
      res.json(attraction);
    } catch (error: any) {
      console.error("Attraction update error:", error);
      res.status(500).json({ message: "Failed to update attraction" });
    }
  });

  app.delete("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAttraction(parseInt(id));
      res.json({ message: "Attraction deleted successfully" });
    } catch (error: any) {
      console.error("Attraction deletion error:", error);
      res.status(500).json({ message: "Failed to delete attraction" });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getActiveReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/all", async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching all reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = {
        ...req.body,
        tripDate: req.body.tripDate ? new Date(req.body.tripDate) : null,
      };
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewData = {
        ...req.body,
        tripDate: req.body.tripDate ? new Date(req.body.tripDate) : null,
      };
      const review = await storage.updateReview(id, reviewData);
      res.json(review);
    } catch (error: any) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.patch("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const review = await storage.updateReview(id, updateData);
      res.json(review);
    } catch (error: any) {
      console.error("Error patching review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.json({ message: "Review deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Quotes API endpoints
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);

      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = {
        total: req.body.total,
        commissionPct: req.body.commissionPct || "0",
        jsonBlob: JSON.stringify(req.body.jsonBlob),
        name: req.body.name || null,
      };

      const quote = await storage.createQuote(quoteData);
      res.json(quote);
    } catch (error: any) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuote(id);
      res.json({ message: "Quote deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Register pricing routes for Transfer Only pricing endpoint
  await registerPricingRoutes(app);

  // Email notification endpoints
  app.post("/api/bookings/:id/send-confirmation", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.quoteId === null) {
        return res
          .status(400)
          .json({ message: "Booking has no associated quote" });
      }

      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const emailSent = await emailService.sendBookingConfirmation(
        booking,
        quote,
      );
      if (emailSent) {
        await storage.markEmailSent(booking.id, "confirmation");
        res.json({ message: "Confirmation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send confirmation email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookings/:id/send-reminder", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.quoteId === null) {
        return res
          .status(400)
          .json({ message: "Booking has no associated quote" });
      }

      const quote = await storage.getQuote(booking.quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      const emailSent = await emailService.sendBookingReminder(booking, quote);
      if (emailSent) {
        await storage.markEmailSent(booking.id, "reminder");
        res.json({ message: "Reminder email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reminder email" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
