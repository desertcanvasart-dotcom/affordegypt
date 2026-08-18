import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Quote, Filter, Search, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { enUS, es, fr, de } from "date-fns/locale";
import type { Review } from "@shared/schema";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useTranslatedLink } from "@/utils/slugTranslation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// date-fns formats month names from its own locale, not the browser's and not
// i18next's — a bare format(d, "MMM yyyy") printed "Mar 2026" on the German
// page. Every trip date on this screen went through that call.
const DATE_LOCALES = { en: enUS, es, fr, de } as const;

export default function ReviewsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale =
    DATE_LOCALES[i18n.language as keyof typeof DATE_LOCALES] ?? enUS;
  const tripMonth = (value: string | Date) =>
    // i18n-exempt: a date-fns format pattern, not copy — the words it produces
    // come from `locale`, which is what makes this translated at all.
    format(new Date(value), "MMM yyyy", { locale: dateLocale });
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const getTranslatedLink = useTranslatedLink();

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews"],
  });
  const hasReviews = reviews.length > 0;

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

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = 
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
          return new Date(b.tripDate || 0).getTime() - new Date(a.tripDate || 0).getTime();
        case "oldest":
          return new Date(a.tripDate || 0).getTime() - new Date(b.tripDate || 0).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filteredAndSortedReviews.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case "search":
        setSearchTerm(value);
        break;
      case "rating":
        setRatingFilter(value);
        break;
      case "sort":
        setSortBy(value);
        break;
    }
  };

  // Toggle card expansion
  const toggleCardExpansion = (reviewId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedCards(newExpanded);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  if (isLoading) {
    return (
      <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16">
  <SeoMeta
          title={t("reviewsPage.seoTitle")}
          description={t("reviewsPage.seoDescription")}
          canonical="https://affordegypt.com/reviews"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  }

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-16">
      {/* Also rendered by the loading branch, but that branch is skipped
          entirely when the query answers from cache — without this copy, a
          client-side navigation here keeps the previous page's head. */}
      <SeoMeta
        title={t("reviewsPage.seoTitle")}
        description={t("reviewsPage.seoDescription")}
        canonical="https://affordegypt.com/reviews"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("reviewsPage.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {t("reviewsPage.subtitle")}
          </p>
          
          {/* "0.0 (0 reviews)" under five hollow stars reads as a broken
              page, not an unrated one — with no data the header stops at the
              subtitle and the empty state below carries the message. */}
          {hasReviews && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">
                {t("reviewsPage.reviewCount", { count: reviews.length })}
              </span>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        {hasReviews && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("reviewsPage.distribution")}</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{count}</span>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Filters and Controls */}
        {hasReviews && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={t("reviewsPage.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select value={ratingFilter} onValueChange={(value) => handleFilterChange("rating", value)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t("reviewsPage.filterRating")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("reviewsPage.allRatings")}</SelectItem>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t("reviewsPage.stars", { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => handleFilterChange("sort", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("reviewsPage.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t("reviewsPage.newest")}</SelectItem>
                  <SelectItem value="oldest">{t("reviewsPage.oldest")}</SelectItem>
                  <SelectItem value="highest">{t("reviewsPage.highest")}</SelectItem>
                  <SelectItem value="lowest">{t("reviewsPage.lowest")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("reviewsPage.perPage")} />
                </SelectTrigger>
                <SelectContent>
                  {[6, 12, 24, 48].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {t("reviewsPage.perPageOption", { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  aria-label={t("reviewsPage.gridView")}
                  aria-pressed={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  className="min-h-11 min-w-11 rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  aria-label={t("reviewsPage.listView")}
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className="min-h-11 min-w-11 rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results summary. Suppressed when nothing matched — the range is
              computed from the page offset, so an empty result set rendered
              "Showing 1–0 of 0 reviews". The empty state below says it once,
              properly. */}
          {filteredAndSortedReviews.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
              {t("reviewsPage.showingRange", {
                from: startIndex + 1,
                to: Math.min(endIndex, filteredAndSortedReviews.length),
                total: filteredAndSortedReviews.length,
              })}
            </div>
          )}
        </div>
        )}

        {/* Reviews Display */}
        {!hasReviews ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Quote className="w-10 h-10 text-primary/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t("reviewsPage.emptyTitle")}
            </h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {t("reviewsPage.emptyBody")}
            </p>
            <Button asChild>
              <Link href={getTranslatedLink("submit-review")}>
                {t("reviewsPage.emptyCta")}
              </Link>
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className={`grid gap-6 mb-8 ${
            itemsPerPage === 6 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : 
            itemsPerPage === 12 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : 
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
          }`}>
            {paginatedReviews.map((review) => {
              const isExpanded = expandedCards.has(review.id);
              const shouldShowToggle = review.content.length > 200; // Show toggle for long reviews
              
              return (
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
                    
                    <div className="text-gray-600 mb-4">
                      <p className={!isExpanded && shouldShowToggle ? "line-clamp-3" : ""}>
                        {review.content}
                      </p>
                      {shouldShowToggle && (
                        <button
                          onClick={() => toggleCardExpansion(review.id)}
                          className="text-primary hover:text-primary/80 text-sm font-medium mt-2 transition-colors"
                        >
                          {isExpanded ? t("reviewsPage.readLess") : t("reviewsPage.readMore")}
                        </button>
                      )}
                    </div>
                    
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
                              {t("reviewsPage.verified")}
                            </Badge>
                          )}
                          {review.tripDate && (
                            <p className="text-xs text-gray-500">
                              {tripMonth(review.tripDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {paginatedReviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {review.title}
                        </h3>
                        {review.isVerified && (
                          <Badge variant="secondary">
                            {t("reviewsPage.verified")}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        {review.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {review.customerName}
                          </p>
                          {review.customerLocation && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-sm text-gray-500">
                                {review.customerLocation}
                              </p>
                            </>
                          )}
                        </div>
                        {review.tripDate && (
                          <p className="text-sm text-gray-500">
                            {tripMonth(review.tripDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasReviews && paginatedReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {t("reviewsPage.noneFound")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div className="text-sm text-gray-600">
              {t("reviewsPage.pageOf", {
                current: currentPage,
                total: totalPages,
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                {t("reviewsPage.firstPage")}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                aria-label={t("reviewsPage.prevPage")}
                className="min-h-11 min-w-11"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                aria-label={t("reviewsPage.nextPage")}
                className="min-h-11 min-w-11"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                {t("reviewsPage.lastPage")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}