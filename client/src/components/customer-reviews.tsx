import { useQuery } from "@tanstack/react-query";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Review } from "@shared/schema";

export default function CustomerReviews() {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from travelers who explored Egypt with us
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-lg text-gray-600">
            Be the first to share your Egypt travel experience with us!
          </p>
        </div>
      </section>
    );
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Travelers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Real experiences from travelers who explored Egypt with us
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {reviews.slice(0, 9).map((review) => (
            <Card key={review.id} className="relative hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4">
                  <Quote className="w-6 h-6 text-primary/20" />
                </div>
                
                <div className="flex items-center gap-1 mb-3">
                  {renderStars(review.rating)}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-4">
                  {review.content}
                </p>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.customerName}
                      </p>
                      {review.customerLocation && (
                        <p className="text-sm text-gray-500">
                          {review.customerLocation}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {review.isVerified && (
                        <Badge variant="secondary" className="mb-1">
                          Verified
                        </Badge>
                      )}
                      {review.tripDate && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(review.tripDate), "MMM yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reviews.length > 9 && (
          <div className="text-center">
            <Link href="/reviews">
              <Button variant="outline" size="lg">
                View All Reviews ({reviews.length})
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}