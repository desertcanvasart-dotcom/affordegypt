// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Property IDs for the live AffordEgypt account.
 *
 * These are NOT secrets. GA4 measurement IDs and Google Ads conversion IDs are
 * public by design — they ship in the page source of every site that uses them,
 * and `client/index.html` has hardcoded G-MWY0T7465M and GTM-WJ597P5W in the
 * document head since launch.
 *
 * They live here as defaults because the previous arrangement — index.html
 * hardcoding the GA ID while this module read `import.meta.env` — meant the two
 * could disagree, and in production they did: the env vars were never set in the
 * build environment, so this module silently disabled itself on every deploy
 * while index.html kept reporting pageviews. VITE_* values are inlined into the
 * public bundle at build time regardless, so sourcing them from env bought no
 * secrecy — only a way to forget them.
 *
 * The env vars still win when present, so a staging build can point elsewhere.
 */
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-MWY0T7465M';
const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID || 'AW-17431672142';

// Initialize Google Analytics and Google Ads
export const initGA = () => {
  const googleAdsId = GOOGLE_ADS_ID;

  // Google Analytics is now loaded directly in HTML head, so we just need to handle Google Ads
  if (!googleAdsId) {
    console.warn('Missing Google Ads tracking ID: VITE_GOOGLE_ADS_ID');
    return;
  }

  // Initialize dataLayer if not already done
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  
  // Add gtag function to window if not already available
  if (!(window as any).gtag) {
    (window as any).gtag = gtag;
  }

  // Add Google Ads tracking
  const adsScript = document.createElement('script');
  adsScript.async = true;
  adsScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
  document.head.appendChild(adsScript);
  
  adsScript.onload = () => {
    (window as any).gtag('config', googleAdsId);
  };
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = GA_MEASUREMENT_ID;
  const googleAdsId = GOOGLE_ADS_ID;

  // Track page view for Google Analytics
  if (measurementId) {
    window.gtag('config', measurementId, {
      page_path: url
    });
  }
  
  // Track page view for Google Ads
  if (googleAdsId) {
    window.gtag('config', googleAdsId, {
      page_path: url
    });
  }
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Whether a booking should be reported as a conversion right now.
 *
 * Pure so the policy is testable without a live booking — creating one would
 * mean writing to the production database.
 */
export function shouldSendBookingConversion(
  booking: { bookingReference?: string; bookingStatus?: string } | undefined | null,
  alreadySent: boolean,
): boolean {
  if (!booking?.bookingReference) return false;
  // A cancelled booking is not a conversion. Every other status — including
  // `pending`, the normal state immediately after checkout — means a real
  // booking was placed.
  if (booking.bookingStatus === 'cancelled') return false;
  return !alreadySent;
}

/**
 * Reports a completed booking as a GA4 `purchase` event.
 *
 * This account imports its conversions from GA4 rather than firing Google Ads
 * website tags: in Ads, "Afford Egypt (web) purchase" has conversion source
 * "Website (Google Analytics (GA4))". Google auto-names imported actions
 * `<property> (web) <event_name>`, so the event below MUST stay named exactly
 * `purchase` — that string is the join key between the site and the Ads
 * conversion action. Renaming it silently detaches the conversion.
 *
 * There is deliberately no `send_to`/conversion-label here. Labels belong to
 * Ads-native website tags; for a GA4 import the event travels GA4 -> Ads on its
 * own, and a send_to aimed at a made-up label would simply be discarded.
 *
 * `transaction_id` is the booking reference. GA4 de-duplicates purchases on it,
 * so a customer reloading, bookmarking or sharing the confirmation URL — or
 * opening it on a second device, where localStorage cannot help — still counts
 * once.
 */
export const trackPurchase = (args: {
  transactionId: string;
  value?: number;
  currency?: string;
  items?: Array<Record<string, unknown>>;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: args.transactionId,
    value: args.value,
    currency: args.currency ?? 'EGP',
    items: args.items ?? [],
  });
};