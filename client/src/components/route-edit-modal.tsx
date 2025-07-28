import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { refreshRouteData } from "@/lib/cacheUtils";

interface RouteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  route?: any;
  defaultFromCityId?: number;
  defaultToCityId?: number;
}

export default function RouteEditModal({ 
  isOpen, 
  onClose, 
  route, 
  defaultFromCityId, 
  defaultToCityId 
}: RouteEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    routeCategory: 'inter_city',
    fromCityId: '',
    toCityId: '',
    cityId: '',
    tripMode: 'transfer',
    nights: 0,
    distanceKm: '',
    estimatedDuration: '',
    routeHighlights: '',
    travelTips: '',
    pickupInstructions: '',
    dropoffInstructions: '',
    sedanPrice: '',
    minivanPrice: '',
    vanPrice: '',
    displayOrder: '',
    isActive: true
  });
  
  const { toast } = useToast();

  // Fetch cities for route creation
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/cities'],
    retry: false,
  });

  // Fetch existing routes to check for duplicates
  const { data: existingRoutes = [] } = useQuery({
    queryKey: ['/api/routes'],
    retry: false,
  });

  // Reset form when modal opens/closes or route changes
  useEffect(() => {
    if (isOpen) {
      if (route) {
        // Editing existing route
        // Extract prices from vehiclePrices (new format) or basePriceByVehicle (legacy)
        let vehiclePrices = route.vehiclePrices;
        if (typeof vehiclePrices === 'string') {
          try {
            vehiclePrices = JSON.parse(vehiclePrices);
          } catch (e) {
            vehiclePrices = {};
          }
        }
        
        const sedanPrice = vehiclePrices?.sedan || 
                          route.basePriceByVehicle?.['1']?.['1'] || 
                          route.sedanPrice || '';
        const minivanPrice = vehiclePrices?.minivan || 
                            route.basePriceByVehicle?.['2']?.['1'] || 
                            route.minivanPrice || '';
        const vanPrice = vehiclePrices?.van || 
                        route.basePriceByVehicle?.['3']?.['1'] || 
                        route.vanPrice || '';
        
        setFormData({
          name: route.name || '',
          description: route.description || '',
          routeCategory: route.routeCategory || 'inter_city',
          fromCityId: route.fromCityId?.toString() || '',
          toCityId: route.toCityId?.toString() || '',
          cityId: route.cityId?.toString() || '',
          tripMode: route.tripMode || 'transfer',
          nights: route.nights || 0,
          distanceKm: route.distanceKm?.toString() || '',
          estimatedDuration: route.estimatedDuration || '',
          routeHighlights: route.routeHighlights || '',
          travelTips: route.travelTips || '',
          pickupInstructions: route.pickupInstructions || '',
          dropoffInstructions: route.dropoffInstructions || '',
          sedanPrice: sedanPrice?.toString() || '',
          minivanPrice: minivanPrice?.toString() || '',
          vanPrice: vanPrice?.toString() || '',
          displayOrder: route.displayOrder?.toString() || '',
          isActive: route.isActive !== false
        });
      } else {
        // Creating new route
        setFormData({
          name: '',
          description: '',
          routeCategory: 'inter_city',
          fromCityId: defaultFromCityId?.toString() || '',
          toCityId: defaultToCityId?.toString() || '',
          cityId: '',
          tripMode: 'transfer',
          nights: 0,
          distanceKm: '',
          estimatedDuration: '',
          routeHighlights: '',
          travelTips: '',
          pickupInstructions: '',
          dropoffInstructions: '',
          sedanPrice: '',
          minivanPrice: '',
          vanPrice: '',
          displayOrder: '',
          isActive: true
        });
      }
    }
  }, [isOpen, route, defaultFromCityId, defaultToCityId]);

  // Create/Update route mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Submitting route data:', data);
      if (route) {
        console.log('Updating route with ID:', route.id);
        return apiRequest("PUT", `/api/routes/${route.id}`, data);
      } else {
        console.log('Creating new route');
        return apiRequest("POST", "/api/routes", data);
      }
    },
    onSuccess: async (result) => {
      console.log('Route save successful:', result);
      
      // Use enhanced cache invalidation for language-aware queries
      refreshRouteData();
      
      toast({
        title: "Success!",
        description: `Route has been ${route ? 'updated' : 'created'} successfully.`,
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Route save error:', error);
      toast({
        title: "Error",
        description: `Failed to ${route ? 'update' : 'create'} route: ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    },
  });

  // Check for duplicate routes (temporarily disabled)
  const checkForDuplicateRoutes = (fromCityId: string, toCityId: string) => {
    if (!fromCityId || !toCityId || fromCityId === toCityId) return { hasConflict: false };
    
    const fromId = parseInt(fromCityId);
    const toId = parseInt(toCityId);
    
    // Check for exact duplicate with same trip mode
    const exactDuplicate = (existingRoutes as any[]).find(route => 
      route.fromCityId === fromId && 
      route.toCityId === toId && 
      route.tripMode === formData.tripMode &&
      route.id !== route?.id
    );
    
    // Check for reverse route
    const reverseRoute = (existingRoutes as any[]).find(route => 
      route.fromCityId === toId && route.toCityId === fromId
    );
    
    // Temporarily disable conflict detection to allow multiple trip modes
    return {
      hasConflict: false, // Was: !!exactDuplicate
      hasReverse: !!reverseRoute,
      exactDuplicate,
      reverseRoute
    };
  };

  const handleSubmit = () => {
    // Validate route category specific fields
    if (formData.routeCategory === 'inter_city') {
      if (!formData.fromCityId || !formData.toCityId) {
        toast({
          title: "Error",
          description: "Please select both departure and destination cities.",
          variant: "destructive",
        });
        return;
      }
      if (formData.fromCityId === formData.toCityId) {
        toast({
          title: "Error",
          description: "From and To cities cannot be the same.",
          variant: "destructive",
        });
        return;
      }
    } else if (formData.routeCategory === 'intra_city') {
      if (!formData.cityId) {
        toast({
          title: "Error",
          description: "Please select a city for the intra-city route.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.sedanPrice || !formData.minivanPrice || !formData.vanPrice) {
      toast({
        title: "Error",
        description: "Please enter prices for all vehicle types.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      name: formData.name.trim() || null,
      description: formData.description.trim() || null,
      routeCategory: formData.routeCategory,
      fromCityId: formData.routeCategory === 'inter_city' ? parseInt(formData.fromCityId) : null,
      toCityId: formData.routeCategory === 'inter_city' ? parseInt(formData.toCityId) : null,
      cityId: formData.routeCategory === 'intra_city' ? parseInt(formData.cityId) : null,
      tripMode: formData.tripMode,
      nights: formData.nights,
      distanceKm: formData.distanceKm ? parseInt(formData.distanceKm) : null,
      estimatedDuration: formData.estimatedDuration.trim() || null,
      routeHighlights: formData.routeHighlights.trim() || null,
      travelTips: formData.travelTips.trim() || null,
      pickupInstructions: formData.pickupInstructions.trim() || null,
      dropoffInstructions: formData.dropoffInstructions.trim() || null,
      vehiclePrices: {
        sedan: parseFloat(formData.sedanPrice),
        minivan: parseFloat(formData.minivanPrice),
        van: parseFloat(formData.vanPrice)
      },
      // Legacy field mapping for backward compatibility
      sedanPrice: parseFloat(formData.sedanPrice),
      minivanPrice: parseFloat(formData.minivanPrice),
      vanPrice: parseFloat(formData.vanPrice),
      basePriceByVehicle: {
        sedan: parseFloat(formData.sedanPrice),
        minivan: parseFloat(formData.minivanPrice),
        van: parseFloat(formData.vanPrice)
      },
      displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
      isActive: formData.isActive
    };

    saveMutation.mutate(submitData);
  };

  const handleClose = () => {
    onClose();
  };

  const getCityName = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  // Auto-generate route information based on cities and route type
  const generateRouteInformation = (fromCityId: string, toCityId: string, routeCategory: string, tripMode: string) => {
    const fromCity = getCityName(parseInt(fromCityId));
    const toCity = getCityName(parseInt(toCityId));
    
    // Route highlights based on cities
    const generateHighlights = () => {
      const cityHighlights: { [key: string]: string[] } = {
        'Cairo': ['Ancient pyramids and sphinx views', 'Islamic Cairo historic districts', 'Nile River scenic routes'],
        'Alexandria': ['Mediterranean coastal views', 'Historic Alexandria Library', 'Qaitbay Citadel fortress'],
        'Luxor': ['Valley of the Kings entrance', 'Karnak Temple complex', 'Nile River east bank'],
        'Aswan': ['High Dam engineering marvel', 'Philae Temple island', 'Nubian village culture'],
        'Hurghada': ['Red Sea coastal highway', 'Desert mountain landscapes', 'Resort area access'],
        'Sharm El Sheikh': ['Sinai Peninsula mountains', 'Gulf of Aqaba coastline', 'Desert oasis stops'],
        'Dahab': ['Blue Hole diving sites', 'Bedouin cultural areas', 'Sinai desert routes'],
        'Marsa Alam': ['Eastern Desert landscapes', 'Red Sea pristine beaches', 'Ancient emerald mines']
      };

      if (routeCategory === 'inter_city') {
        const fromHighlights = cityHighlights[fromCity] || [];
        const toHighlights = cityHighlights[toCity] || [];
        return [...fromHighlights.slice(0, 1), ...toHighlights.slice(0, 2)].join(', ');
      } else {
        return (cityHighlights[fromCity] || ['Local landmarks and attractions', 'Cultural sites', 'Scenic viewpoints']).join(', ');
      }
    };

    // Travel tips based on route characteristics
    const generateTravelTips = () => {
      const distance = parseInt(formData.distanceKm) || 0;
      const duration = parseFloat(formData.estimatedDuration) || 0;
      
      let tips = [];
      
      if (routeCategory === 'inter_city') {
        if (distance > 400) {
          tips.push('Long journey - bring snacks and water');
          tips.push('Rest stops available every 2-3 hours');
        }
        if (duration > 6) {
          tips.push('Early morning departure recommended');
          tips.push('Overnight accommodation may be needed');
        }
        if (fromCity === 'Cairo' || toCity === 'Cairo') {
          tips.push('Avoid rush hours (7-9 AM, 5-7 PM)');
        }
        if (fromCity.includes('Sharm') || toCity.includes('Sharm') || fromCity.includes('Dahab') || toCity.includes('Dahab')) {
          tips.push('Mountain roads - check weather conditions');
        }
        if (fromCity.includes('Hurghada') || toCity.includes('Hurghada') || fromCity.includes('Marsa')) {
          tips.push('Desert highway - carry extra water');
        }
      } else {
        tips.push('Flexible timing for sightseeing stops');
        tips.push('Local guide recommendations available');
        tips.push('Climate-appropriate clothing advised');
      }
      
      return tips.slice(0, 3).join('. ') + '.';
    };

    // Pickup instructions based on city
    const generatePickupInstructions = () => {
      const cityInstructions: { [key: string]: string } = {
        'Cairo': 'Hotel lobby pickup available. Airport pickup: Terminal 1 or 3 arrival hall. Train station: Main entrance near taxi area.',
        'Alexandria': 'Hotel pickup available. Train station: Main entrance. Corniche area: Designated pickup points.',
        'Luxor': 'Hotel pickup included. Airport: Arrival hall main entrance. Train station: Platform exit area.',
        'Aswan': 'Hotel lobby pickup available. Airport: Arrival hall. Railway station: Main entrance.',
        'Hurghada': 'Resort pickup available. Airport: Terminal building exit. Marina area: Designated spots.',
        'Sharm El Sheikh': 'Hotel pickup available. Airport: Terminal entrance. Naama Bay: Central pickup points.',
        'Dahab': 'Hotel pickup available. Central Dahab: Lighthouse area. Mashraba area: Main road.',
        'Marsa Alam': 'Resort pickup available. Airport: Terminal exit. Port Ghalib: Marina entrance.'
      };
      
      return cityInstructions[fromCity] || 'Hotel pickup available. Specific pickup location to be confirmed 24 hours before departure.';
    };

    // Dropoff instructions based on destination
    const generateDropoffInstructions = () => {
      const cityInstructions: { [key: string]: string } = {
        'Cairo': 'Hotel dropoff available. Airport: Terminal 1 or 3 departure area. Specific terminal confirmed based on flight.',
        'Alexandria': 'Hotel dropoff available. Train station: Main entrance area. Corniche: Designated dropoff points.',
        'Luxor': 'Hotel dropoff included. Airport: Departure terminal. Train station: Platform access area.',
        'Aswan': 'Hotel dropoff available. Airport: Departure hall. Railway station: Main entrance.',
        'Hurghada': 'Resort dropoff available. Airport: Departure terminal. Marina: Designated areas.',
        'Sharm El Sheikh': 'Hotel dropoff available. Airport: Departure terminal. Naama Bay: Central locations.',
        'Dahab': 'Hotel dropoff available. Central Dahab: Lighthouse area. Mashraba: Main road access.',
        'Marsa Alam': 'Resort dropoff available. Airport: Departure terminal. Port Ghalib: Marina area.'
      };
      
      if (routeCategory === 'inter_city') {
        return cityInstructions[toCity] || 'Hotel dropoff available. Specific dropoff location confirmed based on accommodation.';
      } else {
        return cityInstructions[fromCity] || 'Return to original pickup location. Alternative dropoff points can be arranged.';
      }
    };

    return {
      routeHighlights: generateHighlights(),
      travelTips: generateTravelTips(),
      pickupInstructions: generatePickupInstructions(),
      dropoffInstructions: generateDropoffInstructions()
    };
  };

  // Auto-populate fields when cities or route details change
  const handleAutoPopulate = () => {
    if (formData.fromCityId && (formData.toCityId || formData.routeCategory === 'intra_city')) {
      const toCityId = formData.routeCategory === 'intra_city' ? formData.fromCityId : formData.toCityId;
      const generated = generateRouteInformation(formData.fromCityId, toCityId, formData.routeCategory, formData.tripMode);
      
      setFormData(prev => ({
        ...prev,
        routeHighlights: prev.routeHighlights || generated.routeHighlights,
        travelTips: prev.travelTips || generated.travelTips,
        pickupInstructions: prev.pickupInstructions || generated.pickupInstructions,
        dropoffInstructions: prev.dropoffInstructions || generated.dropoffInstructions
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {route ? 'Edit Route' : 'Add New Route'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Route Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="route-name">Route Name (Optional)</Label>
              <Input
                id="route-name"
                placeholder="e.g., Express Service, Tourist Route"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="route-description">Description (Optional)</Label>
              <Textarea
                id="route-description"
                placeholder="Brief description of this route"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                rows={2}
              />
            </div>
          </div>

          {/* Route Category */}
          <div>
            <Label htmlFor="route-category">Route Category *</Label>
            <Select 
              value={formData.routeCategory} 
              onValueChange={(value) => setFormData(prev => ({
                ...prev, 
                routeCategory: value,
                // Reset city fields when category changes
                fromCityId: '',
                toCityId: '',
                cityId: ''
              }))}
            >
              <SelectTrigger id="route-category">
                <SelectValue placeholder="Select route category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter_city">Inter-City (Between Cities)</SelectItem>
                <SelectItem value="intra_city">Intra-City (Within City)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trip Mode - Show after route category is selected */}
          {formData.routeCategory && (
            <div>
              <Label htmlFor="trip-mode">Trip Mode *</Label>
              <Select 
                value={formData.tripMode} 
                onValueChange={(value) => setFormData(prev => {
                  const nightsMap = {
                    'transfer': 0,
                    'day_trip': 0,
                    'overnight': 1,
                    'multi_day': 2
                  };
                  return {
                    ...prev, 
                    tripMode: value,
                    nights: nightsMap[value as keyof typeof nightsMap] || 0
                  };
                })}
              >
                <SelectTrigger id="trip-mode">
                  <SelectValue placeholder="Select trip mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transfer & Drop off</SelectItem>
                  <SelectItem value="day_trip">Day Trip (return same day)</SelectItem>
                  <SelectItem value="overnight">Overnight Stay (1 night)</SelectItem>
                  <SelectItem value="multi_day">Multi-Day Tour (2+ nights)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled nights: {formData.nights}
              </p>
            </div>
          )}

          {/* Conditional City Fields */}
          {formData.routeCategory === 'inter_city' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from-city">From City *</Label>
                <Select 
                  value={formData.fromCityId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({...prev, fromCityId: value}));
                    // Auto-generate route info when both cities are selected
                    setTimeout(() => {
                      if (value && (formData.toCityId || formData.routeCategory === 'intra_city')) {
                        handleAutoPopulate();
                      }
                    }, 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to-city">To City *</Label>
                <Select 
                  value={formData.toCityId} 
                  onValueChange={(value) => {
                    setFormData(prev => ({...prev, toCityId: value}));
                    // Auto-generate route info when both cities are selected
                    setTimeout(() => {
                      if (value && formData.fromCityId) {
                        handleAutoPopulate();
                      }
                    }, 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                      .filter((city: any) => city.id.toString() !== formData.fromCityId)
                      .map((city: any) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {formData.routeCategory === 'intra_city' && (
            <div>
              <Label htmlFor="city">City *</Label>
              <Select 
                value={formData.cityId} 
                onValueChange={(value) => {
                  setFormData(prev => ({...prev, cityId: value, fromCityId: value}));
                  // Auto-generate route info for intra-city routes
                  setTimeout(() => {
                    if (value) {
                      handleAutoPopulate();
                    }
                  }, 100);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}



          {/* Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 250"
                value={formData.distanceKm}
                onChange={(e) => setFormData(prev => ({...prev, distanceKm: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="duration">Estimated Duration</Label>
              <Input
                id="duration"
                placeholder="e.g., 3-4 hours"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({...prev, estimatedDuration: e.target.value}))}
              />
            </div>
          </div>

          {/* Additional Route Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Additional Route Information</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoPopulate}
                disabled={!formData.fromCityId || (!formData.toCityId && formData.routeCategory !== 'intra_city')}
                className="text-xs"
              >
                Auto-Generate Info
              </Button>
            </div>
            
            <div>
              <Label htmlFor="route-highlights">Route Highlights</Label>
              <Textarea
                id="route-highlights"
                placeholder="Key attractions or points of interest along this route"
                value={formData.routeHighlights}
                onChange={(e) => setFormData(prev => ({...prev, routeHighlights: e.target.value}))}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="travel-tips">Travel Tips</Label>
              <Textarea
                id="travel-tips"
                placeholder="Important travel information, best times to travel, etc."
                value={formData.travelTips}
                onChange={(e) => setFormData(prev => ({...prev, travelTips: e.target.value}))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup-instructions">Pickup Instructions</Label>
                <Textarea
                  id="pickup-instructions"
                  placeholder="Specific pickup location details"
                  value={formData.pickupInstructions}
                  onChange={(e) => setFormData(prev => ({...prev, pickupInstructions: e.target.value}))}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="dropoff-instructions">Dropoff Instructions</Label>
                <Textarea
                  id="dropoff-instructions"
                  placeholder="Specific dropoff location details"
                  value={formData.dropoffInstructions}
                  onChange={(e) => setFormData(prev => ({...prev, dropoffInstructions: e.target.value}))}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <Label className="text-base font-medium">Vehicle Pricing *</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="sedan-price">Sedan Price (EGP) *</Label>
                <Input
                  id="sedan-price"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50.00"
                  value={formData.sedanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, sedanPrice: e.target.value}))}
                />
              </div>

              <div>
                <Label htmlFor="minivan-price">Minivan Price (EGP)</Label>
                <Input
                  id="minivan-price"
                  type="number"
                  step="0.01"
                  placeholder="Auto-calculated"
                  value={formData.minivanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, minivanPrice: e.target.value}))}
                />
                {!formData.minivanPrice && formData.sedanPrice && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will be ${(parseFloat(formData.sedanPrice) * 1.4).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="van-price">Van Price (EGP)</Label>
                <Input
                  id="van-price"
                  type="number"
                  step="0.01"
                  placeholder="Auto-calculated"
                  value={formData.vanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, vanPrice: e.target.value}))}
                />
                {!formData.vanPrice && formData.sedanPrice && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will be ${(parseFloat(formData.sedanPrice) * 1.8).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Display Order */}
          <div>
            <Label htmlFor="display-order">Display Order</Label>
            <Input
              id="display-order"
              type="number"
              placeholder="0"
              value={formData.displayOrder}
              onChange={(e) => setFormData(prev => ({...prev, displayOrder: e.target.value}))}
            />
            <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
          </div>

          {/* Route Preview */}
          {formData.fromCityId && formData.toCityId && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Route Preview</h4>
              <p className="text-sm text-gray-600">
                {getCityName(parseInt(formData.fromCityId))} → {getCityName(parseInt(formData.toCityId))}
                {formData.fromCityId === formData.toCityId && (
                  <span className="ml-2 text-orange-600 font-medium">(City Tour)</span>
                )}
              </p>
              {formData.sedanPrice && (
                <p className="text-sm text-gray-600 mt-1">
                  Starting from ${formData.sedanPrice} (Sedan)
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : (route ? 'Update Route' : 'Create Route')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}