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
  Phone
} from "lucide-react";

export default function CairoAirportTransfers() {
  const vehicleTypes = [
    {
      name: "Sedan",
      capacity: "1-3 passengers",
      price: "From 950 EGP",
      features: ["Air conditioning", "Professional driver", "Meet & greet"],
      icon: Car
    },
    {
      name: "Minivan",
      capacity: "4-7 passengers", 
      price: "From 1,553 EGP",
      features: ["Extra luggage space", "Family-friendly", "Comfortable seating"],
      icon: Users
    },
    {
      name: "Van",
      capacity: "8+ passengers",
      price: "From 2,406 EGP", 
      features: ["Group travel", "Large luggage capacity", "Premium comfort"],
      icon: Users
    }
  ];

  const keyFeatures = [
    {
      icon: Shield,
      title: "24/7 Service",
      description: "Round-the-clock airport transfers available every day"
    },
    {
      icon: Clock,
      title: "Flight Monitoring",
      description: "We track your flight and adjust pickup times accordingly"
    },
    {
      icon: MapPin,
      title: "Door-to-Door",
      description: "Direct transfers from airport to your hotel or destination"
    },
    {
      icon: CheckCircle,
      title: "Professional Drivers",
      description: "Licensed, experienced drivers with local knowledge"
    }
  ];

  const airportAreas = [
    "Cairo International Airport (CAI)",
    "New Cairo Hotels",
    "6th of October City",
    "Giza Hotels",
    "Downtown Cairo",
    "Heliopolis",
    "Maadi",
    "Zamalek"
  ];

  return (
    <>
      <Helmet>
        <title>Cairo Airport Transfers - Reliable & Affordable | AffordEgypt</title>
        <meta 
          name="description" 
          content="Book reliable Cairo airport transfers from 950 EGP. Professional drivers, 24/7 service, flight monitoring. Transfer to hotels in New Cairo, Giza, Downtown & more." 
        />
        <meta name="keywords" content="Cairo airport transfer, CAI airport transport, Cairo taxi, Egypt airport shuttle, New Cairo transfer" />
        <meta property="og:title" content="Cairo Airport Transfers - Reliable & Affordable" />
        <meta property="og:description" content="Professional airport transfers in Cairo from 950 EGP. Book online with AffordEgypt." />
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
                  Cairo Airport Transfers
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Reliable, comfortable, and affordable airport transfers in Cairo. Professional drivers, 
                flight monitoring, and transparent pricing from 950 EGP.
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
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Cairo Airport Transfers?</h2>
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
              <h2 className="text-3xl font-bold text-center mb-12">Cairo Transfer Destinations</h2>
              <p className="text-center text-muted-foreground mb-8">
                We provide airport transfers to all major areas in and around Cairo
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {airportAreas.map((area, index) => (
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
                    Your driver will meet you at the designated pickup point
                  </p>
                </div>
                <div className="text-center">
                  <div className="step-number mb-4 mx-auto">3</div>
                  <h3 className="font-semibold mb-2">Enjoy Your Ride</h3>
                  <p className="text-sm text-muted-foreground">
                    Relax in comfort as we take you to your destination
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
              <h2 className="text-3xl font-bold mb-6">Transparent Pricing</h2>
              <p className="text-muted-foreground mb-8">
                No hidden fees. What you see is what you pay. Prices include all taxes and fees.
              </p>
              <div className="bg-background p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">Starting from 950 EGP</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Airport to hotel transfers • Professional driver • Meet & greet service
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
            <h2 className="text-3xl font-bold mb-4">Ready to Book Your Cairo Airport Transfer?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of satisfied customers who trust us for their Cairo airport transfers
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