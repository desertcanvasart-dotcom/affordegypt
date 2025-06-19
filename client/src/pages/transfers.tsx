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
  const [routeOptions, setRouteOptions] = useState<Route[]>([]);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [selectedCityForLocal, setSelectedCityForLocal] = useState("");
  const [showLocalRoutes, setShowLocalRoutes] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Reset form when switching tabs
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentStep(1);
    setFromCity("");
    setToCity("");
    setVehicleType("");
    setSelectedRoute(null);
    setRouteOptions([]);
    setSelectedCityForLocal("");
    setShowLocalRoutes(false);
  };

  // Handle route selection and move to vehicle selection
  const handleRouteSelection = (route: Route) => {
    setSelectedRoute(route);
    setCurrentStep(2);
  };

  // Handle back to route selection
  const handleBackToRoutes = () => {
    setCurrentStep(1);
    setVehicleType("");
  };



  // Fetch cities
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  // Fetch routes
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Filter routes based on tab and selected cities
  const availableRoutes = routes.filter(route => {
    if (activeTab === "intercity") {
      // Intercity: routes between different cities
      if (route.routeCategory !== 'inter_city') return false;
      if (!fromCity || !toCity) return false;
      return route.fromCityId === parseInt(fromCity) && route.toCityId === parseInt(toCity);
    } else {
      // Intracity: routes within same city
      if (route.routeCategory !== 'intra_city') return false;
      if (!selectedCityForLocal) return false;
      return route.cityId === parseInt(selectedCityForLocal);
    }
  });

  // Filter cities for display based on active tab and sort alphabetically
  const getAvailableCities = (isFromCity: boolean) => {
    let availableCities;
    if (activeTab === "intercity") {
      availableCities = cities; // Show all cities for intercity
    } else {
      // For intracity, only show cities that have internal routes
      const citiesWithInternalRoutes = new Set();
      routes.forEach(route => {
        if (route.routeCategory === 'intra_city' && route.cityId) {
          citiesWithInternalRoutes.add(route.cityId);
        }
      });
      availableCities = cities.filter(city => citiesWithInternalRoutes.has(city.id));
    }
    
    // Always sort cities alphabetically (case-insensitive, trimmed, with proper locale handling)
    return [...availableCities].sort((a, b) => 
      a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase(), 'en', { 
        numeric: true, 
        sensitivity: 'base' 
      })
    );
  };

  const handleQuickSearch = () => {
    if (activeTab === "intercity") {
      if (!fromCity || !toCity) {
        toast({
          title: "Missing Information",
          description: "Please select both pickup and drop-off locations.",
          variant: "destructive",
        });
        return;
      }

      // Get all available route options for this city pair
      const routeOptions = getRouteOptionsForCityPair(parseInt(fromCity), parseInt(toCity));
      
      if (routeOptions.length > 0) {
        // If multiple options exist, don't auto-select one - let user choose
        // If only one option exists, auto-select it
        if (routeOptions.length === 1) {
          setSelectedRoute(routeOptions[0]);
        } else {
          setSelectedRoute(null); // Show options dropdown
        }
        setRouteOptions([...routeOptions]); // Force array recreation to trigger re-render
      } else {
        toast({
          title: "Route Not Available",
          description: "No direct transfer available for this route. Try our full trip planner instead.",
          variant: "destructive",
        });
        setRouteOptions([]);
      }
    } else {
      // Intracity search
      if (!selectedCityForLocal) {
        toast({
          title: "Missing Information",
          description: "Please select a city to see local routes.",
          variant: "destructive",
        });
        return;
      }
      setShowLocalRoutes(true);
      setSelectedRoute(null);
      setVehicleType("");
    }
  };

  // Get cities that have intracity routes (where fromCityId === toCityId)
  const getCitiesWithLocalRoutes = () => {
    if (!routes.length) return cities;
    const localCityIds = new Set(routes.filter(route => route.fromCityId === route.toCityId).map(route => route.fromCityId));
    return cities.filter(city => localCityIds.has(city.id));
  };

  // Get local routes within a selected city
  const getLocalRoutesForCity = (cityId: number) => {
    return routes.filter(route => route.fromCityId === cityId && route.toCityId === cityId);
  };

  // Get all route options for a city pair (grouped by trip mode)
  const getRouteOptionsForCityPair = (fromCityId: number, toCityId: number) => {
    return routes.filter(route => 
      route.fromCityId === fromCityId && route.toCityId === toCityId
    );
  };

  // Get trip mode label
  const getTripModeLabel = (tripMode: string) => {
    const labels = {
      'transfer': 'Transfer & Drop off',
      'day_trip': 'Day Trip (return same day)',
      'overnight': 'Overnight Stay (1 night)',
      'multi_day': 'Multi-Day Tour (2+ nights)'
    };
    return labels[tripMode as keyof typeof labels] || tripMode;
  };

  const getValidPrice = (route: Route, vehicleType: string): number => {
    if (!route) return 0;
    
    // Parse vehiclePrices if it's a string (from database JSON)
    let vehiclePrices = route.vehiclePrices;
    if (typeof vehiclePrices === 'string') {
      try {
        vehiclePrices = JSON.parse(vehiclePrices);
      } catch (e) {
        console.error('Failed to parse vehiclePrices:', vehiclePrices);
        vehiclePrices = {};
      }
    }
    
    console.log('Getting price for:', vehicleType, 'from route:', route.id, 'vehiclePrices:', vehiclePrices);
    
    // Try new vehiclePrices field first with vehicle names
    if (vehiclePrices && typeof vehiclePrices === 'object') {
      const price = vehiclePrices[vehicleType];
      if (typeof price === 'number' && price > 0) return price;
      if (typeof price === 'string' && !isNaN(parseFloat(price))) return parseFloat(price);
      
      // Try legacy vehicle ID mapping (1=sedan, 2=minivan, 3=van)
      const vehicleIdMap = { sedan: '1', minivan: '2', van: '3' };
      const vehicleId = vehicleIdMap[vehicleType as keyof typeof vehicleIdMap];
      if (vehicleId && vehiclePrices[vehicleId]) {
        const idBasedPrice = vehiclePrices[vehicleId];
        if (typeof idBasedPrice === 'object' && idBasedPrice['1']) {
          const finalPrice = idBasedPrice['1'];
          if (typeof finalPrice === 'string' && !isNaN(parseFloat(finalPrice))) return parseFloat(finalPrice);
          if (typeof finalPrice === 'number' && finalPrice > 0) return finalPrice;
        }
      }
    }
    
    // Fallback to legacy basePriceByVehicle for existing routes
    if (route.basePriceByVehicle && typeof route.basePriceByVehicle === 'object') {
      const directPrice = route.basePriceByVehicle[vehicleType];
      if (typeof directPrice === 'number' && directPrice > 0) return directPrice;
      
      // Try fallback properties for legacy data
      const fallbackKey = `${vehicleType}Price`;
      const fallbackPrice = route.basePriceByVehicle[fallbackKey];
      if (typeof fallbackPrice === 'number' && fallbackPrice > 0) return fallbackPrice;
    }
    
    return 0;
  };

  const getPrice = () => {
    if (!selectedRoute || !vehicleType) return 0;
    return getValidPrice(selectedRoute, vehicleType);
  };



  const getVehicleCapacity = (type: string) => {
    switch (type) {
      case 'sedan': return '1-3 passengers';
      case 'minivan': return '4-6 passengers';
      case 'van': return '7-12 passengers';
      default: return '';
    }
  };

  const proceedToBooking = () => {
    if (!selectedRoute || !vehicleType) {
      toast({
        title: "Missing Information",
        description: "Please select a route and vehicle type.",
        variant: "destructive",
      });
      return;
    }

    // Store booking data in sessionStorage for the route booking page
    const bookingData = {
      routeId: selectedRoute.id,
      vehicleType,
      passengers: parseInt(passengers),
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      travelTime,
      totalAmount: getPrice(),
      fromCityName: selectedRoute.routeCategory === 'inter_city' 
        ? cities.find(c => c.id === selectedRoute.fromCityId)?.name
        : cities.find(c => c.id === selectedRoute.cityId)?.name,
      toCityName: selectedRoute.routeCategory === 'inter_city'
        ? cities.find(c => c.id === selectedRoute.toCityId)?.name
        : 'Local',
      routeName: selectedRoute.name || 
        (selectedRoute.routeCategory === 'inter_city' 
          ? `${cities.find(c => c.id === selectedRoute.fromCityId)?.name} → ${cities.find(c => c.id === selectedRoute.toCityId)?.name}`
          : `${cities.find(c => c.id === selectedRoute.cityId)?.name} Local`),
      distance: selectedRoute.distanceKm?.toString() || '0',
      duration: selectedRoute.estimatedDuration,
      highlights: selectedRoute.routeHighlights
    };
    
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    setLocation('/route-booking');
  };

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
            <TabsTrigger value="intracity" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>City Local</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intercity">
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Plane className="w-6 h-6 mr-3 text-teal-600" />
                  Intercity Transfer
                </CardTitle>
                <p className="text-gray-600">Travel between different cities across Egypt</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">From City</label>
                    <Select value={fromCity} onValueChange={setFromCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select departure city" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCities(true).map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">To City</label>
                    <Select value={toCity} onValueChange={setToCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination city" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCities(false).map((city) => (
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Travel Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Departure Time</label>
                    <input
                      type="time"
                      value={travelTime}
                      onChange={(e) => setTravelTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={handleQuickSearch}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={!fromCity || !toCity}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Get Quote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intracity">
            <Card className="mb-8 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Building className="w-6 h-6 mr-3 text-teal-600" />
                  Local City Transfer
                </CardTitle>
                <p className="text-gray-600">Local transport within the same city</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select City</label>
                    <Select value={selectedCityForLocal} onValueChange={setSelectedCityForLocal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose city for local routes" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCitiesWithLocalRoutes().map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Travel Date</label>
                    <input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Travel Time</label>
                    <Select value={travelTime} onValueChange={setTravelTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00">06:00 AM</SelectItem>
                        <SelectItem value="07:00">07:00 AM</SelectItem>
                        <SelectItem value="08:00">08:00 AM</SelectItem>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">01:00 PM</SelectItem>
                        <SelectItem value="14:00">02:00 PM</SelectItem>
                        <SelectItem value="15:00">03:00 PM</SelectItem>
                        <SelectItem value="16:00">04:00 PM</SelectItem>
                        <SelectItem value="17:00">05:00 PM</SelectItem>
                        <SelectItem value="18:00">06:00 PM</SelectItem>
                        <SelectItem value="19:00">07:00 PM</SelectItem>
                        <SelectItem value="20:00">08:00 PM</SelectItem>
                        <SelectItem value="21:00">09:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleQuickSearch}
                    className="bg-teal-600 hover:bg-teal-700 px-8"
                    disabled={!selectedCityForLocal}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    See Local Routes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Local Routes Display */}
            {showLocalRoutes && selectedCityForLocal && (
              <Card className="mb-8 shadow-lg border-teal-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                    Local Routes in {cities.find(c => c.id === parseInt(selectedCityForLocal))?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getLocalRoutesForCity(parseInt(selectedCityForLocal)).map((route) => (
                      <div
                        key={route.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRoute?.id === route.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                        onClick={() => {
                          setSelectedRoute(route);
                          setVehicleType("");
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-2">
                              {route.name || `${route.fromLocation || 'Unknown'} → ${route.toLocation || 'Unknown'}`}
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {route.estimatedDuration}
                              </div>
                              <div className="flex items-center">
                                <Navigation className="w-4 h-4 mr-1" />
                                {route.distanceKm || 0} km
                              </div>
                              <div className="flex items-center">
                                <Car className="w-4 h-4 mr-1" />
                                From {getValidPrice(route, 'sedan') || 'N/A'} EGP
                              </div>
                            </div>
                            {route.routeHighlights && (
                              <p className="mt-2 text-sm text-gray-700">{route.routeHighlights}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Route Options Selection */}


        {routeOptions.length > 1 && !selectedRoute && (
          <Card className="mb-8 shadow-lg border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-teal-700">
                <MapPin className="w-5 h-5 mr-2" />
                Choose Your Trip Type
              </CardTitle>
              <p className="text-gray-600">
                {cities.find(c => c.id === parseInt(fromCity))?.name} → {cities.find(c => c.id === parseInt(toCity))?.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">Multiple options available for this route:</h4>
                <div className="grid gap-4">
                  {routeOptions.map((route) => (
                    <div
                      key={route.id}
                      className="border rounded-lg p-4 cursor-pointer transition-colors hover:border-teal-300 hover:bg-teal-50"
                      onClick={() => {
                        setSelectedRoute(route);
                        setVehicleType("");
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold text-base mb-2">
                            {getTripModeLabel(route.tripMode)}
                          </h5>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            {route.tripMode !== 'transfer' && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {route.nights === 0 ? 'Same day return' : `${route.nights} night${route.nights !== 1 ? 's' : ''}`}
                              </span>
                            )}
                            {route.distanceKm && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {route.distanceKm} km
                              </span>
                            )}
                            {route.estimatedDuration && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {route.estimatedDuration}
                              </span>
                            )}
                          </div>
                          {route.routeHighlights && (
                            <p className="mt-2 text-sm text-gray-700">{route.routeHighlights}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">From</div>
                          <div className="text-lg font-bold text-teal-600">
                            {getValidPrice(route, 'sedan') || 'N/A'} EGP
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Route Details */}
        {selectedRoute && (
          <Card className="mb-8 shadow-lg border-teal-200">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-teal-700">
                <MapPin className="w-5 h-5 mr-2" />
                {getTripModeLabel(selectedRoute.tripMode)}
              </CardTitle>
              <p className="text-gray-600">
                {selectedRoute.routeCategory === 'inter_city' 
                  ? `${cities.find(c => c.id === selectedRoute.fromCityId)?.name} → ${cities.find(c => c.id === selectedRoute.toCityId)?.name}`
                  : `${cities.find(c => c.id === selectedRoute.cityId)?.name} Local`
                }
              </p>
              {routeOptions.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRoute(null)}
                  className="mt-2 w-fit"
                >
                  ← Back to Options
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-base">
                    {selectedRoute.routeCategory === 'inter_city' 
                      ? `${cities.find(c => c.id === selectedRoute.fromCityId)?.name} → ${cities.find(c => c.id === selectedRoute.toCityId)?.name}`
                      : `${cities.find(c => c.id === selectedRoute.cityId)?.name} Local`
                    }
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mt-2 space-x-4">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedRoute.distanceKm || 0} km
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
                  {['sedan', 'minivan', 'van'].map((type) => {
                    const price = getValidPrice(selectedRoute, type);
                    if (price === 0) return null;
                    
                    return (
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
                          <div>
                            <p className="text-lg font-bold text-teal-600">
                              {price} EGP
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Payment: Euro/GBP/USD accepted
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
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
                      onClick={proceedToBooking}
                      className="bg-teal-600 hover:bg-teal-700 px-8 py-3 text-lg"
                    >
                      Continue to Booking
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Suggested Routes */}
        <Card>
          <CardHeader>
            <CardTitle>
              {fromCity && cities.find(c => c.id.toString() === fromCity) 
                ? `Popular routes from ${cities.find(c => c.id.toString() === fromCity)?.name}`
                : activeTab === "intercity" 
                  ? "Popular Intercity Routes" 
                  : "Popular Local Routes"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                let suggestedRoutes = [];
                
                if (fromCity) {
                  // Show routes from the selected departure city
                  suggestedRoutes = routes.filter(route => 
                    route.fromCityId?.toString() === fromCity && 
                    route.toCityId?.toString() !== toCity &&
                    (activeTab === "intercity" ? route.fromCityId !== route.toCityId : route.fromCityId === route.toCityId)
                  );
                } else if (toCity) {
                  // Show routes to the selected destination city
                  suggestedRoutes = routes.filter(route => 
                    route.toCityId?.toString() === toCity && 
                    route.fromCityId?.toString() !== fromCity &&
                    (activeTab === "intercity" ? route.fromCityId !== route.toCityId : route.fromCityId === route.toCityId)
                  );
                } else {
                  // Show popular routes based on active tab
                  suggestedRoutes = routes.filter(route => 
                    activeTab === "intercity" ? route.fromCityId !== route.toCityId : route.fromCityId === route.toCityId
                  );
                }
                
                return suggestedRoutes.slice(0, 6).map((route) => {
                  const fromCityName = cities.find(c => c.id === route.fromCityId)?.name?.trim();
                  const toCityName = cities.find(c => c.id === route.toCityId)?.name?.trim();
                  const minPrice = route.vehiclePrices?.sedan || 
                                 route.vehiclePrices?.minivan || 
                                 route.vehiclePrices?.van || 0;
                  
                  return (
                    <div
                      key={route.id}
                      className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                      onClick={() => handleRouteSelection(route)}
                    >
                      <h4 className="font-semibold text-sm">
                        {activeTab === "intercity" 
                          ? `${fromCityName} → ${toCityName}`
                          : route.name || `${route.fromLocation || fromCityName} → ${route.toLocation || toCityName}`
                        }
                      </h4>
                      <p className="text-sm text-gray-600">{route.distanceKm || 0} km</p>
                      <p className="text-sm text-gray-500 mt-1">Click to see vehicle options</p>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
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
                  <p className="text-sm text-gray-600">
                    Distance: {selectedRoute.distanceKm || 0} km | 
                    Duration: {selectedRoute.estimatedDuration || 'N/A'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(selectedRoute.vehiclePrices || {}).map(([vehicleType, price]) => (
                      <div
                        key={vehicleType}
                        className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedVehicleType(vehicleType);
                          // Proceed to booking
                          window.location.href = `/book?route=${selectedRoute.id}&vehicle=${vehicleType}&price=${price}`;
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold capitalize">{vehicleType.replace('_', ' ')}</h3>
                          <Car className="w-5 h-5 text-teal-600" />
                        </div>
                        <p className="text-2xl font-bold text-teal-600">{price} EGP</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {vehicleType === 'sedan' && 'Up to 4 passengers'}
                          {vehicleType === 'minivan' && 'Up to 7 passengers'}
                          {vehicleType === 'van' && 'Up to 12 passengers'}
                          {vehicleType === 'bus' && 'Up to 20 passengers'}
                        </p>
                      </div>
                    ))}
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