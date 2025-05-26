import { useState } from "react";
import { Menu, X, MapPin, BookOpen, Lightbulb } from "lucide-react";
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EgyptExplorer</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={scrollToQuote}
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Get Quote
            </button>
            <a href="#blog" className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Blog
            </a>
            <a href="#tips" className="text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Travel Tips
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
              <a href="#blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Blog
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