import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  DollarSign, 
  Calendar, 
  MapPin, 
  Shield, 
  Utensils, 
  Bed, 
  Bus, 
  Camera,
  Clock,
  Thermometer,
  CreditCard,
  Heart,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Link } from "wouter";

export default function BudgetTravelEgypt() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const bestTimes = [
    {
      season: "Spring & Autumn",
      months: "March–May & September–November",
      temperature: "20°C–28°C",
      advantages: ["Pleasant temperatures", "Fewer crowds", "Favorable accommodation rates"],
      ideal: "Perfect for exploring archaeological sites comfortably"
    },
    {
      season: "Winter",
      months: "December–February", 
      temperature: "15°C–25°C",
      advantages: ["Delightful weather", "Clear skies"],
      drawbacks: ["Higher demand", "Increased accommodation costs", "Premium pricing"]
    },
    {
      season: "Summer",
      months: "June–August",
      temperature: "40°C+ (inland)",
      advantages: ["Drastically lower prices", "Fewer tourists"],
      drawbacks: ["Intense heat in Luxor/Aswan"],
      tip: "Choose coastal locations like Alexandria or Dahab"
    }
  ];

  const budgetBreakdown = [
    { category: "Accommodation", daily: "150-750 EGP", details: "Hostels to budget hotels" },
    { category: "Food", daily: "75-375 EGP", details: "Street food to mid-range restaurants" },
    { category: "Transport", daily: "50-250 EGP", details: "Public transport and intercity buses" },
    { category: "Attractions", daily: "125-500 EGP", details: "Entry fees and activities" },
    { category: "Miscellaneous", daily: "125-375 EGP", details: "Tips, souvenirs, emergencies" }
  ];

  const moneySavingHacks = [
    "Book accommodations early during shoulder seasons",
    "Eat local street food (koshari, shawarma, ta'ameya)",
    "Use public transport (metro, buses, shared taxis)",
    "Carry an ISIC card for student discounts (up to 50%)",
    "Bargain respectfully in markets",
    "Stay in Nubian-style accommodations in Aswan",
    "Shop at local markets for self-catering",
    "Use Uber/Careem for safe, affordable city travel"
  ];

  const checklist = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Travel Documents",
      items: [
        "Passport valid for 6+ months with blank pages",
        "e-Visa (625 EGP) - recommended online application",
        "Visa on Arrival (625 EGP cash) for select nationalities",
        "Verify current requirements via official channels"
      ]
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Health & Safety",
      items: [
        "Travel insurance covering medical emergencies",
        "Recommended vaccines: Hepatitis A, Typhoid, Tetanus",
        "Bottled water only, avoid uncooked street food",
        "Basic medical kit with essential medications"
      ]
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Money Matters",
      items: [
        "Egyptian Pound (EGP) is the local currency",
        "Carry cash in small denominations", 
        "Budget 1,250-2,000 EGP/day for comprehensive travel",
        "7-10 days: ~20,000-27,500 EGP including airfare"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Budget Travel in Egypt: How to See More for Less | Egypt Travel Guide 2025</title>
        <meta name="description" content="Complete budget travel guide to Egypt 2025. Learn how to explore pyramids, temples, and ancient sites affordably with insider tips on accommodation, food, transport, and money-saving strategies." />
        <meta name="keywords" content="budget travel Egypt, cheap Egypt travel, Egypt on a budget, affordable Egypt travel, Egypt travel costs 2025" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Hero Section */}
        <section 
          className="relative text-white min-h-[80vh] flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1568322445389-f64ac2515020?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="max-w-4xl">
              <Badge className="bg-teal-600 text-white mb-6 text-sm px-4 py-2">
                <DollarSign className="w-4 h-4 mr-2" />
                Budget Travel Guide 2025
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Budget Travel in Egypt
                <span className="block text-teal-400">How to See More for Less</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl">
                Discover Egypt's extraordinary cultural heritage, vibrant local life, and timeless attractions 
                without breaking the bank. Your complete guide to affordable Egyptian adventures.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#pricing-tool">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg">
                    Get Custom Quote
                  </Button>
                </Link>
                <Link href="/travel-tips">
                  <Button size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                    Read Travel Tips
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
          
          {/* Why Egypt in 2025 */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Egypt in 2025 is Perfect for Budget Travellers</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Egypt stands out as an exceptional budget travel destination, offering incredible value and unforgettable experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <DollarSign className="w-6 h-6" />
                    Favorable Exchange Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    The Egyptian Pound's favorable rates against international currencies mean greater purchasing power. 
                    Accommodation, meals, transport, and attraction tickets remain attractively affordable compared to Europe or North America.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <Camera className="w-6 h-6" />
                    Enhanced Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Egypt is heavily investing in tourism infrastructure. New museums, interactive exhibitions, 
                    and immersive digital experiences offer engaging ways to explore history, often at introductory prices.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <Shield className="w-6 h-6" />
                    Improved Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Streamlined airport procedures, upgraded safety standards, and welcoming hospitality make Egypt 
                    exceptionally appealing for budget-conscious adventurers seeking memorable, affordable experiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Best Times for Budget Travel */}
          <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Best Times for Budget Travel</h2>
              <p className="text-xl text-gray-600">
                Timing your visit can significantly impact your budget and experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {bestTimes.map((time, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-teal-700">
                      <Calendar className="w-5 h-5" />
                      {time.season}
                    </CardTitle>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{time.months}</p>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-medium">{time.temperature}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Advantages:</h4>
                      <ul className="space-y-1">
                        {time.advantages.map((advantage, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {time.drawbacks && (
                      <div>
                        <h4 className="font-semibold text-amber-700 mb-2">Consider:</h4>
                        <ul className="space-y-1">
                          {time.drawbacks.map((drawback, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              {drawback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {time.ideal && (
                      <div className="bg-teal-100 p-3 rounded-lg">
                        <p className="text-sm text-teal-800 font-medium">{time.ideal}</p>
                      </div>
                    )}

                    {time.tip && (
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <p className="text-sm text-blue-800"><strong>Tip:</strong> {time.tip}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Pre-Travel Checklist */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Essential Pre-Travel Checklist</h2>
              <p className="text-xl text-gray-600">
                Get prepared before you go to ensure a smooth, stress-free Egyptian adventure
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {checklist.map((section, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-teal-700 text-xl">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700">
                          <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Budget Breakdown */}
          <section className="bg-gray-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Daily Budget Breakdown</h2>
              <p className="text-xl text-gray-600">
                Plan your spending with realistic daily budget expectations
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {budgetBreakdown.map((item, index) => (
                  <Card key={index} className="text-center bg-white shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.category}</h3>
                      <div className="text-2xl font-bold text-teal-600 mb-2">{item.daily}</div>
                      <p className="text-sm text-gray-600">{item.details}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-teal-600 text-white p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold mb-4">Total Daily Budget</h3>
                <div className="text-4xl font-bold mb-2">1,250 - 2,000 EGP</div>
                <p className="text-teal-100">
                  Covers accommodation, meals, transport, and key attractions for a comprehensive Egypt experience
                </p>
              </div>
            </div>
          </section>

          {/* Money-Saving Hacks */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Money-Saving Hacks</h2>
              <p className="text-xl text-gray-600">
                Insider tips to maximize your budget and get the most value from your Egyptian adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {moneySavingHacks.map((hack, index) => (
                <Card key={index} className="border-l-4 border-teal-600 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                      </div>
                      <p className="text-gray-700 leading-relaxed">{hack}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Detailed Sections */}
          <section className="space-y-16">
            
            {/* Accommodation */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Bed className="w-8 h-8 text-teal-600" />
                Affordable Accommodation Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Hostels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">$6-12/night</div>
                    <p className="text-gray-700">Dorm beds with sociable atmosphere. Perfect for meeting fellow travelers and sharing experiences.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Budget Hotels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">$15-30/night</div>
                    <p className="text-gray-700">Private rooms, often family-run guesthouses offering authentic local hospitality.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Nubian Stays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">$12-25/night</div>
                    <p className="text-gray-700">Cultural immersion in Aswan with traditional Nubian-style accommodations and warm hospitality.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Food */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Utensils className="w-8 h-8 text-teal-600" />
                Economical Eating Tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-teal-50 border-0">
                  <CardHeader>
                    <CardTitle className="text-teal-700">Street Food Champions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Koshari</span>
                        <span className="text-teal-600 font-bold">Under $1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ta'ameya (Falafel)</span>
                        <span className="text-teal-600 font-bold">Under $1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ful Medames</span>
                        <span className="text-teal-600 font-bold">Under $1</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Shawarma</span>
                        <span className="text-teal-600 font-bold">$1-2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Dining Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                        <span className="text-gray-700">Shop at local markets for self-catering options</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                        <span className="text-gray-700">Mid-range restaurants occasionally ($8-16/person)</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                        <span className="text-gray-700">Always drink bottled water</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5" />
                        <span className="text-gray-700">Avoid uncooked foods from street vendors</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transportation */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Bus className="w-8 h-8 text-teal-600" />
                Transportation on a Budget
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bus className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Trains</h3>
                    <p className="text-sm text-gray-600 mb-3">Second-class AC for comfort and value</p>
                    <div className="text-lg font-bold text-teal-600">Best Value</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bus className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Buses</h3>
                    <p className="text-sm text-gray-600 mb-3">Go Bus and SuperJet for intercity travel</p>
                    <div className="text-lg font-bold text-teal-600">Cheapest</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Metro</h3>
                    <p className="text-sm text-gray-600 mb-3">Cairo's efficient metro system</p>
                    <div className="text-lg font-bold text-teal-600">$0.25</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Ride Apps</h3>
                    <p className="text-sm text-gray-600 mb-3">Uber/Careem for safe city travel</p>
                    <div className="text-lg font-bold text-teal-600">Affordable</div>
                  </CardContent>
                </Card>
              </div>
            </div>

          </section>

          {/* Final Tips */}
          <section className="bg-teal-600 text-white -mx-4 px-4 py-16 rounded-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Your Egyptian Adventure Awaits</h2>
              <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                With strategic planning and mindful budgeting, experiencing Egypt's extraordinary cultural heritage, 
                vibrant local life, and timeless attractions affordably is entirely achievable. Embrace local customs, 
                opt for economical accommodations and meals, and use public transportation wisely.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#pricing-tool">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg">
                    Start Planning Your Trip
                  </Button>
                </Link>
                <Link href="/travel-tips">
                  <Button size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                    Explore Travel Guides
                  </Button>
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <Footer />
    </>
  );
}