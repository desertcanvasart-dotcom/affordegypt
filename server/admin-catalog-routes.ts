// Admin CRUD endpoints for the Phase 1.5 service catalog.
// See docs/SERVICES_ARCHITECTURE.md §6 for the design.
//
// All endpoints sit behind [authenticateToken, requireAdmin] and never
// touch the legacy `routes` / `services` tables. Phase E will rename
// `service_catalog` to `services` once the legacy table is dropped; until
// then this module deliberately uses the `service_catalog` naming
// everywhere — types, DB columns, URLs.
//
// Validation goes through the insert schemas exported from shared/schema
// so the wire format stays consistent with the Drizzle row shape. PATCH
// accepts a subset (insert schema with everything optional) and rejects
// any attempt to mutate `slug` after creation — slugs appear inside
// vehicle_prices keys and in URLs and must stay stable.

import type { Express, Request, Response } from "express";
import { z } from "zod";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./db";
import { authenticateToken, requireAdmin } from "./auth";
import {
  serviceCatalog,
  serviceCategories,
  tripTypes,
  entranceFees,
  insertServiceCatalogItemSchema,
  insertServiceCategorySchema,
  insertTripTypeRowSchema,
} from "@shared/schema";

const adminAuth = [authenticateToken, requireAdmin];

// PATCH accepts the same shape as INSERT but every field optional, AND
// it rejects `slug` outright — slugs are immutable post-create because
// they appear inside vehicle_prices keys and in URLs.
const stripSlug = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((raw) => {
    if (raw && typeof raw === "object" && "slug" in raw) {
      // Don't silently drop — surface the error so admin UIs that try
      // to send it know to stop. (Form already renders slug read-only.)
      throw new z.ZodError([
        {
          code: "custom",
          path: ["slug"],
          message: "slug is immutable after create",
        },
      ]);
    }
    return raw;
  }, schema);

// Internal: 422 helper for unique-violation responses.
const handleDbError = (res: Response, err: any, label: string): boolean => {
  if (err?.code === "23505") {
    // Postgres unique_violation
    res.status(422).json({
      message: `${label} with this slug already exists`,
      code: "duplicate_slug",
    });
    return true;
  }
  return false;
};

// ---- entrance_fees helpers ---------------------------------------------
// city is stored lowercased (NOT slugified) so it matches the planner's
// `entrance_fees.city.toLowerCase() === cityName.toLowerCase()` filter —
// e.g. "Marsa Alam" -> "marsa alam", not "marsa-alam".
const efSlugify = (s: string) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/['"`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Student price is folded into `notes` (no dedicated column) as
// "Student: N EGP", joined to any free-text note with " | ".
const efJoinNotes = (studentPrice: number | null | undefined, freeNotes: string | null | undefined) => {
  const parts: string[] = [];
  if (studentPrice != null && Number.isFinite(Number(studentPrice))) {
    parts.push(`Student: ${Number(studentPrice)} EGP`);
  }
  if (freeNotes && freeNotes.trim()) parts.push(freeNotes.trim());
  return parts.length ? parts.join(" | ") : null;
};
const efSplitNotes = (notes: string | null | undefined) => {
  if (!notes) return { studentPrice: null as number | null, freeNotes: "" };
  let studentPrice: number | null = null;
  const rest: string[] = [];
  for (const part of notes.split("|").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^Student:\s*([\d.]+)\s*EGP$/i);
    if (m && studentPrice === null) studentPrice = Number(m[1]);
    else rest.push(part);
  }
  return { studentPrice, freeNotes: rest.join(" | ") };
};

