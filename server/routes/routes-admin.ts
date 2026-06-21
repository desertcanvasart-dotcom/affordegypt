import type { Express } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { storage } from "../database-storage";
import { adminAuth } from "./shared";
import { createTranslatedRoute } from "../translationMiddleware";

// Configure multer for file uploads (CSV bulk route import)
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

// Routes (transfer/itinerary) management: public read + admin CRUD + CSV
// bulk import. Note: the route price path reads vehicle_prices; the legacy
// basePriceByVehicle JSONB is still written here for back-compat with admin
// pages that read it. Extracted from routes.ts (see refactor: split routes).
export function registerRouteAdminRoutes(app: Express): void {
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

  // CSV Import endpoint for bulk route upload.
  // adminAuth runs before the file upload so unauthenticated requests are
  // rejected before any multipart parsing — matches POST/PUT/DELETE /api/routes.
  app.post(
    "/api/routes/import-csv",
    ...adminAuth,
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
}
