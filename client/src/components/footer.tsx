import { Link } from "wouter";
import { OPERATOR } from "@shared/operator-facts";
import { openCookiePreferences } from "@/components/cookie-consent";
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { useTranslatedLink } from "@/utils/slugTranslation";

export default function Footer() {
  const { t } = useTranslation();
  const getTranslatedLink = useTranslatedLink();

  return (
    <footer className="bg-foreground text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <Link href="/" className="flex min-h-11 items-center" aria-label="AffordEgypt home">
                <img 
                  src="/images/logo-afford-egypt.png" 
                  alt="Afford Egypt Logo" 
                  className="h-8 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>
            <p className="text-gray-300 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center -m-2.5 text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center -m-2.5 text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@affordegypt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex min-h-11 min-w-11 items-center justify-center -m-2.5 text-gray-400 hover:text-primary transition-colors"
                aria-label="Subscribe to our YouTube channel"
              >
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={getTranslatedLink("about")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("contact")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-primary transition-colors">{t('footer.termsOfService')}</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-300 hover:text-primary transition-colors">{t('footer.cookiePolicy')}</Link></li>
              {/* The privacy policy promises the right to withdraw consent, so
                  there has to be a way to reach the choice again. */}
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="text-gray-300 hover:text-primary transition-colors text-left"
                >
                  Cookie Preferences
                </button>
              </li>
              <li><Link href="/booking-agreement" className="text-gray-300 hover:text-primary transition-colors">{t('footer.bookingAgreement')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href={getTranslatedLink("cairo-airport-transfers")} className="text-gray-300 hover:text-primary transition-colors">
                  Cairo Airport Transfers
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("luxor-airport-transfers")} className="text-gray-300 hover:text-primary transition-colors">
                  Luxor Airport Transfers
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("aswan-airport-transfers")} className="text-gray-300 hover:text-primary transition-colors">
                  Aswan Airport Transfers
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("cairo-car-tour-guide-services")} className="text-gray-300 hover:text-primary transition-colors">
                  Cairo Car & Tour Guide Services
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("luxor-car-tour-guide-services")} className="text-gray-300 hover:text-primary transition-colors">
                  Luxor Car & Tour Guide Services
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("aswan-car-tour-guide-services")} className="text-gray-300 hover:text-primary transition-colors">
                  Aswan Car & Tour Guide Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            {/* Alphabetical, except Submit a Review stays pinned last. */}
            <ul className="space-y-2">
              <li>
                <Link href={getTranslatedLink("budget-travel-egypt")} className="text-gray-300 hover:text-primary transition-colors">
                  Budget Travel Guide
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("destinations")} className="text-gray-300 hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("eastern-western-deserts-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  Eastern &amp; Western Deserts
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("cuisine-passport")} className="text-gray-300 hover:text-primary transition-colors">
                  Egyptian Cuisine Passport
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-300 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("nile-valley-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  Nile Valley Guide
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("sinai-peninsula-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  Sinai Peninsula Guide
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("egyptian-street-food-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  Street Food Guide
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("travel-tips")} className="text-gray-300 hover:text-primary transition-colors">
                  Travel Tips
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("submit-review")} className="text-gray-300 hover:text-primary transition-colors">
                  Submit a Review
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 space-y-3">
          <p className="text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto">
            AffordEgypt is operated by Capital Travel Service
            <span className="mx-2 text-gray-500">·</span>
            ETAA 2179
            <span className="mx-2 text-gray-500">·</span>
            {OPERATOR.address.full}
          </p>
          <p className="text-xs">
            {`© ${new Date().getFullYear()} AffordEgypt. ${t('footer.copyright')}`}
          </p>
        </div>
      </div>
    </footer>
  );
}
