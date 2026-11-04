// Pricing tools for the website chat assistant.
//
// The assistant never prices anything itself. Every number a customer sees
// comes out of one of these tools, and every total comes out of
// buildMultiCityQuote — the same builder behind /api/pricing/calculate and
// the frozen /api/quotes path — so a chat quote equals a builder quote.
//
// Everything here is READ-ONLY. Nothing persists a quote or a booking; the
// customer books through the normal quote builder / WhatsApp hand-off.
//
// DB access is injected (ChatToolDeps) so the validation rules — which are
// the part that keeps a model from quoting nonsense — are unit-testable
// without a database.

import type Anthropic from "@anthropic-ai/sdk";
import type { LineItem, VehicleSlug, CatalogTripType } from "./pricing";
import type { BuiltMultiCityQuote, MultiCityCityInput } from "./quote-builder";
import { pricePackage, singleRoomOptions } from "@shared/travel-packages";

// The site sells three vehicle classes (see client/src/pages/transfers.tsx).
// Catalog rows also carry hiace/coaster keys that nothing customer-facing
// offers, so the assistant doesn't either.
export const CHAT_VEHICLES = ["sedan", "minivan", "van"] as const satisfies readonly VehicleSlug[];
export const VEHICLE_CAPACITY: Record<VehicleSlug, number> = { sedan: 2, minivan: 8, van: 15 };
export const MAX_TRAVELERS = 15;
export const MAX_DAYS = 21;

export interface CatalogRow {
  slug: string;
  name: string;
  city: string;
  category: string;
  pickupZone: string | null;
  vehiclePrices: Record<string, number>;
}
export interface EntranceFeeRow {
  slug: string;
  name: string;
  city: string;
  pricePerPerson: number;
}
export interface GuideRateRow {
  cityId: number;
  cityName: string;
  language: string;
  dailyRate: number;
}
/**
 * A builder add-on (add_ons): meals, balloon rides, felucca, horse carriage.
 * Priced the way the builder prices them: price × quantity × travelers, for
 * EVERY unit type (PricingService.getAddOnPrice's business rule), so the chat
 * matches the builder even where unit_type says per_trip.
 */
export interface AddOnRow {
  id: number;
  name: string;
  category: string;
  cityName: string | null; // null = every city
  price: number;
  unitType: string;
}
/** A published ready-made package (travel_packages, status = published). */
export interface PackageRow {
  slug: string;
  title: string;
  summary: string;
  durationDays: number;
  nights: number;
  dayTitles: string[];
  inclusions: string[];
  exclusions: string[];
  /** The package's own booking, payment and cancellation terms (they differ from custom trips). */
  bookingTerms: string;
  perPersonRates: Record<string, number>;
  singleSupplement: number | null;
  version: number;
}

export interface ChatToolDeps {
  loadCatalog(): Promise<CatalogRow[]>;
  loadEntranceFees(): Promise<EntranceFeeRow[]>;
  loadGuideRates(): Promise<GuideRateRow[]>;
  loadPackages(): Promise<PackageRow[]>;
  loadAddOns(): Promise<AddOnRow[]>;
  buildQuote(cities: MultiCityCityInput[], travelers: number): Promise<BuiltMultiCityQuote>;
}

/** A quote the widget renders as a card, straight from the pricing engine's output. */
export interface VerifiedQuote {
  kind: "custom" | "package";
  /** Package quotes only: what it is and where to book it. */
  title?: string;
  bookUrl?: string;
  travelers: number;
  currency: "EGP";
  total: number;
  perPerson: number;
  lines: Array<{ label: string; city: string; amount: number }>;
}

