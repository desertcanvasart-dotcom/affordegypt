// /transfers — the "Transfer Only" module: book a single transfer
// (intercity / airport / local) without building a full itinerary.
//
// Data source is the service_catalog via GET /api/services — the same
// catalog the homepage planner prices from. The legacy `routes` table
// this page used to read is empty in production and no longer consulted.
//
// Booking goes through the catalog quote path: POST /api/quotes freezes
// the price server-side (single-city cityServices payload), then
// POST /api/bookings books against the frozen quote — identical to the
// planner's checkout, so the charged total can never drift from the
// catalog price shown here.
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Car,
  CheckCircle,
  Zap,
  Plane,
  Building,
  Navigation,
  Search,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { formatEGP } from "@/lib/utils";
import { formatEGPPlain } from "@/lib/service-pricing";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import {
  type CatalogRow,
  type VehicleSlug,
  TRIP_TYPE_LABELS,
  VEHICLE_LABELS,
} from "@/components/catalog-service-picker";

// Hero + step labels in the four site languages. Booking-form labels and
// legal fine print stay English, matching the planner checkout.
const transfersContent = {
  en: {
    title: "Transfer Only",
    subtitle: "Simple point-to-point transportation across Egypt",
    instantQuotes: "Instant quotes",
    noHiddenFees: "No hidden fees",
    licensedDrivers: "Licensed drivers",
    intercity: "Intercity",
    airport: "Airport",
    local: "In-town",
    city: "City",
    allCities: "All cities",
    travelers: "Travelers",
    searchPlaceholder: "Search transfers…",
    from: "From",
    selectVehicle: "Select Vehicle",
    chooseVehicle: "Choose your vehicle for this transfer",
    back: "← Back to transfers",
    serviceType: "Service Type",
    pickup: "Pickup",
    dropoff: "Drop-off",
    eitherDirection: "either direction",
    anywhereInTown: "anywhere in town",
  },
  es: {
    title: "Solo Traslado",
    subtitle: "Transporte simple punto a punto por Egipto",
    instantQuotes: "Cotizaciones instantáneas",
    noHiddenFees: "Sin costos ocultos",
    licensedDrivers: "Conductores licenciados",
    intercity: "Interurbano",
    airport: "Aeropuerto",
    local: "En la ciudad",
    city: "Ciudad",
    allCities: "Todas las ciudades",
    travelers: "Viajeros",
    searchPlaceholder: "Buscar traslados…",
    from: "Desde",
    selectVehicle: "Seleccionar Vehículo",
    chooseVehicle: "Elige tu vehículo para este traslado",
    back: "← Volver a traslados",
    serviceType: "Tipo de Servicio",
    pickup: "Recogida",
    dropoff: "Destino",
    eitherDirection: "en ambas direcciones",
    anywhereInTown: "cualquier lugar de la ciudad",
  },
  fr: {
    title: "Transfert Uniquement",
    subtitle: "Transport simple point à point à travers l'Égypte",
    instantQuotes: "Devis instantanés",
    noHiddenFees: "Pas de frais cachés",
    licensedDrivers: "Chauffeurs agréés",
    intercity: "Intercité",
    airport: "Aéroport",
    local: "En ville",
    city: "Ville",
    allCities: "Toutes les villes",
    travelers: "Voyageurs",
    searchPlaceholder: "Rechercher des transferts…",
    from: "À partir de",
    selectVehicle: "Sélectionner le Véhicule",
    chooseVehicle: "Choisissez votre véhicule pour ce transfert",
    back: "← Retour aux transferts",
    serviceType: "Type de Service",
    pickup: "Prise en charge",
    dropoff: "Dépose",
    eitherDirection: "dans les deux sens",
    anywhereInTown: "n'importe où en ville",
  },
  de: {
    title: "Nur Transfer",
    subtitle: "Einfacher Punkt-zu-Punkt-Transport durch Ägypten",
    instantQuotes: "Sofortige Angebote",
    noHiddenFees: "Keine versteckten Gebühren",
    licensedDrivers: "Lizenzierte Fahrer",
    intercity: "Intercity",
    airport: "Flughafen",
    local: "In der Stadt",
    city: "Stadt",
    allCities: "Alle Städte",
    travelers: "Reisende",
    searchPlaceholder: "Transfers suchen…",
    from: "Ab",
    selectVehicle: "Fahrzeug Auswählen",
    chooseVehicle: "Wählen Sie Ihr Fahrzeug für diesen Transfer",
    back: "← Zurück zu Transfers",
    serviceType: "Service-Typ",
    pickup: "Abholung",
    dropoff: "Ziel",
    eitherDirection: "in beide Richtungen",
    anywhereInTown: "überall in der Stadt",
  },
};

