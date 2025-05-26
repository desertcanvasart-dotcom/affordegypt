import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download,
  Upload,
  Phone,
  LogOut
} from "lucide-react";
import AdminLogin from "@/components/admin-login";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalQuotes: number;
  averageBasket: number;
  topRoutes: Array<{ route: string; count: number; revenue: number }>;
  recentQuotes: Array<{ id: number; customerName: string; amount: number; status: string; createdAt: string }>;
}

interface City {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean | null;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for existing auth token
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    // Set Authorization header for future requests
    apiRequest.defaults = { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    retry: false,
  });

  // Fetch cities for editing
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Fetch routes for editing
  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  // Fetch add-ons for editing
  const { data: addOns = [] } = useQuery({
    queryKey: ["/api/add-ons"],
  });

  const handleEdit = (id: number, data: any) => {
    setEditingRow(id);
    setEditData(data);
  };

  const handleSave = async (id: number, type: string) => {
    try {
      // Save logic would go here
      setEditingRow(null);
      setEditData({});
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Administrator</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="addons">Add-ons</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="import">Import/Export</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">{stats?.totalQuotes || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Basket</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">${stats?.averageBasket || 0}</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">+18%</div>
                  <p className="text-xs text-muted-foreground">vs previous month</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Routes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topRoutes?.map((route, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{route.route}</div>
                          <div className="text-sm text-muted-foreground">{route.count} bookings</div>
                        </div>
                        <div className="price-chip">${route.revenue}</div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No route data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentQuotes?.map((quote) => (
                      <div key={quote.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{quote.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={quote.status === 'completed' ? 'default' : 'secondary'}>
                            {quote.status}
                          </Badge>
                          <div className="price-chip">${quote.amount}</div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-muted-foreground">No recent quotes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cities Tab */}
          <TabsContent value="cities" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Cities Management</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
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
                    {cities.map((city: any) => (
                      <TableRow key={city.id}>
                        <TableCell>
                          {editingRow === city.id ? (
                            <Input
                              value={editData.name || city.name}
                              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                              className="h-8"
                            />
                          ) : (
                            city.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === city.id ? (
                            <Input
                              value={editData.slug || city.slug}
                              onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value }))}
                              className="h-8"
                            />
                          ) : (
                            city.slug
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {editingRow === city.id ? (
                            <Input
                              value={editData.description || city.description || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              className="h-8"
                            />
                          ) : (
                            city.description || 'No description'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={city.isActive ? 'default' : 'secondary'}>
                            {city.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingRow === city.id ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleSave(city.id, 'city')}>
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(city.id, city)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import" className="space-y-6">
            <h2 className="text-2xl font-bold">Data Import/Export</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    Export Cities (CSV)
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Routes (CSV)
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Add-ons (CSV)
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export All Quotes (CSV)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cities-csv">Cities CSV</Label>
                    <Input id="cities-csv" type="file" accept=".csv" />
                  </div>
                  <div>
                    <Label htmlFor="routes-csv">Routes CSV</Label>
                    <Input id="routes-csv" type="file" accept=".csv" />
                  </div>
                  <div>
                    <Label htmlFor="addons-csv">Add-ons CSV</Label>
                    <Input id="addons-csv" type="file" accept=".csv" />
                  </div>
                  <Button className="w-full">
                    Upload & Process
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manual Quote Creator */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Quote Management</h2>
              <Button className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Create Manual Quote
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Manual Quote Creator</CardTitle>
                <p className="text-muted-foreground">Create quotes for phone enquiries</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input id="customer-name" placeholder="Enter customer name" />
                  </div>
                  <div>
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input id="customer-email" type="email" placeholder="Enter email" />
                  </div>
                  <div>
                    <Label htmlFor="customer-phone">Customer Phone</Label>
                    <Input id="customer-phone" placeholder="Enter phone number" />
                  </div>
                  <div>
                    <Label htmlFor="passengers">Number of Passengers</Label>
                    <Input id="passengers" type="number" min="1" placeholder="2" />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Itinerary Items</h4>
                  <Button variant="outline" className="w-full">
                    + Add Transportation
                  </Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Create Quote</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}