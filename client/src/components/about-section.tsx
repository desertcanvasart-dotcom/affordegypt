import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Shield } from "lucide-react";
import { Link } from "wouter";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Travel With Us</h2>
          
          <div className="text-lg text-muted-foreground leading-relaxed mb-8 space-y-4">
            <p>
              At Afford Egypt, we're a new generation of Egypt travel specialists redefining what budget travel means—transparent, flexible, and rich in experience.
            </p>
            <p>
              Since 2020, we've helped thousands explore the real Egypt with zero hidden fees and maximum peace of mind. From intercity rides to full-day guided adventures, everything is built to fit your plan and your budget.
            </p>
            <p>
              Whether you're navigating the ancient streets of Cairo, sailing down the Nile, or uncovering Luxor's temple secrets, our platform connects you directly to reliable transport, trusted local guides, and essential attractions—all in just a few clicks.
            </p>
            <p>
              Backed by outstanding customer support and built by young people who actually understand modern travelers, Afford Egypt makes exploring Egypt easy, affordable, and unforgettable.
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

          <Link href="/about">
            <Button 
              variant="outline" 
              size="lg"
            >
              Learn More About Our Story
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}