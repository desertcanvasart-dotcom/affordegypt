// Founder note from Islam. Highest-leverage piece of writing on the page —
// origin story + operator history + AffordEgypt thesis in 5 paragraphs.
// The parent operator is deliberately NOT named here: this block is a personal
// note, and the legal entity and licence number are carried by the header, the
// FAQ and the legal pages, which is where a reader goes to verify them.
// /islam-photo.jpg lives in client/public — an 800×800 stylized portrait of
// Islam (his choice of treatment). If it's ever replaced, keep it a picture
// of Islam himself — stock imagery here defeats the point of the block.
//
// The photo's wrapper div carried an aria-label repeating the img alt. ARIA
// naming does not apply to a div with no role, so it named nothing; the alt is
// the accessible name and is translated. Don't re-add it.

import { useTranslation } from "react-i18next";
import { ClientOnly } from "@/components/client-only";
import { OPERATOR } from "@shared/operator-facts";

export default function FounderBlock() {
  const { t } = useTranslation();
  return (
    <section className="bg-white py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-[260px_1fr] gap-8 items-start">
          <div className="flex md:block justify-center">
            <div
              className="w-48 h-48 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-2xl overflow-hidden bg-gray-100 ring-4 ring-primary/10"
            >
              <ClientOnly>
                <img
                  src="/islam-photo.jpg"
                  alt={t("founder.photoAlt")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: hide the broken image so the layout doesn't
                    // show a placeholder icon if the photo isn't uploaded yet.
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </ClientOnly>
            </div>
          </div>

          <div className="space-y-4 text-gray-800">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("founder.heading")}
            </h2>

            <p className="leading-relaxed">
              {t("founder.p1", { year: OPERATOR.licensedSince })}
            </p>

            <p className="leading-relaxed">{t("founder.p2")}</p>

            <p className="leading-relaxed">{t("founder.p3")}</p>

            <p className="text-lg font-semibold text-gray-900 pt-2">
              {t("founder.closing")}
            </p>

            <p className="text-gray-600 italic">{t("founder.signature")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
