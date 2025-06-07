import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  image: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Sinai Peninsula Travel Guide",
    excerpt: "Sinai Peninsula Travel Guide: Best Places to Visit, Dive & Hike in Egypt",
    category: "Destinations",
    readTime: "5 min read",
    publishDate: "2024-03-15",
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/sinai-monastery.jpg",
    slug: "sinai-peninsula-travel-guide"
  },
  {
    id: 2,
    title: "Navigating Cairo: Transportation Tips for First-Time Visitors",
    excerpt: "Everything you need to know about getting around Cairo safely and efficiently, from metro systems to ride-sharing apps.",
    category: "Travel Tips",
    readTime: "3 min read",
    publishDate: "2024-03-12",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020",
    slug: "navigating-cairo-transportation-tips"
  },
  {
    id: 3,
    title: "Nile Valley Travel Guide",
    excerpt: "Nile Valley Egypt: Top Destinations, Nile Cruises & Ancient Sites Guide",
    category: "Destinations",
    readTime: "7 min read",
    publishDate: "2024-03-10",
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/nile-valley.jpg",
    slug: "nile-valley-travel-guide"
  },
  {
    id: 4,
    title: "Budget Travel in Egypt: How to See More for Less",
    excerpt: "Smart strategies for experiencing Egypt's wonders without breaking the bank, including accommodation and dining tips.",
    category: "Budget Travel",
    readTime: "6 min read",
    publishDate: "2024-03-08",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7",
    slug: "budget-travel-egypt-guide"
  },
  {
    id: 5,
    title: "Egyptian Street Food: A Culinary Adventure Guide",
    excerpt: "Navigate the delicious world of Egyptian street food with safety tips and must-try dishes in every major city.",
    category: "Food & Culture",
    readTime: "4 min read",
    publishDate: "2024-03-05",
    image: "https://images.unsplash.com/photo-1567337712816-090a14c1b9b5",
    slug: "egyptian-street-food-guide"
  },
  {
    id: 6,
    title: "Eastern & Western Deserts Travel Guide",
    excerpt: "Egypt Desert Travel Guide: Explore Siwa, White Desert & Eastern Trails",
    category: "Destinations",
    readTime: "8 min read",
    publishDate: "2024-03-01",
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/eastern-desert.jpg",
    slug: "eastern-western-deserts-travel-guide"
  }
];

export default function BlogGrid() {
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Destinations", "Travel Tips", "Budget Travel", "Food & Culture"];

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const loadMore = () => {
    setVisiblePosts(prev => Math.min(prev + 3, filteredPosts.length));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="blog" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Travel Insights & Tips</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Expert advice and insider knowledge to make your Egypt adventure unforgettable
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(category);
                setVisiblePosts(3);
              }}
              className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPosts.slice(0, visiblePosts).map((post) => (
            <Card key={post.id} className="group card-hover overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                {post.slug === "nile-valley-travel-guide" ? (
                  <Link href="/nile-valley-guide">
                    <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                      Read More
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" className="p-0 h-auto font-medium text-primary hover:text-primary/80">
                    Read More
                    <ArrowRight className="ml-1 w-3 h-3" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {visiblePosts < filteredPosts.length && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={loadMore}
              className="flex items-center gap-2"
            >
              Load More Articles
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}