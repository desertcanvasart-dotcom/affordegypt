import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import BlogGrid from "@/components/blog-grid";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <MultiCityPricingTool />
      <BlogGrid />
      <Footer />
    </div>
  );
}
