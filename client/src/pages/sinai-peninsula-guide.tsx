import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Camera, Mountain, Waves, Sun, Compass, AlertTriangle, Thermometer } from "lucide-react";
import { Link } from "wouter";

export default function SinaiPeninsulaGuide() {
  const destinations = [
    {
      name: "Sharm El Sheikh",
      description: "World-class Red Sea resort destination with pristine coral reefs",
      highlights: ["Naama Bay", "Ras Mohammed National Park", "Diving & Snorkeling", "Luxury Resorts"],
      bestTime: "Oct-Apr",
      duration: "3-7 days",
      difficulty: "Easy",
      image: "🏖️"
    },
    {
      name: "Dahab",
      description: "Laid-back coastal town famous for diving and desert adventures",
      highlights: ["Blue Hole", "Mount Sinai Trek", "Bedouin Culture", "Wind Surfing"],
      bestTime: "Oct-Apr",
      duration: "2-5 days", 
      difficulty: "Moderate",
      image: "🤿"
    },
    {
      name: "Mount Sinai",
      description: "Sacred biblical mountain with spectacular sunrise views",
      highlights: ["Sunrise Trek", "St. Catherine's Monastery", "Moses' Well", "Desert Views"],
      bestTime: "Oct-Mar",
      duration: "1-2 days",
      difficulty: "Challenging",
      image: "⛰️"
    },
    {
      name: "Nuweiba",
      description: "Quiet coastal town perfect for relaxation and Bedouin experiences",
      highlights: ["Colored Canyon", "Tarabin Beach", "Bedouin Camps", "Ferry to Jordan"],
      bestTime: "Oct-Apr",
      duration: "2-3 days",
      difficulty: "Easy",
      image: "🏕️"
    }
  ];

  const activities = [
    {
      category: "Water Sports",
      items: [
        { name: "Scuba Diving", price: "From $45/dive", description: "Explore world-famous coral reefs" },
        { name: "Snorkeling Tours", price: "From $25/trip", description: "Discover marine life in shallow waters" },
        { name: "Windsurfing", price: "From $35/hour", description: "Perfect conditions in Dahab" },
        { name: "Kitesurfing", price: "From $50/lesson", description: "Learn in ideal wind conditions" }
      ]
    },
    {
      category: "Desert Adventures", 
      items: [
        { name: "Camel Trekking", price: "From $30/day", description: "Traditional Bedouin transport" },
        { name: "Desert Safari", price: "From $60/trip", description: "4WD exploration of Sinai desert" },
        { name: "Colored Canyon Hike", price: "From $40/trip", description: "Stunning geological formations" },
        { name: "Bedouin Night", price: "From $45/night", description: "Authentic desert camping experience" }
      ]
    },
    {
      category: "Cultural & Spiritual",
      items: [
        { name: "Mount Sinai Sunrise Trek", price: "From $35/person", description: "Biblical mountain pilgrimage" },
        { name: "St. Catherine's Monastery", price: "From $25/visit", description: "Ancient Christian monastery" },
        { name: "Bedouin Village Visit", price: "From $30/trip", description: "Traditional desert culture" },
        { name: "Wadi Feiran Oasis", price: "From $55/trip", description: "Historic biblical oasis" }
      ]
    }
  ];

  const practicalInfo = [
    {
      title: "Best Time to Visit",
      content: "October to April offers perfect weather (20-25°C). Summer months (May-September) are extremely hot (35-45°C) but great for diving.",
      icon: <Thermometer className="w-5 h-5 text-orange-500" />
    },
    {
      title: "Getting There",
      content: "Fly into Sharm El Sheikh Airport (SSH) or drive from Cairo (6-7 hours). Taba border crossing connects to Israel/Jordan.",
      icon: <Compass className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Safety Considerations", 
      content: "Generally safe for tourists. Stick to established resorts and tour operators. Check current travel advisories for desert areas.",
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      title: "What to Pack",
      content: "Reef-safe sunscreen, diving gear (or rent locally), desert clothing, warm layers for mountain treks, comfortable hiking boots.",
      icon: <Mountain className="w-5 h-5 text-green-500" />
    }
  ];

  const itineraries = [
    {
      title: "Sinai Highlights (5 Days)",
      days: [
        "Day 1-2: Sharm El Sheikh - Diving & relaxation",
        "Day 3: Mount Sinai sunrise trek & St. Catherine's",
        "Day 4: Transfer to Dahab, Blue Hole diving",
        "Day 5: Colored Canyon day trip from Dahab"
      ],
      price: "From $380/person"
    },
    {
      title: "Adventure Sinai (7 Days)", 
      days: [
        "Day 1-2: Sharm El Sheikh - Ras Mohammed diving",
        "Day 3-4: Dahab - Advanced diving & windsurfing",
        "Day 5: Mount Sinai trek & monastery visit",
        "Day 6: Nuweiba - Colored Canyon & Bedouin experience",
        "Day 7: Return via desert safari to Sharm"
      ],
      price: "From $590/person"
    },
    {
      title: "Relaxed Sinai (10 Days)",
      days: [
        "Day 1-4: Sharm El Sheikh - Resort relaxation & diving",
        "Day 5-7: Dahab - Leisurely diving & desert trips", 
        "Day 8: Mount Sinai spiritual journey",
        "Day 9-10: Nuweiba - Beach relaxation & cultural experiences"
      ],
      price: "From $720/person"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Sinai Peninsula
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Where Desert Meets Sea: Discover pristine coral reefs, sacred mountains, and timeless Bedouin culture in Egypt's adventure playground
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Waves className="w-4 h-4 mr-2" />
                World-Class Diving
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Mountain className="w-4 h-4 mr-2" />
                Sacred Mountains  
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Sun className="w-4 h-4 mr-2" />
                Desert Adventures
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Destinations Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sinai Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From world-renowned diving spots to sacred biblical sites, explore the diverse wonders of the Sinai Peninsula
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinations.map((destination, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <span className="text-3xl">{destination.image}</span>
                        {destination.name}
                      </CardTitle>
                      <p className="text-gray-600 mt-2">{destination.description}</p>
                    </div>
                    <Badge variant={destination.difficulty === 'Easy' ? 'default' : destination.difficulty === 'Moderate' ? 'secondary' : 'destructive'}>
                      {destination.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="outline" className="border-orange-200 text-orange-700">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {destination.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {destination.bestTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Adventures & Activities</h2>
            <p className="text-xl text-gray-600">
              From underwater explorations to desert expeditions and spiritual journeys
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activities.map((category, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-gray-800">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-orange-400 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {item.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sample Itineraries */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Sample Itineraries</h2>
            <p className="text-xl text-gray-600">
              Carefully crafted journeys combining adventure, culture, and relaxation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itineraries.map((itinerary, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-gray-800">{itinerary.title}</CardTitle>
                  <div className="text-center">
                    <Badge variant="outline" className="border-orange-300 text-orange-700 font-semibold">
                      {itinerary.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itinerary.days.map((day, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-orange-700">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700">{day}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Practical Information */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Essential Travel Information</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know for your Sinai Peninsula adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practicalInfo.map((info, index) => (
              <Card key={index} className="border-0 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {info.icon}
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">Ready to Explore Sinai?</h2>
            <p className="text-xl mb-8 text-orange-100">
              Plan your perfect Sinai Peninsula adventure with our expert local guides and transparent pricing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing-tool">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 min-w-48">
                  <MapPin className="w-5 h-5 mr-2" />
                  Start Planning Your Trip
                </Button>
              </Link>
              <Link href="/guides">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-48">
                  <Star className="w-5 h-5 mr-2" />
                  Browse Expert Guides
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}