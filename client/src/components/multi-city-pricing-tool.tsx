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
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator, ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Attractions Multi-Select Component
interface AttractionsMultiSelectProps {
  selectedAttractions: string[];
  onAttractionsChange: (attractions: string[]) => void;
  cityId: number;
  cityName: string;
  attractions: any[];
}

function AttractionsMultiSelect({ selectedAttractions, onAttractionsChange, cityId, cityName, attractions }: AttractionsMultiSelectProps) {
  // Filter attractions for the current city
  const cityAttractions = (attractions || []).filter(attraction => attraction.cityId === cityId).map(attraction => ({
    value: attraction.id.toString(),
    label: attraction.name
  }));

  const toggleAttraction = (attractionValue: string) => {
    const updated = selectedAttractions.includes(attractionValue)
      ? selectedAttractions.filter(a => a !== attractionValue)
      : [...selectedAttractions, attractionValue];
    onAttractionsChange(updated);
  };

  const getDisplayText = () => {
    if (selectedAttractions.length === 0) return "Select attractions...";
    if (selectedAttractions.length === 1) {
      const attraction = cityAttractions.find(a => a.value === selectedAttractions[0]);
      return attraction?.label || selectedAttractions[0];
    }
    return `${selectedAttractions.length} attractions selected`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 px-2 py-1">
            {cityName} Attractions
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {cityAttractions.map((attraction) => (
              <div key={attraction.value} className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded">
                <Checkbox
                  id={attraction.value}
                  checked={selectedAttractions.includes(attraction.value)}
                  onCheckedChange={() => toggleAttraction(attraction.value)}
                />
                <label 
                  htmlFor={attraction.value}
                  className="text-sm cursor-pointer flex-1"
                >
                  {attraction.label}
                </label>
              </div>
            ))}
          </div>
          {selectedAttractions.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAttractionsChange([])}
                className="w-full text-xs text-gray-500"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
  price: number;
  type: string;
  category: string;
}

export default function MultiCityPricingTool() {
  const [cityServices, setCityServices] = useState<CityService[]>([]);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [totalPricing, setTotalPricing] = useState<any>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [travelDate, setTravelDate] = useState<string>('');
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
    queryKey: ["/api/pricing/addons"],
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
      date: new Date().toISOString().split('T')[0],
      travelers: 2,
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
        quantity: 1
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

  return (
    <div id="quote-builder" className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="w-6 h-6 text-primary" />
            Multi-City Egypt Travel Pricing Tool
          </CardTitle>
          <p className="text-muted-foreground">
            Build your complete Egypt itinerary city by city with instant pricing
          </p>
          
          {/* Main Travel Date */}
          <div className="flex items-center gap-4 mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <Label htmlFor="travel-date" className="font-medium">Trip Start Date:</Label>
            </div>
            <Input
              id="travel-date"
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-40"
            />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Total Travelers: {cityServices.reduce((sum, city) => Math.max(sum, city.travelers), 0)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Horizontal Layout Table */}
          {cityServices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px]">City</TableHead>
                    <TableHead className="min-w-[120px]">Date</TableHead>
                    <TableHead className="min-w-[80px]">Travelers</TableHead>
                    <TableHead className="min-w-[180px]">Transportation</TableHead>
                    <TableHead className="min-w-[120px]">Guide</TableHead>
                    <TableHead className="min-w-[140px]">Attractions</TableHead>
                    <TableHead className="min-w-[120px]">Per Unit Add-ons</TableHead>
                    <TableHead className="min-w-[120px]">Per Person Add-ons</TableHead>
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
                              
                              // If this was the last city, show city picker
                              if (newCityServices.length === 0) {
                                setShowCityPicker(true);
                              }
                            }}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Remove city"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Input
                          type="date"
                          value={cityService.date}
                          onChange={(e) => updateCityService(index, { date: e.target.value })}
                          className="w-full"
                        />
                      </TableCell>

                      {/* Travelers */}
                      <TableCell>
                        <Select
                          value={cityService.travelers.toString()}
                          onValueChange={(value) => updateCityService(index, { travelers: parseInt(value) })}
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
                        <AttractionsMultiSelect
                          selectedAttractions={cityService.selectedAttractions || []}
                          onAttractionsChange={(attractions) => updateCityService(index, { selectedAttractions: attractions })}
                          cityId={cityService.cityId}
                          cityName={cityService.cityName}
                          attractions={attractions || []}
                        />
                      </TableCell>

                      {/* Per Unit Add-ons */}
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            value={cityService.selectedAddOns.find(a => 
                              addOns.find(addon => addon.id === a.id && addon.type === 'per_unit')
                            )?.id.toString() || ""}
                            onValueChange={(value) => {
                              const addOn = addOns.find(a => a.id === parseInt(value) && a.type === 'per_unit');
                              if (addOn) {
                                const newAddOns = cityService.selectedAddOns.filter(a => 
                                  !addOns.find(addon => addon.id === a.id && addon.type === 'per_unit')
                                );
                                newAddOns.push({ id: addOn.id, name: addOn.name, quantity: 1 });
                                updateCityService(index, { selectedAddOns: newAddOns });
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Add-on" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              <SelectItem value="none">None</SelectItem>
                              {addOns.filter(a => a.type === 'per_unit').map(addOn => (
                                <SelectItem key={addOn.id} value={addOn.id.toString()}>
                                  {addOn.name} (${addOn.price})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Quantity selector for per-unit items */}
                          {cityService.selectedAddOns.find(a => 
                            addOns.find(addon => addon.id === a.id && addon.type === 'per_unit')
                          ) && (
                            <Select
                              value={cityService.selectedAddOns.find(a => 
                                addOns.find(addon => addon.id === a.id && addon.type === 'per_unit')
                              )?.quantity.toString() || "1"}
                              onValueChange={(value) => {
                                const selectedPerUnit = cityService.selectedAddOns.find(a => 
                                  addOns.find(addon => addon.id === a.id && addon.type === 'per_unit')
                                );
                                if (selectedPerUnit) {
                                  const newAddOns = cityService.selectedAddOns.map(a => 
                                    a.id === selectedPerUnit.id ? { ...a, quantity: parseInt(value) } : a
                                  );
                                  updateCityService(index, { selectedAddOns: newAddOns });
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5].map(num => (
                                  <SelectItem key={num} value={num.toString()}>Qty: {num}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>

                      {/* Per Person Add-ons */}
                      <TableCell>
                        <Select
                          value={cityService.selectedAddOns.find(a => 
                            addOns.find(addon => addon.id === a.id && (addon.type === 'per_person' || addon.type === 'per_trip'))
                          )?.id.toString() || ""}
                          onValueChange={(value) => {
                            const addOn = addOns.find(a => a.id === parseInt(value) && (a.type === 'per_person' || a.type === 'per_trip'));
                            if (addOn) {
                              const newAddOns = cityService.selectedAddOns.filter(a => 
                                !addOns.find(addon => addon.id === a.id && (addon.type === 'per_person' || addon.type === 'per_trip'))
                              );
                              newAddOns.push({ id: addOn.id, name: addOn.name, quantity: 1 });
                              updateCityService(index, { selectedAddOns: newAddOns });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Add-on" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="none">None</SelectItem>
                            {addOns.filter(a => a.type === 'per_person' || a.type === 'per_trip').map(addOn => (
                              <SelectItem key={addOn.id} value={addOn.id.toString()}>
                                {addOn.name} (${addOn.price})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No cities selected yet</p>
              <Button
                variant="outline"
                onClick={() => setShowCityPicker(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First City
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {cityServices.length > 0 && (
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
                        date: new Date().toISOString().split('T')[0],
                        travelers: 2,
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
                          📍 {city.name}
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

              <Button 
                size="lg"
                className="flex items-center gap-2"
                disabled={cityServices.length === 0 || !totalPricing || totalPricing.totalAmount === 0}
                onClick={handleContinueBooking}
              >
                Continue to Booking
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          )}

          {/* Pricing Breakdown */}
          {totalPricing && totalPricing.breakdown && (
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
    </div>
  );
}