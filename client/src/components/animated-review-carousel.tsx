import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import type { Review } from "@shared/schema";

export default function AnimatedReviewCarousel() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });

  // Filter to get only 5-star reviews for the hero section
  const featuredReviews = reviews
    .filter(review => review.rating === 5)
    .slice(0, 8); // Show top 8 five-star reviews

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredReviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredReviews.length) % featuredReviews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || featuredReviews.length === 0) return;

    const interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredReviews.length]);

  if (featuredReviews.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          {/* The heading used to be flanked by hand-drawn SVG recreations of the
              Trustpilot and TripAdvisor logos — <rect> and <text> in each
              company's trademark green — with a second pair for mobile.
              Nothing stood behind them: this repo has no integration with
              either platform, no link to a profile on either, and the reviews
              below come from our own /api/reviews, whose table has no column
              recording where a review came from. Two third-party marks were
              lending their credibility to reviews we collect and publish
              ourselves. Removed 2026-08-16.

              If AffordEgypt does hold profiles on those platforms, the honest
              version is a link to them, not a picture of their logo. */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">
            {t('reviews.title')}
          </h2>

          <p className="text-gray-600 text-lg">
            {t('reviews.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative review-carousel"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {featuredReviews.map((review, index) => (
                <div key={review.id} className="w-full flex-shrink-0 px-2">
                  <Card className="bg-white shadow-lg border-gray-200 h-full hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8">
                      <div className="flex flex-col h-full">
                        {/* Quote Icon */}
                        <div className="flex justify-between items-start mb-4">
                          <Quote className="w-8 h-8 text-primary/60" />
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            {review.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed line-clamp-4">
                            {review.content}
                          </p>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.customerName}
                            </p>
                            {review.customerLocation && (
                              <p className="text-sm text-gray-600">
                                {review.customerLocation}
                              </p>
                            )}
                          </div>
                          {review.isVerified && (
                            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                              {/* Same badge as the reviews page, so one key. */}
                              {t("reviewsPage.verified")}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-700 border border-gray-200 w-10 h-10 rounded-full p-0"
            disabled={featuredReviews.length <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-700 border border-gray-200 w-10 h-10 rounded-full p-0"
            disabled={featuredReviews.length <= 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {featuredReviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-indicator w-3 h-3 rounded-full ${
                index === currentIndex
                  ? "bg-primary active"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Statistics */}
        <div className="flex justify-center items-center gap-8 mt-8 text-gray-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
            <div className="text-sm">{t('reviews.totalReviews')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0"}
            </div>
            <div className="text-sm">{t('reviews.averageRating')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100) || 0}%
            </div>
            <div className="text-sm">{t('reviews.fiveStarReviews')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}