import { Helmet } from "react-helmet-async";
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
  const { t } = useSmartTranslation();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const serviceTypes = [
    {
      name: "Professional Guide",
      duration: "Full Day (8 hours)",
      price: "From 1,200 EGP",
      features: ["Licensed Egyptologist", "Fluent English/Arabic", "Historical expertise"],
      icon: UserCheck
    },
    {
      name: "Guide + Car Package",
      duration: "Full Day", 
      price: "From 2,400 EGP",
      features: ["Professional guide", "Private vehicle", "All entrance fees included"],
      icon: Users
    },
    {
      name: "Premium Car Service",
      duration: "8-12 hours",
      price: "From 1,800 EGP", 
      features: ["Luxury sedan/SUV", "Professional driver", "Flexible itinerary"],
      icon: Car
    }
  ];

  const keyFeatures = [
    {
      icon: Languages,
      title: "Multilingual Guides",
      description: "Expert guides fluent in English, Arabic, French, German and Spanish"
    },
    {
      icon: Shield,
      title: "Licensed & Insured",
      description: "All guides are officially licensed by Egyptian Ministry of Tourism"
    },
    {
      icon: Camera,
      title: "Photography Support",
      description: "Guides help you capture perfect photos at iconic Cairo landmarks"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Customize your itinerary and timing to match your preferences"
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
      <Helmet>
        <title>Cairo Guide & Car Services - Expert Tours | AffordEgypt</title>
        <meta 
          name="description" 
          content="Professional Cairo guide services from 1,200 EGP. Licensed Egyptologists, luxury cars, multilingual guides. Pyramids, museums, Islamic Cairo tours." 
        />
        <meta name="keywords" content="Cairo guide, Egypt tour guide, Cairo car service, pyramid tours, Egyptian Museum guide, Islamic Cairo tours" />
        <meta property="og:title" content="Cairo Guide & Car Services - Expert Tours" />
        <meta property="og:description" content="Professional guide services and luxury car rentals in Cairo from 1,200 EGP." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <UserCheck className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Cairo Guide & Car Services
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Expert Cairo guides and luxury car services. Licensed Egyptologists, 
                multilingual support, and premium vehicles from 1,200 EGP.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/transfers">
                  <Button size="lg" className="text-lg px-8">
                    Book Guide Service
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Cairo Guide Services?</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">Popular Cairo Tour Destinations</h2>
              <p className="text-center text-muted-foreground mb-8">
                Our expert guides cover all major Cairo attractions and hidden gems
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
              <h2 className="text-3xl font-bold text-center mb-12">Cairo Specialty Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-6 h-6 text-primary" />
                      Egyptology Experts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Licensed Egyptologists with deep knowledge of pharaonic history, 
                      hieroglyphs, and archaeological discoveries. Perfect for museum tours and pyramid exploration.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-6 h-6 text-primary" />
                      Islamic Cairo Specialists  
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Expert guides for Islamic Cairo's medieval streets, historic mosques, 
                      and traditional bazaars. Experience authentic Egyptian culture and architecture.
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
              <h2 className="text-3xl font-bold mb-6">Affordable Cairo Guide Services</h2>
              <p className="text-muted-foreground mb-8">
                Professional guides and luxury vehicles at competitive prices. No hidden costs.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Starting from 1,200 EGP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Licensed guides • Luxury vehicles • Multilingual support • All entrance fees
                </p>
                <Link href="/transfers">
                  <Button size="lg">
                    Get Instant Quote
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
            <h2 className="text-3xl font-bold mb-4">Ready to Explore Ancient Cairo?</h2>
            <p className="text-lg mb-8 opacity-90">
              Book your expert guide and discover the secrets of the pharaohs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing-tool">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Book Online Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary bg-transparent">
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