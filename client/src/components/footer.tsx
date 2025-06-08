import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
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
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-twitter"></i>
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
                <Link href="/budget-travel-in-egypt" className="text-gray-300 hover:text-primary transition-colors">
                  Budget Travel in Egypt
                </Link>
              </li>
              <li>
                <Link href="/egyptian-street-food" className="text-gray-300 hover:text-primary transition-colors">
                  Egyptian Street Food
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
              <li><span className="text-gray-500 cursor-default">Contact</span></li>
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-gray-300 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="text-gray-300 hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/booking-agreement" className="text-gray-300 hover:text-primary transition-colors">Booking Agreement</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">Get travel tips and special offers</p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 bg-gray-700 text-white border-gray-600 rounded-r-none focus:border-primary" 
              />
              <Button className="btn-primary rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Afford Egypt. All rights reserved. | Powered and Polished by <a href="https://traveldigitalera.com/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:text-primary/80 transition-all duration-300 hover:underline decoration-primary underline-offset-4">Travel Digital Era</a></p>
        </div>
      </div>
    </footer>
  );
}
