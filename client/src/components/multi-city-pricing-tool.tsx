import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator, ChevronDown, X, Save, BookOpen, Filter, Search, Sliders, DollarSign, Clock, Star } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import QuoteManager from "@/components/quote-manager";
import AttractionsSearch from "@/components/attractions-search";
import TransportationSearch from "@/components/transportation-search";
import { GuideSearch } from "@/components/guide-search";
import { AddOnsSearch } from "@/components/addons-search";

interface CityService {
  cityId: number;
  cityName: string;
  date: string;
  travelers: number;
  selectedRoutes: number[];
  selectedGuide?: {
    language: string;
    duration: number;
  };
  attractions: string;
  selectedAttractions: string[];
  selectedAddOns: Array<{
    id: number;
    name: string;
    quantity: number;
  }>;
}

interface Route {
  id: number;
  name: string;
  type: string;
}

interface AddOn {
  id: number;
  name: string;
  description: string;
  price: string;
  unitType: string;
  cityId: number | null;
  category: string;
  image: string | null;
  isActive: boolean;
}

export default function MultiCityPricingTool() {
  const [cityServices, setCityServices] = useState<CityService[]>([]);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [totalPricing, setTotalPricing] = useState<any>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [travelDate, setTravelDate] = useState<string>('');
  const [globalTravelers, setGlobalTravelers] = useState<number>(1);
  const [, setLocation] = useLocation();
  
  // Enhanced search state
  const [searchFilters, setSearchFilters] = useState({
    budgetRange: { min: 0, max: 2000 },
    duration: { min: 1, max: 14 },
    preferredActivities: [] as string[],
    travelStyle: 'balanced' as 'budget' | 'balanced' | 'luxury'
  });
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch available cities from the database
  const { data: cities = [] } = useQuery<{id: number, name: string}[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch available languages
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["/api/pricing/languages"],
  });

  // Fetch available add-ons
  const { data: addOns = [] } = useQuery<AddOn[]>({
    queryKey: ["/api/addons"],
  });

  // Fetch available routes
  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ["/api/routes"],
  });

  // Fetch available attractions
  const { data: attractions = [] } = useQuery<any[]>({
    queryKey: ["/api/attractions"],
  });

  // Calculate pricing mutation
  const pricingMutation = useMutation({
    mutationFn: async (services: CityService[]) => {
      const response = await apiRequest("POST", "/api/pricing/calculate", {
        cityServices: services
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTotalPricing(data);
    }
  });

  // Initialize first city if none exist
  useEffect(() => {
    if (cityServices.length === 0) {
      addNewCity();
    }
  }, []);

  // Recalculate pricing when city services change
  useEffect(() => {
    if (cityServices.length > 0) {
      pricingMutation.mutate(cityServices);
    }
  }, [cityServices]);

  const addNewCity = (selectedCityId?: number) => {
    const selectedCity = selectedCityId ? cities.find(c => c.id === selectedCityId) : cities[0];
    if (!selectedCity) return;
    
    const newCityService: CityService = {
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      date: travelDate || new Date().toISOString().split('T')[0],
      travelers: globalTravelers,
      selectedRoutes: [],
      attractions: "",
      selectedAttractions: [],
      selectedAddOns: []
    };
    setCityServices(prev => [...prev, newCityService]);
  };

  const updateCityService = (index: number, updates: Partial<CityService>) => {
    setCityServices(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, ...updates } : service
      )
    );
  };

  const toggleRoute = (cityIndex: number, routeId: number) => {
    const cityService = cityServices[cityIndex];
    const newRoutes = cityService.selectedRoutes.includes(routeId)
      ? cityService.selectedRoutes.filter(id => id !== routeId)
      : [...cityService.selectedRoutes, routeId];
    
    updateCityService(cityIndex, { selectedRoutes: newRoutes });
  };

  const toggleAddOn = (cityIndex: number, addOn: AddOn) => {
    const cityService = cityServices[cityIndex];
    const existingAddOn = cityService.selectedAddOns.find(a => a.id === addOn.id);
    
    if (existingAddOn) {
      const newAddOns = cityService.selectedAddOns.filter(a => a.id !== addOn.id);
      updateCityService(cityIndex, { selectedAddOns: newAddOns });
    } else {
      const newAddOns = [...cityService.selectedAddOns, {
        id: addOn.id,
        name: addOn.name,
        quantity: 1,
        unitType: addOn.unitType,
        price: addOn.price
      }];
      updateCityService(cityIndex, { selectedAddOns: newAddOns });
    }
  };

  const handleContinueBooking = async () => {
    if (!totalPricing || cityServices.length === 0) return;
    
    try {
      // Create a quote in the database with proper structure
      const quoteData = {
        total: totalPricing.totalAmount.toString(),
        commissionPct: "0", // No commission added
        jsonBlob: {
          passengers: totalPricing.travelers,
          itinerary: cityServices,
          travelDate: travelDate,
          totalAmount: totalPricing.totalAmount,
          breakdown: totalPricing.breakdown || []
        }
      };

      const response = await apiRequest("POST", "/api/quotes", quoteData);
      const quote = await response.json();
      
      // Navigate to booking form with quote ID and scroll to top
      setLocation(`/book/${quote.id}`);
      // Smooth scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error creating quote:', error);
      // Fallback: navigate to booking form with quote data in URL params
      const queryParams = new URLSearchParams({
        total: totalPricing.totalAmount.toString(),
        travelers: totalPricing.travelers.toString(),
        cities: cityServices.map(c => c.cityName).join(','),
        travelDate: travelDate,
        itinerary: encodeURIComponent(JSON.stringify(cityServices))
      });
      setLocation(`/book?${queryParams.toString()}`);
      // Smooth scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const getCurrentCityRoutes = (cityId: number) => {
    if (!routes || routes.length === 0) return [];
    
    // Filter routes that start from this city
    return routes.filter((route: any) => {
      return route.fromCityId === cityId;
    }).map((route: any) => {
      // Generate route name based on available data
      let routeName = '';
      let routeType = 'inter-city';
      
      if (route.fromCityId === route.toCityId) {
        // Intra-city route (same start and end city)
        if (route.name) {
          // Use custom route name if available
          routeName = route.name;
        } else if (route.fromLocation && route.toLocation) {
          // Use specific locations if available
          routeName = `${route.fromLocation} to ${route.toLocation}`;
        } else {
          // Fallback to city tour
          const cityName = cities.find(c => c.id === route.fromCityId)?.name || 'City';
          routeName = `${cityName} City Tour`;
        }
        routeType = 'intra-city';
      } else {
        // Inter-city route
        const fromCityName = cities.find(c => c.id === route.fromCityId)?.name || 'City';
        const toCityName = cities.find(c => c.id === route.toCityId)?.name || 'City';
        routeName = `${fromCityName} to ${toCityName}`;
        if (route.km) {
          routeName += ` (${parseFloat(route.km).toFixed(0)}km)`;
        }
        routeType = 'inter-city';
      }
      
      return {
        id: route.id,
        name: routeName,
        type: routeType
      };
    });
  };

  const loadQuoteData = (quoteData: any) => {
    if (quoteData.cityServices) {
      setCityServices(quoteData.cityServices);
    }
    if (quoteData.travelDate) {
      setTravelDate(quoteData.travelDate);
    }
    if (quoteData.totalTravelers || quoteData.travelers) {
      setGlobalTravelers(quoteData.totalTravelers || quoteData.travelers);
    }
  };

  const getCurrentQuoteData = () => {
    return {
      cityServices,
      travelDate,
      totalTravelers: globalTravelers,
      travelers: globalTravelers,
      totalPricing
    };
  };

  // Enhanced city filtering and recommendations
  const getFilteredCities = () => {
    const { budgetRange, travelStyle, preferredActivities } = searchFilters;
    
    return cities.filter(city => {
      if (citySearchTerm && !city.name.toLowerCase().includes(citySearchTerm.toLowerCase())) {
        return false;
      }
      return true;
    }).map(city => {
      // Add budget estimates and recommendations
      const basePrice = getBudgetEstimate(city.id, travelStyle);
      const isRecommended = isWithinBudget(basePrice, budgetRange);
      const hasPreferredActivities = getActivityScore(city.id, preferredActivities);
      
      return {
        ...city,
        estimatedPrice: basePrice,
        isRecommended,
        activityScore: hasPreferredActivities,
        description: getCityDescription(city.name)
      };
    }).sort((a, b) => {
      // Sort by recommendation score
      const scoreA = (a.isRecommended ? 10 : 0) + a.activityScore;
      const scoreB = (b.isRecommended ? 10 : 0) + b.activityScore;
      return scoreB - scoreA;
    });
  };

  const getBudgetEstimate = (cityId: number, style: string) => {
    const baseRates = {
      1: { budget: 80, balanced: 150, luxury: 300 }, // Cairo
      2: { budget: 70, balanced: 120, luxury: 250 }, // Alexandria  
      3: { budget: 90, balanced: 180, luxury: 350 }, // Luxor
      4: { budget: 85, balanced: 160, luxury: 320 }  // Aswan
    };
    return baseRates[cityId as keyof typeof baseRates]?.[style as keyof typeof baseRates[1]] || 100;
  };

  const isWithinBudget = (price: number, range: { min: number; max: number }) => {
    return price >= range.min && price <= range.max;
  };

  const getActivityScore = (cityId: number, activities: string[]) => {
    const cityActivities = {
      1: ['historical', 'cultural', 'museums', 'nightlife'], // Cairo
      2: ['coastal', 'historical', 'cultural', 'relaxation'], // Alexandria
      3: ['historical', 'temples', 'cultural', 'adventure'], // Luxor
      4: ['cultural', 'temples', 'relaxation', 'adventure']  // Aswan
    };
    
    const matches = activities.filter(activity => 
      cityActivities[cityId as keyof typeof cityActivities]?.includes(activity)
    );
    return matches.length;
  };

  const getCityDescription = (cityName: string) => {
    const descriptions = {
      'Cairo': 'Ancient capital with pyramids, museums, and vibrant culture',
      'Alexandria': 'Mediterranean coastal city with Greco-Roman heritage',
      'Luxor': 'Open-air museum with Valley of Kings and magnificent temples',
      'Aswan': 'Nubian culture hub with beautiful Nile scenery and temples'
    };
    return descriptions[cityName as keyof typeof descriptions] || 'Historic Egyptian destination';
  };

  // Smart itinerary suggestions
  const getItinerarySuggestions = () => {
    const { budgetRange, duration, preferredActivities, travelStyle } = searchFilters;
    
    const suggestions = [
      {
        id: 'classic',
        name: 'Classic Egypt Explorer',
        duration: 7,
        cities: ['Cairo', 'Luxor', 'Aswan'],
        estimatedCost: travelStyle === 'budget' ? 850 : travelStyle === 'luxury' ? 2100 : 1400,
        activities: ['historical', 'cultural', 'temples'],
        highlights: ['Pyramids of Giza', 'Valley of the Kings', 'Abu Simbel'],
        description: 'Essential Egypt experience covering ancient wonders'
      },
      {
        id: 'coastal',
        name: 'Mediterranean & Ancient Wonders',
        duration: 5,
        cities: ['Alexandria', 'Cairo'],
        estimatedCost: travelStyle === 'budget' ? 600 : travelStyle === 'luxury' ? 1500 : 950,
        activities: ['coastal', 'historical', 'cultural'],
        highlights: ['Library of Alexandria', 'Pyramids', 'Mediterranean Coast'],
        description: 'Blend of coastal relaxation and historic exploration'
      },
      {
        id: 'comprehensive',
        name: 'Grand Egypt Journey',
        duration: 12,
        cities: ['Cairo', 'Alexandria', 'Luxor', 'Aswan'],
        estimatedCost: travelStyle === 'budget' ? 1800 : travelStyle === 'luxury' ? 4200 : 2800,
        activities: ['historical', 'cultural', 'temples', 'coastal'],
        highlights: ['All major sites', 'Nile cruise', 'Desert experience'],
        description: 'Complete Egypt adventure covering all regions'
      }
    ];

    return suggestions.filter(suggestion => {
      const withinBudget = suggestion.estimatedCost >= budgetRange.min && suggestion.estimatedCost <= budgetRange.max;
      const withinDuration = suggestion.duration >= duration.min && suggestion.duration <= duration.max;
      const hasPreferredActivities = preferredActivities.length === 0 || 
        preferredActivities.some(activity => suggestion.activities.includes(activity));
      
      return withinBudget && withinDuration && hasPreferredActivities;
    }).map(suggestion => ({
      ...suggestion,
      matchScore: getMatchScore(suggestion, preferredActivities)
    })).sort((a, b) => b.matchScore - a.matchScore);
  };

  const getMatchScore = (suggestion: any, activities: string[]) => {
    if (activities.length === 0) return 5;
    const matches = activities.filter(activity => suggestion.activities.includes(activity));
    return matches.length;
  };

  const applyItinerarySuggestion = (suggestion: any) => {
    const newCityServices = suggestion.cities.map((cityName: string) => {
      const city = cities.find(c => c.name === cityName);
      if (!city) return null;

      return {
        cityId: city.id,
        cityName: city.name,
        date: travelDate,
        travelers: globalTravelers,
        selectedRoutes: [],
        attractions: "",
        selectedAttractions: [],
        selectedAddOns: []
      };
    }).filter(Boolean);

    setCityServices(newCityServices);
    setShowAdvancedFilters(false);
  };

  return (
    <div id="quote-builder" className="max-w-7xl mx-auto px-4 py-8">
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Build Quote
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Saved Quotes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Calculator className="w-6 h-6 text-primary" />
                Multi-City Egypt Travel Pricing Tool
              </CardTitle>
              <p className="text-muted-foreground">
                Build your complete Egypt itinerary city by city with instant pricing
              </p>
            </CardHeader>
            
            <CardContent>
              {/* Main Travel Date and Travelers */}
              <div className="flex items-center gap-6 mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <Label htmlFor="travel-date" className="font-medium">Trip Start Date:</Label>
                  <Input
                    id="travel-date"
                    type="date"
                    value={travelDate}
                    onChange={(e) => {
                      setTravelDate(e.target.value);
                      // Update all city services with the new date
                      setCityServices(prev => prev.map(city => ({ ...city, date: e.target.value })));
                    }}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <Label htmlFor="total-travelers" className="font-medium">Total Travelers:</Label>
                  <Select
                    value={globalTravelers.toString()}
                    onValueChange={(value) => {
                      const travelers = parseInt(value);
                      setGlobalTravelers(travelers);
                      // Update all city services with the new traveler count
                      setCityServices(prev => prev.map(city => ({ ...city, travelers })));
                    }}
                  >
                    <SelectTrigger className="w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Search and Filtering Interface */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-primary">Smart Itinerary Builder</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-primary border-primary/30 hover:bg-primary/10"
                  >
                    <Sliders className="w-4 h-4 mr-2" />
                    {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>

                {showAdvancedFilters && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Budget Range */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium">
                          <DollarSign className="w-4 h-4 text-primary" />
                          Budget per Day ($)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={searchFilters.budgetRange.min}
                            onChange={(e) => setSearchFilters(prev => ({
                              ...prev,
                              budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                            }))}
                            className="w-20"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={searchFilters.budgetRange.max}
                            onChange={(e) => setSearchFilters(prev => ({
                              ...prev,
                              budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                            }))}
                            className="w-20"
                          />
                        </div>
                      </div>

                      {/* Travel Style */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium">
                          <Star className="w-4 h-4 text-primary" />
                          Travel Style
                        </Label>
                        <Select
                          value={searchFilters.travelStyle}
                          onValueChange={(value: 'budget' | 'balanced' | 'luxury') => 
                            setSearchFilters(prev => ({ ...prev, travelStyle: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="budget">Budget (Essential experiences)</SelectItem>
                            <SelectItem value="balanced">Balanced (Comfort + Value)</SelectItem>
                            <SelectItem value="luxury">Luxury (Premium experiences)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trip Duration */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4 text-primary" />
                          Trip Duration (days)
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={searchFilters.duration.min}
                            onChange={(e) => setSearchFilters(prev => ({
                              ...prev,
                              duration: { ...prev.duration, min: Number(e.target.value) }
                            }))}
                            className="w-16"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            type="number"
                            placeholder="Max"
                            value={searchFilters.duration.max}
                            onChange={(e) => setSearchFilters(prev => ({
                              ...prev,
                              duration: { ...prev.duration, max: Number(e.target.value) }
                            }))}
                            className="w-16"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Smart Itinerary Suggestions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <Label className="font-medium">Recommended Itineraries</Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {getItinerarySuggestions().slice(0, 3).map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-card"
                            onClick={() => applyItinerarySuggestion(suggestion)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{suggestion.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.duration} days
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span>{suggestion.cities.join(' → ')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-primary" />
                                <span>${suggestion.estimatedCost} total</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.highlights.slice(0, 2).map((highlight, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {highlight}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full mt-3 h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                applyItinerarySuggestion(suggestion);
                              }}
                            >
                              Apply Itinerary
                            </Button>
                          </div>
                        ))}
                      </div>
                      {getItinerarySuggestions().length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No itineraries match your current filters. Try adjusting your budget or duration.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Activity Preferences */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Preferred Activities</Label>
                  <div className="flex flex-wrap gap-2">
                    {['historical', 'cultural', 'museums', 'temples', 'coastal', 'adventure', 'relaxation', 'nightlife'].map((activity) => (
                      <Badge
                        key={activity}
                        variant={searchFilters.preferredActivities.includes(activity) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          searchFilters.preferredActivities.includes(activity) 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'hover:bg-primary/10 hover:text-primary'
                        }`}
                        onClick={() => {
                          setSearchFilters(prev => ({
                            ...prev,
                            preferredActivities: prev.preferredActivities.includes(activity)
                              ? prev.preferredActivities.filter(a => a !== activity)
                              : [...prev.preferredActivities, activity]
                          }));
                        }}
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Enhanced City Selection */}
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search cities..."
                      value={citySearchTerm}
                      onChange={(e) => setCitySearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Popover open={showCityPicker} onOpenChange={setShowCityPicker}>
                    <PopoverTrigger asChild>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Destination
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96" align="start">
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          Choose Your Next Destination
                        </h4>
                        <div className="grid gap-3 max-h-80 overflow-y-auto">
                          {getFilteredCities().map((city: any) => (
                            <div
                              key={city.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                city.isRecommended 
                                  ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                                  : 'border-muted hover:border-primary/30 hover:bg-muted/50'
                              }`}
                              onClick={() => {
                                const newCityService: CityService = {
                                  cityId: city.id,
                                  cityName: city.name,
                                  date: travelDate,
                                  travelers: globalTravelers,
                                  selectedRoutes: [],
                                  attractions: "",
                                  selectedAttractions: [],
                                  selectedAddOns: []
                                };
                                setCityServices([...cityServices, newCityService]);
                                setShowCityPicker(false);
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium">{city.name}</h5>
                                    {city.isRecommended && (
                                      <Badge variant="default" className="bg-primary text-xs">
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{city.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      ${city.estimatedPrice}/day
                                    </span>
                                    {city.activityScore > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3" />
                                        {city.activityScore} matching activities
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {/* Horizontal Layout Table */}
              <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">City</TableHead>
                  <TableHead className="min-w-[200px]">Transportation</TableHead>
                  <TableHead className="min-w-[140px]">Guide</TableHead>
                  <TableHead className="min-w-[160px]">Attractions</TableHead>
                  <TableHead className="min-w-[140px]">Per Person Add-ons</TableHead>
                  <TableHead className="min-w-[140px]">Per Unit Add-ons</TableHead>
                  <TableHead className="min-w-[100px]">Total/Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityServices.map((cityService, index) => {
                  const cityRoutes = getCurrentCityRoutes(cityService.cityId);
                  const interCityRoutes = cityRoutes.filter((r: Route) => r.type === 'inter-city');
                  const intraCityRoutes = cityRoutes.filter((r: Route) => r.type === 'intra-city' || r.type === 'airport' || r.type === 'activity');
                  const cityBreakdown = totalPricing?.breakdown?.find((b: any) => b.cityName === cityService.cityName);
                  const cityTotal = cityBreakdown ? Math.round(cityBreakdown.amount / cityService.travelers) : 0;

                  return (
                    <TableRow key={index} className="border-b">
                      {/* City */}
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cityService.cityName}
                            {index === cityServices.length - 1 && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newCityServices = cityServices.filter((_, i) => i !== index);
                              setCityServices(newCityServices);
                            }}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove city"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Transportation */}
                      <TableCell>
                        <TransportationSearch
                          routes={routes || []}
                          selectedRoutes={cityService.selectedRoutes}
                          onRoutesChange={(routes) => updateCityService(index, { selectedRoutes: routes })}
                          cityId={cityService.cityId}
                          cityName={cityService.cityName}
                        />
                      </TableCell>

                      {/* Guide */}
                      <TableCell>
                        <GuideSearch
                          languages={languages || []}
                          selectedGuide={cityService.selectedGuide}
                          onGuideChange={(guide) => updateCityService(index, { selectedGuide: guide })}
                          cityName={cityService.cityName}
                        />
                      </TableCell>

                      {/* Attractions */}
                      <TableCell>
                        <AttractionsSearch
                          attractions={attractions || []}
                          selectedAttractions={cityService.selectedAttractions || []}
                          onAttractionsChange={(attractions) => updateCityService(index, { selectedAttractions: attractions })}
                          cityId={cityService.cityId}
                          cityName={cityService.cityName}
                        />
                      </TableCell>

                      {/* Per Person Add-ons */}
                      <TableCell>
                        <AddOnsSearch
                          addOns={addOns || []}
                          selectedAddOns={cityService.selectedAddOns.filter(a => 
                            addOns.find(addon => addon.id === a.id && (addon.unitType === 'per_person' || addon.unitType === 'per_trip'))
                          )}
                          onAddOnsChange={(addons) => {
                            const perUnitAddOns = cityService.selectedAddOns.filter(a => 
                              addOns.find(addon => addon.id === a.id && addon.unitType === 'per_unit')
                            );
                            updateCityService(index, { selectedAddOns: [...addons, ...perUnitAddOns] });
                          }}
                          cityId={cityService.cityId}
                          cityName={cityService.cityName}
                          unitTypeFilter="per_person"
                        />
                      </TableCell>

                      {/* Per Unit Add-ons */}
                      <TableCell>
                        <AddOnsSearch
                          addOns={addOns || []}
                          selectedAddOns={cityService.selectedAddOns.filter(a => 
                            addOns.find(addon => addon.id === a.id && addon.unitType === 'per_unit')
                          )}
                          onAddOnsChange={(addons) => {
                            const perPersonAddOns = cityService.selectedAddOns.filter(a => 
                              addOns.find(addon => addon.id === a.id && (addon.unitType === 'per_person' || addon.unitType === 'per_trip'))
                            );
                            updateCityService(index, { selectedAddOns: [...perPersonAddOns, ...addons] });
                          }}
                          cityId={cityService.cityId}
                          cityName={cityService.cityName}
                          unitTypeFilter="per_unit"
                        />
                      </TableCell>

                      {/* Total Per Person */}
                      <TableCell>
                        <div className="price-chip text-lg font-bold">
                          ${cityTotal}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-3">
              {!showCityPicker ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCityPicker(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add City
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Select onValueChange={(value) => {
                    const cityId = parseInt(value);
                    const selectedCity = cities.find((c: any) => c.id === cityId);
                    if (selectedCity && !cityServices.find(cs => cs.cityId === cityId)) {
                      const newCityService: CityService = {
                        cityId: selectedCity.id,
                        cityName: selectedCity.name,
                        date: travelDate || new Date().toISOString().split('T')[0],
                        travelers: globalTravelers,
                        selectedRoutes: [],
                        attractions: "",
                        selectedAttractions: [],
                        selectedAddOns: []
                      };
                      setCityServices(prev => [...prev, newCityService]);
                    }
                    setShowCityPicker(false);
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose a city to visit" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.filter((city: any) => !cityServices.find(cs => cs.cityId === city.id)).map((city: any) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {city.name}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {city.description?.split('.')[0]?.substring(0, 30)}...
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCityPicker(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {totalPricing && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Final Total Per Person</div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    ${totalPricing.perPersonAmount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: ${totalPricing.totalAmount} for {totalPricing.travelers} travelers
                  </div>
                </div>
              )}

              {pricingMutation.isPending ? (
                <Button size="lg" disabled className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full"></div>
                  Calculating...
                </Button>
              ) : (
                <Button 
                  size="lg"
                  className="flex items-center gap-2 transition-all duration-200"
                  disabled={cityServices.length === 0 || !totalPricing || totalPricing.totalAmount === 0}
                  onClick={handleContinueBooking}
                >
                  Continue to Booking
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Pricing Breakdown */}
          {cityServices.length > 0 && totalPricing && totalPricing.breakdown && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {totalPricing.breakdown.map((city: any, index: number) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-medium mb-2">{city.city}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Routes:</span>
                        <span className="font-mono">${city.routes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guide:</span>
                        <span className="font-mono">${city.guide || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attractions:</span>
                        <span className="font-mono">${city.attractions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add-ons:</span>
                        <span className="font-mono">${city.addOns || 0}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="font-mono">${city.total || 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="saved">
          <QuoteManager 
            currentQuote={getCurrentQuoteData()}
            onLoadQuote={loadQuoteData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}