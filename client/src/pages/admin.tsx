import { useState, useEffect } from "react";
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
  LogOut
} from "lucide-react";
import AdminLogin from "@/components/admin-login";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
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
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
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

  const handleEdit = (id: number, data: any) => {
    setEditingRow(id);
    setEditData(data);
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

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
          <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
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
                        <TableCell>{city.name}</TableCell>
                        <TableCell>{city.slug}</TableCell>
                        <TableCell>{city.description || 'No description'}</TableCell>
                        <TableCell>
                          <Badge variant={city.isActive ? 'default' : 'secondary'}>
                            {city.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-3 h-3" />
                          </Button>
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
              <h2 className="text-xl font-semibold">Vehicle Types</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle Type
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Min Passengers</TableHead>
                      <TableHead>Max Passengers</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sedan</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>Comfortable car for small groups</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Minivan</TableCell>
                      <TableCell>4</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>Spacious vehicle for medium groups</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Van</TableCell>
                      <TableCell>9</TableCell>
                      <TableCell>15</TableCell>
                      <TableCell>Large vehicle for big groups</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tour Guide Rates</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Guide Rate
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Language</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Hourly Rate (USD)</TableHead>
                      <TableHead>Daily Rate (USD)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>English</TableCell>
                      <TableCell>Cairo</TableCell>
                      <TableCell>$25</TableCell>
                      <TableCell>$180</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Spanish</TableCell>
                      <TableCell>Cairo</TableCell>
                      <TableCell>$30</TableCell>
                      <TableCell>$220</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>French</TableCell>
                      <TableCell>Luxor</TableCell>
                      <TableCell>$28</TableCell>
                      <TableCell>$200</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addons" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add-on Services</h2>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(addOns) && addOns.map((addOn: any) => (
                      <TableRow key={addOn.id}>
                        <TableCell>{addOn.name}</TableCell>
                        <TableCell>${addOn.price}</TableCell>
                        <TableCell>
                          <Badge variant={addOn.unitType === 'per_unit' ? 'default' : 'secondary'}>
                            {addOn.unitType === 'per_unit' ? 'Per Unit' : 'Per Person'}
                          </Badge>
                        </TableCell>
                        <TableCell>{addOn.category}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
    </div>
  );
}