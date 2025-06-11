import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Clock, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

export default function RoutesSimple() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('inter-city');

  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const tab = urlParams.get('tab');
    if (tab === 'city-tours') {
      setActiveTab('city-tours');
    } else {
      setActiveTab('inter-city');
    }
  }, [location]);

  // Helper function to get city name by ID
  const getCityName = (cityId: number) => {
    if (!cities || !Array.isArray(cities)) return 'Unknown';
    const city = cities.find((c: any) => c.id === cityId);
    return city?.name || 'Unknown';
  };

  if (!routes || !Array.isArray(routes) || !cities || !Array.isArray(cities)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Filter routes by type - convert km to number for proper comparison
  const interCityRoutes = routes.filter((route: any) => Number(route.km) > 0);
  const cityTourRoutes = routes.filter((route: any) => Number(route.km) === 0);

  // Get unique cities for each category
  const interCityCities = new Set(interCityRoutes.map((route: any) => route.fromCityId));
  const cityTourCities = new Set(cityTourRoutes.map((route: any) => route.fromCityId));



  return (
    <>
      <Helmet>
        <title>Transportation Routes - Affordable Egypt Travel</title>
        <meta name="description" content="Discover Egypt's comprehensive transportation network. Book inter-city transfers and city tours with competitive pricing and reliable service." />
      </Helmet>
      
      <Navbar />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-50 via-white to-blue-50 py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Egypt Transportation <span className="text-teal-600">Network</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Seamless connections across Egypt with professional drivers, comfortable vehicles, and transparent pricing
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Car className="w-6 h-6" />
                  <span className="text-lg">Modern Fleet</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg">Flexible Scheduling</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Star className="w-6 h-6" />
                  <span className="text-lg">Top-Rated Service</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Transportation Options</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from our comprehensive network of inter-city transfers and local city tours
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActiveTab('inter-city')}
                  className={`px-8 py-3 rounded-md font-semibold text-lg transition-all ${
                    activeTab === 'inter-city'
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Car className="w-5 h-5 inline mr-2" />
                  Inter-City Routes
                  <Badge variant="secondary" className="ml-2 text-sm">
                    {Array.from(interCityCities).length} cities
                  </Badge>
                </button>
                <button
                  onClick={() => setActiveTab('city-tours')}
                  className={`px-8 py-3 rounded-md font-semibold text-lg transition-all ${
                    activeTab === 'city-tours'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapPin className="w-5 h-5 inline mr-2" />
                  City Tours
                  <Badge variant="secondary" className="ml-2 text-sm">
                    {Array.from(cityTourCities).length} cities
                  </Badge>
                </button>
              </div>
            </div>

            {/* Inter-City Routes Tab */}
            {activeTab === 'inter-city' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from(interCityCities).map((cityId: any) => (
                  <Card key={cityId} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <MapPin className="w-6 h-6 text-teal-600" />
                        <span className="text-gray-900">{getCityName(cityId)}</span>
                      </CardTitle>
                      <p className="text-gray-600 text-sm">
                        Inter-city routes from {getCityName(cityId)}
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {interCityRoutes
                          .filter((route: any) => route.fromCityId === cityId)
                          .map((route: any) => (
                            <div key={route.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-teal-200 transition-colors">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <span className="text-gray-800 font-medium">
                                    → {getCityName(route.toCityId)}
                                  </span>
                                  {route.description && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {route.description}
                                    </div>
                                  )}
                                  <div className="flex gap-3 mt-2 text-sm text-gray-500">
                                    <span>From ${route.basePriceByVehicle?.sedan || 0}</span>
                                    <span>•</span>
                                    <span>{route.km || 0} km</span>
                                  </div>
                                </div>
                                <Link href={`/routes/book/${route.id}`}>
                                  <button className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors">
                                    Book Now
                                  </button>
                                </Link>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* City Tours Tab */}
            {activeTab === 'city-tours' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from(cityTourCities).map((cityId: any) => (
                  <Card key={cityId} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 p-6">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <MapPin className="w-6 h-6 text-orange-600" />
                        <span className="text-gray-900">{getCityName(cityId)}</span>
                      </CardTitle>
                      <p className="text-gray-600 text-sm">
                        Local tours and transportation in {getCityName(cityId)}
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {cityTourRoutes
                          .filter((route: any) => route.fromCityId === cityId)
                          .map((route: any) => (
                            <div key={route.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                  <span className="text-gray-800 font-medium">
                                    {route.description || `${getCityName(route.fromCityId)} Tour`}
                                  </span>
                                  <div className="flex gap-3 mt-2 text-sm text-gray-500">
                                    <span>From ${route.basePriceByVehicle?.sedan || 0}</span>
                                    <span>•</span>
                                    <span>{route.km || 0} km</span>
                                  </div>
                                </div>
                                <Link href={`/routes/book/${route.id}`}>
                                  <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 transition-colors">
                                    Book Now
                                  </button>
                                </Link>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Egyptian Journey?
            </h2>
            <p className="text-xl md:text-2xl text-teal-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Get a personalized quote for your transportation needs and start planning your adventure today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#quote-builder">
                <button className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                  Get Custom Quote
                </button>
              </Link>
              <Link href="/pricing">
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-teal-600 transition-colors">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}