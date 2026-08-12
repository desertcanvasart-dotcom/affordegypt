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
  Waves,
  Mountain
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AdvanceTicketNote from "@/components/advance-ticket-note";

export default function AswanGuideServices() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Private Tour Guide and Car",
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Aswan",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["aswan-guide-services"].minPrice,
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
      name: "Nubian Culture Guide",
      duration: "Full Day (8 hours)",
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("aswan-guide-services") } }),
      features: ["Nubian heritage expert", "Local village guide", "Traditional culture focus"],
      icon: UserCheck
    },
    {
      name: "Nile & Temples Package",
      duration: "Full Day", 
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("aswan-guide-car") } }),
      features: ["Professional guide", "Private vehicle", "Philae Temple tour"],
      icon: Users
    },
    {
      name: "Abu Simbel Expedition",
      duration: "12-14 hours",
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("aswan-abu-simbel-guide-car") } }), 
      features: ["Long-distance vehicle", "Expert guide", "UNESCO site specialist"],
      icon: Car
    }
  ];

  const keyFeatures = [
    {
      icon: Waves,
      title: "Nile Expertise",
      description: "Specialized knowledge of Nubian culture and Nile river traditions"
    },
    {
      icon: Shield,
      title: "Cultural Sensitivity",
      description: "Respectful guides trained in Nubian customs and traditions"
    },
    {
      icon: Mountain,
      title: "Desert Expeditions",
      description: "Expert guides for Abu Simbel and southern desert temple sites"
    },
    {
      icon: Clock,
      title: "Flexible Itineraries",
      description: "Customized tours including felucca rides and village visits"
    }
  ];

  // Guide service areas in Aswan with fallback
  const getServiceAreas = () => {
    try {
      const areas = [
        "Philae Temple",
        "Abu Simbel Temples",
        "Elephantine Island",
        "Nubian Villages",
        "Aswan High Dam",
        "Unfinished Obelisk",
        "Felucca Sailing",
        "Kitchener's Island"
      ];
      return areas;
    } catch {
      return [
        "Philae Temple",
        "Abu Simbel Temples",
        "Elephantine Island",
        "Nubian Villages",
        "Aswan High Dam",
        "Unfinished Obelisk",
        "Felucca Sailing",
        "Kitchener's Island"
      ];
    }
  };
  const serviceAreas = getServiceAreas();

  return (
    <>
      <SeoMeta
        title={`Aswan Private Tour Guide & Car | From ${formatLEPerDay("aswan-guide-car")}`}
        description={`Private licensed Egyptologist and car in Aswan from ${formatLEPerDay("aswan-guide-car")}. Philae, the High Dam and Nubian villages. Entrance tickets billed separately.`}
        canonical="https://affordegypt.com/aswan-car-tour-guide-services"
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
                  Aswan Car & Tour Guide Services
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("guideServices.aswan.heroSubtitle", { interpolation: { guidePrice: formatLE("aswan-guide-services"), guideCarPrice: formatLE("aswan-guide-car") } })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/transfers">
                    Book Cultural Tour
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Aswan Car & Tour Guide Services?</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">Southern Egypt Destinations</h2>
              <p className="text-center text-muted-foreground mb-8">
                Experience the jewels of the Nile with expert cultural guidance
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

        {/* Specialized Aswan Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Aswan Cultural Specialties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Waves className="w-6 h-6 text-primary" />
                      Nubian Heritage Tours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Authentic Nubian village visits with local community guides. Experience 
                      traditional crafts, music, and hospitality while respecting local customs.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mountain className="w-6 h-6 text-primary" />
                      Abu Simbel Expeditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Professional desert guides for the ultimate UNESCO World Heritage site. 
                      Early departure options and expert commentary on Ramses II's masterpiece.
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
                  <h3 className="font-semibold mb-2">Choose Your Experience</h3>
                  <p className="text-sm text-muted-foreground">
                    Select cultural tours, temple visits, or desert expeditions
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">2</div>
                  <h3 className="font-semibold mb-2">Meet Cultural Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Local Nubian guide with deep knowledge of traditions and history
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Experience Nubia</h3>
                  <p className="text-sm text-muted-foreground">
                    Immerse yourself in the unique culture of southern Egypt
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
              <h2 className="text-3xl font-bold mb-6">Authentic Aswan Car & Tour Guide Services</h2>
              <p className="text-muted-foreground mb-8">
                Genuine cultural experiences with local Nubian guides. Best value cultural tourism.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Licensed guide from {formatLEPerDay("aswan-guide-services")} — guide + private car from {formatLEPerDay("aswan-guide-car")}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Local guides • Cultural immersion • Private car on the guide + car package • Entrance tickets billed separately
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
            <h2 className="text-3xl font-bold mb-4">Ready to Experience Nubian Culture?</h2>
            <p className="text-lg mb-8 opacity-90">
              Discover the authentic traditions of southern Egypt with local experts
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