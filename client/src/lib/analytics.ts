// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics and Google Ads
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;

  if (!measurementId && !googleAdsId) {
    console.warn('Missing required tracking IDs: VITE_GA_MEASUREMENT_ID and VITE_GOOGLE_ADS_ID');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) { window.dataLayer.push(args); }
  
  // Add gtag function to window
  (window as any).gtag = gtag;
  
  gtag('js', new Date());

  // Add Google Analytics tracking if available
  if (measurementId) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(gaScript);
    gtag('config', measurementId);
  }

  // Add Google Ads tracking if available
  if (googleAdsId) {
    const adsScript = document.createElement('script');
    adsScript.async = true;
    adsScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
    document.head.appendChild(adsScript);
    gtag('config', googleAdsId);
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  
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

// Track conversion events for Google Ads
export const trackConversion = (
  conversionLabel: string,
  value?: number,
  currency: string = 'EGP'
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  if (!googleAdsId) return;
  
  window.gtag('event', 'conversion', {
    send_to: `${googleAdsId}/${conversionLabel}`,
    value: value,
    currency: currency,
  });
};