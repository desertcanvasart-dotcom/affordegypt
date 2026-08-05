// Admin CRUD for the trip-type vocabulary used inside service_catalog
// vehicle_prices keys (`${vehicle}_${tripType}`). Slugs are write-once
// after create — the schema enforces, the API rejects, and the form
// renders the slug input read-only post-create. Soft-delete via the
// is_active toggle; no hard delete in Phase B.
//
// See docs/SERVICES_ARCHITECTURE.md §4 for the spec.

import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/hooks/use-toast";

type TripTypeRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const SLUG_RE = /^[a-z0-9_]+$/;

export default function AdminTripTypes() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery<TripTypeRow[]>({
    queryKey: ["/api/admin/trip-types"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/trip-types");
      if (!res.ok) throw new Error(`Failed to fetch trip types (${res.status})`);
      return res.json();
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/api/admin/trip-types"] });

  // ---- Create form state ----------------------------------------------
  const [draft, setDraft] = useState({ slug: "", name: "", sortOrder: "0" });
  const [showCreate, setShowCreate] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!SLUG_RE.test(draft.slug)) {
        throw new Error("Slug must be lowercase letters, numbers, underscores");
      }
      if (!draft.name.trim()) throw new Error("Name is required");
      const res = await adminFetch("/api/admin/trip-types", {
        method: "POST",
        body: JSON.stringify({
          slug: draft.slug.trim(),
          name: draft.name.trim(),
          sortOrder: parseInt(draft.sortOrder, 10) || 0,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Create failed (${res.status})`);
      }
    },
    onSuccess: () => {
      toast({ title: "Trip type created" });
      setDraft({ slug: "", name: "", sortOrder: "0" });
      setShowCreate(false);
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Create failed", description: err.message, variant: "destructive" }),
  });

  // ---- Inline edit state ----------------------------------------------
  const [editing, setEditing] = useState<Record<number, { name: string; sortOrder: string }>>({});

  const startEdit = (row: TripTypeRow) =>
    setEditing((p) => ({ ...p, [row.id]: { name: row.name, sortOrder: String(row.sortOrder) } }));

  const cancelEdit = (id: number) =>
    setEditing((p) => {
      const { [id]: _, ...rest } = p;
      return rest;
    });

  const saveEdit = async (row: TripTypeRow) => {
    const draft = editing[row.id];
    if (!draft) return;
    if (!draft.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/trip-types/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: draft.name.trim(),
          sortOrder: parseInt(draft.sortOrder, 10) || 0,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Update failed (${res.status})`);
      }
      cancelEdit(row.id);
      invalidate();
      toast({ title: "Updated" });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const toggleActive = async (row: TripTypeRow) => {
    try {
      const res = await adminFetch(`/api/admin/trip-types/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Toggle failed (${res.status})`);
      }
      invalidate();
    } catch (err: any) {
      toast({ title: "Toggle failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to admin
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Trip Types</h1>
          </div>
          <Button onClick={() => setShowCreate((v) => !v)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New trip type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip-type vocabulary</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Slugs appear inside <code>vehicle_prices</code> keys on every catalog item
              (<code>{"{vehicle}_{tripType}"}</code>). Slugs are write-once after create —
              renaming would orphan price entries. Soft-delete via the active toggle.
            </p>
          </CardHeader>
          <CardContent>
            {showCreate && (
              <div className="border rounded-md p-4 mb-4 bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor="new-slug" className="text-xs">Slug *</Label>
                    <Input
                      id="new-slug"
                      placeholder="e.g. half_day"
                      value={draft.slug}
                      onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">lowercase / digits / underscores</p>
                  </div>
                  <div>
                    <Label htmlFor="new-name" className="text-xs">Name *</Label>
                    <Input
                      id="new-name"
                      placeholder="e.g. Half day"
                      value={draft.name}
                      onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-sort" className="text-xs">Sort order</Label>
                    <Input
                      id="new-sort"
                      type="number"
                      value={draft.sortOrder}
                      onChange={(e) => setDraft((p) => ({ ...p, sortOrder: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={() => createMutation.mutate()}
                      disabled={createMutation.isPending}
                      size="sm"
                    >
                      {createMutation.isPending ? "Creating…" : "Create"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreate(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Sort</TableHead>
                    <TableHead className="w-24">Active</TableHead>
                    <TableHead className="w-44 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const draft = editing[row.id];
                    const isEditing = !!draft;
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs text-gray-700">{row.slug}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={draft.name}
                              onChange={(e) =>
                                setEditing((p) => ({
                                  ...p,
                                  [row.id]: { ...p[row.id], name: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            row.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              className="w-20"
                              value={draft.sortOrder}
                              onChange={(e) =>
                                setEditing((p) => ({
                                  ...p,
                                  [row.id]: { ...p[row.id], sortOrder: e.target.value },
                                }))
                              }
                            />
                          ) : (
                            row.sortOrder
                          )}
                        </TableCell>
                        <TableCell>
                          <Switch checked={row.isActive} onCheckedChange={() => toggleActive(row)} />
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => saveEdit(row)}>
                                <Save className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => cancelEdit(row.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-6">
                        No trip types yet.
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
