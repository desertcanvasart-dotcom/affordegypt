import { Switch, Route, Redirect, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { MULTILINGUAL_ENABLED } from "@/config/features";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import CookieConsent from "@/components/cookie-consent";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FaWhatsapp } from "react-icons/fa";
import { AuthProvider } from "@/hooks/useAuth";
import { getAllSlugVariants } from "@/utils/slugTranslation";
import { useEffect, lazy, Suspense, type ComponentType } from "react";
import { ClientOnly } from "@/components/client-only";
import { ErrorBoundary } from "@/components/error-boundary";
import { initGA } from "./lib/analytics";
import { signalPrerenderReady } from "./lib/prerender";
import { useAnalytics } from "./hooks/use-analytics";
import Home from "@/pages/home";
import Attractions from "@/pages/attractions";

// Never-prerendered surfaces (admin, auth, booking flow) load lazily so the
// public bundle stays small. Prerendered routes MUST stay statically
// imported: the "prerender-ready" event fires on first paint, and a lazy
// page would be captured as its Suspense fallback.
//
// Each lazy page carries its own Suspense boundary instead of one wrapper
// around the whole <Switch> — a top-level boundary changes the hydration
// tree of the prerendered public pages and triggers React #418/#423
// hydration mismatches on every one of them.
function withSuspense(Component: ComponentType<any>) {
  return function SuspendedPage(props: any) {
    return (
      <Suspense fallback={<PageLoading />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

const BookPage = withSuspense(lazy(() => import("@/pages/book")));
const AdminSidebar = withSuspense(lazy(() => import("@/pages/admin-sidebar")));
const AdminBookings = withSuspense(lazy(() => import("@/pages/admin-bookings")));
const AdminReviews = withSuspense(lazy(() => import("@/pages/admin-reviews")));
const AdminServiceCatalog = withSuspense(lazy(() => import("@/pages/admin-service-catalog")));
const AdminServiceCatalogEdit = withSuspense(lazy(() => import("@/pages/admin-service-catalog-edit")));
const AdminTripTypes = withSuspense(lazy(() => import("@/pages/admin-trip-types")));
const AdminServiceCategories = withSuspense(lazy(() => import("@/pages/admin-service-categories")));
const AdminEntranceFees = withSuspense(lazy(() => import("@/pages/admin-entrance-fees")));
const AttractionsSimple = withSuspense(lazy(() => import("@/pages/attractions-simple")));
const BookingConfirmation = withSuspense(lazy(() => import("@/pages/booking-confirmation")));
const UserDashboard = withSuspense(lazy(() => import("@/pages/user-dashboard")));
import TravelTips from "@/pages/travel-tips";
import Destinations from "@/pages/destinations";
import BudgetTravelEgypt from "@/pages/budget-travel-egypt";
import EgyptianStreetFoodGuide from "@/pages/egyptian-street-food-guide";
import NileValleyGuide from "@/pages/nile-valley-guide";
import SinaiPeninsulaGuide from "@/pages/sinai-peninsula-guide";
import EasternWesternDesertsGuide from "@/pages/eastern-western-deserts-guide";
import CuisinePassport from "@/pages/cuisine-passport";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Reviews from "@/pages/reviews";
import SubmitReview from "@/pages/submit-review";
import Transfers from "@/pages/transfers";
import PricingTool from "@/pages/pricing-tool";
import CairoAirportTransfers from "@/pages/cairo-airport-transfers";
import LuxorAirportTransfers from "@/pages/luxor-airport-transfers";
import AswanAirportTransfers from "@/pages/aswan-airport-transfers";
import CairoGuideServices from "@/pages/cairo-guide-services";
import LuxorGuideServices from "@/pages/luxor-guide-services";
import AswanGuideServices from "@/pages/aswan-guide-services";

import BookingAgreement from "@/pages/booking-agreement";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
const Login = withSuspense(lazy(() => import("@/pages/login")));
const Register = withSuspense(lazy(() => import("@/pages/register")));
const ResetPassword = withSuspense(lazy(() => import("@/pages/reset-password")));
const VerifyEmail = withSuspense(lazy(() => import("@/pages/verify-email")));

import NotFound from "@/pages/not-found";

// Helper function to create routes for all language variants
function createMultilingualRoute(englishSlug: string, Component: React.ComponentType<any>) {
  const variants = getAllSlugVariants(englishSlug);

  // With language switching off, a translated slug would render English content
  // under e.g. /destinos — the worst of both. Redirect to the English URL so an
  // already-shared link still lands on the right page, and the address bar
  // agrees with what is on screen. The mappings stay intact for phase 2.
  if (!MULTILINGUAL_ENABLED) {
    return [
      <Route key={englishSlug} path={`/${englishSlug}`} component={Component} />,
      ...variants
        .filter((slug) => slug !== englishSlug)
        .map((slug) => (
          <Route key={slug} path={`/${slug}`}>
            <Redirect to={`/${englishSlug}`} replace />
          </Route>
        )),
    ];
  }

  return variants.map((slug) => (
    <Route key={slug} path={`/${slug}`} component={Component} />
  ));
}

/**
 * Resets scroll on navigation.
 *
 * wouter does no scroll management, and 20 of the 44 pages had each grown their
 * own `window.scrollTo(0, 0)` mount effect. The other 24 — including
 * /destinations, /submit-review, /contact and /reviews — had none, so following
 * a footer link from the bottom of a long page left you looking at the footer
 * of the *next* page, which reads as "the link didn't work".
 *
 * Hash targets are honoured rather than overridden: /#faq from another page has
 * to scroll to the FAQ, not to the top. The hashchange listener covers clicking
 * the same hash link twice, or from the page it already points at, where the
 * path never changes and the effect would not re-run.
 */
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    let timer: number | undefined;

    const scrollToHash = () => {
      if (timer !== undefined) clearTimeout(timer);
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        window.scrollTo(0, 0);
        return;
      }
      // The target may not exist on the first tick — the destination page has
      // to mount first, and lazy routes arrive a few frames later still. Poll
      // briefly rather than assuming, and fall back to the top so a stale or
      // misspelled hash still lands somewhere sensible instead of nowhere.
      let tries = 0;
      const attempt = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (++tries > 10) {
          window.scrollTo(0, 0);
          return;
        }
        timer = window.setTimeout(attempt, 50);
      };
      attempt();
    };

    // Clicking a hash link for the hash you are already on fires no hashchange
    // and no navigation, and wouter's <Link> has preventDefault-ed the browser's
    // own anchor scroll — so without this, the footer's FAQ link is a dead click
    // for anyone already sitting on /#faq.
    const onDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href*="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const url = new URL(anchor.href, window.location.origin);
      if (
        url.pathname === window.location.pathname &&
        url.hash &&
        url.hash === window.location.hash
      ) {
        scrollToHash();
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      document.removeEventListener("click", onDocumentClick);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [location]);

  return null;
}

// Shown while a lazy page chunk downloads (admin/auth/booking surfaces only —
// public prerendered pages are in the main bundle and never hit this).
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
    </div>
  );
}

