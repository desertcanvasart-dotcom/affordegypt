import PackageConcept from "@/components/package-concept";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { TravelPackage } from "@shared/travel-packages";
import { TourPrice } from "@/components/currency-estimate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isPrerendering } from "@/lib/prerender";

export function usePackages() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return useQuery<TravelPackage[]>({
    queryKey: ["/api/packages"],
    enabled: mounted && !isPrerendering(),
  });
}
export function PackageCards({ packages }: { packages: TravelPackage[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {packages.slice(0, 3).map((pkg) => (
        <Card key={pkg.slug} className="overflow-hidden flex flex-col">
          {pkg.imageUrl && (
            <img
              src={pkg.imageUrl}
              alt={pkg.title}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
          )}
          <CardContent className="p-6 flex flex-col gap-3 flex-1">
            <p className="text-sm text-muted-foreground">
              {t("packages.duration", {
                days: pkg.durationDays,
                nights: pkg.nights,
              })}
            </p>
            <h3 className="text-2xl font-semibold">{pkg.title}</h3>
            <p className="text-muted-foreground flex-1">{pkg.summary}</p>
            <p className="text-sm text-teal-800">{t("packages.mealPolicy")}</p>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("packages.fromTwo")}
              </p>
              <TourPrice amount={pkg.perPersonRates["2"]} />
            </div>
            <Button asChild>
              <Link href={`/packages/${pkg.slug}`}>{t("packages.view")}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export default function FeaturedPackages() {
  const { t } = useTranslation();
  const { data = [] } = usePackages();
  // No invented programs or rates: only published packages appear on the homepage.
  if (!data.length) return null;
  return (
    <section id="packages" className="bg-teal-50/50 py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-semibold text-teal-700">
            {t("packages.eyebrow")}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            {t("packages.title")}
          </h2>
          <p className="text-muted-foreground mt-3">{t("packages.intro")}</p>
        </div>
        <PackageConcept />
        <PackageCards packages={data} />
      </div>
    </section>
  );
}
