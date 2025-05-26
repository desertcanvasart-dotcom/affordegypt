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
import { Calendar, Users, MapPin, Plus, ArrowRight, Calculator } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

  // Egyptian cities in order as per your specification
  const cities = [
    { id: 1, name: "Cairo" },
    { id: 2, name: "El Fayoum" },
    { id: 3, name: "Alexandria" },
    { id: 4, name: "Luxor" },
    { id: 5, name: "Aswan" },
    { id: 6, name: "Abu Simbel" },
    { id: 7, name: "Hurghada" },
    { id: 8, name: "Sharm El Sheikh" }
  ];

  // Fetch available routes for current city
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/pricing/routes", cities[currentCityIndex]?.id],
    enabled: !!cities[currentCityIndex]?.id,
  });

  // Fetch available languages
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["/api/pricing/languages"],
  });

  // Fetch available add-ons
  const { data: addOns = [] } = useQuery<AddOn[]>({
    queryKey: ["/api/pricing/addons"],
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

  const addNewCity = () => {
    const newCityService: CityService = {
      cityId: cities[cityServices.length]?.id || 1,
      cityName: cities[cityServices.length]?.name || "Cairo",
      date: new Date().toISOString().split('T')[0],
      travelers: 2,
      selectedRoutes: [],
      attractions: "",
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

  const getCurrentCityRoutes = (cityId: number) => {
    // This would normally fetch from the API, but for now using the routes from current query
    return routes;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          {/* Horizontal Layout Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">City</TableHead>
                  <TableHead className="min-w-[140px]">Date</TableHead>
                  <TableHead className="min-w-[120px]">Travelers No</TableHead>
                  <TableHead className="min-w-[250px]">Transportation</TableHead>
                  <TableHead className="min-w-[140px]">Guide</TableHead>
                  <TableHead className="min-w-[160px]">Attractions</TableHead>
                  <TableHead className="min-w-[200px]">Add Ons</TableHead>
                  <TableHead className="min-w-[140px]">Total Per Person</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityServices.map((cityService, index) => {
                  const cityRoutes = getCurrentCityRoutes(cityService.cityId);
                  const interCityRoutes = cityRoutes.filter(r => r.type === 'inter-city');
                  const intraCityRoutes = cityRoutes.filter(r => r.type === 'intra-city' || r.type === 'airport' || r.type === 'activity');
                  const cityBreakdown = totalPricing?.breakdown?.find(b => b.cityName === cityService.cityName);
                  const cityTotal = cityBreakdown ? Math.round(cityBreakdown.amount / cityService.travelers) : 0;

                  return (
                    <TableRow key={index} className="border-b">
                      {/* City */}
                      <TableCell className="font-medium">
                        {cityService.cityName}
                        {index === cityServices.length - 1 && (
                          <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                        )}
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
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={cityService.travelers}
                          onChange={(e) => updateCityService(index, { travelers: parseInt(e.target.value) || 1 })}
                          className="w-20"
                        />
                      </TableCell>

                      {/* Transportation */}
                      <TableCell>
                        <div className="space-y-3">
                          {/* Inter-city routes */}
                          {interCityRoutes.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Inter-city</div>
                              <div className="space-y-1">
                                {interCityRoutes.map(route => (
                                  <div key={route.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={cityService.selectedRoutes.includes(route.id)}
                                      onCheckedChange={() => toggleRoute(index, route.id)}
                                    />
                                    <span className="text-sm">{route.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Intra-city routes */}
                          {intraCityRoutes.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Local & Tours</div>
                              <div className="space-y-1">
                                {intraCityRoutes.map(route => (
                                  <div key={route.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={cityService.selectedRoutes.includes(route.id)}
                                      onCheckedChange={() => toggleRoute(index, route.id)}
                                    />
                                    <span className="text-sm">{route.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
                          <SelectContent>
                            <SelectItem value="none">No Guide</SelectItem>
                            {languages.map(lang => (
                              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Attractions */}
                      <TableCell>
                        <Input
                          placeholder="e.g., Al Muizz Street"
                          value={cityService.attractions}
                          onChange={(e) => updateCityService(index, { attractions: e.target.value })}
                        />
                      </TableCell>

                      {/* Add Ons */}
                      <TableCell>
                        <div className="space-y-3">
                          {/* Meals */}
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Meals</div>
                            <div className="space-y-1">
                              {addOns.filter(a => a.category === 'meals').slice(0, 2).map(addOn => (
                                <div key={addOn.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={cityService.selectedAddOns.some(a => a.id === addOn.id)}
                                    onCheckedChange={() => toggleAddOn(index, addOn)}
                                  />
                                  <span className="text-sm">{addOn.name} (${addOn.price})</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Activities */}
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Activities</div>
                            <div className="space-y-1">
                              {addOns.filter(a => a.category === 'activities').slice(0, 2).map(addOn => (
                                <div key={addOn.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={cityService.selectedAddOns.some(a => a.id === addOn.id)}
                                    onCheckedChange={() => toggleAddOn(index, addOn)}
                                  />
                                  <span className="text-sm">{addOn.name} (${addOn.price})</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Transport */}
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Tickets</div>
                            <div className="space-y-1">
                              {addOns.filter(a => a.category === 'transport').slice(0, 2).map(addOn => (
                                <div key={addOn.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={cityService.selectedAddOns.some(a => a.id === addOn.id)}
                                    onCheckedChange={() => toggleAddOn(index, addOn)}
                                  />
                                  <span className="text-sm">{addOn.name} (${addOn.price})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
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
            <Button
              variant="outline"
              onClick={addNewCity}
              disabled={cityServices.length >= cities.length}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Next City
            </Button>

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
                disabled={cityServices.length === 0}
              >
                Continue to Booking
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Pricing Breakdown */}
          {totalPricing && totalPricing.breakdown && (
            <div className="mt-8">
              <Separator className="mb-4" />
              <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {totalPricing.breakdown.map((city, index) => (
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