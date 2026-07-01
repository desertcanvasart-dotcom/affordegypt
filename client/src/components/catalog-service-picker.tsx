// CatalogServicePicker — checkbox list of catalog services for the
// homepage planner steps 2 (transfers) and 3 (experiences). Reads from
// /api/services?city=<city>&category=<csv>, lets the customer pick a
// vehicle per row, and reports up the canonical serviceSlugs shape:
//   Array<{ slug, vehicleSlug, tripType }>
//
// One catalog row corresponds to one trip type (the import script
// derives a single trip type per row). The picker therefore doesn't
// expose a trip-type chooser — it just shows the row's trip type as a
// label so the customer knows what they're buying. Vehicle choice
// comes from whichever `${vehicle}_${tripType}` keys exist in
// vehicle_prices for that row.

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type VehicleSlug = "sedan" | "minivan" | "van";

export interface SelectedCatalogService {
  slug: string;
  vehicleSlug: VehicleSlug;
  tripType: string;
  // Display fields captured at pick time so review/breakdown screens
  // don't have to re-fetch the catalog row. The server ignores extras.
  name?: string;
  price?: number;
}

export interface CatalogRow {
  slug: string;
  name: string;
  city: string;
  category: string;
  pickup_zone: string | null;
  vehicle_prices: Record<string, number>;
  image_url: string | null;
  cheapest_price: number | null;
}

interface Props {
  city: string;
  categories: string[];
  selected: SelectedCatalogService[];
  onChange: (next: SelectedCatalogService[]) => void;
  emptyMessage?: string;
  // Number of travelers. Drives automatic vehicle selection: the picker
  // pre-selects the smallest vehicle that seats the group instead of
  // always defaulting to sedan. The customer can still override per row.
  travelers?: number;
}

export const TRIP_TYPE_LABELS: Record<string, string> = {
  one_way: "One-way",
  round_trip_same_day: "Round-trip (same day)",
  round_trip_multi_day: "Round-trip (multi-day)",
  "4hr": "4-hour rental",
  "8hr": "8-hour rental",
  "12hr": "12-hour rental",
};

export const VEHICLE_LABELS: Record<VehicleSlug, string> = {
  sedan: "Sedan",
  minivan: "Minivan",
  van: "Van",
};

function isVehicleSlug(v: string): v is VehicleSlug {
  return v === "sedan" || v === "minivan" || v === "van";
}

// Pull the unique trip type out of a row's vehicle_prices keys. Each
// key is `${vehicle}_${tripType}`. Rows produced by the import script
// always share a single trip type across vehicles.
function rowTripType(prices: Record<string, number>): string | null {
  const keys = Object.keys(prices);
  for (const k of keys) {
    for (const v of ["sedan", "minivan", "van"] as const) {
      if (k.startsWith(`${v}_`)) return k.slice(v.length + 1);
    }
  }
  return null;
}

function vehiclesForRow(prices: Record<string, number>, tripType: string): VehicleSlug[] {
  const out: VehicleSlug[] = [];
  for (const v of ["sedan", "minivan", "van"] as const) {
    if (`${v}_${tripType}` in prices) out.push(v);
  }
  return out;
}

// Seating capacity per vehicle. Mirrors the server rule in
// server/services/pricing.ts (pickVehicleSlugForPassengers): sedan ≤2,
// minivan ≤8, van otherwise. Kept in sync so the pre-selected vehicle
// matches what the pricing engine would pick for the same group size.
const VEHICLE_CAPACITY: Record<VehicleSlug, number> = {
  sedan: 2,
  minivan: 8,
  van: 15,
};

// Pick the vehicle for a group of `travelers`, constrained to the vehicles
// this row actually prices. Chooses the smallest vehicle that seats the
// group; if none is large enough, falls back to the largest available.
function pickVehicleForPassengers(
  available: VehicleSlug[],
  travelers: number,
): VehicleSlug {
  const sorted = [...available].sort(
    (a, b) => VEHICLE_CAPACITY[a] - VEHICLE_CAPACITY[b],
  );
  for (const v of sorted) {
    if (VEHICLE_CAPACITY[v] >= travelers) return v;
  }
  return sorted[sorted.length - 1];
}

function isDefaultZone(zone: string | null | undefined, city: string): boolean {
  if (!zone) return true;
  return zone.trim().toLowerCase() === `${city} center`.toLowerCase();
}

const formatEGP = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

