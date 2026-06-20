import type { Express } from "express";
import { storage } from "../database-storage";
import { adminAuth } from "./shared";
import { createTranslatedRoute } from "../translationMiddleware";

// Reference-data CRUD: cities, add-ons, attractions, vehicle types, guide
// rates (+ time blocks and a couple of legacy read aliases). Public translated
// reads + admin writes. Extracted from routes.ts (see refactor: split routes).
export function registerReferenceDataRoutes(app: Express): void {
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

  // Get add-ons by city (legacy alias; /api/addons is the canonical CRUD read)
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
}
