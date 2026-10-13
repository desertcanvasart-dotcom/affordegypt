import { useTranslation } from "react-i18next";
import type { TravelPackage, PackagePricing } from "@shared/travel-packages";
import { Card, CardContent } from "@/components/ui/card";
import { TourPrice } from "@/components/currency-estimate";
export default function PackageBookingSummary({
  snapshot,
}: {
  snapshot: {
    package: TravelPackage;
    pricing: PackagePricing;
    rooms: { double: number; single: number };
    specialRequests: string;
  };
}) {
  const { t } = useTranslation();
  return (
    <Card className="mb-6 border-teal-200">
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">{snapshot.package.title}</h2>
        <p>{t("packages.requestNote")}</p>
        <p>
          {t("packages.duration", {
            days: snapshot.package.durationDays,
            nights: snapshot.package.nights,
          })}
        </p>
        <p>
          {t("packages.travelers")}: {snapshot.pricing.travelers}
        </p>
        {snapshot.package.nights > 0 && (
          <p>
            {t("packages.roomOption", {
              single: snapshot.rooms.single,
              double: snapshot.rooms.double,
            })}
          </p>
        )}
        <div>
          <p>{t("packages.supplementTotal")}</p>
          <TourPrice amount={snapshot.pricing.supplementTotal} />
        </div>
        <div>
          <h3 className="font-semibold">{t("packages.terms")}</h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {snapshot.package.bookingTerms}
          </p>
        </div>
        {snapshot.specialRequests && (
          <div>
            <h3 className="font-semibold">{t("packages.requests")}</h3>
            <p className="whitespace-pre-line">{snapshot.specialRequests}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
