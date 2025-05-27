import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

  // Mock route data - replace with actual API calls
  const routes = [
    {
      id: 1,
      fromCity: "Cairo",
      toCity: "Alexandria", 
      distance: "220km",
      duration: "3h",
      sedanPrice: 45,
      minivanPrice: 65,
      vanPrice: 85,
      isActive: true
    },
    {
      id: 2,
      fromCity: "Cairo",
      toCity: "Luxor",
      distance: "670km", 
      duration: "8h",
      sedanPrice: 120,
      minivanPrice: 160,
      vanPrice: 200,
      isActive: true
    },
    {
      id: 3,
      fromCity: "Alexandria",
      toCity: "Aswan",
      distance: "890km",
      duration: "10h", 
      sedanPrice: 150,
      minivanPrice: 190,
      vanPrice: 240,
      isActive: true
    },
    {
      id: 4,
      fromCity: "Luxor",
      toCity: "Aswan",
      distance: "215km",
      duration: "3h",
      sedanPrice: 50,
      minivanPrice: 70,
      vanPrice: 90,
      isActive: true
    }
  ];

  const handleAddRoute = () => {
    setModalType('route');
    setShowAddModal(true);
  };

  const handleEdit = (id: number, route: any) => {
    toast({
      title: "Edit Route",
      description: `Editing route ${route.fromCity} → ${route.toCity}`,
    });
  };

  const handleDelete = (id: number, routeName: string) => {
    if (confirm(`Are you sure you want to delete route ${routeName}?`)) {
      toast({
        title: "Route Deleted",
        description: `${routeName} has been removed successfully.`,
      });
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
                {routes.length} routes configured
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
                {routes.map((route) => (
                  <TableRow key={route.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{route.fromCity}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{route.toCity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {route.distance}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {route.duration}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.sedanPrice}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.minivanPrice}
                    </TableCell>
                    <TableCell className="text-center font-mono font-semibold">
                      ${route.vanPrice}
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
                          onClick={() => handleDelete(route.id, `${route.fromCity} → ${route.toCity}`)}
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
                  <p className="text-2xl font-bold">{routes.length}</p>
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
                  <p className="text-2xl font-bold">$45-$240</p>
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
                  <p className="text-2xl font-bold">{routes.filter(r => r.isActive).length}</p>
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