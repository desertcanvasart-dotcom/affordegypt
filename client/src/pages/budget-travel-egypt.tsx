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
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

export default function BudgetTravelEgypt() {
  const { t } = useTranslation();
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Structured content lives in the locale files and is read with
  // returnObjects, rather than exploded into dozens of flat keys — these are
  // lists whose shape is part of the content.
  const bestTimes = t("budgetGuide.bestTimes", { returnObjects: true }) as any[];

  const budgetBreakdown = t("budgetGuide.budgetBreakdown", { returnObjects: true }) as any[];

  const moneySavingHacks = t("budgetGuide.moneySavingHacks", { returnObjects: true }) as string[];

  const checklistIcons = [
    <Shield className="w-5 h-5" />,
    <Heart className="w-5 h-5" />,
    <CreditCard className="w-5 h-5" />,
  ];
  // Icons stay in the component (they are not content); titles and items come
  // from the locale files.
  const checklist = (t("budgetGuide.checklist", { returnObjects: true }) as any[]).map(
    (section: any, i: number) => ({ ...section, icon: checklistIcons[i] }),
  );

  return (
    <>
      <SeoMeta
        title={t("budgetGuide.seoTitle")}
        description={t("budgetGuide.seoDescription")}
        canonical="https://affordegypt.com/budget-travel-egypt"
        ogImage="https://affordegypt.com/images/pyramid-of-giza.jpg"
        schema={[articleSchema({
          headline: "Egypt on a Budget | A Cairo Operator's Honest Guide",
          description:
            "How to travel Egypt affordably without falling for tourist traps or scam operators. Real costs, real tips from a Cairo-based licensed operator. Daily costs, transport, food, attractions.",
          canonical: "https://affordegypt.com/budget-travel-egypt",
          image: "https://affordegypt.com/images/pyramid-of-giza.jpg",
          datePublished: "2025-06-07",
          dateModified: "2026-08-11",
        }), breadcrumbSchema(trailFor("/budget-travel-egypt")!)]}
        ogType="article"
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        <PageBreadcrumbs />
        
        <GuideToc />
        {/* Hero Section */}
        <section
          className="relative text-white min-h-[80vh] flex items-center bg-cover bg-center bg-fixed bg-[url('https://images.unsplash.com/photo-1568322445389-f64ac2515020?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80')]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 py-32">
            <div className="max-w-4xl">
              <Badge className="bg-teal-600 text-white mb-6 text-sm px-4 py-2">
                <DollarSign className="w-4 h-4 mr-2" />
                {t("budgetGuide.badge")}
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {t("budgetGuide.title")}
                <span className="block text-teal-400">{t("budgetGuide.titleSub")}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl">
                {t("budgetGuide.heroLead")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg">
                  <Link href="/#pricing-tool">
                    {t("budgetGuide.heroCta")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                  <Link href="/travel-tips">
                    Read Travel Tips
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
          
          {/* Why Egypt in 2026 */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("budgetGuide.whyH2")}</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {t("budgetGuide.whyLead")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <DollarSign className="w-6 h-6" />
                    {t("budgetGuide.why1")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {t("budgetGuide.why1b")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <Camera className="w-6 h-6" />
                    {t("budgetGuide.why2")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {t("budgetGuide.why2b")}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-teal-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-teal-700">
                    <Shield className="w-6 h-6" />
                    {t("budgetGuide.why3")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {t("budgetGuide.why3b")}
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
                {t("budgetGuide.timingLead")}
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
                        {time.advantages.map((advantage: string, i: number) => (
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
                          {time.drawbacks.map((drawback: string, i: number) => (
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
                        <p className="text-sm text-blue-800"><strong>Tip:</strong>{` ${time.tip}`}</p>
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
                {t("budgetGuide.checklistLead")}
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
                      {section.items.map((item: string, i: number) => (
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
                {t("budgetGuide.budgetLead")}
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
                <div className="text-4xl font-bold mb-2">2,500 - 3,000 EGP</div>
                <p className="text-teal-100">
                  {t("budgetGuide.budgetNote")}
                </p>
              </div>
            </div>
          </section>

          {/* Money-Saving Hacks */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Money-Saving Hacks</h2>
              <p className="text-xl text-gray-600">
                {t("budgetGuide.hacksLead")}
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
                {t("budgetGuide.stayTitle")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Hostels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">1,000–1,500 EGP+/night</div>
                    <p className="text-gray-700">Useful for meeting fellow travelers, but availability is limited outside the main hubs and quality varies — vet each place before booking.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Budget Hotels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">2,000 EGP+/night</div>
                    <p className="text-gray-700">Private rooms, often family-run guesthouses — prices depend on the city, location, facilities, and season.</p>
                  </CardContent>
                </Card>
                
                <Card className="border-t-4 border-teal-600">
                  <CardHeader>
                    <CardTitle>Nubian Stays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 mb-2">Rates vary</div>
                    <p className="text-gray-700">Cultural immersion in Aswan with traditional Nubian-style accommodations — check current rates before booking.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Food */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Utensils className="w-8 h-8 text-teal-600" />
                {t("budgetGuide.eatTitle")}
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
                        <span className="text-teal-600 font-bold">&lt; 60 EGP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ta'ameya (Falafel)</span>
                        <span className="text-teal-600 font-bold">~17 EGP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Ful Medames</span>
                        <span className="text-teal-600 font-bold">&lt; 25 EGP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Shawarma</span>
                        <span className="text-teal-600 font-bold">~120 EGP</span>
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
                {t("budgetGuide.moveTitle")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bus className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Trains</h3>
                    <p className="text-sm text-gray-600 mb-3">Second-class AC; Cairo–Luxor ~3,763 EGP for foreigners</p>
                    <div className="text-lg font-bold text-teal-600">Comfortable</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bus className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Buses</h3>
                    <p className="text-sm text-gray-600 mb-3">Go Bus and Blue Bus; Cairo–Luxor 500–600 EGP</p>
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
                    <div className="text-lg font-bold text-teal-600">Inexpensive</div>
                  </CardContent>
                </Card>
                
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Ride Apps</h3>
                    <p className="text-sm text-gray-600 mb-3">Uber, inDrive, or DiDi for city travel</p>
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
                <Button asChild size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg">
                  <Link href="/#pricing-tool">
                    {t("budgetGuide.cta1")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary px-8 py-4 text-lg">
                  <Link href="/travel-tips">
                    {t("budgetGuide.cta2")}
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