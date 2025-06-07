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
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator, ChevronDown, X, Save, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import QuoteManager from "@/components/quote-manager";
import AttractionsSearch from "@/components/attractions-search";

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
        commissionPct: "15", // Default commission percentage
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
      
      // Navigate to booking form with quote ID
      setLocation(`/book/${quote.id}`);
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {cityService.selectedRoutes.length === 0 
                                ? "Select Routes" 
                                : `${cityService.selectedRoutes.length} route${cityService.selectedRoutes.length > 1 ? 's' : ''} selected`
                              }
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <div className="max-h-60 overflow-y-auto p-4 space-y-2">
                              {cityRoutes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No routes available for this city</p>
                              ) : (
                                cityRoutes.map((route: Route) => (
                                  <div key={route.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`route-${route.id}-${index}`}
                                      checked={cityService.selectedRoutes.includes(route.id)}
                                      onCheckedChange={(checked) => {
                                        const updatedRoutes = checked
                                          ? [...cityService.selectedRoutes, route.id]
                                          : cityService.selectedRoutes.filter(id => id !== route.id);
                                        updateCityService(index, { selectedRoutes: updatedRoutes });
                                      }}
                                    />
                                    <Label 
                                      htmlFor={`route-${route.id}-${index}`} 
                                      className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                      {route.name}
                                    </Label>
                                  </div>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      {/* Guide */}
                      <TableCell>
                        <Select
                          value={cityService.selectedGuide?.language || "none"}
                          onValueChange={(language) => 
                            updateCityService(index, {
                              selectedGuide: language && language !== "none" ? { language, duration: 8 } : undefined
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="none">No Guide</SelectItem>
                            {languages.map(lang => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {(() => {
                                const perPersonAddOns = cityService.selectedAddOns.filter(a => 
                                  addOns.find(addon => addon.id === a.id && (addon.unitType === 'per_person' || addon.unitType === 'per_trip'))
                                );
                                return perPersonAddOns.length === 0 
                                  ? "Select Add-ons" 
                                  : `${perPersonAddOns.length} add-on${perPersonAddOns.length > 1 ? 's' : ''} selected`;
                              })()}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                              {addOns.filter(a => 
                                (a.unitType === 'per_person' || a.unitType === 'per_trip') && 
                                (a.cityId === null || a.cityId === cityService.cityId)
                              ).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No per-person add-ons available</p>
                              ) : (
                                addOns.filter(a => 
                                  (a.unitType === 'per_person' || a.unitType === 'per_trip') && 
                                  (a.cityId === null || a.cityId === cityService.cityId)
                                ).map(addOn => {
                                  const selectedAddOn = cityService.selectedAddOns.find(a => a.id === addOn.id);
                                  const isSelected = !!selectedAddOn;
                                  
                                  return (
                                    <div key={addOn.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`per-person-addon-${addOn.id}-${index}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const updatedAddOns = checked
                                            ? [...cityService.selectedAddOns, { id: addOn.id, name: addOn.name, quantity: 1 }]
                                            : cityService.selectedAddOns.filter(a => a.id !== addOn.id);
                                          updateCityService(index, { selectedAddOns: updatedAddOns });
                                        }}
                                      />
                                      <Label 
                                        htmlFor={`per-person-addon-${addOn.id}-${index}`} 
                                        className="text-sm font-normal cursor-pointer flex-1"
                                      >
                                        {addOn.name} (${addOn.price})
                                      </Label>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      {/* Per Unit Add-ons */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {(() => {
                                const perUnitAddOns = cityService.selectedAddOns.filter(a => 
                                  addOns.find(addon => addon.id === a.id && addon.unitType === 'per_unit')
                                );
                                return perUnitAddOns.length === 0 
                                  ? "Select Add-ons" 
                                  : `${perUnitAddOns.length} add-on${perUnitAddOns.length > 1 ? 's' : ''} selected`;
                              })()}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                              {addOns.filter(a => 
                                a.unitType === 'per_unit' && 
                                (a.cityId === null || a.cityId === cityService.cityId)
                              ).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No per-unit add-ons available</p>
                              ) : (
                                addOns.filter(a => 
                                  a.unitType === 'per_unit' && 
                                  (a.cityId === null || a.cityId === cityService.cityId)
                                ).map(addOn => {
                                  const selectedAddOn = cityService.selectedAddOns.find(a => a.id === addOn.id);
                                  const isSelected = !!selectedAddOn;
                                  
                                  return (
                                    <div key={addOn.id} className="space-y-2">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`per-unit-addon-${addOn.id}-${index}`}
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const updatedAddOns = checked
                                              ? [...cityService.selectedAddOns, { id: addOn.id, name: addOn.name, quantity: 1 }]
                                              : cityService.selectedAddOns.filter(a => a.id !== addOn.id);
                                            updateCityService(index, { selectedAddOns: updatedAddOns });
                                          }}
                                        />
                                        <Label 
                                          htmlFor={`per-unit-addon-${addOn.id}-${index}`} 
                                          className="text-sm font-normal cursor-pointer flex-1"
                                        >
                                          {addOn.name} (${addOn.price})
                                        </Label>
                                      </div>
                                      
                                      {/* Quantity selector when selected */}
                                      {isSelected && (
                                        <div className="ml-6">
                                          <Select
                                            value={selectedAddOn?.quantity.toString() || "1"}
                                            onValueChange={(value) => {
                                              const newAddOns = cityService.selectedAddOns.map(a => 
                                                a.id === addOn.id ? { ...a, quantity: parseInt(value) } : a
                                              );
                                              updateCityService(index, { selectedAddOns: newAddOns });
                                            }}
                                          >
                                            <SelectTrigger className="w-24">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[1,2,3,4,5].map(num => (
                                                <SelectItem key={num} value={num.toString()}>Qty: {num}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
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
                  className="flex items-center gap-2"
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
                    <h4 className="font-medium mb-2">{city.cityName}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Routes:</span>
                        <span className="font-mono">${city.details.routes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Guide:</span>
                        <span className="font-mono">${city.details.guide}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Attractions:</span>
                        <span className="font-mono">${city.details.attractions || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Add-ons:</span>
                        <span className="font-mono">${city.details.addOns}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span className="font-mono">${city.amount}</span>
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