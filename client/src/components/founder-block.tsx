// Founder note from Islam. Highest-leverage piece of writing on the page —
// origin story + Capital Travel Service history + AffordEgypt thesis in 5 paragraphs.
// Photo placeholder: replace /islam-photo.jpg with a real photo of Islam
// (phone shot in Cairo or Siwa, daylight, looking at camera). DO NOT use
// stock or AI-generated imagery here — that defeats the point of the block.

import { ClientOnly } from "@/components/client-only";

export default function FounderBlock() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
          <div className="flex md:block justify-center">
            <div
              className="w-48 h-48 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-2xl overflow-hidden bg-gray-100 ring-4 ring-primary/10"
              aria-label="Photo of Islam, founder of AffordEgypt"
            >
              <ClientOnly>
                <img
                  src="/islam-photo.jpg"
                  alt="Islam, founder of AffordEgypt"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: hide the broken image so the layout doesn't
                    // show a placeholder icon if the photo isn't uploaded yet.
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </ClientOnly>
            </div>
          </div>

          <div className="space-y-4 text-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Hi, I'm Islam — and I built AffordEgypt to fix something I see every day.
            </h2>

            <p className="leading-relaxed">
              {"I grew up in Aswan and have run "}
              <span className="font-semibold">Capital Travel Service</span>
              {" — a licensed Egyptian tour operator — since 2003. We've taken thousands of travelers across Egypt: backpackers and families, honeymooners and solo first-timers."}
            </p>

            <p className="leading-relaxed">
              Here's what I kept noticing: a huge number of travelers were
              getting priced out of real Egypt by tour operator markup and
              package bundling they didn't ask for. They'd either book a
              $4,000 package they couldn't afford, or take their chances with
              a fly-by-night WhatsApp operator nobody could verify.
            </p>

            <p className="leading-relaxed">
              AffordEgypt is the third option. Same licensed guides as
              Capital Travel Service, same vehicles, same standards — stripped down to
              what you actually need. A private car. A real Egyptologist.
              And the freedom to add tickets, meals, and experiences only
              when you want them.
            </p>

            <p className="text-lg font-semibold text-gray-900 pt-2">
              Real prices. Real operator behind it. Real Egypt.
            </p>

            <p className="text-gray-600 italic">— Islam</p>
          </div>
        </div>
      </div>
    </section>
  );
}
