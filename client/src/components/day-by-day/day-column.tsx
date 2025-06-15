import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, Users, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookingService {
  id: number;
  serviceId: number;
  passengers: number;
  unitPrice: string;
  subtotal: string;
  startTime?: string;
  endTime?: string;
  meta?: any;
  sortOrder: number;
  service: {
    id: number;
    title: string;
    type: string;
    description?: string;
    pricingMode: string;
    vehicleCategory?: string;
    durationMinutes?: number;
  };
}

interface BookingDay {
  id: number;
  date: Date;
  cityId?: number;
  services: BookingService[];
}

interface DayColumnProps {
  day: BookingDay;
  dayNumber: number;
  cities: any[];
  onAddService: () => void;
}

export function DayColumn({ day, dayNumber, cities, onAddService }: DayColumnProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      return await apiRequest("DELETE", `/api/day-by-day/services/${serviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/day-by-day/bookings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/day-by-day/pricing/quote"],
      });
      toast({
        title: "Service Removed",
        description: "The service has been removed from your itinerary.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteService = (serviceId: number) => {
    if (confirm("Are you sure you want to remove this service?")) {
      deleteServiceMutation.mutate(serviceId);
    }
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

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "tour":
        return "bg-green-100 text-green-800";
      case "guide":
        return "bg-purple-100 text-purple-800";
      case "addon":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const cityName = day.cityId ? cities.find(c => c.id === day.cityId)?.name : null;
  const dayTotal = day.services.reduce((sum, service) => sum + parseFloat(service.subtotal), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Day {dayNumber} - {format(new Date(day.date), "MMM d, yyyy")}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {cityName && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {cityName}
                </Badge>
              )}
              {dayTotal > 0 && (
                <Badge className="text-xs bg-teal-100 text-teal-800">
                  EGP {dayTotal.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={onAddService}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {day.services.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No services planned for this day</p>
            <p className="text-sm">Click "Add Service" to get started</p>
          </div>
        ) : (
          day.services
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((service) => (
              <div
                key={service.id}
                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`text-xs ${getServiceTypeColor(service.service.type)}`}>
                          {getServiceTypeIcon(service.service.type)}
                          <span className="ml-1 capitalize">{service.service.type}</span>
                        </Badge>
                        {service.startTime && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.startTime}
                            {service.endTime && ` - ${service.endTime}`}
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {service.service.title}
                      </h4>
                      
                      {service.service.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {service.service.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {service.passengers} passenger{service.passengers !== 1 ? 's' : ''}
                        </div>
                        
                        {service.service.vehicleCategory && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {service.service.vehicleCategory}
                          </div>
                        )}
                        
                        {service.service.durationMinutes && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {Math.floor(service.service.durationMinutes / 60)}h {service.service.durationMinutes % 60}m
                          </div>
                        )}
                      </div>

                      {service.meta && Object.keys(service.meta).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {service.meta.origin && service.meta.destination && (
                            <p>From: {service.meta.origin} → To: {service.meta.destination}</p>
                          )}
                          {service.meta.language && (
                            <p>Language: {service.meta.language}</p>
                          )}
                          {service.meta.notes && (
                            <p>Notes: {service.meta.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <div className="text-right">
                      <div className="font-medium text-teal-600">
                        EGP {parseFloat(service.subtotal).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.service.pricingMode === 'per_person' ? 'per person' : 'per group'}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}