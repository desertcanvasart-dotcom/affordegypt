/**
 * Cookie consent state, and the Google Consent Mode v2 bridge.
 *
 * The defaults are set in client/index.html before any tag loads — see the
 * comment there for why they cannot move into this module. This file only
 * records the visitor's choice and pushes the corresponding `consent update`.
 *
 * Analytics and Ads scripts are never blocked. Under Consent Mode a denied tag
 * still loads and sends cookieless pings, which is what keeps Google Ads
 * conversion modelling alive; blocking the script outright would lose that on
 * top of the cookies. Denial is expressed through consent state, not by
 * withholding the tag.
 */

export const CONSENT_STORAGE_KEY = "ae:cookie-consent";

export type ConsentChoice = "granted" | "denied";

/** The four v2 signals a visitor can decline. Functionality and security
 *  storage stay granted: they carry no advertising or measurement identifier
 *  and the site cannot operate without them. */
const GATED_SIGNALS = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
] as const;

/** null when the visitor has not answered yet — the banner's trigger. */
export function readConsent(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    // Private browsing or storage disabled. Treat as undecided: the banner
    // reappears, which is the conservative outcome. Never assume consent.
    return null;
  }
}

/**
 * Record the choice and tell Google about it.
 *
 * The write is attempted first but a failure is not fatal — the consent update
 * still fires, so a visitor who accepts in a storage-restricted browser is
 * measured for that session rather than silently ignored.
 */
export function writeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    /* storage unavailable — the update below still applies for this session */
  }
  pushConsentUpdate(choice);
}

function pushConsentUpdate(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];

  const update: Record<string, ConsentChoice> = {};
  for (const signal of GATED_SIGNALS) update[signal] = choice;

  // Pushed in gtag's arguments shape. Using dataLayer directly rather than
  // window.gtag avoids depending on the loader having finished.
  w.dataLayer.push(["consent", "update", update]);
  w.dataLayer.push({ event: "ae_consent_update", ae_consent: choice });
}
