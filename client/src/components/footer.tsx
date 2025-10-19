import { Link } from "wouter";
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
              <Link href="/">
                <img 
                  src="http://travel2egypt.org/wp-content/uploads/2025/06/logo-afford-egypt.png" 
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
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/affordegypt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@affordegypt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
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
            <ul className="space-y-2">
              <li>
                <Link href={getTranslatedLink("destinations")} className="text-gray-300 hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-300 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("travel-tips")} className="text-gray-300 hover:text-primary transition-colors">
                  Travel Tips
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("egyptian-street-food-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  Street Food Guide
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("cuisine-passport")} className="text-gray-300 hover:text-primary transition-colors">
                  Egyptian Cuisine Passport
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

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            &copy; 2025 Afford Egypt. {t('footer.copyright')} | {t('footer.poweredBy')}{' '}
            <a 
              href="https://traveldigitalera.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary font-semibold hover:text-primary/80 transition-all duration-300 hover:underline decoration-primary underline-offset-4 relative inline overflow-hidden"
            >
              <span className="relative z-10">Travel Digital Era</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full animate-light-sweep"></span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
