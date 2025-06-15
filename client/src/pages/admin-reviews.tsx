import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReviewUpload from "@/components/review-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Eye, EyeOff, Star, Users, Upload as UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Review {
  id: number;
  customerName: string;
  customerLocation: string;
  rating: number;
  title: string;
  content: string;
  tripDate: string;
  isVerified: boolean;
  isActive: boolean;
}

export default function AdminReviews() {
  const [activeTab, setActiveTab] = useState("manage");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all reviews for admin (including inactive ones)
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews/all"],
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  // Toggle review visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ reviewId, isActive }: { reviewId: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/reviews/${reviewId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/all"] });
      toast({
        title: "Success",
        description: "Review visibility updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update review visibility",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: reviews.length,
    active: reviews.filter((r: any) => r.isActive).length,
    verified: reviews.filter((r: any) => r.isVerified).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0",
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleToggleVisibility = (reviewId: number, currentStatus: boolean) => {
    toggleVisibilityMutation.mutate({ reviewId, isActive: !currentStatus });
  };

  return (
    <>
      <Helmet>
        <title>Admin - Review Management | Afford Egypt</title>
        <meta name="description" content="Manage customer reviews for Afford Egypt travel services." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Review Management
              </h1>
              <p className="text-lg text-gray-600">
                Manage customer reviews and upload new ones in bulk
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Badge className="h-8 w-8 text-purple-600 bg-purple-100">✓</Badge>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Verified Reviews</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage">Manage Reviews</TabsTrigger>
                <TabsTrigger value="upload">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Bulk Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manage" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No reviews found. Upload some reviews to get started.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <div key={review.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                                  {review.isVerified && (
                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                  )}
                                  <Badge variant={review.isActive ? "default" : "outline"} className="text-xs">
                                    {review.isActive ? "Active" : "Hidden"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {review.customerLocation} • {new Date(review.tripDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-800 mb-1">{review.title}</h4>
                                <p className="text-gray-600 text-sm line-clamp-2">{review.content}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleVisibility(review.id, review.isActive)}
                                  disabled={toggleVisibilityMutation.isPending}
                                >
                                  {review.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteReview(review.id)}
                                  disabled={deleteReviewMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="mt-6">
                <ReviewUpload />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}