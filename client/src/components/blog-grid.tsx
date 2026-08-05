import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';

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

// Single source of truth for slug -> route. This mapping used to be inlined as
// a ternary chain in three separate places, which is how they drifted apart.
const POST_ROUTES: Record<string, string> = {
  "sinai-peninsula-travel-guide": "/sinai-peninsula-guide",
  "nile-valley-travel-guide": "/nile-valley-guide",
  "eastern-western-deserts-travel-guide": "/eastern-western-deserts-guide",
  "budget-travel-egypt": "/budget-travel-egypt",
  "egyptian-street-food-guide": "/egyptian-street-food-guide",
};

const getBlogPosts = (t: any): BlogPost[] => [
  {
    id: 1,
    title: t('blog.posts.sinaiGuide.title'),
    excerpt: t('blog.posts.sinaiGuide.excerpt'),
    category: "Destinations",
    readTime: t('blog.readTime', { time: "5" }),
    publishDate: "2024-03-15",
    image: "/images/sinai-monastery.jpg",
    slug: "sinai-peninsula-travel-guide"
  },
  {
    id: 2,
    title: t('blog.posts.cairoTransport.title'),
    excerpt: t('blog.posts.cairoTransport.excerpt'),
    category: "Travel Tips",
    readTime: t('blog.readTime', { time: "3" }),
    publishDate: "2024-03-12",
    image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020",
    slug: "navigating-cairo-transportation-tips"
  },
  {
    id: 3,
    title: t('blog.posts.desertsGuide.title'),
    excerpt: t('blog.posts.desertsGuide.excerpt'),
    category: "Destinations",
    readTime: t('blog.readTime', { time: "8" }),
    publishDate: "2024-03-01",
    image: "/images/egypt-siwa-salt-pools.jpg",
    slug: "eastern-western-deserts-travel-guide"
  },
  {
    id: 4,
    title: t('blog.posts.nileValley.title'),
    excerpt: t('blog.posts.nileValley.excerpt'),
    category: "Destinations",
    readTime: t('blog.readTime', { time: "7" }),
    publishDate: "2024-03-10",
    image: "/images/nile-valley.jpg",
    slug: "nile-valley-travel-guide"
  },
  {
    id: 5,
    title: t('blog.posts.budgetTravel.title'),
    excerpt: t('blog.posts.budgetTravel.excerpt'),
    category: "Budget Travel",
    readTime: t('blog.readTime', { time: "6" }),
    publishDate: "2024-03-08",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7",
    slug: "budget-travel-egypt"
  },
  {
    id: 6,
    title: t('blog.posts.streetFood.title'),
    excerpt: t('blog.posts.streetFood.excerpt'),
    category: "Food & Culture",
    readTime: t('blog.readTime', { time: "4" }),
    publishDate: "2024-03-05",
    image: "/images/street-food-egypt.jpg",
    slug: "egyptian-street-food-guide"
  },
  {
    id: 7,
    title: t('blog.posts.desertsGuide.title'),
    excerpt: t('blog.posts.desertsGuide.excerpt'),
    category: "Destinations",
    readTime: t('blog.readTime', { time: "8" }),
    publishDate: "2024-03-01",
    image: "/images/eastern-desert.jpg",
    slug: "eastern-western-deserts-travel-guide"
  }
];

export default function BlogGrid() {
  const { t } = useTranslation();
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    { key: "All", label: t('blog.categories.all') },
    { key: "Destinations", label: t('blog.categories.destinations') },
    { key: "Budget Travel", label: t('blog.categories.budgetTravel') },
    { key: "Food & Culture", label: t('blog.categories.foodCulture') }
  ];

  // Get translated blog posts
  const blogPosts = getBlogPosts(t);
  
  // Filter out Travel Tips posts and apply category filter
  const availablePosts = blogPosts.filter(post => post.category !== "Travel Tips");
  const filteredPosts = selectedCategory === "All" 
    ? availablePosts 
    : availablePosts.filter(post => post.category === selectedCategory);

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
          <h2 className="text-3xl font-bold mb-4">{t('blog.title')}</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              size="sm"
              // size="sm" is 36px; the audit's 44px floor wins on a filter row
              // that is thumb-operated on mobile.
              onClick={() => {
                setSelectedCategory(category.key);
                setVisiblePosts(3);
              }}
              className={`min-h-11 min-w-11 ${selectedCategory === category.key ? "bg-primary text-primary-foreground" : ""}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredPosts.slice(0, visiblePosts).map((post) => (
            <Card key={post.id} className="group card-hover overflow-hidden">
              <Link href={POST_ROUTES[post.slug] ?? "#"} aria-hidden="true" tabIndex={-1}>
                <div className="aspect-video overflow-hidden cursor-pointer">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </Link>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category === 'Destinations' ? t('blog.categories.destinations') :
                     post.category === 'Budget Travel' ? t('blog.categories.budgetTravel') :
                     post.category === 'Food & Culture' ? t('blog.categories.foodCulture') :
                     post.category === 'Travel Tips' ? t('blog.categories.travelTips') :
                     post.category}
                  </Badge>
                  <div className="flex items-center gap-3">
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
                {/* asChild makes the Button render AS the link, so each card has
                    exactly one interactive element instead of a <button> nested
                    inside an <a>. The article title is folded into the
                    accessible name so "Read more" isn't the whole label. */}
                {POST_ROUTES[post.slug] ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="inline-flex min-h-11 items-center p-0 font-medium text-primary hover:text-primary/80"
                  >
                    <Link href={POST_ROUTES[post.slug]} aria-label={`${t('blog.readMore')}: ${post.title}`}>
                      {t('blog.readMore')}
                      <ArrowRight className="ml-1 w-3 h-3" />
                    </Link>
                  </Button>
                ) : null}
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
              className="flex min-h-11 items-center gap-2"
            >
{t('blog.loadMore')}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('blog.noArticles')}</p>
          </div>
        )}
      </div>
    </section>
  );
}