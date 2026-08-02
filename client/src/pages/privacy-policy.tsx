import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title="Privacy Policy | AffordEgypt"
          description="How AffordEgypt collects, uses, and protects your personal data when you browse, request quotes, or book a tour."
          canonical="https://affordegypt.com/privacy-policy"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Privacy Policy – Afford Egypt
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
                    1. Introduction
                  </h2>
                  <p className="text-gray-700">
                    Afford Egypt ("we", "our", or "us") values your privacy and is committed to protecting your personal data. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://affordegypt.com" className="text-teal-600 hover:text-teal-700">affordegypt.com</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. What Personal Data We Collect
                  </h2>
                  <p className="text-gray-700 mb-4">We may collect:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>Identity Data:</strong> Name, nationality, passport info</li>
                    <li><strong>Contact Data:</strong> Email, phone number, address</li>
                    <li><strong>Travel Data:</strong> Itinerary preferences, special requests</li>
                    <li><strong>Payment Data:</strong> Processed securely via third-party platforms</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, cookies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Legal Basis for Processing (GDPR)
                  </h2>
                  <p className="text-gray-700 mb-4">Under the General Data Protection Regulation (GDPR), we process your data based on:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Contractual necessity</li>
                    <li>Your consent</li>
                    <li>Legal obligations</li>
                    <li>Our legitimate interests (e.g., improving services)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Your Rights
                  </h2>
                  <p className="text-gray-700 mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Access, correct, or delete your personal data</li>
                    <li>Restrict or object to our processing</li>
                    <li>Withdraw your consent at any time</li>
                    <li>Request a copy of your data in portable format</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    To exercise these rights, email us at: <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. Data Retention
                  </h2>
                  <p className="text-gray-700">
                    We keep your data only as long as necessary to fulfil your bookings and legal obligations.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Security
                  </h2>
                  <p className="text-gray-700">
                    We take appropriate technical and organisational measures to safeguard your personal data.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. International Transfers
                  </h2>
                  <p className="text-gray-700">
                    We may transfer data outside the EU (e.g., to Egypt), using Standard Contractual Clauses or other legal safeguards.
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {"For questions about this privacy policy, please contact us at "}
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