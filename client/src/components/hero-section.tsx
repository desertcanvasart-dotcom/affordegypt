import { CheckCircle, Truck, Backpack, Zap, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Egypt Travel, Two Ways
          </h1>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed max-w-4xl mx-auto">
            1. Plan a full trip – mix transport, guides, tickets & more.<br />
            2. Just need a ride? Get a door-to-door transfer price instantly.
          </p>
        </div>

        {/* Split Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Full Trip Planner Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white hover:bg-white/15 transition-all duration-300">
            <div className="text-center">
              <div className="bg-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Backpack className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Full Trip Planner</h3>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Build your complete Egypt itinerary with transportation, guides, attractions, and add-ons. Get transparent pricing for everything.
              </p>
              
              {/* Steps */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center">
                  <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">1</div>
                  <span className="text-sm">Choose destinations & routes</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">2</div>
                  <span className="text-sm">Add guides, attractions & meals</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">3</div>
                  <span className="text-sm">See final EGP price before you pay</span>
                </div>
              </div>

              <Button 
                onClick={scrollToBooking}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                Build My Egypt Trip
              </Button>
              
              <div className="flex items-center justify-center mt-4 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Quote in &lt; 60 seconds
              </div>
            </div>
          </div>

          {/* Instant Transfers Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white hover:bg-white/15 transition-all duration-300">
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Transfers Only</h3>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Need door-to-door transport? Get instant pricing for airport transfers, city connections, and inter-city routes.
              </p>
              
              {/* Benefits */}
              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-3" />
                  <span className="text-sm">Instant transfer price</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-sm">Local network = lower rates</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-sm">No surprises, final EGP price</span>
                </div>
              </div>

              <Link href="/transfers">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 text-lg font-semibold rounded-lg shadow-lg">
                  Instant Transfer Price
                </Button>
              </Link>
              
              <div className="flex items-center justify-center mt-4 text-sm text-gray-300">
                <Truck className="w-4 h-4 mr-2" />
                From airports, cities & hotels
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white mt-12">
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-2 w-5 h-5" />
            <span className="text-sm">4.9★ on 2,500+ trips</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-2 w-5 h-5" />
            <span className="text-sm">Licensed operators only</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-2 w-5 h-5" />
            <span className="text-sm">No hidden fees</span>
          </div>
        </div>
      </div>
    </section>
  );
}
