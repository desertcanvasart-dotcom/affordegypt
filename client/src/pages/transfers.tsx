import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Car, MapPin, Clock, Users, CheckCircle, Zap, Plane, Building, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface City {
  id: number;
  name: string;
  slug: string;
}

interface Route {
  id: number;
  routeCategory: string;
  fromCityId: number | null;
  toCityId: number | null;
  cityId: number | null;
  fromLocation: string;
  toLocation: string;
  name?: string;
  tripMode: string;
  nights: number;
  distanceKm: number | null;
  estimatedDuration: string | null;
  routeHighlights?: string | null;
  vehiclePrices: any;
  basePriceByVehicle?: any; // Legacy field for backward compatibility
}

export default function TransfersPage() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Route Selection, 2: Vehicle Selection
  const [activeTab, setActiveTab] = useState("intercity");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [routeOptions, setRouteOptions] = useState<Route[]>([]);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [selectedCityForLocal, setSelectedCityForLocal] = useState("");
  const [showLocalRoutes, setShowLocalRoutes] = useState(false);
  const { toast } = useToast();

  // Fetch cities
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"]
  });

  // Fetch routes
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/routes"]
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFromCity("");
    setToCity("");
    setSelectedCityForLocal("");
    setShowLocalRoutes(false);
    setCurrentStep(1);
    setSelectedRoute(null);
  };

  const handleRouteSelection = (route: Route) => {
    setSelectedRoute(route);
    setCurrentStep(2);
    
    if (activeTab === "intercity") {
      setFromCity(route.fromCityId?.toString() || "");
      setToCity(route.toCityId?.toString() || "");
    } else {
      setSelectedCityForLocal(route.fromCityId?.toString() || "");
      setShowLocalRoutes(true);
    }
  };

  const getValidPrice = (route: Route, vehicleType: string): number => {
    const price = route.vehiclePrices?.[vehicleType] || route.basePriceByVehicle?.[vehicleType];
    return typeof price === 'number' ? price : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Transfer Only
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Simple point-to-point transportation across Egypt
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
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          // Step 1: Route Selection
          <>
            {/* Tab Interface */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="intercity" className="flex items-center space-x-2">
                  <Plane className="w-4 h-4" />
                  <span>Intercity Travel</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Local Tours</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intercity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Navigation className="w-5 h-5" />
                      <span>Intercity Transportation</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* City Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">From City</label>
                        <Select value={fromCity} onValueChange={setFromCity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select departure city" />
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">To City</label>
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

                    {/* Suggested Routes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {fromCity || toCity ? "Matching Routes" : "Popular Routes"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                          let suggestedRoutes = [];
                          
                          if (fromCity && toCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId?.toString() === fromCity && 
                              route.toCityId?.toString() === toCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else if (fromCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId?.toString() === fromCity && 
                              route.toCityId?.toString() !== toCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else if (toCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.toCityId?.toString() === toCity && 
                              route.fromCityId?.toString() !== fromCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId !== route.toCityId
                            );
                          }
                          
                          return suggestedRoutes.slice(0, 6).map((route) => {
                            const fromCityName = cities.find(c => c.id === route.fromCityId)?.name;
                            const toCityName = cities.find(c => c.id === route.toCityId)?.name;
                            
                            return (
                              <div
                                key={route.id}
                                className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                                onClick={() => handleRouteSelection(route)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-sm">
                                    {fromCityName} → {toCityName}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {route.tripMode === 'transfer' && 'Transfer & Drop-off'}
                                    {route.tripMode === 'day_trip' && 'Day Trip'}
                                    {route.tripMode === 'overnight' && 'Overnight'}
                                    {route.tripMode === 'multi_day' && 'Multi-Day'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{route.distanceKm || 0} km</p>
                                <p className="text-sm text-gray-500 mt-1">Click to see vehicle options</p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="local" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>Local Tours & Transportation</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* City Selection for Local */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select City</label>
                      <Select value={selectedCityForLocal} onValueChange={(value) => {
                        setSelectedCityForLocal(value);
                        setShowLocalRoutes(true);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a city for local tours" />
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

                    {/* Local Routes */}
                    {showLocalRoutes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Available Local Routes
                          {selectedCityForLocal === '3' && (
                            <span className="text-sm text-red-500 ml-2">
                              (Debug: {routes.filter(route => route.fromCityId?.toString() === selectedCityForLocal).length} found)
                            </span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {routes
                            .filter(route => 
                              route.fromCityId?.toString() === selectedCityForLocal
                            )
                            .map((route) => {
                              const cityName = cities.find(c => c.id === route.fromCityId)?.name;
                              const toCityName = cities.find(c => c.id === route.toCityId)?.name;
                              
                              return (
                                <div
                                  key={route.id}
                                  className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                                  onClick={() => handleRouteSelection(route)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm">
                                      {route.name || (route.fromCityId === route.toCityId 
                                        ? `${route.fromLocation} → ${route.toLocation}`
                                        : `${cityName} → ${toCityName}`
                                      )}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {route.tripMode === 'transfer' && 'Transfer'}
                                      {route.tripMode === 'day_trip' && 'Day Trip'}
                                      {route.tripMode === 'overnight' && 'Overnight'}
                                      {route.tripMode === 'multi_day' && 'Multi-Day'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{route.distanceKm || 0} km</p>
                                  <p className="text-sm text-gray-500 mt-1">Click to see vehicle options</p>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Step 2: Vehicle Selection
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Vehicle</h2>
                <p className="text-gray-600 mt-1">Choose your preferred vehicle type for this route</p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                ← Back to Routes
              </button>
            </div>

            {selectedRoute && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeTab === "intercity" 
                      ? `${cities.find(c => c.id === selectedRoute.fromCityId)?.name} → ${cities.find(c => c.id === selectedRoute.toCityId)?.name}`
                      : selectedRoute.name || `${selectedRoute.fromLocation} → ${selectedRoute.toLocation}`
                    }
                  </CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Distance: {selectedRoute.distanceKm || 0} km | 
                      Duration: {selectedRoute.estimatedDuration || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Service Type:</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRoute.tripMode === 'transfer' && 'Transfer & Drop-off'}
                        {selectedRoute.tripMode === 'day_trip' && 'Day Trip (Return Same Day)'}
                        {selectedRoute.tripMode === 'overnight' && 'Overnight Stay (1 Night)'}
                        {selectedRoute.tripMode === 'multi_day' && 'Multi-Day Tour (2+ Nights)'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedRoute.vehiclePrices || {})
                      .sort(([a], [b]) => {
                        const order = { sedan: 1, minivan: 2, van: 3, bus: 4 };
                        return (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999);
                      })
                      .map(([vehicleType, price]) => {
                      const priceValue = typeof price === 'number' ? price : (typeof price === 'string' ? parseFloat(price) : 0);
                      return (
                        <div
                          key={vehicleType}
                          className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                          onClick={() => {
                            // Proceed to booking
                            window.location.href = `/book?route=${selectedRoute.id}&vehicle=${vehicleType}&price=${Math.round(priceValue)}`;
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold capitalize">{vehicleType.replace('_', ' ')}</h3>
                            <Car className="w-5 h-5 text-teal-600" />
                          </div>
                          <p className="text-2xl font-bold text-teal-600">{Math.round(priceValue)} EGP</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {vehicleType === 'sedan' && '1-2 passengers'}
                            {vehicleType === 'minivan' && '3-8 passengers'}
                            {vehicleType === 'van' && '9-15 passengers'}
                            {vehicleType === 'coach' && '16-35 passengers'}
                            {vehicleType === 'bus' && '16-35 passengers'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}