export default function CatalogServicePicker({
  city,
  categories,
  selected,
  onChange,
  emptyMessage = "No catalog services available for this combination yet.",
  travelers = 1,
}: Props) {
  const [search, setSearch] = useState("");
  const cityLower = city.toLowerCase();
  const queryUrl = `/api/services?city=${encodeURIComponent(cityLower)}&category=${encodeURIComponent(categories.join(","))}`;

  const { data, isLoading, isError } = useQuery<CatalogRow[]>({
    queryKey: [queryUrl],
    queryFn: async () => {
      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  // O(1) lookup for selected slugs. The picker only sets the row as
  // "selected" when an entry with this slug exists; it doesn't try to
  // dedupe against vehicle/tripType — those mutate in place.
  const selectedBySlug = useMemo(() => {
    const m = new Map<string, SelectedCatalogService>();
    for (const s of selected) m.set(s.slug, s);
    return m;
  }, [selected]);

  // Slugs the picker is responsible for in this render. Other slugs
  // in `selected` (e.g. step-2 transfers when this picker is rendered
  // in step 3 for experiences) MUST be preserved by every onChange.
  const inScopeSlugs = useMemo(() => {
    const s = new Set<string>();
    for (const r of data ?? []) s.add(r.slug);
    return s;
  }, [data]);

  // When the traveler count changes, re-derive the vehicle on every
  // already-selected row so the pre-selection keeps matching the group
  // size. Only fires on an actual travelers change (guarded by a ref) so
  // it never stomps a manual override on an unrelated re-render, and only
  // touches in-scope rows. Out-of-scope selections pass through untouched.
  const prevTravelers = useRef(travelers);
  useEffect(() => {
    if (prevTravelers.current === travelers) return;
    prevTravelers.current = travelers;
    if (!data) return;
    let changed = false;
    const next = selected.map((s) => {
      if (!inScopeSlugs.has(s.slug)) return s;
      const row = data.find((r) => r.slug === s.slug);
      if (!row) return s;
      const vs = vehiclesForRow(row.vehicle_prices, s.tripType);
      if (vs.length === 0) return s;
      const vehicleSlug = pickVehicleForPassengers(vs, travelers);
      if (vehicleSlug === s.vehicleSlug) return s;
      changed = true;
      return {
        ...s,
        vehicleSlug,
        price: row.vehicle_prices[`${vehicleSlug}_${s.tripType}`],
      };
    });
    if (changed) onChange(next);
  }, [travelers, data, selected, inScopeSlugs, onChange]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading services…</p>;
  }
  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Couldn't load services. Try refreshing.
      </p>
    );
  }
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const handleToggle = (row: CatalogRow, checked: boolean) => {
    const tripType = rowTripType(row.vehicle_prices);
    if (!tripType) return;
    const others = selected.filter((s) => s.slug !== row.slug);
    if (checked) {
      const vs = vehiclesForRow(row.vehicle_prices, tripType);
      if (vs.length === 0) return;
      // Auto-select the vehicle that seats this group instead of always
      // defaulting to sedan. The customer can still change it per row.
      const vehicleSlug: VehicleSlug = pickVehicleForPassengers(vs, travelers);
      const price = row.vehicle_prices[`${vehicleSlug}_${tripType}`];
      onChange([
        ...others,
        { slug: row.slug, vehicleSlug, tripType, name: row.name, price },
      ]);
    } else {
      onChange(others);
    }
  };

  const handleVehicleChange = (slug: string, vehicleSlug: VehicleSlug) => {
    // Only mutate the entry whose slug matches; out-of-scope entries
    // pass through unchanged. Re-snapshot the per-vehicle price.
    void inScopeSlugs;
    const row = data?.find((r) => r.slug === slug);
    onChange(
      selected.map((s) => {
        if (s.slug !== slug) return s;
        const price = row
          ? row.vehicle_prices[`${vehicleSlug}_${s.tripType}`]
          : s.price;
        return { ...s, vehicleSlug, price };
      }),
    );
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.pickup_zone ?? "").toLowerCase().includes(q),
      )
    : data;

  return (
    <div className="space-y-2">
      {data.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfers…"
            className="h-9 pl-8 text-sm"
            data-testid="catalog-search"
          />
        </div>
      )}
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
      {filtered.length === 0 && (
        <p className="py-2 text-sm text-muted-foreground">
          No transfers match “{search}”.
        </p>
      )}
      {filtered.map((row) => {
        const tripType = rowTripType(row.vehicle_prices);
        if (!tripType) return null;
        const vs = vehiclesForRow(row.vehicle_prices, tripType);
        const sel = selectedBySlug.get(row.slug);
        const isChecked = !!sel;
        const currentVehicle: VehicleSlug = sel?.vehicleSlug ?? (vs[0] ?? "sedan");
        const currentPrice = row.vehicle_prices[`${currentVehicle}_${tripType}`];
        const showZone = !isDefaultZone(row.pickup_zone, city);

        return (
          <Card
            key={row.slug}
            className="p-3"
            data-testid={`catalog-row-${row.slug}`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                id={`catalog-${row.slug}`}
                checked={isChecked}
                onCheckedChange={(c) => handleToggle(row, c === true)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label
                  htmlFor={`catalog-${row.slug}`}
                  className="text-sm font-semibold cursor-pointer block"
                >
                  {row.name}
                </Label>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {TRIP_TYPE_LABELS[tripType] ?? tripType}
                  </Badge>
                  {showZone && row.pickup_zone && (
                    <span className="text-xs text-muted-foreground">
                      Pickup: {row.pickup_zone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isChecked && vs.length > 1 ? (
                  <Select
                    value={currentVehicle}
                    onValueChange={(v) =>
                      isVehicleSlug(v) && handleVehicleChange(row.slug, v)
                    }
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vs.map((v) => (
                        <SelectItem key={v} value={v}>
                          {VEHICLE_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : isChecked ? (
                  <Badge variant="secondary" className="text-xs">
                    {VEHICLE_LABELS[currentVehicle]}
                  </Badge>
                ) : null}
                {currentPrice !== undefined && (
                  <span className="text-sm font-semibold">
                    {formatEGP(currentPrice)} EGP
                  </span>
                )}
              </div>
            </div>
          </Card>
        );
      })}
      </div>
    </div>
  );
}
