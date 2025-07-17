import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";
import { useTranslatedLink } from "@/utils/slugTranslation";

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const getTranslatedLink = useTranslatedLink();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter-subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: t('footer.newsletter.success'),
        description: t('footer.newsletter.successDesc'),
      });
      setEmail("");
    },
    onError: (error: any) => {
      toast({
        title: t('footer.newsletter.failed'),
        description: t('footer.newsletter.failedDesc'),
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t('validation.required'),
        description: t('footer.newsletter.emailRequired'),
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: t('validation.invalidEmail'),
        description: t('validation.invalidEmail'),
        variant: "destructive",
      });
      return;
    }
    newsletterMutation.mutate(email);
  };

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
            <h3 className="text-lg font-semibold mb-4">{t('footer.usefulLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={getTranslatedLink("travel-tips")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.travelTips')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("eastern-western-deserts-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.desertsGuide')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("sinai-peninsula-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.sinaiGuide')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("nile-valley-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.nileGuide')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("budget-travel-egypt")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.budgetTravel')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("egyptian-street-food-guide")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.streetFood')}
                </Link>
              </li>
              <li>
                <Link href={getTranslatedLink("cuisine-passport")} className="text-gray-300 hover:text-primary transition-colors">
                  {t('footer.cuisinePassport')}
                </Link>
              </li>
            </ul>
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
            <h3 className="text-lg font-semibold mb-4">{t('footer.newsletter.title')}</h3>
            <p className="text-gray-300 mb-4">{t('footer.newsletter.subtitle')}</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-gray-700 text-white border-gray-600 sm:rounded-r-none focus:border-primary" 
                disabled={newsletterMutation.isPending}
              />
              <Button 
                type="submit"
                className="btn-primary sm:rounded-l-none"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? t('footer.newsletter.subscribing') : t('footer.newsletter.subscribe')}
              </Button>
            </form>
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
