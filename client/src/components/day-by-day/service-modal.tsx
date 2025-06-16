import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Users, Search, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface Service {
  id: number;
  type: string;
  title: string;
  description?: string;
  cityId?: number;
  basePrice: string;
  pricingMode: string;
  vehicleCategory?: string;
  durationMinutes?: number;
  capacity?: number;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: number | null;
  cities: any[];
  onServiceAdded: () => void;
}

export function ServiceModal({ isOpen, onClose, dayId, cities, onServiceAdded }: ServiceModalProps) {
  const [selectedTab, setSelectedTab] = useState("transfers");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceDetails, setServiceDetails] = useState({
    origin: "",
    destination: "",
    language: "",
    notes: ""
  });

  const { toast } = useToast();

  // Get services based on selected tab and filters
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services", { type: selectedTab === "transfers" ? "transfer" : selectedTab === "tours" ? "tour" : selectedTab === "guides" ? "guide" : "addon", cityId: selectedCity || undefined }],
    enabled: isOpen,
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await fetch(`/api/day-by-day/days/${dayId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error("Failed to add service");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service Added",
        description: "The service has been added to your day.",
      });
      onServiceAdded();
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedService(null);
    setPassengers(1);
    setStartTime("");
    setEndTime("");
    setServiceDetails({
      origin: "",
      destination: "",
      language: "",
      notes: ""
    });
    onClose();
  };

  const calculatePrice = (service: Service) => {
    const basePrice = parseFloat(service.basePrice);
    if (service.pricingMode === "per_person") {
      return basePrice * passengers;
    }
    return basePrice;
  };

  const handleAddService = () => {
    if (!selectedService || !dayId) return;

    const price = calculatePrice(selectedService);
    const meta: any = {};

    // Add service-specific metadata
    if (selectedService.type === "transfer") {
      meta.origin = serviceDetails.origin;
      meta.destination = serviceDetails.destination;
    }
    if (selectedService.type === "guide") {
      meta.language = serviceDetails.language;
    }
    if (serviceDetails.notes) {
      meta.notes = serviceDetails.notes;
    }

    const serviceData = {
      serviceId: selectedService.id,
      passengers,
      unitPrice: selectedService.basePrice,
      subtotal: price.toFixed(2),
      startTime: startTime || null,
      endTime: endTime || null,
      meta,
      sortOrder: 0
    };

    addServiceMutation.mutate(serviceData);
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case "transfer":
        return <MapPin className="h-4 w-4" />;
      case "tour":
        return <Clock className="h-4 w-4" />;
      case "guide":
        return <Users className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const filteredServices = services.filter(service => 
    !searchQuery || service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service to Day</DialogTitle>
          <DialogDescription>
            Choose from transfers, tours, guides, or add-ons to customize your day
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Service Selection */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="tours">Tours</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="addons">Add-ons</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex space-x-4 mt-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service List */}
              <TabsContent value={selectedTab} className="mt-0">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto" />
                    </div>
                  ) : filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No services found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredServices.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all ${
                          selectedService?.id === service.id
                            ? "ring-2 ring-teal-600 bg-teal-50"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="text-xs">
                                  {getServiceTypeIcon(service.type)}
                                  <span className="ml-1 capitalize">{service.type}</span>
                                </Badge>
                                {service.vehicleCategory && (
                                  <Badge variant="outline" className="text-xs">
                                    {service.vehicleCategory}
                                  </Badge>
                                )}
                              </div>
                              
                              <h4 className="font-medium mb-1">{service.title}</h4>
                              
                              {service.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {service.description}
                                </p>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                {service.durationMinutes && (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60}m
                                  </div>
                                )}
                                {service.capacity && (
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    Max {service.capacity}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-teal-600">
                                EGP {parseFloat(service.basePrice).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {service.pricingMode === 'per_person' ? 'per person' : 'per group'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Service Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService ? (
                  <>
                    <div>
                      <Label htmlFor="passengers">Number of Passengers</Label>
                      <Input
                        id="passengers"
                        type="number"
                        min="1"
                        value={passengers}
                        onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="startTime">Start Time (Optional)</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time (Optional)</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>

                    {selectedService.type === "transfer" && (
                      <>
                        <div>
                          <Label htmlFor="origin">From (Origin)</Label>
                          <Input
                            id="origin"
                            placeholder="Pickup location"
                            value={serviceDetails.origin}
                            onChange={(e) => setServiceDetails({ ...serviceDetails, origin: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="destination">To (Destination)</Label>
                          <Input
                            id="destination"
                            placeholder="Drop-off location"
                            value={serviceDetails.destination}
                            onChange={(e) => setServiceDetails({ ...serviceDetails, destination: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedService.type === "guide" && (
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={serviceDetails.language}
                          onValueChange={(value) => setServiceDetails({ ...serviceDetails, language: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="Italian">Italian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Special requests or notes"
                        value={serviceDetails.notes}
                        onChange={(e) => setServiceDetails({ ...serviceDetails, notes: e.target.value })}
                      />
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Unit Price:</span>
                        <span>EGP {parseFloat(selectedService.basePrice).toFixed(2)}</span>
                      </div>
                      {selectedService.pricingMode === "per_person" && passengers > 1 && (
                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                          <span>× {passengers} passengers:</span>
                          <span>EGP {(parseFloat(selectedService.basePrice) * passengers).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-medium text-teal-600 border-t pt-2">
                        <span>Total:</span>
                        <span>EGP {calculatePrice(selectedService).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddService}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={addServiceMutation.isPending}
                    >
                      {addServiceMutation.isPending ? "Adding..." : "Add Service"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Select a service to configure</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}