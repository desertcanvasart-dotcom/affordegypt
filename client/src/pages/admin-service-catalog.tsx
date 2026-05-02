// /admin/service-catalog — list view + filters + search.
// Editing happens at /admin/service-catalog/:id/edit; new items at
// /admin/service-catalog/new. Both routed via wouter to the editor page.
//
// Search matches against name, slug, or pickup_zone (operators searching
// for "all the Sheikh Zayed transfers" should land on the right rows).

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

type ServiceCategory = { id: number; slug: string; name: string; isActive: boolean };
type ServiceCatalogItem = {
  id: number;
  slug: string;
  name: string;
  city: string;
  category: string;
  pickupZone: string | null;
  vehiclePrices: Record<string, number>;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
  nameTranslations: Record<string, string> | null;
};

const englishName = (item: ServiceCatalogItem): string =>
  item.nameTranslations?.en || item.name || item.slug;

const formatTimestamp = (iso: string): string => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function AdminServiceCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<"all" | "true" | "false">("all");

  const { data: items = [], isLoading } = useQuery<ServiceCatalogItem[]>({
    queryKey: ["/api/admin/service-catalog", { search, category, active }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (category !== "all") params.set("category", category);
      if (active !== "all") params.set("active", active);
      const res = await adminFetch(`/api/admin/service-catalog?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/admin/service-categories"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/service-categories");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      return res.json();
    },
  });

  const categoryByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.slug, c.name);
    return m;
  }, [categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Service Catalog</h1>
          </div>
          <Link href="/admin/service-catalog/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New service
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Catalog
              <Badge variant="outline" className="font-normal">
                {items.length} {items.length === 1 ? "item" : "items"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, slug, or pickup zone…"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={active} onValueChange={(v) => setActive(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active only</SelectItem>
                  <SelectItem value="false">Inactive only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Pickup zone</TableHead>
                    <TableHead className="w-20 text-center">Prices</TableHead>
                    <TableHead className="w-24 text-center">Active</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const priceCount = item.vehiclePrices ? Object.keys(item.vehiclePrices).length : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{englishName(item)}</div>
                          <div className="font-mono text-xs text-gray-500">{item.slug}</div>
                        </TableCell>
                        <TableCell>{item.city}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoryByName.get(item.category) ?? item.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {item.pickupZone || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={priceCount > 0 ? "default" : "secondary"}>{priceCount}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.isActive ? (
                            <Badge>Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {formatTimestamp(item.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/service-catalog/${item.id}/edit`}>
                            <Button size="sm" variant="outline">Edit</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-gray-500 py-8">
                        No catalog items match the filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
