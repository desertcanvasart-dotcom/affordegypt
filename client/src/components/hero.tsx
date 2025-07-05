import { ArrowRight, CheckCircle, Star, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import AnimatedReviewCarousel from "@/components/animated-review-carousel";

export default function Hero() {
  const { t } = useTranslation();
  
  const scrollToQuote = () => {
    const element = document.getElementById('quote-builder');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="min-h-[90vh] flex items-center justify-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(25, 169, 116, 0.3), rgba(31, 41, 55, 0.6)), url('http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center text-white">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            {t('hero.title')}{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              {t('hero.titleHighlight')}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
            {t('hero.subtitle')}
          </p>

          {/* 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">{t('hero.steps.step1.title')}</h3>
              <p className="text-white/80 text-sm">{t('hero.steps.step1.description')}</p>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">{t('hero.steps.step2.title')}</h3>
              <p className="text-white/80 text-sm">{t('hero.steps.step2.description')}</p>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center">
              <div className="step-number mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2 text-green-primary">{t('hero.steps.step3.title')}</h3>
              <p className="text-white/80 text-sm">{t('hero.steps.step3.description')}</p>
            </Card>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={scrollToQuote}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-lg font-semibold shadow-xl"
          >
            {t('hero.cta')}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-sm text-white/80">4.9/5 Rating</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm text-white/80">2,500+ Travelers</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-sm text-white/80">Verified Guides</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm text-white/80">All Egypt</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}