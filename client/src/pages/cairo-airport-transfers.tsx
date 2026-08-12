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

export default function CairoAirportTransfers() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Airport Transfer",
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Cairo",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["cairo-airport-transfer"].minPrice,
        "priceCurrency": pricingSnapshot.currency,
      },
      "availability": "https://schema.org/InStock",
    },
  };
  const { t } = useSmartTranslation();
  const { t: rawT } = useTranslation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Structured content is read with returnObjects, which useSmartTranslation
  // deliberately does not support -- it is a string-only helper. A locale that
  // has not been backfilled would otherwise render an empty section, so fall
  // through to English rather than dropping the content.
  const list = (key: string): any[] => {
    const value = rawT(key, { returnObjects: true });
    if (Array.isArray(value)) return value;
    const english = rawT(key, { returnObjects: true, lng: "en" });
    return Array.isArray(english) ? english : [];
  };

  // "From X EGP" comes from the build-time snapshot, never from a literal in
  // the locale file. See client/src/lib/service-pricing.ts.
  const fromPrice = (vehicle: VehicleClass) => {
    const digits = vehicleDigits("cairo-airport-transfer", vehicle);
    return digits === null ? "—" : rawT("airportTransfers.common.fromPrice", { price: digits });
  };

  const vehicleTypes = [
    {
      name: t("airportTransfers.common.sedan"),
      capacity: t("airportTransfers.common.passengers1to2"),
      price: fromPrice("sedan"),
      features: list("airportTransfers.cairo.sedanFeatures"),
      icon: Car
    },
    {
      name: t("airportTransfers.common.minivan"),
      capacity: t("airportTransfers.common.passengers3to8"),
      price: fromPrice("minivan"),
      features: list("airportTransfers.cairo.minivanFeatures"),
      icon: Users
    },
    {
      name: t("airportTransfers.common.van"),
      capacity: t("airportTransfers.common.passengers9to15"),
      price: fromPrice("van"),
      features: list("airportTransfers.cairo.vanFeatures"),
      icon: Users
    }
  ];

  const airports = list("airportTransfers.cairo.airports");
  const calcItems = list("airportTransfers.cairo.calcItems");
  const zones = list("airportTransfers.cairo.zones");
  const includesItems = list("airportTransfers.cairo.includesItems");
  const changesItems = list("airportTransfers.cairo.changesItems");
  const steps = list("airportTransfers.cairo.steps");
  const beforeItems = list("airportTransfers.cairo.beforeItems");

  return (
    <>
      <SeoMeta
        title="Cairo Airport Transfers | CAI &amp; Sphinx Airport (SPX) | AffordEgypt"
        description="Private transfers from Cairo International (CAI) and Sphinx International (SPX) to hotels across Cairo, Giza and Greater Cairo. Route-specific fixed quotes from LE 1,950."
        canonical="https://affordegypt.com/cairo-airport-transfers"
        schema={SERVICE_SCHEMA}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Plane className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {t("airportTransfers.cairo.heroTitle")}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
                {t("airportTransfers.cairo.heroSubtitle")}
              </p>
              <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("airportTransfers.cairo.heroNote")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/transfers">
                    {t("airportTransfers.cairo.ctaQuote")}
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

        {/* Which airport. This leads because picking the wrong one changes the
            route across the whole metropolitan area, not just the price. */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.cairo.airportsTitle")}</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
                {t("airportTransfers.cairo.airportsIntro")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {airports.map((airport: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <Plane className="w-10 h-10 text-primary mb-2" />
                      <CardTitle className="text-2xl">{airport.name}</CardTitle>
                      <Badge variant="secondary" className="w-fit text-base font-semibold">
                        {airport.code}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>{airport.location}</p>
                      <p>{airport.direct}</p>
                      <p>{airport.farther}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-900">
                    <strong>{t("airportTransfers.cairo.airportWarningLabel")}</strong>{" "}
                    {t("airportTransfers.cairo.airportWarning")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How the price is calculated */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.cairo.calcTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("airportTransfers.cairo.calcIntro")}
              </p>
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

        {/* Hotel areas and pricing zones */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.cairo.zonesTitle")}</h2>
              <p className="text-center text-muted-foreground mb-12">
                {t("airportTransfers.cairo.zonesIntro")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {zones.map((zone: any, index: number) => (
                  <Card key={index} className="bg-background">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        {zone.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {(zone.areas || []).map((area: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{area}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-muted-foreground">{zone.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 bg-background p-6 rounded-lg text-center">
                <h3 className="font-semibold mb-2">{t("airportTransfers.cairo.zonesHelpTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("airportTransfers.cairo.zonesHelp")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">{t("airportTransfers.cairo.vehiclesTitle")}</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t("airportTransfers.cairo.vehiclesIntro")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {vehicleTypes.map((vehicle, index) => (
                <Card key={index} className="relative hover:shadow-lg transition-shadow">
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
                      {vehicle.features.map((feature, idx) => (
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">{t("airportTransfers.cairo.includesTitle")}</h2>
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
                <h2 className="text-2xl font-bold mb-6">{t("airportTransfers.cairo.changesTitle")}</h2>
                <ul className="space-y-3 mb-4">
                  {changesItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground">{t("airportTransfers.cairo.changesNote")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Airport-to-airport. Called out separately because travellers read it
            as a terminal change; it is a cross-city road journey. */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Plane className="w-6 h-6 text-primary" />
                    {t("airportTransfers.cairo.a2aTitle")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t("airportTransfers.cairo.a2aBody")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
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
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.cairo.beforeTitle")}</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {beforeItems.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Information */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t("airportTransfers.cairo.pricingTitle")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("airportTransfers.cairo.pricingIntro")}
              </p>
              <div className="bg-background p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{vehicleDigits("cairo-airport-transfer", "sedan") === null
                    ? "—"
                    : rawT("airportTransfers.common.startingFromRoutes", { price: vehicleDigits("cairo-airport-transfer", "sedan")! })}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("airportTransfers.cairo.pricingTerms")}
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
            <h2 className="text-3xl font-bold mb-4">{t("airportTransfers.cairo.ctaTitle")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("airportTransfers.cairo.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/transfers">
                  {t("airportTransfers.cairo.ctaBook")}
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