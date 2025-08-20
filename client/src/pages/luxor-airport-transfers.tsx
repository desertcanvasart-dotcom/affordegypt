import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function LuxorAirportTransfers() {
  const vehicleTypes = [
    {
      name: "Sedan",
      capacity: "1-3 passengers",
      price: "From 460 EGP",
      features: ["Air conditioning", "Professional driver", "Temple route knowledge"],
      icon: Car
    },
    {
      name: "Minivan",
      capacity: "4-7 passengers", 
      price: "From 805 EGP",
      features: ["Extra luggage space", "Family-friendly", "Tourist-friendly"],
      icon: Users
    },
    {
      name: "Van",
      capacity: "8+ passengers",
      price: "From 1,248 EGP", 
      features: ["Group travel", "Large luggage capacity", "Tour group friendly"],
      icon: Users
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: "Temple Expertise",
      description: "Drivers knowledgeable about Luxor's ancient sites and routes"
    },
    {
      icon: Clock,
      title: "Flight Monitoring",
      description: "We track your flight and adjust pickup times accordingly"
    },
    {
      icon: Camera,
      title: "Sightseeing Stops",
      description: "Optional photo stops at scenic locations en route"
    },
    {
      icon: CheckCircle,
      title: "Local Knowledge",
      description: "Expert local drivers with Luxor area expertise"
    }
  ];

  const luxorAreas = [
    "Luxor Airport (LXR)",
    "East Bank Hotels",
    "West Bank Hotels", 
    "Valley of the Kings",
    "Karnak Temple Area",
    "Luxor Temple District",
    "Nile Cruise Terminals",
    "Winter Palace Area"
  ];

  return (
    <>
      <Helmet>
        <title>Luxor Airport Transfers - Professional & Reliable | AffordEgypt</title>
        <meta 
          name="description" 
          content="Book Luxor airport transfers from 460 EGP. Expert drivers with local knowledge, temple routes, and comfortable vehicles. East Bank, West Bank & Nile cruise transfers." 
        />
        <meta name="keywords" content="Luxor airport transfer, LXR airport transport, Valley of Kings transfer, Luxor taxi, Egypt ancient sites transport" />
        <meta property="og:title" content="Luxor Airport Transfers - Professional & Reliable" />
        <meta property="og:description" content="Professional airport transfers in ancient Luxor from 460 EGP. Expert local drivers." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Plane className="w-10 h-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  Luxor Airport Transfers
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Professional airport transfers in the ancient city of Luxor. Expert local drivers 
                with temple route knowledge and transparent pricing from 460 EGP.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing-tool">
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Luxor Airport Transfers?</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">Luxor Transfer Destinations</h2>
              <p className="text-center text-muted-foreground mb-8">
                We provide airport transfers to all major areas and ancient sites in Luxor
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {luxorAreas.map((area, index) => (
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
              <h2 className="text-3xl font-bold text-center mb-12">Ancient Luxor Expertise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-6 h-6 text-primary" />
                      Temple Route Knowledge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Our drivers know the best routes to major temples and can recommend optimal 
                      times to visit Valley of the Kings, Karnak Temple, and other ancient sites.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      East & West Bank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Seamless transfers between East Bank hotels and West Bank attractions. 
                      We know all ferry schedules and bridge crossing times.
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
                    Your local expert driver will meet you at the airport
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Explore Luxor</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrive comfortable and ready to explore ancient wonders
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
              <h2 className="text-3xl font-bold mb-6">Affordable Luxor Transfers</h2>
              <p className="text-muted-foreground mb-8">
                Competitive rates for ancient city transfers. No hidden fees or tourist markup.
              </p>
              <div className="bg-muted/30 p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Starting from 460 EGP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Airport to hotel transfers • Local expert driver • Temple route knowledge
                </p>
                <Link href="/pricing-tool">
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
            <h2 className="text-3xl font-bold mb-4">Ready to Explore Ancient Luxor?</h2>
            <p className="text-lg mb-8 opacity-90">
              Start your journey to the world's greatest open-air museum with our reliable transfers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing-tool">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Book Online Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="https://wa.me/201100765283" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}