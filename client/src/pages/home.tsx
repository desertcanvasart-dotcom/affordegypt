import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import QuoteBuilderWizard from "@/components/quote-builder-wizard";
import BlogGrid from "@/components/blog-grid";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <QuoteBuilderWizard />
      <BlogGrid />
      <Footer />
    </div>
  );
}
