import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/newsletter-subscribe", { email });
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive travel tips and special offers in your inbox.",
      });
      setEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Subscription failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
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
              Budget-friendly Egypt travel with transparent pricing and expert local guides.
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
            <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/eastern-western-deserts-guide" className="text-gray-300 hover:text-primary transition-colors">
                  Eastern & Western Deserts Travel Guide
                </Link>
              </li>
              <li>
                <Link href="/sinai-peninsula-guide" className="text-gray-300 hover:text-primary transition-colors">
                  Sinai Peninsula Travel Guide
                </Link>
              </li>
              <li>
                <Link href="/nile-valley-guide" className="text-gray-300 hover:text-primary transition-colors">
                  Nile Valley Travel Guide
                </Link>
              </li>
              <li>
                <Link href="/budget-travel-egypt" className="text-gray-300 hover:text-primary transition-colors">
                  Budget Travel in Egypt
                </Link>
              </li>
              <li>
                <Link href="/egyptian-street-food-guide" className="text-gray-300 hover:text-primary transition-colors">
                  Egyptian Street Food
                </Link>
              </li>
              <li>
                <Link href="/cuisine-passport" className="text-gray-300 hover:text-primary transition-colors">
                  Cuisine Passport
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-300 hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/booking-agreement" className="text-gray-300 hover:text-primary transition-colors">Booking Agreement</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Get travel tips and special offers</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Input 
                type="email" 
                placeholder="Your email" 
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
                {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p className="text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            &copy; 2025 Afford Egypt. All rights reserved. | Powered and Polished by{' '}
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
