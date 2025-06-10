import { Helmet } from "react-helmet-async";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Destinations() {
  // Articles tagged with "Destinations" 
  const destinationArticles = [
    {
      id: 1,
      title: "Budget Travel in Egypt: Complete Guide for 2025",
      excerpt: "Discover how to explore Egypt on a shoestring budget with insider tips on accommodation, food, transport, and must-see attractions that won't break the bank.",
      image: "http://travel2egypt.org/wp-content/uploads/2025/06/budget-egypt-travel.jpg",
      readTime: "12 min read",
      category: "Destinations",
      tags: ["Budget Travel", "Egypt Guide", "2025"],
      author: "Travel Expert"
    },
    {
      id: 2,
      title: "Eastern & Western Deserts: Hidden Gems of Egypt", 
      excerpt: "Venture beyond the pyramids to discover Egypt's stunning desert landscapes, natural wonders, and unique experiences in the Eastern and Western Deserts.",
      image: "http://travel2egypt.org/wp-content/uploads/2025/06/egypt-desert-landscape.jpg",
      readTime: "10 min read",
      category: "Destinations",
      tags: ["Desert", "Adventure", "Hidden Gems"],
      author: "Desert Guide"
    },
    {
      id: 3,
      title: "Sinai Peninsula: Mountain Adventures & Red Sea Coast",
      excerpt: "Explore the dramatic landscapes of Sinai Peninsula, from Mount Sinai's spiritual heights to the pristine coral reefs of the Red Sea coast.",
      image: "http://travel2egypt.org/wp-content/uploads/2025/06/sinai-peninsula.jpg",
      readTime: "8 min read", 
      category: "Destinations",
      tags: ["Sinai", "Mountains", "Red Sea"],
      author: "Adventure Specialist"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Egypt Destinations - Discover Hidden Gems | Afford Egypt</title>
        <meta name="description" content="Explore Egypt's most captivating destinations from budget-friendly travel guides to hidden desert gems and mountain adventures in Sinai Peninsula." />
        <meta property="og:title" content="Egypt Destinations - Discover Hidden Gems | Afford Egypt" />
        <meta property="og:description" content="Explore Egypt's most captivating destinations from budget-friendly travel guides to hidden desert gems and mountain adventures in Sinai Peninsula." />
      </Helmet>

      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <MapPin className="w-16 h-16 mx-auto mb-6 text-teal-200" />
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Discover Egypt's Hidden Destinations
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-8">
                From budget adventures to desert escapes and mountain expeditions - explore Egypt beyond the famous landmarks
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Unique Locations</h3>
                  <p className="text-teal-100 text-sm">Discover hidden gems off the beaten path</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Local Insights</h3>
                  <p className="text-teal-100 text-sm">Expert guides and insider knowledge</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-teal-200" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Authentic Experiences</h3>
                  <p className="text-teal-100 text-sm">Real adventures beyond tourist traps</p>
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
                Explore Egypt's Best Destinations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                In-depth guides to Egypt's most fascinating destinations, from budget travel tips to adventure expeditions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinationArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-teal-600 text-white">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-teal-600 transition-colors">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readTime}
                      </div>
                      <span>By {article.author}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      Read Full Guide
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
              Ready to Explore These Destinations?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Get personalized quotes for transport, guides, and experiences to any of these amazing locations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                Plan Your Trip
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-teal-600">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}