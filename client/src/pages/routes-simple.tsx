import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Clock, Star } from "lucide-react";
import { Link } from "wouter";

export default function RoutesSimple() {
  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Helper function to get city name by ID
  const getCityName = (cityId: number) => {
    if (!cities || !Array.isArray(cities)) return 'Unknown';
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : 'Unknown';
  };

  // Group routes by type
  const interCityRoutes = routes && Array.isArray(routes) ? 
    routes.filter((route: any) => route.fromCityId !== route.toCityId) : [];
  
  const cityTours = routes && Array.isArray(routes) ? 
    routes.filter((route: any) => route.fromCityId === route.toCityId) : [];

  // Get unique cities for each category
  const interCityCities = new Set();
  const cityTourCities = new Set();

  if (interCityRoutes) {
    interCityRoutes.forEach((route: any) => {
      interCityCities.add(route.fromCityId);
      interCityCities.add(route.toCityId);
    });
  }

  if (cityTours) {
    cityTours.forEach((route: any) => {
      cityTourCities.add(route.fromCityId);
    });
  }

  return (
    <>
      <Helmet>
        <title>Egypt Routes & Transportation - Affordable Travel Options | Afford Egypt</title>
        <meta name="description" content="Explore comprehensive transportation routes across Egypt. From inter-city journeys to city tours, find affordable and reliable travel options for your Egyptian adventure." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-8">
                Egypt Transportation Routes
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                Discover convenient and affordable transportation options connecting Egypt's most fascinating destinations
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-teal-100">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6" />
                  <span className="text-lg">Professional Drivers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg">Flexible Scheduling</span>
                </div>
                <div className="flex items-center gap-3">
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
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              
              {/* Inter-City Routes */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Car className="w-8 h-8 text-teal-600" />
                    Inter-City Routes
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {Array.from(interCityCities).length} cities
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-700 text-lg mt-2">
                    Travel between Egypt's major cities with comfortable transportation
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from(interCityCities).map((cityId: any) => (
                      <div key={cityId} className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="w-5 h-5 text-teal-600" />
                          <span className="font-semibold text-lg text-gray-900">{getCityName(cityId)}</span>
                        </div>
                        <div className="space-y-3">
                          {interCityRoutes
                            .filter((route: any) => route.fromCityId === cityId)
                            .map((route: any) => (
                              <div key={route.id} className="bg-white p-3 rounded-md border border-gray-100 hover:border-teal-200 transition-colors">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <span className="text-gray-800 font-medium text-sm">
                                      {getCityName(route.fromCityId)} → {getCityName(route.toCityId)}
                                    </span>
                                    {route.description && (
                                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {route.description}
                                      </div>
                                    )}
                                    {route.name && !route.description && (
                                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {route.name}
                                      </div>
                                    )}
                                  </div>
                                  <Link href={`/routes/book/${route.id}`}>
                                    <button className="bg-teal-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-teal-700 transition-colors whitespace-nowrap">
                                      Book Now
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* City Tours */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 p-8">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="w-8 h-8 text-orange-600" />
                    City Tours
                    <Badge variant="outline" className="text-sm px-3 py-1 border-orange-200 text-orange-700">
                      {Array.from(cityTourCities).length} cities
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-700 text-lg mt-2">
                    Explore individual cities with dedicated local transportation and guides
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from(cityTourCities).map((cityId: any) => (
                      <div key={cityId} className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold text-lg text-gray-900">{getCityName(cityId)}</span>
                        </div>
                        <div className="space-y-3">
                          {cityTours
                            .filter((route: any) => route.fromCityId === cityId)
                            .map((route: any) => (
                              <div key={route.id} className="bg-white p-3 rounded-md border border-gray-100 hover:border-orange-200 transition-colors">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <span className="text-gray-800 font-medium text-sm">
                                      {route.name || `${getCityName(route.fromCityId)} Tour`}
                                    </span>
                                    {route.description && (
                                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {route.description}
                                      </div>
                                    )}
                                  </div>
                                  <Link href={`/routes/book/${route.id}`}>
                                    <button className="bg-orange-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-orange-700 transition-colors whitespace-nowrap">
                                      Book Now
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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