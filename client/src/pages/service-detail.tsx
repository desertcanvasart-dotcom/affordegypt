// Public service detail page at /services/:slug. Read-only price matrix
// over the row's vehicle_prices, plus the inline ServiceBookingForm.

import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import ServiceBookingForm from "@/components/services/service-booking-form";
import {
  TRIP_TYPE_LABELS,
  VEHICLE_LABELS,
  type VehicleSlug,
} from "@/components/catalog-service-picker";

const ALL_VEHICLES: VehicleSlug[] = ["sedan", "minivan", "van"];

interface ServiceDetailRow {
  slug: string;
  name: string;
  city: string;
  category: string;
  pickup_zone: string | null;
  vehicle_prices: Record<string, number>;
  image_url: string | null;
  cheapest_price: number | null;
  description: string | null;
}

const formatEGP = (n: number) =>
  `EGP ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}`;

function deriveTripTypes(prices: Record<string, number>): string[] {
  const set = new Set<string>();
  for (const k of Object.keys(prices)) {
    for (const v of ALL_VEHICLES) {
      if (k.startsWith(`${v}_`)) {
        set.add(k.slice(v.length + 1));
        break;
      }
    }
  }
  return Array.from(set);
}

function vehiclesPresent(prices: Record<string, number>): VehicleSlug[] {
  const set = new Set<VehicleSlug>();
  for (const k of Object.keys(prices)) {
    for (const v of ALL_VEHICLES) {
      if (k.startsWith(`${v}_`)) {
        set.add(v);
        break;
      }
    }
  }
  return ALL_VEHICLES.filter((v) => set.has(v));
}

export default function ServiceDetail() {
  const [, params] = useRoute<{ slug: string }>("/services/:slug");
  const slug = params?.slug ?? "";

  const { data, isLoading, isError } = useQuery<ServiceDetailRow>({
    queryKey: [`/api/services/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/services/${slug}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>
        <Footer />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2">Service not found</h1>
          <p className="text-gray-600 mb-6">This transfer isn't available.</p>
          <Link href="/services" className="text-primary font-medium hover:underline">
            ← Browse all transfers
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const vehicles = vehiclesPresent(data.vehicle_prices);
  const tripTypes = deriveTripTypes(data.vehicle_prices);

  return (
    <>
      <SeoMeta
        title={`${data.name} | Afford Egypt`}
        description={data.description ?? `${data.name} — private transfer in ${data.city}.`}
        canonical={`https://affordegypt.com/services/${data.slug}`}
      />
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-sm text-gray-500 mb-3">
            <Link href="/services" className="hover:text-primary">All transfers</Link>
            <span className="mx-2">/</span>
            <span>{data.city}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{data.name}</h1>
          <p className="text-gray-600 mb-6">
            {data.city}
            {data.pickup_zone ? ` · Pickup: ${data.pickup_zone}` : ""}
          </p>

          {data.image_url && (
            <img
              src={data.image_url}
              alt={data.name}
              className="w-full h-64 sm:h-80 object-cover rounded-xl mb-6"
            />
          )}

          {data.description && (
            <p className="text-gray-700 mb-8 leading-relaxed">{data.description}</p>
          )}

          {tripTypes.length > 0 && (
            <section className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 pr-4">Vehicle</th>
                      {tripTypes.map((t) => (
                        <th key={t} className="py-2 px-3">{TRIP_TYPE_LABELS[t] ?? t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v} className="border-b last:border-b-0">
                        <td className="py-3 pr-4 font-medium">{VEHICLE_LABELS[v]}</td>
                        {tripTypes.map((t) => {
                          const price = data.vehicle_prices[`${v}_${t}`];
                          return (
                            <td key={t} className="py-3 px-3 text-gray-700">
                              {typeof price === "number" ? formatEGP(price) : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Prices in EGP. Includes private vehicle and driver. No hidden fees.
              </p>
            </section>
          )}

          <ServiceBookingForm
            service={{
              slug: data.slug,
              name: data.name,
              city: data.city,
              vehicle_prices: data.vehicle_prices,
            }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
