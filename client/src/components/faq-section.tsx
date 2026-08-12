import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatLEPerDay } from "@/lib/service-pricing";

// Cairo guide + full-day private car — the cheapest guide+car day we sell, and
// the number this copy calls "our floor". Read from the build-time pricing
// snapshot so the FAQ (and the FAQPage schema built from it) cannot quote a
// rate the pricing engine no longer charges.
const FLOOR_PER_DAY = formatLEPerDay("cairo-guide-car");

export interface HomepageFaq {
  question: string;
  answer: string;
  /** Phrases in `answer` to render as external links. The answer itself stays
   *  a plain string because home.tsx builds the FAQPage JSON-LD from it —
   *  these decorate the on-screen rendering only. */
  links?: { text: string; href: string }[];
}

// Source-of-truth FAQ copy. Imported by client/src/pages/home.tsx to build
// the FAQPage JSON-LD schema, so visible content and structured data can
// never drift apart.
export const HOMEPAGE_FAQS: HomepageFaq[] = [
  {
    question: "Why are you cheaper than other private Egypt tours?",
    answer:
      `Because we don't pad the price with things you didn't ask for. Most Egypt tour packages bundle hotels, meals, tickets, and concierge service into a single number — even if you'd rather choose those yourself. AffordEgypt charges only for the operational core: a private car, a licensed Egyptologist, and a transparent base price from ${FLOOR_PER_DAY}. You add tickets, meals, and experiences only when you want them. Same operations as Capital Travel Service's premium tier, with the markup and the inclusions you didn't choose stripped out.`,
  },
  {
    question: "How do I know AffordEgypt isn't one of the scam operators I've read about?",
    answer:
      "Fair question — there are real scam operators in Egypt, and we don't blame anyone for being cautious. AffordEgypt is operated by Capital Travel Service, which is registered with the Egyptian Travel Agents Association (ETAA 2179) and has been operating in Cairo since 2003 with thousands of documented travelers. Every guide we work with is a licensed Egyptologist with an active Ministry of Tourism credential. You can verify our registration with ETAA directly. We also publish our prices, our inclusions, and our cancellation terms before you pay anything.",
    links: [
      {
        text: "Egyptian Travel Agents Association (ETAA 2179)",
        href: "https://www.etaa-egypt.org/SitePages/CompanyDetailsEn.aspx?licc=2179",
      },
    ],
  },
  {
    question: "Are your guides actually licensed Egyptologists?",
    answer:
      "Yes — every guide we send is licensed by the Egyptian Ministry of Tourism and Antiquities and carries a current Egyptologist credential. This isn't a small thing: unlicensed guides can't legally take you past the front gates of major sites, and many cheaper operators send them anyway. Our guides are the same roster Capital Travel Service uses for premium tours — they just deliver the lighter inclusions tier when working under AffordEgypt.",
  },
  {
    question: "How does payment work? Do I have to pay everything up front?",
    answer:
      "No — that's part of the point. You pay a 10% deposit when you book (we send you a payment link, usually via Tab.travel, that works with any major card). Your booking is confirmed once the deposit clears. The remaining 90% is paid on arrival in cash (we accept EGP, USD, EUR, or GBP), via a second payment link, or by card through our mobile reader. Whatever's easiest for you.",
  },
  {
    question: "What's your cancellation policy?",
    answer:
      "Free cancellation up to 48 hours before your trip starts — you get the full deposit back. Inside 48 hours, the deposit is non-refundable because we've already committed your guide and vehicle for those days. Anything paid beyond the deposit is refunded in full. If we have to cancel for any reason on our end (vehicle issue, guide illness, force majeure), we refund 100%, including the deposit, and help you rebook.",
  },
  {
    question: "Can I customize my itinerary?",
    answer:
      "Yes. Our entire model is modular — pick destinations, pick how many days in each, pick which attractions to include, add a guide for some days but not others, choose vehicle size by group. The pricing tool builds it live. If you want something the tool doesn't show, message us on WhatsApp and we'll quote it manually.",
  },
  {
    question: "What's the absolute minimum I could pay for a private Egypt trip?",
    answer:
      `Our floor is ${FLOOR_PER_DAY} for a private car + licensed Egyptologist in Cairo, before tickets, meals, and hotel. A typical 3-day Cairo trip with all entrance tickets and one meal per day works out to around LE 14,000–18,000 per person for a couple, depending on which attractions you include. We'll send you a real quote in under a minute — no account, no commitment. Note: we don't sell shared minibus tours. Some operators advertise \"Egypt tours from $50/day\" — those are shared group tours, a different product. Ours is fully private.`,
  },
  {
    question: "Why do you charge 50 EGP to arrange an entrance ticket?",
    answer:
      "The attraction keeps its official admission price; the additional 50 EGP is AffordEgypt's optional advance-arrangement fee for each paid ticket issued. We purchase and organize the ticket before the visit, check the booking information supplied to us, and prepare it for the tour. This can reduce time at the ticket office and avoids relying entirely on on-site card payment, which matters because many Egyptian sites are now cashless and payment or ticketing systems can occasionally experience technical problems. It does not bypass security or other entrance controls. You can see the official prices and buy directly on the Ministry's own ticket portal, and the move to e-ticketing is described in the State Information Service announcement.",
    links: [
      {
        text: "the Ministry's own ticket portal",
        href: "https://egymonuments.com/aboutUs",
      },
      {
        text: "the State Information Service announcement",
        href: "https://sis.gov.eg/en/media-center/news/e-tickets-the-new-way-to-explore-egypt-s-past/",
      },
    ],
  },
  {
    question: "Can I buy the entrance tickets myself?",
    answer:
      "Yes. The service is optional. You may buy tickets through the attraction's official booking channel or an approved on-site sales point where available. If you ask us to arrange them, your quote will show the official admission amount and our 50 EGP fee separately — we never fold the two together and call it the entrance fee.",
  },
  {
    question: "Is the 50 EGP ticket fee charged once per booking?",
    answer:
      "No. It is charged per paid admission ticket issued. Two visitors ordering admission to four attractions require eight tickets, so the service fee is 8 x 50 EGP = 400 EGP. Student or reduced-price tickets need valid supporting identification accepted by the attraction; without it the venue may require a full-price ticket.",
  },
  {
    question: "Does an advance ticket mean we skip every queue?",
    answer:
      "No. It can reduce or avoid the ticket-purchase queue. Security screening, ticket validation, identification checks, timed-entry controls, capacity restrictions, and other venue queues may still apply. Ticket changes, cancellations and refunds also remain subject to the attraction's own rules, which we state before collecting payment.",
  },
  {
    question: "Do I need a visa to enter Egypt?",
    answer:
      "Most travelers (US, UK, EU, Canada, Australia, and most other passports) need a visa to enter Egypt. The easiest option is the Egypt e-Visa at visa2egypt.gov.eg — apply online a week before travel, costs $25 USD for single entry, and the approval comes by email. You can also get a visa on arrival at most major airports (Cairo, Hurghada, Sharm El Sheikh) for the same fee in cash USD or EUR. A few nationalities (most African, some Asian) have different rules — check Egypt's MOFA website or just message us on WhatsApp and we'll point you to the right info.",
  },
  {
    question: "When is the best time to visit Egypt?",
    answer:
      "October through April is the peak season — temperatures are pleasant (15–25°C / 60–77°F) across the whole country, including Upper Egypt (Luxor, Aswan, Abu Simbel). May through September gets very hot in Upper Egypt and the desert (40°C+ / 104°F+ is normal), though Cairo and the Mediterranean coast are still manageable. If you can travel in shoulder season (October–early November or late February–April), you get good weather with smaller crowds and better prices. We avoid sending travelers to Upper Egypt in July–August unless they specifically want the heat.",
  },
];

// Splits the plain-text answer around each linked phrase and wraps the phrase
// in an anchor. Keeps HOMEPAGE_FAQS text-only for the JSON-LD consumer.
function renderAnswer(faq: HomepageFaq) {
  if (!faq.links?.length) return faq.answer;
  let parts: (string | JSX.Element)[] = [faq.answer];
  faq.links.forEach((link, li) => {
    parts = parts.flatMap((part) => {
      if (typeof part !== "string" || !part.includes(link.text)) return [part];
      const idx = part.indexOf(link.text);
      return [
        part.slice(0, idx),
        <a
          key={`${li}-${link.href}`}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
        >
          {link.text}
        </a>,
        part.slice(idx + link.text.length),
      ];
    });
  });
  return parts;
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
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
          {HOMEPAGE_FAQS.map((faq, index) => (
            <Card key={index} className="border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  )}
                </div>
              </button>

              {openItems.includes(index) && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-100 pt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {renderAnswer(faq)}
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
              href="mailto:hello@affordegypt.com"
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
