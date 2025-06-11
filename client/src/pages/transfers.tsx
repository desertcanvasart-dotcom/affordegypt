import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Car, MapPin, Clock, Users, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface City {
  id: number;
  name: string;
  slug: string;
}

interface Route {
  id: number;
  fromCityId: number;
  toCityId: number;
  fromLocation: string;
  toLocation: string;
  km: string;
  estimatedDuration: string | null;
  basePriceByVehicle: {
    sedan: number;
    minivan: number;
    van: number;
  };
}

export default function TransfersPage() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { toast } = useToast();

  // Fetch cities
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch routes
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  // Filter available routes based on selected cities
  const availableRoutes = routes.filter(route => {
    if (!fromCity || !toCity) return false;
    return route.fromCityId === parseInt(fromCity) && route.toCityId === parseInt(toCity);
  });

  const handleQuickSearch = () => {
    if (!fromCity || !toCity) {
      toast({
        title: "Missing Information",
        description: "Please select both pickup and drop-off locations.",
        variant: "destructive",
      });
      return;
    }

    const route = availableRoutes[0];
    if (route) {
      setSelectedRoute(route);
    } else {
      toast({
        title: "Route Not Available",
        description: "No direct transfer available for this route. Try our full trip planner instead.",
        variant: "destructive",
      });
    }
  };

  const getPrice = () => {
    if (!selectedRoute || !vehicleType) return 0;
    return selectedRoute.basePriceByVehicle[vehicleType as keyof typeof selectedRoute.basePriceByVehicle] || 0;
  };

  const getVehicleCapacity = (type: string) => {
    switch (type) {
      case 'sedan': return '1-3 passengers';
      case 'minivan': return '4-6 passengers';
      case 'van': return '7-12 passengers';
      default: return '';
    }
  };

  const bookTransfer = useMutation({
    mutationFn: async () => {
      const bookingData = {
        type: 'transfer',
        fromCityId: parseInt(fromCity),
        toCityId: parseInt(toCity),
        vehicleType,
        passengers: parseInt(passengers),
        routeId: selectedRoute?.id,
        totalPrice: getPrice(),
        customerName: "Direct Transfer Booking",
        customerEmail: "transfer@example.com",
        customerPhone: "+20100000000"
      };
      
      return await apiRequest("POST", "/api/route-bookings", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Booked!",
        description: "Your transfer has been confirmed. Check your email for details.",
      });
      // Reset form
      setFromCity("");
      setToCity("");
      setVehicleType("");
      setSelectedRoute(null);
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Instant Transfer Pricing
            </h1>
            <p className="text-xl text-teal-100 mb-8 max-w-3xl mx-auto">
              Get door-to-door transport anywhere in Egypt. Airport transfers, city connections, and inter-city routes with transparent EGP pricing.
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>Instant quotes</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-2" />
                <span>Licensed drivers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Transfer Form */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Car className="w-6 h-6 mr-3 text-teal-600" />
              Book Your Transfer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pickup Location</label>
                <Select value={fromCity} onValueChange={setFromCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Drop-off Location</label>
                <Select value={toCity} onValueChange={setToCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Passengers</label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} passenger{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleQuickSearch}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={!fromCity || !toCity}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Get Instant Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Results */}
        {selectedRoute && (
          <Card className="mb-8 shadow-lg border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-teal-700">
                <MapPin className="w-5 h-5 mr-2" />
                Available Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-lg">
                    {cities.find(c => c.id === selectedRoute.fromCityId)?.name} → {cities.find(c => c.id === selectedRoute.toCityId)?.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedRoute.km} km
                    </span>
                    {selectedRoute.estimatedDuration && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedRoute.estimatedDuration}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>

              {/* Vehicle Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Choose Your Vehicle:</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(selectedRoute.basePriceByVehicle).map(([type, price]) => (
                    <div
                      key={type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        vehicleType === type 
                          ? 'border-teal-500 bg-teal-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setVehicleType(type)}
                    >
                      <div className="text-center">
                        <Car className="w-8 h-8 mx-auto mb-2 text-teal-600" />
                        <h5 className="font-semibold capitalize">{type}</h5>
                        <p className="text-sm text-gray-600 mb-2">{getVehicleCapacity(type)}</p>
                        <p className="text-lg font-bold text-teal-600">
                          {price} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              {vehicleType && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-2xl font-bold text-teal-600">{getPrice()} EGP</p>
                      <p className="text-xs text-gray-500">Final price - no hidden fees</p>
                    </div>
                    <Button
                      onClick={() => bookTransfer.mutate()}
                      disabled={bookTransfer.isPending}
                      className="bg-teal-600 hover:bg-teal-700 px-8 py-3 text-lg"
                    >
                      {bookTransfer.isPending ? "Booking..." : "Book Transfer Now"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Transfer Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.slice(0, 6).map((route) => {
                const fromCityName = cities.find(c => c.id === route.fromCityId)?.name;
                const toCityName = cities.find(c => c.id === route.toCityId)?.name;
                const minPrice = Math.min(...Object.values(route.basePriceByVehicle));
                
                return (
                  <div
                    key={route.id}
                    className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                    onClick={() => {
                      setFromCity(route.fromCityId.toString());
                      setToCity(route.toCityId.toString());
                      setSelectedRoute(route);
                    }}
                  >
                    <h4 className="font-semibold">{fromCityName} → {toCityName}</h4>
                    <p className="text-sm text-gray-600">{route.km} km</p>
                    <p className="text-teal-600 font-bold mt-2">From {minPrice} EGP</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}