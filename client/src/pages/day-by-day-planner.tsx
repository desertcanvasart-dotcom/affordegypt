import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import ServiceModal from "@/components/day-by-day/service-modal";
// import PricingSidebar from "@/components/day-by-day/pricing-sidebar";
// import DayColumn from "@/components/day-by-day/day-column";
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
    queryFn: () => apiRequest("GET", `/api/day-by-day/bookings/${bookingId}`),
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
      const response = await fetch("/api/day-by-day/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dateRange),
      });
      if (!response.ok) throw new Error("Failed to create booking");
      return await response.json();
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
      const response = await fetch(`/api/day-by-day/bookings/${bookingId}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString() }),
      });
      if (!response.ok) throw new Error("Failed to create day");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/day-by-day/bookings", bookingId],
      });
    },
  });

  // Handle date range selection
  const handleDateRangeSelect = (range: any) => {
    console.log('Date range selected:', range);
    if (range?.from && range?.to) {
      setSelectedRange(range);
      toast({
        title: "Dates Selected",
        description: `Creating itinerary from ${format(range.from, 'MMM d')} to ${format(range.to, 'MMM d')}`,
      });
      // Create booking with selected date range
      createBookingMutation.mutate({
        startDate: range.from,
        endDate: range.to,
      });
    } else if (range?.from) {
      // Only store partial selection, don't advance to next page
      setSelectedRange(range);
      toast({
        title: "Start Date Selected",
        description: "Now select your end date to continue",
      });
    } else {
      // Clear selection if no dates
      setSelectedRange(null);
    }
  };

  // Generate timeline of dates
  useEffect(() => {
    if (bookingId && selectedRange?.from && selectedRange?.to && (!booking || !booking.days || booking.days.length === 0)) {
      const daysDiff = differenceInDays(selectedRange.to, selectedRange.from);
      
      // Create booking days for each date in range
      for (let i = 0; i <= daysDiff; i++) {
        const date = addDays(selectedRange.from, i);
        createDayMutation.mutate({ date });
      }
    }
  }, [bookingId, selectedRange, booking]);

  // Handle adding service to a day
  const handleAddService = (dayId: number) => {
    setSelectedDayId(dayId);
    setIsServiceModalOpen(true);
  };

  // Simple service modal component
  const ServiceModal = ({ isOpen, onClose, dayId }: { isOpen: boolean; onClose: () => void; dayId: number | null }) => {
    if (!isOpen || !dayId) return null;

    const sampleServices = [
      { id: 1, title: "Giza Pyramids & Sphinx Tour", description: "Half-day tour with expert guide", price: "450", type: "tour" },
      { id: 2, title: "Airport Transfer - Private Car", description: "Comfortable sedan for 1-4 passengers", price: "280", type: "transfer" },
      { id: 3, title: "Khan el-Khalili Bazaar Walking Tour", description: "3-hour guided shopping experience", price: "320", type: "tour" },
      { id: 4, title: "Nile River Felucca Ride", description: "Traditional sailboat experience", price: "180", type: "activity" },
      { id: 5, title: "Cairo City Transfer", description: "Inter-city transport", price: "220", type: "transfer" }
    ];

    const handleSelectService = (service: any) => {
      toast({
        title: "Service Added",
        description: `${service.title} added to your itinerary`,
      });
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add Service to Day {dayId}</h3>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          
          <div className="space-y-3">
            {sampleServices.map((service) => (
              <div key={service.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectService(service)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <Badge variant="secondary" className="mt-2">{service.type}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-teal-600">EGP {service.price}</p>
                    <Button size="sm" className="mt-2">Add Service</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!selectedRange || !selectedRange.from || !selectedRange.to) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-teal-600 mb-2">Day-by-Day Custom Planner</h1>
            <p className="text-gray-600">
              Build your perfect Egypt itinerary one day at a time. Select your travel dates to get started.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Select Your Travel Dates</CardTitle>
                <CardDescription>
                  Choose your trip start and end dates to begin planning your custom itinerary
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleDateRangeSelect}
                    disabled={[{ before: new Date() }]}
                    className="mx-auto"
                  />
                </div>
                
                {selectedRange?.from && !selectedRange?.to && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">
                      Start date selected: {format(selectedRange.from, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-blue-600 mb-3">
                      Now click your end date on the calendar to create your itinerary
                    </p>
                    <Button 
                      onClick={() => {
                        handleDateRangeSelect({
                          from: selectedRange.from,
                          to: addDays(selectedRange.from, 3)
                        });
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Or Create 4-Day Trip Starting {format(selectedRange.from, "MMM d")}
                    </Button>
                  </div>
                )}
                
                {!selectedRange?.from && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      Select your travel dates to begin planning
                    </p>
                    <Button 
                      onClick={() => {
                        handleDateRangeSelect({
                          from: new Date(),
                          to: addDays(new Date(), 3)
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Quick Test: 4-Day Trip
                    </Button>
                  </div>
                )}
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
    <>
      <ServiceModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setIsServiceModalOpen(false)}
        dayId={selectedDayId}
      />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Day-by-Day Custom Planner</h1>
          <p className="text-gray-600">
            {selectedRange?.from && selectedRange?.to && 
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
            <Card key={day.id} className="border-l-4 border-l-teal-500">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">
                      Day {index + 1} - {format(new Date(day.date), "EEEE, MMM d")}
                    </CardTitle>
                    <CardDescription>
                      {day.services.length === 0 ? "No services booked yet" : `${day.services.length} services booked`}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => handleAddService(day.id)}
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {day.services.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 mb-3">No services planned for this day</p>
                    <Button 
                      onClick={() => handleAddService(day.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {day.services.map((service: BookingService) => (
                      <div key={service.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.service.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.service.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {service.passengers} passengers
                              </span>
                              {service.startTime && (
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {service.startTime}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-teal-600">EGP {service.subtotal}</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // TODO: Remove service
                                console.log('Remove service:', service.id);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )) || (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Loading your itinerary days...</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Summary</CardTitle>
              <CardDescription>
                Real-time pricing for your custom itinerary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Travel Dates:</span>
                  <span className="font-medium">
                    {selectedRange?.from && selectedRange?.to ? (
                      `${format(selectedRange.from, "MMM d")} - ${format(selectedRange.to, "MMM d, yyyy")}`
                    ) : (
                      "Dates not selected"
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {selectedRange?.from && selectedRange?.to ? 
                      `${differenceInDays(selectedRange.to, selectedRange.from) + 1} days` : '0 days'
                    }
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-teal-600">EGP 0</span>
                  </div>
                </div>
                
                <Button className="w-full" disabled>
                  Add Services to Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}