export interface ToolOutcome {
  /** JSON string handed back to the model as the tool_result. */
  content: string;
  isError: boolean;
  /** Set only by calculate_quote on success. */
  quote?: VerifiedQuote;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/** vehicle_prices JSONB → [{vehicle, trip_type, price}] for the sold vehicles only. */
export function priceOptions(
  prices: Record<string, number>,
): Array<{ vehicle: VehicleSlug; trip_type: string; price: number }> {
  const out: Array<{ vehicle: VehicleSlug; trip_type: string; price: number }> = [];
  for (const [key, raw] of Object.entries(prices ?? {})) {
    const vehicle = CHAT_VEHICLES.find((v) => key.startsWith(`${v}_`));
    if (!vehicle) continue;
    const price = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (!Number.isFinite(price) || price <= 0) continue;
    out.push({ vehicle, trip_type: key.slice(vehicle.length + 1), price });
  }
  return out.sort((a, b) => a.price - b.price);
}

/** Smallest sold vehicle that seats the group, or null if none does. */
export function smallestVehicleFor(travelers: number): VehicleSlug | null {
  return CHAT_VEHICLES.find((v) => VEHICLE_CAPACITY[v] >= travelers) ?? null;
}

export function sameCity(a: string, b: string): boolean {
  return norm(a) === norm(b);
}

function json(value: unknown): string {
  return JSON.stringify(value);
}
function fail(message: string): ToolOutcome {
  return { content: json({ error: message }), isError: true };
}

/** "Lunch: Oriental" — the name column alone ("Oriental") is ambiguous. */
export function addOnLabel(a: Pick<AddOnRow, "name" | "category">): string {
  const name = a.name.trim();
  const category = a.category.trim();
  return category && !name.toLowerCase().includes(category.toLowerCase()) ? `${category}: ${name}` : name;
}

/** Customer-facing label for a builder line item (builder descriptions are slug-based). */
function labelFor(
  item: LineItem,
  catalogBySlug: Map<string, CatalogRow>,
  feeBySlug: Map<string, EntranceFeeRow>,
  addOnById: Map<number, AddOnRow> = new Map(),
): string {
  const meta = (item.meta ?? {}) as Record<string, unknown>;
  if (typeof meta.serviceSlug === "string") {
    const row = catalogBySlug.get(meta.serviceSlug);
    const vehicle = String(meta.vehicleSlug ?? "");
    return `${row?.name ?? meta.serviceSlug} (${vehicle})`;
  }
  if (typeof meta.addOnId === "number") {
    const a = addOnById.get(meta.addOnId);
    const travelers = Number(meta.travelers) || 1;
    const name = a ? addOnLabel(a) : `Add-on #${meta.addOnId}`;
    return item.quantity > 1 ? `${name} × ${item.quantity} × ${travelers} people` : `${name} × ${travelers} people`;
  }
  if (typeof meta.entranceFeeSlug === "string") {
    const fee = feeBySlug.get(meta.entranceFeeSlug);
    return `${fee?.name ?? meta.entranceFeeSlug} tickets × ${item.quantity}`;
  }
  if (item.kind === "guide" && typeof meta.language === "string") {
    return `${meta.language}-speaking guide, full day`;
  }
  return item.description;
}

// ---------------------------------------------------------------------------
// Tool definitions (what the model sees)
// ---------------------------------------------------------------------------

export const CHAT_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_services",
    description:
      "Search AffordEgypt's priced catalog of private transfers and tours (airport pickups, intercity drives, day tours, dinner cruises, shows). " +
      "Returns each matching service's slug and every priced vehicle/trip-type option with its price in EGP for the whole vehicle (not per person). " +
      "Call this before quoting any transfer or tour. Use the city filter whenever the customer names a city.",
    input_schema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name, e.g. Cairo, Luxor, Aswan, Hurghada, Marsa Alam. Optional.",
        },
        query: {
          type: "string",
          description: "Words to match in the service name, e.g. 'airport', 'pyramids', 'karnak', 'hurghada'. Optional.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_entrance_fees",
    description:
      "List entrance tickets for Egyptian sites (temples, tombs, museums) with the price per person in EGP. Optionally filter by city.",
    input_schema: {
      type: "object",
      properties: { city: { type: "string", description: "City name. Optional." } },
      additionalProperties: false,
    },
  },
  {
    name: "list_guides",
    description:
      "List the guide languages available in a city and the full-day guide rate in EGP (one rate per day for the group, not per person).",
    input_schema: {
      type: "object",
      properties: { city: { type: "string", description: "City name." } },
      required: ["city"],
      additionalProperties: false,
    },
  },
  {
    name: "list_add_ons",
    description:
      "List extras that can be added to a day of a custom trip: lunches and dinners (Oriental, grilled BBQ, seafood), hot-air balloon rides, felucca rides, horse carriages. " +
      "Returns each add-on's id, name, city and price in EGP. Every add-on is charged per person (price × travellers), whatever its unit says. " +
      "Call this whenever the customer asks for a meal, lunch, dinner, balloon, felucca or carriage.",
    input_schema: {
      type: "object",
      properties: { city: { type: "string", description: "City name. Optional." } },
      additionalProperties: false,
    },
  },
  {
    name: "list_packages",
    description:
      "List AffordEgypt's ready-made multi-day packages (these include hotels, intercity trains/cruise and touring, unlike custom trips). " +
      "Returns each package's slug, length, day-by-day outline, inclusions/exclusions, the price per person by group size (EGP, sharing a double/twin room) " +
      "and the single-room supplement. Call this whenever a customer asks about a multi-day trip, a tour package, or a trip that needs hotels.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "price_package",
    description:
      "Exact price of one ready-made package for a group, from the same pricing the package pages use. " +
      "Groups of 2 to 12. Travellers not in single rooms share doubles, so (travelers - single_rooms) must be even. " +
      "The customer is shown this result as a verified price card with a link to book the package.",
    input_schema: {
      type: "object",
      properties: {
        slug: { type: "string" },
        travelers: { type: "integer", minimum: 2, maximum: 12 },
        single_rooms: { type: "integer", minimum: 0, maximum: 12, description: "Defaults to the fewest possible (0, or 1 for an odd group)." },
      },
      required: ["slug", "travelers"],
      additionalProperties: false,
    },
  },
  {
    name: "calculate_quote",
    description:
      "Price a CUSTOM trip, day by day, with the live pricing engine and return the exact total and per-person price in EGP. " +
      "List one entry per day, in order. A guide is charged per day, so add guide_language on every day the customer wants a guide. " +
      "Custom trips cover transfers, tours, guides and entrance tickets only — no hotels, sleeper trains or cruises. " +
      "This is the ONLY source of totals for custom trips: never add numbers up yourself. Use slugs exactly as returned by the other tools. " +
      "The customer is shown this result as a verified price card.",
    input_schema: {
      type: "object",
      properties: {
        travelers: { type: "integer", minimum: 1, maximum: MAX_TRAVELERS },
        days: {
          type: "array",
          minItems: 1,
          maxItems: MAX_DAYS,
          items: {
            type: "object",
            properties: {
              city: { type: "string", description: "Where the customer is that day." },
              services: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    slug: { type: "string" },
                    vehicle: { type: "string", enum: [...CHAT_VEHICLES] },
                    trip_type: { type: "string" },
                  },
                  required: ["slug", "vehicle", "trip_type"],
                  additionalProperties: false,
                },
              },
              guide_language: { type: "string", description: "Optional, e.g. English." },
              add_ons: {
                type: "array",
                description: "Extras from list_add_ons for that day (meals, balloon, felucca…). Optional.",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    quantity: { type: "integer", minimum: 1, maximum: 10, description: "Defaults to 1." },
                  },
                  required: ["id"],
                  additionalProperties: false,
                },
              },
              entrance_fees: {
                type: "array",
                items: { type: "string" },
                description: "Entrance-fee slugs. Optional.",
              },
            },
            required: ["city"],
            additionalProperties: false,
          },
        },
      },
      required: ["travelers", "days"],
      additionalProperties: false,
    },
  },
];

