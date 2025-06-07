import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Camera, Mountain, Sun, Compass, DollarSign, Calendar, Users, Tent } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function EasternWesternDesertsGuide() {
  const destinations = [
    {
      name: "Bahariya Oasis",
      location: "Bawiti",
      highlights: ["White Desert tours", "Crystal Mountain", "Hot springs"],
      budget: "300-500 EGP/night",
      icon: <Mountain className="w-6 h-6 text-primary" />
    },
    {
      name: "Black & White Desert", 
      location: "From Bahariya",
      highlights: ["Mushroom rock formations", "Fossilized seashells", "Volcanic hills"],
      budget: "900 EGP pp (group tour)",
      icon: <Compass className="w-6 h-6 text-primary" />
    },
    {
      name: "Farafra Oasis",
      location: "Central Western Desert",
      highlights: ["Art Centre", "Bir Sitta hot spring", "Quiet atmosphere"],
      budget: "400-600 EGP/night",
      icon: <Sun className="w-6 h-6 text-primary" />
    },
    {
      name: "Dakhla Oasis",
      location: "Southern Western Desert",
      highlights: ["Al-Qasr mudbrick town", "Desert farms", "Mut hot springs"],
      budget: "450 EGP/night",
      icon: <Camera className="w-6 h-6 text-primary" />
    },
    {
      name: "Kharga Oasis",
      location: "New Valley",
      highlights: ["Temple of Hibis", "Christian cemeteries", "Ancient forts"],
      budget: "300-500 EGP/night",
      icon: <Star className="w-6 h-6 text-primary" />
    },
    {
      name: "Siwa Oasis",
      location: "Near Libyan border",
      highlights: ["Salt lakes", "Mountain of the Dead", "Great Sand Sea"],
      budget: "300-500 EGP/night",
      icon: <MapPin className="w-6 h-6 text-primary" />
    }
  ];

  const budgetItinerary = [
    {
      day: "Day 1",
      location: "Cairo → Bahariya",
      activities: "Bus journey, overnight in Bawiti",
      cost: "350 EGP"
    },
    {
      day: "Day 2", 
      location: "White Desert Tour",
      activities: "Group trip including meals and camping",
      cost: "900 EGP"
    },
    {
      day: "Day 3",
      location: "Bahariya relaxation",
      activities: "Hot springs, local meal, lodge stay",
      cost: "400 EGP"
    },
    {
      day: "Day 4",
      location: "Dakhla Oasis",
      activities: "Microbus transfer, visit Islamic mud city",
      cost: "250 EGP"
    },
    {
      day: "Day 5",
      location: "Return to Cairo",
      activities: "Bus journey, meals, SIM card top-up",
      cost: "300 EGP"
    }
  ];

  const packingList = [
    { item: "Power bank", reason: "No electricity during camping" },
    { item: "Scarf/keffiyeh", reason: "Sun, dust, and sand protection" },
    { item: "Flip flops & hiking shoes", reason: "For springs and rugged walks" },
    { item: "Thermal layer", reason: "Desert nights can be cold" },
    { item: "Flashlight", reason: "Minimal lighting in camps" },
    { item: "Refillable water bottle", reason: "Eco-friendly and refillable in oases" }
  ];

  const budgetTips = [
    "Join local safari groups instead of private trips to save up to 60%",
    "Travel during November and March for shoulder season pricing",
    "Use minibuses and shared taxis between oases",
    "Stay in family-run guesthouses over hotels",
    "Eat where locals gather for authentic, affordable meals",
    "Negotiate prices in person, especially in off-seasons"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative text-white min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1539650116574-75c0c6d73fdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                Eastern & Western Deserts
              </h1>
              <p className="text-2xl md:text-3xl text-teal-100 font-light">
                A Budget Explorer's Gateway to Egypt's Untamed Beauty
              </p>
            </div>
            <p className="text-lg md:text-xl text-teal-200 max-w-4xl mx-auto leading-relaxed">
              Egypt's deserts offer ancient mysteries, Martian landscapes, spiritual solitude, and local hospitality—all at a fraction of typical tourist hotspot costs. Perfect for budget-conscious adventurers seeking authentic experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                <Tent className="w-5 h-5 mr-2" />
                Plan Your Desert Adventure
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                <DollarSign className="w-5 h-5 mr-2" />
                View Budget Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* Desert Comparison */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Understanding Egypt's Two Great Deserts</h2>
            <p className="text-xl text-slate-600">
              Each desert offers unique landscapes and experiences for budget travelers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 bg-white shadow-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <Mountain className="w-6 h-6" />
                  Eastern Desert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700"><strong>Location:</strong> Between the Nile and Red Sea</p>
                  <p className="text-slate-700"><strong>Terrain:</strong> Rugged mountains, ancient trade routes</p>
                  <p className="text-slate-700"><strong>Best For:</strong> Hikers, off-roaders, history lovers</p>
                  <p className="text-slate-700"><strong>Access:</strong> Qena, Hurghada, Marsa Alam</p>
                  <p className="text-slate-700"><strong>Highlights:</strong> Roman quarries, Red Sea mountains</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <Sun className="w-6 h-6" />
                  Western Desert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700"><strong>Location:</strong> West of the Nile to Libyan border</p>
                  <p className="text-slate-700"><strong>Terrain:</strong> Oases, sand dunes, white & black deserts</p>
                  <p className="text-slate-700"><strong>Best For:</strong> Stargazers, nature seekers, cultural buffs</p>
                  <p className="text-slate-700"><strong>Access:</strong> Cairo, Luxor, Asyut, Marsa Matrouh</p>
                  <p className="text-slate-700"><strong>Highlights:</strong> Siwa, Bahariya, Farafra, Dakhla, Kharga</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Destinations */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Budget-Friendly Desert Destinations</h2>
            <p className="text-xl text-slate-600">
              Explore these incredible oases and landscapes without breaking the bank
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg text-primary">
                    {destination.icon}
                    {destination.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600">{destination.location}</p>
                  <Badge variant="outline" className="border-primary text-primary w-fit">
                    {destination.budget}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {destination.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-slate-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Budget Tips */}
        <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Smart Budget Travel Tips</h2>
              <p className="text-xl text-slate-600">
                How to explore Egypt's deserts affordably without compromising the experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgetTips.map((tip, index) => (
                <Card key={index} className="border-0 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-slate-700">{tip}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5-Day Budget Itinerary */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">5-Day Budget Desert Adventure</h2>
            <p className="text-xl text-slate-600 mb-4">
              Complete desert experience for under $250 USD
            </p>
            <Badge className="bg-primary text-white text-lg px-4 py-2">
              Total: ~2200 EGP (~$140 USD)
            </Badge>
          </div>

          <div className="space-y-4">
            {budgetItinerary.map((day, index) => (
              <Card key={index} className="border-0 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">{day.day}: {day.location}</h3>
                        <p className="text-slate-600">{day.activities}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary w-fit">
                      {day.cost}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Essential Packing List */}
        <section className="bg-slate-50 -mx-4 px-4 py-16 rounded-2xl">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-primary mb-4">Desert Packing Essentials</h2>
              <p className="text-xl text-slate-600">
                What to pack for comfortable and safe budget desert travel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packingList.map((item, index) => (
                <Card key={index} className="border-0 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">✓</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary mb-1">{item.item}</h4>
                        <p className="text-sm text-slate-600">{item.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Best Time to Visit */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">When to Visit for Best Value</h2>
            <p className="text-xl text-slate-600">
              Timing your desert adventure for optimal weather and budget savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="text-center text-green-700">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  Best Season
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-green-700 mb-2">Oct - Apr</p>
                <p className="text-slate-600">Perfect weather conditions and comfortable temperatures for desert exploration</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="text-center text-amber-700">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  Budget Sweet Spot
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-amber-700 mb-2">Nov & Mar</p>
                <p className="text-slate-600">Shoulder months with lower prices, fewer crowds, and mild weather</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="text-center text-red-700">
                  <Sun className="w-8 h-8 mx-auto mb-2" />
                  Avoid
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-red-700 mb-2">Jun - Aug</p>
                <p className="text-slate-600">Extreme heat makes desert travel uncomfortable and potentially dangerous</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-2xl text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">Ready to Explore Egypt's Desert Wilderness?</h2>
            <p className="text-xl mb-8 text-amber-100">
              Start planning your budget desert adventure with our multi-city pricing tool. Get transparent costs for transport, guides, and accommodations across all desert destinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#pricing">
                <Button size="lg" className="bg-white text-amber-700 hover:bg-amber-50 min-w-48">
                  <MapPin className="w-5 h-5 mr-2" />
                  Start Planning Your Trip
                </Button>
              </Link>
              <Link href="/guides">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-48">
                  <Users className="w-5 h-5 mr-2" />
                  Find Desert Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}