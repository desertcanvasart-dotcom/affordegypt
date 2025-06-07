import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronDown, Search, User, Clock, Globe, Star } from "lucide-react";

interface GuideOption {
  language: string;
  duration: number;
}

interface GuideSearchProps {
  languages: string[];
  selectedGuide?: GuideOption;
  onGuideChange: (guide?: GuideOption) => void;
  cityName: string;
}

export function GuideSearch({ 
  languages, 
  selectedGuide, 
  onGuideChange, 
  cityName 
}: GuideSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<number>(8);

  // Enhanced language data with ratings and specialties
  const enhancedLanguages = useMemo(() => {
    const specialties = {
      'English': ['Historical sites', 'Cultural tours', 'Photography'],
      'Spanish': ['Art history', 'Religious sites', 'Local cuisine'],
      'French': ['Architecture', 'Museum tours', 'Cultural heritage'],
      'German': ['Archaeological sites', 'Historical analysis', 'Technical tours'],
      'Italian': ['Art collections', 'Religious history', 'Renaissance culture'],
      'Japanese': ['Cultural exchange', 'Photography', 'Spiritual sites'],
      'Chinese': ['Ancient history', 'Cultural traditions', 'Silk road heritage'],
      'Arabic': ['Islamic heritage', 'Local customs', 'Traditional crafts']
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
      rating: ratings[language as keyof typeof ratings] || 4.5,
      specialties: specialties[language as keyof typeof specialties] || ['General tours']
    }));
  }, [languages]);

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchTerm) return enhancedLanguages;
    
    return enhancedLanguages.filter(lang => 
      lang.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    if (!selectedGuide) return "Select tour guide...";
    return `${selectedGuide.language} guide (${selectedGuide.duration}h)`;
  };

  const handleLanguageSelect = (language: string) => {
    if (language === "none") {
      onGuideChange(undefined);
    } else {
      onGuideChange({ language, duration: selectedDuration });
    }
  };

  return (
    <Popover>
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
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-teal-600" />
            <h3 className="font-semibold">Tour Guide for {cityName}</h3>
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
              filteredLanguages.map(({ language, rating, specialties }) => (
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
                        <span className="font-medium">{language}</span>
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
                      ${selectedDuration * 15}/day
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
      </PopoverContent>
    </Popover>
  );
}