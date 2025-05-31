import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, LogOut, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/admin-login";

export default function AdminWorking() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'vehicle' | 'guide' | 'addon'>('city');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
    paxMin: "",
    paxMax: "",
    language: "",
    pricePerDay: "",
    pricePerHour: "",
    cityId: "",
    price: "",
    unitType: "",
    category: ""
  });

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

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
    enabled: isAuthenticated,
  });

  // Fetch add-ons
  const { data: addOns = [] } = useQuery({
    queryKey: ["/api/addons"],
    enabled: isAuthenticated,
  });

  // Fetch vehicles from database
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicle-types"],
    enabled: isAuthenticated,
  });

  // Fetch guides from database  
  const { data: guides = [] } = useQuery({
    queryKey: ["/api/guide-rates"],
    enabled: isAuthenticated,
  });

  // Create city mutation
  const createCityMutation = useMutation({
    mutationFn: async (newCity: any) => {
      const response = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      });
      if (!response.ok) throw new Error("Failed to create city");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "City created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create city",
        variant: "destructive",
      });
    },
  });

  // Update city mutation
  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/cities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update city");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "City updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update city",
        variant: "destructive",
      });
    },
  });

  // Delete city mutation
  const deleteCityMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/cities/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete city");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
      toast({
        title: "Success",
        description: "City deleted successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message?.includes('violates foreign key constraint') 
        ? "Cannot delete city - it has related add-ons or attractions. Please remove them first."
        : error.message || "Failed to delete city";
      
      toast({
        title: "Cannot Delete City",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Generic mutations for all entity types
  const createMutation = useMutation({
    mutationFn: async ({ type, data }: { type: string; data: any }) => {
      const endpoint = type === 'addon' ? 'addons' : 
                     type === 'city' ? 'cities' :
                     type === 'vehicle' ? 'vehicle-types' :
                     type === 'guide' ? 'guide-rates' : 'addons';
      const response = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      const endpoint = variables.type === 'addon' ? '/api/addons' : 
                     variables.type === 'city' ? '/api/cities' :
                     variables.type === 'vehicle' ? '/api/vehicle-types' :
                     variables.type === 'guide' ? '/api/guide-rates' : '/api/addons';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: `${variables.type} created successfully`,
      });
    },
    onError: (error: any, variables) => {
      toast({
        title: "Error",
        description: `Failed to create ${variables.type}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ type, id, data }: { type: string; id: number; data: any }) => {
      const endpoint = type === 'addon' ? 'addons' : 
                     type === 'city' ? 'cities' :
                     type === 'vehicle' ? 'vehicle-types' :
                     type === 'guide' ? 'guide-rates' : 'addons';
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      const endpoint = variables.type === 'addon' ? '/api/addons' : 
                     variables.type === 'city' ? '/api/cities' :
                     variables.type === 'vehicle' ? '/api/vehicle-types' :
                     variables.type === 'guide' ? '/api/guide-rates' : '/api/addons';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: `${variables.type} updated successfully`,
      });
    },
    onError: (error: any, variables) => {
      toast({
        title: "Error",
        description: `Failed to update ${variables.type}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const endpoint = type === 'addon' ? 'addons' : `${type}s`;
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const endpoint = variables.type === 'addon' ? 'addons' : `${variables.type}s`;
      queryClient.invalidateQueries({ queryKey: [`/api/${endpoint}`] });
      toast({
        title: "Success",
        description: `${variables.type} deleted successfully`,
      });
    },
    onError: (error: any, variables) => {
      const errorMessage = error.message?.includes('violates foreign key constraint') 
        ? `Cannot delete ${variables.type} - it has related records. Please remove them first.`
        : error.message || `Failed to delete ${variables.type}`;
      
      toast({
        title: `Cannot Delete ${variables.type}`,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      isActive: true,
      paxMin: "",
      paxMax: "",
      language: "",
      pricePerDay: "",
      pricePerHour: "",
      cityId: "",
      price: "",
      unitType: "",
      category: ""
    });
  };

  const handleEdit = (item: any, type: 'city' | 'vehicle' | 'guide' | 'addon') => {
    setEditingItem(item);
    setModalType(type);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      slug: item.slug || "",
      isActive: item.isActive ?? true,
      paxMin: item.paxMin?.toString() || "",
      paxMax: item.paxMax?.toString() || "",
      language: item.language || "",
      pricePerDay: item.pricePerDay?.toString() || "",
      pricePerHour: item.pricePerHour?.toString() || "",
      cityId: item.cityId?.toString() || "",
      price: item.price?.toString() || "",
      unitType: item.unitType || "",
      category: item.category || ""
    });
  };

  const handleSave = () => {
    const data = prepareFormData(modalType, formData);
    
    if (editingItem) {
      updateMutation.mutate({ type: modalType, id: editingItem.id, data });
    } else {
      createMutation.mutate({ type: modalType, data });
    }
  };

  const prepareFormData = (type: string, formData: any) => {
    switch (type) {
      case 'vehicle':
        return {
          name: formData.name || '',
          description: formData.description || '',
          paxMin: parseInt(formData.paxMin) || 1,
          paxMax: parseInt(formData.paxMax) || 4
        };
      case 'guide':
        return {
          language: formData.name || formData.language || '',
          pricePerDay: parseFloat(formData.pricePerDay) || 50,
          pricePerHour: parseFloat(formData.pricePerHour) || 8,
          cityId: formData.cityId ? parseInt(formData.cityId) : null
        };
      case 'addon':
        return {
          name: formData.name || '',
          description: formData.description || '',
          price: formData.price ? parseFloat(formData.price).toString() : '25.00',
          unitType: formData.unitType || 'per_person',
          category: formData.category || 'experience',
          cityId: formData.cityId ? parseInt(formData.cityId) : null,
          isActive: formData.isActive !== undefined ? formData.isActive : true
        };
      default: // city
        return {
          name: formData.name || '',
          description: formData.description || '',
          slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
          isActive: formData.isActive !== undefined ? formData.isActive : true
        };
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this city?")) {
      deleteCityMutation.mutate(id);
    }
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
          <div className="flex items-center space-x-2">
            <Link href="/attractions">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Attractions</span>
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Cities Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cities Management</CardTitle>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add City
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New City</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">City Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter city name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="Enter city slug"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter description"
                        />
                      </div>
                      <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700">
                        Create City
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((city: any) => (
                    <TableRow key={city.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <Badge variant="outline" className="text-xs">{city.slug}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{city.description || 'No description'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="default" 
                          className={city.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {city.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(city)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => handleDelete(city.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Modal */}
          {editingItem && (
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit City</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">City Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-slug">Slug</Label>
                    <Input
                      id="edit-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700">
                    Update City
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Vehicle Types Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vehicle Types</CardTitle>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setModalType('vehicle');
                    setIsAddModalOpen(true);
                    resetForm();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Passenger Range</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {vehicle.name === 'Sedan' ? '🚗' : vehicle.name === 'Minivan' ? '🚐' : '🚌'}
                          </div>
                          <div className="font-medium">{vehicle.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono">{vehicle.paxMin}–{vehicle.paxMax}</TableCell>
                      <TableCell className="text-gray-600">{vehicle.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Tour Guides Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tour Guide Languages</CardTitle>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setModalType('guide');
                    setIsAddModalOpen(true);
                    resetForm();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Language</TableHead>
                    <TableHead>Price per Day</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guides.map((guide: any) => (
                    <TableRow key={guide.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {guide.language === 'English' ? '🇺🇸' : 
                             guide.language === 'Spanish' ? '🇪🇸' :
                             guide.language === 'French' ? '🇫🇷' : '🇩🇪'}
                          </span>
                          <span className="font-medium">{guide.language}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${guide.pricePerDay}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{guide.availability}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add-ons Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add-ons & Services</CardTitle>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setModalType('addon');
                    setIsAddModalOpen(true);
                    resetForm();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addOns.map((addon: any) => (
                    <TableRow key={addon.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🎟️</div>
                          <div>
                            <div className="font-medium">{addon.name}</div>
                            <div className="text-sm text-gray-500">{addon.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">${addon.price}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-800">{addon.unitType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">{addon.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}