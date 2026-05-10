// Public services listing at /services. Reads /api/services with an
// optional city filter and presents one card per row. Click → detail
// page where the customer reserves.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceRow {
  slug: string;
  name: string;
  city: string;
  category: string;
  pickup_zone: string | null;
  vehicle_prices: Record<string, number>;
  image_url: string | null;
  cheapest_price: number | null;
}

interface CityRow {
  slug: string;
  name: string;
  count: number;
}

const formatEGP = (n: number) =>
  `EGP ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}`;

export default function ServicesList() {
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  const citiesQuery = useQuery<CityRow[]>({
    queryKey: ["/api/services/cities"],
    queryFn: async () => {
      const res = await fetch("/api/services/cities");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const servicesQuery = useQuery<ServiceRow[]>({
    queryKey: ["/api/services", cityFilter, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityFilter !== "all") params.set("city", cityFilter);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/services?${params.toString()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const rows = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);

  return (
    <>
      <SeoMeta
        title="Browse private transfers in Egypt | Afford Egypt"
        description="Single-service transfer pricing across Cairo, Luxor, Aswan and more. Transparent prices in EGP, ETAA-licensed operator."
        canonical="https://affordegypt.com/services"
      />
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <h1 className="text-3xl sm:text-4xl font-bold">Browse private transfers</h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Single transfers, day rentals, and short tours. Pick a city or search by name.
              Transparent EGP prices — no hidden fees.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search transfers (e.g. airport, Karnak, half-day)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger><SelectValue placeholder="All cities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {(citiesQuery.data ?? []).map((c) => (
                    <SelectItem key={c.slug} value={c.name}>
                      {c.name} ({c.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {servicesQuery.isLoading && (
            <div className="text-center text-gray-500 py-12">Loading…</div>
          )}

          {!servicesQuery.isLoading && rows.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No transfers match these filters.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row) => (
              <Link
                key={row.slug}
                href={`/services/${row.slug}`}
                className="group block bg-white rounded-xl border hover:border-primary/50 hover:shadow-md transition overflow-hidden"
              >
                {row.image_url ? (
                  <img
                    src={row.image_url}
                    alt={row.name}
                    className="w-full h-40 object-cover group-hover:scale-[1.02] transition"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-primary/10 to-primary/5" />
                )}
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {row.city}
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
                    {row.name}
                  </div>
                  {row.pickup_zone && (
                    <div className="text-xs text-gray-500 mt-1">Pickup: {row.pickup_zone}</div>
                  )}
                  {typeof row.cheapest_price === "number" && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-500">From </span>
                      <span className="font-bold text-primary">{formatEGP(row.cheapest_price)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
