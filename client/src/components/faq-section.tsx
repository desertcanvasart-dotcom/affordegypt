import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FAQ {
  id: number;
  question: string;
  // answer is React content so we can render multi-paragraph copy and links
  answer: React.ReactNode;
}

// Conversion-blocker FAQs aligned with the homepage rewrite. Two original
// SEO-friendly questions kept (visa + best time). Four blockers replaced.
// Q7 is the explicit price-floor answer with the same $X/$Y placeholders
// the hero uses; once the real numbers land, replace [X] and [Y] below.
const FAQS: FAQ[] = [
  {
    id: 1,
    question: "Why are you cheaper than other private Egypt tours?",
    answer: (
      <>
        Because we don't pad the price with things you didn't ask for. Most
        Egypt tour packages bundle hotels, meals, tickets, and concierge
        service into a single number — even if you'd rather choose those
        yourself. AffordEgypt charges only for the operational core: a private
        car, a licensed Egyptologist, and a transparent base price. You add
        what you need. Nothing else. Same operations as Travel2Egypt's premium
        tier, with the markup and the inclusions you didn't choose stripped
        out.
      </>
    ),
  },
  {
    id: 2,
    question: "How do I know AffordEgypt isn't one of the scam operators I've read about?",
    answer: (
      <>
        Fair question — there are real scam operators in Egypt, and we don't
        blame anyone for being cautious. AffordEgypt is operated by
        Travel2Egypt, which is registered with the Egyptian Travel Agents
        Association (ETAA), holds Commercial Registration #148004, and has
        been operating in Cairo since 2020 with 2,500+ documented travelers.
        Every guide we work with is a licensed Egyptologist with an active
        Ministry of Tourism credential. You can verify our registration with
        ETAA directly. We also publish our prices, our inclusions, and our
        cancellation terms before you pay anything.
      </>
    ),
  },
  {
    id: 3,
    question: "Are your guides actually licensed Egyptologists?",
    answer: (
      <>
        Yes — every guide we send is licensed by the Egyptian Ministry of
        Tourism and Antiquities and carries a current Egyptologist credential.
        This isn't a small thing: unlicensed guides can't take you past the
        front gates of major sites, and many cheaper operators send them
        anyway. Our guides are the same roster Travel2Egypt uses for premium
        tours.
      </>
    ),
  },
  {
    id: 4,
    question: "What's your cancellation policy?",
    // TODO: Islam to fill this in. Industry-standard is: free cancellation
    // up to 14 or 30 days out, partial refund 7–14 days out, no refund
    // inside 7 days. Whatever you actually do — write it here clearly.
    // Hiding the cancellation policy is a major conversion blocker.
    answer: (
      <>
        <em>
          Our cancellation policy is being finalised. For now, please contact
          us on WhatsApp and we'll confirm the exact terms in writing before
          you commit. Industry standard is free cancellation up to 14 days out
          — we won't be more restrictive than that.
        </em>
      </>
    ),
  },
  {
    id: 5,
    question: "Do I need a visa to enter Egypt?",
    answer: (
      <>
        Most travelers can obtain an e-Visa online before arrival or purchase
        one on arrival at major airports. We'll guide you through the process
        after booking. Some nationalities require pre-approval — check with
        your local embassy or ask us.
      </>
    ),
  },
  {
    id: 6,
    question: "When is the best time to visit Egypt?",
    answer: (
      <>
        October through April is the comfortable season — daytime
        temperatures around 20–28°C across most of the country, with mild
        evenings. November to February is peak season for Cairo and Luxor
        (book early). May to September is hot, especially in Upper Egypt —
        manageable if you start sightseeing at sunrise and rest mid-day, and
        often the cheapest time to travel.
      </>
    ),
  },
  {
    id: 7,
    question: "What's the absolute minimum I could pay for a private Egypt trip?",
    answer: (
      <>
        Our floor is <strong>$[X]/day</strong> for a private car + licensed
        Egyptologist in Cairo, before tickets, meals, and hotel. A typical
        3-day Cairo trip with all entrance tickets and one meal per day works
        out to around <strong>$[Y] per person for a couple</strong>. We'll
        send you a real quote in under a minute — no account, no commitment.
      </>
    ),
  },
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    // id="faq" is the scroll target the navbar/footer FAQs links use.
    <section id="faq" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Honest answers to the questions budget travelers actually ask.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <Card key={faq.id} className="border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  )}
                </div>
              </button>

              {openItems.includes(faq.id) && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-100 pt-4 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/201100765283"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Message us on WhatsApp
            </a>
            <a
              href="mailto:info@affordegypt.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
