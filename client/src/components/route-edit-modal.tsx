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
    fromCityId: '',
    toCityId: '',
    km: '',
    estimatedDuration: '',
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

  // Reset form when modal opens/closes or route changes
  useEffect(() => {
    if (isOpen) {
      if (route) {
        // Editing existing route
        setFormData({
          name: route.name || '',
          description: route.description || '',
          fromCityId: route.fromCityId?.toString() || '',
          toCityId: route.toCityId?.toString() || '',
          km: route.km?.toString() || '',
          estimatedDuration: route.estimatedDuration || '',
          sedanPrice: route.sedanPrice?.toString() || '',
          minivanPrice: route.minivanPrice?.toString() || '',
          vanPrice: route.vanPrice?.toString() || '',
          displayOrder: route.displayOrder?.toString() || '',
          isActive: route.isActive !== false
        });
      } else {
        // Creating new route
        setFormData({
          name: '',
          description: '',
          fromCityId: defaultFromCityId?.toString() || '',
          toCityId: defaultToCityId?.toString() || '',
          km: '',
          estimatedDuration: '',
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
      if (route) {
        return apiRequest("PUT", `/api/routes/${route.id}`, data);
      } else {
        return apiRequest("POST", "/api/routes", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      toast({
        title: "Success!",
        description: `Route has been ${route ? 'updated' : 'created'} successfully.`,
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${route ? 'update' : 'create'} route. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.fromCityId || !formData.toCityId) {
      toast({
        title: "Error",
        description: "Please select both departure and destination cities.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sedanPrice) {
      toast({
        title: "Error",
        description: "Please enter at least the sedan price.",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      name: formData.name.trim() || null,
      description: formData.description.trim() || null,
      fromCityId: parseInt(formData.fromCityId),
      toCityId: parseInt(formData.toCityId),
      km: formData.km ? parseFloat(formData.km) : null,
      estimatedDuration: formData.estimatedDuration.trim() || null,
      sedanPrice: parseFloat(formData.sedanPrice),
      minivanPrice: formData.minivanPrice ? parseFloat(formData.minivanPrice) : parseFloat(formData.sedanPrice) * 1.4,
      vanPrice: formData.vanPrice ? parseFloat(formData.vanPrice) : parseFloat(formData.sedanPrice) * 1.8,
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

          {/* Cities */}
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
                  {(cities as any[]).map((city: any) => (
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
                  {(cities as any[]).map((city: any) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 250"
                value={formData.km}
                onChange={(e) => setFormData(prev => ({...prev, km: e.target.value}))}
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

          {/* Pricing */}
          <div>
            <Label className="text-base font-medium">Vehicle Pricing *</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="sedan-price">Sedan Price ($) *</Label>
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
                <Label htmlFor="minivan-price">Minivan Price ($)</Label>
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
                <Label htmlFor="van-price">Van Price ($)</Label>
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