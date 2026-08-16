import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, Home, Calculator } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <SeoMeta
        title={t('chrome.notFoundTitle')}
        description="This page doesn't exist. Head back to AffordEgypt to plan your Egypt trip with transparent pricing."
        noindex="follow"
      />
      <Navbar />
      <div className="min-h-[60vh] w-full flex items-center justify-center bg-gray-50 py-20">
        <div className="text-center px-4">
          <Compass className="w-14 h-14 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-3">
            {t('chrome.notFoundHeading')}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            This page doesn't exist — but Egypt is still out there. Head back
            home or build your trip quote in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
              <Link href="/">
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </Button>
            <Button asChild className="gap-2 w-full sm:w-auto">
              <Link href="/pricing-tool">
                <Calculator className="w-4 h-4" /> Build Your Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
