import SeoMeta from "@/components/seo-meta";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ReviewForm from "@/components/review-form";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, MapPin } from "lucide-react";
import { ClientOnly } from "@/components/client-only";

export default function SubmitReview() {
  const stats = [
    { icon: Star, label: "Average Rating", value: "4.8/5", description: "From 500+ reviews" },
    { icon: Users, label: "Happy Travelers", value: "2,000+", description: "Satisfied customers" },
    { icon: MapPin, label: "Destinations", value: "15+", description: "Cities covered" },
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
              Share Your Egypt Adventure
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto">
              Your authentic experiences help fellow travelers discover the magic of Egypt. 
              Share your story and inspire others to explore this incredible destination.
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
                        Why Your Review Matters
                      </h3>
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Help future travelers make informed decisions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Share insider tips and hidden gems</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Support our local guides and team</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>Help us improve our services</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Review Guidelines */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        Review Guidelines
                      </h3>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          <strong>Be Authentic:</strong> Share your genuine experience, both highlights and challenges.
                        </p>
                        <p>
                          <strong>Be Specific:</strong> Mention specific destinations, guides, or activities that stood out.
                        </p>
                        <p>
                          <strong>Be Helpful:</strong> Include practical tips that might help future travelers.
                        </p>
                        <p>
                          <strong>Be Respectful:</strong> Keep your review constructive and respectful to all parties.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4 text-gray-900">
                        Need Help?
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
                        All reviews are manually verified before publication to ensure authenticity.
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