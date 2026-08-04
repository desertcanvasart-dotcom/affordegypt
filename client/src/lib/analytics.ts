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
 * Google Ads conversion label for a completed booking.
 *
 * Unlike the account-level IDs above, this cannot be recovered from the repo —
 * it is generated per conversion action inside the Google Ads UI
 * (Goals > Conversions > the action > "Tag setup"), and looks like `AbC-D_efGhIjKl`.
 *
 * Until it is filled in, trackConversion refuses to send. That is deliberate:
 * gtag will happily fire an event with a bogus send_to, Google will silently
 * discard it, and the site would look instrumented while reporting nothing —
 * which is exactly the failure mode that hid the broken analytics wiring for
 * months. A loud warning beats a silent no-op.
 */
export const ADS_CONVERSION_LABEL_BOOKING = '';

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

// Track conversion events for Google Ads
export const trackConversion = (
  conversionLabel: string,
  value?: number,
  currency: string = 'EGP',
  /**
   * Stable unique id for the conversion (we pass the booking reference).
   * Google Ads de-duplicates on this, so a visitor reloading, bookmarking or
   * sharing the confirmation URL cannot inflate the conversion count.
   */
  transactionId?: string,
) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const googleAdsId = GOOGLE_ADS_ID;
  if (!googleAdsId) return;

  if (!conversionLabel) {
    console.warn(
      '[analytics] Google Ads conversion NOT sent: no conversion label configured. ' +
        'Set ADS_CONVERSION_LABEL_BOOKING in client/src/lib/analytics.ts to the label ' +
        'from Google Ads > Goals > Conversions > (action) > Tag setup.',
    );
    return;
  }

  window.gtag('event', 'conversion', {
    send_to: `${googleAdsId}/${conversionLabel}`,
    value: value,
    currency: currency,
    transaction_id: transactionId,
  });
};