// Admin CRUD for `entrance_fees` — the per-person site tickets the planner
// actually charges (Karnak, Valley of the Kings, museums…). This replaces the
// old, empty "Attractions" admin section, which edited an unused table.
//
// Pricing: operator enters base_price + markup%; price_per_person is computed
// (base × (1 + markup/100)). Student price has no column — it's folded into
// `notes` as "Student: N EGP" (the server splits/joins it).
//
// City is stored lowercased (e.g. "luxor", "marsa alam") so it matches the
// planner's case-insensitive city filter — pick a booking city for the fee to
// appear in the planner.

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
import { ArrowLeft, Plus, Save, X, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/hooks/use-toast";

type FeeRow = {
  id: number;
  slug: string;
  name: string;
  city: string;
  pricePerPerson: number;
  studentPrice: number | null;
  freeNotes: string;
  currency: string;
  isActive: boolean;
  sortOrder: number;
};

type CityOpt = { slug: string; name: string };

const emptyForm = {
  name: "",
  city: "",
  pricePerPerson: "",
  studentPrice: "",
  notes: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminEntranceFees() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery<FeeRow[]>({
    queryKey: ["/api/admin/entrance-fees"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/entrance-fees");
      if (!res.ok) throw new Error(`Failed to fetch entrance fees (${res.status})`);
      return res.json();
    },
  });

  // Booking cities (for the datalist) — fees must match one to show in planner.
  const { data: cities = [] } = useQuery<CityOpt[]>({
    queryKey: ["/api/services/cities"],
    queryFn: async () => {
      const res = await fetch("/api/services/cities");
      return res.ok ? res.json() : [];
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["/api/admin/entrance-fees"] });

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const set = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (row: FeeRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      city: row.city,
      pricePerPerson: String(row.pricePerPerson),
      studentPrice: row.studentPrice != null ? String(row.studentPrice) : "",
      notes: row.freeNotes || "",
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
    });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...emptyForm }); };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      if (!form.city.trim()) throw new Error("City is required");
      const price = parseFloat(form.pricePerPerson);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Price per person must be a positive number");
      const body = {
        name: form.name.trim(),
        city: form.city.trim(),
        pricePerPerson: price,
        studentPrice: form.studentPrice.trim() ? parseFloat(form.studentPrice) : null,
        notes: form.notes.trim() || null,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      };
      const url = editingId ? `/api/admin/entrance-fees/${editingId}` : "/api/admin/entrance-fees";
      const res = await adminFetch(url, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(body) });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.message || `Save failed (${res.status})`);
      }
    },
    onSuccess: () => {
      toast({ title: editingId ? "Entrance fee updated" : "Entrance fee created" });
      closeForm();
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Save failed", description: err.message, variant: "destructive" }),
  });

  const toggleActive = async (row: FeeRow) => {
    try {
      const res = await adminFetch(`/api/admin/entrance-fees/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      if (!res.ok) throw new Error(`Toggle failed (${res.status})`);
      invalidate();
    } catch (err: any) {
      toast({ title: "Toggle failed", description: err.message, variant: "destructive" });
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<FeeRow | null>(null);
  const doDelete = async (row: FeeRow) => {
    try {
      const res = await adminFetch(`/api/admin/entrance-fees/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      setConfirmDelete(null);
      invalidate();
      toast({ title: "Deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to admin
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Entrance Fees</h1>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New entrance fee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Per-person site tickets</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              These are the site/attraction tickets the planner charges per traveler. The
              customer price is <code>base × (1 + markup%)</code>. Pick a <strong>booking city</strong>{" "}
              so the fee appears in the planner for that city.
            </p>
          </CardHeader>
          <CardContent>
            {showForm && (
              <div className="border rounded-md p-4 mb-4 bg-blue-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Name *</Label>
                    <Input value={form.name} placeholder="e.g. Karnak Temple"
                      onChange={(e) => set({ name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">City *</Label>
                    <Input list="ef-cities" value={form.city} placeholder="e.g. Luxor"
                      onChange={(e) => set({ city: e.target.value })} />
                    <datalist id="ef-cities">
                      {cities.map((c) => <option key={c.slug} value={c.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <Label className="text-xs">Price per person (EGP) *</Label>
                    <Input type="number" value={form.pricePerPerson} placeholder="660"
                      onChange={(e) => set({ pricePerPerson: e.target.value })} />
                    <p className="text-xs text-gray-500 mt-1">Final price charged per traveler (incl. profit)</p>
                  </div>
                  <div>
                    <Label className="text-xs">Student price (EGP)</Label>
                    <Input type="number" value={form.studentPrice} placeholder="optional"
                      onChange={(e) => set({ studentPrice: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Notes</Label>
                    <Input value={form.notes} placeholder="optional (hours, what's included)"
                      onChange={(e) => set({ notes: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Sort order</Label>
                    <Input type="number" value={form.sortOrder}
                      onChange={(e) => set({ sortOrder: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <Switch checked={form.isActive} onCheckedChange={(v) => set({ isActive: v })} />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    <Save className="w-3 h-3 mr-1" />
                    {saveMutation.isPending ? "Saving…" : editingId ? "Save changes" : "Create"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={closeForm}>Cancel</Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="w-32">Price/person</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="w-40 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{row.name}</div>
                        {row.studentPrice != null && (
                          <div className="text-xs text-gray-500">Student: {row.studentPrice} EGP</div>
                        )}
                      </TableCell>
                      <TableCell className="capitalize text-sm">{row.city}</TableCell>
                      <TableCell className="font-mono text-sm">EGP {row.pricePerPerson}</TableCell>
                      <TableCell>
                        <Switch checked={row.isActive} onCheckedChange={() => toggleActive(row)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600"
                            onClick={() => setConfirmDelete(row)} title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-6">
                        No entrance fees yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
            <p className="text-xs text-gray-400 mt-3">{rows.length} entrance fees</p>
          </CardContent>
        </Card>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-2">Delete entrance fee?</h3>
            <p className="text-sm text-gray-600 mb-4">
              "{confirmDelete.name}" ({confirmDelete.city}) will be permanently removed.
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => doDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