// ---------------------------------------------------------------------------
// Executors
// ---------------------------------------------------------------------------

const SEARCH_LIMIT = 15;

export async function runChatTool(
  name: string,
  input: unknown,
  deps: ChatToolDeps,
): Promise<ToolOutcome> {
  const args = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  switch (name) {
    case "search_services": {
      const city = str(args.city);
      const words = norm(str(args.query)).split(" ").filter(Boolean);
      const catalog = await deps.loadCatalog();
      const matches = catalog
        .filter((r) => !city || sameCity(r.city, city))
        .filter((r) => {
          const hay = norm(`${r.name} ${r.slug} ${r.pickupZone ?? ""} ${r.category}`);
          return words.every((w) => hay.includes(w));
        })
        .map((r) => ({
          slug: r.slug,
          name: r.name,
          city: r.city,
          category: r.category,
          options: priceOptions(r.vehiclePrices),
        }))
        .filter((r) => r.options.length > 0);
      const cities = Array.from(new Set(catalog.map((r) => r.city))).sort();
      return {
        content: json({
          results: matches.slice(0, SEARCH_LIMIT),
          total_matches: matches.length,
          truncated: matches.length > SEARCH_LIMIT,
          ...(matches.length === 0 ? { cities_served: cities } : {}),
          currency: "EGP",
          note: "Prices are per vehicle for the whole group. sedan seats 2, minivan 8, van 15.",
        }),
        isError: false,
      };
    }

    case "list_entrance_fees": {
      const city = str(args.city);
      const fees = (await deps.loadEntranceFees()).filter((f) => !city || sameCity(f.city, city));
      return {
        content: json({
          results: fees.map((f) => ({
            slug: f.slug,
            name: f.name,
            city: f.city,
            price_per_person: f.pricePerPerson,
          })),
          currency: "EGP",
        }),
        isError: false,
      };
    }

    case "list_guides": {
      const city = str(args.city);
      if (!city) return fail("city is required");
      const rows = (await deps.loadGuideRates()).filter((g) => sameCity(g.cityName, city));
      if (rows.length === 0) {
        return fail(`No guides are listed for ${city}. Do not quote a guide there; suggest contacting the team on WhatsApp.`);
      }
      return {
        content: json({
          city: rows[0].cityName,
          guides: rows
            .map((g) => ({ language: g.language, full_day_rate: g.dailyRate }))
            .sort((a, b) => a.full_day_rate - b.full_day_rate),
          currency: "EGP",
          note: "One rate per guide per day for the whole group.",
        }),
        isError: false,
      };
    }

    case "calculate_quote":
      return calculateQuote(args, deps);

    case "list_add_ons": {
      const city = str(args.city);
      const rows = (await deps.loadAddOns()).filter((a) => !city || !a.cityName || sameCity(a.cityName, city));
      return {
        content: json({
          results: rows.map((a) => ({
            id: a.id,
            name: addOnLabel(a),
            city: a.cityName ?? "all cities",
            price_per_person: a.price,
          })),
          currency: "EGP",
          note: "Charged per person: price × travellers (× quantity). Add to a day with calculate_quote's add_ons.",
        }),
        isError: false,
      };
    }

    case "list_packages": {
      const packages = await deps.loadPackages();
      return {
        content: json({
          packages: packages.map((p) => ({
            slug: p.slug,
            title: p.title,
            days: p.durationDays,
            nights: p.nights,
            summary: p.summary,
            itinerary: p.dayTitles.map((t, i) => `Day ${i + 1}: ${t}`),
            inclusions: p.inclusions,
            exclusions: p.exclusions,
            booking_terms: p.bookingTerms,
            price_per_person_by_group_size: p.perPersonRates,
            single_room_supplement: p.singleSupplement,
          })),
          currency: "EGP",
          note:
            "Per-person prices assume sharing a double/twin room; groups of 2 to 12. " +
            "For an exact total always call price_package — odd group sizes and single rooms change it.",
        }),
        isError: false,
      };
    }

    case "price_package": {
      const slug = str(args.slug);
      const pkg = (await deps.loadPackages()).find((p) => p.slug === slug);
      if (!pkg) return fail(`unknown package "${slug}" — use a slug from list_packages`);
      const travelers = Number(args.travelers);
      if (!Number.isInteger(travelers) || travelers < 2 || travelers > 12) {
        return fail("ready-made packages are priced for groups of 2 to 12; smaller or larger groups need a custom quote on WhatsApp");
      }
      const options = pkg.nights ? singleRoomOptions(travelers) : [0];
      const singleRooms = args.single_rooms === undefined ? options[0] : Number(args.single_rooms);
      if (!options.includes(singleRooms)) {
        return fail(
          `with ${travelers} travellers the possible single-room counts are ${options.join(", ")} (everyone else shares a double)`,
        );
      }
      let pricing;
      try {
        pricing = pricePackage(pkg, travelers, singleRooms);
      } catch (err) {
        return fail((err as Error).message);
      }
      const lines: VerifiedQuote["lines"] = [
        { label: `${pkg.title} · ${travelers} × LE ${pricing.basePerPerson.toLocaleString("en-US")}`, city: "", amount: pricing.baseTotal },
      ];
      if (pricing.singleRooms > 0) {
        lines.push({ label: `Single-room supplement × ${pricing.singleRooms}`, city: "", amount: pricing.supplementTotal });
      }
      const quote: VerifiedQuote = {
        kind: "package",
        title: `${pkg.title} (${pkg.durationDays} days)`,
        bookUrl: `/packages/${pkg.slug}`,
        travelers,
        currency: "EGP",
        total: pricing.total,
        perPerson: Math.round((pricing.total / travelers) * 100) / 100,
        lines,
      };
      return {
        content: json({
          package: pkg.title,
          days: pkg.durationDays,
          travelers,
          double_rooms: pricing.doubleRooms,
          single_rooms: pricing.singleRooms,
          total: quote.total,
          per_person: quote.perPerson,
          currency: "EGP",
          note: "The customer sees this as a price card with a button to book the package page. Summarize; do not restate every line.",
        }),
        isError: false,
        quote,
      };
    }

    default:
      return fail(`Unknown tool: ${name}`);
  }
}

