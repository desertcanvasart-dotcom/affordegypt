import { DISPLAY_CURRENCIES, type ExchangeRates } from "@shared/exchange-rates";

const HOUR = 60 * 60 * 1000;
const MAX_AGE = 7 * 24 * HOUR;
const ENDPOINT = "https://api.frankfurter.dev/v2/rates?base=EGP&quotes=USD,EUR,GBP";

export function parseExchangeRates(payload: unknown, now: number): ExchangeRates {
  if (!Array.isArray(payload)) throw new Error("Invalid exchange-rate response");
  const rates = {} as ExchangeRates["rates"];
  const dates = {} as ExchangeRates["dates"];
  for (const currency of DISPLAY_CURRENCIES) {
    const row = payload.find(r => r?.base === "EGP" && r?.quote === currency);
    const date = row?.date;
    const timestamp = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? Date.parse(`${date}T00:00:00Z`) : NaN;
    if (!Number.isFinite(row?.rate) || row.rate <= 0 || !Number.isFinite(timestamp)
      || timestamp > now || now - timestamp > MAX_AGE) {
      throw new Error(`Invalid or outdated ${currency} exchange rate`);
    }
    rates[currency] = row.rate;
    dates[currency] = date;
  }
  return { base: "EGP", rates, dates, fetchedAt: new Date(now).toISOString(), stale: false, source: "Frankfurter" };
}

// One request per process per hour; concurrent visitors share the same request.
// Briefly back off after an outage, and only reuse rates less than seven days old.
export function createExchangeRateService(fetcher: typeof fetch = fetch, clock = Date.now) {
  let cached: ExchangeRates | undefined;
  let nextAttempt = 0;
  let pending: Promise<ExchangeRates> | undefined;
  const fallback = () => {
    const now = clock();
    if (cached && DISPLAY_CURRENCIES.every(c => now - Date.parse(`${cached!.dates[c]}T00:00:00Z`) <= MAX_AGE)) {
      return { ...cached, stale: true };
    }
    throw new Error("Exchange rates temporarily unavailable");
  };
  return async function getRates(): Promise<ExchangeRates> {
    if (pending) return pending;
    if (clock() < nextAttempt) return cached && clock() - Date.parse(cached.fetchedAt) < HOUR ? cached : fallback();
    pending = (async () => {
      try {
        const response = await fetcher(ENDPOINT, { signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error("Exchange-rate provider unavailable");
        cached = parseExchangeRates(await response.json(), clock());
        nextAttempt = clock() + HOUR;
        return cached;
      } catch {
        nextAttempt = clock() + 60_000;
        return fallback();
      } finally {
        pending = undefined;
      }
    })();
    return pending;
  };
}
export const getExchangeRates = createExchangeRateService();
