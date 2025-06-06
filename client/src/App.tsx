import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import BookPage from "@/pages/book";
import AdminSidebar from "@/pages/admin-sidebar";
import Routes from "@/pages/routes";
import AttractionsSimple from "@/pages/attractions-simple";
import BookingConfirmation from "@/pages/booking-confirmation";
import UserDashboard from "@/pages/user-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/book/:id?" component={BookPage} />
      <Route path="/checkout/:bookingId" component={Checkout} />
      <Route path="/booking/:reference" component={BookingConfirmation} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminSidebar} />
      <Route path="/routes" component={Routes} />
      <Route path="/attractions" component={AttractionsSimple} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
