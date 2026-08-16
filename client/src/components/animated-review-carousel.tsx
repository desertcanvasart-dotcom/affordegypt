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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
            {/* Trustpilot Logo */}
            <div className="hidden sm:flex items-center">
              <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
                <rect width="100" height="20" rx="3" fill="#00B67A"/>
                <text x="6" y="13" fill="white" fontSize="8" fontWeight="600" fontFamily="Arial">
                  Trustpilot
                </text>
                <g transform="translate(65, 5)">
                  <polygon points="5,0 6.2,3 10,3 7.2,5 8.4,8 5,6 1.6,8 2.8,5 0,3 3.8,3" fill="white"/>
                  <polygon points="15,0 16.2,3 20,3 17.2,5 18.4,8 15,6 11.6,8 12.8,5 10,3 13.8,3" fill="white"/>
                  <polygon points="25,0 26.2,3 30,3 27.2,5 28.4,8 25,6 21.6,8 22.8,5 20,3 23.8,3" fill="white"/>
                </g>
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              {t('reviews.title')}
            </h2>

            {/* TripAdvisor Logo */}
            <div className="hidden sm:flex items-center">
              <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
                <rect width="100" height="20" rx="3" fill="#00AA6C"/>
                <text x="6" y="13" fill="white" fontSize="7" fontWeight="600" fontFamily="Arial">
                  TripAdvisor
                </text>
                <g transform="translate(70, 3)">
                  <circle cx="6" cy="7" r="5" fill="none" stroke="white" strokeWidth="0.8"/>
                  <circle cx="16" cy="7" r="5" fill="none" stroke="white" strokeWidth="0.8"/>
                  <circle cx="6" cy="7" r="2" fill="white"/>
                  <circle cx="16" cy="7" r="2" fill="white"/>
                  <path d="M1 7 C1 4, 3 2, 6 2 C9 2, 11 4, 11 7" stroke="white" strokeWidth="0.8" fill="none"/>
                  <path d="M11 7 C11 4, 13 2, 16 2 C19 2, 21 4, 21 7" stroke="white" strokeWidth="0.8" fill="none"/>
                </g>
              </svg>
            </div>
          </div>
          
          {/* Mobile Badge Display */}
          <div className="flex sm:hidden justify-center gap-4 mb-4">
            <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
              <rect width="80" height="16" rx="2" fill="#00B67A"/>
              <text x="4" y="11" fill="white" fontSize="6" fontWeight="600" fontFamily="Arial">
                Trustpilot
              </text>
              <g transform="translate(50, 3)">
                <polygon points="4,0 4.8,2.4 8,2.4 5.6,4 6.4,6.4 4,5 1.6,6.4 2.4,4 0,2.4 3.2,2.4" fill="white"/>
                <polygon points="12,0 12.8,2.4 16,2.4 13.6,4 14.4,6.4 12,5 9.6,6.4 10.4,4 8,2.4 11.2,2.4" fill="white"/>
                <polygon points="20,0 20.8,2.4 24,2.4 21.6,4 22.4,6.4 20,5 17.6,6.4 18.4,4 16,2.4 19.2,2.4" fill="white"/>
              </g>
            </svg>
            
            <svg width="80" height="16" viewBox="0 0 80 16" fill="none">
              <rect width="80" height="16" rx="2" fill="#00AA6C"/>
              <text x="4" y="11" fill="white" fontSize="5" fontWeight="600" fontFamily="Arial">
                TripAdvisor
              </text>
              <g transform="translate(56, 2)">
                <circle cx="4" cy="6" r="4" fill="none" stroke="white" strokeWidth="0.6"/>
                <circle cx="12" cy="6" r="4" fill="none" stroke="white" strokeWidth="0.6"/>
                <circle cx="4" cy="6" r="1.5" fill="white"/>
                <circle cx="12" cy="6" r="1.5" fill="white"/>
                <path d="M0 6 C0 3, 2 1, 4 1 C6 1, 8 3, 8 6" stroke="white" strokeWidth="0.6" fill="none"/>
                <path d="M8 6 C8 3, 10 1, 12 1 C14 1, 16 3, 16 6" stroke="white" strokeWidth="0.6" fill="none"/>
              </g>
            </svg>
          </div>
          
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