import { useState, useEffect, useRef, useMemo } from "react";
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
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator, ChevronDown, X, Save, BookOpen, Filter, Search, Sliders, DollarSign, Clock, Star, MapPinned, Check, ChevronRight, ChevronLeft, Shield, CreditCard, Package, Ticket } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { formatEGP } from "@/lib/utils";
import { useLocation } from "wouter";
import QuoteManager from "@/components/quote-manager";
import AttractionsSearch from "@/components/attractions-search";
import CatalogServicePicker, {
  type SelectedCatalogService,
  type CatalogRow,
  TRIP_TYPE_LABELS,
  VEHICLE_LABELS,
} from "@/components/catalog-service-picker";
import { GuideSearch } from "@/components/guide-search";
import { AddOnsSearch } from "@/components/addons-search";
import EntranceFeesSearch from "@/components/entrance-fees-search";
import { useTranslatedQuery } from "@/hooks/useTranslatedQuery";
import { useAuth } from "@/hooks/useAuth";
import {
  hasSentConversion,
  hasSentLead,
  markConversionSent,
  markLeadSent,
  trackPurchase,
  trackQualifiedLead,
} from "@/lib/analytics";
import {
  blockersForStep as sharedBlockersForStep,
  type QuoteState,
} from "@shared/quote-validation";

