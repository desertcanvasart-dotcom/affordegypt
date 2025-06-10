import { useMemo } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Car, Clock, Star, ArrowRight, Users, DollarSign } from "lucide-react";
import { Link } from "wouter";

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

interface Attraction {
  id: number;
  cityId: number;
  name: string;
  description?: string;
}

export default function RouteCityPage() {
  const { category, citySlug } = useParams();

  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  const { data: attractions } = useQuery({
    queryKey: ["/api/attractions"],
  });

  // Find the current city
  const currentCity = useMemo(() => {
    if (!cities || !Array.isArray(cities) || !citySlug) return null;
    return (cities as City[]).find((city: City) => city.slug === citySlug);
  }, [cities, citySlug]);

  // Determine route type based on category
  const isInterCity = category === 'inter-city-routes';

  // Filter routes for this city and category
  const cityRoutes = useMemo(() => {
    if (!routes || !Array.isArray(routes) || !currentCity) return [];
    
    return (routes as Route[])
      .filter((route: Route) => {
        if (isInterCity) {
          // For inter-city routes, include routes that start from or go to this city
          return route.fromCityId === currentCity.id || route.toCityId === currentCity.id;
        } else {
          // For city tours, include routes within the same city
          return route.fromCityId === currentCity.id && route.toCityId === currentCity.id;
        }
      })
      .sort((a: Route, b: Route) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [routes, currentCity, isInterCity]);

  // Get city attractions
  const cityAttractions = useMemo(() => {
    if (!attractions || !Array.isArray(attractions) || !currentCity) return [];
    return (attractions as Attraction[])
      .filter((attraction: Attraction) => attraction.cityId === currentCity.id)
      .slice(0, 6); // Show top 6 attractions
  }, [attractions, currentCity]);

  // Helper function to get city name by ID
  const getCityName = (cityId: number) => {
    if (!cities || !Array.isArray(cities)) return 'Unknown';
    const city = (cities as City[]).find((c: City) => c.id === cityId);
    return city ? city.name : 'Unknown';
  };

  // Generate route display name
  const getRouteDisplayName = (route: Route) => {
    if (route.name) return route.name;
    
    if (isInterCity) {
      const fromCity = getCityName(route.fromCityId);
      const toCity = getCityName(route.toCityId);
      return `${fromCity} → ${toCity}`;
    } else {
      return `${currentCity?.name} City Tour`;
    }
  };

  if (!currentCity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">City Not Found</h1>
          <p className="text-gray-600 mt-2">The requested city could not be found.</p>
          <Link href="/routes">
            <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
              Back to Routes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = isInterCity 
    ? `${currentCity.name} Inter-City Routes - Transportation | Afford Egypt`
    : `${currentCity.name} City Tours - Local Transportation | Afford Egypt`;

  const pageDescription = isInterCity
    ? `Discover convenient inter-city transportation routes from ${currentCity.name} to other Egyptian destinations. Affordable and reliable travel options.`
    : `Explore ${currentCity.name} with our comprehensive city tour transportation options. Local guides and comfortable vehicles available.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Link href="/routes" className="text-teal-200 hover:text-white transition-colors">
                  Routes
                </Link>
                <ArrowRight className="w-4 h-4 text-teal-200" />
                <span className="text-teal-200">
                  {isInterCity ? 'Inter-City Routes' : 'City Tours'}
                </span>
                <ArrowRight className="w-4 h-4 text-teal-200" />
                <span>{currentCity.name}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {isInterCity ? `${currentCity.name} Connections` : `Explore ${currentCity.name}`}
              </h1>
              
              <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
                {isInterCity 
                  ? `Travel to and from ${currentCity.name} with our comfortable and affordable transportation options`
                  : `Discover the best of ${currentCity.name} with our guided tours and local transportation services`
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-teal-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{cityRoutes.length} Routes Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>Multiple Vehicle Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Expert Local Drivers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Available Routes
              </h2>
              <p className="text-lg text-gray-600">
                Choose from our carefully planned routes for the best travel experience
              </p>
            </div>

            {cityRoutes.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Routes Available</h3>
                <p className="text-gray-500">There are currently no routes configured for this city.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityRoutes.map((route) => (
                  <Card key={route.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-teal-600" />
                        {getRouteDisplayName(route)}
                      </CardTitle>
                      {route.description && (
                        <p className="text-sm text-gray-600">{route.description}</p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {route.km && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{parseFloat(route.km).toFixed(0)} km</span>
                          {route.estimatedDuration && (
                            <>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{route.estimatedDuration}</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {(route.sedanPrice || route.minivanPrice || route.vanPrice) && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Pricing Options
                          </h4>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {route.sedanPrice && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">Sedan</div>
                                <div className="text-teal-600">${route.sedanPrice}</div>
                              </div>
                            )}
                            {route.minivanPrice && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">Minivan</div>
                                <div className="text-teal-600">${route.minivanPrice}</div>
                              </div>
                            )}
                            {route.vanPrice && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium">Van</div>
                                <div className="text-teal-600">${route.vanPrice}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          // Navigate to pricing tool with this route pre-selected
                          window.location.href = `/#quote-builder`;
                        }}
                      >
                        Book This Route
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Attractions Section */}
        {cityAttractions.length > 0 && (
          <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Popular Attractions in {currentCity.name}
                </h2>
                <p className="text-lg text-gray-600">
                  Discover the must-see destinations during your visit
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityAttractions.map((attraction) => (
                  <Card key={attraction.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{attraction.name}</h3>
                      {attraction.description && (
                        <p className="text-gray-600 text-sm">{attraction.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-teal-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Explore {currentCity.name}?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Get a personalized quote for your transportation needs and start planning your Egyptian adventure today
            </p>
            <Button 
              size="lg" 
              className="bg-white text-teal-600 hover:bg-gray-100"
              onClick={() => {
                window.location.href = `/#quote-builder`;
              }}
            >
              Get Your Quote Now
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}