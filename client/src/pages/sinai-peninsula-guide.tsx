import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Camera, Mountain, Waves, Sun, Compass, AlertTriangle, Thermometer } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslation } from 'react-i18next';

export default function SinaiPeninsulaGuide() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  
  // Debug logging
  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Browser language:', navigator.language);
    console.log('LocalStorage language:', localStorage.getItem('language'));
    console.log('Testing translation keys:');
    console.log('Title:', t('blog.sinaiGuide.title'));
    console.log('Subtitle:', t('blog.sinaiGuide.subtitle'));
    console.log('Description:', t('blog.sinaiGuide.description'));
    console.log('Destinations title:', t('blog.sinaiGuide.destinations.title'));
    console.log('Sharm name:', t('blog.sinaiGuide.destinations.sharmElSheikh.name'));
    console.log('CTA title:', t('blog.sinaiGuide.cta.title'));
    console.log('CTA description:', t('blog.sinaiGuide.cta.description'));
    console.log('CTA button:', t('blog.sinaiGuide.cta.button'));
    
    // Check if resource exists
    console.log('i18n resources loaded:', !!i18n.getResourceBundle('de', 'translation'));
    const deBundle = i18n.getResourceBundle('de', 'translation');
    console.log('German resource bundle keys:', Object.keys(deBundle || {}));
    console.log('Blog exists in bundle?', !!(deBundle && deBundle.blog));
    console.log('Does blog key exist?', i18n.exists('blog.sinaiGuide.title'));
    console.log('Direct access test - Title:', deBundle?.blog?.posts?.sinaiGuide?.title);
  }, [t, i18n.language]);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const destinations = [
    {
      name: t('blog.sinaiGuide.destinations.sharmElSheikh.name'),
      description: t('blog.sinaiGuide.destinations.sharmElSheikh.description'),
      highlights: t('blog.sinaiGuide.destinations.sharmElSheikh.highlights', { returnObjects: true }),
      bestTime: "Oct-Apr",
      duration: "3-7 days",
      difficulty: "Easy",
      image: "🏖️",
      details: t('blog.sinaiGuide.destinations.sharmElSheikh.details')
    },
    {
      name: t('blog.sinaiGuide.destinations.dahab.name'),
      description: t('blog.sinaiGuide.destinations.dahab.description'),
      highlights: t('blog.sinaiGuide.destinations.dahab.highlights', { returnObjects: true }),
      bestTime: "Oct-Apr",
      duration: "2-5 days", 
      difficulty: "Moderate",
      image: "🤿",
      details: t('blog.sinaiGuide.destinations.dahab.details')
    },
    {
      name: t('blog.sinaiGuide.destinations.nuweiba.name'),
      description: t('blog.sinaiGuide.destinations.nuweiba.description'),
      highlights: t('blog.sinaiGuide.destinations.nuweiba.highlights', { returnObjects: true }),
      bestTime: "Oct-Apr",
      duration: "2-3 days",
      difficulty: "Easy",
      image: "🏕️",
      details: t('blog.sinaiGuide.destinations.nuweiba.details')
    },
    {
      name: t('blog.sinaiGuide.destinations.taba.name'),
      description: t('blog.sinaiGuide.destinations.taba.description'),
      highlights: t('blog.sinaiGuide.destinations.taba.highlights', { returnObjects: true }),
      bestTime: "Oct-Mar",
      duration: "2-4 days",
      difficulty: "Easy",
      image: "🏰",
      details: t('blog.sinaiGuide.destinations.taba.details')
    }
  ];

  const activities = [
    {
      category: t('blog.sinaiGuide.activities.waterSports.title'),
      items: [
        { name: t('blog.sinaiGuide.activities.waterSports.scubaDiving.name'), price: t('blog.sinaiGuide.activities.waterSports.scubaDiving.price'), description: t('blog.sinaiGuide.activities.waterSports.scubaDiving.description') },
        { name: t('blog.sinaiGuide.activities.waterSports.snorkeling.name'), price: t('blog.sinaiGuide.activities.waterSports.snorkeling.price'), description: t('blog.sinaiGuide.activities.waterSports.snorkeling.description') },
        { name: t('blog.sinaiGuide.activities.waterSports.windsurfing.name'), price: t('blog.sinaiGuide.activities.waterSports.windsurfing.price'), description: t('blog.sinaiGuide.activities.waterSports.windsurfing.description') },
        { name: t('blog.sinaiGuide.activities.waterSports.kitesurfing.name'), price: t('blog.sinaiGuide.activities.waterSports.kitesurfing.price'), description: t('blog.sinaiGuide.activities.waterSports.kitesurfing.description') }
      ]
    },
    {
      category: t('blog.sinaiGuide.activities.desertAdventures.title'),
      items: [
        { name: t('blog.sinaiGuide.activities.desertAdventures.camelTrekking.name'), price: t('blog.sinaiGuide.activities.desertAdventures.camelTrekking.price'), description: t('blog.sinaiGuide.activities.desertAdventures.camelTrekking.description') },
        { name: t('blog.sinaiGuide.activities.desertAdventures.desertSafari.name'), price: t('blog.sinaiGuide.activities.desertAdventures.desertSafari.price'), description: t('blog.sinaiGuide.activities.desertAdventures.desertSafari.description') },
        { name: t('blog.sinaiGuide.activities.desertAdventures.coloredCanyon.name'), price: t('blog.sinaiGuide.activities.desertAdventures.coloredCanyon.price'), description: t('blog.sinaiGuide.activities.desertAdventures.coloredCanyon.description') },
        { name: t('blog.sinaiGuide.activities.desertAdventures.bedouinNight.name'), price: t('blog.sinaiGuide.activities.desertAdventures.bedouinNight.price'), description: t('blog.sinaiGuide.activities.desertAdventures.bedouinNight.description') }
      ]
    },
    {
      category: t('blog.sinaiGuide.activities.cultural.title'),
      items: [
        { name: t('blog.sinaiGuide.activities.cultural.mountSinai.name'), price: t('blog.sinaiGuide.activities.cultural.mountSinai.price'), description: t('blog.sinaiGuide.activities.cultural.mountSinai.description') },
        { name: t('blog.sinaiGuide.activities.cultural.monastery.name'), price: t('blog.sinaiGuide.activities.cultural.monastery.price'), description: t('blog.sinaiGuide.activities.cultural.monastery.description') },
        { name: t('blog.sinaiGuide.activities.cultural.bedouinVillage.name'), price: t('blog.sinaiGuide.activities.cultural.bedouinVillage.price'), description: t('blog.sinaiGuide.activities.cultural.bedouinVillage.description') },
        { name: t('blog.sinaiGuide.activities.cultural.wadiFeiran.name'), price: t('blog.sinaiGuide.activities.cultural.wadiFeiran.price'), description: t('blog.sinaiGuide.activities.cultural.wadiFeiran.description') }
      ]
    }
  ];

  const practicalInfo = [
    {
      title: t('blog.sinaiGuide.practical.bestTime.title'),
      content: t('blog.sinaiGuide.practical.bestTime.content'),
      icon: <Thermometer className="w-5 h-5 text-orange-500" />
    },
    {
      title: t('blog.sinaiGuide.practical.gettingThere.title'),
      content: t('blog.sinaiGuide.practical.gettingThere.content'),
      icon: <Compass className="w-5 h-5 text-blue-500" />
    },
    {
      title: t('blog.sinaiGuide.practical.safety.title'),
      content: t('blog.sinaiGuide.practical.safety.content'),
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      title: t('blog.sinaiGuide.practical.packing.title'),
      content: t('blog.sinaiGuide.practical.packing.content'),
      icon: <Mountain className="w-5 h-5 text-green-500" />
    }
  ];

  const itineraries = [
    {
      title: t('blog.sinaiGuide.itineraries.highlights.title'),
      days: t('blog.sinaiGuide.itineraries.highlights.days', { returnObjects: true }),
      price: t('blog.sinaiGuide.itineraries.highlights.price')
    },
    {
      title: t('blog.sinaiGuide.itineraries.adventure.title'),
      days: t('blog.sinaiGuide.itineraries.adventure.days', { returnObjects: true }),
      price: t('blog.sinaiGuide.itineraries.adventure.price')
    },
    {
      title: t('blog.sinaiGuide.itineraries.relaxed.title'),
      days: t('blog.sinaiGuide.itineraries.relaxed.days', { returnObjects: true }),
      price: t('blog.sinaiGuide.itineraries.relaxed.price')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      <Navbar />
      {/* Hero Section */}
      <div 
        className="relative text-white min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('http://travel2egypt.org/wp-content/uploads/2025/06/red-sea-diving.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                {t('blog.sinaiGuide.title')}
              </h1>
              <p className="text-2xl md:text-3xl text-teal-100 font-light">
                {t('blog.sinaiGuide.subtitle')}
              </p>
            </div>
            <p className="text-lg md:text-xl text-teal-200 max-w-4xl mx-auto leading-relaxed">
              {t('blog.sinaiGuide.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Waves className="w-5 h-5 mr-3" />
                Red Sea Diving Paradise
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Mountain className="w-5 h-5 mr-3" />
                Biblical Mount Sinai  
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Sun className="w-5 h-5 mr-3" />
                Bedouin Desert Culture
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Destinations Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{t('blog.sinaiGuide.destinations.title')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {t('blog.sinaiGuide.destinations.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinations.map((destination, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3 text-teal-900">
                        <span className="text-3xl">{destination.image}</span>
                        {destination.name}
                      </CardTitle>
                      <p className="text-slate-600 mt-2">{destination.description}</p>
                      <p className="text-slate-700 mt-3 text-sm leading-relaxed">{destination.details}</p>
                    </div>
                    <Badge variant={destination.difficulty === 'Easy' ? 'default' : destination.difficulty === 'Moderate' ? 'secondary' : 'destructive'}>
                      {destination.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights && Array.isArray(destination.highlights) && destination.highlights.map((highlight, idx) => (
                        <Badge key={idx} variant="outline" className="border-teal-200 text-teal-700">
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
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{t('blog.sinaiGuide.activities.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.sinaiGuide.activities.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activities.map((category, index) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white to-teal-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-teal-900">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-teal-400 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                            {item.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
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
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{t('blog.sinaiGuide.itineraries.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.sinaiGuide.itineraries.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itineraries.map((itinerary, index) => (
              <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-teal-900">{itinerary.title}</CardTitle>
                  <div className="text-center">
                    <Badge variant="outline" className="border-teal-300 text-teal-700 font-semibold">
                      {itinerary.price}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itinerary.days && Array.isArray(itinerary.days) && itinerary.days.map((day, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-teal-700">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-slate-700">{day}</p>
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
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{t('blog.sinaiGuide.practical.title')}</h2>
            <p className="text-xl text-slate-600">
              {t('blog.sinaiGuide.practical.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practicalInfo.map((info, index) => (
              <Card key={index} className="border-0 bg-white shadow-md border-l-4 border-l-teal-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg text-teal-900">
                    {info.icon}
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-800 rounded-2xl text-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-6">{t('blog.sinaiGuide.cta.title')}</h2>
            <p className="text-xl mb-8 text-teal-100">
              {t('blog.sinaiGuide.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-teal-700 hover:bg-teal-50 min-w-48"
                onClick={() => {
                  window.location.href = '/#quote-builder';
                }}
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t('blog.sinaiGuide.cta.button')}
              </Button>
              <Button 
                size="lg" 
                className="bg-gray-300 text-gray-500 cursor-not-allowed min-w-48" 
                disabled
              >
                <Star className="w-5 h-5 mr-2" />
                Browse Expert Guides
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}