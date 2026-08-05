import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();
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
              {t("privacyPolicy.title")}
            </h1>

              {/* Translated legal text carries real risk: a mistranslated
                  cancellation or data-protection term has consequences a
                  mistranslated headline does not. Standard mitigation — name
                  one authoritative version. Hidden in English, where it would
                  be meaningless. */}
              {i18n.language !== "en" && (
                <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  {t("legal.prevailing")}
                </p>
              )}
            
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 text-gray-600">
                <p><strong>{t("legal.effectiveDate")}</strong> August 5, 2026</p>
                <p><strong>{t("legal.lastUpdated")}</strong> August 5, 2026</p>
                <p><strong>Contact Email:</strong> <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a></p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s1")}
                  </h2>
                  <p className="text-gray-700">
                    {t("privacyPolicy.s1b")}{" "} <a href="https://affordegypt.com" className="text-teal-600 hover:text-teal-700">affordegypt.com</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s2")}
                  </h2>
                  <p className="text-gray-700 mb-4">We may collect:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li><strong>{t("privacyPolicy.s2a")}</strong> {t("privacyPolicy.s2av")}</li>
                    <li><strong>{t("privacyPolicy.s2b")}</strong> {t("privacyPolicy.s2bv")}</li>
                    <li><strong>{t("privacyPolicy.s2c")}</strong> {t("privacyPolicy.s2cv")}</li>
                    <li><strong>{t("privacyPolicy.s2d")}</strong> {t("privacyPolicy.s2dv")}</li>
                    <li><strong>{t("privacyPolicy.s2e")}</strong> {t("privacyPolicy.s2ev")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s3")}
                  </h2>
                  <p className="text-gray-700 mb-4">Under the General Data Protection Regulation (GDPR), we process your data based on:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>{t("privacyPolicy.s3a")}</li>
                    <li>{t("privacyPolicy.s3b")}</li>
                    <li>{t("privacyPolicy.s3c")}</li>
                    <li>{t("privacyPolicy.s3d")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s4")}
                  </h2>
                  <p className="text-gray-700 mb-4">You have the right to:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>{t("privacyPolicy.s4a")}</li>
                    <li>{t("privacyPolicy.s4b")}</li>
                    <li>{t("privacyPolicy.s4c")}</li>
                    <li>{t("privacyPolicy.s4d")}</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    To exercise these rights, email us at: <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a>
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s5")}
                  </h2>
                  <p className="text-gray-700">
                    {t("privacyPolicy.s5b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s6")}
                  </h2>
                  <p className="text-gray-700">
                    {t("privacyPolicy.s6b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("privacyPolicy.s7")}
                  </h2>
                  <p className="text-gray-700">
                    {t("privacyPolicy.s7b")}
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {t("legal.privacyContact")}
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