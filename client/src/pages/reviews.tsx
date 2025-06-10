import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Filter, Calendar, MapPin, User, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import type { Review } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesSearch = searchTerm === "" || 
        review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.customerLocation && review.customerLocation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
      
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
        case "highest-rating":
          return b.rating - a.rating;
        case "lowest-rating":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      counts[review.rating as keyof typeof counts]++;
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();

  return (
    <>
      <Helmet>
        <title>Customer Reviews - Egypt Travel Experiences | Afford Egypt</title>
        <meta name="description" content="Read authentic reviews from travelers who have experienced Egypt with Afford Egypt. Discover what our customers say about their unforgettable journeys through ancient wonders and modern adventures." />
        <meta property="og:title" content="Customer Reviews - Egypt Travel Experiences | Afford Egypt" />
        <meta property="og:description" content="Read authentic reviews from travelers who have experienced Egypt with Afford Egypt. Real testimonials from real customers." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="min-h-[90vh] flex items-center justify-center bg-gradient-to-r from-teal-600 to-blue-600 text-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Quote className="w-16 h-16 mx-auto mb-6 text-teal-200" />
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  What Our Travelers Say
                </h1>
                <p className="text-xl md:text-2xl text-teal-100 mb-8">
                  Authentic reviews from real customers who experienced the magic of Egypt with us
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{reviews.length}</div>
                    <div className="text-teal-200">Total Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold">{getAverageRating()}</span>
                      <div className="flex">{renderStars(Math.round(parseFloat(getAverageRating())))}</div>
                    </div>
                    <div className="text-teal-200">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {Math.round((ratingCounts[5] / reviews.length) * 100)}%
                    </div>
                    <div className="text-teal-200">5-Star Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rating Breakdown */}
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Rating Breakdown</h2>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = ratingCounts[rating as keyof typeof ratingCounts];
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Filters and Search */}
          <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Filter className="w-5 h-5" />
                    <span className="font-medium">Filter & Search</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All ratings" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="highest-rating">Highest Rating</SelectItem>
                        <SelectItem value="lowest-rating">Lowest Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-20 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No reviews found matching your criteria</div>
                    <Button 
                      onClick={() => {
                        setSearchTerm("");
                        setRatingFilter("all");
                        setSortBy("newest");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((review) => (
                      <Card key={review.id} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg leading-tight mb-2">
                                {review.title}
                              </h3>
                              <div className="flex items-center gap-1 mb-3">
                                {renderStars(review.rating)}
                                <span className="ml-2 text-sm text-gray-600">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <p className="text-gray-700 mb-6 line-clamp-4 leading-relaxed">
                            {review.content}
                          </p>
                          
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{review.customerName}</span>
                            </div>
                            
                            {review.customerLocation && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{review.customerLocation}</span>
                              </div>
                            )}
                            
                            {review.tripDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>Trip: {format(new Date(review.tripDate!), "MMMM yyyy")}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Results count */}
                {!isLoading && filteredReviews.length > 0 && (
                  <div className="text-center mt-8 text-gray-600">
                    Showing {filteredReviews.length} of {reviews.length} reviews
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-16 bg-gradient-to-r from-teal-600 to-blue-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own Egypt Story?</h2>
              <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied travelers who have experienced the magic of Egypt with us
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
    </>
  );
}