import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Clock, Users, Calendar, Phone, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Route {
  id: number;
  fromCityId: number;
  toCityId: number;
  name?: string;
  description?: string;
  km?: string;
  estimatedDuration?: string;
  displayOrder?: number;
  sedanPrice?: string;
  minivanPrice?: string;
  vanPrice?: string;
}

interface City {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface VehicleType {
  id: number;
  name: string;
  description?: string;
  paxMin: number;
  paxMax: number;
}

export default function RouteBooking() {
  const [match, params] = useRoute("/routes/book/:routeId");
  const routeId = params?.routeId ? parseInt(params.routeId) : null;
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");

  const { toast } = useToast();

  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  const { data: vehicleTypes } = useQuery({
    queryKey: ["/api/vehicle-types"],
  });

  // Find the selected route
  const selectedRoute = routes && Array.isArray(routes) ? 
    (routes as Route[]).find((route: Route) => route.id === routeId) : undefined;
  
  // Debug logging
  console.log('Route booking debug:', {
    routeId,
    selectedRoute,
    routesCount: Array.isArray(routes) ? routes.length : 0,
    hasSedanPrice: selectedRoute?.sedanPrice,
    hasMinivanPrice: selectedRoute?.minivanPrice,
    hasVanPrice: selectedRoute?.vanPrice
  });
  
  // Helper functions
  const getCityName = (cityId: number) => {
    if (!cities) return 'Unknown';
    const city = (cities as City[]).find(c => c.id === cityId);
    return city?.name || 'Unknown';
  };

  const getVehiclePrice = (vehicleType: string) => {
    if (!selectedRoute) return "0";
    switch (vehicleType.toLowerCase()) {
      case 'sedan':
        return selectedRoute.sedanPrice || "0";
      case 'minivan':
        return selectedRoute.minivanPrice || "0";
      case 'van':
        return selectedRoute.vanPrice || "0";
      default:
        return "0";
    }
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(getVehiclePrice(selectedVehicle));
    return basePrice;
  };

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/route-bookings", bookingData);
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Submitted Successfully",
        description: "We'll contact you shortly to confirm your transportation booking.",
      });
      // Reset form
      setSelectedVehicle("");
      setPassengers(2);
      setTravelDate("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSpecialRequests("");
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoute || !selectedVehicle || !travelDate || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      routeId: selectedRoute.id,
      vehicleType: selectedVehicle,
      passengers,
      travelDate,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      totalAmount: calculateTotal(),
      bookingType: 'route-only'
    };

    bookingMutation.mutate(bookingData);
  };

  if (!selectedRoute) {
    return (
      <>
        <Helmet>
          <title>Route Not Found | Afford Egypt</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
                <p className="text-gray-600 mb-6">The requested route could not be found.</p>
                <Link href="/routes">
                  <Button>Browse All Routes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book Transportation: {getCityName(selectedRoute.fromCityId)} to {getCityName(selectedRoute.toCityId)} | Afford Egypt</title>
        <meta name="description" content={`Book reliable transportation from ${getCityName(selectedRoute.fromCityId)} to ${getCityName(selectedRoute.toCityId)}. Professional drivers, competitive prices, flexible scheduling.`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Route Details */}
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-teal-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-semibold">
                        {getCityName(selectedRoute.fromCityId)} → {getCityName(selectedRoute.toCityId)}
                      </div>
                      {selectedRoute.name && (
                        <div className="text-sm text-gray-600">{selectedRoute.name}</div>
                      )}
                    </div>
                  </div>
                  
                  {selectedRoute.km && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5" />
                      <div className="text-sm">
                        <span className="font-medium">Distance:</span> {selectedRoute.km} km
                      </div>
                    </div>
                  )}
                  
                  {selectedRoute.estimatedDuration && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-teal-600" />
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span> {selectedRoute.estimatedDuration}
                      </div>
                    </div>
                  )}
                  
                  {selectedRoute.description && (
                    <div className="pt-2">
                      <p className="text-gray-600 text-sm">{selectedRoute.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Book Your Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Vehicle Selection */}
                  <div>
                    <Label>Vehicle Type *</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {selectedRoute?.sedanPrice && (
                          <SelectItem value="sedan">
                            Sedan - ${selectedRoute.sedanPrice}
                          </SelectItem>
                        )}
                        {selectedRoute?.minivanPrice && (
                          <SelectItem value="minivan">
                            Minivan - ${selectedRoute.minivanPrice}
                          </SelectItem>
                        )}
                        {selectedRoute?.vanPrice && (
                          <SelectItem value="van">
                            Van - ${selectedRoute.vanPrice}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label>Number of Passengers *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Travel Date */}
                  <div>
                    <Label>Travel Date *</Label>
                    <Input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Customer Details */}
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label>Special Requests</Label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements or requests..."
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  {selectedVehicle && (
                    <div className="bg-teal-50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="text-2xl font-bold text-teal-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Transportation only • No hidden fees
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? "Submitting..." : "Book Transportation"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our booking terms. 
                    We'll contact you to confirm details and payment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Need Full Service? */}
          <Card className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Need a Complete Travel Package?</h3>
                <p className="text-gray-600 mb-4">
                  Add tour guides, attractions, and more with our comprehensive pricing tool
                </p>
                <Link href="/#quote-builder">
                  <Button variant="outline" className="border-orange-200 hover:bg-orange-100">
                    Build Complete Package
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}