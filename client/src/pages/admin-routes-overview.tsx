import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Search,
  MapPin,
  ArrowRight,
  Car,
  Route
} from "lucide-react";
import { Link } from "wouter";
import RouteEditModal from "@/components/route-edit-modal";

export default function AdminRoutesOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch routes from API
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['/api/routes'],
    retry: false,
  });

  // Fetch cities for displaying names
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities'],
    retry: false,
  });

  const getCityName = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  const getCitySlug = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.slug : `city-${cityId}`;
  };

  // Group routes by cities (both from and to)
  const getRoutesForCity = (cityId: number) => {
    return (routes as any[]).filter((route: any) => 
      route.fromCityId === cityId || route.toCityId === cityId
    );
  };

  // Get inter-city routes for a city
  const getInterCityRoutes = (cityId: number) => {
    return (routes as any[]).filter((route: any) => 
      (route.fromCityId === cityId || route.toCityId === cityId) && 
      route.fromCityId !== route.toCityId
    );
  };

  // Get city tours for a city
  const getCityTours = (cityId: number) => {
    return (routes as any[]).filter((route: any) => 
      route.fromCityId === cityId && route.fromCityId === route.toCityId
    );
  };

  // Filter cities based on search
  const filteredCities = (cities as any[]).filter((city: any) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (routesLoading || citiesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes Management</h1>
          <p className="text-gray-500 mt-2">Manage routes organized by city for better efficiency</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Dashboard
            </Button>
          </Link>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Route
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cities</p>
                <p className="text-2xl font-bold">{cities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Inter-City Routes</p>
                <p className="text-2xl font-bold">
                  {(routes as any[]).filter((r: any) => r.fromCityId !== r.toCityId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">City Tours</p>
                <p className="text-2xl font-bold">
                  {(routes as any[]).filter((r: any) => r.fromCityId === r.toCityId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCities.map((city: any) => {
          const cityRoutes = getRoutesForCity(city.id);
          const interCityRoutes = getInterCityRoutes(city.id);
          const cityTours = getCityTours(city.id);

          return (
            <Card key={city.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-xl">{city.name}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {cityRoutes.length} routes
                  </Badge>
                </div>
                {city.description && (
                  <p className="text-sm text-gray-600 mt-1">{city.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Inter-City Routes */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Inter-City Routes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {interCityRoutes.length}
                      </Badge>
                      <Link href={`/admin/routes/city/${city.slug}/inter-city`}>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* City Tours */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium">City Tours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {cityTours.length}
                      </Badge>
                      <Link href={`/admin/routes/city/${city.slug}/city-tours`}>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Manage All Routes for City */}
                  <Link href={`/admin/routes/city/${city.slug}`}>
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      Manage All Routes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cities found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Add Route Modal */}
      <RouteEditModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}