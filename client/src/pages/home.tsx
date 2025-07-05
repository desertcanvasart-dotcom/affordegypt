import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <MultiCityPricingTool />
      <AnimatedReviewCarousel />
      <BlogGrid />
      <FAQSection />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
