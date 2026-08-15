import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatLE } from "@/lib/service-pricing";

export interface HomepageFaq {
  question: string;
  answer: string;
  /** Phrases in `answer` to render as external links. The answer itself stays
   *  a plain string because home.tsx builds the FAQPage JSON-LD from it —
   *  these decorate the on-screen rendering only. */
  links?: { text: string; href: string }[];
}

/**
 * Order lives here, not in the locale files: it is structure, and repeating it
 * four times is four chances for the questions to appear in a different order
 * per language.
 */
const FAQ_IDS = [
  "cheaper", "scam", "licensed", "payment", "cancellation", "customize",
  "minimum", "ticketFee", "buyTickets", "feePerTicket", "skipQueue", "visa", "bestTime",
] as const;

/**
 * Link targets by id, zipped against `linkTexts` from the locale file by
 * index. URLs are not copy — keeping them out of the translations means they
 * cannot drift between languages.
 */
const FAQ_LINK_HREFS: Partial<Record<(typeof FAQ_IDS)[number], string[]>> = {
  scam: ["https://www.etaa-egypt.org/SitePages/CompanyDetailsEn.aspx?licc=2179"],
  ticketFee: [
    "https://egymonuments.com/aboutUs",
    "https://sis.gov.eg/en/media-center/news/e-tickets-the-new-way-to-explore-egypt-s-past/",
  ],
};

/**
 * A factory, not a module constant: the copy is translated, so it can only be
 * built once i18next is available and must be rebuilt when the visitor
 * switches language. home.tsx calls this too, to build the FAQPage JSON-LD
 * from exactly the text on screen.
 *
 * The floor price is interpolated WITHOUT its unit — `formatLE`, not
 * `formatLEPerDay` — so each language supplies its own "/day", "/día",
 * "/jour", "/Tag". It still comes from the build-time pricing snapshot, so the
 * FAQ cannot quote a rate the pricing engine no longer charges.
 */
export function buildHomepageFaqs(
  t: (key: string, opts?: Record<string, unknown>) => any,
): HomepageFaq[] {
  const floor = formatLE("cairo-guide-car");
  return FAQ_IDS.map((id) => {
    const answer = t(`faq.items.${id}.answer`, { floor });
    const texts = (t(`faq.items.${id}.linkTexts`, { returnObjects: true, defaultValue: [] }) ??
      []) as string[];
    const hrefs = FAQ_LINK_HREFS[id] ?? [];
    return {
      question: t(`faq.items.${id}.question`),
      answer,
      links: Array.isArray(texts)
        ? texts.flatMap((text, i) => (hrefs[i] ? [{ text, href: hrefs[i] }] : []))
        : undefined,
    };
  });
}

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
  const { t, i18n } = useTranslation();
  const faqs = useMemo(() => buildHomepageFaqs(t), [t, i18n.language]);
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
            {t("faq.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
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
          <p className="text-gray-600 mb-4">{t("faq.stillQuestions")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/201100765283"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {t("faq.whatsapp")}
            </a>
            <a
              href="mailto:hello@affordegypt.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              {t("faq.email")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
