import { useEffect } from "react";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Users, MapPin, Clock, Star } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function About() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleStartJourney = () => {
    setLocation('/');
    setTimeout(() => {
      const element = document.getElementById('quote-builder');
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <>
      <SeoMeta
        title={t("aboutPage.seoTitle")}
        description={t("aboutPage.seoDescription")}
        canonical="https://affordegypt.com/about"
      />

      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section
          className="relative text-white min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-fixed bg-[url('/images/pyramids-desert.jpg')]"
        >
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 to-teal-700/30" />
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <Badge className="bg-white/20 text-white mb-6 text-sm px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              {t("aboutPage.badge")}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("aboutPage.heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 max-w-4xl mx-auto leading-relaxed">
              {t("aboutPage.heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 -mt-12 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t("aboutPage.missionTitle")}</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t("aboutPage.missionBody")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t("aboutPage.valuesTitle")}</h2>
              <p className="text-lg text-gray-600">{t("aboutPage.valuesSubtitle")}</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t("aboutPage.value1Title")}</h3>
                <p className="text-gray-600">
                  {t("aboutPage.value1Body")}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t("aboutPage.value2Title")}</h3>
                <p className="text-gray-600">
                  {t("aboutPage.value2Body")}
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t("aboutPage.value3Title")}</h3>
                <p className="text-gray-600">
                  {t("aboutPage.value3Body")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">{t("aboutPage.storyTitle")}</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("aboutPage.story1Title")}</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t("aboutPage.story1Body")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("aboutPage.story2Title")}</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t("aboutPage.story2Body")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("aboutPage.story3Title")}</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t("aboutPage.story3Body")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">{t("aboutPage.story4Title")}</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t("aboutPage.story4Body")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-16 bg-teal-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">{t("aboutPage.promiseTitle")}</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t("aboutPage.promiseBody1")}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-12">
              {t("aboutPage.promiseBody2")}
            </p>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-teal-600 mb-4">{t("aboutPage.ctaTitle")}</h3>
              <p className="text-gray-700 mb-6">
                {t("aboutPage.ctaBody")}
              </p>
              <Button 
                size="lg" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg"
                onClick={handleStartJourney}
              >
                {t("aboutPage.ctaButton")}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}