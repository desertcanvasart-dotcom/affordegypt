import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { effectiveDate, lastUpdatedDate } from "@/lib/legal-dates";

export default function CookiePolicy() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
  <SeoMeta
          title={t("cookiePolicy.seoTitle")}
          description={t("cookiePolicy.seoDescription")}
          canonical="https://affordegypt.com/cookie-policy"
        />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t("cookiePolicy.title")}
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
                <p><strong>{t("legal.effectiveDate")}</strong> {effectiveDate(i18n.language)}</p>
                <p><strong>{t("legal.lastUpdated")}</strong> {lastUpdatedDate(i18n.language)}</p>
                <p><strong>{t("legal.contactEmail")}</strong> <a href="mailto:hello@affordegypt.com" className="text-teal-600 hover:text-teal-700">hello@affordegypt.com</a></p>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("cookiePolicy.s1")}
                  </h2>
                  <p className="text-gray-700">
                    {t("cookiePolicy.s1b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("cookiePolicy.s2")}
                  </h2>
                  <div className="text-gray-700 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("cookiePolicy.s2a")}</h3>
                      <p>{t("cookiePolicy.s2av")}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("cookiePolicy.s2b")}</h3>
                      <p>{t("cookiePolicy.s2bv")}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("cookiePolicy.s2c")}</h3>
                      <p>{t("cookiePolicy.s2cv")}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("cookiePolicy.s3")}
                  </h2>
                  <p className="text-gray-700">
                    {t("cookiePolicy.s3b")}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {t("cookiePolicy.s4")}
                  </h2>
                  <p className="text-gray-700">
                    {t("cookiePolicy.s4b")}
                  </p>
                </section>
              </div>

              <hr className="my-8 border-gray-300" />
              
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {t("legal.cookieContact")}
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