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
    answer: (
      <>
        Free cancellation up to 3 days before your trip starts — you get the
        full deposit back. Inside 3 days, the deposit is non-refundable
        because we've already committed your guide and vehicle for those
        days. Anything paid beyond the deposit is refunded in full. If we
        have to cancel for any reason on our end (vehicle issue, guide
        illness, force majeure), we refund 100%, including the deposit, and
        help you rebook.
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
        Our floor is <strong>LE 5,000/day</strong> for a private car +
        licensed Egyptologist in Cairo, before tickets, meals, and hotel.
        We'll send you a real quote in under a minute — no account, no
        commitment. Note: we don't sell shared minibus tours. Some operators
        advertise "Egypt tours from $50/day" — those are shared group tours,
        a different product. Ours is fully private.
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
