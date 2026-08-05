import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MultiCityPricingTool from "@/components/multi-city-pricing-tool";

export default function PricingTool() {
  const { t } = useTranslation();
  return (
    <>
      <SeoMeta
        title={t("pricingTool.seoTitle")}
        description={t("pricingTool.seoDescription")}
        canonical="https://affordegypt.com/pricing-tool"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {t("pricingTool.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("pricingTool.subtitle")}
              </p>
            </div>
            
            <MultiCityPricingTool />
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
}