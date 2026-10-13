import PackageAccommodation from "@/components/package-accommodation";
import PackageConcept from "@/components/package-concept";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { PackageCards, usePackages } from "@/components/featured-packages";
export default function Packages() {
  const { t } = useTranslation();
  const { data = [], isLoading, isError } = usePackages();
  return (
    <>
      <SeoMeta
        title={t("packages.title")}
        description={t("packages.intro")}
        canonical="https://affordegypt.com/packages"
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-4">{t("packages.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("packages.intro")}</p>
        <PackageConcept />
        {isLoading ? (
          <p>{t("packages.loading")}</p>
        ) : isError ? (
          <p role="alert">{t("packages.unavailable")}</p>
        ) : data.length ? (
          <PackageCards packages={data} />
        ) : (
          <p>{t("packages.comingSoon")}</p>
        )}
        <PackageAccommodation />
      </main>
      <Footer />
    </>
  );
}
