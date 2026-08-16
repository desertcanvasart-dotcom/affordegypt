import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronDown, Search, User, Clock, Globe, Star, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GuideOption {
  language: string;
  duration: number;
}

interface GuideSearchProps {
  languages: string[];
  selectedGuide?: GuideOption;
  onGuideChange: (guide?: GuideOption) => void;
  cityName: string;
  cityId: number;
}

export function GuideSearch({ 
  languages, 
  selectedGuide, 
  onGuideChange, 
  cityName,
  cityId
}: GuideSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(8);
  const [isOpen, setIsOpen] = useState(false);

  // Real guide rows, which is where a rating has to come from.
  const { data: guideRates = [] } = useQuery({
    queryKey: ['/api/guide-rates', cityId],
    enabled: !!cityId
  });

  /**
   * The rating the operator has actually recorded for this language in this
   * city, or null.
   *
   * This used to be a literal map in the component — Japanese 4.9, German 4.5,
   * English 4.8 — rendered beside a star as though it were measured. Nothing
   * produced those numbers: `guide_rates.rating` is the only rating the system
   * has, and it is NULL on all 54 rows today. So the stars were invented, on
   * the screen where a customer picks and pays for a guide.
   *
   * Matched on city as well as language, because rates are per city and a
   * language-only match would show Cairo's row on the Aswan step.
   */
  const ratingFor = (language: string): number | null => {
    const row = (guideRates as any[]).find(
      (r: any) =>
        r.language?.trim().toLowerCase() === language.trim().toLowerCase() &&
        r.cityId === cityId,
    );
    const n = row?.rating == null ? NaN : parseFloat(row.rating);
    return Number.isFinite(n) ? n : null;
  };

  /**
   * The languages this city offers, with whatever the operator has actually
   * recorded about each.
   *
   * There used to be a per-language "specialties" map here too — English guides
   * do historical sites and photography, German guides do archaeological sites
   * and historical analysis, and so on for ten languages. Like the ratings, it
   * was written in this component and backed by nothing: the system stores no
   * specialties, and no guide had been asked. Two invented claims stacked on
   * one row is how a picker starts looking like a directory of vetted
   * professionals, so both are gone.
   */
  const enhancedLanguages = useMemo(() => {
    return languages.map(language => ({
      language,
      displayName: t(`guides.languages.${language.toLowerCase()}`),
      rating: ratingFor(language),
    }));
  }, [languages, t, guideRates, cityId]);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return enhancedLanguages;

    return enhancedLanguages.filter(lang =>
      lang.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enhancedLanguages, searchTerm]);

  const getLanguageIcon = (language: string) => {
    const icons = {
      'English': '🇬🇧',
      'Spanish': '🇪🇸',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Japanese': '🇯🇵',
      'Chinese': '🇨🇳',
      'Dutch': '🇳🇱',
      'Korean': '🇰🇷',
      'Arabic': '🇸🇦'
    };
    return icons[language as keyof typeof icons] || '🌍';
  };

  const getDurationLabel = (hours: number) => {
    if (hours <= 4) return t('guides.durations.halfDay');
    if (hours <= 8) return t('guides.durations.fullDay');
    return t('guides.durations.extended');
  };

  const getDisplayText = () => {
    if (!selectedGuide) return t('guides.selectTourGuide');
    const languageDisplay = t(`guides.languages.${selectedGuide.language.toLowerCase()}`);
    return t('guides.selectedGuide', { language: languageDisplay, duration: selectedGuide.duration });
  };

  const handleLanguageSelect = (language: string) => {
    if (language === "none") {
      onGuideChange(undefined);
    } else {
      onGuideChange({ language, duration: selectedDuration });
    }
    // Auto-close the popover after selection
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            {getDisplayText()}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">
                {t('guides.headingForCity', { city: cityName })}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('guides.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Duration Selection */}
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-600" />
            <Label className="text-sm font-medium">{t('guides.durationLabel')}</Label>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[4, 6, 8, 10, 12].map((h) => (
                  <SelectItem key={h} value={String(h)}>
                    {t('guides.durationHours', { count: h })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {/* No Guide Option */}
          <div className="p-3 border-b">
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                !selectedGuide 
                  ? 'bg-teal-50 border-2 border-teal-200' 
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => handleLanguageSelect("none")}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  🚫
                </div>
                <div>
                  <div className="font-medium">{t('guides.noGuide')}</div>
                  <div className="text-sm text-gray-600">{t('guides.selfGuided')}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{t('guides.free')}</div>
            </div>
          </div>

          {/* Language Options */}
          <div className="p-3 space-y-2">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('guides.noneFound')}</p>
              </div>
            ) : (
              filteredLanguages.map(({ language, displayName, rating }) => (
                <div
                  key={language}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGuide?.language === language 
                      ? 'bg-teal-50 border-2 border-teal-200' 
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                      {getLanguageIcon(language)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{displayName}</span>
                        {rating !== null && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {getDurationLabel(selectedDuration)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Done Button */}
        <div className="p-4 border-t">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            {/* `selectedGuide.language` is the raw catalog word ("German"), so
                appending it gave "Fertig (German - 8h)" on the German step —
                the same bug already fixed on booking-confirmation and book.tsx.
                Use the same guides.languages lookup getDisplayText does. */}
            {selectedGuide
              ? t('guides.doneWith', {
                  language: t(`guides.languages.${selectedGuide.language.toLowerCase()}`),
                  duration: selectedGuide.duration,
                })
              : t('guides.done')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}