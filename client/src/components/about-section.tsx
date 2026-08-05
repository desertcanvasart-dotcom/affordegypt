import { Button } from "@/components/ui/button";
import { Users, MapPin, Clock, Shield } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';

export default function AboutSection() {
  const { t } = useTranslation();
  
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t('about.title')}</h2>
          
          <div className="text-lg text-muted-foreground leading-relaxed mb-8 space-y-4">
            <p>{t('about.description1')}</p>
            <p>{t('about.description2')}</p>
            <p>{t('about.description3')}</p>
            <p>{t('about.description4')}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{t('about.stats.travelers')}</h3>
              <p className="text-sm text-muted-foreground">{t('about.stats.travelersDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{t('about.stats.destinations')}</h3>
              <p className="text-sm text-muted-foreground">{t('about.stats.destinationsDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{t('about.stats.support')}</h3>
              <p className="text-sm text-muted-foreground">{t('about.stats.supportDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{t('about.stats.guarantee')}</h3>
              <p className="text-sm text-muted-foreground">{t('about.stats.guaranteeDesc')}</p>
            </div>
          </div>

          <Button asChild 
              variant="outline" 
              size="lg"
            >
            <Link href="/about">
              {t('about.cta')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}