import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Car, Plane, Ship, ChevronDown, X } from "lucide-react";

interface Route {
  id: number;
  name: string;
  tripType: string;
  fromCityId: number;
  toCityId: number;
  fromLocation?: string;
  toLocation?: string;
}

interface TransportationSearchProps {
  routes: Route[];
  selectedRoutes: number[];
  onRoutesChange: (routes: number[]) => void;
  cityId: number;
  cityName: string;
}

export default function TransportationSearch({
  routes,
  selectedRoutes,
  onRoutesChange,
  cityId,
  cityName,
}: TransportationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Filter routes for the current city - only show routes that START from this city
  const cityRoutes = useMemo(() => {
    return routes.filter(route => 
      route.fromCityId === cityId || 
      (route.fromCityId === route.toCityId && route.fromCityId === cityId) // Include intra-city routes
    );
  }, [routes, cityId]);

  // Get unique trip types
  const tripTypes = useMemo(() => {
    const types = Array.from(new Set(cityRoutes.map(r => r.tripType).filter(Boolean)));
    return types;
  }, [cityRoutes]);

  // Apply filters
  const filteredRoutes = useMemo(() => {
    return cityRoutes.filter(route => {
      const matchesSearch = !searchTerm || 
        route.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.toLocation?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === "all" || route.tripType === selectedType;
      
      return matchesSearch && matchesType;
    });
  }, [cityRoutes, searchTerm, selectedType]);

  const toggleRoute = (routeId: number) => {
    const updated = selectedRoutes.includes(routeId)
      ? selectedRoutes.filter(id => id !== routeId)
      : [...selectedRoutes, routeId];
    onRoutesChange(updated);
  };

  const getRouteIcon = (tripType: string) => {
    if (!tripType) return <Car className="h-4 w-4" />;
    switch (tripType.toLowerCase()) {
      case 'transfer':
        return <Car className="h-4 w-4" />;
      case 'day-trip':
        return <MapPin className="h-4 w-4" />;
      case 'overnight':
        return <Ship className="h-4 w-4" />;
      case 'multi-day':
        return <Plane className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getTypeColor = (tripType: string) => {
    if (!tripType) return 'bg-gray-100 text-gray-800';
    switch (tripType.toLowerCase()) {
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      case 'day-trip':
        return 'bg-green-100 text-green-800';
      case 'overnight':
        return 'bg-purple-100 text-purple-800';
      case 'multi-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTripTypeLabel = (tripType: string) => {
    const labels: Record<string, string> = {
      'transfer': 'Transfer & Drop off',
      'day-trip': 'Day Trip',
      'overnight': 'Overnight Stay',
      'multi-day': 'Multi-Day Tour'
    };
    return labels[tripType] || tripType;
  };

  const getDisplayText = () => {
    if (selectedRoutes.length === 0) return "Select transportation...";
    if (selectedRoutes.length === 1) {
      const route = cityRoutes.find(r => r.id === selectedRoutes[0]);
      return route?.name || "1 route selected";
    }
    return `${selectedRoutes.length} routes selected`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{cityName} Transportation</h4>
            {selectedRoutes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedRoutes.length} selected
              </Badge>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          {/* Trip Type Filter */}
          {tripTypes.length > 1 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">Trip Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {tripTypes.map(tripType => (
                    <SelectItem key={tripType} value={tripType}>
                      <div className="flex items-center gap-2">
                        {getRouteIcon(tripType)}
                        <span>{getTripTypeLabel(tripType)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          {/* Routes List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-4">
                <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No routes found</p>
                {searchTerm && (
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            ) : (
              filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                    selectedRoutes.includes(route.id) 
                      ? 'border-teal-200 bg-teal-50' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleRoute(route.id)}
                >
                  <Checkbox
                    checked={selectedRoutes.includes(route.id)}
                    onChange={() => toggleRoute(route.id)}
                    className="mt-0.5"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getRouteIcon(route.type)}
                      <h5 className="font-medium text-sm truncate">
                        {route.name}
                      </h5>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTypeColor(route.type)}`}
                      >
                        {route.type?.replace('-', ' ') || 'General'}
                      </Badge>
                    </div>

                    {(route.fromLocation || route.toLocation) && (
                      <div className="text-xs text-gray-600">
                        {route.fromLocation && route.toLocation 
                          ? `${route.fromLocation} → ${route.toLocation}`
                          : route.fromLocation || route.toLocation
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Selection Actions */}
          {filteredRoutes.length > 0 && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allRouteIds = filteredRoutes.map(r => r.id);
                  const combined = [...selectedRoutes, ...allRouteIds];
                  onRoutesChange(Array.from(new Set(combined)));
                }}
              >
                Select All Visible
              </Button>
              {selectedRoutes.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRoutesChange([])}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}