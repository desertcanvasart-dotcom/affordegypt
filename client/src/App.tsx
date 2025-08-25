import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FaWhatsapp } from "react-icons/fa";
import { AuthProvider } from "@/hooks/useAuth";
import { getAllSlugVariants } from "@/utils/slugTranslation";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import BookPage from "@/pages/book";
import AdminSidebar from "@/pages/admin-sidebar";
import AdminBookings from "@/pages/admin-bookings";
import AdminReviews from "@/pages/admin-reviews";
import Routes from "@/pages/routes";
import AdminRoutesOverview from "@/pages/admin-routes-overview";
import AdminCityRoutes from "@/pages/admin-city-routes";
import RoutesSimple from "@/pages/routes-simple";
import RouteCityPage from "@/pages/route-city-page";
import RouteBooking from "@/pages/route-booking";
import AttractionsSimple from "@/pages/attractions-simple";
import BookingConfirmation from "@/pages/booking-confirmation";
import UserDashboard from "@/pages/user-dashboard";
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
import Login from "@/pages/login";
import Register from "@/pages/register";

import NotFound from "@/pages/not-found";

// Helper function to create routes for all language variants
function createMultilingualRoute(englishSlug: string, Component: React.ComponentType<any>) {
  const variants = getAllSlugVariants(englishSlug);
  return variants.map((slug) => (
    <Route key={slug} path={`/${slug}`} component={Component} />
  ));
}

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/book/:id?" component={BookPage} />
      <Route path="/checkout/:bookingId" component={Checkout} />
      <Route path="/booking-confirmation/:reference" component={BookingConfirmation} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminSidebar} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/reviews" component={AdminReviews} />
      <Route path="/admin/routes" component={AdminRoutesOverview} />
      <Route path="/admin/routes/city/:citySlug/:category?" component={AdminCityRoutes} />
      <Route path="/routes" component={RoutesSimple} />
      <Route path="/routes/book/:routeId" component={RouteBooking} />
      <Route path="/route-booking" component={RouteBooking} />
      <Route path="/routes/:category/:citySlug" component={RouteCityPage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Multilingual routes */}
      {createMultilingualRoute("transfers", Transfers)}
      {createMultilingualRoute("pricing-tool", PricingTool)}
      {createMultilingualRoute("attractions", AttractionsSimple)}
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
  // Initialize Google Analytics and Google Ads when app loads
  useEffect(() => {
    // Check for tracking IDs
    const hasGA = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const hasAds = import.meta.env.VITE_GOOGLE_ADS_ID;
    
    if (!hasGA && !hasAds) {
      console.warn('Missing tracking IDs: VITE_GA_MEASUREMENT_ID and VITE_GOOGLE_ADS_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            
            {/* Floating WhatsApp Button */}
            <div className="fixed bottom-6 right-6 z-50">
              <a 
                href="https://wa.me/201100765283" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                title="WhatsApp Us"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span className="text-sm font-medium">WhatsApp Us</span>
              </a>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
