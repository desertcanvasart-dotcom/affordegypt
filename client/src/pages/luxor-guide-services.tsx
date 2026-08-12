import SeoMeta from "@/components/seo-meta";
import pricingSnapshot from "@/generated/pricing-snapshot.json";
import { formatEGPPlain, formatLE, formatLEPerDay } from "@/lib/service-pricing";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { useSmartTranslation } from "@/hooks/useSmartTranslation";
import { 
  UserCheck, 
  MapPin, 
  Clock, 
  Shield, 
  Car, 
  CheckCircle, 
  Star,
  Users,
  ArrowRight,
  Phone,
  Compass,
  Camera
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AdvanceTicketNote from "@/components/advance-ticket-note";

export default function LuxorGuideServices() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Private Tour Guide and Car",
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Luxor",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["luxor-guide-services"].minPrice,
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
  
  const serviceTypes = [
    {
      name: "Temple Specialist Guide",
      duration: "Full Day (8 hours)",
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("luxor-guide-services") } }),
      features: ["Ancient Egypt expert", "Valley of Kings specialist", "Hieroglyph interpreter"],
      icon: UserCheck
    },
    {
      name: "East & West Bank Tour",
      duration: "Full Day", 
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("luxor-guide-car") } }),
      features: ["Professional guide", "Private vehicle", "Both banks covered"],
      icon: Users
    },
    {
      name: "Luxor Temples Tours",
      duration: "6-10 hours",
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("luxor-tour-car") } }), 
      features: ["Premium vehicle", "Expert driver-guide", "Flexible temple visits"],
      icon: Car
    }
  ];

  const keyFeatures = [
    {
      icon: Compass,
      title: t("guideServices.luxor.templeExpertise"),
      description: t("guideServices.luxor.templeExpertiseDesc")
    },
    {
      icon: Shield,
      title: t("guideServices.luxor.licensedArchaeologists"),
      description: t("guideServices.luxor.licensedArchaeologistsDesc")
    },
    {
      icon: Camera,
      title: t("guideServices.luxor.photographyTours"),
      description: t("guideServices.luxor.photographyToursDesc")
    },
    {
      icon: Clock,
      title: t("guideServices.luxor.earlyMorningAccess"),
      description: t("guideServices.luxor.earlyMorningAccessDesc")
    }
  ];

  // Guide service areas in Luxor with fallback
  const getServiceAreas = () => {
    try {
      const areas = [
        "Valley of the Kings",
        "Karnak Temple Complex",
        "Luxor Temple",
        "Queen Hatshepsut Temple",
        "Valley of the Queens",
        "Medinet Habu",
        "Colossi of Memnon",
        "Ramesseum Temple"
      ];
      return areas;
    } catch {
      return [
        "Valley of the Kings",
        "Karnak Temple Complex",
        "Luxor Temple",
        "Queen Hatshepsut Temple",
        "Valley of the Queens",
        "Medinet Habu",
        "Colossi of Memnon",
        "Ramesseum Temple"
      ];
    }
  };
  const serviceAreas = getServiceAreas();

  return (
    <>
      <SeoMeta
        title={`Luxor Private Tour Guide & Car | From ${formatLEPerDay("luxor-guide-car")}`}
        description={`Private licensed Egyptologist and car in Luxor from ${formatLEPerDay("luxor-guide-car")}. Karnak, the Valley of the Kings and both banks. Entrance tickets billed separately.`}
        canonical="https://affordegypt.com/luxor-car-tour-guide-services"
        schema={SERVICE_SCHEMA}
      />

      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <UserCheck className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {t("guideServices.luxor.heroTitle")}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("guideServices.luxor.heroSubtitle", { interpolation: { guidePrice: formatLE("luxor-guide-services"), guideCarPrice: formatLE("luxor-guide-car") } })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/transfers">
                    Book Temple Tour
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    <Phone className="w-5 h-5 mr-2" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.luxor.whyChooseTitle")}</h2>
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

        {/* Service Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {serviceTypes.map((service, index) => (
                <Card key={index} className="relative hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <service.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                    <CardTitle className="text-2xl">{service.name}</CardTitle>
                    <p className="text-muted-foreground">{service.duration}</p>
                    <Badge variant="secondary" className="text-lg font-semibold px-4 py-1 mt-2">
                      {service.price}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
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
              <h2 className="text-3xl font-bold text-center mb-12">Ancient Luxor Temple Sites</h2>
              <p className="text-center text-muted-foreground mb-8">
                Professional guided tours of the world's greatest open-air museum
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Specialized Luxor Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Luxor Temple Specialties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="w-6 h-6 text-primary" />
                      Valley of Kings Expert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Specialized guides for the royal tombs with detailed knowledge of pharaonic 
                      burial practices, tomb art, and recent archaeological discoveries.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-6 h-6 text-primary" />
                      Temple Architecture Tours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Expert architectural guides explaining the engineering marvels of Karnak 
                      and Luxor temples, including hieroglyphic translations and historical context.
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
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">1</div>
                  <h3 className="font-semibold mb-2">Book Your Tour</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose East Bank, West Bank, or combined temple tour package
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">2</div>
                  <h3 className="font-semibold mb-2">Meet Temple Expert</h3>
                  <p className="text-sm text-muted-foreground">
                    Licensed archaeologist guide meets you with comfortable transport
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Explore Ancient Thebes</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover pharaonic treasures with expert historical commentary
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
              <h2 className="text-3xl font-bold mb-6">{t("guideServices.luxor.pricingTitle")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("guideServices.luxor.pricingDesc")}
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Licensed guide from {formatLEPerDay("luxor-guide-services")} — guide + private car from {formatLEPerDay("luxor-guide-car")}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Licensed guides • Temple expertise • Private air-conditioned car on the guide + car package • Entrance tickets billed separately
                </p>
                <Button asChild size="lg">
                  <Link href="/transfers">
                    Get Instant Quote
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>

                </Button>
              </div>
            </div>
          </div>
        </section>

        <AdvanceTicketNote />

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("guideServices.luxor.ctaTitle")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("guideServices.luxor.ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/pricing-tool">
                  Book Online Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>

              </Button>
              <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
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