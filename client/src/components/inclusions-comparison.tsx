// Three-column "what's included / what's not / what Capital Travel Service adds"
// section. Trust grenade in a market built on opacity: pre-frames
// Capital Travel Service as an honest upgrade rather than a hidden parent brand.

import { Check, X, Sparkles } from "lucide-react";

const includedAffordEgypt = [
  "Licensed Egyptologist guide",
  "Private vehicle + driver",
  "Fuel and parking",
  "Bottled water",
  "WhatsApp support during your trip",
];

const notIncludedAffordEgypt = [
  "Entrance tickets",
  "Meals",
  "Hotel",
  "Tips",
  "International flights",
  "Optional experiences (camel ride, felucca, etc.)",
];

const capitalTravelAdds = [
  "Multilingual guides (Spanish, Japanese, Finnish, Arabic)",
  "Premium hotel partnerships",
  "Concierge planning",
  "Welcome amenities",
  "24/7 dedicated trip line",
  "Pre-trip planning calls",
];

export default function InclusionsComparison() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Honest pricing means honest inclusions.
          </h2>
          <p className="text-lg text-gray-600">
            Here's exactly what you get.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-primary/30 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-gray-900">
                AffordEgypt — what's included
              </h3>
            </div>
            <ul className="space-y-3">
              {includedAffordEgypt.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-900">
                AffordEgypt — what's not included
              </h3>
            </div>
            <ul className="space-y-3">
              {notIncludedAffordEgypt.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <X className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">
                What we can add at the premium tier
              </h3>
            </div>
            <ul className="space-y-3">
              {capitalTravelAdds.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
