// Single-line trust strip directly under the hero. Replaces the generic
// stat row (4.9/5 / 2,500+ / Verified Guides / All Egypt) — those numbers
// don't do as much trust work as the registered-operator framing here.
//
// Figures come from shared/operator-facts so this strip, the review page and
// the transactional emails can't disagree, which they previously did
// (2,500+ here vs 2,000+ there).
import { useTranslation } from "react-i18next";
import { OPERATOR, TRAVELLERS_SERVED } from "@shared/operator-facts";

export default function CredentialsStrip() {
  const { t } = useTranslation();
  return (
    <section className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">
            {t("chrome.operatedBy", { operator: OPERATOR.legalName })}
          </span>
          <span className="mx-2 text-gray-400">·</span>
          {OPERATOR.etaaLicence}
          <span className="mx-2 text-gray-400">·</span>
          {t("chrome.licensedSince", { year: OPERATOR.licensedSince })}
          <span className="mx-2 text-gray-400">·</span>
          {/* `travellers`, not `count`: count is reserved by i18next for plural
              selection and must be a number, and this figure is "2,000+". */}
          {t("chrome.travellersServed", { travellers: TRAVELLERS_SERVED })}
        </p>
      </div>
    </section>
  );
}