const CATEGORY_TABS = [
  { slug: "intercity_transfer", labelKey: "intercity", icon: Navigation },
  { slug: "airport_transfer", labelKey: "airport", icon: Plane },
  { slug: "local_transfer", labelKey: "local", icon: Building },
] as const;

const VEHICLE_SLUGS = ["sedan", "minivan", "van"] as const;

// Mirrors the server rule in server/services/pricing.ts
// (pickVehicleSlugForPassengers): sedan ≤2, minivan ≤8, van otherwise.
const VEHICLE_CAPACITY: Record<VehicleSlug, number> = {
  sedan: 2,
  minivan: 8,
  van: 15,
};

const VEHICLE_SEATS_LABEL: Record<VehicleSlug, string> = {
  sedan: "1–2 passengers",
  minivan: "3–8 passengers",
  van: "9–15 passengers",
};

interface CatalogCity {
  slug: string;
  name: string;
  count: number;
}

// vehicle_prices keys are `${vehicleSlug}_${tripTypeSlug}` (trip types
// themselves contain underscores, so split on the known vehicle prefixes).
// Returns tripType → vehicle → price, positive prices only.
function parseVehiclePrices(
  prices: Record<string, number> | null | undefined,
): Map<string, Partial<Record<VehicleSlug, number>>> {
  const out = new Map<string, Partial<Record<VehicleSlug, number>>>();
  for (const [key, raw] of Object.entries(prices ?? {})) {
    const vehicle = VEHICLE_SLUGS.find((v) => key.startsWith(`${v}_`));
    if (!vehicle) continue;
    const tripType = key.slice(vehicle.length + 1);
    const n = typeof raw === "number" ? raw : parseFloat(String(raw));
    if (!Number.isFinite(n) || n <= 0) continue;
    const byVehicle = out.get(tripType) ?? {};
    byVehicle[vehicle] = n;
    out.set(tripType, byVehicle);
  }
  return out;
}

// Smallest priced vehicle that seats the group; largest available if none.
function pickVehicleForPassengers(
  available: VehicleSlug[],
  travelers: number,
): VehicleSlug | null {
  const sorted = [...available].sort(
    (a, b) => VEHICLE_CAPACITY[a] - VEHICLE_CAPACITY[b],
  );
  if (sorted.length === 0) return null;
  for (const v of sorted) {
    if (VEHICLE_CAPACITY[v] >= travelers) return v;
  }
  return sorted[sorted.length - 1];
}

function isDefaultZone(zone: string | null | undefined, city: string): boolean {
  if (!zone) return true;
  return zone.trim().toLowerCase() === `${city} center`.toLowerCase();
}

// Pickup/drop-off endpoints parsed from the route name. Names are
// "A → B", "A → stops → B", or "A ↔ B" (either direction); the first
// segment is the pickup and the last the drop-off. Trip-mode
// parentheticals ("Next Day Return", "Over Day") are stripped; zone
// parentheticals ("South City", "Aswan Bridge") are kept — they locate
// the endpoint.
const TRIP_MODE_PARENS =
  /\s*\((?:[^)]*(?:same day|next day|over\s?day|overnight|full day|with visits?|\d+\s?hrs?)[^)]*)\)\s*$/i;

