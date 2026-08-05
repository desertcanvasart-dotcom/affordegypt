import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import { articleSchema } from "@/lib/article-schema";
import Navbar from "@/components/navbar";
import GuideToc from "@/components/guide-toc";
import Footer from "@/components/footer";

export default function TravelTips() {
  const { t } = useTranslation();
  return (
    <>
      <SeoMeta
        title={t("travelTips.seoTitle")}
        description={t("travelTips.seoDescription")}
        canonical="https://affordegypt.com/travel-tips"
        ogImage="https://affordegypt.com/images/giza-pyramids.jpg"
        schema={articleSchema({
          headline: "Egypt Travel Tips | What Locals Wish You Knew",
          description:
            "Practical Egypt travel tips from a Cairo-based licensed operator. Tipping, safety, scams to avoid, dress code, currency, transport, and what guidebooks usually get wrong.",
          canonical: "https://affordegypt.com/travel-tips",
          image: "https://affordegypt.com/images/giza-pyramids.jpg",
          datePublished: "2025-06-07",
          dateModified: "2026-08-04",
        })}
        ogType="article"
      />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        <GuideToc />
        {/* Hero Section */}
        <header
          className="min-h-[90vh] flex items-center justify-center relative bg-cover bg-center bg-fixed bg-[url('/images/beach-in-sinai.jpg')]"
        >
          <div className="absolute inset-0 bg-black/50 pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
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
                <p className="text-sm text-white/80">Visas, timing, and essential checklists.</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                <h4 className="font-semibold mb-2 text-green-primary">{t("travelTips.step2")}</h4>
                <p className="text-sm text-white/80">Master your spending and find great deals.</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                <h4 className="font-semibold mb-2 text-green-primary">{t("travelTips.step3")}</h4>
                <p className="text-sm text-white/80">Navigate like a local and see the best sights.</p>
              </div>
            </div>
            
            <a href="#itinerary" className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1">
              See Sample Itinerary ↓
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
                <strong className="text-gray-800">Heads Up:</strong> Don't assume every price tag is a steal. Inflation, currency shifts, and dual pricing (locals vs. tourists) can sometimes throw a curveball. A little vigilance goes a long way—think of it like bargaining in a souk: you don't need to haggle hard, just be informed and savvy with your spending.
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
                  <p><strong>(Mar–May & Sep–Nov)</strong> The perfect mix of decent weather, manageable crowds, and affordable prices. Airlines and hotels are often more generous with their deals. This is the best value for money.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                  <div className="text-2xl text-primary mb-4">☀️</div>
                  <h4 className="text-xl font-semibold mb-2">{t("travelTips.seasonB")}</h4>
                  <p><strong>(Jun–Aug)</strong> If you don't mind serious heat, this could be your budget jackpot. Tailor your itinerary wisely with coastal time in Alexandria or Dahab. You'll find some of the lowest prices of the year.</p>
                </div>
              </div>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">Quick Tip:</strong> Winter (Dec–Feb) has gorgeous weather but comes with a heavier price tag as it's peak tourist season. If your budget is tight, aim for the shoulder seasons.
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
                <h4 className="text-xl font-semibold mb-2">1. Passport & Visa</h4>
                <p>{t("travelTips.visaBody")} <strong>{t("travelTips.visaStrong")}</strong> {t("travelTips.visaBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🛡️</div>
                <h4 className="text-xl font-semibold mb-2">2. Travel Insurance</h4>
                <p>{t("travelTips.insuranceBody")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💉</div>
                <h4 className="text-xl font-semibold mb-2">3. Health & Vaccinations</h4>
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
                Let's talk numbers. A smart budget is your best travel companion. We'll use an estimated rate of <strong>1 USD = 49.6 EGP</strong>, but always check current rates.
              </p>

              <h3 className="text-2xl font-semibold mb-4">{t("travelTips.dailyBudget")}</h3>
              <p className="text-lg leading-relaxed mb-6">
                Most budget travelers in Egypt will find themselves spending somewhere between <strong>1,250 and 2,000 EGP a day.</strong> This sweet spot covers a hostel or budget hotel, local meals, public transport, and entrance fees to a major attraction or two.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-8">
                <p className="mb-0">
                  <strong className="text-gray-800">Total Trip Cost (7-10 Days):</strong> Expect to spend around <strong>20,000–27,500 EGP</strong> including flights from Europe/Asia. Flights from the U.S. or Australia will increase this total. Your flight will likely be your biggest single expense.
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
                  <span><strong>Shawarma:</strong> Juicy, garlicky, and craveable chicken or beef wraps. <strong>Cost: ~ 37 EGP.</strong></span>
                </li>
              </ul>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">Self-Catering Tip:</strong> Shopping at local markets is an adventure. A dozen eggs costs ~35 EGP, a loaf of bread is ~14 EGP, and fresh produce is incredibly cheap. This is a great way to save on breakfasts and lunches.
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
                <p>{t("travelTips.trainsBody")} <strong>{t("travelTips.trainsStrong")}</strong>. {t("travelTips.trainsBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚌</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.buses")}</h4>
                <p>{t("travelTips.busesBody")} <strong>{t("travelTips.busesStrong")}</strong>. {t("travelTips.busesBody2")}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚇</div>
                <h4 className="text-xl font-semibold mb-2">{t("travelTips.localTransport")}</h4>
                <p>In Cairo, the <strong>Metro</strong> is your best friend. For taxis, use ride-hailing apps like <strong>Uber or Careem</strong> to get fair, transparent pricing and avoid haggling.</p>
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
                Entrance fees can add up, but with smart planning, you can see the icons without emptying your wallet.
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
                <p className="mb-4">This classic "Golden Triangle" route maximizes sights and minimizes costs.</p>
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
                    <span><strong>Days 9-10:</strong> Return to Cairo for departure or extend your trip to Alexandria or the Red Sea.</span>
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
              Back to Top ↑
            </a>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}