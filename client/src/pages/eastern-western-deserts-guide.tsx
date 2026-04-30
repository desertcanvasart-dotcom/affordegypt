import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Camera, Mountain, Sun, Compass, DollarSign, Calendar, Users, Tent } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslation } from 'react-i18next';

export default function EasternWesternDesertsGuide() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigateToPlanning = () => {
    setLocation('/');
    setTimeout(() => {
      const element = document.getElementById('quote-builder');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  const destinations = [
    {
      name: t("deserts.destinations.bahariya.name"),
      location: t("deserts.destinations.bahariya.location"),
      highlights: [
        t("deserts.destinations.bahariya.highlights.whiteDesert"),
        t("deserts.destinations.bahariya.highlights.crystalMountain"),
        t("deserts.destinations.bahariya.highlights.hotSprings")
      ],
      budget: t("deserts.destinations.bahariya.budget"),
      icon: <Mountain className="w-6 h-6 text-primary" />
    },
    {
      name: t("deserts.destinations.blackWhite.name"), 
      location: t("deserts.destinations.blackWhite.location"),
      highlights: [
        t("deserts.destinations.blackWhite.highlights.mushroom"),
        t("deserts.destinations.blackWhite.highlights.seashells"),
        t("deserts.destinations.blackWhite.highlights.volcanic")
      ],
      budget: t("deserts.destinations.blackWhite.budget"),
      icon: <Compass className="w-6 h-6 text-primary" />
    },
    {
      name: t("deserts.destinations.farafra.name"),
      location: t("deserts.destinations.farafra.location"),
      highlights: [
        t("deserts.destinations.farafra.highlights.artCentre"),
        t("deserts.destinations.farafra.highlights.birSitta"),
        t("deserts.destinations.farafra.highlights.quiet")
      ],
      budget: t("deserts.destinations.farafra.budget"),
      icon: <Sun className="w-6 h-6 text-primary" />
    },
    {
      name: t("deserts.destinations.dakhla.name"),
      location: t("deserts.destinations.dakhla.location"),
      highlights: [
        t("deserts.destinations.dakhla.highlights.qasr"),
        t("deserts.destinations.dakhla.highlights.farms"),
        t("deserts.destinations.dakhla.highlights.springs")
      ],
      budget: t("deserts.destinations.dakhla.budget"),
      icon: <Camera className="w-6 h-6 text-primary" />
    },
    {
      name: t("deserts.destinations.kharga.name"),
      location: t("deserts.destinations.kharga.location"),
      highlights: [
        t("deserts.destinations.kharga.highlights.hibis"),
        t("deserts.destinations.kharga.highlights.cemeteries"),
        t("deserts.destinations.kharga.highlights.forts")
      ],
      budget: t("deserts.destinations.kharga.budget"),
      icon: <Star className="w-6 h-6 text-primary" />
    },
    {
      name: t("deserts.destinations.siwa.name"),
      location: t("deserts.destinations.siwa.location"),
      highlights: [
        t("deserts.destinations.siwa.highlights.saltLakes"),
        t("deserts.destinations.siwa.highlights.mountain"),
        t("deserts.destinations.siwa.highlights.sandSea")
      ],
      budget: t("deserts.destinations.siwa.budget"),
      icon: <MapPin className="w-6 h-6 text-primary" />
    }
  ];

  // Handle budget itinerary with fallback
  const budgetItineraryTranslation = t('blog.desertsGuide.sections.itinerary.days', { returnObjects: true });
  const budgetItinerary = Array.isArray(budgetItineraryTranslation) ? budgetItineraryTranslation : [
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

  // Handle packing list with fallback
  const packingListTranslation = t('blog.desertsGuide.sections.packing.items', { returnObjects: true });
  const packingList = Array.isArray(packingListTranslation) ? packingListTranslation : [
    { item: "Power bank", reason: "No electricity during camping" },
    { item: "Scarf/keffiyeh", reason: "Sun, dust, and sand protection" },
    { item: "Flip flops & hiking shoes", reason: "For springs and rugged walks" },
    { item: "Thermal layer", reason: "Desert nights can be cold" },
    { item: "Flashlight", reason: "Minimal lighting in camps" },
    { item: "Refillable water bottle", reason: "Eco-friendly and refillable in oases" }
  ];

  // Handle budget tips with fallback
  const budgetTipsTranslation = t('blog.desertsGuide.sections.budgetTips.tips', { returnObjects: true });
  const budgetTips = Array.isArray(budgetTipsTranslation) ? budgetTipsTranslation : [
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
        className="relative text-white min-h-screen flex items-center bg-cover bg-center bg-fixed bg-[url('http://travel2egypt.org/wp-content/uploads/2025/06/Egypt-Siwa-Salt-Pools.jpg')]"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                {t('blog.desertsGuide.title')}
              </h1>
              <p className="text-2xl md:text-3xl text-teal-100 font-light">
                {t('blog.desertsGuide.subtitle')}
              </p>
            </div>
            <p className="text-lg md:text-xl text-teal-200 max-w-4xl mx-auto leading-relaxed">
              {t('blog.desertsGuide.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                onClick={handleNavigateToPlanning}
              >
                <Tent className="w-5 h-5 mr-2" />
                {t('blog.desertsGuide.buttons.planAdventure')}
              </Button>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
                onClick={() => {
                  const element = document.getElementById('budget-adventure');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {t('blog.desertsGuide.buttons.viewBudgetGuide')}
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
            <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.comparison.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.desertsGuide.sections.comparison.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 bg-white shadow-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <Mountain className="w-6 h-6" />
                  {t('blog.desertsGuide.sections.comparison.eastern.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.eastern.location')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.eastern.terrain')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.eastern.bestFor')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.eastern.access')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.eastern.highlights')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-primary">
                  <Sun className="w-6 h-6" />
                  {t('blog.desertsGuide.sections.comparison.western.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.western.location')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.western.terrain')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.western.bestFor')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.western.access')}</p>
                  <p className="text-slate-700">{t('blog.desertsGuide.sections.comparison.western.highlights')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Top Destinations */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.destinations.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.desertsGuide.sections.destinations.subtitle')}
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
              <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.budgetTips.title')}</h2>
              <p className="text-xl text-slate-600">
                {t('blog.desertsGuide.sections.budgetTips.subtitle')}
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
        <section id="budget-adventure">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.itinerary.title')}</h2>
            <p className="text-xl text-slate-600 mb-4">
              {t('blog.desertsGuide.sections.itinerary.subtitle')}
            </p>
            <Badge className="bg-primary text-white text-lg px-4 py-2">
              {t('blog.desertsGuide.sections.itinerary.total')}
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
                        <h3 className="font-semibold text-primary">{`${day.day}: ${day.location}`}</h3>
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
              <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.packing.title')}</h2>
              <p className="text-xl text-slate-600">
                {t('blog.desertsGuide.sections.packing.subtitle')}
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
            <h2 className="text-4xl font-bold text-primary mb-4">{t('blog.desertsGuide.sections.bestTime.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.desertsGuide.sections.bestTime.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="text-center text-green-700">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  {t('blog.desertsGuide.sections.bestTime.bestSeason.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-green-700 mb-2">{t('blog.desertsGuide.sections.bestTime.bestSeason.period')}</p>
                <p className="text-slate-600">{t('blog.desertsGuide.sections.bestTime.bestSeason.description')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-center text-primary">
                  <DollarSign className="w-8 h-8 mx-auto mb-2" />
                  {t('blog.desertsGuide.sections.bestTime.budgetSpot.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary mb-2">{t('blog.desertsGuide.sections.bestTime.budgetSpot.period')}</p>
                <p className="text-slate-600">{t('blog.desertsGuide.sections.bestTime.budgetSpot.description')}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="text-center text-red-700">
                  <Sun className="w-8 h-8 mx-auto mb-2" />
                  {t('blog.desertsGuide.sections.bestTime.avoid.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-red-700 mb-2">{t('blog.desertsGuide.sections.bestTime.avoid.period')}</p>
                <p className="text-slate-600">{t('blog.desertsGuide.sections.bestTime.avoid.description')}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-teal-600 via-primary to-teal-800 rounded-2xl text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">{t('blog.desertsGuide.cta.title')}</h2>
            <p className="text-xl mb-8 text-teal-100">
              {t('blog.desertsGuide.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-teal-700 hover:bg-teal-50 min-w-48"
                onClick={handleNavigateToPlanning}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('blog.desertsGuide.cta.buttons.startPlanning')}
              </Button>
              <Button 
                size="lg" 
                className="bg-gray-300 text-gray-500 cursor-not-allowed min-w-48" 
                disabled
              >
                <Users className="w-5 h-5 mr-2" />
                {t('blog.desertsGuide.cta.buttons.findGuides')}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}