function Router() {
  // Track page views when routes change
  useAnalytics();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/book/:id?" component={BookPage} />
      <Route path="/booking-confirmation/:reference" component={BookingConfirmation} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminSidebar} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/reviews" component={AdminReviews} />
      {/* Phase 1.5 — Service Catalog admin (Phase B) */}
      <Route path="/admin/service-catalog" component={AdminServiceCatalog} />
      <Route path="/admin/service-catalog/new" component={AdminServiceCatalogEdit} />
      <Route path="/admin/service-catalog/:id/edit" component={AdminServiceCatalogEdit} />
      <Route path="/admin/trip-types" component={AdminTripTypes} />
      <Route path="/admin/service-categories" component={AdminServiceCategories} />
      <Route path="/admin/entrance-fees" component={AdminEntranceFees} />
      {/* Admin attraction management (used to squat on the public
          /attractions URL — that now renders the visitor-facing page) */}
      <Route path="/admin/attractions" component={AttractionsSimple} />
      {/* Legacy route-booking pages priced off the (now empty) routes table
          and showed $0. Redirect to the real booking flow so old links and
          indexed URLs land on the planner instead of a dead $0 page. */}
      <Route path="/routes/book/:routeId"><Redirect to="/pricing-tool" /></Route>
      <Route path="/routes/:category/:citySlug"><Redirect to="/pricing-tool" /></Route>
      <Route path="/routes"><Redirect to="/pricing-tool" /></Route>
      <Route path="/route-booking"><Redirect to="/pricing-tool" /></Route>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />

      {/* Multilingual routes */}
      {createMultilingualRoute("transfers", Transfers)}
      {createMultilingualRoute("pricing-tool", PricingTool)}
      {createMultilingualRoute("attractions", Attractions)}
      {createMultilingualRoute("destinations", Destinations)}
      {createMultilingualRoute("travel-tips", TravelTips)}
      {createMultilingualRoute("reviews", Reviews)}
      {createMultilingualRoute("submit-review", SubmitReview)}
      {createMultilingualRoute("about", About)}
      {createMultilingualRoute("contact", Contact)}
      {createMultilingualRoute("budget-travel-egypt", BudgetTravelEgypt)}
      {createMultilingualRoute("egyptian-street-food-guide", EgyptianStreetFoodGuide)}
      {createMultilingualRoute("nile-valley-guide", NileValleyGuide)}
      {createMultilingualRoute("sinai-peninsula-guide", SinaiPeninsulaGuide)}
      {createMultilingualRoute("eastern-western-deserts-guide", EasternWesternDesertsGuide)}
      {createMultilingualRoute("cuisine-passport", CuisinePassport)}
      {createMultilingualRoute("booking-agreement", BookingAgreement)}
      {createMultilingualRoute("terms-of-service", TermsOfService)}
      {createMultilingualRoute("privacy-policy", PrivacyPolicy)}
      {createMultilingualRoute("cookie-policy", CookiePolicy)}

      {/* Airport Transfer Service Pages */}
      {createMultilingualRoute("cairo-airport-transfers", CairoAirportTransfers)}
      {createMultilingualRoute("luxor-airport-transfers", LuxorAirportTransfers)}
      {createMultilingualRoute("aswan-airport-transfers", AswanAirportTransfers)}

      {/* Guide & Car Service Pages */}
      {createMultilingualRoute("cairo-car-tour-guide-services", CairoGuideServices)}
      {createMultilingualRoute("luxor-car-tour-guide-services", LuxorGuideServices)}
      {createMultilingualRoute("aswan-car-tour-guide-services", AswanGuideServices)}

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { t } = useTranslation();
  // Initialize Google Analytics and Google Ads when app loads.
  // This used to be gated on VITE_GA_MEASUREMENT_ID / VITE_GOOGLE_ADS_ID being
  // set, which they never were in the Railway build — so initGA() was simply
  // never called, and the gate only ever produced a console warning. The IDs now
  // have defaults in lib/analytics.ts, which owns that decision; duplicating the
  // check here is what kept it switched off.
  useEffect(() => {
    initGA();
  }, []);

  // Signal the prerenderer (Puppeteer) that initial render is complete.
  // Fires after first paint so prerendered HTML captures the mounted DOM.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      signalPrerenderReady();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // If this page was served from prerendered HTML, refetch live data so the
  // user sees fresh content within a couple seconds of hydration.
  useEffect(() => {
    const wasPrerendered = document
      .querySelector('meta[name="prerender-status"]')
      ?.getAttribute("content") === "prerendered";
    if (wasPrerendered) {
      queryClient.invalidateQueries();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <TooltipProvider>
              <ClientOnly>
                <Toaster />
                <CookieConsent />
              </ClientOnly>
              <ScrollToTop />
              <Router />

              {/* Floating WhatsApp button.
                  Sat at bottom-6 with a full label, which put it directly on
                  top of MobileStickyCTA (fixed bottom-0, ~56px tall) on every
                  phone, and gave the page two equally loud persistent CTAs.
                  On mobile it now clears the sticky bar and shrinks to the icon
                  alone, so "Build My Trip" stays the primary action and chat
                  reads as the secondary one. Desktop, where there is no sticky
                  bar, keeps the labelled pill. */}
              <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
                <a
                  href="https://wa.me/201100765283"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('nav.whatsappTitle')}
                  className="flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full bg-green-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl md:px-4 md:py-3"
                >
                  <FaWhatsapp className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden text-sm font-medium md:inline">
                    {t('chrome.whatsappCta')}
                  </span>
                </a>
              </div>
            </TooltipProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
