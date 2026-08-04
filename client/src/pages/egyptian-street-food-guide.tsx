import { useEffect } from "react";
import SeoMeta from "@/components/seo-meta";
import { articleSchema } from "@/lib/article-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  Utensils, 
  MapPin, 
  DollarSign, 
  Clock, 
  Shield, 
  Heart,
  Star,
  CheckCircle,
  AlertTriangle,
  Coffee,
  Camera
} from "lucide-react";
import { Link } from "wouter";

export default function EgyptianStreetFoodGuide() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cities = [
    {
      name: "Cairo",
      spots: ["Downtown (Tahrir Sq., El-Mounira)", "Giza", "Sayeda Zeinab", "El Hussein"],
      icon: "🏛️"
    },
    {
      name: "Alexandria", 
      spots: ["Mansheya", "Bahary Corniche", "Miami Area", "El-Raml Station"],
      icon: "🌊"
    },
    {
      name: "Luxor",
      spots: ["Luxor Souq", "Salah El Din Street", "Nile Corniche"],
      icon: "🏺"
    },
    {
      name: "Aswan",
      spots: ["Souq Area", "Corniche El Nile", "El Tahrir Street"],
      icon: "⛵"
    },
    {
      name: "Siwa Oasis",
      spots: ["Siwa Market", "El Maraqi District"],
      icon: "🌴"
    }
  ];

  const streetFoods = [
    {
      name: "Koshari",
      arabicName: "كشري",
      description: "A carb-packed dish of rice, lentils, chickpeas, pasta, crispy onions, and tomato-vinegar sauce",
      cost: "15–25 EGP",
      bestIn: "Cairo (Abou Tarek, Koshary El Tahrir)",
      tip: "Ask for 'shatta' (spicy sauce) if you enjoy heat",
      icon: "🍚"
    },
    {
      name: "Ta'ameya",
      arabicName: "طعمية",
      description: "Egyptian falafel made of fava beans (not chickpeas), with herbs and sesame coating",
      cost: "1–2 EGP per piece",
      bestIn: "Local breakfast carts across Cairo and Alexandria",
      tip: "100% plant-based and filling",
      icon: "🧆"
    },
    {
      name: "Ful Medames",
      arabicName: "فول مدمس",
      description: "Slow-cooked fava beans with olive oil, cumin, lemon juice",
      cost: "5–10 EGP per sandwich",
      bestIn: "Breakfast carts and working-class cafés",
      tip: "Egypt's national breakfast dish",
      icon: "🫘"
    },
    {
      name: "Shawarma",
      arabicName: "شاورما",
      description: "Marinated beef or chicken sliced from a vertical rotisserie",
      cost: "15–30 EGP per wrap",
      bestIn: "Syrian-style shawarma kiosks in Cairo, Alexandria, and Hurghada",
      tip: "Garlic sauce for chicken, tahini for beef",
      icon: "🌯"
    },
    {
      name: "Hawawshi",
      arabicName: "حواوشي",
      description: "Spiced minced beef baked inside baladi bread",
      cost: "15–25 EGP per sandwich",
      bestIn: "Traditional bakeries and street vendors",
      tip: "Ask for 'balady' version – more traditional and flavourful",
      icon: "🥙"
    },
    {
      name: "Sweet Potato",
      arabicName: "بطاطا",
      description: "Roasted and sold from push carts, often topped with honey or nuts",
      cost: "5–15 EGP",
      bestIn: "Street carts throughout Egypt",
      tip: "Perfect winter snack, naturally sweet",
      icon: "🍠"
    }
  ];

  const drinks = [
    { name: "Sobia", description: "Coconut milk & rice drink", where: "Ramadan carts, markets" },
    { name: "Sugarcane Juice (Asab)", description: "Fresh-pressed, hydrating", where: "Juice shops, street carts" },
    { name: "Tamarind (Tamr Hindi)", description: "Sweet-sour drink with dates & tamarind", where: "Ramadan time, old cafés" },
    { name: "Hibiscus (Karkadeh)", description: "Deep red, tangy flower-based drink", where: "Particularly popular in Aswan" },
    { name: "Tea with Mint", description: "Egypt's go-to warm street drink", where: "Everywhere—just ask!" }
  ];

  const safetyTips = [
    { tip: "Eat where locals queue", reason: "Indicates high turnover and freshness" },
    { tip: "Avoid dairy-heavy foods in summer", reason: "Heat may spoil cheese/yogurt quickly" },
    { tip: "Choose piping hot food", reason: "Kills most bacteria" },
    { tip: "Bring your own wipes/sanitizer", reason: "Street vendors often lack handwashing" },
    { tip: "Stick to cooked vegetables", reason: "Raw veg may be washed with tap water" }
  ];

  const phrases = [
    { english: "How much is this?", arabic: "بكام ده؟", transliteration: "bekam dah?" },
    { english: "No spice, please", arabic: "من غير شطة", transliteration: "men gheer shatta" },
    { english: "Thank you", arabic: "شكراً", transliteration: "shokran" },
    { english: "Delicious!", arabic: "لذيذ جداً!", transliteration: "lazeez gidan!" }
  ];

  const itinerary = [
    { time: "9:00 AM", activity: "Ful + Ta'ameya breakfast sandwich", cost: "10 EGP" },
    { time: "11:00 AM", activity: "Fresh Sugarcane Juice", cost: "5 EGP" },
    { time: "1:00 PM", activity: "Koshari lunch at Abu Tarek", cost: "25 EGP" },
    { time: "3:00 PM", activity: "Dessert: Zalabya", cost: "10 EGP" },
    { time: "6:00 PM", activity: "Shawarma wrap + tea in local cafe", cost: "25 EGP" }
  ];

  return (
    <>
      <SeoMeta
        title="Egyptian Street Food Guide | What to Eat & Where"
        description="From kushari to ful medames to hawawshi — what to eat, where to find it, and how to avoid the tourist-tax. A Cairo operator's local food guide."
        canonical="https://affordegypt.com/egyptian-street-food-guide"
        ogImage="https://affordegypt.com/images/street-food-egypt.jpg"
        schema={articleSchema({
          headline: "Egyptian Street Food Guide | What to Eat & Where",
          description:
            "From kushari to ful medames to hawawshi — what to eat, where to find it, and how to avoid the tourist-tax. A Cairo operator's local food guide.",
          canonical: "https://affordegypt.com/egyptian-street-food-guide",
          image: "https://affordegypt.com/images/street-food-egypt.jpg",
          datePublished: "2025-06-07",
          dateModified: "2026-08-04",
        })}
        ogType="article"
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Hero Section */}
        <section
          className="relative text-white min-h-[80vh] flex items-center bg-cover bg-center bg-fixed bg-[url('/images/street-food-egypt.jpg')]"
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="max-w-4xl">
              <Badge className="bg-teal-600 text-white mb-6 text-sm px-4 py-2">
                <Utensils className="w-4 h-4 mr-2" />
                Culinary Adventure Guide 2026
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Egyptian Street Food
                <span className="block text-teal-400">A Culinary Adventure</span>
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl font-semibold drop-shadow-lg">
                Egypt's street food scene is a symphony of flavors, combining ancient culinary traditions 
                with quick, modern-day indulgence. Your most delicious—and budget-friendly—passport to understanding Egypt.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#pricing-tool">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg">
                    Plan Food Tour
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                  Download Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
          
          {/* Why Street Food Section */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Street Food is Perfect for Travellers</h2>
              <p className="text-xl text-gray-600">
                Discover the authentic flavors of Egypt without breaking your budget
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <DollarSign className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Extremely Affordable</h3>
                  <p className="text-gray-700">Most items cost between 5–30 EGP</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Clock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Fresh & Fast</h3>
                  <p className="text-gray-700">Cooked in front of you, often piping hot and ready to eat</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Deeply Local</h3>
                  <p className="text-gray-700">Recipes passed down for generations, authentic cultural experience</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Utensils className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Vegetarian-Friendly</h3>
                  <p className="text-gray-700">Many meat-free options available, perfect for all dietary needs</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Camera className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Cultural Immersion</h3>
                  <p className="text-gray-700">Street food is how Egyptians connect, talk, and relax</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Star className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Authentic Flavors</h3>
                  <p className="text-gray-700">Experience the real taste of Egypt through local favorites</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Where to Find Street Food */}
          <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Where to Find Egyptian Street Food</h2>
              <p className="text-xl text-gray-600">
                The best spots across Egypt for authentic street food experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cities.map((city, index) => (
                <Card key={index} className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-teal-700">
                      <span className="text-2xl">{city.icon}</span>
                      {city.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {city.spots.map((spot, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span className="text-sm">{spot}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-teal-100 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">💡</span>
                </div>
                <p className="text-teal-800 font-medium">
                  <strong>Pro Tip:</strong> Look for long queues of locals — it's a sign the food is both good and safe!
                </p>
              </div>
            </div>
          </section>

          {/* Top Street Foods */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Street Foods to Try in Egypt</h2>
              <p className="text-xl text-gray-600">
                Essential dishes that define Egyptian street food culture
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {streetFoods.map((food, index) => (
                <Card key={index} className="border-l-4 border-teal-600 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="text-3xl">{food.icon}</span>
                      <div>
                        <div className="text-teal-700">{food.name}</div>
                        <div className="text-sm text-gray-500 font-normal">{food.arabicName}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">{food.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-semibold text-green-800 mb-1">Cost</div>
                        <div className="text-green-700">{food.cost}</div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-1">Best In</div>
                        <div className="text-blue-700">{food.bestIn}</div>
                      </div>
                    </div>

                    <div className="bg-teal-100 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-teal-800 text-sm font-medium">{food.tip}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Drinks Section */}
          <section className="bg-gray-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Drinks to Pair with Street Food</h2>
              <p className="text-xl text-gray-600">
                Refresh yourself with authentic Egyptian beverages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drinks.map((drink, index) => (
                <Card key={index} className="bg-white shadow-md">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-teal-700 mb-2">{drink.name}</h3>
                    <p className="text-gray-700 text-sm mb-3">{drink.description}</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-xs text-gray-600">{drink.where}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-blue-100 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium mb-1">Important Note:</p>
                  <p className="text-blue-700 text-sm">Avoid tap water and ice; opt for sealed bottled water (≈5 EGP)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Tips */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Street Food Safety Tips</h2>
              <p className="text-xl text-gray-600">
                Stay safe while enjoying authentic Egyptian flavors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((safety, index) => (
                <Card key={index} className="border-l-4 border-amber-500">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{safety.tip}</h3>
                        <p className="text-gray-700 text-sm">{safety.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-amber-50 p-6 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                What to Pack for a Street Food Adventure
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Tissues/wet wipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Hand sanitizer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Reusable water bottle</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Anti-diarrhea tablets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Small notes and coins</span>
                </div>
              </div>
            </div>
          </section>

          {/* Useful Phrases */}
          <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Useful Arabic Phrases</h2>
              <p className="text-xl text-gray-600">
                Essential phrases to enhance your street food experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {phrases.map((phrase, index) => (
                <Card key={index} className="bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center space-y-2">
                      <div className="text-lg font-semibold text-gray-900">{phrase.english}</div>
                      <div className="text-2xl text-teal-600 font-bold">{phrase.arabic}</div>
                      <div className="text-sm text-gray-600 italic">{`(${phrase.transliteration})`}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Budget Itinerary */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Budget-Friendly Street Food Itinerary</h2>
              <p className="text-xl text-gray-600">
                Cairo Day Trip: Full day of delicious street food for under 75 EGP
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-teal-600 text-white text-center">
                  <CardTitle className="text-2xl">Cairo Street Food Day Trip</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {itinerary.map((item, index) => (
                    <div key={index} className={`flex items-center justify-between p-6 ${index !== itinerary.length - 1 ? 'border-b' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{item.time}</div>
                          <div className="text-gray-700">{item.activity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-teal-600">{item.cost}</div>
                      </div>
                    </div>
                  ))}
                  <div className="bg-teal-50 p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total Daily Cost:</span>
                      <span className="text-2xl font-bold text-teal-600">75 EGP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-teal-600 text-white -mx-4 px-4 py-16 rounded-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-white">Your Culinary Adventure Awaits</h2>
              <p className="text-xl mb-8 leading-relaxed font-semibold text-white">
                Egypt's street food is more than cheap eats—it's a window into the soul of the country. 
                Every sandwich passed through a tuk-tuk window, every spicy bite eaten standing on a sidewalk, 
                brings you closer to the people and their heritage.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/#pricing-tool">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg">
                    Book Culinary Tour
                  </Button>
                </Link>
                <Link href="/travel-tips">
                  <Button size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                    More Egypt Guides
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