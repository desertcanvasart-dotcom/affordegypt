import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { insertBookingSchema, insertQuoteSchema } from "@shared/schema";
import { emailService } from "./email-service";
import { setupAuthRoutes } from "./auth-routes";
import { authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { registerPricingRoutes } from "./pricing-routes";
import { registerAdminCatalogRoutes } from "./admin-catalog-routes";
import { registerPublicCatalogRoutes } from "./public-catalog-routes";
import { registerReviewRoutes } from "./routes/reviews";
import { adminAuth } from "./routes/shared";
import { validateBody } from "./middleware/validate";
import {
  bookingRequestSchema,
  quoteRequestSchema,
  routeBookingRequestSchema,
} from "./request-schemas";
import {
  buildQuoteFromRequest,
  persistFrozenQuote,
  getFrozenLineItems,
} from "./services/quote-builder";
import {
  pricingService,
  pickVehicleSlugForPassengers,
  RoutePriceNotSetError,
  ServicePriceNotSetError,
  isVehicleSlug,
  isTripType,
  isCatalogTripType,
  type VehicleSlug,
  type TripType,
  type CatalogTripType,
} from "./services/pricing";
import type { CatalogServiceRequest } from "./services/quote-builder";
import { createTranslatedRoute } from "./translationMiddleware";
import { setupPasswordResetRoutes } from "./password-reset-routes";
import { setupEmailVerificationRoutes } from "./email-verification-routes";
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

// Parse and validate req.body.serviceSlugs from quote/booking endpoints.
// Accepts an array of `{ slug, vehicleSlug, tripType }` and silently
// drops malformed entries — bad shapes shouldn't 500 a legacy request
// that doesn't carry catalog selections at all. Returns undefined when
// the field is absent/empty so downstream sees the same "no catalog"
// state as a pre-Phase-C client.
function parseServiceSlugs(raw: unknown): CatalogServiceRequest[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const out: CatalogServiceRequest[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { slug, vehicleSlug, tripType } = item as Record<string, unknown>;
    if (typeof slug !== "string" || !slug) continue;
    if (!isVehicleSlug(vehicleSlug)) continue;
    if (!isCatalogTripType(tripType)) continue;
    out.push({ slug, vehicleSlug, tripType });
  }
  return out.length > 0 ? out : undefined;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // adminAuth ([authenticateToken, requireAdmin]) is imported from
  // ./routes/shared so the split route modules share one definition.

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Setup authentication routes
  setupAuthRoutes(app);
  
  // Setup password reset routes
  setupPasswordResetRoutes(app);
  
  // Setup email verification routes
  setupEmailVerificationRoutes(app);

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

  app.post("/api/cities", ...adminAuth, async (req, res) => {
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

  app.put("/api/cities/:id", ...adminAuth, async (req, res) => {
    try {
      const city = await storage.updateCity(parseInt(req.params.id), req.body);
      res.json(city);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cities/:id", ...adminAuth, async (req, res) => {
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

  app.post("/api/addons", ...adminAuth, async (req, res) => {
    try {
      const addOn = await storage.createAddOn(req.body);
      res.json(addOn);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/addons/:id", ...adminAuth, async (req, res) => {
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

  app.delete("/api/addons/:id", ...adminAuth, async (req, res) => {
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

  app.post("/api/attractions", ...adminAuth, async (req, res) => {
    try {
      const attraction = await storage.createAttraction(req.body);
      res.json(attraction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/attractions/:id", ...adminAuth, async (req, res) => {
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

  app.delete("/api/attractions/:id", ...adminAuth, async (req, res) => {
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

  app.post("/api/vehicle-types", ...adminAuth, async (req, res) => {
    try {
      const vehicle = await storage.createVehicleType(req.body);
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/vehicle-types/:id", ...adminAuth, async (req, res) => {
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

  app.delete("/api/vehicle-types/:id", ...adminAuth, async (req, res) => {
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

  app.post("/api/guide-rates", ...adminAuth, async (req, res) => {
    try {
      const guide = await storage.createGuideRate(req.body);
      res.json(guide);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/guide-rates/:id", ...adminAuth, async (req, res) => {
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

  app.delete("/api/guide-rates/:id", ...adminAuth, async (req, res) => {
    try {
      await storage.deleteGuideRate(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  // adminAuth is declared at the top of registerRoutes.

  // Admin dashboard stats
  app.get("/api/admin/dashboard-stats", ...adminAuth, async (req, res) => {
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
  app.put("/api/admin/cities/:id", ...adminAuth, async (req, res) => {
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
  app.put("/api/admin/routes/:id", ...adminAuth, async (req, res) => {
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
  app.put("/api/admin/addons/:id", ...adminAuth, async (req, res) => {
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
  app.get("/api/admin/export/cities", ...adminAuth, async (req, res) => {
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
  app.post("/api/admin/quotes", ...adminAuth, async (req, res) => {
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

  // Multi-city pricing. All math goes through PricingService so this stays
  // consistent with /api/calculate-pricing and /api/quotes. Routes pick a
  // vehicle type by passenger count (sedan ≤2, minivan ≤8, van otherwise);
  // guide/add-on/attraction lookups go to their canonical service methods.
  app.post("/api/pricing/calculate", async (req, res) => {
    try {
      const { cityServices } = req.body;
      if (!Array.isArray(cityServices) || cityServices.length === 0) {
        return res.status(400).json({ message: "cityServices required" });
      }

      const round2 = (n: number) => Math.round(n * 100) / 100;
      let perPersonTotal = 0;
      const breakdown = [];

      for (const cityService of cityServices) {
        const travelers = Math.max(1, Math.floor(cityService.travelers || 1));

        // Phase C: catalog services replace the legacy selectedRoutes
        // path. Each entry carries its own vehicleSlug + tripType chosen
        // in the picker, so we look up the price directly from
        // service_catalog.vehicle_prices via pricingService.
        // The breakdown field name stays `routes` for client compat.
        let routesTotal = 0;
        for (const sel of cityService.selectedServices ?? []) {
          if (!sel || typeof sel.slug !== "string") continue;
          if (!isVehicleSlug(sel.vehicleSlug)) continue;
          if (!isCatalogTripType(sel.tripType)) continue;
          const price = await pricingService.getServicePrice(
            sel.slug,
            sel.vehicleSlug,
            sel.tripType,
          );
          // Defensive zero: unpriced rows contribute nothing rather than
          // crashing the breakdown. Picker excludes unpriced rows.
          if (price !== null) routesTotal += price / travelers;
        }

        let guideTotal = 0;
        if (cityService.selectedGuide?.language && cityService.cityId) {
          const daily = await pricingService.getGuideDailyRate(
            cityService.cityId,
            cityService.selectedGuide.language,
          );
          guideTotal = daily / travelers;
        }

        let attractionsTotal = 0;
        for (const item of cityService.selectedAttractions ?? []) {
          let attractionId: number | null = null;
          if (typeof item === "number") attractionId = item;
          else if (item && typeof item === "object" && typeof item.id === "number") attractionId = item.id;
          else if (typeof item === "string") {
            const all = await storage.getAttractions();
            attractionId = all.find((a) => a.name === item)?.id ?? null;
          }
          if (attractionId) {
            attractionsTotal += await pricingService.getAttractionPrice(attractionId, 1);
          }
        }

        let addOnsTotal = 0;
        for (const ao of cityService.selectedAddOns ?? []) {
          const id = typeof ao === "number" ? ao : ao?.id;
          const qty = typeof ao === "number" ? 1 : Math.max(1, Math.floor(ao?.quantity ?? 1));
          if (typeof id === "number") {
            addOnsTotal += await pricingService.getAddOnPrice(id, qty, 1);
          }
        }

        const cityPerPerson = round2(routesTotal + guideTotal + attractionsTotal + addOnsTotal);
        perPersonTotal += cityPerPerson;

        breakdown.push({
          city: cityService.cityName,
          routes: round2(routesTotal),
          guide: round2(guideTotal),
          attractions: round2(attractionsTotal),
          addOns: round2(addOnsTotal),
          total: cityPerPerson,
        });
      }

      const travelers = Math.max(1, Math.floor(cityServices[0]?.travelers || 1));
      res.json({
        totalAmount: round2(perPersonTotal * travelers),
        perPersonAmount: round2(perPersonTotal),
        travelers,
        breakdown,
        currency: "EGP",
      });
    } catch (error: any) {
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

          // Transform routes to normalize all data for frontend consistency.
          // Pure lookup against vehicle_prices (flat ${slug}_${tripType}
          // keys). The normalized *Price fields surface the one-way price —
          // that's what the legacy /transfers wizard reads. Other trip
          // types are exposed via vehiclePrices passthrough.
          const transformedRoutes = routes.map((route) => {
            let sedanPrice = "";
            let minivanPrice = "";
            let vanPrice = "";

            if (route.vehiclePrices) {
              const vp = typeof route.vehiclePrices === "string"
                ? JSON.parse(route.vehiclePrices)
                : (route.vehiclePrices as Record<string, unknown>);

              const pick = (k: string): string => {
                const v = vp?.[k];
                return v !== undefined && v !== null && v !== "" ? String(v) : "";
              };
              sedanPrice = pick("sedan_one_way");
              minivanPrice = pick("minivan_one_way");
              vanPrice = pick("van_one_way");
            }

            return {
              id: route.id,
              name: route.name,
              tripType: route.tripType,
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

              // Keep original pricing formats for compatibility
              basePriceByVehicle: route.basePriceByVehicle,
              vehiclePrices: route.vehiclePrices,
              
              // Normalized prices for easy frontend access
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
  app.post("/api/routes", ...adminAuth, async (req, res) => {
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
  app.put("/api/routes/:id", ...adminAuth, async (req, res) => {
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
      };

      // Handle pricing updates - ensure both fields are synchronized
      if (req.body.basePriceByVehicle || req.body.sedanPrice || req.body.minivanPrice || req.body.vanPrice) {
        let sedanPrice, minivanPrice, vanPrice;
        
        if (req.body.basePriceByVehicle) {
          // Extract prices from basePriceByVehicle format
          sedanPrice = req.body.basePriceByVehicle["1"]?.["1"] || "0";
          minivanPrice = req.body.basePriceByVehicle["2"]?.["1"] || "0";
          vanPrice = req.body.basePriceByVehicle["3"]?.["1"] || "0";
        } else {
          // Use individual price fields
          sedanPrice = req.body.sedanPrice || "0";
          minivanPrice = req.body.minivanPrice || "0";
          vanPrice = req.body.vanPrice || "0";
        }

        // Set both pricing formats to ensure consistency
        updateData.vehiclePrices = {
          sedan: parseFloat(sedanPrice),
          minivan: parseFloat(minivanPrice),
          van: parseFloat(vanPrice),
        };
        
        updateData.basePriceByVehicle = {
          "1": { "1": sedanPrice.toString() },
          "2": { "1": minivanPrice.toString() },
          "3": { "1": vanPrice.toString() },
        };
      }

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
  app.delete("/api/routes/:id", ...adminAuth, async (req, res) => {
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
  app.post("/api/bookings", validateBody(bookingRequestSchema), async (req, res) => {
    try {
      // Generate booking reference if not provided
      const bookingReference =
        req.body.bookingReference || storage.generateBookingReference();

      // Server-side pricing: ignore client-supplied totalAmount and recompute
      // from the same fields the live preview uses. Persisting the quote
      // freezes the line items so this booking's total can never silently
      // change later.
      let quoteId = req.body.quoteId;
      let serverTotal: string | null = null;

      if (!quoteId) {
        const built = await buildQuoteFromRequest({
          routeId: req.body.routeId ?? null,
          vehicleSlug: isVehicleSlug(req.body.vehicleSlug) ? req.body.vehicleSlug : null,
          tripType: isTripType(req.body.tripType) ? req.body.tripType : "one_way",
          cityId: req.body.cityId ?? null,
          guideLanguage: req.body.guideLanguage ?? null,
          guideHours: req.body.guideHours ?? null,
          attractionIds: req.body.attractionIds ?? req.body.selectedAttractions ?? [],
          addOnIds: req.body.addOnIds ?? req.body.selectedAddOns ?? [],
          travelers: req.body.travelers ?? req.body.passengerCount ?? 1,
          serviceSlugs: parseServiceSlugs(req.body.serviceSlugs),
        });

        if (built.lineItems.length > 0) {
          const persisted = await persistFrozenQuote(built, {
            itinerary: req.body.itinerary,
            travelers: req.body.travelers || 1,
            travelDate: req.body.travelDate,
            source: "POST /api/bookings",
          });
          quoteId = persisted.quoteId;
          serverTotal = persisted.total;
        }
      }

      // Prepare booking data with required fields. totalAmount is taken
      // from the freshly priced quote when we computed one; otherwise we
      // fall back to a passed-in quoteId's value (looked up below).
      let totalAmount = serverTotal;
      if (!totalAmount && quoteId) {
        const existing = await storage.getQuote(quoteId);
        totalAmount = existing?.total ?? "0";
      }

      const bookingData = {
        ...req.body,
        bookingReference,
        totalAmount: totalAmount ?? "0",
        quoteId,
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
      if (error instanceof RoutePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          routeId: error.routeId,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
      if (error instanceof ServicePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          slug: error.slug,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
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
  app.get("/api/admin/bookings", ...adminAuth, async (req, res) => {
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
  app.delete("/api/bookings/:id", ...adminAuth, async (req, res) => {
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
  // Simple single-route booking. Mirrors /api/bookings: server recomputes
  // the total via PricingService and freezes a quote so the booking has an
  // immutable financial record. Client-supplied totalAmount is ignored.
  // Accepts `vehicleSlug` ("sedan" | "minivan" | "van") directly, or
  // legacy `vehicleType` string. If neither is supplied, picks by pax count.
  app.post("/api/route-bookings", validateBody(routeBookingRequestSchema), async (req, res) => {
    try {
      const {
        routeId,
        vehicleSlug: rawVehicleSlug,
        vehicleType,
        tripType: rawTripType,
        passengers,
        travelers,
        travelDate,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
      } = req.body;

      if (!routeId || !customerName || !customerEmail) {
        return res.status(400).json({
          success: false,
          message: "Missing required booking information",
        });
      }

      const pax = Math.max(1, Math.floor(passengers ?? travelers ?? 1));
      const candidate =
        typeof rawVehicleSlug === "string"
          ? rawVehicleSlug.toLowerCase()
          : typeof vehicleType === "string"
            ? vehicleType.toLowerCase()
            : null;
      const vehicleSlug: VehicleSlug = isVehicleSlug(candidate)
        ? candidate
        : pickVehicleSlugForPassengers(pax);
      const tripType: TripType = isTripType(rawTripType) ? rawTripType : "one_way";

      let built;
      try {
        built = await buildQuoteFromRequest({
          routeId,
          vehicleSlug,
          tripType,
          travelers: pax,
          serviceSlugs: parseServiceSlugs(req.body.serviceSlugs),
        });
      } catch (err) {
        if (err instanceof RoutePriceNotSetError) {
          return res.status(422).json({
            success: false,
            unpriced: true,
            routeId: err.routeId,
            vehicleSlug: err.vehicleSlug,
            tripType: err.tripType,
            message: err.message,
          });
        }
        if (err instanceof ServicePriceNotSetError) {
          return res.status(422).json({
            success: false,
            unpriced: true,
            slug: err.slug,
            vehicleSlug: err.vehicleSlug,
            tripType: err.tripType,
            message: err.message,
          });
        }
        throw err;
      }

      if (built.lineItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No price found for that route + vehicle combination",
        });
      }

      const persisted = await persistFrozenQuote(built, {
        source: "POST /api/route-bookings",
        request: { routeId, vehicleType, passengers: pax, travelDate, specialRequests },
      });

      const bookingReference =
        `RT${Date.now()}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

      const booking = await storage.createBooking({
        bookingReference,
        quoteId: persisted.quoteId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        totalAmount: persisted.total,
        startDate: travelDate ? new Date(travelDate) : null,
        paymentStatus: "pending",
        bookingStatus: "confirmed",
        module: "transfer_only",
      } as any);

      // Send confirmation email
      try {
        const quote = await storage.getQuote(persisted.quoteId);
        if (quote) {
          const emailSent = await emailService.sendBookingConfirmation(booking, quote);
          if (emailSent) {
            await storage.markEmailSent(booking.id, "confirmation");
          }
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }

      res.json({
        success: true,
        bookingReference,
        booking,
        message: "Route booking submitted successfully. We'll contact you to confirm details.",
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
  // DEPRECATED: Stripe flow being removed (Tab.travel migration). Endpoint
  // retained for now to avoid breaking historical clients; do not call from new code.
  app.post("/api/create-payment-intent", async (req, res) => {
    console.warn("DEPRECATED: Stripe flow being removed");
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
  // DEPRECATED: Stripe flow being removed (Tab.travel migration).
  app.post("/api/stripe-webhook", async (req, res) => {
    console.warn("DEPRECATED: Stripe flow being removed");
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

  // NOTE: the public (unauth) POST/PUT/DELETE /api/attractions handlers that
  // lived here were removed — they were dead code, shadowed by the
  // adminAuth-guarded registrations earlier in this file (Express serves the
  // first-registered handler for a path, so these never ran). The auth'd
  // versions are the live ones.

  // Reviews endpoints (extracted to ./routes/reviews.ts)
  registerReviewRoutes(app);

  // Quotes API endpoints
  app.get("/api/quotes", ...adminAuth, async (req, res) => {
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

      // Return frozen line items so callers can render an immutable
      // breakdown without re-pricing. Empty for quotes created before
      // Phase 2 — they only have jsonBlob.
      const lineItems = await getFrozenLineItems(id);
      res.json({ ...quote, lineItems });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a frozen quote. Server recomputes totals from the request
  // fields; client-supplied total is ignored. Returns the new quote with
  // its frozen line items.
  app.post("/api/quotes", validateBody(quoteRequestSchema), async (req, res) => {
    try {
      const built = await buildQuoteFromRequest({
        routeId: req.body.routeId ?? null,
        vehicleSlug: isVehicleSlug(req.body.vehicleSlug) ? req.body.vehicleSlug : null,
        tripType: isTripType(req.body.tripType) ? req.body.tripType : "one_way",
        cityId: req.body.cityId ?? null,
        guideLanguage: req.body.guideLanguage ?? null,
        guideHours: req.body.guideHours ?? null,
        attractionIds: req.body.attractionIds ?? req.body.selectedAttractions ?? [],
        addOnIds: req.body.addOnIds ?? req.body.selectedAddOns ?? [],
        travelers: req.body.travelers ?? req.body.passengerCount ?? 1,
        serviceSlugs: parseServiceSlugs(req.body.serviceSlugs),
      });

      const persisted = await persistFrozenQuote(built, {
        request: req.body,
        source: "POST /api/quotes",
      });

      const quote = await storage.getQuote(persisted.quoteId);
      res.json({
        ...quote,
        breakdown: built.breakdown,
        lineItems: built.lineItems,
      });
    } catch (error: any) {
      if (error instanceof RoutePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          routeId: error.routeId,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
      if (error instanceof ServicePriceNotSetError) {
        return res.status(422).json({
          unpriced: true,
          slug: error.slug,
          vehicleSlug: error.vehicleSlug,
          tripType: error.tripType,
          message: error.message,
        });
      }
      console.error("Error creating quote:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/quotes/:id", ...adminAuth, async (req, res) => {
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
  registerAdminCatalogRoutes(app);
  registerPublicCatalogRoutes(app);

  // Update booking status endpoint
  app.put("/api/bookings/:id/status", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateBookingStatus(id, status);
      res.json({ message: "Booking status updated successfully" });
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update payment status endpoint
  app.put("/api/bookings/:id/payment-status", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus } = req.body;

      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      await storage.updateBookingPaymentStatus(id, paymentStatus);
      res.json({ message: "Payment status updated successfully" });
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Email notification endpoints
  app.post("/api/bookings/:id/send-confirmation", ...adminAuth, async (req, res) => {
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

  app.post("/api/bookings/:id/send-reminder", ...adminAuth, async (req, res) => {
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
