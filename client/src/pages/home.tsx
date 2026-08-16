import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
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
import { formatLE } from "@/lib/service-pricing";
import { OPERATOR } from "@shared/operator-facts";

/**
 * The two static schemas.
 *
 * The operator's legal name, licence number and founding year were retyped
 * here — three facts that shared/operator-facts.ts exists to hold exactly once,
 * and which this file was already importing for the postal address. The
 * founding year appeared twice more as a literal "2003". They are read from
 * OPERATOR now, so the structured data cannot disagree with the footer.
 *
 * Names are deliberately NOT translated. `name`, `alternateName`,
 * `parentOrganization` and every entry of `areaServed` are identifiers: a
 * German reader searching for the company still searches for "Capital Travel
 * Service", and Google matches the ETAA licence against the same string
 * everywhere. Only the prose — the description and the knowsAbout topics —
 * follows the page language, which is why this takes `t`.
 */
const YEAR = String(OPERATOR.licensedSince);

function organizationSchema(t: TFunction) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AffordEgypt",
    alternateName: "Afford Egypt",
    url: "https://affordegypt.com",
    logo: "https://affordegypt.com/logo.png",
    description: t("home.schemaDescription", {
      operator: OPERATOR.legalName,
      licence: OPERATOR.etaaLicence,
      year: YEAR,
    }),
    foundingDate: YEAR,
    parentOrganization: {
      "@type": "Organization",
      name: OPERATOR.legalName,
    },
    sameAs: [
      "https://www.facebook.com/affordegypt/",
      "https://www.instagram.com/affordegypt/",
      "https://www.youtube.com/@affordegypt",
    ],
  };
}

function localBusinessSchema(t: TFunction) {
  const knowsAbout = t("home.knowsAbout", { returnObjects: true });
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "AffordEgypt",
    image: "https://affordegypt.com/og-default.jpg",
    url: "https://affordegypt.com",
    telephone: "+20 110 0765283",
    priceRange: "$$",
    foundingDate: YEAR,
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
    knowsAbout: Array.isArray(knowsAbout) ? knowsAbout : [],
    identifier: [
      {
        "@type": "PropertyValue",
        // A PropertyValue name is the machine-readable label of an identifier,
        // never rendered to a visitor. It was invisible to the guard before
        // only because it shared a line with "@type".
        name: "ETAA Member", // i18n-exempt: structured-data property label
        value: `${OPERATOR.legalName} — ${OPERATOR.etaaLicence}`,
      },
    ],
  };
}

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

  // Same reason, now that these two carry translated prose as well.
  const schemas = useMemo(
    () => [organizationSchema(t), localBusinessSchema(t), faqSchema],
    [t, i18n.language, faqSchema],
  );

  return (
    <div className="min-h-screen bg-background">
      <SeoMeta
        title={t("home.seoTitle")}
        // formatLE, not formatLEPerDay: that helper appends a hardcoded
        // English "/day", which left "LE 5,450/day" sitting inside the German
        // sentence. Each locale supplies its own unit, the same way
        // buildHomepageFaqs already does with the FAQ floor price.
        description={t("home.seoDescription", {
          price: formatLE("cairo-guide-car"),
          year: YEAR,
        })}
        canonical="https://affordegypt.com/"
        schema={schemas}
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
