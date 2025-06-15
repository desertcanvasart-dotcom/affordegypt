import { Car, UserRoundCheck, PlusCircle } from "lucide-react";

export default function ServiceOverview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Three Simple Services, Complete Freedom
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for budget travel in Egypt. No packages, no upselling - just transparent pricing for exactly what you want.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Transportation */}
          <div className="text-center p-8 rounded-xl border border-border hover:shadow-lg transition-shadow card-hover">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" 
              alt="Transportation in Egypt" 
              className="w-full h-48 object-cover rounded-lg mb-6" 
            />
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">City & Inter-City Transport</h3>
            <p className="text-muted-foreground mb-4">Route-based or hourly pricing. Economy to luxury vehicles. Licensed drivers only.</p>
            <div className="text-sm text-muted-foreground">Starting from $15/hour</div>
          </div>

          {/* Tour Guides */}
          <div className="text-center p-8 rounded-xl border border-border hover:shadow-lg transition-shadow card-hover">
            <img 
              src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0" 
              alt="Egyptian tour guide" 
              className="w-full h-48 object-cover rounded-lg mb-6" 
            />
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRoundCheck className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Licensed Tour Guides</h3>
            <p className="text-muted-foreground mb-4">Multi-language guides. City-specific rates. Hourly or daily pricing.</p>
            <div className="text-sm text-muted-foreground">Starting from EGP 800/day</div>
          </div>

          {/* Add-ons */}
          <div className="text-center p-8 rounded-xl border border-border hover:shadow-lg transition-shadow card-hover">
            <img 
              src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce" 
              alt="Felucca on the Nile" 
              className="w-full h-48 object-cover rounded-lg mb-6" 
            />
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Experiences & Add-ons</h3>
            <p className="text-muted-foreground mb-4">Felucca rides, horse carriages, meals, skip-line tickets. Context-aware options.</p>
            <div className="text-sm text-muted-foreground">Starting from $8/person</div>
          </div>
        </div>
      </div>
    </section>
  );
}
