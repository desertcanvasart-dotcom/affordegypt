import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import BookingWizard from "@/components/booking-wizard";
import ServiceOverview from "@/components/service-overview";
import FeaturedDestinations from "@/components/featured-destinations";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Quick Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">3</div>
              <div className="text-muted-foreground">Core Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">15+</div>
              <div className="text-muted-foreground">Egyptian Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">27</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">100%</div>
              <div className="text-muted-foreground">Price Transparency</div>
            </div>
          </div>
        </div>
      </section>

      <BookingWizard />
      <ServiceOverview />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Budget Travelers Choose EGH
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              27 years of experience helping travelers explore Egypt affordably. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Transparent Pricing</h3>
              <p className="text-muted-foreground text-sm">See final price including taxes, commission, and all fees upfront</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Instant Quotes</h3>
              <p className="text-muted-foreground text-sm">Build complete itinerary in minutes with real-time pricing</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Licensed Operators</h3>
              <p className="text-muted-foreground text-sm">All drivers and guides are properly licensed and vetted</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-mobile-alt text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Mobile Optimized</h3>
              <p className="text-muted-foreground text-sm">Book on-the-go with our mobile-first design</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedDestinations />
      <Footer />
    </div>
  );
}