interface CityService {
  dayNumber: number;
  cityId: number;
  cityName: string;
  date: string;
  travelers: number;
  // Phase C: catalog selections replace numeric route IDs. The server
  // turns each entry into a frozen line item via /api/quotes
  // (serviceSlugs key). The legacy `selectedRoutes` shape is gone from
  // the planner; /api/routes still serves data but the planner no
  // longer reads it.
  selectedServices: SelectedCatalogService[];
  selectedGuide?: {
    language: string;
    duration: number;
  };
  attractions: string;
  selectedAttractions: string[];
  selectedEntranceFees?: string[];
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
      <nav aria-label="Quote builder progress" className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={step.number > currentStep + 1}
                // The visible label is a bare digit (or a checkmark once done),
                // which tells a screen-reader user nothing about the step.
                aria-label={`Step ${step.number}: ${step.title}${step.number < currentStep ? ' (completed)' : ''}`}
                aria-current={step.number === currentStep ? 'step' : undefined}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center font-semibold transition-all
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
              <div aria-hidden="true" className={`flex-1 h-1 mx-2 rounded transition-all ${step.number < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

/**
 * Inline validation message rendered directly beneath the field it belongs to.
 * role="alert" so screen readers announce it when it appears after a blocked
 * submit; the id lets the field point at it via aria-describedby.
 */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

// Sticky live-price panel shown in the right pane of the planner steps.
// Reads the same `totalPricing` the preview produces; full per-city totals
// (server breakdown is full, not per-person) so the rows sum to the total.
function LivePriceSummary({
  totalPricing,
  onContinue,
  ctaLabel,
  ctaDisabled,
}: {
  totalPricing: any;
  onContinue?: () => void;
  ctaLabel?: string;
  ctaDisabled?: boolean;
}) {
  const hasPricing = totalPricing && totalPricing.totalAmount > 0;
  return (
    <div className="lg:sticky lg:top-4 h-fit">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Your trip — live price</h3>
        </div>
        {hasPricing ? (
          <>
            <div className="space-y-1.5 text-sm">
              {(totalPricing.breakdown ?? []).map((b: any, i: number) => (
                <div key={i} className="flex justify-between gap-3">
                  <span className="text-muted-foreground truncate">{b.city}</span>
                  <span className="whitespace-nowrap">{formatEGP(b.total)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t">
              <span className="text-sm text-muted-foreground">
                Total · {totalPricing.travelers} {totalPricing.travelers === 1 ? "traveler" : "travelers"}
              </span>
              <span className="text-xl font-bold text-primary">{formatEGP(totalPricing.totalAmount)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{formatEGP(totalPricing.perPersonAmount)} per person</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Add destinations to see your live price.</p>
        )}
        {onContinue && (
          <Button
            onClick={onContinue}
            disabled={ctaDisabled}
            className="w-full mt-4 bg-gradient-to-r from-primary to-blue-600"
          >
            {ctaLabel ?? "Continue"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
        <p className="text-xs text-center text-muted-foreground mt-2">
          Transparent pricing — updates as you build.
        </p>
      </Card>
    </div>
  );
}

export default function MultiCityPricingTool() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const hasLocalSavedQuote = typeof window !== "undefined"
    && !!localStorage.getItem("saved_quote_id");

  // Saved Quotes tab is only meaningful for users who already have one.
  // Logged-in users may have server-side quotes; anonymous users may have a
  // saved-quote ID in localStorage from a previous session.
  const { data: serverQuotes = [] } = useQuery<any[]>({
    queryKey: ["/api/quotes"],
    enabled: isAuthenticated,
  });
  const showSavedQuotesTab = (isAuthenticated && serverQuotes.length > 0) || hasLocalSavedQuote;
  
  // Step-based navigation
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedCityIndex, setExpandedCityIndex] = useState<number | null>(0);
  const stepContentRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [cityServices, setCityServices] = useState<CityService[]>([]);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [totalPricing, setTotalPricing] = useState<any>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [travelDate, setTravelDate] = useState<string | null>('');
  const [justExploring, setJustExploring] = useState<boolean>(false);
  const [tripDuration, setTripDuration] = useState<string>('');
  // Field-keyed validation messages for the step the user is trying to leave.
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [step1DestinationId, setStep1DestinationId] = useState<string>('');
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
  const { data: allCities = [] } = useTranslatedQuery<{id: number, name: string, description?: string}[]>("/api/cities");

  // Filter out cities without services and sort alphabetically
  const cities = useMemo(() => {
    const excludedCities = [
      'asyut', 'beni suef', 'esna', 'edfu', 'kom ombo', 'qena', 
      'quseir', 'ain sokhna', 'dakhla oasis', 'kharga oasis', 'ras sudr'
    ];
    
    return allCities
      .filter((city: any) => !excludedCities.includes(city.name.toLowerCase().trim()))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [allCities]);

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
  const { data: entranceFees = [] } = useTranslatedQuery<any[]>("/api/entrance-fees");

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

  // Phase C deep-link: ?service=<slug>&city=<city> on landing.
  // The "Book this" buttons on the six service-area pages link here.
  // Behavior: fetch the service, look up the cities-table id by name,
  // pre-populate cityServices + selectedServices, jump to the right
  // step based on the row's category. Runs once when cities have
  // loaded; bails silently if anything is missing.
  const [deepLinkApplied, setDeepLinkApplied] = useState(false);
  useEffect(() => {
    if (deepLinkApplied) return;
    if (typeof window === "undefined") return;
    if (!cities || cities.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("service");
    const cityParam = params.get("city");
    if (!slug || !cityParam) return;

    setDeepLinkApplied(true);

    (async () => {
      try {
        const res = await fetch(`/api/services/${encodeURIComponent(slug)}`);
        if (!res.ok) return;
        const row: CatalogRow = await res.json();

        // Map URL city slug to cities-table row by case-insensitive
        // name match. The catalog row's city column is the canonical
        // display form ("Cairo", "Marsa Alam") so we match against
        // both the URL param and the row's city.
        const wanted = cityParam.toLowerCase().replace(/-/g, " ");
        const wantedFromRow = (row.city || "").toLowerCase();
        const matched = cities.find(
          (c: any) =>
            c.name.toLowerCase() === wanted ||
            c.name.toLowerCase() === wantedFromRow,
        );
        if (!matched) return;

        // Pick a default vehicle + the row's single trip type.
        const keys = Object.keys(row.vehicle_prices ?? {});
        if (keys.length === 0) return;
        let tripType: string | null = null;
        for (const k of keys) {
          for (const v of ["sedan", "minivan", "van"]) {
            if (k.startsWith(`${v}_`)) {
              tripType = k.slice(v.length + 1);
              break;
            }
          }
          if (tripType) break;
        }
        if (!tripType) return;
        const defaultVehicle: SelectedCatalogService["vehicleSlug"] =
          `sedan_${tripType}` in row.vehicle_prices
            ? "sedan"
            : `minivan_${tripType}` in row.vehicle_prices
              ? "minivan"
              : "van";

        const selectedService: SelectedCatalogService = {
          slug: row.slug,
          vehicleSlug: defaultVehicle,
          tripType,
          name: row.name,
          price: row.vehicle_prices[`${defaultVehicle}_${tripType}`],
        };

        const today = new Date().toISOString().split("T")[0];
        const newCityService: CityService = {
          dayNumber: 1,
          cityId: matched.id,
          cityName: matched.name,
          date: today,
          travelers: 1,
          selectedServices: [selectedService],
          attractions: "",
          selectedAttractions: [],
          selectedAddOns: [],
        };

        // Step-1 fields the canProceedToStep guards check.
        setStep1DestinationId(String(matched.id));
        setGlobalTravelers(1);
        setTravelDate(today);
        setCityServices([newCityService]);

        // Everything is built in step 2 now (one-window itinerary), so all
        // deep-links land there.
        setCurrentStep(2);

        // Scroll the planner into view.
        setTimeout(() => {
          stepContentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
      } catch {
        // Swallow — deep-link is best-effort.
      }
    })();
  }, [cities, deepLinkApplied]);

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
      selectedServices: [],
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

  // toggleRoute removed in Phase C — the catalog picker mutates
  // selectedServices through its own onChange callback.

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

  // (removed dead handleContinueBooking — an unused /api/quotes checkout that
  // froze only transfers; the live step-5 checkout below now freezes the full
  // itinerary via cityServices.)

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
        date: travelDate ?? '',
        travelers: globalTravelers,
        selectedServices: [],
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
    { number: 2, title: 'Build your itinerary', description: 'Days, transport & extras' },
    { number: 3, title: 'Review & Pricing', description: 'Check your itinerary' },
    { number: 4, title: 'Checkout', description: 'Complete booking' }
  ];

  // Rules live in @shared/quote-validation so they can be unit-tested without
  // a browser — see shared/quote-validation.test.ts.
  const validationState: QuoteState = {
    destinationId: step1DestinationId,
    tripDuration,
    travelers: globalTravelers,
    travelDate,
    justExploring,
    days: cityServices,
    totalAmount: totalPricing?.totalAmount ?? 0,
  };

  const blockersForStep = (step: number) => sharedBlockersForStep(step, validationState);
  const canProceedToStep = (step: number) => Object.keys(blockersForStep(step)).length === 0;

  const goToNextStep = () => {
    if (currentStep >= 4) return;
    const next = currentStep + 1;
    const blockers = blockersForStep(next);
    if (Object.keys(blockers).length > 0) {
      // Previously this silently did nothing, so the CTA read as broken.
      setStepErrors(blockers);
      return;
    }
    setStepErrors({});
    setCurrentStep(next);
    // Scroll to step content area, not top of page
    setTimeout(() => {
      stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setStepErrors({});
      setCurrentStep(currentStep - 1);
      // Scroll to step content area, not top of page
      setTimeout(() => {
        stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div id="quote-builder" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Section heading lives in the card's CardTitle below (with the
          calculator icon + subline) — no separate outer <h2>, which used to
          duplicate "Design Your Egypt Adventure". */}
      <Tabs defaultValue="pricing" className="w-full">
        {showSavedQuotesTab && (
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
        )}

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
                <div className="animate-in fade-in duration-500 px-4 py-6 sm:py-10">
                  <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-7 sm:mb-8">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        Start Your Private Egypt Journey
                      </h3>
                      <p className="text-sm text-muted-foreground">Answer a few questions and see your full price instantly — right here on screen, no waiting.</p>
                    </div>

                    {/* Compact 2-up field grid — stacks to one column on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      {/* Destination */}
                      <div>
                        <Label htmlFor="step1-destination" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          Where do you want to go?
                        </Label>
                        <Select
                          value={step1DestinationId}
                          onValueChange={(value) => {
                            setStep1DestinationId(value);
                            setStepErrors(prev => ({ ...prev, destination: '' }));
                            const selectedCity = cities.find((c: any) => c.id === parseInt(value));
                            if (!selectedCity) return;
                            // Seed first day if no city selected yet
                            setCityServices(prev => {
                              if (prev.length === 0) {
                                return [{
                                  dayNumber: 1,
                                  cityId: selectedCity.id,
                                  cityName: selectedCity.name,
                                  date: travelDate || '',
                                  travelers: globalTravelers,
                                  selectedServices: [],
                                  attractions: '',
                                  selectedAttractions: [],
                                  selectedAddOns: []
                                }];
                              }
                              // Replace day 1 with new selection
                              const updated = [...prev];
                              updated[0] = { ...updated[0], cityId: selectedCity.id, cityName: selectedCity.name };
                              return updated;
                            });
                          }}
                        >
                          <SelectTrigger
                            id="step1-destination"
                            aria-label="Where do you want to go?"
                            aria-invalid={!!stepErrors.destination}
                            aria-describedby={stepErrors.destination ? 'step1-destination-error' : undefined}
                            className={`w-full h-11 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all duration-200 ${stepErrors.destination ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <SelectValue placeholder="Choose a destination" />
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
                        <FieldError id="step1-destination-error" message={stepErrors.destination} />
                      </div>

                      {/* How many days */}
                      <div>
                        <Label htmlFor="trip-duration" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4 text-teal-600" />
                          How many days?
                        </Label>
                        <Select
                          value={tripDuration}
                          onValueChange={(value) => {
                            setTripDuration(value);
                            setStepErrors(prev => ({ ...prev, duration: '' }));
                          }}
                        >
                          <SelectTrigger
                            id="trip-duration"
                            aria-label="How many days?"
                            aria-invalid={!!stepErrors.duration}
                            aria-describedby={stepErrors.duration ? 'trip-duration-error' : undefined}
                            className={`w-full h-11 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all duration-200 ${stepErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                          >
                            <SelectValue placeholder="Select trip length" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-2">1-2 days</SelectItem>
                            <SelectItem value="3-4">3-4 days</SelectItem>
                            <SelectItem value="5-7">5-7 days</SelectItem>
                            <SelectItem value="8-14">8-14 days</SelectItem>
                            <SelectItem value="15+">More than 14 days</SelectItem>
                            <SelectItem value="exploring">Just exploring</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldError id="trip-duration-error" message={stepErrors.duration} />
                      </div>

                      {/* Travelers */}
                      <div>
                        <Label htmlFor="total-travelers" className="text-xs font-semibold mb-1.5 flex items-center gap-1.5 text-gray-600">
                          <Users className="w-4 h-4 text-teal-600" />
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
                          <SelectTrigger
                            id="total-travelers"
                            aria-label="How many travelers?"
                            className="w-full h-11 rounded-lg border-gray-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all duration-200"
                          >
                            <SelectValue placeholder="Select number of travelers" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'traveler' : 'travelers'}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Travel date + "not sure yet" toggle, sharing one cell */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <Label htmlFor="travel-date" className="text-xs font-semibold flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-4 h-4 text-teal-600" />
                            When?
                          </Label>
                          <label htmlFor="just-exploring" className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
                            <Checkbox
                              id="just-exploring"
                              // Radix renders a <button role="checkbox">, whose only
                              // text child is the label's — which the wrapping <label>
                              // does not supply to it. Name it explicitly.
                              aria-label="Not sure yet — I don't have a travel date"
                              className="h-3.5 w-3.5"
                              checked={justExploring}
                              onCheckedChange={(checked) => {
                                const isChecked = checked === true;
                                setJustExploring(isChecked);
                                if (isChecked) {
                                  setTravelDate(null);
                                  setCityServices(prev => prev.map(city => ({ ...city, date: '' })));
                                }
                                if (isChecked) setStepErrors(prev => ({ ...prev, date: '' }));
                              }}
                            />
                            Not sure yet
                          </label>
                        </div>
                        <Input
                          id="travel-date"
                          type="date"
                          value={travelDate ?? ''}
                          disabled={justExploring}
                          aria-invalid={!!stepErrors.date}
                          aria-describedby={stepErrors.date ? 'travel-date-error' : undefined}
                          onChange={(e) => {
                            setTravelDate(e.target.value);
                            setStepErrors(prev => ({ ...prev, date: '' }));
                            setCityServices(prev => prev.map(city => ({ ...city, date: e.target.value })));
                          }}
                          className={`w-full h-11 rounded-lg focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${stepErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <FieldError id="travel-date-error" message={stepErrors.date} />
                      </div>
                    </div>

                    {/* Trust row */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Private vehicle &amp; guide</span>
                      <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Transparent pricing</span>
                      <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600 shrink-0" /> Instant price on screen</span>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center mt-8">
                      {/* Deliberately not disabled: a dead button explains nothing.
                          goToNextStep surfaces per-field errors instead. */}
                      <Button
                        onClick={goToNextStep}
                        size="lg"
                        className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto px-10 py-6 text-base font-semibold rounded-xl"
                      >
                        See My Price →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Destinations Selection */}
              {currentStep === 2 && (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Header */}
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl font-bold mb-2">Build your itinerary</h2>
                    <p className="text-muted-foreground">Pick transport, guide, entrance fees and add-ons for each day — add more days as you go.</p>
                  </div>

                  {/* First-destination selector (empty state) */}
                  {cityServices.length === 0 && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg">
                      <div className="text-center mb-6">
                        <MapPin className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="text-lg font-semibold mb-2">Choose your first destination</h3>
                        <p className="text-sm text-muted-foreground">Select a city to start planning your trip</p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <Label className="text-sm font-medium mb-2 block">Select destination</Label>
                        <Select
                          onValueChange={(value) => {
                            if (!cities || cities.length === 0) return;
                            const selectedCity = cities.find((c: any) => c.id === parseInt(value));
                            if (!selectedCity) return;
                            const newCity: CityService = {
                              dayNumber: 1,
                              cityId: selectedCity.id,
                              cityName: selectedCity.name,
                              date: travelDate ?? '',
                              travelers: globalTravelers,
                              selectedServices: [],
                              attractions: '',
                              selectedAttractions: [],
                              selectedEntranceFees: [],
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

                  {/* Day strips — one row per day, columns left→right */}
                  {cityServices.length > 0 && (
                    <div className="space-y-4">
                      {cityServices.map((city, index) => {
                        const dayTotal = totalPricing?.breakdown?.[index]?.total;
                        const tCount = city.selectedServices?.length || 0;
                        const transferSummary = tCount === 0
                          ? "Select transfer"
                          : tCount === 1
                            ? (city.selectedServices[0]?.name || "1 transfer")
                            : `${tCount} transfers`;
                        return (
                          <Card key={index} className="p-4">
                            {/* strip header */}
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                              <Badge className="bg-primary">Day {city.dayNumber}</Badge>
                              <div className="flex items-center gap-1 font-semibold min-w-0">
                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">{city.cityName}</span>
                              </div>
                              {dayTotal !== undefined && dayTotal > 0 && (
                                <span className="ml-auto text-sm font-semibold text-primary">{formatEGP(dayTotal)}</span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCityServices(prev => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, dayNumber: i + 1 })))}
                                className={`${dayTotal ? '' : 'ml-auto'} h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50`}
                                aria-label={`Remove day ${city.dayNumber}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* 5 columns: Date · Transfer · Guide · Entrance fees · Add-ons */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                              {/* Date */}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Date</Label>
                                <Input
                                  type="date"
                                  value={city.date || ''}
                                  onChange={(e) => setCityServices(prev => prev.map((c, i) => i === index ? { ...c, date: e.target.value } : c))}
                                  className="h-9 text-sm"
                                />
                              </div>

                              {/* Transfer (inline picker wrapped in a popover so it fits a column) */}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPinned className="w-3.5 h-3.5" />Transfer</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between h-9 text-sm font-normal">
                                      <span className="truncate">{transferSummary}</span>
                                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-96 p-3" align="start">
                                    <CatalogServicePicker
                                      city={city.cityName}
                                      categories={["airport_transfer","intercity_transfer","local_transfer","tour_transfer"]}
                                      selected={city.selectedServices}
                                      travelers={city.travelers || globalTravelers}
                                      onChange={(next) => setCityServices(prev => prev.map((c, i) => i === index ? { ...c, selectedServices: next } : c))}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>

                              {/* Guide */}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3.5 h-3.5" />Guide</Label>
                                <GuideSearch
                                  languages={languages || []}
                                  cityId={city.cityId}
                                  cityName={city.cityName}
                                  selectedGuide={city.selectedGuide}
                                  onGuideChange={(guide) => setCityServices(prev => prev.map((c, i) => i === index ? { ...c, selectedGuide: guide } : c))}
                                />
                              </div>

                              {/* Entrance fees */}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Ticket className="w-3.5 h-3.5" />Entrance fees</Label>
                                <EntranceFeesSearch
                                  entranceFees={entranceFees || []}
                                  cityName={city.cityName}
                                  selectedEntranceFees={city.selectedEntranceFees || []}
                                  onEntranceFeesChange={(slugs) => setCityServices(prev => prev.map((c, i) => i === index ? { ...c, selectedEntranceFees: slugs } : c))}
                                />
                              </div>

                              {/* Add-ons */}
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground flex items-center gap-1"><Package className="w-3.5 h-3.5" />Add-ons</Label>
                                <AddOnsSearch
                                  addOns={addOns || []}
                                  selectedAddOns={city.selectedAddOns || []}
                                  onAddOnsChange={(next) => setCityServices(prev => prev.map((c, i) => i === index ? { ...c, selectedAddOns: next } : c))}
                                  cityId={city.cityId}
                                  cityName={city.cityName}
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {/* Add day */}
                  {cityServices.length > 0 && (
                    <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Label className="text-sm font-medium whitespace-nowrap">
                          <Plus className="w-4 h-4 inline mr-2" />
                          Add day {cityServices.length + 1}
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
                              selectedServices: [],
                              attractions: '',
                              selectedAttractions: [],
                              selectedEntranceFees: [],
                              selectedAddOns: []
                            };
                            setCityServices(prev => [...prev, newCity]);
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

                  {/* Bottom total bar */}
                  {cityServices.length > 0 && totalPricing && totalPricing.totalAmount > 0 && (
                    <div className="flex items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border">
                      <div>
                        <div className="text-sm text-muted-foreground">Total · {totalPricing.travelers} {totalPricing.travelers === 1 ? 'traveler' : 'travelers'}</div>
                        <div className="text-xs text-muted-foreground">{formatEGP(totalPricing.perPersonAmount)} per person</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{formatEGP(totalPricing.totalAmount)}</div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="pt-6 border-t">
                    <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-between gap-3">
                      <Button variant="outline" onClick={goToPreviousStep} size="lg" className="w-full sm:w-auto">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Overview
                      </Button>
                      <Button onClick={goToNextStep} size="lg" className="bg-gradient-to-r from-primary to-blue-600 w-full sm:w-auto">
                        Continue to Review
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    <FieldError id="step2-itinerary-error" message={stepErrors.itinerary} />
                  </div>
                </div>
              )}

              {/* STEP 3: Review & Pricing */}
              {currentStep === 3 && (
                <div className="animate-in fade-in duration-300">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-6 min-w-0">
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
                        <p className="font-semibold text-primary">{formatEGP(totalPricing?.totalAmount)}</p>
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
                                <span className="text-sm font-semibold">{formatEGP(cityBreakdown?.total)}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          
                          <AccordionContent className="px-4 pb-4 pt-2">
                            <div className="space-y-3">
                              {/* Catalog services (Phase C) */}
                              {city.selectedServices && city.selectedServices.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPinned className="w-4 h-4" />
                                    Services
                                  </h4>
                                  <ul className="text-sm space-y-1 ml-6">
                                    {city.selectedServices.map((s) => (
                                      <li key={s.slug}>
                                        • {s.name ?? s.slug} —{" "}
                                        {VEHICLE_LABELS[s.vehicleSlug] ?? s.vehicleSlug}
                                        {" "}({TRIP_TYPE_LABELS[s.tripType] ?? s.tripType})
                                        {typeof s.price === "number" && (
                                          <span className="text-muted-foreground">
                                            {" "}— {formatEGP(s.price)}
                                          </span>
                                        )}
                                      </li>
                                    ))}
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

                  {/* Navigation — the single checkout CTA for this step. The
                      price panel deliberately renders no button here so there
                      is exactly one "Proceed to Checkout" on screen. */}
                  <div className="pt-6 border-t">
                    <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-between gap-3">
                      <Button
                        variant="outline"
                        onClick={goToPreviousStep}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to itinerary
                      </Button>
                      <Button
                        onClick={goToNextStep}
                        disabled={!(totalPricing && totalPricing.totalAmount > 0)}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-blue-600 w-full sm:w-auto"
                      >
                        Proceed to Checkout
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    {!(totalPricing && totalPricing.totalAmount > 0) && (
                      <p role="status" className="mt-3 text-sm text-red-600 text-center sm:text-right">
                        Your itinerary totals LE 0. Go back and add at least one service to check out.
                      </p>
                    )}
                    <FieldError id="step3-total-error" message={stepErrors.total} />
                  </div>
                  </div>
                  <LivePriceSummary totalPricing={totalPricing} />
                  </div>
                </div>
              )}

              {/* STEP 4: Checkout */}
              {currentStep === 4 && (
                <div className="animate-in fade-in duration-300">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-4 min-w-0">
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">Complete Your Booking</h2>
                    <p className="text-sm text-muted-foreground">Enter your details to finalize your reservation</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Compact Form */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Label htmlFor="checkout-name" className="text-sm">Full Name *</Label>
                          <Input
                            id="checkout-name"
                            placeholder="John Doe"
                            className="mt-1 h-9"
                            value={checkoutData.name}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, name: e.target.value }))}
                            data-testid="input-customer-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkout-email" className="text-sm">Email Address *</Label>
                          <Input
                            id="checkout-email"
                            type="email"
                            placeholder="john@example.com"
                            className="mt-1 h-9"
                            value={checkoutData.email}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-customer-email"
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkout-phone" className="text-sm">Phone Number *</Label>
                          <Input
                            id="checkout-phone"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            className="mt-1 h-9"
                            value={checkoutData.phone}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, phone: e.target.value }))}
                            data-testid="input-customer-phone"
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkout-nationality" className="text-sm">Nationality (Optional)</Label>
                          <Input
                            id="checkout-nationality"
                            placeholder="e.g., American"
                            className="mt-1 h-9"
                            value={checkoutData.nationality}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, nationality: e.target.value }))}
                            data-testid="input-customer-nationality"
                          />
                        </div>
                        <div>
                          <Label htmlFor="checkout-accommodation" className="text-sm">Hotel/Accommodation (Optional)</Label>
                          <Input
                            id="checkout-accommodation"
                            placeholder="Hotel name or address"
                            className="mt-1 h-9"
                            value={checkoutData.accommodation}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, accommodation: e.target.value }))}
                            data-testid="input-customer-accommodation"
                          />
                        </div>
                      </div>

                      {/* Special Requests - Compact */}
                      <div className="mt-3">
                        <Label htmlFor="checkout-requests" className="text-sm">Special Requests</Label>
                        <textarea
                          id="checkout-requests"
                          className="w-full mt-1 h-16 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Dietary requirements, accessibility needs, preferences..."
                          value={checkoutData.specialRequests}
                          onChange={(e) => setCheckoutData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          data-testid="input-special-requests"
                        />
                      </div>

                      {/* Terms & Conditions - Compact */}
                      <div className="mt-3 pt-3 border-t">
                        <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              id="terms-service" 
                              checked={checkoutData.termsAccepted}
                              onCheckedChange={(checked) => setCheckoutData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
                              data-testid="checkbox-terms"
                              className="mt-0.5"
                            />
                            <Label htmlFor="terms-service" className="text-xs leading-tight cursor-pointer">
                              I agree to the <a href="/terms-of-service" className="text-primary hover:underline" target="_blank">Terms of Service</a> and <a href="/privacy-policy" className="text-primary hover:underline" target="_blank">Privacy Policy</a>
                            </Label>
                          </div>
                          <div className="flex items-start gap-2">
                            <Checkbox 
                              id="booking-policy" 
                              checked={checkoutData.bookingPolicyAccepted}
                              onCheckedChange={(checked) => setCheckoutData(prev => ({ ...prev, bookingPolicyAccepted: checked as boolean }))}
                              data-testid="checkbox-booking-policy"
                              className="mt-0.5"
                            />
                            <Label htmlFor="booking-policy" className="text-xs leading-tight cursor-pointer">
                              I understand and accept the <a href="/booking-agreement" className="text-primary hover:underline" target="_blank">Booking Policy</a> and cancellation terms
                            </Label>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Order Summary - Compact */}
                    <Card className="p-4">
                      <h3 className="font-semibold mb-3">Order Summary</h3>
                        
                      {/* Trip Details */}
                      <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Travel Date</p>
                          <p className="text-sm font-medium">{travelDate ? new Date(travelDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Travelers</p>
                          <p className="text-sm font-medium">{globalTravelers} {globalTravelers === 1 ? 'Person' : 'People'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Days</p>
                          <p className="text-sm font-medium">{cityServices.length} {cityServices.length === 1 ? 'Day' : 'Days'}</p>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="space-y-1.5 mb-3 pb-3 border-b text-sm">
                        <div className="flex justify-between">
                          <span>Services</span>
                          <span>{formatEGP(totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.routes || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tour Guides</span>
                          <span>{formatEGP(totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.guide || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entrance fees</span>
                          <span>{formatEGP(totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.attractions || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Add-ons</span>
                          <span>{formatEGP(totalPricing?.breakdown?.reduce((sum: number, city: any) => sum + (city.addOns || 0), 0))}</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">{formatEGP(totalPricing?.totalAmount)}</span>
                      </div>

                      {/* Submit Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-primary to-blue-600 h-11"
                        onClick={async () => {
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
                          
                          try {
                            // Create quote first
                            const quoteData = {
                              // Full itinerary priced + frozen server-side via
                              // buildMultiCityQuote (the same engine as the live
                              // preview), so the frozen/charged total matches
                              // what the customer saw. The server ignores any
                              // client total and recomputes from these.
                              cityServices,
                              travelers: globalTravelers,
                              jsonBlob: {
                                cityServices,
                                travelDate,
                                travelers: globalTravelers,
                                totalPricing
                              }
                            };

                            const quoteResponse = await fetch('/api/quotes', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(quoteData)
                            });

                            if (!quoteResponse.ok) throw new Error('Failed to create quote');
                            const quote = await quoteResponse.json();

                            // "Request quotes" goal in Google Ads, via the
                            // imported GA4 event `qualify_lead`. Marked so that
                            // opening /book/:id for this same quote later does
                            // not report a second lead.
                            if (quote?.id && !hasSentLead(quote.id)) {
                              trackQualifiedLead({
                                quoteId: quote.id,
                                value: totalPricing?.totalAmount,
                                currency: 'EGP',
                              });
                              markLeadSent(quote.id);
                            }

                            // Create booking with quote
                            const bookingData = {
                              quoteId: quote.id,
                              travelDate,
                              customerName: checkoutData.name,
                              customerEmail: checkoutData.email,
                              customerPhone: checkoutData.phone,
                              totalAmount: totalPricing?.totalAmount || 0,
                              specialRequests: checkoutData.specialRequests,
                              paymentMethod: 'pending',
                              paymentStatus: 'pending'
                            };

                            const bookingResponse = await fetch('/api/bookings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(bookingData)
                            });

                            if (!bookingResponse.ok) throw new Error('Failed to create booking');
                            const booking = await bookingResponse.json();

                            // Report the purchase HERE, not only on
                            // booking-confirmation.tsx. This flow never
                            // navigates there — it alerts and resets to step 1
                            // — so relying on that page alone would miss every
                            // booking made through the main funnel, counting
                            // only the customers who later open the link in
                            // their email. markConversionSent keeps the
                            // confirmation page from reporting it a second time
                            // when they do.
                            if (booking?.bookingReference
                                && !hasSentConversion(booking.bookingReference)) {
                              const bookedValue = Number(totalPricing?.totalAmount);
                              trackPurchase({
                                transactionId: booking.bookingReference,
                                value: Number.isFinite(bookedValue) && bookedValue > 0
                                  ? bookedValue
                                  : undefined,
                                currency: 'EGP',
                                items: [{
                                  item_id: booking.bookingReference,
                                  item_name: 'Egypt trip booking',
                                  item_category: 'trip',
                                  price: Number.isFinite(bookedValue) && bookedValue > 0
                                    ? bookedValue
                                    : undefined,
                                  quantity: 1,
                                }],
                              });
                              markConversionSent(booking.bookingReference);
                            }

                            alert(`Booking request submitted successfully!\n\nConfirmation email sent to ${checkoutData.email}.\nBooking reference: ${booking.bookingReference}`);
                            
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
                          } catch (error) {
                            console.error('Booking error:', error);
                            alert('Failed to submit booking. Please try again.');
                          }
                        }}
                        data-testid="button-submit-booking"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Request Booking
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-2">
                        By submitting, you agree to our terms and conditions
                      </p>
                    </Card>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={goToPreviousStep}
                      className="w-full sm:w-auto"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back to Review
                    </Button>
                  </div>
                  </div>
                  <LivePriceSummary totalPricing={totalPricing} />
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
                            <span>Services:</span>
                            <span className="font-mono">{formatEGP(city.routes)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guide:</span>
                            <span className="font-mono">{formatEGP(city.guide)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Entrance fees:</span>
                            <span className="font-mono">{formatEGP(city.attractions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Add-ons:</span>
                            <span className="font-mono">{formatEGP(city.addOns)}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="font-mono">{formatEGP(city.total)}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              {/* End Step Content Container */}
              </div>
        </CardContent>
      </Card>
        </TabsContent>

        {showSavedQuotesTab && (
          <TabsContent value="saved">
            <QuoteManager
              currentQuote={getCurrentQuoteData()}
              onLoadQuote={loadQuoteData}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}