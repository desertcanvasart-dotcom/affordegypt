import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Users, Clock } from "lucide-react";
import { format } from "date-fns";

interface PricingSidebarProps {
  booking: {
    id: number;
    startDate: Date;
    endDate: Date;
    totalAmount: string;
    days: Array<{
      id: number;
      date: Date;
      services: Array<{
        id: number;
        subtotal: string;
        passengers: number;
        service: {
          title: string;
          type: string;
        };
      }>;
    }>;
  };
  quote?: {
    totalAmount: string;
    breakdown: Array<{
      description: string;
      amount: string;
    }>;
  };
  onCheckout: () => void;
}

export default function PricingSidebar({ booking, quote, onCheckout }: PricingSidebarProps) {
  const totalServices = booking?.days?.reduce((sum, day) => sum + (day.services?.length || 0), 0) || 0;
  const totalPassengers = booking?.days?.reduce((sum, day) => 
    sum + (day.services?.reduce((daySum, service) => daySum + service.passengers, 0) || 0), 0) || 0;

  const displayAmount = quote?.totalAmount || booking?.totalAmount || "0.00";
  const hasServices = totalServices > 0;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          <span>Pricing Summary</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Real-time pricing for your custom itinerary</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Travel Dates:</span>
            <span className="font-medium">
              {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{booking.days?.length || 0} days</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Total Services:
            </span>
            <span className="font-medium">{totalServices}</span>
          </div>

          {totalPassengers > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Passengers:</span>
              <span className="font-medium">{totalPassengers}</span>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Pricing Breakdown */}
        {hasServices ? (
          <div className="space-y-3">
            {quote?.breakdown?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.description}:</span>
                <span className="font-medium">EGP {item.amount}</span>
              </div>
            ))}
            
            <hr className="border-gray-200" />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-xl text-teal-600">EGP {displayAmount}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm mb-2">No services added yet</p>
            <p className="text-xs text-gray-400">Start adding services to see pricing</p>
          </div>
        )}

        {/* Checkout Button */}
        {hasServices && (
          <div className="pt-4">
            <Button 
              onClick={onCheckout}
              className="w-full bg-teal-600 hover:bg-teal-700"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Checkout
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Secure payment • Book now, pay later options available
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>Prices updated in real-time</span>
          </div>
          <p className="text-xs text-gray-500">
            All prices in Egyptian Pounds (EGP). Payment accepted in EUR, GBP, USD.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}