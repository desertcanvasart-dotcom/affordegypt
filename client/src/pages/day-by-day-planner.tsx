import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceModal } from "@/components/day-by-day/service-modal";
import { PricingSidebar } from "@/components/day-by-day/pricing-sidebar";
import { DayColumn } from "@/components/day-by-day/day-column";
import { format, addDays, differenceInDays } from "date-fns";

interface BookingDay {
  id: number;
  date: Date;
  cityId?: number;
  services: BookingService[];
}

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

interface DayByDayBooking {
  id: number;
  startDate: Date;
  endDate: Date;
  totalAmount: string;
  days: BookingDay[];
}

export default function DayByDayPlanner() {
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to: Date } | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get cities for service filtering
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Get current booking if exists
  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ["/api/day-by-day/bookings", bookingId],
    enabled: !!bookingId,
  });

  // Get pricing quote
  const { data: quote } = useQuery({
    queryKey: ["/api/day-by-day/pricing/quote", { bookingId }],
    enabled: !!bookingId,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (dateRange: { startDate: Date; endDate: Date }) => {
      return await apiRequest("POST", "/api/day-by-day/bookings", dateRange);
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      toast({
        title: "Booking Created",
        description: "Your day-by-day itinerary has been started.",
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

  // Create booking day mutation
  const createDayMutation = useMutation({
    mutationFn: async ({ date }: { date: Date }) => {
      return await apiRequest("POST", `/api/day-by-day/bookings/${bookingId}/days`, {
        date: date.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/day-by-day/bookings", bookingId],
      });
    },
  });

  // Handle date range selection
  const handleDateRangeSelect = (range: { from: Date; to: Date } | null) => {
    setSelectedRange(range);
    
    if (range?.from && range?.to) {
      // Create booking with selected date range
      createBookingMutation.mutate({
        startDate: range.from,
        endDate: range.to,
      });
    }
  };

  // Generate timeline of dates
  useEffect(() => {
    if (bookingId && selectedRange?.from && selectedRange?.to && !booking?.days?.length) {
      const daysDiff = differenceInDays(selectedRange.to, selectedRange.from);
      
      // Create booking days for each date in range
      for (let i = 0; i <= daysDiff; i++) {
        const date = addDays(selectedRange.from, i);
        createDayMutation.mutate({ date });
      }
    }
  }, [bookingId, selectedRange, booking?.days?.length]);

  // Handle adding service to a day
  const handleAddService = (dayId: number) => {
    setSelectedDayId(dayId);
    setIsServiceModalOpen(true);
  };

  if (!selectedRange) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Day-by-Day Custom Planner</h1>
          <p className="text-gray-600">
            Build your perfect Egypt itinerary one day at a time. Select your travel dates to get started.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Travel Dates</CardTitle>
              <CardDescription>
                Choose your trip start and end dates to begin planning your custom itinerary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={handleDateRangeSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What You Can Plan</CardTitle>
              <CardDescription>
                With the Day-by-Day planner, you have complete flexibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-teal-600" />
                <div>
                  <h4 className="font-medium">Transportation</h4>
                  <p className="text-sm text-gray-600">Airport transfers, inter-city travel, local transport</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-teal-600" />
                <div>
                  <h4 className="font-medium">Tours & Activities</h4>
                  <p className="text-sm text-gray-600">Half-day tours, full-day experiences, attractions</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-teal-600" />
                <div>
                  <h4 className="font-medium">Guides & Extras</h4>
                  <p className="text-sm text-gray-600">Professional guides, entrance tickets, meals</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-teal-600" />
                <div>
                  <h4 className="font-medium">Flexible Pricing</h4>
                  <p className="text-sm text-gray-600">Pay only for what you book, with volume discounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Day-by-Day Custom Planner</h1>
          <p className="text-gray-600">
            {selectedRange.from && selectedRange.to && 
              `${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d, yyyy')} • ${differenceInDays(selectedRange.to, selectedRange.from) + 1} days`
            }
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedRange(null);
            setBookingId(null);
          }}
        >
          Change Dates
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-3 space-y-4">
          {booking?.days?.map((day: BookingDay, index: number) => (
            <DayColumn
              key={day.id}
              day={day}
              dayNumber={index + 1}
              cities={cities}
              onAddService={() => handleAddService(day.id)}
            />
          ))}
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          <PricingSidebar quote={quote} />
        </div>
      </div>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        dayId={selectedDayId}
        cities={cities}
        onServiceAdded={() => {
          queryClient.invalidateQueries({
            queryKey: ["/api/day-by-day/bookings", bookingId],
          });
          queryClient.invalidateQueries({
            queryKey: ["/api/day-by-day/pricing/quote", { bookingId }],
          });
        }}
      />
    </div>
  );
}