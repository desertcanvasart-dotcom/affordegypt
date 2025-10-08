import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator, ChevronDown, X, Save, BookOpen, Filter, Search, Sliders, DollarSign, Clock, Star, MapPinned, Check, ChevronRight, ChevronLeft, Shield, CreditCard, Package } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import QuoteManager from "@/components/quote-manager";
import AttractionsSearch from "@/components/attractions-search";
import TransportationSearch from "@/components/transportation-search";
import { GuideSearch } from "@/components/guide-search";
import { AddOnsSearch } from "@/components/addons-search";
import { useTranslatedQuery } from "@/hooks/useTranslatedQuery";
import { trackEvent, trackConversion } from "@/lib/analytics";

interface CityService {
  dayNumber: number;
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
    unitType?: string;
    price?: string;
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

// Progress Indicator Component
function StepProgress({ currentStep, steps, onStepClick }: { 
  currentStep: number; 
  steps: Array<{ number: number; title: string; description: string }>; 
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={step.number > currentStep + 1}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                  ${step.number < currentStep 
                    ? 'bg-primary text-white' 
                    : step.number === currentStep 
                    ? 'bg-primary text-white ring-4 ring-primary/20' 
                    : 'bg-gray-200 text-gray-500'}
                  ${step.number <= currentStep ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                `}
              >
                {step.number < currentStep ? <Check className="w-5 h-5" /> : step.number}
              </button>
              <div className="mt-2 text-center hidden sm:block">
                <div className={`text-xs font-medium ${step.number === currentStep ? 'text-primary' : 'text-gray-600'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden lg:block">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded transition-all ${step.number < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MultiCityPricingTool() {
  const { t } = useTranslation();
  
  // Step-based navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedCityIndex, setExpandedCityIndex] = useState<number | null>(0);
  const stepContentRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [cityServices, setCityServices] = useState<CityService[]>([]);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [totalPricing, setTotalPricing] = useState<any>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [travelDate, setTravelDate] = useState<string>('');
  const [globalTravelers, setGlobalTravelers] = useState<number>(1);
  const [tripStyle, setTripStyle] = useState<'private' | 'shared'>('private');
  const [pickupCity, setPickupCity] = useState<string>('');
  const [, setLocation] = useLocation();
  
  // Checkout form state
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    accommodation: '',
    specialRequests: '',
    termsAccepted: false,
    bookingPolicyAccepted: false,
    updatesConsent: false
  });
  
  // Enhanced search state
  const [searchFilters, setSearchFilters] = useState({
    budgetRange: { min: 0, max: 2000 },
    duration: { min: 1, max: 14 },
    travelStyle: 'balanced' as 'budget' | 'balanced' | 'luxury'
  });
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch available cities from the database with translation
  const { data: cities = [] } = useTranslatedQuery<{id: number, name: string, description?: string}[]>("/api/cities");

  // Fetch available languages
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["/api/pricing/languages"],
  });

  // Fetch available add-ons
  const { data: addOns = [] } = useQuery<AddOn[]>({
    queryKey: ["/api/addons"],
  });

