import { isPrerendering } from "@/lib/prerender";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { convertEGP, DISPLAY_CURRENCIES, type ExchangeRates } from "@shared/exchange-rates";
import { formatEGP } from "@/lib/utils";

export function CurrencyEstimate({ amount, showNote = false }: {
  amount: number | string | null | undefined;
  showNote?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { data, isError } = useQuery<ExchangeRates>({
    queryKey: ["/api/exchange-rates"],
    queryFn: async () => {
      const response = await fetch("/api/exchange-rates");
      if (!response.ok) throw new Error("Exchange rates unavailable");
      return response.json();
    },
    enabled: !isPrerendering(),
    staleTime: 60 * 60 * 1000,
    refetchInterval: 60 * 60 * 1000,
    retry: 1,
  });
  if (convertEGP(amount, 1) === null) return null;
  if (!data || isError) return <span className="block text-xs font-normal opacity-75">{t(isError ? "currency.unavailable" : "currency.loading")}</span>;
  const dates = Array.from(new Set(DISPLAY_CURRENCIES.map(currency => data.dates[currency])));
  const details = dates.length === 1 ? dates[0] : DISPLAY_CURRENCIES.map(currency => `${currency}: ${data.dates[currency]}`).join(" · ");
  return (
    <span className="block text-xs font-normal leading-relaxed opacity-80" title={`${t("currency.note")} ${t("currency.rateDate")} ${details} · ${data.source}`}>
      <span className="inline-flex max-w-full flex-wrap gap-x-2 gap-y-0.5">
        {DISPLAY_CURRENCIES.map(currency => (
          <span key={currency} className="whitespace-nowrap">≈ {new Intl.NumberFormat(i18n.resolvedLanguage || "en", {
            style: "currency", currency, currencyDisplay: "code", minimumFractionDigits: 2, maximumFractionDigits: 2,
          }).format(convertEGP(amount, data.rates[currency])!)}</span>
        ))}
      </span>
      {data.stale && <span className="block">{t("currency.stale")}</span>}
      {showNote && <span className="block mt-1">{t("currency.note")} {t("currency.rateDate")} {details} · {data.source}</span>}
    </span>
  );
}

export function TourPrice({ amount, showNote = false }: { amount: number | string | null | undefined; showNote?: boolean }) {
  return <span className="inline-block max-w-full">{formatEGP(amount)}<CurrencyEstimate amount={amount} showNote={showNote} /></span>;
}
