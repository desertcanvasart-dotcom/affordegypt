// /admin/service-catalog/new and /admin/service-catalog/:id/edit.
//
// One component, parameterized by the URL. Slug is editable on /new
// and read-only after first save (the API also rejects slug mutation
// on PATCH). Vehicle pricing grid columns are sourced from active
// trip_types and rows from vehicle_types; empty cells are omitted from
// the saved vehicle_prices JSONB (matches the lookup convention in
// server/services/pricing.ts).
//
// Phase B handles English content only — the translation columns exist
// in the schema but the UI surfaces only the canonical name/description.
// Image upload is also out of scope; image_url is a plain text field.

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/hooks/use-toast";

const SUPPORTED_CITIES = [
  "Cairo", "Luxor", "Aswan", "Hurghada", "Sharm El Sheikh", "Alexandria", "Siwa",
];

const SLUG_RE = /^[a-z0-9-]+$/;

type ServiceCategory = { id: number; slug: string; name: string; isActive: boolean };
type TripTypeRow = { id: number; slug: string; name: string; isActive: boolean; sortOrder: number };
type VehicleType = { id: number; name: string };

type ServiceCatalogItem = {
  id: number;
  slug: string;
  name: string;
  city: string;
  category: string;
  pickupZone: string | null;
  description: string | null;
  vehiclePrices: Record<string, number>;
  durationHours: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  nameTranslations: Record<string, string> | null;
  descriptionTranslations: Record<string, string> | null;
};

type FormState = {
  slug: string;
  name: string;
  city: string;
  category: string;
  pickupZone: string;
  description: string;
  imageUrl: string;
  durationHours: string;
  sortOrder: string;
  isActive: boolean;
  prices: Record<string, string>;  // grid keys "{vehicleSlug}_{tripTypeSlug}" → string for input control
};

const blankForm = (): FormState => ({
  slug: "", name: "", city: "", category: "",
  pickupZone: "", description: "", imageUrl: "",
  durationHours: "", sortOrder: "0", isActive: true,
  prices: {},
});

