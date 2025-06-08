import { ArrowRight, CheckCircle, Star, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Hero() {
  const scrollToQuote = () => {
    const element = document.getElementById('quote-builder');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="min-h-[90vh] flex items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(25, 169, 116, 0.3), rgba(31, 41, 55, 0.6)), url('http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Egypt Travel Made{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              Simple
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
            Get instant quotes for transport, guides, and experiences. 
            See the real final price upfront – no hidden fees.
          </p>

          {/* 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">Select Your Journey</h3>
              <p className="text-white/80 text-sm">Choose cities, transport, and group size</p>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">Add Guides & Extras</h3>
              <p className="text-white/80 text-sm">Pick local guides and experiences</p>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">Get Instant Quote</h3>
              <p className="text-white/80 text-sm">See total price with all fees included</p>
            </Card>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={scrollToQuote}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg font-semibold shadow-xl"
          >
            Start Your Quote
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-sm text-white/80">4.9/5 Rating</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm text-white/80">2,500+ Travelers</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-white/80">Verified Guides</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-white/80">All Egypt</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}