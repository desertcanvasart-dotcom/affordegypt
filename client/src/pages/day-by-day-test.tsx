import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

export default function DayByDayTest() {
  const [selectedRange, setSelectedRange] = useState<{ from: Date; to: Date } | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = (from: Date, to: Date) => {
    setSelectedRange({ from, to });
    createBooking(from, to);
  };

  const createBooking = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    try {
      const response = await fetch("/api/day-by-day/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      
      if (!response.ok) throw new Error("Failed to create booking");
      const booking = await response.json();
      
      console.log("Created booking:", booking);
      setBookingId(booking.id);
      
      // Create days for date range
      const daysDiff = differenceInDays(endDate, startDate);
      const createdDays = [];
      
      for (let i = 0; i <= daysDiff; i++) {
        const date = addDays(startDate, i);
        const dayResponse = await fetch(`/api/day-by-day/bookings/${booking.id}/days`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: date.toISOString() }),
        });
        
        if (dayResponse.ok) {
          const day = await dayResponse.json();
          createdDays.push({ ...day, services: [] });
        }
      }
      
      setDays(createdDays);
      toast({
        title: "Success",
        description: `Created booking with ${createdDays.length} days`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addService = async (dayId: number) => {
    try {
      // Add a sample service for testing
      const response = await fetch(`/api/day-by-day/days/${dayId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: 1, // Assuming first service exists
          passengers: 1,
          unitPrice: "450.00",
          subtotal: "450.00",
          sortOrder: 0
        }),
      });
      
      if (response.ok) {
        const service = await response.json();
        setDays(prev => prev.map(day => 
          day.id === dayId 
            ? { ...day, services: [...(day.services || []), service] }
            : day
        ));
        toast({
          title: "Service Added",
          description: "Sample service added to day",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!selectedRange) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Day-by-Day Custom Planner (Test)</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Select Your Travel Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => handleDateSelect(new Date('2025-06-20'), new Date('2025-06-22'))}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Test: Jun 20-22, 2025 (3 days)
              </Button>
              <Button 
                onClick={() => handleDateSelect(new Date('2025-07-01'), new Date('2025-07-07'))}
                variant="outline"
              >
                Test: Jul 1-7, 2025 (7 days)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-600 mb-2">Day-by-Day Custom Planner</h1>
          <p className="text-gray-600">
            {format(selectedRange.from, 'MMM d')} - {format(selectedRange.to, 'MMM d, yyyy')} • {days.length} days
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSelectedRange(null);
            setBookingId(null);
            setDays([]);
          }}
        >
          Change Dates
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Day Columns */}
          <div className="lg:col-span-3 space-y-4">
            {days.map((day, index) => (
              <Card key={day.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Day {index + 1} - {format(new Date(day.date), "MMM d, yyyy")}
                    </CardTitle>
                    <Button
                      onClick={() => addService(day.id)}
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
                      {day.services.map((service: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span>Service #{service.id}</span>
                            <span className="text-teal-600 font-medium">EGP {service.subtotal}</span>
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
            ))}
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <span>Booking Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Booking ID:</span>
                    <span>{bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Days:</span>
                    <span>{days.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Services:</span>
                    <span>{days.reduce((sum, day) => sum + (day.services?.length || 0), 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}