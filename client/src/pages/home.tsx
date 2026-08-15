import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SeoMeta from "@/components/seo-meta";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import CredentialsStrip from "@/components/credentials-strip";
import FounderBlock from "@/components/founder-block";
import InclusionsComparison from "@/components/inclusions-comparison";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";
import AnimatedReviewCarousel from "@/components/animated-review-carousel";
import BlogGrid from "@/components/blog-grid";
import FAQSection, { buildHomepageFaqs } from "@/components/faq-section";
import NewsletterSection from "@/components/newsletter-section";
import Footer from "@/components/footer";
import MobileStickyCTA from "@/components/mobile-sticky-cta";
import { formatLEPerDay } from "@/lib/service-pricing";
import { OPERATOR } from "@shared/operator-facts";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AffordEgypt",
  alternateName: "Afford Egypt",
  url: "https://affordegypt.com",
  logo: "https://affordegypt.com/logo.png",
  description:
    "The transparent budget tier of Capital Travel Service, a Cairo-based ETAA-licensed tour operator (ETAA 2179) since 2003.",
  foundingDate: "2003",
  parentOrganization: {
    "@type": "Organization",
    name: "Capital Travel Service",
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
    streetAddress: OPERATOR.address.street,
    addressLocality: OPERATOR.address.locality,
    addressRegion: OPERATOR.address.region,
    addressCountry: OPERATOR.address.country,
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
    { "@type": "PropertyValue", name: "ETAA Member", value: "Capital Travel Service — ETAA 2179" },
  ],
};

export default function Home() {
  const { t, i18n } = useTranslation();

  // Built in-component, not at module scope: the FAQ copy is translated, so it
  // does not exist until i18next is ready. Same source as the visible list, so
  // the structured data and the page can never drift apart.
  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: buildHomepageFaqs(t).map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    }),
    [t, i18n.language],
  );

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        title="Egypt Tours from a Real Egyptian Operator | AffordEgypt"
        description={`Private car + licensed Egyptologist in Egypt from ${formatLEPerDay("cairo-guide-car")}. Real prices, no markup, no bundling. ETAA-licensed operator since 2003. Quote in 60 seconds.`}
        canonical="https://affordegypt.com/"
        schema={[ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA, faqSchema]}
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
