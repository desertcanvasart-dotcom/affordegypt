// Public, auth-free read endpoints over the service_catalog. The
// customer-facing surfaces (homepage planner, service-area pages) read
// from these. Admin CRUD lives in admin-catalog-routes.ts and stays
// separate; this file never returns inactive rows or admin-only fields.
//
// Five endpoints under /api/services/...:
//   GET /api/services                — list, with city / category / q filters
//   GET /api/services/cities         — distinct cities derived from active rows
//   GET /api/services/categories     — service_categories where is_active
//   GET /api/services/trip-types     — trip_types where is_active
//   GET /api/services/:slug          — single row, 404 on missing/inactive
//
// Plus the entrance-fee surface:
//   GET /api/entrance-fees           — per-person tickets (city filter optional)
//
// Plus the experiences surface:
//   GET /api/experiences             — packaged self-contained products (city filter optional)
//
// Note: the existing /api/cities endpoint (cities table) is left
// untouched. Catalog-derived cities live under /api/services/cities to
// avoid colliding with the legacy planner contract.
//
// Slug-collision routing: the static sub-paths (cities, categories,
// trip-types) are registered BEFORE the parameterised /:slug catch-all
// so Express matches them first. Don't reorder.

import type { Express, Request, Response } from "express";
import { and, asc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "./db";
import { entranceFees, experiences, serviceCatalog, serviceCategories, tripTypes } from "@shared/schema";
import { deriveCity } from "@shared/city-detection";

// Convert "luxor-karnak-temple" → "Luxor Karnak Temple". Used as a
// fallback display name when name_translations.en is missing.
function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// Pull the English display name out of name_translations.en, falling
// back to the row's `name` column, then to a humanised slug.
function pickName(row: {
  name: string | null;
  slug: string;
  nameTranslations: unknown;
}): string {
  const t = row.nameTranslations;
  if (t && typeof t === "object") {
    const en = (t as Record<string, unknown>).en;
    if (typeof en === "string" && en.trim()) return en;
  }
  if (typeof row.name === "string" && row.name.trim()) return row.name;
  return humanizeSlug(row.slug);
}

function pricesAsRecord(blob: unknown): Record<string, number> {
  const obj =
    typeof blob === "string"
      ? (JSON.parse(blob) as Record<string, unknown>)
      : (blob as Record<string, unknown> | null | undefined);
  if (!obj || typeof obj !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj)) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) out[k] = n;
  }
  return out;
}

function cheapestPrice(prices: Record<string, number>): number | null {
  const vals = Object.values(prices);
  if (vals.length === 0) return null;
  return Math.min(...vals);
}

