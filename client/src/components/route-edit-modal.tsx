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
      
      // Update cache directly without invalidating other queries
      try {
        const response = await result.json();
        queryClient.setQueryData(['/api/routes'], (oldData: any) => {
          if (!oldData) return oldData;
          
          if (route) {
            // Update existing route
            return oldData.map((r: any) => r.id === route.id ? response : r);
          } else {
            // Add new route
            return [...oldData, response];
          }
        });
      } catch (e) {
        // Only invalidate routes, not all queries
        queryClient.invalidateQueries({ 
          queryKey: ['/api/routes'],
          exact: true 
        });
      }
      
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
                  onValueChange={(value) => setFormData(prev => ({...prev, fromCityId: value}))}
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
                  onValueChange={(value) => setFormData(prev => ({...prev, toCityId: value}))}
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
                onValueChange={(value) => setFormData(prev => ({...prev, cityId: value}))}
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
            <Label className="text-base font-medium">Additional Route Information</Label>
            
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