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
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Egypt Transportation Routes
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
                Discover convenient and affordable transportation options connecting Egypt's most fascinating destinations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-teal-100">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>Professional Drivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Flexible Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Top-Rated Service</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Inter-City Routes */}
              <Card className="h-fit">
                <CardHeader className="bg-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-6 h-6 text-teal-600" />
                    Inter-City Routes
                    <Badge variant="secondary">{Array.from(interCityCities).length} cities</Badge>
                  </CardTitle>
                  <p className="text-gray-600">
                    Travel between Egypt's major cities with comfortable transportation
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(interCityCities).map((cityId: any) => (
                      <div key={cityId} className="p-3 rounded-md border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-teal-600" />
                          <span className="font-medium">{getCityName(cityId)}</span>
                        </div>
                        <div className="space-y-2">
                          {interCityRoutes
                            .filter((route: any) => route.fromCityId === cityId || route.toCityId === cityId)
                            .slice(0, 2)
                            .map((route: any) => (
                              <div key={route.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  {getCityName(route.fromCityId)} → {getCityName(route.toCityId)}
                                </span>
                                <Link href={`/routes/book/${route.id}`}>
                                  <button className="bg-teal-600 text-white px-2 py-1 rounded text-xs hover:bg-teal-700">
                                    Book
                                  </button>
                                </Link>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* City Tours */}
              <Card className="h-fit">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-orange-600" />
                    City Tours
                    <Badge variant="secondary">{Array.from(cityTourCities).length} cities</Badge>
                  </CardTitle>
                  <p className="text-gray-600">
                    Explore individual cities with dedicated local transportation and guides
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from(cityTourCities).map((cityId: any) => (
                      <div key={cityId} className="p-3 rounded-md border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{getCityName(cityId)}</span>
                        </div>
                        <div className="space-y-2">
                          {cityTours
                            .filter((route: any) => route.fromCityId === cityId)
                            .slice(0, 2)
                            .map((route: any) => (
                              <div key={route.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  {route.name || `${getCityName(route.fromCityId)} Tour`}
                                </span>
                                <Link href={`/routes/book/${route.id}`}>
                                  <button className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700">
                                    Book
                                  </button>
                                </Link>
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
        <section className="bg-teal-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Your Egyptian Journey?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Get a personalized quote for your transportation needs and start planning your adventure today
            </p>
            <Link href="/#quote-builder">
              <button className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors">
                Get Your Quote Now
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}