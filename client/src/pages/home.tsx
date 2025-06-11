import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import BlogGrid from "@/components/blog-grid";
import AboutSection from "@/components/about-section";
import CustomerReviews from "@/components/customer-reviews";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <MultiCityPricingTool />
      <BlogGrid />
      <AboutSection />
      <CustomerReviews />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
