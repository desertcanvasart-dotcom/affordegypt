import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import ReviewUpload from "@/components/review-upload";

export default function AdminReviews() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Admin - Review Upload | Afford Egypt</title>
        <meta name="description" content="Bulk upload customer reviews for Afford Egypt travel services." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Review Management
              </h1>
              <p className="text-lg text-gray-600">
                Upload customer reviews in bulk using CSV format
              </p>
            </div>

            <ReviewUpload />
          </div>
        </div>
      </div>
    </>
  );
}