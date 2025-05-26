import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-wizard');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Crown className="text-primary text-2xl mr-2" />
            <span className="text-2xl font-bold text-foreground">EGH</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">All Tours</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">EN</span>
            <Button 
              onClick={scrollToBooking}
              className="btn-primary rounded-full px-6"
            >
              Book A Tour
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
