import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Car, Plane, Ship, ChevronDown, X, Check } from "lucide-react";

import { RouteData } from "../../../shared/types";

interface TransportationSearchProps {
  routes: RouteData[];
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
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  // Filter routes for the current city - only show routes that START from this city
  const cityRoutes = useMemo(() => {
    const filteredRoutes = routes.filter(route => 
      route.fromCityId === cityId || 
      (route.fromCityId === route.toCityId && route.fromCityId === cityId) // Include intra-city routes
    );
    

    
    return filteredRoutes;
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
    
    // Optional: Auto-close on mobile after selection (you can remove this if not desired)
    // if (window.innerWidth < 768 && updated.length > selectedRoutes.length) {
    //   setTimeout(() => setIsOpen(false), 500);
    // }
  };

  const getRouteIcon = (tripType: string) => {
    if (!tripType) return <Car className="h-4 w-4" />;
    switch (tripType.toLowerCase()) {
      case 'transfer':
        return <Car className="h-4 w-4" />;
      case 'day_trip':
        return <MapPin className="h-4 w-4" />;
      case 'overnight':
        return <Ship className="h-4 w-4" />;
      case 'multi_day':
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
      case 'day_trip':
        return 'bg-green-100 text-green-800';
      case 'overnight':
        return 'bg-purple-100 text-purple-800';
      case 'multi_day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTripTypeLabel = (tripType: string) => {
    const labels: Record<string, string> = {
      'transfer': t('transportation.transferDropOff'),
      'day_trip': t('transportation.dayTrip'),
      'overnight': t('transportation.overnight'),
      'multi_day': t('transportation.multiDay')
    };
    return labels[tripType] || tripType;
  };

  const getDisplayText = () => {
    if (selectedRoutes.length === 0) return t('transportation.selectTransportation');
    if (selectedRoutes.length === 1) {
      const route = cityRoutes.find(r => r.id === selectedRoutes[0]);
      return route?.name || t('transportation.routeSelected');
    }
    return t('transportation.routesSelected', { count: selectedRoutes.length });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="flex items-center gap-2">
              {selectedRoutes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {selectedRoutes.length} selected
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('transportation.searchRoutes')}
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
                    <SelectItem key={tripType || 'unknown'} value={tripType || 'unknown'}>
                      <div className="flex items-center gap-2">
                        {getRouteIcon(tripType || 'unknown')}
                        <span>{getTripTypeLabel(tripType || 'unknown')}</span>
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
                      {getRouteIcon(route.tripType || 'unknown')}
                      <h5 className="font-medium text-sm truncate">
                        {route.name || 'Unnamed Route'}
                      </h5>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getTypeColor(route.tripType || 'unknown')}`}
                      >
                        {getTripTypeLabel(route.tripType || 'unknown')}
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
          <div className="flex flex-col gap-2 pt-2 border-t">
            {filteredRoutes.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allRouteIds = filteredRoutes.map(r => r.id);
                    const combined = [...selectedRoutes, ...allRouteIds];
                    onRoutesChange(Array.from(new Set(combined)));
                  }}
                  className="flex-1"
                >
                  {t('common.selectAllVisible')}
                </Button>
                {selectedRoutes.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRoutesChange([])}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            )}
            
            {/* Done Button */}
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full"
              size="sm"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
              {selectedRoutes.length > 0 && ` (${selectedRoutes.length} selected)`}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}