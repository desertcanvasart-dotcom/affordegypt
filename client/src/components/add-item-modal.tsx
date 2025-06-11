import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'vehicle' | 'guide' | 'addon' | 'city' | 'route';
}

export default function AddItemModal({ isOpen, onClose, modalType }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    unitType: 'per_unit',
    fromCityId: '',
    toCityId: '',
    distance: '',
    duration: '',
    vehicleCategory: 'all', // all, sedan, minivan, van
    routeType: 'inter-city', // inter-city, intra-city, airport
    sedanPrice: '',
    minivanPrice: '',
    vanPrice: ''
  });
  const { toast } = useToast();

  // Fetch cities for route creation
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/cities'],
    retry: false,
  });

  // Fetch vehicle types for route pricing
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ['/api/vehicle-types'],
    retry: false,
  });

  // Create route mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = modalType === 'route' ? '/api/routes' : '/api/admin/items';
      return apiRequest("POST", endpoint, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      toast({
        title: "Success!",
        description: `${modalType === 'addon' ? 'Service' : modalType} has been added successfully.`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (modalType === 'route') {
      if (formData.fromCityId && formData.toCityId && formData.sedanPrice && formData.minivanPrice && formData.vanPrice) {
        createMutation.mutate({
          fromCityId: parseInt(formData.fromCityId),
          toCityId: parseInt(formData.toCityId),
          km: formData.distance,
          routeType: formData.routeType,
          sedanPrice: parseFloat(formData.sedanPrice),
          minivanPrice: parseFloat(formData.minivanPrice),
          vanPrice: parseFloat(formData.vanPrice),
          basePrice: parseFloat(formData.sedanPrice), // Use sedan as base price
          isActive: true
        });
      } else {
        toast({
          title: "Error",
          description: "Please select cities and enter prices for all vehicle types.",
          variant: "destructive",
        });
      }
    } else {
      if (formData.name.trim()) {
        createMutation.mutate(formData);
      } else {
        toast({
          title: "Error",
          description: "Please enter a name for the item.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      unitType: 'per_unit',
      fromCityId: '',
      toCityId: '',
      distance: '',
      duration: '',
      vehicleCategory: 'all',
      routeType: 'inter-city',
      sedanPrice: '',
      minivanPrice: '',
      vanPrice: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add New {modalType === 'addon' ? 'Service' : modalType === 'vehicle' ? 'Vehicle Type' : modalType === 'guide' ? 'Guide Rate' : modalType === 'city' ? 'City' : 'Route'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {modalType === 'route' ? (
            <>
              <div>
                <Label htmlFor="modal-from-city">From City</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, fromCityId: value}))}>
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
                <Label htmlFor="modal-to-city">To City</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, toCityId: value}))}>
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

              <div>
                <Label htmlFor="modal-distance">Distance (km)</Label>
                <Input 
                  id="modal-distance"
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({...prev, distance: e.target.value}))}
                  placeholder="e.g., 302"
                />
              </div>

              <div>
                <Label htmlFor="modal-route-type">Route Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, routeType: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter-city">Inter-City Route</SelectItem>
                    <SelectItem value="intra-city">Intra-City Tour</SelectItem>
                    <SelectItem value="airport">Airport Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modal-sedan-price">🚗 Sedan Price (USD)</Label>
                <Input 
                  id="modal-sedan-price"
                  type="number"
                  value={formData.sedanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, sedanPrice: e.target.value}))}
                  placeholder="e.g., 50"
                />
              </div>

              <div>
                <Label htmlFor="modal-minivan-price">🚐 Minivan Price (USD)</Label>
                <Input 
                  id="modal-minivan-price"
                  type="number"
                  value={formData.minivanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, minivanPrice: e.target.value}))}
                  placeholder="e.g., 70"
                />
              </div>

              <div>
                <Label htmlFor="modal-van-price">🚌 Van Price (USD)</Label>
                <Input 
                  id="modal-van-price"
                  type="number"
                  value={formData.vanPrice}
                  onChange={(e) => setFormData(prev => ({...prev, vanPrice: e.target.value}))}
                  placeholder="e.g., 90"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="modal-name">Name</Label>
                <Input 
                  id="modal-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder={modalType === 'addon' ? 'Service name...' : modalType === 'vehicle' ? 'Vehicle type...' : modalType === 'city' ? 'City name...' : 'Route name...'}
                />
              </div>
              
              <div>
                <Label htmlFor="modal-description">Description</Label>
                <Textarea 
                  id="modal-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <Label htmlFor="modal-price">Price (USD)</Label>
                <Input 
                  id="modal-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                  placeholder="0.00"
                />
              </div>
            </>
          )}

          {modalType === 'addon' && (
            <>
              <div>
                <Label htmlFor="modal-category">Category</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modal-unitType">Pricing Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, unitType: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_unit">Per Unit</SelectItem>
                    <SelectItem value="per_person">Per Person</SelectItem>
                    <SelectItem value="per_trip">Per Trip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add {modalType === 'addon' ? 'Service' : modalType === 'vehicle' ? 'Vehicle' : modalType === 'guide' ? 'Guide' : modalType === 'city' ? 'City' : 'Route'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}