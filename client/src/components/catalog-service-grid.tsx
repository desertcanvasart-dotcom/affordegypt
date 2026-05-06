// CatalogServiceGrid — drop-in replacement for the static "destinations"
// boxes on the six service-area pages (cairo/luxor/aswan × airport-
// transfers / car-tour-guide-services). Reads from /api/services
// filtered to a city + category set and renders a card grid scaling
// to the row count. Each card deep-links into the homepage planner
// with ?service=<slug>&city=<city>.
//
// The visual treatment intentionally mirrors the existing placeholder
// blocks on the page (rounded background tile with MapPin icon) so
// dropping this in below the page's heading doesn't introduce a new
// design element. The card layout adds price + button without changing
// the overall density of the section.

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CatalogServiceRow {
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
  heading?: string;
  emptyMessage?: string;
}

const formatEGP = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

// Hide pickup zone if it's the default "{City} Center" the import
// script writes when the row has no parenthetical. The zone is only
// useful information when it differs from the default.
function isDefaultZone(zone: string | null | undefined, city: string): boolean {
  if (!zone) return true;
  return zone.trim().toLowerCase() === `${city} center`.toLowerCase();
}

export default function CatalogServiceGrid({
  city,
  categories,
  heading,
  emptyMessage = "Coming soon — contact us via WhatsApp.",
}: Props) {
  const cityLower = city.toLowerCase();
  const categoryParam = categories.join(",");
  const queryUrl = `/api/services?city=${encodeURIComponent(cityLower)}&category=${encodeURIComponent(categoryParam)}`;

  const { data, isLoading, isError } = useQuery<CatalogServiceRow[]>({
    queryKey: [queryUrl],
    queryFn: async () => {
      const res = await fetch(queryUrl);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  // Render the section wrapper unconditionally so the page layout
  // stays stable across loading / empty states.
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {heading && (
            <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-background rounded-lg animate-pulse"
                />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-center text-muted-foreground">
              Couldn't load services right now. Please try again or message us
              on WhatsApp.
            </p>
          )}

          {!isLoading && !isError && data && data.length === 0 && (
            <p className="text-center text-muted-foreground">{emptyMessage}</p>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((row) => {
                const showZone = !isDefaultZone(row.pickup_zone, city);
                return (
                  <Card
                    key={row.slug}
                    className="hover:shadow-md transition-shadow"
                    data-testid={`catalog-card-${row.slug}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-2 h-full">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <span className="text-sm font-semibold leading-snug">
                          {row.name}
                        </span>
                      </div>
                      {showZone && row.pickup_zone && (
                        <p className="text-xs text-muted-foreground pl-6">
                          Pickup: {row.pickup_zone}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        {row.cheapest_price !== null ? (
                          <Badge variant="secondary" className="font-semibold">
                            From {formatEGP(row.cheapest_price)} EGP
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Price on request
                          </span>
                        )}
                        <Link
                          href={`/?service=${encodeURIComponent(row.slug)}&city=${encodeURIComponent(cityLower)}`}
                        >
                          <Button size="sm" variant="outline">
                            Book this
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