function parseEndpoints(
  name: string,
): { pickup: string; dropoff: string; bidirectional: boolean } | null {
  const bidirectional = name.includes("↔");
  const parts = name
    .split(/[↔→]/)
    .map((p) => p.replace(TRIP_MODE_PARENS, "").trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  return { pickup: parts[0], dropoff: parts[parts.length - 1], bidirectional };
}

// One line of pickup/drop-off info for a catalog row. Falls back to the
// bare pickup zone when the name has no parseable endpoints. The
// operator's zone (when it isn't the "<City> Center" default) refines
// the pickup endpoint unless it just repeats it.
// "Hotel → Local Transfer" names describe a ride anywhere within town —
// the last segment is a service descriptor, not a destination.
const SERVICE_DESCRIPTOR = /^((?:local|city)\s+transfer)\s*(\(.+\))?$/i;

function endpointsLine(
  row: { name: string; pickup_zone?: string | null; city: string },
  t: {
    pickup: string;
    dropoff: string;
    eitherDirection: string;
    anywhereInTown: string;
  },
  includesOneWay: boolean,
): string | null {
  const zone = !isDefaultZone(row.pickup_zone, row.city) ? row.pickup_zone! : null;
  const ep = parseEndpoints(row.name);
  if (!ep) return zone ? `${t.pickup}: ${zone}` : null;
  // Zones lifted from a parenthetical in the name ("(to Acacia)",
  // "(Sphinx)") are already visible at the endpoint they describe —
  // appending them to the pickup would misplace them.
  const pickup =
    zone &&
    zone.trim().toLowerCase() !== ep.pickup.toLowerCase() &&
    !row.name.toLowerCase().includes(zone.trim().toLowerCase())
      ? `${ep.pickup} (${zone})`
      : ep.pickup;
  const dm = ep.dropoff.match(SERVICE_DESCRIPTOR);
  const dropoff = dm
    ? dm[2]
      ? `${t.anywhereInTown} ${dm[2]}`
      : t.anywhereInTown
    : ep.dropoff;
  const base = `${t.pickup}: ${pickup} · ${t.dropoff}: ${dropoff}`;
  // "either direction" only makes sense for one-way ↔ rows — on a round
  // trip the ↔ in the name is just notation, the customer returns anyway.
  return ep.bidirectional && includesOneWay ? `${base} · ${t.eitherDirection}` : base;
}

// The rate a group of `travelers` would actually pay for a row: for each
// trip type, the smallest priced vehicle that seats the group; across
// trip types, the cheapest such option. This is what browse cards show —
// NOT the row's cheapest_price, which is always the smallest vehicle
// (a sedan rate is meaningless for a group of 4).
function bestOptionForTravelers(
  map: Map<string, Partial<Record<VehicleSlug, number>>>,
  travelers: number,
): { tripType: string; vehicle: VehicleSlug; price: number } | null {
  let best: { tripType: string; vehicle: VehicleSlug; price: number } | null = null;
  map.forEach((byVehicle, tripType) => {
    const available = VEHICLE_SLUGS.filter((v) => byVehicle[v] !== undefined);
    const vehicle = pickVehicleForPassengers(available, travelers);
    if (!vehicle) return;
    const price = byVehicle[vehicle];
    if (price === undefined) return;
    if (!best || price < best.price) best = { tripType, vehicle, price };
  });
  return best;
}

interface BookingSuccess {
  reference: string;
  total: string;
  email: string;
}

export default function TransfersPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTab, setActiveTab] = useState<string>("intercity_transfer");
  const [citySlug, setCitySlug] = useState<string>("all");
  const [travelers, setTravelers] = useState(2);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<CatalogRow | null>(null);
  const [tripType, setTripType] = useState<string>("");
  const [vehicleSlug, setVehicleSlug] = useState<VehicleSlug | null>(null);
  const [travelDate, setTravelDate] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
    termsAccepted: false,
    bookingPolicyAccepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<BookingSuccess | null>(null);

  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || "en";
  const language = ["en", "es", "fr", "de"].includes(currentLanguage)
    ? currentLanguage
    : "en";
  const t =
    transfersContent[language as keyof typeof transfersContent] ||
    transfersContent.en;

  // Cities that actually have catalog rows (unlike the legacy /api/cities).
  const { data: cities = [] } = useQuery<CatalogCity[]>({
    queryKey: ["/api/services/cities"],
    queryFn: async () => {
      const res = await fetch("/api/services/cities");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const servicesUrl = `/api/services?category=${encodeURIComponent(activeTab)}${
    citySlug !== "all" ? `&city=${encodeURIComponent(citySlug)}` : ""
  }`;
  const {
    data: services = [],
    isLoading,
    isError,
  } = useQuery<CatalogRow[]>({
    queryKey: [servicesUrl],
    queryFn: async () => {
      const res = await fetch(servicesUrl);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    const rows = q
      ? services.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.city.toLowerCase().includes(q) ||
            (r.pickup_zone ?? "").toLowerCase().includes(q),
        )
      : services;
    // Stable, scannable order: by city, then name.
    return [...rows].sort(
      (a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
    );
  }, [services, q]);

  const priceMap = useMemo(
    () => parseVehiclePrices(selectedRow?.vehicle_prices),
    [selectedRow],
  );
  const tripTypes = useMemo(() => Array.from(priceMap.keys()), [priceMap]);
  const vehiclesForTripType = useMemo(() => {
    const byVehicle = priceMap.get(tripType) ?? {};
    return VEHICLE_SLUGS.filter((v) => byVehicle[v] !== undefined);
  }, [priceMap, tripType]);
  const selectedPrice =
    vehicleSlug !== null
      ? priceMap.get(tripType)?.[vehicleSlug] ?? null
      : null;

  const handleSelectTransfer = (row: CatalogRow) => {
    const map = parseVehiclePrices(row.vehicle_prices);
    const firstTripType = Array.from(map.keys())[0] ?? "";
    const available = VEHICLE_SLUGS.filter(
      (v) => map.get(firstTripType)?.[v] !== undefined,
    );
    setSelectedRow(row);
    setTripType(firstTripType);
    setVehicleSlug(pickVehicleForPassengers(available, travelers));
    setSubmitError(null);
    window.scrollTo(0, 0);
  };

  const handleTripTypeChange = (next: string) => {
    setTripType(next);
    const available = VEHICLE_SLUGS.filter(
      (v) => priceMap.get(next)?.[v] !== undefined,
    );
    setVehicleSlug(pickVehicleForPassengers(available, travelers));
  };

  const handleTravelersChange = (value: string) => {
    const n = parseInt(value, 10);
    setTravelers(n);
    // Keep the pre-selected vehicle matching the group size (the
    // customer can still override by clicking a different card).
    if (selectedRow) {
      setVehicleSlug(pickVehicleForPassengers(vehiclesForTripType, n));
    }
  };

  const resetToList = () => {
    setSelectedRow(null);
    setTripType("");
    setVehicleSlug(null);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedRow || !vehicleSlug || selectedPrice === null) return;
    if (!travelDate) {
      setSubmitError("Please choose a travel date.");
      return;
    }
    if (!form.name.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }
    if (!form.phone.trim()) {
      setSubmitError("Please enter your phone number.");
      return;
    }
    if (!form.termsAccepted || !form.bookingPolicyAccepted) {
      setSubmitError("Please accept the terms and the booking policy.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Freeze the price server-side. Same single-source pricing engine
      // as the planner (buildMultiCityQuote); the server ignores any
      // client-side price and recomputes from the catalog.
      const cityServices = [
        {
          dayNumber: 1,
          cityName: selectedRow.city,
          date: travelDate,
          travelers,
          selectedServices: [
            {
              slug: selectedRow.slug,
              vehicleSlug,
              tripType,
              name: selectedRow.name,
              price: selectedPrice,
            },
          ],
          attractions: "",
          selectedAttractions: [],
          selectedAddOns: [],
        },
      ];

      const quoteResponse = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityServices,
          travelers,
          jsonBlob: {
            cityServices,
            travelDate,
            travelers,
            source: "transfers-page",
          },
        }),
      });
      if (!quoteResponse.ok) throw new Error("Failed to create quote");
      const quote = await quoteResponse.json();

      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote.id,
          travelDate,
          travelers,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          specialRequests: form.specialRequests,
          paymentMethod: "pending",
          paymentStatus: "pending",
        }),
      });
      if (!bookingResponse.ok) throw new Error("Failed to create booking");
      const booking = await bookingResponse.json();

      setSuccess({
        reference: booking.bookingReference,
        total: quote.total ?? String(selectedPrice),
        email: form.email,
      });
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Transfer booking error:", err);
      setSubmitError("Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentStep = success ? 3 : selectedRow ? 2 : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <SeoMeta
        title="Egypt Airport & Intercity Transfers | Private Car from LE 595"
        description={`Private airport and intercity transfers across Egypt from ${formatEGPPlain("luxor-airport-transfer")}. Fixed prices, licensed drivers, flight monitoring. Book direct, no middlemen.`}
        canonical="https://affordegypt.com/transfers"
        schema={breadcrumbSchema(trailFor("/transfers")!)}
      />
      <Navbar />
      <PageBreadcrumbs />

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              {t.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>{t.instantQuotes}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>{t.noHiddenFees}</span>
              </div>
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-2" />
                <span>{t.licensedDrivers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2].map((step, i) => (
              <div key={step} className="flex items-center space-x-4">
                {i > 0 && <div className="w-12 h-0.5 bg-gray-200"></div>}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step
                      ? "bg-teal-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {success ? (
          // Confirmation
          <Card data-testid="transfer-booking-success">
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle className="w-14 h-14 text-teal-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">
                Booking request submitted!
              </h2>
              <p className="text-gray-600">
                Booking reference:{" "}
                <span className="font-mono font-semibold">
                  {success.reference}
                </span>
              </p>
              <p className="text-gray-600">
                Total:{" "}
                <span className="font-semibold text-teal-700">
                  {formatEGP(success.total)}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                A confirmation email has been sent to {success.email}. We'll
                contact you shortly to confirm pickup details.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess(null);
                  resetToList();
                  setForm({
                    name: "",
                    email: "",
                    phone: "",
                    specialRequests: "",
                    termsAccepted: false,
                    bookingPolicyAccepted: false,
                  });
                  setTravelDate("");
                }}
                data-testid="button-book-another"
              >
                Book another transfer
              </Button>
            </CardContent>
          </Card>
        ) : !selectedRow ? (
          // Step 1: Browse transfers
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
              <TabsList className="grid w-full grid-cols-3">
                {CATEGORY_TABS.map(({ slug, labelKey, icon: Icon }) => (
                  <TabsTrigger
                    key={slug}
                    value={slug}
                    className="flex items-center space-x-2"
                    data-testid={`tab-${slug}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t[labelKey]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.city}
                    </label>
                    <Select value={citySlug} onValueChange={setCitySlug}>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allCities}</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.slug} value={city.slug}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.travelers}
                    </label>
                    <Select
                      value={String(travelers)}
                      onValueChange={handleTravelersChange}
                    >
                      <SelectTrigger data-testid="select-travelers">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(
                          (n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="pl-9"
                    data-testid="transfers-search"
                  />
                </div>

                {/* Transfer list */}
                {isLoading ? (
                  <p className="text-sm text-gray-500 py-4">Loading transfers…</p>
                ) : isError ? (
                  <p className="text-sm text-gray-500 py-4">
                    Couldn't load transfers. Try refreshing.
                  </p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">
                    No transfers available for this selection yet. Try another
                    city or category, or contact us for a custom quote.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((row) => {
                      const map = parseVehiclePrices(row.vehicle_prices);
                      const rowTripTypes = Array.from(map.keys());
                      if (rowTripTypes.length === 0) return null;
                      const endpoints = endpointsLine(
                        row,
                        t,
                        rowTripTypes.includes("one_way"),
                      );
                      return (
                        <div
                          key={row.slug}
                          className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors bg-white"
                          onClick={() => handleSelectTransfer(row)}
                          data-testid={`transfer-card-${row.slug}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{row.name}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {row.city}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {rowTripTypes.map((tt) => (
                              <Badge key={tt} variant="outline" className="text-xs">
                                {TRIP_TYPE_LABELS[tt] ?? tt}
                              </Badge>
                            ))}
                            {endpoints && (
                              <span className="text-xs text-gray-500">
                                {endpoints}
                              </span>
                            )}
                          </div>
                          {(() => {
                            const best = bestOptionForTravelers(map, travelers);
                            if (!best) return null;
                            return (
                              <p
                                className="text-sm mt-2"
                                data-testid={`transfer-price-${row.slug}`}
                              >
                                {rowTripTypes.length > 1 && (
                                  <span className="text-gray-500">{t.from} </span>
                                )}
                                <span className="font-semibold text-teal-700">
                                  {formatEGP(best.price)}
                                </span>
                                <span className="text-gray-500">
                                  {" "}
                                  · {VEHICLE_LABELS[best.vehicle]}
                                </span>
                              </p>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Step 2: Vehicle + booking details
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t.selectVehicle}
                </h2>
                <p className="text-gray-600 mt-1">{t.chooseVehicle}</p>
              </div>
              <button
                onClick={resetToList}
                className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium"
                data-testid="button-back-to-list"
              >
                {t.back}
              </button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedRow.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedRow.city}
                  </Badge>
                  {tripTypes.length === 1 && (
                    <Badge variant="outline" className="text-xs">
                      {TRIP_TYPE_LABELS[tripType] ?? tripType}
                    </Badge>
                  )}
                  {(() => {
                    const line = endpointsLine(
                      selectedRow,
                      t,
                      tripTypes.includes("one_way"),
                    );
                    return line ? (
                      <span className="text-xs text-gray-500">{line}</span>
                    ) : null;
                  })()}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trip type selector — only when the row prices several */}
                {tripTypes.length > 1 && (
                  <div className="max-w-xs">
                    <Label className="mb-2 block">{t.serviceType}</Label>
                    <Select value={tripType} onValueChange={handleTripTypeChange}>
                      <SelectTrigger data-testid="select-trip-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tripTypes.map((tt) => (
                          <SelectItem key={tt} value={tt}>
                            {TRIP_TYPE_LABELS[tt] ?? tt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Vehicle cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vehiclesForTripType.length === 0 ? (
                    <div className="col-span-full text-sm text-gray-500 p-4 border rounded-lg">
                      Pricing not yet set for this transfer. Please contact us
                      for a quote.
                    </div>
                  ) : (
                    vehiclesForTripType.map((v) => {
                      const price = priceMap.get(tripType)?.[v];
                      const isSelected = vehicleSlug === v;
                      return (
                        <div
                          key={v}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            isSelected
                              ? "border-teal-600 ring-2 ring-teal-600/20 bg-teal-50/50"
                              : "hover:border-teal-300"
                          }`}
                          onClick={() => setVehicleSlug(v)}
                          data-testid={`vehicle-card-${v}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{VEHICLE_LABELS[v]}</h3>
                            <Car
                              className={`w-5 h-5 ${
                                isSelected ? "text-teal-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                          <p className="text-2xl font-bold text-teal-600">
                            {formatEGP(price ?? 0)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {VEHICLE_SEATS_LABEL[v]}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Booking details */}
                {vehiclesForTripType.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transfer-date" className="mb-2 block">
                          Travel date *
                        </Label>
                        <Input
                          id="transfer-date"
                          type="date"
                          value={travelDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => setTravelDate(e.target.value)}
                          data-testid="input-travel-date"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">{t.travelers}</Label>
                        <Select
                          value={String(travelers)}
                          onValueChange={handleTravelersChange}
                        >
                          <SelectTrigger data-testid="select-travelers-step2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(
                              (n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="transfer-name" className="mb-2 block">
                          Full name *
                        </Label>
                        <Input
                          id="transfer-name"
                          value={form.name}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, name: e.target.value }))
                          }
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-email" className="mb-2 block">
                          Email *
                        </Label>
                        <Input
                          id="transfer-email"
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                          }
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-phone" className="mb-2 block">
                          Phone / WhatsApp *
                        </Label>
                        <Input
                          id="transfer-phone"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, phone: e.target.value }))
                          }
                          data-testid="input-phone"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="transfer-requests" className="mb-2 block">
                        Special requests (pickup time, hotel name, flight
                        number…)
                      </Label>
                      <Textarea
                        id="transfer-requests"
                        value={form.specialRequests}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            specialRequests: e.target.value,
                          }))
                        }
                        rows={3}
                        data-testid="input-special-requests"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="transfer-terms"
                          checked={form.termsAccepted}
                          onCheckedChange={(c) =>
                            setForm((p) => ({
                              ...p,
                              termsAccepted: c === true,
                            }))
                          }
                          className="mt-0.5"
                          data-testid="checkbox-terms"
                        />
                        <Label
                          htmlFor="transfer-terms"
                          className="text-xs leading-tight cursor-pointer"
                        >
                          I agree to the{" "}
                          <a
                            href="/terms-of-service"
                            className="text-teal-700 hover:underline"
                            target="_blank"
                          >
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a
                            href="/privacy-policy"
                            className="text-teal-700 hover:underline"
                            target="_blank"
                          >
                            Privacy Policy
                          </a>
                        </Label>
                      </div>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="transfer-policy"
                          checked={form.bookingPolicyAccepted}
                          onCheckedChange={(c) =>
                            setForm((p) => ({
                              ...p,
                              bookingPolicyAccepted: c === true,
                            }))
                          }
                          className="mt-0.5"
                          data-testid="checkbox-booking-policy"
                        />
                        <Label
                          htmlFor="transfer-policy"
                          className="text-xs leading-tight cursor-pointer"
                        >
                          I understand and accept the{" "}
                          <a
                            href="/booking-agreement"
                            className="text-teal-700 hover:underline"
                            target="_blank"
                          >
                            Booking Policy
                          </a>{" "}
                          and cancellation terms
                        </Label>
                      </div>
                    </div>

                    {submitError && (
                      <p
                        className="text-sm text-red-600"
                        data-testid="submit-error"
                      >
                        {submitError}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p
                          className="text-2xl font-bold text-teal-700"
                          data-testid="transfer-total"
                        >
                          {formatEGP(selectedPrice ?? 0)}
                        </p>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || selectedPrice === null}
                        className="bg-teal-600 hover:bg-teal-700 h-11 px-8"
                        data-testid="button-submit-transfer"
                      >
                        {submitting ? "Submitting…" : "Request Booking"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      No prepayment required — we confirm availability first.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <button
              onClick={resetToList}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t.back.replace("← ", "")}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
