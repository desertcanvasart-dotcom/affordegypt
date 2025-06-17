import { Crown, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  
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
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user?.firstName || user?.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
            
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
