import SeoMeta from "@/components/seo-meta";
import pricingSnapshot from "@/generated/pricing-snapshot.json";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { 
  Plane, 
  MapPin, 
  Clock, 
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
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const vehicleTypes = [
    {
      name: t("airportTransfers.common.sedan"),
      capacity: t("airportTransfers.common.passengers1to3"),
      price: t("airportTransfers.cairo.sedanPriceFrom"),
      features: [
        t("airportTransfers.common.airConditioning"),
        t("airportTransfers.common.professionalDriver"),
        t("airportTransfers.common.meetGreet")
      ],
      icon: Car
    },
    {
      name: t("airportTransfers.common.minivan"),
      capacity: t("airportTransfers.common.passengers4to7"), 
      price: t("airportTransfers.cairo.minivanPriceFrom"),
      features: [
        t("airportTransfers.common.extraLuggageSpace"),
        t("airportTransfers.common.familyFriendly"),
        t("airportTransfers.common.comfortableSeating")
      ],
      icon: Users
    },
    {
      name: t("airportTransfers.common.van"),
      capacity: t("airportTransfers.common.passengers8plus"),
      price: t("airportTransfers.cairo.vanPriceFrom"), 
      features: [
        t("airportTransfers.common.groupTravel"),
        t("airportTransfers.common.largeLuggageCapacity"),
        t("airportTransfers.common.premiumComfort")
      ],
      icon: Users
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: t("airportTransfers.cairo.service24_7"),
      description: t("airportTransfers.cairo.service24_7Desc")
    },
    {
      icon: Clock,
      title: t("airportTransfers.common.flightMonitoring"),
      description: t("airportTransfers.common.flightMonitoringDesc")
    },
    {
      icon: MapPin,
      title: t("airportTransfers.cairo.doorToDoor"),
      description: t("airportTransfers.cairo.doorToDoorDesc")
    },
    {
      icon: CheckCircle,
      title: t("airportTransfers.common.professionalDrivers"),
      description: t("airportTransfers.common.professionalDriversDesc")
    }
  ];

  // Airport areas with fallback
  const getAirportAreas = () => {
    try {
      const areas = [
        t("airportTransfers.cairo.area1") || "Cairo International Airport (CAI)",
        t("airportTransfers.cairo.area2") || "New Cairo Hotels", 
        t("airportTransfers.cairo.area3") || "6th of October City",
        t("airportTransfers.cairo.area4") || "Giza Hotels",
        t("airportTransfers.cairo.area5") || "Downtown Cairo",
        t("airportTransfers.cairo.area6") || "Heliopolis",
        t("airportTransfers.cairo.area7") || "Maadi", 
        t("airportTransfers.cairo.area8") || "Zamalek"
      ];
      return areas;
    } catch {
      return [
        "Cairo International Airport (CAI)",
        "New Cairo Hotels",
        "6th of October City", 
        "Giza Hotels",
        "Downtown Cairo",
        "Heliopolis",
        "Maadi",
        "Zamalek"
      ];
    }
  };
  const airportAreas = getAirportAreas();

  return (
    <>
      <SeoMeta
        title="Cairo Airport Transfers | Fixed Price from LE 2,025 | AffordEgypt"
        description="Private Cairo airport transfers (CAI) to/from any Cairo or Giza hotel. Licensed drivers, fixed transparent prices, no surge, no hidden fees. Book online or via WhatsApp."
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
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("airportTransfers.cairo.heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/transfers">
                  <Button size="lg" className="text-lg px-8">
                    {t("airportTransfers.common.bookNow")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
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

        {/* Key Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.cairo.whyChooseTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyFeatures.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.common.chooseVehicle")}</h2>
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

        {/* Service Areas */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.cairo.transferDestinationsTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("airportTransfers.cairo.transferDestinationsDesc")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {airportAreas.map((area: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.common.howItWorks")}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">1</div>
                  <h3 className="font-semibold mb-2">{t("airportTransfers.common.bookOnline")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("airportTransfers.common.selectPickupTime")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">2</div>
                  <h3 className="font-semibold mb-2">{t("airportTransfers.common.meetDriver")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("airportTransfers.cairo.stepMeetDriverDesc")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">{t("airportTransfers.cairo.stepEnjoyRide")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("airportTransfers.cairo.stepEnjoyRideDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Information */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t("airportTransfers.common.transparentPricing")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("airportTransfers.common.noHiddenFees")}
              </p>
              <div className="bg-background p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{t("airportTransfers.cairo.sedanPriceFrom")}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("airportTransfers.cairo.pricingInfoDesc")}
                </p>
                <Link href="/transfers">
                  <Button size="lg">
                    {t("airportTransfers.common.getInstantQuote")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
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
              <Link href="/transfers">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  {t("airportTransfers.common.bookOnlineNow")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
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