import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Car, 
  UserCheck, 
  Plus,
  Edit2,
  Save,
  X,
  LogOut,
  Download,
  Search,
  Filter,
  Trash2,
  User,
  Bus,
  Truck,
  Route,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import AddItemModal from "@/components/add-item-modal";
import AdminLogin from "@/components/admin-login";
import { useToast } from "@/hooks/use-toast";
import { refreshRouteData } from "@/lib/cacheUtils";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'vehicle' | 'guide' | 'addon' | 'city' | 'route'>('addon');
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  const { toast } = useToast();

  // Check for existing auth token
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem("admin-token", token);
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  // Fetch data
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    enabled: isAuthenticated,
  });

  const { data: addOns = [] } = useQuery({
    queryKey: ["/api/add-ons"],
    enabled: isAuthenticated,
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
    enabled: isAuthenticated,
  });

  // Helper functions for routes organization
  const getCityName = (cityId: number) => {
    const city = (cities as any[]).find((c: any) => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  const getRoutesForCity = (cityId: number) => {
    return (routes as any[]).filter((route: any) => 
      route.fromCityId === cityId || route.toCityId === cityId
    );
  };

  const getRoutesByType = (cityId: number) => {
    const cityRoutes = getRoutesForCity(cityId);
    return {
      intracity: cityRoutes.filter((route: any) => route.fromCityId === route.toCityId),
      intercity: cityRoutes.filter((route: any) => route.fromCityId !== route.toCityId)
    };
  };

  const handleEdit = (id: number, data: any) => {
    setEditingRow(id);
    setEditData(data);
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleAddService = useCallback((type: 'vehicle' | 'guide' | 'addon' | 'city' | 'route') => {
    setModalType(type);
    setShowAddModal(true);
  }, []);

  const handleDelete = async (id: number, type: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const endpoint = type === 'addon' ? 'addons' : `${type}s`;
        const response = await fetch(`/api/${endpoint}/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete');
        
        toast({
          title: "Deleted Successfully",
          description: `${type} has been removed from the system`,
        });
        
        // Refresh the data
        window.location.reload();
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to delete ${type}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async (id: number, type: string) => {
    try {
      const endpoint = type === 'addon' ? 'addons' : `${type}s`;
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      toast({
        title: "Saved Successfully", 
        description: "Changes have been saved to the database",
      });
      setEditingRow(null);
      setEditData({});
      
      // Use enhanced cache invalidation for routes
      if (type === 'route') {
        refreshRouteData();
      } else {
        // For other types, still use reload for now 
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50" key={Date.now()}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Egypt Travel Admin</h1>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
              Administrator
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline" className="flex items-center space-x-2">
              <Link href="/routes">
                <Route className="w-4 h-4" />
                <span>Routes & Pricing</span>
              </Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 flex items-center space-x-2">
              <Link href="/admin/attractions">
                <MapPin className="w-4 h-4" />
                <span>Attractions</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white border shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>📊 Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>📍 Cities</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <Car className="w-4 h-4" />
              <span>🚐 Vehicles</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <Route className="w-4 h-4" />
              <span>🛣️ Routes</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <UserCheck className="w-4 h-4" />
              <span>🧑‍✈️ Guides</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4" />
              <span>➕ Add-ons</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2 hover:bg-gray-50 transition-colors">
              <Users className="w-4 h-4" />
              <span>📚 Bookings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Basket</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,247</div>
                  <p className="text-xs text-muted-foreground">+15.3% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Array.isArray(cities) ? cities.length : 0}</div>
                  <p className="text-xs text-muted-foreground">Destinations available</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8.2%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manage Cities</h2>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleAddService('city')}>
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(cities) && cities.map((city: any) => (
                      <TableRow key={city.id}>
                        <TableCell>{city.name}</TableCell>
                        <TableCell>{city.slug}</TableCell>
                        <TableCell>{city.description || 'No description'}</TableCell>
                        <TableCell>
                          <Badge variant={city.isActive ? 'default' : 'secondary'}>
                            {city.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit City" onClick={() => handleEdit(city.id, city)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete City" onClick={() => handleDelete(city.id, 'city')}>
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
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Vehicle Types & Route Pricing</h2>
                <p className="text-sm text-gray-600 mt-1">Manage vehicle fleet, capacities, and route pricing</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search vehicles..." className="pl-10 w-64" />
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleAddService('vehicle')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle Type
                </Button>
                <Button variant="outline" onClick={() => handleAddService('route')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Route Price
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle Type</TableHead>
                      <TableHead className="text-center">👤 Passenger Range</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🚗</div>
                          <div>
                            <div className="font-medium">Sedan</div>
                            <Badge variant="outline" className="text-xs">Compact</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">1–2</TableCell>
                      <TableCell className="text-gray-600">Comfortable car for small groups</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle" onClick={() => handleEdit(1, {name: 'Sedan', min: 1, max: 2})}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle" onClick={() => handleDelete(1, 'vehicle')}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🚐</div>
                          <div>
                            <div className="font-medium">Minivan</div>
                            <Badge variant="outline" className="text-xs">Medium</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">3–8</TableCell>
                      <TableCell className="text-gray-600">Spacious vehicle for medium groups</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle" onClick={() => handleEdit(2, {name: 'Minivan', min: 3, max: 8})}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle" onClick={() => handleDelete(2, 'vehicle')}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🚌</div>
                          <div>
                            <div className="font-medium">Van</div>
                            <Badge variant="outline" className="text-xs">Large</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">9–15</TableCell>
                      <TableCell className="text-gray-600">Large vehicle for big groups</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle" onClick={() => handleEdit(3, {name: 'Van', min: 9, max: 15})}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle" onClick={() => handleDelete(3, 'vehicle')}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Route Pricing Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Inter-City Route Pricing</h3>
                  <p className="text-sm text-gray-600">Manage pricing for routes between cities</p>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead className="text-center">🚗 Sedan</TableHead>
                        <TableHead className="text-center">🚐 Minivan</TableHead>
                        <TableHead className="text-center">🚌 Van</TableHead>
                        <TableHead className="text-right w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Cairo → Alexandria</span>
                            <Badge variant="outline" className="text-xs">220km</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">$45</TableCell>
                        <TableCell className="text-center font-mono">$65</TableCell>
                        <TableCell className="text-center font-mono">$85</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Route Pricing" onClick={() => handleEdit(1, {route: 'Cairo-Alexandria', prices: {sedan: 45, minivan: 65, van: 85}})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Route" onClick={() => handleDelete(1, 'route')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Cairo → Luxor</span>
                            <Badge variant="outline" className="text-xs">670km</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">$120</TableCell>
                        <TableCell className="text-center font-mono">$160</TableCell>
                        <TableCell className="text-center font-mono">$200</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Route Pricing" onClick={() => handleEdit(2, {route: 'Cairo-Luxor', prices: {sedan: 120, minivan: 160, van: 200}})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Route" onClick={() => handleDelete(2, 'route')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Alexandria → Aswan</span>
                            <Badge variant="outline" className="text-xs">890km</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">$150</TableCell>
                        <TableCell className="text-center font-mono">$190</TableCell>
                        <TableCell className="text-center font-mono">$240</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Route Pricing" onClick={() => handleEdit(3, {route: 'Alexandria-Aswan', prices: {sedan: 150, minivan: 190, van: 240}})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Route" onClick={() => handleDelete(3, 'route')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">Luxor → Aswan</span>
                            <Badge variant="outline" className="text-xs">215km</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono">$50</TableCell>
                        <TableCell className="text-center font-mono">$70</TableCell>
                        <TableCell className="text-center font-mono">$90</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Route Pricing" onClick={() => handleEdit(4, {route: 'Luxor-Aswan', prices: {sedan: 50, minivan: 70, van: 90}})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Route" onClick={() => handleDelete(4, 'route')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Route Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage transportation routes organized by city</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search routes..." className="pl-10 w-64" />
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleAddService('route')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Route
                </Button>
              </div>
            </div>

            {/* City Selection */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Filter by City:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCity === null ? "default" : "outline"}
                  onClick={() => setSelectedCity(null)}
                  className={selectedCity === null ? "bg-teal-600 hover:bg-teal-700" : ""}
                >
                  All Cities
                </Button>
                {Array.isArray(cities) && cities.map((city: any) => (
                  <Button
                    key={city.id}
                    size="sm"
                    variant={selectedCity === city.id ? "default" : "outline"}
                    onClick={() => setSelectedCity(city.id)}
                    className={selectedCity === city.id ? "bg-teal-600 hover:bg-teal-700" : ""}
                  >
                    {city.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Routes by City */}
            <div className="space-y-6">
              {Array.isArray(cities) && cities
                .filter((city: any) => selectedCity === null || city.id === selectedCity)
                .map((city: any) => {
                  const cityRoutes = getRoutesByType(city.id);
                  const totalRoutes = cityRoutes.intracity.length + cityRoutes.intercity.length;
                  
                  if (totalRoutes === 0) return null;

                  return (
                    <Card key={city.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              📍 {city.name}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {totalRoutes} route{totalRoutes !== 1 ? 's' : ''} available
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setModalType('route');
                              setShowAddModal(true);
                              // Pre-select city in modal
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Route
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Route Type</TableHead>
                              <TableHead>Route Details</TableHead>
                              <TableHead className="text-center">Distance</TableHead>
                              <TableHead className="text-center">🚗 Sedan</TableHead>
                              <TableHead className="text-center">🚐 Minivan</TableHead>
                              <TableHead className="text-center">🚌 Van</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-right w-32">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {/* Intra-city routes */}
                            {cityRoutes.intracity.map((route: any) => (
                              <TableRow key={route.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    🏙️ Intra-city
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {route.name || `${route.fromLocation || 'Location A'} → ${route.toLocation || 'Location B'}`}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Within {city.name}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {route.km ? `${route.km}km` : 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.sedanPrice ? `${route.sedanPrice} EGP` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.minivanPrice ? `${route.minivanPrice} EGP` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.vanPrice ? `${route.vanPrice} EGP` : 'N/A'}
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
                                      onClick={() => handleDelete(route.id, 'route')}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            
                            {/* Inter-city routes */}
                            {cityRoutes.intercity.map((route: any) => (
                              <TableRow key={route.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    🌍 Inter-city
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{getCityName(route.fromCityId)}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium">{getCityName(route.toCityId)}</span>
                                  </div>
                                  {route.name && (
                                    <div className="text-sm text-gray-500 mt-1">{route.name}</div>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {route.km ? `${route.km}km` : 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.sedanPrice ? `${route.sedanPrice} EGP` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.minivanPrice ? `${route.minivanPrice} EGP` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-center font-mono">
                                  {route.vanPrice ? `${route.vanPrice} EGP` : 'N/A'}
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
                                      onClick={() => handleDelete(route.id, 'route')}
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
                  );
                })}
              
              {/* No routes message */}
              {selectedCity !== null && Array.isArray(cities) && cities
                .filter((city: any) => city.id === selectedCity)
                .every((city: any) => getRoutesForCity(city.id).length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-500">
                      <Route className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No routes found</h3>
                      <p className="text-sm mb-4">
                        {selectedCity ? `No routes available for ${getCityName(selectedCity)}` : 'No routes configured yet'}
                      </p>
                      <Button
                        onClick={() => {
                          setModalType('route');
                          setShowAddModal(true);
                        }}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Route
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Tour Guide Rates</h2>
                <p className="text-sm text-gray-600 mt-1">Manage guide pricing by language and city</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search guides..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by City
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleAddService('guide')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guide Rate
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Cairo Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">📍 Cairo</Badge>
                    <span className="text-sm text-gray-600">3 languages available</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Language</TableHead>
                        <TableHead>Guide Status</TableHead>
                        <TableHead className="text-right">Hourly Rate</TableHead>
                        <TableHead className="text-right">Daily Rate</TableHead>
                        <TableHead className="text-right w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>🇺🇸</span>
                            <span className="font-medium">English</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">Available</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">$25</TableCell>
                        <TableCell className="text-right font-mono">$180</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Rate" onClick={() => handleEdit(1, {language: 'English', rate: 25})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Rate" onClick={() => handleDelete(1, 'guide rate')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>🇪🇸</span>
                            <span className="font-medium">Spanish</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">Available</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">$30</TableCell>
                        <TableCell className="text-right font-mono">$220</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Rate" onClick={() => handleEdit(2, {language: 'Spanish', rate: 30})}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Rate" onClick={() => handleDelete(2, 'guide rate')}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>🇫🇷</span>
                            <span className="font-medium">French</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-red-700">Booked</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">$28</TableCell>
                        <TableCell className="text-right font-mono">$200</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Rate">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Rate">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Luxor Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">📍 Luxor</Badge>
                    <span className="text-sm text-gray-600">2 languages available</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Language</TableHead>
                        <TableHead>Guide Status</TableHead>
                        <TableHead className="text-right">Hourly Rate</TableHead>
                        <TableHead className="text-right">Daily Rate</TableHead>
                        <TableHead className="text-right w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>🇺🇸</span>
                            <span className="font-medium">English</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">Available</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">$22</TableCell>
                        <TableCell className="text-right font-mono">$160</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Rate">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Rate">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>🇩🇪</span>
                            <span className="font-medium">German</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-700">Available</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">$26</TableCell>
                        <TableCell className="text-right font-mono">$190</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Rate">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Rate">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="addons" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Add-on Services</h2>
                <p className="text-sm text-gray-600 mt-1">Manage experiences, meals, and tickets</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search add-ons..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Category
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleAddService('addon')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Price (EGP)</TableHead>
                      <TableHead className="text-center">Pricing Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🐎</div>
                          <div>
                            <div className="font-medium">Felucca Boat Ride</div>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">🎟️ Experience</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">$45</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-100 text-green-800">Per Unit</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Experience</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Service" onClick={() => handleEdit(1, {name: 'Felucca Boat Ride', price: 45})}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Service" onClick={() => handleDelete(1, 'service')}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🐪</div>
                          <div>
                            <div className="font-medium">Horse Carriage Tour</div>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">🎟️ Experience</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">$25</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="bg-green-100 text-green-800">Per Unit</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Experience</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Service">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Service">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🚢</div>
                          <div>
                            <div className="font-medium">Nile River Cruise</div>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">🎟️ Experience</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">$120</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Per Person</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Experience</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Service">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Service">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🍽️</div>
                          <div>
                            <div className="font-medium">Traditional Egyptian Lunch</div>
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">🍽️ Meal</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">$18</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Per Person</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">Meal</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Service">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Service">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🎫</div>
                          <div>
                            <div className="font-medium">Museum Entry Ticket</div>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">🎫 Ticket</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">$15</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Per Person</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Ticket</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Service">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Service">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Customer Bookings</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Manual Booking
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Cities</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>#BK001</TableCell>
                      <TableCell>Sarah Johnson</TableCell>
                      <TableCell>Cairo → Luxor → Aswan</TableCell>
                      <TableCell>$1,850</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Service Modal */}
      <AddItemModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        modalType={modalType}
      />
    </div>
  );
}