export default function AdminServiceCatalogEdit() {
  const [, setLocation] = useLocation();
  const [editMatch, editParams] = useRoute("/admin/service-catalog/:id/edit");
  const isEdit = !!editMatch;
  const itemId = editParams?.id ? parseInt(editParams.id, 10) : null;
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState<FormState>(blankForm);

  // Fetch dependencies: categories (dropdown), active trip types
  // (price grid columns), vehicle types (price grid rows). For edit
  // mode also fetch the item itself.
  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/admin/service-categories"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/service-categories");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });

  const { data: tripTypes = [] } = useQuery<TripTypeRow[]>({
    queryKey: ["/api/admin/trip-types"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/trip-types");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });

  const { data: vehicles = [] } = useQuery<VehicleType[]>({
    queryKey: ["/api/vehicle-types"],
    queryFn: async () => {
      const res = await adminFetch("/api/vehicle-types");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });

  const { data: existing, isLoading: loadingItem } = useQuery<ServiceCatalogItem>({
    queryKey: ["/api/admin/service-catalog", itemId],
    queryFn: async () => {
      const res = await adminFetch(`/api/admin/service-catalog/${itemId}`);
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
    enabled: isEdit && !!itemId,
  });

  // Hydrate form when the existing item arrives (edit mode).
  useEffect(() => {
    if (!existing) return;
    const prices: Record<string, string> = {};
    for (const [k, v] of Object.entries(existing.vehiclePrices || {})) {
      prices[k] = v == null ? "" : String(v);
    }
    setForm({
      slug: existing.slug,
      name: existing.name,
      city: existing.city,
      category: existing.category,
      pickupZone: existing.pickupZone ?? "",
      description: existing.description ?? "",
      imageUrl: existing.imageUrl ?? "",
      durationHours: existing.durationHours == null ? "" : String(existing.durationHours),
      sortOrder: String(existing.sortOrder ?? 0),
      isActive: existing.isActive,
      prices,
    });
  }, [existing]);

  // Active trip types only — the price grid renders columns from these.
  const activeTripTypes = useMemo(
    () => tripTypes.filter((t) => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [tripTypes],
  );
  const vehicleSlugs = useMemo(
    () => vehicles.map((v) => v.name.toLowerCase()),
    [vehicles],
  );

  // ---- Save -----------------------------------------------------------

  const buildPayload = () => {
    // Empty cells are omitted entirely (matches pricing lookup convention
    // — see server/services/pricing.ts and bfde4a6).
    const vehiclePrices: Record<string, number> = {};
    for (const [k, v] of Object.entries(form.prices)) {
      const trimmed = (v ?? "").toString().trim();
      if (!trimmed) continue;
      const n = parseFloat(trimmed);
      if (Number.isFinite(n) && n > 0) vehiclePrices[k] = n;
    }

    const base: Record<string, any> = {
      name: form.name.trim(),
      city: form.city,
      category: form.category,
      pickupZone: form.pickupZone.trim() || null,
      description: form.description.trim() || null,
      imageUrl: form.imageUrl.trim() || null,
      durationHours: form.durationHours.trim() ? parseInt(form.durationHours, 10) : null,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
      vehiclePrices,
    };

    if (!isEdit) {
      base.slug = form.slug.trim();
    }
    return base;
  };

  const validate = (payload: Record<string, any>): string | null => {
    if (!isEdit && !SLUG_RE.test(payload.slug || "")) {
      return "Slug must be lowercase letters, numbers, hyphens";
    }
    if (!payload.name) return "Name is required";
    if (!payload.city) return "City is required";
    if (!payload.category) return "Category is required";
    if (Object.keys(payload.vehiclePrices).length === 0) {
      return "Enter at least one price (any vehicle × trip type), or the service is unbookable.";
    }
    return null;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      const err = validate(payload);
      if (err) throw new Error(err);

      const url = isEdit
        ? `/api/admin/service-catalog/${itemId}`
        : "/api/admin/service-catalog";
      const method = isEdit ? "PATCH" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Save failed (${res.status})`);
      }
      return res.json() as Promise<ServiceCatalogItem>;
    },
    onSuccess: (saved) => {
      toast({ title: isEdit ? "Service updated" : "Service created" });
      qc.invalidateQueries({ queryKey: ["/api/admin/service-catalog"] });
      if (!isEdit) {
        // Land on the edit URL so the slug becomes read-only and the
        // user can immediately keep tweaking the same row.
        setLocation(`/admin/service-catalog/${saved.id}/edit`);
      }
    },
    onError: (err: Error) =>
      toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  if (isEdit && loadingItem) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/service-catalog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to catalog
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit service" : "New service"}
            </h1>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} size="sm">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>

        {/* Identity */}
        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="slug">
                Slug {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-gray-500 text-xs"> — read-only after create</span>}
              </Label>
              <Input
                id="slug"
                placeholder="e.g. cairo-airport-to-pyramids"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                disabled={isEdit}
                className={isEdit ? "font-mono text-sm bg-gray-50" : "font-mono"}
              />
              <p className="text-xs text-gray-500 mt-1">URL-safe; lowercase letters, digits, hyphens</p>
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Cairo Airport → Pyramids of Giza Transfer"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
              />
              <Label htmlFor="active">Active</Label>
              <span className="text-xs text-gray-500 ml-3">Inactive items are hidden from the customer catalog.</span>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Select value={form.city} onValueChange={(v) => setForm((p) => ({ ...p, city: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.isActive).map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="pickupZone">Pickup zone</Label>
              <Input
                id="pickupZone"
                placeholder="e.g. East Bank, Sheikh Zayed, Hurghada Sahl Hasheesh"
                value={form.pickupZone}
                onChange={(e) => setForm((p) => ({ ...p, pickupZone: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional label for sub-zones within a city. If pickup affects price,
                create separate catalog rows per zone (one product per price).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationHours">Duration (hours)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  placeholder="for time-block products"
                  value={form.durationHours}
                  onChange={(e) => setForm((p) => ({ ...p, durationHours: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description + image */}
        <Card>
          <CardHeader><CardTitle>Description & image</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description (English)</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Customer-facing description. Markdown supported."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Other-locale translations live in <code>description_translations</code>;
                no UI for those in Phase B.
              </p>
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">No upload UI in Phase B — paste a URL.</p>
            </div>
          </CardContent>
        </Card>

        {/* Price grid */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle pricing grid</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Rows are vehicles, columns are <em>active</em> trip types from{" "}
              <Link href="/admin/trip-types"><a className="underline">/admin/trip-types</a></Link>.
              Each cell is independent. Empty cells are omitted from the stored
              <code> vehicle_prices </code>JSONB and treated as "not bookable" by the
              customer wizard. At least one cell across the grid is required.
            </p>
          </CardHeader>
          <CardContent>
            {activeTripTypes.length === 0 || vehicleSlugs.length === 0 ? (
              <p className="text-sm text-gray-500">
                Need at least one active trip type and one vehicle to render the grid.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-gray-500 font-medium pb-2 pr-3">Vehicle</th>
                      {activeTripTypes.map((tt) => (
                        <th key={tt.slug} className="text-left text-xs text-gray-500 font-medium pb-2 px-2 min-w-[140px]">
                          {tt.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleSlugs.map((vSlug) => (
                      <tr key={vSlug}>
                        <td className="text-sm font-medium pr-3 py-2 capitalize">{vSlug}</td>
                        {activeTripTypes.map((tt) => {
                          const key = `${vSlug}_${tt.slug}`;
                          return (
                            <td key={key} className="px-2 py-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="—"
                                value={form.prices[key] ?? ""}
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    prices: { ...p.prices, [key]: e.target.value },
                                  }))
                                }
                                className="text-sm"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
