import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { refreshRouteData } from "@/lib/cacheUtils";
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
  ArrowRight,
  Calculator
} from "lucide-react";
import AddItemModal from "@/components/add-item-modal";
import { useToast } from "@/hooks/use-toast";

export default function RoutesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'route'>('route');
  const { toast } = useToast();

  // Fetch routes from API
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['/api/routes'],
    retry: false,
  });

  // Fetch cities for displaying names
  const { data: cities = [] } = useQuery({
    queryKey: ['/api/cities'],
    retry: false,
  });

  const getCityName = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: () => {
      // Use enhanced cache invalidation for language-aware queries
      refreshRouteData();
      toast({
        title: "Success!",
        description: "Route deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete route.",
        variant: "destructive",
      });
    },
  });

  const handleAddRoute = () => {
    setModalType('route');
    setShowAddModal(true);
  };

  const handleEdit = (id: number, route: any) => {
    toast({
      title: "Edit Route",
      description: `Editing route ${getCityName(route.fromCityId)} → ${getCityName(route.toCityId)}`,
    });
  };

  const handleDelete = (id: number, route: any) => {
    const routeName = `${getCityName(route.fromCityId)} → ${getCityName(route.toCityId)}`;
    if (confirm(`Are you sure you want to delete route ${routeName}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Routes & Pricing Management</h1>
            <p className="text-gray-600 mt-2">Manage inter-city routes and vehicle pricing</p>
          </div>
          <Button 
            onClick={handleAddRoute}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Route
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search routes..." className="pl-10 w-80" />
                </div>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Filter by City
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {(routes as any[]).length} routes configured
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Route Pricing Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-center">Distance</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">🚗 Sedan</TableHead>
                  <TableHead className="text-center">🚐 Minivan</TableHead>
                  <TableHead className="text-center">🚌 Van</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(routes as any[]).map((route: any) => (
                  <TableRow key={route.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{getCityName(route.fromCityId)}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{getCityName(route.toCityId)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {route.distance || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {route.duration || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.sedanPrice || route.basePrice || 0}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.minivanPrice || (route.basePrice ? Math.round(route.basePrice * 1.4) : 0)}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.vanPrice || (route.basePrice ? Math.round(route.basePrice * 1.8) : 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={route.isActive ? 'default' : 'secondary'}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0" 
                          title="Edit Route"
                          onClick={() => handleEdit(route.id, route)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700" 
                          title="Delete Route"
                          onClick={() => handleDelete(route.id, route)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold">{(routes as any[]).length}</p>
                </div>
                <MapPin className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Price Range</p>
                  <p className="text-2xl font-bold">Database Connected</p>
                </div>
                <Calculator className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold">{(routes as any[]).filter((r: any) => r.isActive).length}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Live</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Route Modal */}
      <AddItemModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        modalType={modalType}
      />
    </div>
  );
}