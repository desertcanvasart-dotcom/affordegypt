import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title="Cookie Policy | AffordEgypt"
          description="How AffordEgypt uses cookies and similar tracking technologies, and how to control them."
          canonical="https://affordegypt.com/cookie-policy"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Cookies Policy – Afford Egypt
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 text-gray-600">
                <p><strong>Effective Date:</strong> March 2, 2020</p>
                <p><strong>Last Updated:</strong> June 6, 2025</p>
                <p><strong>Contact Email:</strong> <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a></p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. What Are Cookies?
                  </h2>
                  <p className="text-gray-700">
                    Cookies are small text files stored in your browser that help improve your experience and track user behaviour on our website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Types of Cookies We Use
                  </h2>
                  <div className="text-gray-700 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Essential Cookies:</h3>
                      <p>For site functionality (e.g., navigation, bookings)</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytical Cookies:</h3>
                      <p>For tracking performance (e.g., Google Analytics)</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Marketing Cookies:</h3>
                      <p>For personalised ads (e.g., Facebook Pixel)</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Managing Cookies
                  </h2>
                  <p className="text-gray-700">
                    You can manage or delete cookies via your browser settings. Disabling cookies may affect the website's performance.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Third-Party Cookies
                  </h2>
                  <p className="text-gray-700">
                    Some cookies may come from external services like maps, payment platforms, or live chat systems.
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {"For any questions, contact: "}
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