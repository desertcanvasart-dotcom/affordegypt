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
                  <TableHead className="min-w-[100px]">City</TableHead>
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
                        <Select
                          value={cityService.selectedRoutes[0]?.toString() || ""}
                          onValueChange={(value) => {
                            if (value) {
                              updateCityService(index, { selectedRoutes: [parseInt(value)] });
                            } else {
                              updateCityService(index, { selectedRoutes: [] });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Transport" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Transport</SelectItem>
                            {cityRoutes.map(route => (
                              <SelectItem key={route.id} value={route.id.toString()}>
                                {route.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={cityService.attractions || ""}
                          onValueChange={(value) => updateCityService(index, { attractions: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Attraction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Attraction</SelectItem>
                            <SelectItem value="pyramids">Pyramids of Giza</SelectItem>
                            <SelectItem value="khan_khalili">Khan El Khalili</SelectItem>
                            <SelectItem value="al_muizz">Al Muizz Street</SelectItem>
                            <SelectItem value="citadel">Citadel of Saladin</SelectItem>
                            <SelectItem value="coptic">Coptic Cairo</SelectItem>
                            <SelectItem value="alexandria_library">Alexandria Library</SelectItem>
                            <SelectItem value="luxor_temple">Luxor Temple</SelectItem>
                            <SelectItem value="valley_kings">Valley of the Kings</SelectItem>
                            <SelectItem value="abu_simbel">Abu Simbel</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectContent>
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
                          <SelectContent>
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