// Friendly admin payload (the form shape) — server derives slug,
// name_translations, price_per_person, and the notes string.
// One flat price per person, including profit (no markup math — too coarse
// for high-value tickets). It's stored in price_per_person; the legacy
// base_price/markup_percent columns are notNull, so we mirror price into
// base_price and set markup to 0.
const entranceFeeInput = z.object({
  name: z.string().trim().min(1),
  city: z.string().trim().min(1),
  pricePerPerson: z.coerce.number().positive(),
  studentPrice: z.coerce.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export function registerAdminCatalogRoutes(app: Express): void {
  // -----------------------------------------------------------------
  // /api/admin/service-catalog
  // -----------------------------------------------------------------

  // List with optional filters: ?q=substring, ?category=slug, ?active=true|false|all
  app.get("/api/admin/service-catalog", ...adminAuth, async (req, res) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const category =
        typeof req.query.category === "string" ? req.query.category.trim() : "";
      const activeParam =
        typeof req.query.active === "string" ? req.query.active : "all";

      const conditions: any[] = [];
      if (q) {
        const like = `%${q}%`;
        conditions.push(
          or(
            ilike(serviceCatalog.name, like),
            ilike(serviceCatalog.slug, like),
            ilike(serviceCatalog.pickupZone, like),
          ),
        );
      }
      if (category) conditions.push(eq(serviceCatalog.category, category));
      if (activeParam === "true") conditions.push(eq(serviceCatalog.isActive, true));
      else if (activeParam === "false") conditions.push(eq(serviceCatalog.isActive, false));

      const rows = await db
        .select()
        .from(serviceCatalog)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(
          asc(serviceCatalog.city),
          asc(serviceCatalog.sortOrder),
          asc(serviceCatalog.name),
        );

      res.json(rows);
    } catch (error: any) {
      console.error("[GET /api/admin/service-catalog] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/service-catalog/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const [row] = await db
        .select()
        .from(serviceCatalog)
        .where(eq(serviceCatalog.id, id))
        .limit(1);
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (error: any) {
      console.error("[GET /api/admin/service-catalog/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/service-catalog", ...adminAuth, async (req, res) => {
    try {
      const parsed = insertServiceCatalogItemSchema.parse(req.body);
      // Seed name_translations.en from name (same lockstep rule as PATCH).
      const values: Record<string, unknown> = { ...(parsed as any) };
      if (typeof parsed.name === "string" && parsed.nameTranslations == null) {
        values.nameTranslations = { en: parsed.name };
      }
      const [row] = await db
        .insert(serviceCatalog)
        .values(values as any)
        .returning();
      res.status(201).json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      if (handleDbError(res, error, "Service catalog item")) return;
      console.error("[POST /api/admin/service-catalog] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/service-catalog/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const patchSchema = stripSlug(insertServiceCatalogItemSchema.partial());
      const parsed = patchSchema.parse(req.body);

      // Renames must reach name_translations.en too: the import scripts
      // stamp {en: name} on every row, and a stale en copy shadowed
      // admin renames on the customer site until pickName was fixed to
      // prefer `name`. Keep the two in lockstep (preserving any other
      // language keys) unless the caller set nameTranslations explicitly.
      const set: Record<string, unknown> = { ...(parsed as any), updatedAt: sql`now()` };
      if (typeof parsed.name === "string" && parsed.nameTranslations === undefined) {
        set.nameTranslations = sql`COALESCE(${serviceCatalog.nameTranslations}, '{}'::jsonb) || jsonb_build_object('en', ${parsed.name}::text)`;
      }

      const [row] = await db
        .update(serviceCatalog)
        .set(set)
        .where(eq(serviceCatalog.id, id))
        .returning();

      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      console.error("[PATCH /api/admin/service-catalog/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // -----------------------------------------------------------------
  // /api/admin/trip-types
  // -----------------------------------------------------------------

  // Default returns ALL trip types (admin needs to see inactive too).
  // Pass ?activeOnly=true to filter — used by the price grid which
  // should only render columns for active types.
  app.get("/api/admin/trip-types", ...adminAuth, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const conditions = activeOnly ? [eq(tripTypes.isActive, true)] : [];
      const rows = await db
        .select()
        .from(tripTypes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(tripTypes.sortOrder), asc(tripTypes.name));
      res.json(rows);
    } catch (error: any) {
      console.error("[GET /api/admin/trip-types] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/trip-types", ...adminAuth, async (req, res) => {
    try {
      const parsed = insertTripTypeRowSchema.parse(req.body);
      const [row] = await db.insert(tripTypes).values(parsed as any).returning();
      res.status(201).json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      if (handleDbError(res, error, "Trip type")) return;
      console.error("[POST /api/admin/trip-types] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/trip-types/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const patchSchema = stripSlug(insertTripTypeRowSchema.partial());
      const parsed = patchSchema.parse(req.body);
      const [row] = await db
        .update(tripTypes)
        .set({ ...(parsed as any), updatedAt: sql`now()` })
        .where(eq(tripTypes.id, id))
        .returning();
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      console.error("[PATCH /api/admin/trip-types/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // -----------------------------------------------------------------
  // /api/admin/service-categories
  // -----------------------------------------------------------------

  app.get("/api/admin/service-categories", ...adminAuth, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const conditions = activeOnly ? [eq(serviceCategories.isActive, true)] : [];
      const rows = await db
        .select()
        .from(serviceCategories)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(serviceCategories.sortOrder), asc(serviceCategories.name));
      res.json(rows);
    } catch (error: any) {
      console.error("[GET /api/admin/service-categories] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/service-categories", ...adminAuth, async (req, res) => {
    try {
      const parsed = insertServiceCategorySchema.parse(req.body);
      const [row] = await db.insert(serviceCategories).values(parsed as any).returning();
      res.status(201).json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      if (handleDbError(res, error, "Service category")) return;
      console.error("[POST /api/admin/service-categories] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/service-categories/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const patchSchema = stripSlug(insertServiceCategorySchema.partial());
      const parsed = patchSchema.parse(req.body);
      const [row] = await db
        .update(serviceCategories)
        .set({ ...(parsed as any), updatedAt: sql`now()` })
        .where(eq(serviceCategories.id, id))
        .returning();
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      console.error("[PATCH /api/admin/service-categories/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // -----------------------------------------------------------------
  // /api/admin/entrance-fees — per-person site tickets (admin CRUD).
  // The public GET /api/entrance-fees stays read-only + active-only.
  // -----------------------------------------------------------------

  // List ALL (active + inactive). Returns the raw row plus a derived
  // `name` (en) and split-out `studentPrice`/`freeNotes` for the form.
  app.get("/api/admin/entrance-fees", ...adminAuth, async (_req, res) => {
    try {
      const rows = await db
        .select()
        .from(entranceFees)
        .orderBy(asc(entranceFees.city), asc(entranceFees.sortOrder), asc(entranceFees.id));
      res.json(
        rows.map((r) => {
          const { studentPrice, freeNotes } = efSplitNotes(r.notes);
          const name = (r.nameTranslations as any)?.en ?? r.slug;
          return {
            id: r.id,
            slug: r.slug,
            name,
            city: r.city,
            pricePerPerson: Number(r.pricePerPerson),
            studentPrice,
            freeNotes,
            currency: r.currency,
            isActive: r.isActive,
            sortOrder: r.sortOrder,
          };
        }),
      );
    } catch (error: any) {
      console.error("[GET /api/admin/entrance-fees] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/entrance-fees", ...adminAuth, async (req, res) => {
    try {
      const input = entranceFeeInput.parse(req.body);
      const city = input.city.toLowerCase();
      const slug = `${efSlugify(city)}-${efSlugify(input.name)}`;
      const [row] = await db
        .insert(entranceFees)
        .values({
          slug,
          nameTranslations: { en: input.name },
          city,
          basePrice: String(input.pricePerPerson),
          markupPercent: "0",
          pricePerPerson: String(input.pricePerPerson),
          currency: "EGP",
          notes: efJoinNotes(input.studentPrice, input.notes),
          isActive: input.isActive ?? true,
          sortOrder: input.sortOrder ?? 0,
        } as any)
        .returning();
      res.status(201).json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      if (handleDbError(res, error, "Entrance fee")) return;
      console.error("[POST /api/admin/entrance-fees] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/entrance-fees/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const input = entranceFeeInput.partial().parse(req.body);

      const [existing] = await db.select().from(entranceFees).where(eq(entranceFees.id, id));
      if (!existing) return res.status(404).json({ message: "Not found" });

      // Merge against current notes so partial updates preserve the other part.
      const prevSplit = efSplitNotes(existing.notes);
      const studentPrice = input.studentPrice !== undefined ? input.studentPrice : prevSplit.studentPrice;
      const freeNotes = input.notes !== undefined ? input.notes : prevSplit.freeNotes;

      const set: Record<string, unknown> = { updatedAt: sql`now()` };
      if (input.name !== undefined) set.nameTranslations = { en: input.name };
      if (input.city !== undefined) set.city = input.city.toLowerCase();
      if (input.pricePerPerson !== undefined) {
        // Keep base_price mirrored to the flat price, markup neutralized.
        set.pricePerPerson = String(input.pricePerPerson);
        set.basePrice = String(input.pricePerPerson);
        set.markupPercent = "0";
      }
      if (input.studentPrice !== undefined || input.notes !== undefined) {
        set.notes = efJoinNotes(studentPrice, freeNotes);
      }
      if (input.isActive !== undefined) set.isActive = input.isActive;
      if (input.sortOrder !== undefined) set.sortOrder = input.sortOrder;

      const [row] = await db
        .update(entranceFees)
        .set(set as any)
        .where(eq(entranceFees.id, id))
        .returning();
      res.json(row);
    } catch (error: any) {
      if (error?.issues) {
        return res.status(400).json({ message: "Validation error", issues: error.issues });
      }
      console.error("[PATCH /api/admin/entrance-fees/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/entrance-fees/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const [row] = await db.delete(entranceFees).where(eq(entranceFees.id, id)).returning();
      if (!row) return res.status(404).json({ message: "Not found" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("[DELETE /api/admin/entrance-fees/:id] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
}
