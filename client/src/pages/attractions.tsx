import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";

interface EntranceFee {
  slug: string;
  name: string;
  city: string;
  price_per_person: number;
  currency: string;
  notes: string | null;
}

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

// Public attractions & entrance-fees page. This URL is in the sitemap and
// used to render the admin "Attractions Management" screen by mistake — the
// admin tool now lives at /admin/attractions.
export default function AttractionsPage() {
  const { t } = useTranslation();
  const { data: fees = [], isLoading } = useQuery<EntranceFee[]>({
    queryKey: ["/api/entrance-fees"],
  });

  const byCity = fees.reduce<Record<string, EntranceFee[]>>((acc, fee) => {
    (acc[fee.city] ||= []).push(fee);
    return acc;
  }, {});
  const cities = Object.keys(byCity).sort();

  return (
    <>
      <SeoMeta
        title={t("attractionsPage.seoTitle")}
        description={t("attractionsPage.seoDescription")}
        canonical="https://affordegypt.com/attractions"
      />
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("attractionsPage.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              {t("attractionsPage.subtitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("attractionsPage.note")}
            </p>
          </div>
        </section>

        {/* Fees by city */}
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : cities.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                {t("attractionsPage.listUpdating")}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cities.map((city) => (
                  <Card key={city}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-primary" />
                        {titleCase(city)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="divide-y">
                        {byCity[city].map((fee) => (
                          <li
                            key={fee.slug}
                            className="py-2 flex items-start justify-between gap-3"
                          >
                            <div>
                              <span className="font-medium">{fee.name}</span>
                              {fee.notes && (
                                <p className="text-xs text-muted-foreground">
                                  {fee.notes}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {fee.price_per_person.toLocaleString()}{" "}
                              {fee.currency}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Ticket className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              {t("attractionsPage.ctaTitle")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("attractionsPage.ctaBody")}
            </p>
            {/* asChild: a <button> inside an <a> is invalid HTML and left the
                anchor a 20px-tall inline target. */}
            <Button asChild size="lg" className="gap-2">
              <Link href="/pricing-tool">
                {t("attractionsPage.ctaButton")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
