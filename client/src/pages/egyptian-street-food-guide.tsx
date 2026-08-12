import { useEffect } from "react";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { articleSchema } from "@/lib/article-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import GuideToc from "@/components/guide-toc";
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
  Camera,
  Printer
} from "lucide-react";
import { Link } from "wouter";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

// Presentation, not content — zipped onto the translated arrays by index.
const cityIcons = ["🏛️", "🌊", "🏺", "⛵", "🌴"];
const foodIcons = ["🍚", "🧆", "🫘", "🌯", "🥙", "🍠"];

export default function EgyptianStreetFoodGuide() {
  const { t } = useTranslation();
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Structured content lives in the locale files and is read with
  // returnObjects. The Arabic dish names and phrases inside these arrays are
  // deliberately identical in every locale — they are the subject matter, not
  // copy to translate.
  const cities = (t("streetFoodGuide.cities", { returnObjects: true }) as any[]).map(
    (city: any, i: number) => ({ ...city, icon: cityIcons[i] })
  );
  const streetFoods = (t("streetFoodGuide.streetFoods", { returnObjects: true }) as any[]).map(
    (food: any, i: number) => ({ ...food, icon: foodIcons[i] })
  );
  const drinks = t("streetFoodGuide.drinks", { returnObjects: true }) as any[];
  const safetyTips = t("streetFoodGuide.safetyTips", { returnObjects: true }) as any[];
  const phrases = t("streetFoodGuide.phrases", { returnObjects: true }) as any[];
  const itinerary = t("streetFoodGuide.itinerary", { returnObjects: true }) as any[];
  const packItems = t("streetFoodGuide.packItems", { returnObjects: true }) as string[];

  return (
    <>
      <SeoMeta
        title={t("streetFoodGuide.seoTitle")}
        description={t("streetFoodGuide.seoDescription")}
        canonical="https://affordegypt.com/egyptian-street-food-guide"
        ogImage="https://affordegypt.com/images/street-food-egypt.jpg"
        schema={[articleSchema({
          headline: "Egyptian Street Food Guide | What to Eat & Where",
          description:
            "From kushari to ful medames to hawawshi — what to eat, where to find it, and how to avoid the tourist-tax. A Cairo operator's local food guide.",
          canonical: "https://affordegypt.com/egyptian-street-food-guide",
          image: "https://affordegypt.com/images/street-food-egypt.jpg",
          datePublished: "2025-06-07",
          dateModified: "2026-08-12",
        }), breadcrumbSchema(trailFor("/egyptian-street-food-guide")!)]}
        ogType="article"
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        <PageBreadcrumbs />
        
        <GuideToc />
        {/* Hero Section */}
        <section
          className="relative text-white min-h-[80vh] flex items-center bg-cover bg-center bg-fixed bg-[url('/images/street-food-egypt.jpg')]"
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="max-w-4xl">
              <Badge className="bg-teal-600 text-white mb-6 text-sm px-4 py-2">
                <Utensils className="w-4 h-4 mr-2" />
                {t("streetFoodGuide.badge")}
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {t("streetFoodGuide.titleA")}
                <span className="block text-teal-400">{t("streetFoodGuide.titleB")}</span>
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl font-semibold drop-shadow-lg">
                {t("streetFoodGuide.heroBody")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg">
                  <Link href="/#pricing-tool">
                    {t("streetFoodGuide.ctaPlan")}
                  </Link>
                </Button>
                {/* Opens the browser print dialog, whose "Save as PDF" gives a
                    real file. No PDF asset exists to link to, and jsPDF (already
                    a dependency) cannot render the Arabic dish names and phrases
                    that are half the point of this guide. */}
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.print()}
                  className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  {t("streetFoodGuide.ctaPrint")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
          
          {/* Why Street Food Section */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.whyH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.whySub")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <DollarSign className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why1H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why1B")}</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Clock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why2H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why2B")}</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why3H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why3B")}</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Utensils className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why4H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why4B")}</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Camera className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why5H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why5B")}</p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600 text-center">
                <CardContent className="p-6">
                  <Star className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{t("streetFoodGuide.why6H")}</h3>
                  <p className="text-gray-700">{t("streetFoodGuide.why6B")}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Where to Find Street Food */}
          <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.whereH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.whereSub")}
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
                      {city.spots.map((spot: string, i: number) => (
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
                  <strong>{t("streetFoodGuide.proTipLabel")}</strong> {t("streetFoodGuide.proTip")}
                </p>
              </div>
            </div>
          </section>

          {/* Top Street Foods */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.foodsH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.foodsSub")}
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
                        <div className="font-semibold text-green-800 mb-1">{t("streetFoodGuide.costLabel")}</div>
                        <div className="text-green-700">{food.cost}</div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-1">{t("streetFoodGuide.bestInLabel")}</div>
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.drinksH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.drinksSub")}
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
                  <p className="text-blue-800 font-medium mb-1">{t("streetFoodGuide.noteLabel")}</p>
                  <p className="text-blue-700 text-sm">{t("streetFoodGuide.noteBody")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Safety Tips */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.safetyH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.safetySub")}
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
                {t("streetFoodGuide.packH3")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {packItems.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Useful Phrases */}
          <section className="bg-teal-50 -mx-4 px-4 py-16 rounded-2xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.phrasesH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.phrasesSub")}
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("streetFoodGuide.itineraryH2")}</h2>
              <p className="text-xl text-gray-600">
                {t("streetFoodGuide.itinerarySub")}
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-teal-600 text-white text-center">
                  <CardTitle className="text-2xl">{t("streetFoodGuide.itineraryTitle")}</CardTitle>
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
                      <span className="text-xl font-bold text-gray-900">{t("streetFoodGuide.totalLabel")}</span>
                      <span className="text-2xl font-bold text-teal-600">{t("streetFoodGuide.totalValue")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-teal-600 text-white -mx-4 px-4 py-16 rounded-2xl">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-white">{t("streetFoodGuide.finalH2")}</h2>
              <p className="text-xl mb-8 leading-relaxed font-semibold text-white">
                {t("streetFoodGuide.finalBody")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  <Link href="/#pricing-tool">
                    {t("streetFoodGuide.ctaBook")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                  <Link href="/travel-tips">
                    {t("streetFoodGuide.ctaMore")}
                  </Link>
                </Button>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <Footer />
    </>
  );
}