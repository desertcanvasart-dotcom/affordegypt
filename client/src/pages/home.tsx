import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import AboutSection from "@/components/about-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";
import { TranslationDemo } from "@/components/translation-demo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <MultiCityPricingTool />
      <AnimatedReviewCarousel />
      
      {/* View All Reviews Button Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/reviews">
            <Button 
              size="lg" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg font-semibold"
            >
              {t('footer.followUs')}
            </Button>
          </Link>
        </div>
      </section>
      
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.features.localNetwork')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('home.subtitle')}
            </p>
          </div>
          <TranslationDemo />
        </div>
      </div>
      
      <BlogGrid />
      <AboutSection />
      <FAQSection />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
