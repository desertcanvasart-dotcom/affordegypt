import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import AboutSection from "@/components/about-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {

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
              View All Reviews
            </Button>
          </Link>
        </div>
      </section>
      
      <BlogGrid />
      <AboutSection />
      <FAQSection />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
