# Currency estimates

Customer prices remain EGP. USD, EUR, and GBP reference estimates are displayed underneath service prices and booking totals. No currency API existed before this feature; the old homepage estimates were static and had been removed.

## Data source and API

`GET /api/exchange-rates` uses Frankfurter v2:
`https://api.frankfurter.dev/v2/rates?base=EGP&quotes=USD,EUR,GBP`

Frankfurter publishes daily reference rates and requires no API key. Rates are target-currency units per EGP, so conversion is `amountEGP * rate`. See https://frankfurter.dev/ for provider documentation.

The response includes the base, three rates, each rate's date, fetch time, provider, and stale flag. The server validates all three currencies, caches for one hour, coalesces concurrent requests, and uses an eight-second timeout. A failed refresh backs off for a minute. Cached rates may be used during an outage only while their provider dates are less than seven days old; they are explicitly marked stale. Without usable rates the endpoint returns 503 and the UI keeps the EGP price with an unavailable message. No invented fallback rates are used.

## Display

`CurrencyEstimate` and `TourPrice` in `client/src/components/currency-estimate.tsx` share a React Query request. Estimates use the current interface language and two decimal places, with explicit USD/EUR/GBP codes. A tooltip contains the source, date, and booking-currency explanation; prominent prices also show this explanation visibly. New copy is included in English, Spanish, French, and German.

Integrated surfaces: homepage hero, Cairo/Luxor/Aswan service and airport-transfer cards, catalog selection, entrance-fee picker, transfer bookings, multi-day quote totals and breakdowns, checkout, and booking confirmation.

The FX API is disabled during prerendering so builds never freeze foreign-currency prices into marketing HTML. EGP structured data, email/PDF totals, analytics values, frozen quotes, and booking calculations retain their existing currency and values. No database migration or environment variable is required.

## Verification

`npm run check`, `npm test`, `npm run check:i18n`, `npm run check:routes`, and `npm run build`.

Tests cover conversion direction, invalid inputs/provider data, cache coalescing, refresh failures, retry backoff, and expired cached rates. Live provider requests and mobile/desktop previews verify the integration. Locally use a Node version supported by Vitest (the bundled Node 24 works); the host default Node 18 is too old for the test runner.

Verified locally: 143 tests pass across 13 files; TypeScript, translation and route checks pass; the full production build with prerendering passes. Desktop and 375px mobile previews show the correct conversions without horizontal overflow. The production homepage loads live estimates without hydration errors.
