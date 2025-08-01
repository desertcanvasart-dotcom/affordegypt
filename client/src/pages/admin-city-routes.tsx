import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus,
  Edit2,
  Trash2,
  Search,
  MapPin,
  ArrowLeft,
  Car,
  Clock,
  DollarSign
} from "lucide-react";
import RouteEditModal from "@/components/route-edit-modal";
import { useToast } from "@/hooks/use-toast";
import { refreshRouteData } from "@/lib/cacheUtils";

export default function AdminCityRoutes() {
  const [match, params] = useRoute("/admin/routes/city/:citySlug/:category?");
  const citySlug = params?.citySlug;
  const category = params?.category; // 'inter-city', 'city-tours', or undefined for all
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch routes from API with no cache to prevent stale data issues
  const { data: routes = [], isLoading: routesLoading } = useQuery({
    queryKey: ['/api/routes'],
    retry: false,
    staleTime: 0, // Always treat data as stale
    gcTime: 0, // Don't cache the data (TanStack Query v5 renamed cacheTime to gcTime)
  });

  // Fetch cities for displaying names
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ['/api/cities'],
    retry: false,
  });

  // Find the current city
  const currentCity = (cities as any[]).find((city: any) => city.slug === citySlug);

  const getCityName = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  // Filter routes for the current city - FIXED: Prevent automatic bidirectional route display
  const getCityRoutes = () => {
    if (!currentCity) return [];
    
    console.log('Current city:', currentCity);
    console.log('All routes:', routes);
    console.log('Filtering routes for currentCity.id:', currentCity.id);
    
    // CRITICAL FIX: Only show routes that truly BELONG to this city section
    // For inter-city: show routes departing FROM this city only
    // For intra-city: show routes within this city only
    let filteredRoutes = (routes as any[]).filter((route: any) => {
      if (route.routeCategory === 'intra_city') {
        // For intra-city routes, show if cityId matches current city
        return route.cityId === currentCity.id;
      } else {
        // For inter-city routes, ONLY show routes departing from current city
        // This prevents "Cairo → Alexandria" from appearing in Alexandria section
        return route.fromCityId === currentCity.id;
      }
    });

    console.log(`Filtered ${filteredRoutes.length} routes for city ${currentCity.name}`);

    // Apply category filter
    if (category === 'inter-city') {
      filteredRoutes = filteredRoutes.filter((route: any) => 
        route.routeCategory === 'inter_city'
      );
    } else if (category === 'city-tours') {
      filteredRoutes = filteredRoutes.filter((route: any) => 
        route.routeCategory === 'intra_city'
      );
    }

    // Apply search filter
    if (searchTerm) {
      filteredRoutes = filteredRoutes.filter((route: any) => {
        const fromCity = getCityName(route.fromCityId).toLowerCase();
        const toCity = getCityName(route.toCityId).toLowerCase();
        const routeName = (route.name || '').toLowerCase();
        const description = (route.description || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fromCity.includes(search) || 
               toCity.includes(search) || 
               routeName.includes(search) || 
               description.includes(search);
      });
    }

    return filteredRoutes;
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Use comprehensive cache invalidation and force refresh
      refreshRouteData();
      
      // Force invalidate the specific query used in this component
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      
      toast({
        title: "Route deleted successfully",
        description: "The route has been removed from the system.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting route",
        description: "Failed to delete the route. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this route?")) {
      deleteMutation.mutate(id);
    }
  };

  const cityRoutes = getCityRoutes();

  if (routesLoading || citiesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentCity) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
            <p className="text-gray-600 mb-6">The requested city could not be found.</p>
            <Link href="/admin/routes">
              <Button>Back to Routes Overview</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryTitle = () => {
    if (category === 'inter-city') return 'Inter-City Routes';
    if (category === 'city-tours') return 'City Tours';
    return 'All Routes';
  };

  const getCategoryDescription = () => {
    if (category === 'inter-city') return 'Routes connecting this city to other destinations';
    if (category === 'city-tours') return 'Tours and transportation within this city';
    return 'All transportation routes for this city';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/routes">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentCity.name}</h1>
            <p className="text-gray-500">{getCategoryTitle()} • {getCategoryDescription()}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Category Navigation */}
          <div className="flex gap-2">
            <Link href={`/admin/routes/city/${citySlug}`}>
              <Button variant={!category ? "default" : "outline"} size="sm">
                All Routes
              </Button>
            </Link>
            <Link href={`/admin/routes/city/${citySlug}/inter-city`}>
              <Button variant={category === 'inter-city' ? "default" : "outline"} size="sm">
                Inter-City
              </Button>
            </Link>
            <Link href={`/admin/routes/city/${citySlug}/city-tours`}>
              <Button variant={category === 'city-tours' ? "default" : "outline"} size="sm">
                City Tours
              </Button>
            </Link>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Route
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-2xl font-bold">{cityRoutes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Inter-City</p>
                <p className="text-2xl font-bold">
                  {cityRoutes.filter((r: any) => r.fromCityId !== r.toCityId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">City Tours</p>
                <p className="text-2xl font-bold">
                  {cityRoutes.filter((r: any) => r.fromCityId === r.toCityId).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold">
                  {cityRoutes.length > 0 ? 
                    Math.round(cityRoutes.reduce((sum: number, r: any) => {
                      const sedanPrice = r.basePriceByVehicle?.['1']?.['1'] || r.sedanPrice || '0';
                      return sum + parseFloat(sedanPrice);
                    }, 0) / cityRoutes.length) 
                    : 0} EGP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {getCategoryTitle()} for {currentCity.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cityRoutes.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : `No ${getCategoryTitle().toLowerCase()} configured for this city`}
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                Add First Route
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityRoutes.map((route: any) => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {getCityName(route.fromCityId)} → {getCityName(route.toCityId)}
                        </div>
                        {route.name && (
                          <div className="text-sm text-gray-500">{route.name}</div>
                        )}
                        {route.description && (
                          <div className="text-xs text-gray-400 mt-1">{route.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={route.fromCityId === route.toCityId ? "secondary" : "default"}>
                        {route.fromCityId === route.toCityId ? "City Tour" : "Inter-City"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {route.km ? `${route.km} km` : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm">{route.estimatedDuration || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {(() => {
                          // Extract prices from basePriceByVehicle structure
                          // Parse vehiclePrices if it's a string (from database JSON)
                          let vehiclePrices = route.vehiclePrices;
                          if (typeof vehiclePrices === 'string') {
                            try {
                              vehiclePrices = JSON.parse(vehiclePrices);
                            } catch (e) {
                              vehiclePrices = {};
                            }
                          }
                          
                          // Try new vehiclePrices format first
                          let sedanPrice, minivanPrice, vanPrice;
                          if (vehiclePrices && typeof vehiclePrices === 'object') {
                            sedanPrice = vehiclePrices.sedan;
                            minivanPrice = vehiclePrices.minivan;
                            vanPrice = vehiclePrices.van;
                          }
                          
                          // Fallback to legacy format
                          if (!sedanPrice && !minivanPrice && !vanPrice) {
                            sedanPrice = route.basePriceByVehicle?.['1']?.['1'] || route.sedanPrice;
                            minivanPrice = route.basePriceByVehicle?.['2']?.['1'] || route.minivanPrice;
                            vanPrice = route.basePriceByVehicle?.['3']?.['1'] || route.vanPrice;
                          }
                          
                          return (
                            <>
                              {sedanPrice && <div>Sedan: {sedanPrice} EGP</div>}
                              {minivanPrice && <div>Minivan: {minivanPrice} EGP</div>}
                              {vanPrice && <div>Van: {vanPrice} EGP</div>}
                              {!sedanPrice && !minivanPrice && !vanPrice && (
                                <div className="text-gray-400 text-xs">No pricing set</div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {route.displayOrder || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingRoute(route)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(route.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Route Modal */}
      <RouteEditModal
        isOpen={showAddModal || !!editingRoute}
        onClose={() => {
          setShowAddModal(false);
          setEditingRoute(null);
        }}
        route={editingRoute}
        defaultFromCityId={currentCity?.id}
        defaultToCityId={currentCity?.id}
      />
    </div>
  );
}