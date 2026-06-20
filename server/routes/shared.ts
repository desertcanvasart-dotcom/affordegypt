import { authenticateToken, requireAdmin } from "../auth";
import { isVehicleSlug, isCatalogTripType } from "../services/pricing";
import type { CatalogServiceRequest } from "../services/quote-builder";

// Admin auth middleware chain — [authenticateToken, requireAdmin]. Shared
// across the split route modules so each spreads the same gate:
//   app.post("/api/admin/x", ...adminAuth, handler)
export const adminAuth = [authenticateToken, requireAdmin];

// Parse and validate req.body.serviceSlugs from quote/booking endpoints.
// Accepts an array of `{ slug, vehicleSlug, tripType }` and silently drops
// malformed entries — bad shapes shouldn't 500 a legacy request that doesn't
// carry catalog selections at all. Returns undefined when the field is
// absent/empty so downstream sees the same "no catalog" state as a
// pre-Phase-C client.
export function parseServiceSlugs(
  raw: unknown,
): CatalogServiceRequest[] | undefined {
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