async function calculateQuote(
  args: Record<string, unknown>,
  deps: ChatToolDeps,
): Promise<ToolOutcome> {
  const travelers = Number(args.travelers);
  if (!Number.isInteger(travelers) || travelers < 1) return fail("travelers must be a whole number of at least 1");
  if (travelers > MAX_TRAVELERS) {
    return fail(`Groups over ${MAX_TRAVELERS} need a custom quote. Tell the customer to message the team on WhatsApp.`);
  }
  if (!Array.isArray(args.days) || args.days.length === 0) return fail("days must list at least one day");
  if (args.days.length > MAX_DAYS) {
    return fail(`custom quotes go up to ${MAX_DAYS} days; for longer trips suggest a ready-made package or WhatsApp`);
  }

  const [catalog, fees, guides, addOns] = await Promise.all([
    deps.loadCatalog(),
    deps.loadEntranceFees(),
    deps.loadGuideRates(),
    deps.loadAddOns(),
  ]);
  const catalogBySlug = new Map(catalog.map((r) => [r.slug, r]));
  const feeBySlug = new Map(fees.map((f) => [f.slug, f]));
  const addOnById = new Map(addOns.map((a) => [a.id, a]));

  const problems: string[] = [];
  const cityInputs: MultiCityCityInput[] = [];

  (args.days as unknown[]).forEach((raw, dayIndex) => {
    const c = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const cityName = typeof c.city === "string" ? c.city.trim() : "";
    const day = `day ${dayIndex + 1}`;
    if (!cityName) {
      problems.push(`${day} needs a city`);
      return;
    }
    // One builder entry per day, so a guide is charged per day (the builder
    // charges a guide once per entry). The day number rides in cityName,
    // which the builder only uses for labels; the guide is matched by cityId.
    const input: MultiCityCityInput = {
      cityName: `Day ${dayIndex + 1} · ${cityName}`,
      travelers,
      selectedServices: [],
      selectedEntranceFees: [],
    };

    for (const s of Array.isArray(c.services) ? c.services : []) {
      const sel = (s ?? {}) as Record<string, unknown>;
      const slug = String(sel.slug ?? "");
      const vehicle = String(sel.vehicle ?? "") as VehicleSlug;
      const tripType = String(sel.trip_type ?? "");
      const row = catalogBySlug.get(slug);
      if (!row) {
        problems.push(`${day}: unknown service slug "${slug}" — look it up with search_services`);
        continue;
      }
      if (!sameCity(row.city, cityName)) {
        problems.push(`${day}: service "${slug}" belongs to ${row.city}, not ${cityName}`);
        continue;
      }
      if (!(CHAT_VEHICLES as readonly string[]).includes(vehicle)) {
        problems.push(`${day}: vehicle must be one of ${CHAT_VEHICLES.join(", ")}`);
        continue;
      }
      if (VEHICLE_CAPACITY[vehicle] < travelers) {
        const fits = smallestVehicleFor(travelers);
        problems.push(
          `${day}: a ${vehicle} seats ${VEHICLE_CAPACITY[vehicle]}, but there are ${travelers} travelers` +
            (fits ? ` — use ${fits} or larger` : ""),
        );
        continue;
      }
      const priced = priceOptions(row.vehiclePrices).some(
        (o) => o.vehicle === vehicle && o.trip_type === tripType,
      );
      if (!priced) {
        problems.push(`${day}: "${slug}" has no ${vehicle} price for trip type "${tripType}" — pick one of the options search_services returned`);
        continue;
      }
      input.selectedServices!.push({ slug, vehicleSlug: vehicle, tripType: tripType as CatalogTripType });
    }

    for (const f of Array.isArray(c.entrance_fees) ? c.entrance_fees : []) {
      const fee = feeBySlug.get(String(f));
      if (!fee) {
        problems.push(`${day}: unknown entrance fee "${String(f)}" — look it up with list_entrance_fees`);
        continue;
      }
      input.selectedEntranceFees!.push(fee.slug);
    }

    for (const raw of Array.isArray(c.add_ons) ? c.add_ons : []) {
      const sel = (raw ?? {}) as Record<string, unknown>;
      const a = addOnById.get(Number(sel.id));
      if (!a) {
        problems.push(`${day}: unknown add-on id ${String(sel.id)} — look it up with list_add_ons`);
        continue;
      }
      if (a.cityName && !sameCity(a.cityName, cityName)) {
        problems.push(`${day}: "${addOnLabel(a)}" (id ${a.id}) is offered in ${a.cityName}, not ${cityName}`);
        continue;
      }
      const quantity = sel.quantity === undefined ? 1 : Number(sel.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        problems.push(`${day}: add-on quantity must be 1 to 10`);
        continue;
      }
      (input.selectedAddOns ??= []).push({ id: a.id, quantity });
    }

    const lang = typeof c.guide_language === "string" ? c.guide_language.trim() : "";
    if (lang) {
      const guide = guides.find((g) => sameCity(g.cityName, cityName) && sameCity(g.language, lang));
      if (!guide) {
        problems.push(`${day}: no ${lang}-speaking guide is listed in ${cityName} — check list_guides`);
      } else {
        input.cityId = guide.cityId;
        input.selectedGuide = { language: guide.language };
      }
    }

    const hasSomething =
      input.selectedServices!.length > 0 ||
      input.selectedEntranceFees!.length > 0 ||
      (input.selectedAddOns?.length ?? 0) > 0 ||
      input.selectedGuide;
    if (hasSomething) cityInputs.push(input);
  });

  // Refuse partial quotes: a total that silently dropped half the trip is
  // worse than no total.
  if (problems.length > 0) return fail(problems.join("; "));
  if (cityInputs.length === 0) return fail("nothing priced was selected");

  const built = await deps.buildQuote(cityInputs, travelers);
  const quote: VerifiedQuote = {
    kind: "custom",
    travelers: built.travelers,
    currency: "EGP",
    total: built.total,
    perPerson: Math.round((built.total / built.travelers) * 100) / 100,
    lines: built.lineItems.map((li) => ({
      label: labelFor(li, catalogBySlug, feeBySlug, addOnById),
      city: String((li.meta as Record<string, unknown> | undefined)?.cityName ?? ""),
      amount: li.lineTotal,
    })),
  };
  return {
    content: json({
      total: quote.total,
      per_person: quote.perPerson,
      travelers: quote.travelers,
      currency: "EGP",
      lines: quote.lines,
      days: (args.days as unknown[]).length,
      note:
        "The customer can already see this exact breakdown as a price card. Summarize it; do not restate every line. " +
        "Say clearly that hotels, sleeper trains and cruises are not included.",
    }),
    isError: false,
    quote,
  };
}
