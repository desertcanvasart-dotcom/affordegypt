// Three-column "what's included / what's not / what Capital Travel Service adds"
// section. Trust grenade in a market built on opacity: pre-frames
// Capital Travel Service as an honest upgrade rather than a hidden parent brand.

import { Check, X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function InclusionsComparison() {
  const { t } = useTranslation();

  // The three lists are content, so they live in the locale files; the icon
  // and styling of each column stay here.
  const columns = [
    {
      key: "included",
      title: t("inclusions.includedTitle"),
      items: t("inclusions.included", { returnObjects: true }) as string[],
      card: "bg-white border-primary/30",
      headIcon: <Check className="w-5 h-5 text-primary" />,
      rowIcon: <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />,
    },
    {
      key: "notIncluded",
      title: t("inclusions.notIncludedTitle"),
      items: t("inclusions.notIncluded", { returnObjects: true }) as string[],
      card: "bg-white border-gray-200",
      headIcon: <X className="w-5 h-5 text-gray-500" />,
      rowIcon: <X className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />,
    },
    {
      key: "premium",
      title: t("inclusions.premiumTitle"),
      items: t("inclusions.premium", { returnObjects: true }) as string[],
      card: "bg-gradient-to-br from-amber-50 to-white border-amber-200",
      headIcon: <Sparkles className="w-5 h-5 text-amber-600" />,
      rowIcon: <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />,
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t("inclusions.heading")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("inclusions.subheading")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`rounded-2xl p-6 border-2 shadow-sm ${column.card}`}
            >
              <div className="flex items-center gap-2 mb-4">
                {column.headIcon}
                <h3 className="text-lg font-bold text-gray-900">{column.title}</h3>
              </div>
              <ul className="space-y-3">
                {column.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    {column.rowIcon}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
