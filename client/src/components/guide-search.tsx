import { useState, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

  // Fetch actual guide rates from database
  const { data: guideRates = [] } = useQuery({
    queryKey: ['/api/guide-rates', cityId],
    enabled: !!cityId
  });

  // Get actual daily rate for a language from database
  const getDailyRate = (language: string): number => {
    const guideRate = (guideRates as any[]).find((rate: any) => 
      rate.language?.trim().toLowerCase() === language.trim().toLowerCase()
    );
    return guideRate ? Math.round(parseFloat(guideRate.hourlyPrice)) : 2500; // Default fallback
  };

  // Enhanced language data with ratings and specialties
  const enhancedLanguages = useMemo(() => {
    const specialties = {
      'English': [t('guides.specialties.historicalSites'), t('guides.specialties.culturalTours'), t('guides.specialties.photography')],
      'Spanish': [t('guides.specialties.artHistory'), t('guides.specialties.religiousSites'), t('guides.specialties.localCuisine')],
      'French': [t('guides.specialties.architecture'), t('guides.specialties.museumTours'), t('guides.specialties.culturalHeritage')],
      'German': [t('guides.specialties.archaeologicalSites'), t('guides.specialties.historicalAnalysis'), t('guides.specialties.technicalTours')],
      'Italian': [t('guides.specialties.artCollections'), t('guides.specialties.religiousHistory'), t('guides.specialties.renaissanceCulture')],
      'Japanese': [t('guides.specialties.culturalExchange'), t('guides.specialties.photography'), t('guides.specialties.spiritualSites')],
      'Chinese': [t('guides.specialties.ancientHistory'), t('guides.specialties.culturalTraditions'), t('guides.specialties.silkRoad')],
      'Arabic': [t('guides.specialties.islamicHeritage'), t('guides.specialties.localCustoms'), t('guides.specialties.traditionalCrafts')]
    };

    const ratings = {
      'English': 4.8,
      'Spanish': 4.6,
      'French': 4.7,
      'German': 4.5,
      'Italian': 4.6,
      'Japanese': 4.9,
      'Chinese': 4.7,
      'Arabic': 4.9
    };

    return languages.map(language => ({
      language,
      displayName: t(`guides.languages.${language.toLowerCase()}`),
      rating: ratings[language as keyof typeof ratings] || 4.5,
      specialties: specialties[language as keyof typeof specialties] || [t('guides.specialties.generalTours')]
    }));
  }, [languages, t]);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return enhancedLanguages;
    
    return enhancedLanguages.filter(lang => 
      lang.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
      'Arabic': '🇸🇦'
    };
    return icons[language as keyof typeof icons] || '🌍';
  };

  const getDurationLabel = (hours: number) => {
    if (hours <= 4) return 'Half Day';
    if (hours <= 8) return 'Full Day';
    return 'Extended';
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
              <h3 className="font-semibold">Tour Guide for {cityName}</h3>
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
              placeholder="Search languages or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Duration Selection */}
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-600" />
            <Label className="text-sm font-medium">Duration:</Label>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="10">10 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
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
                  <div className="font-medium">No Guide</div>
                  <div className="text-sm text-gray-600">Self-guided tour</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Free</div>
            </div>
          </div>

          {/* Language Options */}
          <div className="p-3 space-y-2">
            {filteredLanguages.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No guides found matching your search</p>
              </div>
            ) : (
              filteredLanguages.map(({ language, displayName, rating, specialties }) => (
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
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{rating}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {specialties.slice(0, 2).map(specialty => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-teal-600">
                      EGP {getDailyRate(language)}/day
                    </div>
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
            Done
            {selectedGuide && ` (${selectedGuide.language} - ${selectedGuide.duration}h)`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}