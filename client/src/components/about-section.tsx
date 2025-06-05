import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Shield } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About Afford Egypt</h2>
          
          <div className="text-lg text-muted-foreground leading-relaxed mb-8 space-y-4">
            <p>
              We're a dedicated team of Egypt travel specialists committed to making authentic Egyptian experiences accessible to budget-conscious travelers. Since 2020, we've helped thousands of visitors explore Egypt's wonders without the premium price tag.
            </p>
            <p>
              Our transparent pricing model eliminates hidden fees and surprise costs, giving you the confidence to plan your perfect Egyptian adventure. From ancient pyramids to vibrant markets, we connect you with local guides and reliable transportation at fair prices.
            </p>
            <p>
              Whether you're exploring Cairo's bustling streets, cruising the Nile, or discovering temples in Luxor, we provide the tools and local expertise to make your journey unforgettable while staying within your budget.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">5000+ Travelers</h3>
              <p className="text-sm text-muted-foreground">Served since 2020</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">15+ Destinations</h3>
              <p className="text-sm text-muted-foreground">Across Egypt</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">During your trip</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">100% Transparent</h3>
              <p className="text-sm text-muted-foreground">No hidden fees</p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              // This will be handled by routing when full about page is created
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Learn More About Our Story
          </Button>
        </div>
      </div>
    </section>
  );
}