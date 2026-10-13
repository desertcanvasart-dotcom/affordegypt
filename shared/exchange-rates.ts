export const DISPLAY_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type DisplayCurrency = typeof DISPLAY_CURRENCIES[number];

export interface ExchangeRates {
  base: "EGP";
  rates: Record<DisplayCurrency, number>;
  dates: Record<DisplayCurrency, string>;
  fetchedAt: string;
  stale: boolean;
  source: "Frankfurter";
}

export function convertEGP(amount: number | string | null | undefined, rate: number): number | null {
  if (amount == null || amount === "") return null;
  const value = Number(amount);
  return Number.isFinite(value) && value >= 0 && Number.isFinite(rate) && rate > 0
    ? value * rate : null;
}
