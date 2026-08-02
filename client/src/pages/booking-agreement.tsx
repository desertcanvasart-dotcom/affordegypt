import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";

export default function BookingAgreement() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title="Booking Agreement | AffordEgypt"
          description="AffordEgypt's booking agreement: deposit terms, cancellation, refunds, and traveler responsibilities for tours operated by Capital Travel Service (ETAA 2179)."
          canonical="https://affordegypt.com/booking-agreement"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Booking Agreement – Afford Egypt
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 text-gray-600">
                <p><strong>Effective Date:</strong> March 2, 2020</p>
                <p><strong>Last Updated:</strong> June 6, 2025</p>
                <p><strong>Contact Email:</strong> <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a></p>
              </div>

              <p className="text-lg text-gray-700 mb-8">
                This agreement applies to all travel bookings made with Afford Egypt.
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Confirmation & Deposit
                  </h2>
                  <p className="text-gray-700">
                    A non-refundable deposit of 10% is required to confirm your booking. The remaining balance must be paid upon arrival in cash.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Inclusions & Exclusions
                  </h2>
                  <p className="text-gray-700">
                    Your quotation or itinerary specifies exactly what is included and what is not. Please review it carefully.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Modifications & Special Requests
                  </h2>
                  <p className="text-gray-700">
                    Custom requests will be handled with care, though subject to availability and possible additional costs.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Cancellations & Refunds
                  </h2>
                  <p className="text-gray-700">
                    (As described in Terms of Service)
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. Client Responsibilities
                  </h2>
                  <p className="text-gray-700">
                    Travelers must ensure valid travel documents and purchase suitable insurance. Health and entry regulations are your responsibility.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Complaints & Disputes
                  </h2>
                  <p className="text-gray-700">
                    If something goes wrong, please notify us immediately so we can try to resolve it. Formal complaints must be emailed to <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a> within 7 days of the trip's end.
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {"For questions about this booking agreement, please contact us at "}
                  <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">
                    hello@affordegypt.com
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