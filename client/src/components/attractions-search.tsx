import { useState, useMemo } from "react";
import { Search, MapPin, Clock, DollarSign, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

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
      // Search term filter
      const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attraction.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === "all" || attraction.category === selectedCategory;
      
      // Price range filter
      let matchesPrice = true;
      if (priceRange !== "all") {
        const price = parseInt(attraction.ticketPrice) || 0;
        switch (priceRange) {
          case "free":
            matchesPrice = price === 0;
            break;
          case "budget":
            matchesPrice = price > 0 && price <= 15;
            break;
          case "moderate":
            matchesPrice = price > 15 && price <= 30;
            break;
          case "premium":
            matchesPrice = price > 30;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [cityAttractions, searchTerm, selectedCategory, priceRange]);

  const handleAttractionToggle = (attractionName: string) => {
    const newSelected = selectedAttractions.includes(attractionName)
      ? selectedAttractions.filter(name => name !== attractionName)
      : [...selectedAttractions, attractionName];
    onAttractionsChange(newSelected);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange("all");
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

  const getPriceColor = (price: string) => {
    const priceNum = parseInt(price) || 0;
    if (priceNum === 0) return "text-green-600";
    if (priceNum <= 15) return "text-blue-600";
    if (priceNum <= 30) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">{cityName} Attractions</h3>
          <Badge variant="outline" className="ml-auto">
            {selectedAttractions.length} selected
          </Badge>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search attractions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
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
          
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="budget">$1-15</SelectItem>
              <SelectItem value="moderate">$16-30</SelectItem>
              <SelectItem value="premium">$31+</SelectItem>
            </SelectContent>
          </Select>
          
          {(searchTerm || selectedCategory !== "all" || priceRange !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAttractions.length} of {cityAttractions.length} attractions
      </div>

      {/* Attractions Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No attractions found matching your criteria</p>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="mt-2">
              Clear filters to see all attractions
            </Button>
          </div>
        ) : (
          filteredAttractions.map((attraction) => (
            <Card 
              key={attraction.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAttractions.includes(attraction.name) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : ''
              }`}
              onClick={() => handleAttractionToggle(attraction.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedAttractions.includes(attraction.name)}
                    onChange={() => handleAttractionToggle(attraction.name)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">
                          {getCategoryIcon(attraction.category)} {attraction.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {attraction.description}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getPriceColor(attraction.ticketPrice)}`}>
                          {parseInt(attraction.ticketPrice) === 0 ? 'Free' : `EGP ${Math.round(parseFloat(attraction.ticketPrice) * 32)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">per person</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
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
            Deselect All Visible
          </Button>
        </div>
      )}
    </div>
  );
}