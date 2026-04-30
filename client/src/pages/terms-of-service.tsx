import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title="Terms of Service | AffordEgypt"
          description="Terms of service for AffordEgypt, the budget tier of Travel2Egypt. Use of the site, bookings, payments, and liability."
          canonical="https://affordegypt.com/terms-of-service"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Terms of Service – Afford Egypt
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 text-gray-600">
                <p><strong>Effective Date:</strong> March 2, 2020</p>
                <p><strong>Last Updated:</strong> June 6, 2025</p>
                <p><strong>Contact Email:</strong> <a href="mailto:info@affordegypt.com" className="text-teal-600 hover:text-teal-700">info@affordegypt.com</a></p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-700">
                    By using <a href="https://affordegypt.com" className="text-teal-600 hover:text-teal-700">affordegypt.com</a>, you agree to abide by these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Services Offered
                  </h2>
                  <p className="text-gray-700">
                    We provide travel planning, guided tours, transportation, and package bookings within Egypt.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Booking & Payments
                  </h2>
                  <p className="text-gray-700">
                    Bookings require either full or partial payment in advance. Payments are handled securely.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Cancellations & Refunds
                  </h2>
                  <div className="text-gray-700 space-y-2">
                    <p><strong>30+ days:</strong> deposit retained</p>
                    <p><strong>15–29 days:</strong> 50% refund</p>
                    <p><strong>&lt;15 days:</strong> no refund (unless stated otherwise in your package)</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. User Responsibilities
                  </h2>
                  <p className="text-gray-700">
                    You must provide accurate information and comply with local laws and regulations during travel.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Intellectual Property
                  </h2>
                  <p className="text-gray-700">
                    All site content belongs to Afford Egypt or its partners and cannot be copied without written permission.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Disclaimers
                  </h2>
                  <p className="text-gray-700">
                    We are not responsible for disruptions caused by force majeure, third-party service providers, or local conditions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    8. Limitation of Liability
                  </h2>
                  <p className="text-gray-700">
                    Our liability is limited to the total amount you paid for the service in question.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    9. Governing Law
                  </h2>
                  <p className="text-gray-700">
                    These terms are governed by Egyptian law. Disputes will be handled in Egyptian courts.
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {"For questions about these terms, please contact us at "}
                  <a href="mailto:info@affordegypt.com" className="text-teal-600 hover:text-teal-700">
                    info@affordegypt.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}