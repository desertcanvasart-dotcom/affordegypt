import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { OPERATOR } from "@shared/operator-facts";

export default function TermsOfService() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title="Terms of Service | AffordEgypt"
          description="Terms of service for AffordEgypt, operated by Capital Travel Service (ETAA 2179). Use of the site, bookings, payments, and liability."
          canonical="https://affordegypt.com/terms-of-service"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t("termsOfService.title")}
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
                <p><strong>{t("legal.effectiveDate")}</strong> March 2, 2020</p>
                <p><strong>{t("legal.lastUpdated")}</strong> August 5, 2026</p>
                <p><strong>Contact Email:</strong> <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a></p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s1")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s1pre")}{" "}<a href="https://affordegypt.com" className="text-teal-600 hover:text-teal-700">affordegypt.com</a> {" "}{t("termsOfService.s1b", { address: OPERATOR.address.full })}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s2")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s2b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s3")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s3b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s4")}
                  </h2>
                  <div className="text-gray-700 space-y-2">
                    <p><strong>{t("termsOfService.s4a")}</strong> {t("termsOfService.s4av")}</p>
                    <p><strong>{t("termsOfService.s4b")}</strong> {t("termsOfService.s4bv")}</p>
                    <p><strong>{t("termsOfService.s4c")}</strong> {t("termsOfService.s4cv")}</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s5")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s5b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s6")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s6b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s7")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s7b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s8")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s8b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("termsOfService.s9")}
                  </h2>
                  <p className="text-gray-700">
                    {t("termsOfService.s9b")}
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {t("legal.termsContact")}
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