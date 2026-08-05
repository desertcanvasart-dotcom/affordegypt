import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';
import { Mail, Send } from "lucide-react";

export default function NewsletterSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const { toast } = useToast();

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
    <section className="py-16 bg-gradient-to-br from-teal-600 to-blue-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Get the Egypt Trip Calculator
        </h2>

        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          A 1-page worksheet for planning your trip cost honestly. Plus
          monthly insider notes from a Cairo operator — no fluff, no
          spam, unsubscribe in one click.
        </p>
        
        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Visually hidden rather than absent: the placeholder disappears
                the moment the user types, taking the field's only label with it. */}
            <label htmlFor="newsletter-email" className="sr-only">
              {t('footer.newsletter.placeholder')}
            </label>
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('footer.newsletter.placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // sm:flex-1, not flex-1. The wrapper is `flex flex-col sm:flex-row`,
              // so on mobile the main axis is VERTICAL and `flex: 1 1 0%` was
              // collapsing h-12 to a 35.5px content-height box. Scoping the
              // flex to the row breakpoint lets the 48px height stand on phones.
              className="sm:flex-1 h-12 bg-white/95 text-gray-900 border-0 placeholder:text-gray-500 focus:ring-2 focus:ring-white"
              disabled={newsletterMutation.isPending}
            />
            <Button 
              type="submit"
              size="lg"
              className="bg-white text-teal-700 hover:bg-gray-100 font-semibold h-12 px-8 shadow-lg"
              disabled={newsletterMutation.isPending}
            >
              {newsletterMutation.isPending ? (
                t('footer.newsletter.subscribing')
              ) : (
                <>
                  {t('footer.newsletter.subscribe')}
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
        
        <p className="text-sm text-white/70 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
