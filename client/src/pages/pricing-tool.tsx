import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";

export default function PricingTool() {
  return (
    <>
      <Helmet>
        <title>Travel Pricing Tool | Afford Egypt</title>
        <meta name="description" content="Build your custom Egypt travel itinerary with our interactive pricing tool. Get instant quotes for transportation, guides, and attractions across multiple cities." />
        <meta name="keywords" content="Egypt travel pricing, custom itinerary, travel calculator, Egypt tour prices, budget travel planner" />
      </Helmet>
      
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