  // Fetch available routes with translation and shorter stale time for real-time updates
  const { data: routes = [], refetch: refetchRoutes } = useTranslatedQuery<any[]>("/api/routes", {
    staleTime: 0, // Always fetch fresh data
    gcTime: 30 * 1000, // Keep in cache for 30 seconds (was cacheTime in v4)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });



  // Fetch available attractions with translation
  const { data: attractions = [] } = useTranslatedQuery<any[]>("/api/attractions");

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

  // Remove auto-initialization - let user add first city manually

  // Recalculate pricing when city services change
  useEffect(() => {
    if (cityServices.length > 0) {
      pricingMutation.mutate(cityServices);
    }
  }, [cityServices]);

  const addNewCity = (selectedCityId?: number) => {
    const selectedCity = selectedCityId ? cities.find(c => c.id === selectedCityId) : cities[0];
    if (!selectedCity) return;
    
    const nextDayNumber = cityServices.length + 1;
    const newCityService: CityService = {
      dayNumber: nextDayNumber,
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
    
    // Track booking initiation event for Google Analytics
    trackEvent('initiate_checkout', 'ecommerce', 'multi_city_pricing_tool', totalPricing.totalAmount);
    
    // Track conversion for Google Ads (you can customize the conversion label)
    trackConversion('booking_initiation', totalPricing.totalAmount, 'EGP');
    
    try {
      // Enrich city services with full route data for proper display
      const enrichedItinerary = await Promise.all(cityServices.map(async (cityService) => {
        const enrichedRoutes = await Promise.all(cityService.selectedRoutes.map(async (routeId) => {
          const route = routes.find(r => r.id === routeId);
          return route ? {
            id: routeId,
            fromLocation: route.fromLocation,
            toLocation: route.toLocation,
            name: route.name
          } : { id: routeId, fromLocation: 'Unknown', toLocation: 'Unknown', name: 'Route' };
        }));

        return {
          ...cityService,
          selectedRoutes: enrichedRoutes
        };
      }));

      // Create a quote in the database with proper structure
      const quoteData = {
        total: totalPricing.totalAmount.toString(),
        commissionPct: "0", // No commission added
        jsonBlob: {
          passengers: totalPricing.travelers,
          itinerary: enrichedItinerary,
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
        total: (totalPricing?.totalAmount || 0).toString(),
        travelers: (totalPricing?.travelers || 1).toString(),
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
    
    // Filter routes that start from this city and preserve database ordering
    return routes
      .filter((route: any) => {
        return route.fromCityId === cityId;
      })
      .sort((a: any, b: any) => {
        // Sort by displayOrder first, then by id to maintain consistent ordering
        const orderA = a.displayOrder || 0;
        const orderB = b.displayOrder || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.id - b.id;
      })
      .map((route: any) => {
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
    const { budgetRange, travelStyle } = searchFilters;
    
    return cities.filter(city => {
      if (citySearchTerm && !city.name.toLowerCase().includes(citySearchTerm.toLowerCase())) {
        return false;
      }
      return true;
    }).map(city => {
      // Add budget estimates and recommendations
      const basePrice = getBudgetEstimate(city.id, travelStyle);
      const isRecommended = isWithinBudget(basePrice, budgetRange);
      const hasPreferredActivities = getActivityScore(city.id, []);
      
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
      1: { budget: 40, balanced: 75, luxury: 150 }, // Cairo - reduced by half
      2: { budget: 35, balanced: 60, luxury: 125 }, // Alexandria - reduced by half  
      3: { budget: 45, balanced: 90, luxury: 175 }, // Luxor - reduced by half
      4: { budget: 42, balanced: 80, luxury: 160 }  // Aswan - reduced by half
    };
    return baseRates[cityId as keyof typeof baseRates]?.[style as keyof typeof baseRates[1]] || 50;
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
    // Use the city description from the database
    const city = cities.find(c => c.name === cityName);
    return city?.description || 'Historic Egyptian destination';
  };

  // Smart itinerary suggestions
  const getItinerarySuggestions = () => {
    const { budgetRange, duration, travelStyle } = searchFilters;
    
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
      
      return withinBudget && withinDuration;
    }).map(suggestion => ({
      ...suggestion,
      matchScore: 5
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

  // Step navigation helpers
  const steps = [
    { number: 1, title: 'Trip Overview', description: 'Start your journey' },
    { number: 2, title: 'Destinations', description: 'Plan your stops' },
    { number: 3, title: 'Add-ons & Upgrades', description: 'Enhance your trip' },
    { number: 4, title: 'Review & Pricing', description: 'Check your itinerary' },
    { number: 5, title: 'Checkout', description: 'Complete booking' }
  ];

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return travelDate && globalTravelers > 0;
      case 3:
        return cityServices.length > 0;
      case 4:
        return true; // Can always review
      case 5:
        return totalPricing && totalPricing.totalAmount > 0;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (currentStep < 5 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
      // Scroll to step content area, not top of page
      setTimeout(() => {
        stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Scroll to step content area, not top of page
      setTimeout(() => {
        stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div id="quote-builder" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 mx-auto max-w-md">
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Build Quote</span>
            <span className="sm:hidden">Quote</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Saved Quotes</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                <span>Design Your Egypt Adventure</span>
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Craft your perfect journey with transparent pricing at every step
              </p>
            </CardHeader>
            
            <CardContent>
              {/* Progress Indicator */}
              <StepProgress 
                currentStep={currentStep} 
                steps={steps}
                onStepClick={(step) => {
                  if (step <= currentStep) setCurrentStep(step);
                }}
              />

              {/* Step Content Container - Scroll Target */}
              <div ref={stepContentRef}>
                {/* STEP 1: Trip Overview */}
                {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold mb-2">Let's Start Planning Your Adventure</h3>
                    <p className="text-sm text-muted-foreground">Tell us about your trip basics</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Travel Date */}
                    <div className="p-4 bg-white border rounded-lg shadow-sm">
                      <Label htmlFor="travel-date" className="text-sm font-medium mb-2 block">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        When do you want to start your trip?
                      </Label>
                      <Input
                        id="travel-date"
                        type="date"
                        value={travelDate}
                        onChange={(e) => {
                          setTravelDate(e.target.value);
                          setCityServices(prev => prev.map(city => ({ ...city, date: e.target.value })));
                        }}
                        className="w-full"
                        required
                      />
                    </div>

                    {/* Number of Travelers */}
                    <div className="p-4 bg-white border rounded-lg shadow-sm">
                      <Label htmlFor="total-travelers" className="text-sm font-medium mb-2 block">
                        <Users className="w-4 h-4 inline mr-2" />
                        How many travelers?
                      </Label>
                      <Select
                        value={globalTravelers.toString()}
                        onValueChange={(value) => {
                          const newTravelers = parseInt(value);
                          setGlobalTravelers(newTravelers);
                          setCityServices(prev => prev.map(city => ({ ...city, travelers: newTravelers })));
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number of travelers" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'traveler' : 'travelers'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Service Type Notice */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900">Private Service</div>
                          <div className="text-sm text-blue-700">All our services are private with your own vehicle & guide</div>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="flex items-center justify-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-900 font-medium">100% Secure & Transparent Pricing</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={goToNextStep}
                      disabled={!travelDate || !globalTravelers}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-blue-600"
                    >
                      Continue to Destinations
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Destinations Selection */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Plan Your Destinations</h2>
                    <p className="text-muted-foreground">Add destinations and select activities for each day of your trip</p>
                  </div>

                  {/* City Selector - shown when no destinations yet */}
                  {cityServices.length === 0 && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg">
                      <div className="text-center mb-6">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="text-lg font-semibold mb-2">Choose Your First Destination</h3>
                        <p className="text-sm text-muted-foreground">Select a city to start planning your trip</p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <Label className="text-sm font-medium mb-2 block">Select Destination</Label>
                        <Select
                          onValueChange={(value) => {
                            if (!cities || cities.length === 0) return;
                            
                            const selectedCity = cities.find((c: any) => c.id === parseInt(value));
                            if (!selectedCity) return;
                            
                            const newCity: CityService = {
                              dayNumber: 1,
                              cityId: selectedCity.id,
                              cityName: selectedCity.name,
                              date: travelDate,
                              travelers: globalTravelers,
                              selectedRoutes: [],
                              attractions: '',
                              selectedAttractions: [],
                              selectedAddOns: []
                            };
                            
                            setCityServices([newCity]);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a city to visit" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities?.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {city.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Destination Cards - Accordion Style */}
                  {cityServices.length > 0 && (
                    <Accordion 
                      type="multiple" 
                      defaultValue={cityServices.map((c) => `day-${c.dayNumber}`)}
                      className="space-y-4"
                    >
                    {cityServices.map((city, index) => {
                      const cityData = cities?.find((c: any) => c.id === city.cityId);
                      const cityRoutes = routes?.filter((route: any) => {
                        const routeName = route.name.toLowerCase();
                        return routeName.includes(city.cityName.toLowerCase());
                      });
                      
                      return (
                        <AccordionItem key={index} value={`day-${city.dayNumber}`} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-4 w-full">
                              <Badge className="bg-primary">Day {city.dayNumber}</Badge>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{city.cityName}</span>
                              </div>
                              <div className="flex items-center gap-2 ml-auto mr-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {city.date ? new Date(city.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Set date'}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 pb-4 pt-2">
                            <div className="space-y-4">
                              {/* Route Selection */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <MapPinned className="w-4 h-4" />
                                  Transfer Routes
                                </Label>
                                <TransportationSearch
                                  routes={routes || []}
                                  selectedRoutes={city.selectedRoutes}
                                  onRoutesChange={(routes) => {
                                    setCityServices(prev => prev.map((c, i) =>
                                      i === index ? { ...c, selectedRoutes: routes } : c
                                    ));
                                  }}
                                  cityId={city.cityId}
                                  cityName={city.cityName}
                                />
                              </div>

                              {/* Guide Selection */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Tour Guide (Optional)
                                </Label>
                                <GuideSearch
                                  languages={languages || []}
                                  cityId={city.cityId}
                                  cityName={city.cityName}
                                  selectedGuide={city.selectedGuide}
                                  onGuideChange={(guide) => {
                                    setCityServices(prev => prev.map((c, i) =>
                                      i === index ? { ...c, selectedGuide: guide } : c
                                    ));
                                  }}
                                />
                              </div>

                              {/* Attractions */}
                              <div className="space-y-2">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Attractions & Sites
                                </Label>
                                <AttractionsSearch
                                  attractions={attractions || []}
                                  cityId={city.cityId}
                                  cityName={city.cityName}
                                  selectedAttractions={city.selectedAttractions}
                                  onAttractionsChange={(attractions) => {
                                    setCityServices(prev => prev.map((c, i) =>
                                      i === index ? { ...c, selectedAttractions: attractions } : c
                                    ));
                                  }}
                                />
                              </div>

                              {/* Remove Day Button */}
                              <div className="pt-2 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setCityServices(prev => prev.filter((_, i) => i !== index)
                                      .map((c, i) => ({ ...c, dayNumber: i + 1 })));
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remove Day {city.dayNumber}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                  )}

                  {/* Add Another Day - City Selector */}
                  {cityServices.length > 0 && (
                    <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium whitespace-nowrap">
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add Day {cityServices.length + 1}
                        </Label>
                        <Select
                          onValueChange={(value) => {
                            if (!cities || cities.length === 0) return;
                            
                            const selectedCity = cities.find((c: any) => c.id === parseInt(value));
                            if (!selectedCity) return;
                            
                            const nextDayNumber = cityServices.length + 1;
                            const nextDate = travelDate ? 
                              new Date(new Date(travelDate).getTime() + (nextDayNumber - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '';
                            
                            const newCity: CityService = {
                              dayNumber: nextDayNumber,
                              cityId: selectedCity.id,
                              cityName: selectedCity.name,
                              date: nextDate,
                              travelers: globalTravelers,
                              selectedRoutes: [],
                              attractions: '',
                              selectedAttractions: [],
                              selectedAddOns: []
                            };
                            
                            setCityServices(prev => [...prev, newCity]);
                            // Auto-expand the newly added day
                            setExpandedCityIndex(cityServices.length);
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select destination for next day" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities?.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {city.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      size="lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Overview
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={cityServices.length === 0}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-blue-600"
                    >
                      Continue to Add-ons
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Add-ons & Upgrades */}
              {currentStep === 3 && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Add-ons & Upgrades</h2>
                    <p className="text-muted-foreground">Enhance your trip with optional extras (you can skip this step)</p>
                  </div>

                  {/* Add-ons for each day */}
                  {cityServices.length > 0 && (
                    <div className="space-y-4">
                      {cityServices.map((city, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Badge className="bg-primary">Day {city.dayNumber}</Badge>
                            <span className="font-semibold">{city.cityName}</span>
                          </div>
                          
                          <AddOnsSearch
                            addOns={addOns || []}
                            selectedAddOns={city.selectedAddOns || []}
                            onAddOnsChange={(selectedAddOns) => {
                              setCityServices(prev => prev.map((c, i) =>
                                i === index ? { ...c, selectedAddOns } : c
                              ));
                            }}
                            cityId={city.cityId}
                            cityName={city.cityName}
                          />
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      size="lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Destinations
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-blue-600"
                    >
                      Continue to Review
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Pricing */}
              {currentStep === 4 && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Review Your Itinerary</h2>
                    <p className="text-muted-foreground">Check all details before proceeding to checkout</p>
                  </div>

                  {/* Trip Summary */}
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                    <h3 className="text-lg font-semibold mb-4">Trip Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-semibold">{travelDate ? new Date(travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Travelers</p>
                        <p className="font-semibold">{globalTravelers} {globalTravelers === 1 ? 'Person' : 'People'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Days</p>
                        <p className="font-semibold">{cityServices.length} {cityServices.length === 1 ? 'Day' : 'Days'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="font-semibold text-primary">{totalPricing?.totalAmount?.toFixed(1) || 0} EGP</p>
                      </div>
                    </div>
                  </Card>

                  {/* Day-by-Day Breakdown */}
                  <Accordion type="multiple" defaultValue={cityServices.map((c) => `review-day-${c.dayNumber}`)} className="space-y-4">
                    {cityServices.map((city, index) => {
                      const cityBreakdown = totalPricing?.breakdown?.find((b: any) => b.city === city.cityName);
                      
                      return (
                        <AccordionItem key={index} value={`review-day-${city.dayNumber}`} className="border rounded-lg">
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-4 w-full">
                              <Badge className="bg-primary">Day {city.dayNumber}</Badge>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{city.cityName}</span>
                              </div>
                              <div className="ml-auto mr-2">
                                <span className="text-sm font-semibold">{cityBreakdown?.total?.toFixed(1) || 0} EGP</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 pb-4 pt-2">
                            <div className="space-y-3">
                              {/* Routes */}
                              {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPinned className="w-4 h-4" />
                                    Routes
                                  </h4>
                                  <ul className="text-sm space-y-1 ml-6">
                                    {city.selectedRoutes.map(routeId => {
                                      const route = routes?.find(r => r.id === routeId);
                                      return route ? <li key={routeId}>• {route.name}</li> : null;
                                    })}
                                  </ul>
                                </div>
                              )}

                              {/* Guide */}
                              {city.selectedGuide && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Tour Guide
                                  </h4>
                                  <p className="text-sm ml-6">• {city.selectedGuide.language} guide ({city.selectedGuide.duration} hours)</p>
                                </div>
                              )}

                              {/* Attractions */}
                              {city.selectedAttractions && city.selectedAttractions.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Attractions
                                  </h4>
                                  <ul className="text-sm space-y-1 ml-6">
                                    {city.selectedAttractions.map((attraction, i) => (
                                      <li key={i}>• {attraction}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Add-ons */}
                              {city.selectedAddOns && city.selectedAddOns.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Add-ons
                                  </h4>
                                  <ul className="text-sm space-y-1 ml-6">
                                    {city.selectedAddOns.map((addon, i) => (
                                      <li key={i}>• {addon.name} (x{addon.quantity})</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Edit Button */}
                              <div className="pt-2 border-t">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setCurrentStep(2)}
                                  className="text-primary hover:text-primary/80"
                                >
                                  Edit Day {city.dayNumber}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      size="lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Add-ons
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      size="lg"
                      className="bg-gradient-to-r from-primary to-blue-600"
                    >
                      Proceed to Checkout
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: Checkout */}
              {currentStep === 5 && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Complete Your Booking</h2>
                    <p className="text-muted-foreground">Enter your details to finalize your reservation</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Contact Information */}
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="checkout-name">Full Name *</Label>
                            <Input
                              id="checkout-name"
                              placeholder="John Doe"
                              className="mt-1"
                              value={checkoutData.name}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, name: e.target.value }))}
                              data-testid="input-customer-name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="checkout-email">Email Address *</Label>
                            <Input
                              id="checkout-email"
                              type="email"
                              placeholder="john@example.com"
                              className="mt-1"
                              value={checkoutData.email}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, email: e.target.value }))}
                              data-testid="input-customer-email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="checkout-phone">Phone Number *</Label>
                            <Input
                              id="checkout-phone"
                              type="tel"
                              placeholder="+1 234 567 8900"
                              className="mt-1"
                              value={checkoutData.phone}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                              data-testid="input-customer-phone"
                            />
                          </div>
                          <div>
                            <Label htmlFor="checkout-nationality">Nationality (Optional)</Label>
                            <Input
                              id="checkout-nationality"
                              placeholder="e.g., American"
                              className="mt-1"
                              value={checkoutData.nationality}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, nationality: e.target.value }))}
                              data-testid="input-customer-nationality"
                            />
                          </div>
                          <div>
                            <Label htmlFor="checkout-accommodation">Hotel/Accommodation (Optional)</Label>
                            <Input
                              id="checkout-accommodation"
                              placeholder="Hotel name or address"
                              className="mt-1"
                              value={checkoutData.accommodation}
                              onChange={(e) => setCheckoutData(prev => ({ ...prev, accommodation: e.target.value }))}
                              data-testid="input-customer-accommodation"
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Special Requests */}
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
                        <Label htmlFor="checkout-requests">Any special requirements or requests?</Label>
                        <textarea
                          id="checkout-requests"
                          className="w-full mt-2 min-h-24 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Dietary requirements, accessibility needs, preferences..."
                          value={checkoutData.specialRequests}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          data-testid="input-special-requests"
                        />
                      </Card>

                      {/* Terms & Conditions */}
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id="terms-service" 
                              checked={checkoutData.termsAccepted}
                              onCheckedChange={(checked) => setCheckoutData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
                              data-testid="checkbox-terms" 
                            />
                            <Label htmlFor="terms-service" className="text-sm leading-relaxed cursor-pointer">
                              I agree to the <a href="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>
                            </Label>
                          </div>
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id="booking-policy" 
                              checked={checkoutData.bookingPolicyAccepted}
                              onCheckedChange={(checked) => setCheckoutData(prev => ({ ...prev, bookingPolicyAccepted: checked as boolean }))}
                              data-testid="checkbox-booking-policy" 
                            />
                            <Label htmlFor="booking-policy" className="text-sm leading-relaxed cursor-pointer">
                              I understand and accept the <a href="/booking-policy" className="text-primary hover:underline" target="_blank">Booking Policy</a> and cancellation terms
                            </Label>
                          </div>
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              id="updates-consent" 
                              checked={checkoutData.updatesConsent}
                              onCheckedChange={(checked) => setCheckoutData(prev => ({ ...prev, updatesConsent: checked as boolean }))}
                              data-testid="checkbox-updates" 
                            />
                            <Label htmlFor="updates-consent" className="text-sm leading-relaxed cursor-pointer">
                              I'd like to receive updates and special offers via email (optional)
                            </Label>
                          </div>
                        </div>
                      </Card>

                      {/* Payment Information */}
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900">Secure Booking Request</h4>
                            </div>
                            <p className="text-sm text-blue-800">
                              Your booking request will be confirmed by our team. We'll send you payment instructions and booking confirmation via email within 24 hours.
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>✓ No payment required now</p>
                            <p>✓ Flexible payment options available</p>
                            <p>✓ Secure transaction processing</p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Order Summary - Right Side */}
                    <div className="lg:col-span-1">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        
                        {/* Trip Details */}
                        <div className="space-y-3 mb-4 pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Travel Date</span>
                            <span className="font-medium">{travelDate ? new Date(travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Travelers</span>
                            <span className="font-medium">{globalTravelers} {globalTravelers === 1 ? 'Person' : 'People'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Days</span>
                            <span className="font-medium">{cityServices.length} {cityServices.length === 1 ? 'Day' : 'Days'}</span>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2 mb-4 pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span>Transportation</span>
                            <span>{totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.routes || 0), 0)?.toFixed(1) || 0} EGP</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tour Guides</span>
                            <span>{totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.guide || 0), 0)?.toFixed(1) || 0} EGP</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Attractions</span>
                            <span>{totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.attractions || 0), 0)?.toFixed(1) || 0} EGP</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Add-ons</span>
                            <span>{totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.addOns || 0), 0)?.toFixed(1) || 0} EGP</span>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-2xl font-bold text-primary">{totalPricing?.totalAmount?.toFixed(1) || 0} EGP</span>
                        </div>

                        {/* Submit Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-blue-600 text-lg py-6"
                          size="lg"
                          onClick={() => {
                            // Validation
                            if (!checkoutData.name.trim()) {
                              alert('Please enter your full name');
                              return;
                            }
                            if (!checkoutData.email.trim() || !checkoutData.email.includes('@')) {
                              alert('Please enter a valid email address');
                              return;
                            }
                            if (!checkoutData.phone.trim()) {
                              alert('Please enter your phone number');
                              return;
                            }
                            if (!checkoutData.termsAccepted) {
                              alert('Please accept the Terms of Service and Privacy Policy');
                              return;
                            }
                            if (!checkoutData.bookingPolicyAccepted) {
                              alert('Please accept the Booking Policy');
                              return;
                            }
                            
                            // Success - in production, this would submit to backend
                            alert(`Booking request submitted successfully!\n\nWe'll contact you at ${checkoutData.email} within 24 hours with payment instructions and confirmation.`);
                            
                            // Reset form and go back to step 1
                            setCheckoutData({
                              name: '',
                              email: '',
                              phone: '',
                              nationality: '',
                              accommodation: '',
                              specialRequests: '',
                              termsAccepted: false,
                              bookingPolicyAccepted: false,
                              updatesConsent: false
                            });
                            setCurrentStep(1);
                          }}
                          data-testid="button-submit-booking"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          Request Booking
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-3">
                          By submitting, you agree to our terms and conditions
                        </p>
                      </Card>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      size="lg"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Review
                    </Button>
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              {cityServices.length > 0 && totalPricing && totalPricing.breakdown && (
                <div className="mt-8">
                  <Separator className="mb-4" />
                  <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {totalPricing.breakdown.map((city: any, index: number) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-medium mb-2">{city.city}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Routes:</span>
                            <span className="font-mono">{Number(city.routes || 0).toFixed(1)} EGP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guide:</span>
                            <span className="font-mono">{Number(city.guide || 0).toFixed(1)} EGP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attractions:</span>
                            <span className="font-mono">{Number(city.attractions || 0).toFixed(1)} EGP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Add-ons:</span>
                            <span className="font-mono">{Number(city.addOns || 0).toFixed(1)} EGP</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="font-mono">{Number(city.total || 0).toFixed(1)} EGP</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              </div>
              {/* End Step Content Container */}
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