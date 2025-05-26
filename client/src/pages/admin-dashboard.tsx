import { useState } from "react";
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

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      await apiRequest("PUT", `/api/${type}/${id}`, editData);
      setEditingRow(null);
      setEditData({});
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      toast({
        title: "Success",
        description: `${type} updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Egypt Travel Admin</h1>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800">
              Administrator
            </Badge>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white border">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Cities</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex items-center space-x-2">
              <Car className="w-4 h-4" />
              <span>Vehicles</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Guides</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add-ons</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Bookings</span>
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
                  <div className="text-2xl font-bold">{stats?.totalQuotes || 0}</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Basket</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.averageBasket || 0}</div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topRoutes?.map((route, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="text-sm font-medium">{route.route}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">${route.revenue}</div>
                          <div className="text-xs text-muted-foreground">{route.count} bookings</div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-muted-foreground py-4">
                        No route data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentQuotes?.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm">{quote.customerName}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">${quote.amount}</div>
                          <Badge 
                            variant={quote.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {quote.status}
                          </Badge>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center text-muted-foreground py-4">
                        No recent quotes
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cities" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Manage Cities</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
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
                        <TableCell>
                          {editingRow === city.id ? (
                            <Input
                              value={editData.name || city.name}
                              onChange={(e) => setEditData({...editData, name: e.target.value})}
                            />
                          ) : city.name}
                        </TableCell>
                        <TableCell>
                          {editingRow === city.id ? (
                            <Input
                              value={editData.slug || city.slug}
                              onChange={(e) => setEditData({...editData, slug: e.target.value})}
                            />
                          ) : city.slug}
                        </TableCell>
                        <TableCell>
                          {editingRow === city.id ? (
                            <Input
                              value={editData.description || city.description || ''}
                              onChange={(e) => setEditData({...editData, description: e.target.value})}
                            />
                          ) : (city.description || 'No description')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={city.isActive ? 'default' : 'secondary'}>
                            {city.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingRow === city.id ? (
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={() => handleSave(city.id, 'cities')}>
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

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Vehicle management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides">
            <Card>
              <CardHeader>
                <CardTitle>Tour Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Guide management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Add-on management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Customer Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Booking management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}