import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-wizard');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative hero-bg h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Budget Egypt Travel Made Simple
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Build your complete Egypt itinerary in minutes. Transportation, guides, and add-ons with transparent pricing - no hidden fees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              onClick={scrollToBooking}
              className="btn-primary px-8 py-4 text-lg"
            >
              Start Building Your Trip
            </Button>
            <div className="flex items-center text-white">
              <CheckCircle className="text-green-400 mr-3" size={20} />
              <span>Real-time pricing • No booking fees • Instant quotes</span>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center space-x-8 text-white">
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 mr-2"></i>
              <span className="text-sm">4.9/5 from 2,847 reviews</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-shield-alt text-green-400 mr-2"></i>
              <span className="text-sm">Licensed operators only</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
