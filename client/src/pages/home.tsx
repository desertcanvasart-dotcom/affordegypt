import SeoMeta from "@/components/seo-meta";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CredentialsStrip from "@/components/credentials-strip";
import FounderBlock from "@/components/founder-block";
import InclusionsComparison from "@/components/inclusions-comparison";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import FAQSection from "@/components/faq-section";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";

const HOMEPAGE_FAQS: { question: string; answer: string }[] = [
  {
    question: "Why are you cheaper than other private Egypt tours?",
    answer:
      "Because we don't pad the price with things you didn't ask for. Most Egypt tour packages bundle hotels, meals, tickets, and concierge service into a single number — even if you'd rather choose those yourself. AffordEgypt charges only for the operational core: a private car, a licensed Egyptologist, and a transparent base price. You add what you need. Same operations as Travel2Egypt's premium tier, with the markup and the inclusions you didn't choose stripped out.",
  },
  {
    question: "How do I know AffordEgypt isn't one of the scam operators I've read about?",
    answer:
      "Fair question. AffordEgypt is operated by Travel2Egypt, which is registered with the Egyptian Travel Agents Association (ETAA), holds Commercial Registration #148004, and has been operating in Cairo since 2020 with 2,500+ documented travelers. Every guide we work with is a licensed Egyptologist with an active Ministry of Tourism credential. You can verify our registration with ETAA directly. We publish our prices, inclusions, and cancellation terms before you pay anything.",
  },
  {
    question: "Are your guides actually licensed Egyptologists?",
    answer:
      "Yes — every guide we send is licensed by the Egyptian Ministry of Tourism and Antiquities and carries a current Egyptologist credential. Unlicensed guides can't take you past the front gates of major sites, and many cheaper operators send them anyway. Our guides are the same roster Travel2Egypt uses for premium tours.",
  },
  {
    question: "What's your cancellation policy?",
    answer:
      "Our cancellation policy is being finalised. For now, please contact us on WhatsApp and we'll confirm the exact terms in writing before you commit. Industry standard is free cancellation up to 14 days out — we won't be more restrictive than that.",
  },
  {
    question: "Do I need a visa to enter Egypt?",
    answer:
      "Most travelers can obtain an e-Visa online before arrival or purchase one on arrival at major airports. We'll guide you through the process after booking. Some nationalities require pre-approval — check with your local embassy or ask us.",
  },
  {
    question: "When is the best time to visit Egypt?",
    answer:
      "October through April is the comfortable season — daytime temperatures around 20–28°C across most of the country, with mild evenings. November to February is peak season for Cairo and Luxor (book early). May to September is hot, especially in Upper Egypt — manageable if you start sightseeing at sunrise and rest mid-day, and often the cheapest time to travel.",
  },
  {
    question: "What's the absolute minimum I could pay for a private Egypt trip?",
    answer:
      "Our floor is LE 5,000/day for a private car + licensed Egyptologist in Cairo, before tickets, meals, and hotel. We'll send you a real quote in under a minute — no account, no commitment.",
  },
];

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AffordEgypt",
  alternateName: "Afford Egypt",
  url: "https://affordegypt.com",
  logo: "https://affordegypt.com/logo.png",
  description:
    "The transparent budget tier of Travel2Egypt, a Cairo-based ETAA-licensed tour operator since 2020.",
  parentOrganization: {
    "@type": "Organization",
    name: "Travel2Egypt",
  },
  sameAs: [
    "https://www.facebook.com/affordegypt/",
    "https://www.instagram.com/affordegypt/",
    "https://www.youtube.com/@affordegypt",
  ],
};

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: "AffordEgypt",
  image: "https://affordegypt.com/og-default.jpg",
  url: "https://affordegypt.com",
  telephone: "+20 110 0765283",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cairo",
    addressCountry: "EG",
  },
  areaServed: [
    "Cairo",
    "Giza",
    "Luxor",
    "Aswan",
    "Alexandria",
    "Hurghada",
    "Sharm El Sheikh",
    "Siwa",
    "Egypt",
  ],
  knowsAbout: [
    "Egypt tours",
    "Egyptology",
    "Egyptian travel",
    "Nile cruises",
    "Pyramid tours",
  ],
  identifier: [
    { "@type": "PropertyValue", name: "ETAA Member", value: "Travel2Egypt" },
    { "@type": "PropertyValue", name: "Commercial Registration", value: "148004" },
    { "@type": "PropertyValue", name: "Tax ID", value: "597-702-308" },
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        title="Egypt Tours from a Real Egyptian Operator | AffordEgypt"
        description="Private car + licensed Egyptologist from LE 5,000/day. Operated by Travel2Egypt, ETAA-licensed since 2020. Transparent prices, no hidden fees, no online payment required — pay 10% deposit, balance on arrival."
        canonical="https://affordegypt.com/"
        schema={[ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA, FAQ_SCHEMA]}
      />
      <Navbar />
      <Hero />
      <CredentialsStrip />
      <FounderBlock />
      <InclusionsComparison />
      <MultiCityPricingTool />
      <AnimatedReviewCarousel />
      <BlogGrid />
      <FAQSection />
      <NewsletterSection />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}
