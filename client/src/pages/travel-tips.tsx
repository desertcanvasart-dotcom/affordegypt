import SeoMeta from "@/components/seo-meta";
import { useTranslation, Trans } from "react-i18next";
import { articleSchema } from "@/lib/article-schema";
import Navbar from "@/components/navbar";
import GuideToc from "@/components/guide-toc";
import Footer from "@/components/footer";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

export default function TravelTips() {
  const { t } = useTranslation();
  return (
    <>
      <SeoMeta
        title={t("travelTips.seoTitle")}
        description={t("travelTips.seoDescription")}
        canonical="https://affordegypt.com/travel-tips"
        ogImage="https://affordegypt.com/images/giza-pyramids.jpg"
        schema={[articleSchema({
          headline: t("travelTips.seoTitle"),
          description: t("travelTips.schemaDescription"),
          canonical: "https://affordegypt.com/travel-tips",
          image: "https://affordegypt.com/images/giza-pyramids.jpg",
          datePublished: "2025-06-07",
          dateModified: "2026-08-12",
        }), breadcrumbSchema(trailFor("/travel-tips")!)]}
        ogType="article"
      />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        <PageBreadcrumbs />
        <GuideToc />
        {/* Hero Section */}
        <header
          className="min-h-[90vh] flex items-center justify-center relative bg-cover bg-center bg-fixed bg-[url('/images/beach-in-sinai.jpg')]"
        >
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white text-center">
              {t("travelTips.h1a")}
              <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
                {t("travelTips.h1b")}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance text-center">
              {t("travelTips.heroTagline")}<br/>
              {t("travelTips.heroLead")}
            </p>
            
            {/* Process Steps */}
            <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                <h4 className="font-semibold mb-2 text-green-primary">{t("travelTips.step1")}</h4>
                <p className="text-sm text-white/80">{t("travelTips.step1Body")}</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                <h4 className="font-semibold mb-2 text-green-primary">{t("travelTips.step2")}</h4>
                <p className="text-sm text-white/80">{t("travelTips.step2Body")}</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                <h4 className="font-semibold mb-2 text-green-primary">{t("travelTips.step3")}</h4>
                <p className="text-sm text-white/80">{t("travelTips.step3Body")}</p>
              </div>
            </div>
            
            <a href="#itinerary" className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1">
              {t("travelTips.ctaItinerary")}
            </a>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          
          {/* Introduction */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              {t("travelTips.whyTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              {t("travelTips.whyP1")}
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-6">
              <p className="mb-0">
                <strong className="text-gray-800">{t("travelTips.headsUpL")}</strong> {t("travelTips.headsUp")}
              </p>
            </div>
            <p className="text-lg leading-relaxed">
              {t("travelTips.whyP2")}
            </p>
          </section>

          {/* Best Times to Visit */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                {t("travelTips.bestTimesTitle")}
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                {t("travelTips.bestTimesLead")}
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                  <div className="text-2xl text-primary mb-4">🌿</div>
                  <h4 className="text-xl font-semibold mb-2">{t("travelTips.seasonA")}</h4>
                  <p><strong>{t("travelTips.seasonADates")}</strong> {t("travelTips.seasonABody")}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                  <div className="text-2xl text-primary mb-4">☀️</div>
                  <h4 className="text-xl font-semibold mb-2">{t("travelTips.seasonB")}</h4>
                  <p><strong>{t("travelTips.seasonBDates")}</strong> {t("travelTips.seasonBBody")}</p>
                </div>
              </div>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">{t("travelTips.quickTipL")}</strong> {t("travelTips.quickTip")}
                </p>
              </div>
            </div>
          </section>

          {/* Pre-Travel Checklist */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              {t("travelTips.checklistTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              {t("travelTips.checklistLead")}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">📖</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.visaTitle")}</h4>
                <p>{t("travelTips.visaBody")} <strong>{t("travelTips.visaStrong")}</strong> {t("travelTips.visaBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🛡️</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.insuranceTitle")}</h4>
                <p>{t("travelTips.insuranceBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💉</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.healthTitle")}</h4>
                <p>{t("travelTips.healthBody")}</p>
              </div>
            </div>
          </section>

          {/* Budget Section */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                {t("travelTips.budgetTitle")}
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                {t("travelTips.budgetLead")}
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-8">
                <p className="mb-0">
                  <strong className="text-gray-800">{t("travelTips.figuresL")}</strong> {t("travelTips.figures")}
                </p>
              </div>

              <h3 className="text-2xl font-semibold mb-4">{t("travelTips.dailyBudget")}</h3>
              <p className="text-lg leading-relaxed mb-6">
                {/* Trans: the emphasised figure sits mid-sentence, and each
                    language puts it in a different place. */}
                <Trans i18nKey="travelTips.dailyBudgetBody" components={{ b: <strong /> }} />
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-8">
                <p className="mb-0">
                  <strong className="text-gray-800">{t("travelTips.tripCostL")}</strong> {t("travelTips.tripCost")}
                </p>
              </div>

              <h3 className="text-2xl font-semibold mb-4">{t("travelTips.hacksTitle")}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.hack1L")}</strong> {t("travelTips.hack1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.hack2L")}</strong> {t("travelTips.hack2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.hack3L")}</strong> {t("travelTips.hack3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.hack4L")}</strong> {t("travelTips.hack4")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.hack5L")}</strong> {t("travelTips.hack5")}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Accommodation */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              {t("travelTips.stayTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              {t("travelTips.stayLead")}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.hostels")}</h4>
                <p>{t("travelTips.hostelsBody")} <strong>{t("travelTips.hostelsStrong")}</strong> {t("travelTips.hostelsBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.hotels")}</h4>
                <p>{t("travelTips.hotelsBody")} <strong>{t("travelTips.hotelsStrong")}</strong> {t("travelTips.hotelsBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.nubian")}</h4>
                <p>{t("travelTips.nubianBody")}</p>
              </div>
            </div>
          </section>

          {/* Food */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                {t("travelTips.eatTitle")}
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                {t("travelTips.eatLead")}
              </p>
              <h4 className="text-xl font-semibold mb-4">{t("travelTips.eatsTitle")}</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.food1L")}</strong> {t("travelTips.food1")} <strong>{t("travelTips.food1C")}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.food2L")}</strong> {t("travelTips.food2")} <strong>{t("travelTips.food2C")}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.food3L")}</strong> {t("travelTips.food3")} <strong>{t("travelTips.food3C")}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.food4L")}</strong> {t("travelTips.food4")} <strong>{t("travelTips.food4C")}</strong></span>
                </li>
              </ul>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">{t("travelTips.selfCateringL")}</strong> {t("travelTips.selfCatering")}
                </p>
              </div>
            </div>
          </section>

          {/* Transportation */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              {t("travelTips.moveTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              {t("travelTips.moveLead")}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚂</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.trains")}</h4>
                <p>{t("travelTips.trainsBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚌</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.buses")}</h4>
                <p>{t("travelTips.busesBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚇</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.localTransport")}</h4>
                <p><Trans i18nKey="travelTips.localTransportBody" components={{ b: <strong /> }} /></p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚐</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.microbuses")}</h4>
                <p>{t("travelTips.microBody")}</p>
              </div>
            </div>
          </section>

          {/* Attractions */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                {t("travelTips.wondersTitle")}
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                {t("travelTips.wondersLead")}
              </p>

              <h3 className="text-2xl font-semibold mb-4">{t("travelTips.freeTitle")}</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.free1L")}</strong> {t("travelTips.free1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.free2L")}</strong> {t("travelTips.free2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.free3L")}</strong> {t("travelTips.free3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>{t("travelTips.free4L")}</strong> {t("travelTips.free4")}</span>
                </li>
              </ul>

              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg" id="itinerary">
                <h3 className="text-2xl font-semibold mb-4">{t("travelTips.itinTitle")}</h3>
                <p className="mb-4">{t("travelTips.itinLead")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>{t("travelTips.itin1L")}</strong> {t("travelTips.itin1")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>{t("travelTips.itin2L")}</strong> {t("travelTips.itin2")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>{t("travelTips.itin3L")}</strong> {t("travelTips.itin3")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>{t("travelTips.itin4L")}</strong> {t("travelTips.itin4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Safety */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              {t("travelTips.safeTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              {t("travelTips.safeLead")}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">👗</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.customs")}</h4>
                <p>{t("travelTips.customsBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💵</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.tipping")}</h4>
                <p>{t("travelTips.tippingBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💡</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.safety")}</h4>
                <p>{t("travelTips.safetyBody")}</p>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6 inline-block">
              {t("travelTips.ctaTitle")}
            </h2>
            <p className="text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
              {t("travelTips.ctaBody")}
            </p>
            <a href="#" onClick={() => window.scrollTo(0, 0)} className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1">
              {t("travelTips.backToTop")}
            </a>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}