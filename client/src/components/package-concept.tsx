import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PackageConcept() {
  const { t } = useTranslation();
  return (
    <div className="mb-8 flex items-start gap-4 rounded-xl border border-teal-200 bg-white p-5 sm:p-6">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800"
        aria-hidden="true"
      >
        <Wallet className="h-5 w-5" />
      </span>
      <div className="max-w-3xl">
        <h3 className="text-xl sm:text-2xl font-semibold text-teal-900">
          {t("packages.walletTitle")}
        </h3>
        <p className="mt-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
          {t("packages.walletPromise")}
        </p>
      </div>
    </div>
  );
}
