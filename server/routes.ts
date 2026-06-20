import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database-storage";
import { setupAuthRoutes } from "./auth-routes";
import { authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { registerPricingRoutes } from "./pricing-routes";
import { registerAdminCatalogRoutes } from "./admin-catalog-routes";
import { registerPublicCatalogRoutes } from "./public-catalog-routes";
import { registerReviewRoutes } from "./routes/reviews";
import { registerQuoteRoutes } from "./routes/quotes";
import { registerBookingRoutes } from "./routes/bookings";
import { registerRouteAdminRoutes } from "./routes/routes-admin";
import { adminAuth } from "./routes/shared";
import {
  pricingService,
  isVehicleSlug,
  isCatalogTripType,
} from "./services/pricing";
import { createTranslatedRoute } from "./translationMiddleware";
import { setupPasswordResetRoutes } from "./password-reset-routes";
import { setupEmailVerificationRoutes } from "./email-verification-routes";
// Stripe will be initialized later when keys are provided
let stripe: any = null;

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

  // Routes: read / admin CRUD / CSV import (extracted to ./routes/routes-admin.ts)
  registerRouteAdminRoutes(app);

  // (route create/update/delete + CSV import moved to ./routes/routes-admin.ts)

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

  // Bookings endpoints (extracted to ./routes/bookings.ts) — registers the
  // create/read/delete/route-booking handlers AND the admin status/payment/
  // email handlers that used to live further down this file.
  registerBookingRoutes(app);

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

  // Quotes API endpoints (extracted to ./routes/quotes.ts)
  registerQuoteRoutes(app);

  // Register pricing routes for Transfer Only pricing endpoint
  await registerPricingRoutes(app);
  registerAdminCatalogRoutes(app);
  registerPublicCatalogRoutes(app);

  // (booking status / payment / email handlers moved to ./routes/bookings.ts)

  const httpServer = createServer(app);
  return httpServer;
}