// Slug used in /api/services/cities responses. Matches the convention
// used elsewhere on the site (lowercase, hyphenated).
function citySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function registerPublicCatalogRoutes(app: Express): void {
  // ---------------------------------------------------------------
  // GET /api/services/cities — distinct cities with active counts.
  // Registered BEFORE /:slug so Express doesn't consume "cities" as a
  // slug param.
  // ---------------------------------------------------------------
  app.get("/api/services/cities", async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select({ city: serviceCatalog.city, name: serviceCatalog.name })
        .from(serviceCatalog)
        .where(eq(serviceCatalog.isActive, true));

      // Re-derive city from name (rather than trusting the stored
      // city column) so multi-word cities like "Marsa Alam" surface
      // as one bucket even if some rows happened to be saved with
      // city="Marsa". Falls back to the column when name is empty.
      const counts = new Map<string, number>();
      for (const r of rows) {
        const derived = r.name ? deriveCity(r.name) : r.city;
        const key = (derived || r.city || "").trim();
        if (!key) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      const result = Array.from(counts.entries())
        .map(([name, count]) => ({ slug: citySlug(name), name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      res.json(result);
    } catch (error: any) {
      console.error("[GET /api/services/cities] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/services/categories — service_categories (active only).
  // ---------------------------------------------------------------
  app.get("/api/services/categories", async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select({
          slug: serviceCategories.slug,
          name: serviceCategories.name,
          sortOrder: serviceCategories.sortOrder,
        })
        .from(serviceCategories)
        .where(eq(serviceCategories.isActive, true))
        .orderBy(asc(serviceCategories.sortOrder), asc(serviceCategories.name));
      res.json(
        rows.map((r) => ({ slug: r.slug, name: r.name, sort_order: r.sortOrder })),
      );
    } catch (error: any) {
      console.error("[GET /api/services/categories] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/services/trip-types — trip_types (active only).
  // ---------------------------------------------------------------
  app.get("/api/services/trip-types", async (_req: Request, res: Response) => {
    try {
      const rows = await db
        .select({
          slug: tripTypes.slug,
          name: tripTypes.name,
          sortOrder: tripTypes.sortOrder,
        })
        .from(tripTypes)
        .where(eq(tripTypes.isActive, true))
        .orderBy(asc(tripTypes.sortOrder), asc(tripTypes.name));
      res.json(
        rows.map((r) => ({ slug: r.slug, name: r.name, sort_order: r.sortOrder })),
      );
    } catch (error: any) {
      console.error("[GET /api/services/trip-types] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/services — list with optional filters.
  // Query params:
  //   city     — case-insensitive exact match against the row's city
  //   category — one slug, or comma-separated list (OR semantics)
  //   q        — substring match across name and pickup_zone
  // ---------------------------------------------------------------
  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const cityParam =
        typeof req.query.city === "string" ? req.query.city.trim() : "";
      const categoryParam =
        typeof req.query.category === "string" ? req.query.category.trim() : "";
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

      const conditions: any[] = [eq(serviceCatalog.isActive, true)];
      if (cityParam) {
        conditions.push(ilike(serviceCatalog.city, cityParam));
      }
      if (categoryParam) {
        const cats = categoryParam
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        if (cats.length === 1) {
          conditions.push(eq(serviceCatalog.category, cats[0]));
        } else if (cats.length > 1) {
          conditions.push(inArray(serviceCatalog.category, cats));
        }
      }
      if (q) {
        const like = `%${q}%`;
        conditions.push(
          or(ilike(serviceCatalog.name, like), ilike(serviceCatalog.pickupZone, like)),
        );
      }

      const rows = await db
        .select({
          slug: serviceCatalog.slug,
          name: serviceCatalog.name,
          city: serviceCatalog.city,
          category: serviceCatalog.category,
          pickupZone: serviceCatalog.pickupZone,
          vehiclePrices: serviceCatalog.vehiclePrices,
          imageUrl: serviceCatalog.imageUrl,
          nameTranslations: serviceCatalog.nameTranslations,
          sortOrder: serviceCatalog.sortOrder,
        })
        .from(serviceCatalog)
        .where(and(...conditions))
        .orderBy(
          asc(serviceCatalog.city),
          asc(serviceCatalog.sortOrder),
          asc(serviceCatalog.name),
        );

      res.json(
        rows.map((r) => {
          const prices = pricesAsRecord(r.vehiclePrices);
          return {
            slug: r.slug,
            name: pickName(r),
            city: r.city,
            category: r.category,
            pickup_zone: r.pickupZone,
            vehicle_prices: prices,
            image_url: r.imageUrl,
            cheapest_price: cheapestPrice(prices),
          };
        }),
      );
    } catch (error: any) {
      console.error("[GET /api/services] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/entrance-fees — per-person Egyptian site tickets.
  // Query params:
  //   city — optional city slug (matches entrance_fees.city exactly).
  // Response: [{slug, name, city, price_per_person, currency, notes}]
  // Active rows only, sorted by sort_order then name.
  // ---------------------------------------------------------------
  app.get("/api/entrance-fees", async (req: Request, res: Response) => {
    try {
      const cityParam =
        typeof req.query.city === "string" ? req.query.city.trim() : "";

      const conditions: any[] = [eq(entranceFees.isActive, true)];
      if (cityParam) {
        conditions.push(eq(entranceFees.city, cityParam));
      }

      const rows = await db
        .select({
          slug: entranceFees.slug,
          city: entranceFees.city,
          nameTranslations: entranceFees.nameTranslations,
          pricePerPerson: entranceFees.pricePerPerson,
          currency: entranceFees.currency,
          notes: entranceFees.notes,
          sortOrder: entranceFees.sortOrder,
        })
        .from(entranceFees)
        .where(and(...conditions))
        .orderBy(asc(entranceFees.sortOrder), asc(entranceFees.slug));

      res.json(
        rows.map((r) => ({
          slug: r.slug,
          name: pickName({ name: null, slug: r.slug, nameTranslations: r.nameTranslations }),
          city: r.city,
          price_per_person: Number(r.pricePerPerson),
          currency: r.currency,
          notes: r.notes,
        })),
      );
    } catch (error: any) {
      console.error("[GET /api/entrance-fees] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/experiences — packaged self-contained products
  // (felucca, camel, balloon, photography, packaged sound & light).
  // Query params:
  //   city — optional city slug (matches experiences.city exactly).
  // Response: [{slug, name, city, price, unit_type, image_url}]
  // Active rows only, sorted by sort_order then slug.
  // ---------------------------------------------------------------
  app.get("/api/experiences", async (req: Request, res: Response) => {
    try {
      const cityParam =
        typeof req.query.city === "string" ? req.query.city.trim() : "";

      const conditions: any[] = [eq(experiences.isActive, true)];
      if (cityParam) {
        conditions.push(eq(experiences.city, cityParam));
      }

      const rows = await db
        .select({
          slug: experiences.slug,
          city: experiences.city,
          nameTranslations: experiences.nameTranslations,
          price: experiences.price,
          unitType: experiences.unitType,
          imageUrl: experiences.imageUrl,
          sortOrder: experiences.sortOrder,
        })
        .from(experiences)
        .where(and(...conditions))
        .orderBy(asc(experiences.sortOrder), asc(experiences.slug));

      res.json(
        rows.map((r) => ({
          slug: r.slug,
          name: pickName({ name: null, slug: r.slug, nameTranslations: r.nameTranslations }),
          city: r.city,
          price: Number(r.price),
          unit_type: r.unitType,
          image_url: r.imageUrl,
        })),
      );
    } catch (error: any) {
      console.error("[GET /api/experiences] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // ---------------------------------------------------------------
  // GET /api/services/:slug — single service detail.
  // 404 on missing or inactive (customers shouldn't see hidden rows).
  // Returned shape mirrors the list rows.
  // ---------------------------------------------------------------
  app.get("/api/services/:slug", async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug ?? "").trim();
      if (!slug) return res.status(400).json({ message: "Missing slug" });

      const [row] = await db
        .select({
          slug: serviceCatalog.slug,
          name: serviceCatalog.name,
          city: serviceCatalog.city,
          category: serviceCatalog.category,
          pickupZone: serviceCatalog.pickupZone,
          vehiclePrices: serviceCatalog.vehiclePrices,
          imageUrl: serviceCatalog.imageUrl,
          nameTranslations: serviceCatalog.nameTranslations,
          description: serviceCatalog.description,
        })
        .from(serviceCatalog)
        .where(and(eq(serviceCatalog.slug, slug), eq(serviceCatalog.isActive, true)))
        .limit(1);

      if (!row) return res.status(404).json({ message: "Not found" });

      const prices = pricesAsRecord(row.vehiclePrices);
      res.json({
        slug: row.slug,
        name: pickName(row),
        city: row.city,
        category: row.category,
        pickup_zone: row.pickupZone,
        vehicle_prices: prices,
        image_url: row.imageUrl,
        cheapest_price: cheapestPrice(prices),
        description: row.description,
      });
    } catch (error: any) {
      console.error("[GET /api/services/:slug] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
