import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CredentialsStrip from "@/components/credentials-strip";
import FounderBlock from "@/components/founder-block";
import InclusionsComparison from "@/components/inclusions-comparison";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import FAQSection from "@/components/faq-section";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <CredentialsStrip />
      <FounderBlock />
      <InclusionsComparison />
      <MultiCityPricingTool />
      <AnimatedReviewCarousel />
      <BlogGrid />
      <FAQSection />
      <NewsletterSection />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
