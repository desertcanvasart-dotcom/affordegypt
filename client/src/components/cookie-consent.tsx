import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { readConsent, writeConsent } from "@/lib/consent";

/**
 * Cookie consent banner.
 *
 * The site loads Google Tag Manager, GA4 and Google Ads. Before this existed
 * all three fired on page load with no consent step, while the privacy policy
 * named "your consent" as a GDPR legal basis and promised the right to
 * withdraw it — a documented claim the site's own behaviour contradicted.
 *
 * Rendered only after mount. The pages are prerendered with Puppeteer at build
 * time, so a banner in the initial markup would be baked into every page and
 * shown for a frame to visitors who already answered.
 *
 * Reject is a real button of equal weight, not a link buried under Accept.
 * A consent request where refusing is harder than agreeing is not freely
 * given, which is the point of asking at all.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);

    // The footer link re-opens this so a visitor can change their mind, which
    // is the withdrawal right the privacy policy already promises.
    const reopen = () => setVisible(true);
    window.addEventListener("ae:open-cookie-preferences", reopen);
    return () => window.removeEventListener("ae:open-cookie-preferences", reopen);
  }, []);

  if (!visible) return null;

  const decide = (choice: "granted" | "denied") => {
    writeConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-heading"
      className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="container mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
          <div>
            <h2 id="cookie-consent-heading" className="font-semibold">
              Cookies on AffordEgypt
            </h2>
            <p className="text-sm text-muted-foreground">
              We use essential cookies to run the site. With your permission we
              also use analytics and advertising cookies to understand how the
              site is used. You can change this at any time.{" "}
              <Link
                href="/cookie-policy"
                className="underline underline-offset-2 hover:text-primary"
              >
                Cookie Policy
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-3">
          <Button
            variant="outline"
            onClick={() => decide("denied")}
            className="flex-1 md:flex-none"
          >
            Reject non-essential
          </Button>
          <Button onClick={() => decide("granted")} className="flex-1 md:flex-none">
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Re-opens the banner. Used by the footer "Cookie preferences" link. */
export function openCookiePreferences() {
  window.dispatchEvent(new Event("ae:open-cookie-preferences"));
}
