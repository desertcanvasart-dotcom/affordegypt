import { useState } from "react";
import { Menu, X, MapPin, User, Lightbulb, Star } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigateToSection = (sectionId: string) => {
    // If we're on the homepage, scroll to the section
    if (location === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    } else {
      // If we're on another page, navigate smoothly to homepage
      setLocation('/');
      // Use a longer delay to ensure the page transition and DOM are ready
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 500);
    }
  };



  const navigateToHome = () => {
    if (location === '/') {
      // If already on homepage, scroll to top smoothly
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } else {
      // Navigate to homepage and then scroll to top
      setLocation('/');
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="http://travel2egypt.org/wp-content/uploads/2025/06/logo-afford-egypt.png" 
              alt="Afford Egypt Logo" 
              className="h-10 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={navigateToHome}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/routes"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Routes
            </Link>
            <Link 
              href="/destinations"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              Destinations
            </Link>
            <Link 
              href="/travel-tips"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              Travel Tips
            </Link>
            <Link 
              href="/reviews"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <Star className="w-4 h-4" />
              Reviews
            </Link>
            <Link 
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              About
            </Link>
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Get A Quote
            </button>
          </nav>



          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/routes"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Routes
              </Link>
              <Link 
                href="/destinations"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Destinations
              </Link>
              <Link 
                href="/travel-tips"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                Travel Tips
              </Link>
              <Link 
                href="/reviews"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Reviews
              </Link>
              <Link 
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                About
              </Link>

            </div>
          </div>
        )}
      </div>
    </header>
  );
}