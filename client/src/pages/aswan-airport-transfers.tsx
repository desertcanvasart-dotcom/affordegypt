import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
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
  Waves,
  Mountain
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AswanAirportTransfers() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const vehicleTypes = [
    {
      name: "Sedan",
      capacity: "1-3 passengers",
      price: "From 575 EGP",
      features: ["Air conditioning", "Professional driver", "Nile route expertise"],
      icon: Car
    },
    {
      name: "Minivan",
      capacity: "4-7 passengers", 
      price: "From 950 EGP",
      features: ["Extra luggage space", "Family-friendly", "Nubian culture knowledge"],
      icon: Users
    },
    {
      name: "Van",
      capacity: "8+ passengers",
      price: "From 1,283 EGP", 
      features: ["Group travel", "Large luggage capacity", "Abu Simbel route ready"],
      icon: Users
    }
  ];

  const keyFeatures = [
    {
      icon: Waves,
      title: "Nile Expertise",
      description: "Specialized knowledge of Aswan's unique Nile locations and felucca ports"
    },
    {
      icon: Clock,
      title: "Flight Monitoring",
      description: "We track your flight and adjust pickup times accordingly"
    },
    {
      icon: Mountain,
      title: "Desert Routes",
      description: "Expert navigation to Abu Simbel and other southern desert destinations"
    },
    {
      icon: CheckCircle,
      title: "Nubian Culture",
      description: "Drivers with knowledge of local Nubian culture and traditions"
    }
  ];

  const aswanAreas = [
    "Aswan Airport (ASW)",
    "Corniche Hotels",
    "Elephantine Island",
    "Nubian Villages", 
    "Philae Temple Area",
    "High Dam District",
    "Felucca Harbors",
    "Abu Simbel Route"
  ];

  return (
    <>
      <Helmet>
        <title>Aswan Airport Transfers - Nile City Transport | AffordEgypt</title>
        <meta 
          name="description" 
          content="Book Aswan airport transfers from 575 EGP. Expert Nile city drivers, Nubian culture knowledge, desert routes to Abu Simbel. Reliable southern Egypt transport." 
        />
        <meta name="keywords" content="Aswan airport transfer, ASW airport transport, Abu Simbel transfer, Nubian village transport, Aswan taxi, Nile transport" />
        <meta property="og:title" content="Aswan Airport Transfers - Nile City Transport" />
        <meta property="og:description" content="Professional airport transfers in beautiful Aswan from 575 EGP. Nile expertise and desert routes." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Plane className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Aswan Airport Transfers
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Professional airport transfers in beautiful Aswan. Expert Nile city drivers 
                with local knowledge and transparent pricing from 575 EGP.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/transfers">
                  <Button size="lg" className="text-lg px-8">
                    Book Now
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Aswan Airport Transfers?</h2>
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
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Vehicle</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">Aswan Transfer Destinations</h2>
              <p className="text-center text-muted-foreground mb-8">
                We provide airport transfers to all major areas in Aswan and southern Egypt
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {aswanAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Special Aswan Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Southern Egypt Expertise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Waves className="w-6 h-6 text-primary" />
                      Nile Navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Expert knowledge of Aswan's unique Nile geography, including felucca harbors, 
                      Elephantine Island access, and Philae Temple boat connections.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mountain className="w-6 h-6 text-primary" />
                      Desert Expeditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Ready for long-distance transfers to Abu Simbel and other desert destinations. 
                      Our vehicles are equipped for extended southern Egypt journeys.
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
                  <h3 className="font-semibold mb-2">Book Online</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your pickup time, destination, and vehicle type
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">2</div>
                  <h3 className="font-semibold mb-2">Meet Your Driver</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Nile city expert driver will meet you at the airport
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Discover Aswan</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrive relaxed and ready to explore the jewel of the Nile
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
              <h2 className="text-3xl font-bold mb-6">Affordable Aswan Transfers</h2>
              <p className="text-muted-foreground mb-8">
                Best value transfers in southern Egypt. Transparent pricing with no hidden costs.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Starting from 575 EGP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Airport to hotel transfers • Nile expert driver • Local cultural knowledge
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
            <h2 className="text-3xl font-bold mb-4">Ready to Experience the Jewel of the Nile?</h2>
            <p className="text-lg mb-8 opacity-90">
              Begin your Aswan adventure with our reliable and knowledgeable transfer service
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