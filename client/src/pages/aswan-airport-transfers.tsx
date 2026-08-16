import SeoMeta from "@/components/seo-meta";
import pricingSnapshot from "@/generated/pricing-snapshot.json";
import { vehicleDigits, type VehicleClass } from "@/lib/service-pricing";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { useTranslation } from "react-i18next";
import { 
  Plane, 
  MapPin, 
  Shield, 
  Car, 
  CheckCircle, 
  Star,
  Users,
  ArrowRight,
  Phone
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

export default function AswanAirportTransfers() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    // schema.org value on the English prerender Google indexes
    "serviceType": "Airport Transfer", // i18n-exempt
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Aswan",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["aswan-airport-transfer"].minPrice,
        "priceCurrency": pricingSnapshot.currency,
      },
      "availability": "https://schema.org/InStock",
    },
  };
  // The meta description quotes a price, so it is derived like every other
  // price on the page. A literal here is outside the drift check and is how
  // the visible prices came adrift in the first place.
  const sedanFrom = vehicleDigits("aswan-airport-transfer", "sedan") ?? "—";
  const { t } = useSmartTranslation();
  const { t: rawT } = useTranslation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Structured content is read with returnObjects, which useSmartTranslation
  // deliberately does not support -- it is a string-only helper. A locale that
  // has not been backfilled falls through to English rather than rendering an
  // empty section.
  const list = (key: string): any[] => {
    const value = rawT(key, { returnObjects: true });
    if (Array.isArray(value)) return value;
    const english = rawT(key, { returnObjects: true, lng: "en" });
    return Array.isArray(english) ? english : [];
  };

  // "From X EGP" comes from the build-time snapshot, never from a literal in
  // the locale file. See client/src/lib/service-pricing.ts.
  const fromPrice = (vehicle: VehicleClass) => {
    const digits = vehicleDigits("aswan-airport-transfer", vehicle);
    return digits === null ? "—" : rawT("airportTransfers.common.fromPrice", { price: digits });
  };

  const vehicleTypes = [
    {
      name: t("airportTransfers.common.sedan"),
      capacity: t("airportTransfers.common.passengers1to2"),
      price: fromPrice("sedan"),
      features: list("airportTransfers.aswan.sedanFeatures"),
      icon: Car
    },
    {
      name: t("airportTransfers.common.minivan"),
      capacity: t("airportTransfers.common.passengers3to8"),
      price: fromPrice("minivan"),
      features: list("airportTransfers.aswan.minivanFeatures"),
      icon: Users
    },
    {
      name: t("airportTransfers.common.van"),
      capacity: t("airportTransfers.common.passengers9to15"),
      price: fromPrice("van"),
      features: list("airportTransfers.aswan.vanFeatures"),
      icon: Users
    }
  ];

  const destinations = list("airportTransfers.aswan.destinations");
  const cruiseItems = list("airportTransfers.aswan.cruiseItems");
  const pricingGuide = list("airportTransfers.aswan.pricingGuide");
  const calcItems = list("airportTransfers.aswan.calcItems");
  const includesItems = list("airportTransfers.aswan.includesItems");
  const changesItems = list("airportTransfers.aswan.changesItems");
  const steps = list("airportTransfers.aswan.steps");
  const beforeItems = list("airportTransfers.aswan.beforeItems");

  return (
    <>
      <SeoMeta
        title={t("airportTransfers.aswan.seoTitle")}
        description={t("airportTransfers.aswan.seoDescription", {
          interpolation: { price: `LE ${sedanFrom}` },
        })}
        canonical="https://affordegypt.com/aswan-airport-transfers"
        schema={[SERVICE_SCHEMA, breadcrumbSchema(trailFor("/aswan-airport-transfers")!)]}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        <PageBreadcrumbs />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Plane className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {t("airportTransfers.aswan.heroTitle")}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                {t("airportTransfers.aswan.heroSubtitle")}
              </p>
              <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("airportTransfers.aswan.heroNote")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* Sentence-length CTA. Buttons are white-space:nowrap by
                    default, and the German label ("Erhalten Sie Ihr genaues
                    Transfer-Angebot") overflowed a 375px viewport and made the
                    page scroll sideways — the same failure already documented
                    on the Sinai guide. Let it wrap. */}
                <Button asChild size="lg" className="text-lg px-8 whitespace-normal max-w-full h-auto py-3">
                  <Link href="/transfers">
                    {t("airportTransfers.aswan.ctaQuote")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>

                </Button>
                <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    <Phone className="w-5 h-5 mr-2" />
                    {t("airportTransfers.common.whatsapp")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Where in Aswan. The destination, not the city name, decides the
            route: a Corniche hotel, Gharb Soheil and an island jetty are three
            different journeys. */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.aswan.whereTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
                {t("airportTransfers.aswan.whereIntro")}
              </p>

              <Card className="mb-8">
                <CardHeader>
                  <Plane className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-2xl">{t("airportTransfers.aswan.airportName")}</CardTitle>
                  <Badge variant="secondary" className="w-fit text-base font-semibold">
                    {t("airportTransfers.aswan.airportCode")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("airportTransfers.aswan.airportLocation")}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destinations.map((dest: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {dest.name}
                      </CardTitle>
                      {dest.intro ? <p className="text-sm text-muted-foreground">{dest.intro}</p> : null}
                    </CardHeader>
                    <CardContent>
                      {(dest.areas || []).length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {dest.areas.map((area: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm">{area}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="text-sm text-muted-foreground">{dest.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cruise moorings, and the Nile vs Lake Nasser distinction */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.aswan.cruiseTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("airportTransfers.aswan.cruiseIntro")}
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {cruiseItems.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground text-center mb-8">{t("airportTransfers.aswan.cruiseNote")}</p>

              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-1">{t("airportTransfers.aswan.lakeTitle")}</h3>
                    <p className="text-amber-900 text-sm">{t("airportTransfers.aswan.lakeBody")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destination-based pricing guide */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.aswan.pricingGuideTitle")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingGuide.map((row: any, index: number) => (
                  <div key={index} className="p-4 bg-background rounded-lg">
                    <h3 className="font-semibold mb-1">{row.label}</h3>
                    <p className="text-sm text-muted-foreground">{row.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How the price is calculated */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">{t("airportTransfers.aswan.calcTitle")}</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {calcItems.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Vehicle Options */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.aswan.vehiclesTitle")}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t("airportTransfers.aswan.vehiclesIntro")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {vehicleTypes.map((vehicle, index) => (
                <Card key={index} className="relative hover:shadow-lg transition-shadow bg-background">
                  <CardHeader className="text-center">
                    <vehicle.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl">{vehicle.name}</CardTitle>
                    <p className="text-muted-foreground">{vehicle.capacity}</p>
                    <Badge variant="secondary" className="text-lg font-semibold px-4 py-1 mt-2">
                      {vehicle.price}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {vehicle.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What the quote includes, and what changes it */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">{t("airportTransfers.aswan.includesTitle")}</h2>
                <ul className="space-y-3">
                  {includesItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">{t("airportTransfers.aswan.changesTitle")}</h2>
                <ul className="space-y-3 mb-4">
                  {changesItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">{t("airportTransfers.aswan.changesNote")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Point-to-point */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-l-4 border-l-primary bg-background">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary" />
                    {t("airportTransfers.aswan.p2pTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("airportTransfers.aswan.p2pBody")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.common.howItWorks")}</h2>
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="step-number mb-4 mx-auto">{index + 1}</div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Details to send before booking */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.aswan.beforeTitle")}</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {beforeItems.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-background rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t("airportTransfers.aswan.pricingTitle")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("airportTransfers.aswan.pricingIntro")}
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{vehicleDigits("aswan-airport-transfer", "sedan") === null
                    ? "—"
                    : rawT("airportTransfers.common.startingFromRoutes", { price: vehicleDigits("aswan-airport-transfer", "sedan")! })}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("airportTransfers.aswan.pricingTerms")}
                </p>
                <Button asChild size="lg">
                  <Link href="/transfers">
                    {t("airportTransfers.common.getInstantQuote")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>

                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("airportTransfers.aswan.ctaTitle")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("airportTransfers.aswan.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/pricing-tool">
                  {t("airportTransfers.aswan.ctaBook")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

              </Button>
              <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  {t("airportTransfers.common.callNow")}
                </Button>
              </a>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </>
  );
}