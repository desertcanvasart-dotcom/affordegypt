import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FaWhatsapp } from "react-icons/fa";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import BookPage from "@/pages/book";
import AdminSidebar from "@/pages/admin-sidebar";
import AdminBookings from "@/pages/admin-bookings";
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
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Reviews from "@/pages/reviews";
import Transfers from "@/pages/transfers";
import BookingAgreement from "@/pages/booking-agreement";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
import Login from "@/pages/login";
import Register from "@/pages/register";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/book/:id?" component={BookPage} />
      <Route path="/checkout/:bookingId" component={Checkout} />
      <Route path="/booking-confirmation/:reference" component={BookingConfirmation} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminSidebar} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/routes" component={AdminRoutesOverview} />
      <Route path="/admin/routes/city/:citySlug/:category?" component={AdminCityRoutes} />
      <Route path="/routes" component={RoutesSimple} />
      <Route path="/routes/book/:routeId" component={RouteBooking} />
      <Route path="/routes/:category/:citySlug" component={RouteCityPage} />
      <Route path="/transfers" component={Transfers} />
      <Route path="/attractions" component={AttractionsSimple} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/travel-tips" component={TravelTips} />
      <Route path="/reviews" component={Reviews} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/budget-travel-egypt" component={BudgetTravelEgypt} />
      <Route path="/egyptian-street-food-guide" component={EgyptianStreetFoodGuide} />
      <Route path="/nile-valley-guide" component={NileValleyGuide} />
      <Route path="/sinai-peninsula-guide" component={SinaiPeninsulaGuide} />
      <Route path="/eastern-western-deserts-guide" component={EasternWesternDesertsGuide} />
      <Route path="/booking-agreement" component={BookingAgreement} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
