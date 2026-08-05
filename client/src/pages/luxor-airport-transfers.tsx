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
  Phone,
  Camera
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function LuxorAirportTransfers() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Airport Transfer",
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Luxor",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["luxor-airport-transfer"].minPrice,
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
      capacity: t("airportTransfers.common.passengers1to2"),
      price: t("airportTransfers.luxor.sedanPriceFrom"),
      features: [t("airportTransfers.common.airConditioning"), t("airportTransfers.common.professionalDriver"), t("airportTransfers.luxor.templeRouteKnowledge")],
      icon: Car
    },
    {
      name: t("airportTransfers.common.minivan"),
      capacity: t("airportTransfers.common.passengers3to8"), 
      price: t("airportTransfers.luxor.minivanPriceFrom"),
      features: [t("airportTransfers.common.extraLuggageSpace"), t("airportTransfers.common.familyFriendly"), t("airportTransfers.luxor.touristFriendly")],
      icon: Users
    },
    {
      name: t("airportTransfers.common.van"),
      capacity: t("airportTransfers.common.passengers9to15"),
      price: t("airportTransfers.luxor.vanPriceFrom"), 
      features: [t("airportTransfers.common.groupTravel"), t("airportTransfers.common.largeLuggageCapacity"), t("airportTransfers.luxor.tourGroupFriendly")],
      icon: Users
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: t("airportTransfers.luxor.templeExpertise"),
      description: t("airportTransfers.luxor.templeExpertiseDesc")
    },
    {
      icon: Clock,
      title: t("airportTransfers.common.flightMonitoring"),
      description: t("airportTransfers.common.flightMonitoringDesc")
    },
    {
      icon: Camera,
      title: t("airportTransfers.luxor.sightseeingStops"),
      description: t("airportTransfers.luxor.sightseeingStopsDesc")
    },
    {
      icon: CheckCircle,
      title: t("airportTransfers.luxor.localKnowledge"),
      description: t("airportTransfers.luxor.localKnowledgeDesc")
    }
  ];

  // Luxor areas with fallback
  const getLuxorAreas = () => {
    try {
      const areas = [
        t("airportTransfers.luxor.area1") || "Luxor Airport (LXR)",
        t("airportTransfers.luxor.area2") || "East Bank Hotels",
        t("airportTransfers.luxor.area3") || "West Bank Hotels",
        t("airportTransfers.luxor.area4") || "Valley of the Kings",
        t("airportTransfers.luxor.area5") || "Karnak Temple Area",
        t("airportTransfers.luxor.area6") || "Luxor Temple District",
        t("airportTransfers.luxor.area7") || "Nile Cruise Terminals",
        t("airportTransfers.luxor.area8") || "Winter Palace Area"
      ];
      return areas;
    } catch {
      return [
        "Luxor Airport (LXR)",
        "East Bank Hotels",
        "West Bank Hotels",
        "Valley of the Kings",
        "Karnak Temple Area",
        "Luxor Temple District", 
        "Nile Cruise Terminals",
        "Winter Palace Area"
      ];
    }
  };
  const luxorAreas = getLuxorAreas();

  return (
    <>
      <SeoMeta
        title="Luxor Airport Transfers | Fixed Price | AffordEgypt"
        description="Private Luxor airport (LXR) transfers to East Bank or West Bank hotels. Licensed drivers, fixed prices, English-speaking. Book in 60 seconds."
        canonical="https://affordegypt.com/luxor-airport-transfers"
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
                  {t("airportTransfers.luxor.heroTitle")}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("airportTransfers.luxor.heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/transfers">
                    {t("airportTransfers.common.bookNow")}
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

        {/* Key Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.luxor.whyChooseTitle")}</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.luxor.transferDestinationsTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("airportTransfers.luxor.transferDestinationsDesc")}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {luxorAreas.map((area: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Special Luxor Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("airportTransfers.luxor.expertiseTitle")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-6 h-6 text-primary" />
                      {t("airportTransfers.luxor.templeRouteTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("airportTransfers.luxor.templeRouteDesc")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      {t("airportTransfers.luxor.eastWestBank")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("airportTransfers.luxor.eastWestBankDesc")}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
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
                    {t("airportTransfers.luxor.stepMeetDriverDesc")}
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">{t("airportTransfers.luxor.stepExploreLuxor")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("airportTransfers.luxor.stepExploreLuxorDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Information */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">{t("airportTransfers.luxor.affordableTitle")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("airportTransfers.luxor.affordableDesc")}
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{t("airportTransfers.luxor.sedanPriceFrom")}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("airportTransfers.luxor.pricingInfoDesc")}
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
            <h2 className="text-3xl font-bold mb-4">{t("airportTransfers.luxor.ctaTitle")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("airportTransfers.luxor.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/transfers">
                  {t("airportTransfers.common.bookOnlineNow")}
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