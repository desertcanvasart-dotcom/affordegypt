import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Service {
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

interface Day {
  id: number;
  date: Date;
  cityId?: number;
  services: Service[];
}

interface DayColumnProps {
  day: Day;
  dayIndex: number;
  onAddService: (dayId: number) => void;
  onRemoveService: (serviceId: number) => void;
}

export default function DayColumn({ day, dayIndex, onAddService, onRemoveService }: DayColumnProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Day {dayIndex + 1} - {format(new Date(day.date), "MMM d, yyyy")}
          </CardTitle>
          <Button
            onClick={() => onAddService(day.id)}
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {day.services && day.services.length > 0 ? (
          <div className="space-y-2">
            {day.services.map((service: Service) => (
              <div key={service.id} className="p-3 border rounded bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{service.service.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{service.service.description}</p>
                    {service.startTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        {service.startTime} - {service.endTime}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {service.passengers} {service.passengers === 1 ? 'person' : 'people'}
                      </span>
                      <span className="text-teal-600 font-medium text-sm">EGP {service.subtotal}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onRemoveService(service.id)}
                    size="sm"
                    variant="ghost"
                    className="ml-2 h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No services planned for this day</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}