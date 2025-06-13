import { useState } from "react";
import { Menu, X, MapPin, User, Lightbulb, Star, Truck, Shield, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

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
      {/* Super Nav Bar */}
      <div className="bg-teal-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-7 text-xs text-teal-800">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>No hidden fees – Real prices in EGP</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current" />
                <span>4.9★ on 2,500+ trips</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>Local network = lower rates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Social Icons */}
          <div className="flex flex-col items-start">
            {/* Social Media Icons */}
            <div className="flex items-center space-x-2 mb-1">
              <a 
                href="https://www.facebook.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-white border border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-2.5 h-2.5" />
              </a>
              <a 
                href="https://www.instagram.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-white border border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-2.5 h-2.5" />
              </a>
              <a 
                href="https://www.youtube.com/@affordegypt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-5 h-5 rounded-full bg-white border border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
                aria-label="Subscribe to our YouTube channel"
              >
                <FaYoutube className="w-2.5 h-2.5" />
              </a>
            </div>
            {/* Logo */}
            <img 
              src="http://travel2egypt.org/wp-content/uploads/2025/06/logo-afford-egypt.png" 
              alt="Afford Egypt Logo" 
              className="h-10 w-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={navigateToHome}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
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
          </nav>

          {/* Primary CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-md"
            >
              Start Your Trip Quote
            </button>
            <Link
              href="/transfers"
              className="border border-teal-600 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors font-medium"
            >
              Book a Transfer
            </Link>
          </div>



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
              
              {/* Mobile CTAs */}
              <div className="pt-4 space-y-3 border-t border-border">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigateToSection('quote-builder');
                  }}
                  className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium text-center"
                >
                  Start Your Trip Quote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}