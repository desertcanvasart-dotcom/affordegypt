import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, MapPin, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Route {
  id: number;
  fromCityId: number;
  toCityId: number;
  name?: string;
  displayOrder?: number;
}

interface City {
  id: number;
  name: string;
  slug: string;
}

export default function RoutesNavigation() {
  const [location] = useLocation();
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());

  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Group routes by route type and organize cities
  const routeCategories = useMemo(() => {
    if (!routes || !cities) return [];

    const routeGroups = new Map<string, { cities: Set<number>, routes: Route[] }>();

    routes.forEach((route: Route) => {
      const isInterCity = route.fromCityId !== route.toCityId;
      const categoryKey = isInterCity ? 'Inter-City Routes' : 'City Tours';
      
      if (!routeGroups.has(categoryKey)) {
        routeGroups.set(categoryKey, { cities: new Set(), routes: [] });
      }
      
      const group = routeGroups.get(categoryKey)!;
      group.cities.add(route.fromCityId);
      if (isInterCity) {
        group.cities.add(route.toCityId);
      }
      group.routes.push(route);
    });

    return Array.from(routeGroups.entries()).map(([categoryName, group]) => ({
      name: categoryName,
      cities: Array.from(group.cities)
        .map(cityId => cities.find((c: City) => c.id === cityId))
        .filter(Boolean)
        .sort((a: City, b: City) => a.name.localeCompare(b.name)),
      routes: group.routes.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    }));
  }, [routes, cities]);

  const toggleRouteExpansion = (routeName: string) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeName)) {
      newExpanded.delete(routeName);
    } else {
      newExpanded.add(routeName);
    }
    setExpandedRoutes(newExpanded);
  };

  return (
    <div className="space-y-4">
      {routeCategories.map((category) => (
        <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
          <Collapsible
            open={expandedRoutes.has(category.name)}
            onOpenChange={() => toggleRouteExpansion(category.name)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold text-lg">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    ({category.cities.length} cities)
                  </span>
                </div>
                {expandedRoutes.has(category.name) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.cities.map((city: City) => (
                  <Link
                    key={city.id}
                    href={`/routes/${category.name.toLowerCase().replace(/\s+/g, '-')}/${city.slug}`}
                    className={`flex items-center gap-2 p-3 rounded-md border transition-colors hover:bg-teal-50 hover:border-teal-200 ${
                      location === `/routes/${category.name.toLowerCase().replace(/\s+/g, '-')}/${city.slug}`
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'border-gray-200 hover:text-teal-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{city.name}</span>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  );
}