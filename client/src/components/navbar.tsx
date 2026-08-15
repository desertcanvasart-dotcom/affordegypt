import { useState, useEffect, useRef } from "react";
import { Menu, X, MapPin, User, HelpCircle, MessageCircle, Truck, LogOut, ChevronDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { MULTILINGUAL_ENABLED } from "@/config/features";
import { nextCollapsed } from "@/lib/header-collapse";
import { OPERATOR } from "@shared/operator-facts";
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
  // The mobile menu is rendered OUTSIDE <header> on purpose. The header carries
  // backdrop-blur, and an element with backdrop-filter becomes the containing
  // block for its position:fixed descendants — so `fixed inset-0` resolved
  // against the 118px header instead of the viewport and the menu rendered 53px
  // tall. Being a sibling makes `fixed` viewport-relative again.
  const headerRef = useRef<HTMLElement>(null);
  const [menuTop, setMenuTop] = useState(64);

  // Offset the panel by the header's real height rather than a hardcoded 64px:
  // the bar is 80px tall with a 36px trust line until you scroll, then 64px.
  useEffect(() => {
    if (!isMenuOpen) return;
    const measure = () => setMenuTop(headerRef.current?.offsetHeight ?? 64);
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMenuOpen, isScrolled]);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const getTranslatedLink = useTranslatedLink();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setIsScrolled((prev) => nextCollapsed(prev, window.scrollY));
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  // These now hang off <Link>, which performs the navigation itself — so these
  // handlers must NOT call setLocation as well, or every click pushes the same
  // path onto history twice and breaks the back button.
  const navigateToTransfers = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, location === '/transfers' ? 0 : 100);
  };

  const navigateToDestinations = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, location === '/destinations' ? 0 : 100);
  };

  return (
    <>
    <header ref={headerRef} className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
          {/* Logo */}
          <div className="flex flex-col items-start">
            <img 
              src="/images/logo-afford-egypt.png" 
              alt="Afford Egypt" /* i18n-exempt: brand name */ 
              className={`w-auto cursor-pointer hover:opacity-90 transition-all duration-300 ${isScrolled ? 'h-6' : 'h-8'}`}
              onClick={navigateToHome}
            />
            {/* Sourced from OPERATOR rather than retyped: this line names the
                legal entity and licence number. */}
            <div className={`hidden lg:block mt-1.5 text-gray-600 transition-all duration-300 ${isScrolled ? 'text-[10px]' : 'text-xs'}`}>
              Operated by {OPERATOR.legalName} · {OPERATOR.etaaLicence}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Real anchors, not buttons: these navigate to another page, so
                middle-click, cmd-click, "copy link" and screen-reader link
                semantics all have to work. The onClick only adds scroll-to-top. */}
            <Link
              href="/destinations"
              onClick={navigateToDestinations}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4" />
              {t('nav.destinations')}
            </Link>

            <Link
              href="/transfers"
              onClick={navigateToTransfers}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              {t('pageNames.transfers')}
            </Link>
            
            <button 
              onClick={() => navigateToSection('faq')}
              className="px-4 py-2 text-gray-700 hover:text-primary hover:bg-teal-50 rounded-md transition-all font-medium flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              FAQs
            </button>

            {MULTILINGUAL_ENABLED && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <div className="px-2">
                  <LanguageSelector />
                </div>
              </>
            )}

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
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Sign In / Sign Up intentionally removed: customer accounts
              // weren't moving the conversion needle and the SaaS-style
              // header was fighting the booking funnel. Use a magic-link
              // flow if quote retrieval is needed later.
              <a
                href="https://wa.me/201100765283"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 h-8 inline-flex items-center justify-center text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                title={t('nav.whatsappTitle')}
              >
                WhatsApp
              </a>
            )}
          </nav>

          {/* Primary CTA - Desktop */}
          <div className="hidden lg:block ml-3">
            <button
              onClick={() => navigateToSection('quote-builder')}
              className="bg-[#008C86] text-white px-4 py-2 rounded-md hover:bg-[#007570] transition-all font-medium text-sm shadow-sm hover:shadow-md duration-200 whitespace-nowrap"
            >
              {t('nav.getInstantQuote')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="lg:hidden flex min-h-11 min-w-11 items-center justify-center p-2 text-gray-700 hover:text-primary"
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
                  💚 <span className="hidden sm:inline">{t('nav.trustTransparent')}</span><span className="sm:hidden">{t('nav.trustRealPrices')}</span>
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{t('nav.trustDirect')}</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{t('nav.trustSecure')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>

    {/* Mobile Full-Screen Menu */}
    {isMenuOpen && (
      <div className="lg:hidden fixed left-0 right-0 bottom-0 bg-white z-40 overflow-y-auto animate-in slide-in-from-top duration-300"
        style={{ top: menuTop }}>
        <div className="p-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('nav.planTripTitle')}</h2>
            <p className="text-gray-600">{t('nav.planTripSubtitle')}</p>
          </div>

          {/* Primary CTA on Top */}
          <button
            onClick={() => navigateToSection('quote-builder')}
            className="w-full bg-[#008C86] text-white px-6 py-4 rounded-lg hover:bg-[#007570] transition-all font-semibold shadow-md mb-6 text-lg"
          >
            {t('nav.getYourInstantQuote')}
          </button>

          {/* Navigation Sections */}
          <div className="space-y-2 mb-6">
            <Link
              href="/destinations"
              onClick={navigateToDestinations}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              {t('nav.destinations')}
            </Link>

            <Link
              href="/transfers"
              onClick={navigateToTransfers}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
            >
              <Truck className="w-5 h-5" />
              {t('nav.privateTransfers')}
            </Link>
            
            <button 
              onClick={() => navigateToSection('faq')}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
            >
              <HelpCircle className="w-5 h-5" />
              FAQs
            </button>

            {/* Was navigateToSection('contact'), which scrolled to a #contact
                id no rendered component defines, so getElementById returned
                null and the tap silently did nothing. /contact is a real page;
                link to it. (The component that owned that id was never
                rendered and has since been deleted.) */}
            <Link
              href={getTranslatedLink("contact")}
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-primary rounded-lg transition-all font-medium flex items-center gap-3"
            >
              <MessageCircle className="w-5 h-5" />
              {t('nav.contact')}
            </Link>
          </div>

          {/* Language Selector */}
          {MULTILINGUAL_ENABLED && (
            <div className="mb-6 px-4">
              <LanguageSelector />
            </div>
          )}

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
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-center border border-red-200 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-all font-medium"
              >
                {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <a
                href="https://wa.me/201100765283"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center border border-green-600 text-green-700 px-4 py-3 rounded-lg hover:bg-green-50 transition-all font-medium"
              >
                {t('nav.whatsappTitle')}
              </a>
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
    </>
  );
}
