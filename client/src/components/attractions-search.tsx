import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Clock, DollarSign, Star, ChevronDown, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Attraction {
  id: number;
  name: string;
  description: string;
  cityId: number;
  location: string;
  duration: string;
  ticketPrice: string;
  openingHours: string;
  category: string;
  image: string | null;
}

interface AttractionsSearchProps {
  attractions: Attraction[];
  selectedAttractions: string[];
  onAttractionsChange: (attractions: string[]) => void;
  cityId: number;
  cityName: string;
}

export default function AttractionsSearch({
  attractions,
  selectedAttractions,
  onAttractionsChange,
  cityId,
  cityName
}: AttractionsSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  // Filter attractions for the current city
  const cityAttractions = useMemo(() => {
    return attractions.filter(attraction => attraction.cityId === cityId);
  }, [attractions, cityId]);

  // Get unique categories
  const categories = useMemo(() => {
    const catSet = new Set(cityAttractions.map(a => a.category));
    const cats = Array.from(catSet);
    return cats.filter(Boolean);
  }, [cityAttractions]);

  // Apply filters
  const filteredAttractions = useMemo(() => {
    return cityAttractions.filter(attraction => {
      // Search term filter — description is nullable in the DB, so guard it.
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        attraction.name?.toLowerCase().includes(term) ||
        attraction.description?.toLowerCase().includes(term) ||
        false;
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || attraction.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [cityAttractions, searchTerm, selectedCategory]);

  const handleAttractionToggle = (attractionName: string) => {
    const newSelected = selectedAttractions.includes(attractionName)
      ? selectedAttractions.filter(name => name !== attractionName)
      : [...selectedAttractions, attractionName];
    onAttractionsChange(newSelected);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "historical":
        return "🏛️";
      case "museum":
        return "🏛️";
      case "religious":
        return "🕌";
      case "natural":
        return "🌿";
      case "entertainment":
        return "🎭";
      case "market":
        return "🛒";
      default:
        return "📍";
    }
  };

  const getDisplayText = () => {
    if (selectedAttractions.length === 0) return "Select Attractions";
    if (selectedAttractions.length === 1) {
      return selectedAttractions[0];
    }
    return `${selectedAttractions.length} attractions selected`;
  };

  const clearAll = () => {
    onAttractionsChange([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            {getDisplayText()}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">Attractions in {cityName}</h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedAttractions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedAttractions.length} selected
                </Badge>
              )}
              {selectedAttractions.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search attractions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || selectedCategory !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="max-h-80 overflow-y-auto">
          <div className="p-3 space-y-3">
            {filteredAttractions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No attractions found matching your criteria</p>
              </div>
            ) : (
              filteredAttractions.map((attraction) => (
                <div
                  key={attraction.id} 
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAttractions.includes(attraction.name) 
                      ? 'border-teal-200 bg-teal-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAttractionToggle(attraction.name)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedAttractions.includes(attraction.name)}
                      onCheckedChange={() => handleAttractionToggle(attraction.name)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {getCategoryIcon(attraction.category)} {attraction.name}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {attraction.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {attraction.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {attraction.duration}
                          </div>
                        )}
                        {attraction.openingHours && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {attraction.openingHours}
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {attraction.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Quick Selection Actions */}
            {filteredAttractions.length > 0 && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allNames = filteredAttractions.map(a => a.name);
                    const combined = [...selectedAttractions, ...allNames];
                    onAttractionsChange(Array.from(new Set(combined)));
                  }}
                >
                  Select All Visible
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const visibleNames = filteredAttractions.map(a => a.name);
                    onAttractionsChange(selectedAttractions.filter(name => !visibleNames.includes(name)));
                  }}
                >
                  Clear All Visible
                </Button>
              </div>
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
            {selectedAttractions.length > 0 && ` (${selectedAttractions.length} selected)`}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}