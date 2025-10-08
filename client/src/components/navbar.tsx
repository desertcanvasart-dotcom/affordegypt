import { useState, useEffect } from "react";
import { Menu, X, MapPin, User, HelpCircle, MessageCircle, Truck, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslatedLink } from "@/utils/slugTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const getTranslatedLink = useTranslatedLink();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (sectionId: string) => {
    setIsMenuOpen(false);
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
      setLocation('/');
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocation('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const navigateToTransfers = () => {
    setIsMenuOpen(false);
    if (location === '/transfers') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocation('/transfers');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const navigateToDestinations = () => {
    setIsMenuOpen(false);
    if (location === '/destinations') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLocation('/destinations');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="http://travel2egypt.org/wp-content/uploads/2025/06/logo-afford-egypt.png" 
              alt="Afford Egypt" 
              className={`w-auto cursor-pointer hover:opacity-90 transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`}
              onClick={navigateToHome}
            />
            <div className="hidden lg:block text-xs text-gray-600 border-l border-gray-300 pl-3">
              Egypt-based experts since 2020
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button 
              onClick={navigateToDestinations}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              Destinations
            </button>
            
            <button 
              onClick={navigateToTransfers}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              Transfers
            </button>
            
            <button 
              onClick={() => navigateToSection('faq')}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              FAQs
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2"></div>

            <div className="px-2">
              <LanguageSelector />
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span>{user?.firstName || user?.username}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
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
            ) : (
              <>
                <Button variant="ghost" asChild className="text-gray-700 hover:text-primary hover:bg-teal-50 h-8 px-3 text-sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white h-8 px-3 text-sm">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Primary CTA - Desktop */}
          <div className="hidden lg:block ml-3">
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="bg-[#008C86] text-white px-4 py-2 rounded-md hover:bg-[#007570] transition-all font-medium text-sm shadow-sm hover:shadow-md duration-200 whitespace-nowrap"
            >
              Get Instant Quote
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-primary"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Trust Line - Sticky underneath header */}
      {!isScrolled && (
        <div className="bg-teal-50 border-t border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-9 text-xs sm:text-sm text-teal-800">
              <div className="flex items-center gap-2 sm:gap-6">
                <span className="flex items-center gap-1.5">
                  💚 <span className="hidden sm:inline">Transparent pricing — what you see is what you pay</span><span className="sm:hidden">Real prices in EGP</span>
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Book directly with Egypt-based experts — no middlemen</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Secure booking</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="p-6">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plan Your Egypt Trip</h2>
              <p className="text-gray-600">Private tours with transparent pricing</p>
            </div>

            {/* Primary CTA on Top */}
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="w-full bg-[#008C86] text-white px-6 py-4 rounded-lg hover:bg-[#007570] transition-all font-semibold shadow-md mb-6 text-lg"
            >
              Get Your Instant Quote
            </button>

            {/* Navigation Sections */}
            <div className="space-y-2 mb-6">
              <button 
                onClick={navigateToDestinations}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
              >
                <MapPin className="w-5 h-5" />
                Destinations
              </button>
              
              <button 
                onClick={navigateToTransfers}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
              >
                <Truck className="w-5 h-5" />
                Private Transfers
              </button>
              
              <button 
                onClick={() => navigateToSection('faq')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
              >
                <HelpCircle className="w-5 h-5" />
                FAQs
              </button>

              <button 
                onClick={() => navigateToSection('contact')}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
            </div>

            {/* Language Selector */}
            <div className="mb-6 px-4">
              <LanguageSelector />
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <div className="flex items-center space-x-2 text-gray-700 px-4 py-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user?.firstName || user?.username}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center border border-red-200 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-all font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3 border-t border-gray-200 pt-6">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-all font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Social Media */}
            <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <a 
                href="https://www.facebook.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a 
                href="https://www.instagram.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.youtube.com/@affordegypt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-teal-600 hover:bg-teal-600 hover:text-white transition-all duration-200"
              >
                <FaYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
