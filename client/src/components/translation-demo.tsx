import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/language-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TranslationDemo() {
  const { t } = useTranslation();

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('nav.destinations')}</CardTitle>
          <LanguageSelector />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{t('transfers.title')}</h3>
          <p className="text-gray-600">{t('home.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">{t('transfers.intercityTravel')}</h4>
            <p className="text-sm text-gray-600">{t('transfers.selectFrom')} - {t('transfers.selectTo')}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">{t('transfers.localTours')}</h4>
            <p className="text-sm text-gray-600">{t('transfers.selectCityForLocal')}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">{t('pricing.guideLanguages.english')} {t('pricing.guide')}</h4>
          <div className="flex gap-2 text-sm flex-wrap">
            <span className="px-2 py-1 bg-blue-100 rounded">{t('pricing.guideLanguages.spanish')}</span>
            <span className="px-2 py-1 bg-green-100 rounded">{t('pricing.guideLanguages.french')}</span>
            <span className="px-2 py-1 bg-orange-100 rounded">{t('pricing.guideLanguages.german')}</span>

          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">{t('pricing.pricingBreakdown')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t('pricing.routes')}</span>
              <span>150 {t('common.egp')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('pricing.guide')}</span>
              <span>50 {t('common.egp')} {t('common.perPerson')}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>{t('common.total')}</span>
              <span>200 {t('common.egp')}</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            {t('nav.startTrip')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}