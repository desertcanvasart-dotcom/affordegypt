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
  Languages,
  Camera
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function CairoGuideServices() {
  const SERVICE_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Private Tour Guide and Car",
    "provider": { "@type": "TravelAgency", "name": "AffordEgypt" },
    "areaServed": "Cairo",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "minPrice": pricingSnapshot.services["cairo-guide-services"].minPrice,
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
      name: t("guideServices.common.professionalGuide"),
      duration: t("guideServices.common.fullDay8Hours"),
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("cairo-guide-services") } }),
      features: ["Licensed Egyptologist", "Fluent English/Arabic", "Historical expertise"],
      icon: UserCheck
    },
    {
      name: t("guideServices.common.guideCarPackage"),
      duration: t("guideServices.common.fullDay"), 
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("cairo-guide-car") } }),
      features: [t("guideServices.common.licensedGuide"), "Private vehicle", t("guideServices.common.entranceFeesExcluded")],
      icon: Users
    },
    {
      name: t("guideServices.common.premiumCarService"),
      duration: t("guideServices.common.6to12Hours"),
      price: t("guideServices.common.priceFrom", { interpolation: { price: formatEGPPlain("cairo-tour-car") } }),
      features: ["Luxury sedan/SUV", t("guideServices.common.professionalDriver"), t("guideServices.common.flexibleItinerary")],
      icon: Car
    }
  ];

  const keyFeatures = [
    {
      icon: Languages,
      title: t("guideServices.cairo.multilingualGuides"),
      description: t("guideServices.cairo.multilingualGuidesDesc")
    },
    {
      icon: Shield,
      title: t("guideServices.cairo.licensedInsured"),
      description: t("guideServices.cairo.licensedInsuredDesc")
    },
    {
      icon: Camera,
      title: t("guideServices.cairo.photographySupport"),
      description: t("guideServices.cairo.photographySupportDesc")
    },
    {
      icon: Clock,
      title: t("guideServices.cairo.flexibleScheduling"),
      description: t("guideServices.cairo.flexibleSchedulingDesc")
    }
  ];

  // Guide service areas in Cairo with fallback
  const getServiceAreas = () => {
    try {
      const areas = [
        "Giza Pyramids & Sphinx",
        "Egyptian Museum",
        "Islamic Cairo",
        "Coptic Cairo", 
        "Khan El Khalili Bazaar",
        "Citadel of Saladin",
        "Al-Azhar Mosque",
        "Old Cairo Walking Tours"
      ];
      return areas;
    } catch {
      return [
        "Giza Pyramids & Sphinx",
        "Egyptian Museum",
        "Islamic Cairo",
        "Coptic Cairo",
        "Khan El Khalili Bazaar",
        "Citadel of Saladin",
        "Al-Azhar Mosque", 
        "Old Cairo Walking Tours"
      ];
    }
  };
  const serviceAreas = getServiceAreas();

  return (
    <>
      <SeoMeta
        title={`Cairo Private Tour Guide & Car | From ${formatLEPerDay("cairo-guide-car")}`}
        description={`Private licensed Egyptologist + air-conditioned vehicle for Cairo, Giza, Saqqara, and Memphis. From ${formatLEPerDay("cairo-guide-car")} for guide + private car (entrance tickets separate). ETAA-licensed Travel2Egypt operator.`}
        canonical="https://affordegypt.com/cairo-car-tour-guide-services"
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
                  {t("guideServices.cairo.heroTitle")}
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t("guideServices.cairo.heroSubtitle", { interpolation: { guidePrice: formatLE("cairo-guide-services"), guideCarPrice: formatLE("cairo-guide-car") } })}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/transfers">
                    {t("guideServices.common.bookNow")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    <Phone className="w-5 h-5 mr-2" />
                    {t("guideServices.common.whatsapp")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.cairo.whyChooseTitle")}</h2>
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
            <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.common.howItWorks")}</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.cairo.serviceAreasTitle")}</h2>
              <p className="text-center text-muted-foreground mb-8">
                {t("guideServices.cairo.serviceAreasDesc")}
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

        {/* Specialized Cairo Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.cairo.specialtiesTitle")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-primary" />
                      {t("guideServices.cairo.egyptologyExperts")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("guideServices.cairo.egyptologyExpertsDesc")}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-6 h-6 text-primary" />
                      {t("guideServices.cairo.islamicCairoSpecialists")}  
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("guideServices.cairo.islamicCairoSpecialistsDesc")}
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
            <h2 className="text-3xl font-bold text-center mb-12">{t("guideServices.common.howItWorks")}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">1</div>
                  <h3 className="font-semibold mb-2">Choose Your Service</h3>
                  <p className="text-sm text-muted-foreground">
                    Select guide only, car only, or combined package based on your needs
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">2</div>
                  <h3 className="font-semibold mb-2">Meet Your Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional licensed guide will meet you at your hotel or chosen location
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Explore Cairo</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover Cairo's wonders with expert commentary and insider knowledge
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
              <h2 className="text-3xl font-bold mb-6">{t("guideServices.cairo.pricingTitle")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("guideServices.cairo.pricingDesc")}
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{t("guideServices.cairo.guidePriceFrom")}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("guideServices.cairo.pricingInfo")}
                </p>
                <Button asChild size="lg">
                  <Link href="/transfers">
                    {t("guideServices.common.getInstantQuote")}
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
            <h2 className="text-3xl font-bold mb-4">{t("guideServices.cairo.ctaTitle")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("guideServices.cairo.ctaSubtitle")}
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
                  {t("guideServices.common.callNow")}
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