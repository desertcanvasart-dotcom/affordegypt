import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ReviewForm from "@/components/review-form";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, MapPin } from "lucide-react";
import { ClientOnly } from "@/components/client-only";
import { useQuery } from "@tanstack/react-query";
import { TRAVELLERS_SERVED } from "@/lib/operator-facts";

interface PublicReview {
  rating: number;
}

export default function SubmitReview() {
  const { t } = useTranslation();
  // These three numbers used to be hardcoded as "4.8/5 from 500+ reviews",
  // "2,000+ happy travelers" and "15+ destinations". None held up: the reviews
  // table is empty, the destinations list has 7 entries, and the traveller
  // count contradicted the "2,500+" on the homepage credentials strip.
  // Anything derivable is now derived, so it cannot drift again.
  const { data: reviews = [] } = useQuery<PublicReview[]>({
    queryKey: ["/api/reviews"],
  });
  const { data: cities = [] } = useQuery<unknown[]>({
    queryKey: ["/api/cities"],
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const stats = [
    {
      icon: Star,
      label: t("submitReviewPage.avgRating"),
      // With no reviews yet, inviting the first one is honest and still useful.
      // Asserting a rating nobody has given is neither.
      value: averageRating !== null ? `${averageRating.toFixed(1)}/5` : t("submitReviewPage.beFirst"),
      description:
        reviews.length > 0
          ? `From ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}`
          : t("submitReviewPage.noneYet"),
    },
    {
      icon: Users,
      label: t("submitReviewPage.travellers"),
      value: TRAVELLERS_SERVED,
      description: t("submitReviewPage.travellersNote"),
    },
    {
      icon: MapPin,
      label: t("submitReviewPage.destinations"),
      value: cities.length > 0 ? `${cities.length}` : "—",
      description: t("submitReviewPage.destinationsNote"),
    },
  ];

  return (
    <>
      <SeoMeta
        title="Submit a Review | AffordEgypt"
        description="Tell us how your AffordEgypt trip went. Your honest feedback helps future travelers make a better decision."
        canonical="https://affordegypt.com/submit-review"
      />

      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("submitReviewPage.title")}
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              {t("submitReviewPage.subtitle")}
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                      <stat.icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
                    <div className="text-sm text-gray-600">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Review Form */}
                <div className="lg:col-span-2">
                  <ClientOnly>
                    <ReviewForm />
                  </ClientOnly>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Why Reviews Matter */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        {t("submitReviewPage.whyTitle")}
                      </h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{t("submitReviewPage.why1")}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{t("submitReviewPage.why2")}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{t("submitReviewPage.why3")}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{t("submitReviewPage.why4")}</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Review Guidelines */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        {t("submitReviewPage.guidelinesTitle")}
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          <strong>{t("submitReviewPage.g1Label")}</strong> {t("submitReviewPage.g1")}
                        </p>
                        <p>
                          <strong>{t("submitReviewPage.g2Label")}</strong> {t("submitReviewPage.g2")}
                        </p>
                        <p>
                          <strong>{t("submitReviewPage.g3Label")}</strong> {t("submitReviewPage.g3")}
                        </p>
                        <p>
                          <strong>{t("submitReviewPage.g4Label")}</strong> {t("submitReviewPage.g4")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        {t("submitReviewPage.needHelp")}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <strong>Email:</strong> reviews@affordegypt.com
                        </p>
                        <p>
                          <strong>Phone:</strong> +20 110 076 5283
                        </p>
                        <p>
                          <strong>WhatsApp:</strong> +20 110 076 5283
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-4">
                        {t("submitReviewPage.verifiedNote")}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}