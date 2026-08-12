import pricingSnapshot from '@/generated/pricing-snapshot.json';

/**
 * Single read path for the build-time pricing snapshot.
 *
 * Before this existed, the guide and car day rates were retyped by hand in page
 * titles, meta descriptions, service cards, the FAQ and the homepage — a dozen
 * places, none of them connected to the pricing engine. They had already
 * drifted: Aswan advertised a "Premium Car Service" at LE 14,025/day against a
 * real full-day rate of LE 5,005, and the guide-service pages quoted a
 * guide+car figure nothing in the catalog produced.
 *
 * scripts/generate-pricing-snapshot.mjs regenerates this at every build from
 * guide_rates and service_catalog, so these numbers now move when the catalog
 * moves. Do not reintroduce a literal price in a component — add a key here.
 */

type ServiceKey = keyof typeof pricingSnapshot.services;

export function priceOf(key: ServiceKey): number | null {
  const raw = pricingSnapshot.services[key]?.minPrice;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** `5625` -> `"5,625"`. Grouping only — the caller supplies LE/EGP. */
export function groupDigits(value: number): string {
  return value.toLocaleString('en-US');
}

/** `"LE 5,625"`, or an em dash when the snapshot has no usable value. */
export function formatLE(key: ServiceKey): string {
  const n = priceOf(key);
  return n === null ? '—' : `LE ${groupDigits(n)}`;
}

/** `"LE 5,625/day"`. */
export function formatLEPerDay(key: ServiceKey): string {
  const n = priceOf(key);
  return n === null ? '—' : `LE ${groupDigits(n)}/day`;
}

/** `"5,625 EGP"` — the order used inside the service cards. */
export function formatEGPPlain(key: ServiceKey): string {
  const n = priceOf(key);
  return n === null ? '—' : `${groupDigits(n)} EGP`;
}

/**
 * Per-vehicle "from" prices on the airport-transfer pages.
 *
 * These lived as literal strings in the locale files until they were derived,
 * and every one of the nine had drifted: Cairo advertised above the catalog,
 * Luxor below it, Aswan in both directions at once. A traveller could read
 * "From 2,135 EGP" for a Luxor van the booking system prices at 2,800.
 */
type VehicleServiceKey = keyof typeof pricingSnapshot.vehicles;
export type VehicleClass = "sedan" | "minivan" | "van";

export function vehiclePriceOf(
  key: VehicleServiceKey,
  vehicle: VehicleClass,
): number | null {
  const raw = (pricingSnapshot.vehicles[key] as Record<string, string> | undefined)?.[vehicle];
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** `"1,950"` for a vehicle class, or null when the catalog cannot price it. */
export function vehicleDigits(
  key: VehicleServiceKey,
  vehicle: VehicleClass,
): string | null {
  const n = vehiclePriceOf(key, vehicle);
  return n === null ? null : groupDigits(n);
}

export const CURRENCY = pricingSnapshot.currency;
