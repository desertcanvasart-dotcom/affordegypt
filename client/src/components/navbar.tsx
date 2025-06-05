import { useState } from "react";
import { Menu, X, MapPin, User, Mail, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToQuote = () => {
    const element = document.getElementById('quote-builder');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="http://travel2egypt.org/wp-content/uploads/2025/06/logo-afford-egypt.png" 
              alt="Afford Egypt Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={scrollToQuote}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Get Quote
            </button>
            <a href="#about" className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <User className="w-4 h-4" />
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <Mail className="w-4 h-4" />
              Contact
            </a>
            <a href="#tips" className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Travel Tips
            </a>
            <a href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-xs">
              Admin
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center">
            <Button 
              onClick={scrollToQuote}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Get Quote
            </Button>
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
              <button 
                onClick={() => { scrollToQuote(); setIsMenuOpen(false); }}
                className="text-muted-foreground hover:text-primary transition-colors text-left"
              >
                Get Quote
              </button>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                About
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </a>
              <a href="#tips" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Travel Tips
              </a>
              <Button 
                onClick={() => { scrollToQuote(); setIsMenuOpen(false); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full"
              >
                Get Quote
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}