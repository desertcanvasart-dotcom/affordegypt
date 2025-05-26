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
  LogOut,
  Download,
  Search,
  Filter,
  Trash2,
  User,
  Bus,
  Truck
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
          <TabsList className="grid w-full grid-cols-6 bg-white border shadow-sm">
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
              <div>
                <h2 className="text-xl font-semibold">Vehicle Types</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your vehicle fleet and passenger capacities</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search vehicles..." className="pl-10 w-64" />
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle Type
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
                      <TableCell className="text-center font-mono">1–3</TableCell>
                      <TableCell className="text-gray-600">Comfortable car for small groups</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle">
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
                      <TableCell className="text-center font-mono">4–8</TableCell>
                      <TableCell className="text-gray-600">Spacious vehicle for medium groups</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle">
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
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Edit Vehicle">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete Vehicle">
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
                <Button className="bg-teal-600 hover:bg-teal-700">
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
                <Button className="bg-teal-600 hover:bg-teal-700">
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
                      <TableHead className="text-right">Price (USD)</TableHead>
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
    </div>
  );
}