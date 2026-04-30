import SeoMeta from "@/components/seo-meta";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";

export default function PricingTool() {
  return (
    <>
      <SeoMeta
        title="Build Your Egypt Trip Quote | Real-Time Pricing | AffordEgypt"
        description="Build a multi-city Egypt trip with real-time transparent pricing. Pick destinations, vehicles, guides, attractions, and add-ons. See your price in EGP. Pay 10% deposit, balance on arrival."
        canonical="https://affordegypt.com/pricing-tool"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Multi-City Travel Pricing Tool
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Build your perfect Egypt adventure with our comprehensive pricing calculator. 
                Select cities, attractions, transportation, and guides to get instant transparent pricing.
              </p>
            </div>
            
            <MultiCityPricingTool />
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}