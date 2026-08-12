import SeoMeta from "@/components/seo-meta";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslation } from "react-i18next";

export default function Destinations() {
  const { t } = useTranslation();
  
  // Articles tagged with "Destinations" 
  const destinationArticles = [
    {
      id: 1,
      title: "destinations.nileValley.title",
      excerpt: "destinations.nileValley.excerpt",
      image: "/images/nile-valley-1.jpg",
      readTime: "destinations.nileValley.readTime",
      category: "destinations.category",
      tags: ["destinations.tags.nileValley", "destinations.tags.ancientEgypt", "destinations.tags.temples"],
      author: "destinations.nileValley.author",
      link: "/nile-valley-guide"
    },
    {
      id: 2,
      title: "destinations.deserts.title", 
      excerpt: "destinations.deserts.excerpt",
      image: "/images/beach-in-sinai.jpg",
      readTime: "destinations.deserts.readTime",
      category: "destinations.category",
      tags: ["destinations.tags.desert", "destinations.tags.adventure", "destinations.tags.hiddenGems"],
      author: "destinations.deserts.author",
      link: "/eastern-western-deserts-guide"
    },
    {
      id: 3,
      title: "destinations.sinai.title",
      excerpt: "destinations.sinai.excerpt",
      image: "/images/red-sea-diving.jpg",
      readTime: "destinations.sinai.readTime", 
      category: "destinations.category",
      tags: ["destinations.tags.sinai", "destinations.tags.mountains", "destinations.tags.redSea"],
      author: "destinations.sinai.author",
      link: "/sinai-peninsula-guide"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        title="Egypt Destinations Guide | Cairo, Luxor, Aswan & More"
        description="Plan your Egypt trip across Cairo, Alexandria, Luxor, Aswan, Hurghada and Sharm El Sheikh. Licensed Egyptologist guides and transparent prices."
        canonical="https://affordegypt.com/destinations"
      />

      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <MapPin className="w-16 h-16 mx-auto mb-6 text-teal-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t('destinations.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-8">
                {t('destinations.hero.subtitle')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('destinations.hero.features.locations.title')}</h3>
                  <p className="text-teal-100 text-sm">{t('destinations.hero.features.locations.description')}</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('destinations.hero.features.insights.title')}</h3>
                  <p className="text-teal-100 text-sm">{t('destinations.hero.features.insights.description')}</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('destinations.hero.features.experiences.title')}</h3>
                  <p className="text-teal-100 text-sm">{t('destinations.hero.features.experiences.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Articles */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('destinations.articles.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('destinations.articles.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinationArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                  <div 
                    className="aspect-video relative overflow-hidden cursor-pointer"
                    onClick={() => window.location.href = article.link}
                  >
                    <img 
                      src={article.image}
                      alt={t(article.title)}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-teal-600 text-white">
                        {t(article.category)}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-bold line-clamp-2 transition-colors text-gray-900 hover:text-teal-600">
                      {t(article.title)}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {t(article.excerpt)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t(article.readTime)}
                      </div>
                      <span>{t('destinations.byAuthor', { author: t(article.author) })}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {t(tag)}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => window.location.href = article.link}
                    >
                      {t('destinations.readGuide')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('destinations.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              {t('destinations.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                {t('destinations.cta.planTrip')}
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-gray-900 border-gray-200 hover:bg-primary hover:text-white hover:border-primary">
                {t('destinations.cta.contactUs')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}