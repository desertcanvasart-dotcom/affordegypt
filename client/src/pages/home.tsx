import SeoMeta from "@/components/seo-meta";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CredentialsStrip from "@/components/credentials-strip";
import FounderBlock from "@/components/founder-block";
import InclusionsComparison from "@/components/inclusions-comparison";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import FAQSection, { HOMEPAGE_FAQS } from "@/components/faq-section";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AffordEgypt",
  alternateName: "Afford Egypt",
  url: "https://affordegypt.com",
  logo: "https://affordegypt.com/logo.png",
  description:
    "The transparent budget tier of Travel2Egypt, a Cairo-based ETAA-licensed tour operator since 2003.",
  foundingDate: "2003",
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
  foundingDate: "2003",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cairo",
    addressCountry: "EG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "30.0444",
    longitude: "31.2357",
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
        description="Private car + licensed Egyptologist from LE 5,000/day. Operated by Travel2Egypt, ETAA-licensed since 2003. Transparent prices, no hidden fees, no online payment required — pay 10% deposit, balance on arrival."
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
