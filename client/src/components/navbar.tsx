import { useState } from "react";
import { Menu, X, MapPin, User, Lightbulb, Star, Truck, Shield, CheckCircle, ChefHat, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

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

  const navigateToTransfers = () => {
    if (location === '/transfers') {
      // If already on transfers page, scroll to top smoothly
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } else {
      // Navigate to transfers page and then scroll to top
      setLocation('/transfers');
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };

  const navigateToDestinations = () => {
    if (location === '/destinations') {
      // If already on destinations page, scroll to top smoothly
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } else {
      // Navigate to destinations page and then scroll to top
      setLocation('/destinations');
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
                <span>{t('home.features.noHiddenFees')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current" />
                <span>{t('home.features.rating')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3" />
                <span>{t('home.features.localNetwork')}</span>
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
              className="h-10 w-auto cursor-pointer hover:opacity-90 transition-opacity pb-1"
              onClick={navigateToHome}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={navigateToDestinations}
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <MapPin className="w-4 h-4" />
              {t('nav.destinations')}
            </button>
            <Link 
              href="/travel-tips"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              {t('nav.travelTips')}
            </Link>
            <Link 
              href="/cuisine-passport"
              className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
            >
              <ChefHat className="w-4 h-4" />
              {t('nav.cuisine')}
            </Link>
            <LanguageSelector />
          </nav>

          {/* Primary CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
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
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">{t('nav.signIn')}</Link>
                </Button>
                <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white" asChild>
                  <Link href="/register">{t('nav.signUp')}</Link>
                </Button>
              </div>
            )}
            
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-md"
            >
              {t('nav.startTrip')}
            </button>

            <button
              onClick={navigateToTransfers}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Truck className="w-4 h-4 inline mr-1" />
              {t('nav.bookTransfer')}
            </button>
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
                {t('nav.destinations')}
              </Link>
              <Link 
                href="/travel-tips"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {t('nav.travelTips')}
              </Link>
              <Link 
                href="/cuisine-passport"
                onClick={() => setIsMenuOpen(false)}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4" />
                {t('nav.cuisine')}
              </Link>
              <div className="px-4">
                <LanguageSelector />
              </div>
              
              {/* Mobile Authentication & CTAs */}
              <div className="pt-4 space-y-3 border-t border-border">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-700 py-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{user?.firstName || user?.username}</span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 py-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 py-2 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center border border-gray-300 text-gray-600 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
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