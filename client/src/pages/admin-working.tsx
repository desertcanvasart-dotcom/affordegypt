import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, LogOut, MapPin, Building2, Car, Users, Package, Map, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/admin-login";

export default function AdminWorking() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'vehicle' | 'guide' | 'addon' | 'attraction' | 'route'>('city');
  const [activeSection, setActiveSection] = useState<'cities' | 'vehicles' | 'guides' | 'addons' | 'routes' | 'attractions'>('cities');
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
    category: "",
    duration: "",
    ticketPrice: "",
    openingHours: "",
    location: "",
    fromCityId: "",
    toCityId: "",
    km: "",
    basePriceByVehicle: {},
    routeType: "",
    fromLocation: "",
    toLocation: ""
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

  // Fetch attractions from database  
  const { data: attractions = [] } = useQuery({
    queryKey: ["/api/attractions"],
    enabled: isAuthenticated,
  });

  // Fetch routes from database  
  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
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
                     type === 'guide' ? 'guide-rates' :
                     type === 'attraction' ? 'attractions' : 'addons';
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
                     variables.type === 'guide' ? '/api/guide-rates' :
                     variables.type === 'attraction' ? '/api/attractions' : '/api/addons';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setIsAddModalOpen(false);
      setModalType('city');
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
                     type === 'guide' ? 'guide-rates' :
                     type === 'attraction' ? 'attractions' : 'addons';
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
                     variables.type === 'guide' ? '/api/guide-rates' :
                     variables.type === 'attraction' ? '/api/attractions' : '/api/addons';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setEditingItem(null);
      setIsAddModalOpen(false);
      setModalType('city');
      resetForm();
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

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: async (newRoute: any) => {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute),
      });
      if (!response.ok) throw new Error("Failed to create route");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Route created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create route",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const endpoint = type === 'addon' ? 'addons' : 
                     type === 'city' ? 'cities' :
                     type === 'vehicle' ? 'vehicle-types' :
                     type === 'guide' ? 'guide-rates' :
                     type === 'attraction' ? 'attractions' :
                     type === 'route' ? 'routes' : 'addons';
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete ${type}`);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const endpoint = variables.type === 'addon' ? '/api/addons' : 
                     variables.type === 'city' ? '/api/cities' :
                     variables.type === 'vehicle' ? '/api/vehicle-types' :
                     variables.type === 'guide' ? '/api/guide-rates' :
                     variables.type === 'attraction' ? '/api/attractions' : '/api/addons';
      queryClient.invalidateQueries({ queryKey: [endpoint] });
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
      category: "",
      duration: "",
      ticketPrice: "",
      openingHours: "",
      location: "",
      fromCityId: "",
      toCityId: "",
      km: "",
      basePriceByVehicle: {},
      routeType: "",
      fromLocation: "",
      toLocation: ""
    });
  };

  const handleEdit = (item: any, type: 'city' | 'vehicle' | 'guide' | 'addon' | 'attraction') => {
    setEditingItem(item);
    setModalType(type);
    setIsAddModalOpen(true);
    
    if (type === 'guide') {
      setFormData({
        name: item.language || "",
        description: item.name || "",
        slug: "",
        isActive: true,
        paxMin: "",
        paxMax: "",
        language: item.language || "",
        pricePerDay: "",
        pricePerHour: (parseFloat(item.hourlyPrice) * 8).toFixed(2) || "",
        cityId: item.cityId?.toString() || "",
        price: "",
        unitType: "",
        category: "",
        duration: "",
        ticketPrice: "",
        openingHours: "",
        location: ""
      });
    } else {
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
        category: item.category || "",
        duration: item.duration || "",
        ticketPrice: item.ticketPrice?.toString() || "",
        openingHours: item.openingHours || "",
        location: item.location || ""
      });
    }
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
          language: formData.name || '',
          hourlyPrice: (parseFloat(formData.pricePerHour) / 8) || 8,
          name: formData.description || 'Guide Name',
          cityId: formData.cityId ? parseInt(formData.cityId) : 1
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
      case 'attraction':
        return {
          name: formData.name || '',
          description: formData.description || '',
          cityId: formData.cityId ? parseInt(formData.cityId) : 1,
          category: formData.category || 'Historical',
          duration: parseInt(formData.duration) || 2,
          ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : 0,
          isActive: formData.isActive !== undefined ? formData.isActive : true
        };
      case 'route':
        // Calculate base pricing based on distance and vehicle types
        const distance = parseFloat(formData.km) || 0;
        const basePricing: any = {};
        
        // Generate pricing for all vehicle and license combinations
        // Vehicle IDs: 1=Sedan, 2=Minivan, 3=Van
        // License IDs: 1=Normal, 2=Tourism
        const pricePerKm = formData.routeType === 'intra-city' ? 1.5 : 0.5; // Higher rate for city routes
        
        [1, 2, 3].forEach(vehicleId => {
          basePricing[vehicleId] = {};
          [1, 2].forEach(licenseId => {
            const multiplier = vehicleId === 1 ? 1 : vehicleId === 2 ? 1.4 : 1.8;
            const licenseMultiplier = licenseId === 2 ? 1.2 : 1;
            basePricing[vehicleId][licenseId] = (distance * pricePerKm * multiplier * licenseMultiplier).toFixed(2);
          });
        });
        
        // Validate required fields
        if (!formData.fromCityId || !formData.toCityId) {
          throw new Error('From City and To City are required');
        }

        const routeData: any = {
          fromCityId: parseInt(formData.fromCityId),
          toCityId: parseInt(formData.toCityId), 
          km: distance.toFixed(2),
          basePriceByVehicle: basePricing
        };

        // Add location details for intra-city routes
        if (formData.routeType === 'intra-city') {
          routeData.fromLocation = formData.fromLocation || '';
          routeData.toLocation = formData.toLocation || '';
          routeData.routeType = 'intra-city';
        } else {
          routeData.routeType = 'inter-city';
        }
        
        return routeData;
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Egypt Travel Admin</h1>
            <p className="text-xs text-gray-500">Back-Office — crafted for flawless journeys</p>
          </div>
          <Badge variant="secondary" className="bg-teal-100 text-teal-800 mt-2">
            Administrator
          </Badge>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={() => setActiveSection('cities')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'cities' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Cities</span>
          </button>

          <button
            onClick={() => setActiveSection('vehicles')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'vehicles' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Vehicles</span>
          </button>

          <button
            onClick={() => setActiveSection('guides')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'guides' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tour Guides</span>
          </button>

          <button
            onClick={() => setActiveSection('addons')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'addons' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Add-ons</span>
          </button>

          <button
            onClick={() => setActiveSection('routes')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'routes' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Routes</span>
          </button>

          <button
            onClick={() => setActiveSection('attractions')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'attractions' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Attractions</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Link href="/attractions">
            <Button variant="outline" size="sm" className="w-full mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              Attractions Portal
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                setModalType(activeSection === 'cities' ? 'city' : 
                           activeSection === 'vehicles' ? 'vehicle' :
                           activeSection === 'guides' ? 'guide' :
                           activeSection === 'addons' ? 'addon' :
                           activeSection === 'routes' ? 'route' : 'attraction');
                setEditingItem(null);
                setIsAddModalOpen(true);
                resetForm();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeSection.slice(0, -1)}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'cities' && (
              <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cities Management</CardTitle>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setModalType('city');
                    setEditingItem(null);
                    setIsAddModalOpen(true);
                    resetForm();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add City
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="sticky top-16 bg-white z-10">
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((city: any) => (
                    <TableRow key={city.id} className="h-12">
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{city.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">{city.slug}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{city.description || 'No description'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="default" 
                          className={city.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}
                        >
                          {city.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(city, 'city')}
                            className="h-8 w-8 p-0"
                            title="Edit city"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 h-8 w-8 p-0"
                            onClick={() => deleteMutation.mutate({ type: 'city', id: city.id })}
                            title="Delete city"
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
            )}

            {activeSection === 'vehicles' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Vehicle Types</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-16 bg-white z-10">
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Passenger Range</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle: any) => (
                        <TableRow key={vehicle.id} className="h-12">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">
                                {vehicle.name === 'Sedan' ? '🚗' : vehicle.name === 'Minivan' ? '🚐' : '🚌'}
                              </div>
                              <div className="font-medium text-sm">{vehicle.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">{vehicle.paxMin}–{vehicle.paxMax}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{vehicle.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(vehicle, 'vehicle')}
                                className="h-8 w-8 p-0"
                                title="Edit vehicle"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 h-8 w-8 p-0"
                                onClick={() => deleteMutation.mutate({ type: 'vehicle', id: vehicle.id })}
                                title="Delete vehicle"
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
            )}

            {activeSection === 'guides' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tour Guide Languages</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-16 bg-white z-10">
                      <TableRow>
                        <TableHead>Language</TableHead>
                        <TableHead>Guide Name</TableHead>
                        <TableHead>Price per Day</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {guides.map((guide: any) => (
                        <TableRow key={guide.id} className="h-12">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">
                                {guide.language === 'English' ? '🇺🇸' : 
                                 guide.language === 'Spanish' ? '🇪🇸' :
                                 guide.language === 'French' ? '🇫🇷' : '🇩🇪'}
                              </span>
                              <span className="font-medium text-sm">{guide.language}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{guide.name}</TableCell>
                          <TableCell className="font-mono text-sm">${(parseFloat(guide.hourlyPrice) * 8).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {cities.find((city: any) => city.id === guide.cityId)?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(guide, 'guide')}
                                className="h-8 w-8 p-0"
                                title="Edit guide"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 h-8 w-8 p-0"
                                onClick={() => deleteMutation.mutate({ type: 'guide', id: guide.id })}
                                title="Delete guide"
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
            )}

            {activeSection === 'addons' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add-on Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-16 bg-white z-10">
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {addOns.map((addon: any) => (
                        <TableRow key={addon.id} className="h-12">
                          <TableCell>
                            <div className="font-medium text-sm">{addon.name}</div>
                            <div className="text-xs text-gray-500">{addon.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {addon.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">${addon.price}</TableCell>
                          <TableCell className="text-xs text-gray-600">{addon.unitType}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(addon, 'addon')}
                                className="h-8 w-8 p-0"
                                title="Edit add-on"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 h-8 w-8 p-0"
                                onClick={() => deleteMutation.mutate({ type: 'addon', id: addon.id })}
                                title="Delete add-on"
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
            )}

            {activeSection === 'routes' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Transportation Routes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-16 bg-white z-10">
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes?.map((route: any) => (
                        <TableRow key={route.id} className="h-12">
                          <TableCell>
                            <div className="text-sm">
                              {route.routeType === 'inter-city' 
                                ? `${cities.find((c: any) => c.id === route.fromCityId)?.name} → ${cities.find((c: any) => c.id === route.toCityId)?.name}`
                                : `${route.fromLocation} → ${route.toLocation}`
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {route.routeType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{route.km} km</TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {route.basePriceByVehicle ? 'Variable' : 'Fixed'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(route, 'route')}
                                className="h-8 w-8 p-0"
                                title="Edit route"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 h-8 w-8 p-0"
                                onClick={() => deleteMutation.mutate({ type: 'route', id: route.id })}
                                title="Delete route"
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
            )}

            {activeSection === 'attractions' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tourist Attractions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-16 bg-white z-10">
                      <TableRow>
                        <TableHead>Attraction</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Ticket Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attractions?.map((attraction: any) => (
                        <TableRow key={attraction.id} className="h-12">
                          <TableCell>
                            <div className="font-medium text-sm">{attraction.name}</div>
                            <div className="text-xs text-gray-500">{attraction.location}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {cities.find((city: any) => city.id === attraction.cityId)?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">${attraction.ticketPrice}</TableCell>
                          <TableCell className="text-xs text-gray-600">{attraction.duration}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(attraction, 'attraction')}
                                className="h-8 w-8 p-0"
                                title="Edit attraction"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600 h-8 w-8 p-0"
                                onClick={() => deleteMutation.mutate({ type: 'attraction', id: attraction.id })}
                                title="Delete attraction"
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
            )}
          </div>
        </div>
      </div>

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
                <TableHeader className="sticky top-16 bg-white z-10">
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Passenger Range</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle: any) => (
                    <TableRow key={vehicle.id} className="h-12">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">
                            {vehicle.name === 'Sedan' ? '🚗' : vehicle.name === 'Minivan' ? '🚐' : '🚌'}
                          </div>
                          <div className="font-medium text-sm">{vehicle.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">{vehicle.paxMin}–{vehicle.paxMax}</TableCell>
                      <TableCell className="text-gray-600 text-sm">{vehicle.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(vehicle, 'vehicle')}
                            className="h-8 w-8 p-0"
                            title="Edit vehicle"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 h-8 w-8 p-0"
                            onClick={() => deleteMutation.mutate({ type: 'vehicle', id: vehicle.id })}
                            title="Delete vehicle"
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
                    <TableHead>Guide Name</TableHead>
                    <TableHead>Price per Day</TableHead>
                    <TableHead>City</TableHead>
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
                      <TableCell>{guide.name}</TableCell>
                      <TableCell className="font-mono">${(parseFloat(guide.hourlyPrice) * 8).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          {cities.find((city: any) => city.id === guide.cityId)?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(guide, 'guide')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this ${guide.language} guide (${guide.name})?`)) {
                                deleteMutation.mutate({ type: 'guide', id: guide.id });
                              }
                            }}
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(addon, 'addon')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ type: 'addon', id: addon.id })}
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

          {/* Attractions Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Attractions</CardTitle>
              <Button 
                onClick={() => {
                  setModalType('attraction');
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                  resetForm();
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Attraction
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Ticket Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(attractions as any[]).map((attraction: any) => (
                    <TableRow key={attraction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{attraction.name}</div>
                          {attraction.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {attraction.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(cities as any[]).find((c: any) => c.id === attraction.cityId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{attraction.duration || 'N/A'}</TableCell>
                      <TableCell className="font-mono">${attraction.ticketPrice || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {attraction.category || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(attraction, 'attraction')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600"
                            onClick={() => deleteMutation.mutate({ type: 'attraction', id: attraction.id })}
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

          {/* Routes Management Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Routes Management</CardTitle>
              <Button 
                onClick={() => {
                  setModalType('route');
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                  resetForm();
                }}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Route
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance (KM)</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(routes as any[]).map((route: any) => {
                    const fromCity = (cities as any[]).find((c: any) => c.id === route.fromCityId);
                    const toCity = (cities as any[]).find((c: any) => c.id === route.toCityId);
                    const basePricing = typeof route.basePriceByVehicle === 'object' ? route.basePriceByVehicle : {};
                    const firstVehiclePrice = Object.values(basePricing)[0] as any;
                    const basePrice = firstVehiclePrice ? Object.values(firstVehiclePrice)[0] : 'N/A';
                    
                    const isIntraCity = route.routeType === 'intra-city' || route.fromCityId === route.toCityId;
                    
                    return (
                      <TableRow key={route.id}>
                        <TableCell>
                          <Badge variant={isIntraCity ? "secondary" : "default"} className={isIntraCity ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                            {isIntraCity ? 'Intra-City' : 'Inter-City'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {isIntraCity ? (
                              <div>
                                <div>{fromCity?.name || 'Unknown'}</div>
                                {route.fromLocation && <div className="text-sm text-gray-500">{route.fromLocation}</div>}
                              </div>
                            ) : (
                              fromCity?.name || 'Unknown'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {isIntraCity ? (
                              <div>
                                <div>{fromCity?.name || 'Unknown'}</div>
                                {route.toLocation && <div className="text-sm text-gray-500">{route.toLocation}</div>}
                              </div>
                            ) : (
                              toCity?.name || 'Unknown'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">{route.km}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">${basePrice}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(route, 'route')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate({ type: 'route', id: route.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Universal Modal for Add/Edit Operations */}
          {isAddModalOpen && (
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
              setIsAddModalOpen(open);
              if (!open) {
                setModalType('city');
                setEditingItem(null);
                resetForm();
              }
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit' : 'Add New'} {
                      modalType === 'city' ? 'City' :
                      modalType === 'vehicle' ? 'Vehicle' :
                      modalType === 'guide' ? 'Guide' :
                      modalType === 'attraction' ? 'Attraction' :
                      modalType === 'route' ? 'Route' : 'Service'
                    }
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Common Name field - hidden for routes */}
                  {modalType !== 'route' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {modalType === 'guide' ? 'Language' : 'Name'}
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder={modalType === 'guide' ? 'English' : 'Enter name'}
                      />
                    </div>
                  )}

                  {/* City-specific fields */}
                  {modalType === 'city' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="City description"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Slug</label>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          placeholder="city-name"
                        />
                      </div>
                    </>
                  )}

                  {/* Vehicle-specific fields */}
                  {modalType === 'vehicle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Vehicle description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Min Passengers</label>
                          <Input
                            type="number"
                            value={formData.paxMin}
                            onChange={(e) => setFormData({...formData, paxMin: e.target.value})}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Max Passengers</label>
                          <Input
                            type="number"
                            value={formData.paxMax}
                            onChange={(e) => setFormData({...formData, paxMax: e.target.value})}
                            placeholder="4"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Guide-specific fields */}
                  {modalType === 'guide' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Guide Name</label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Ahmed Hassan"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={formData.cityId}
                          onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                        >
                          <option value="">Select City</option>
                          {cities.map((city: any) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Price per Day</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.pricePerHour}
                          onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                          placeholder="64.00"
                        />
                      </div>
                    </>
                  )}

                  {/* Route-specific fields */}
                  {modalType === 'route' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">From City</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={formData.fromCityId}
                            onChange={(e) => setFormData({...formData, fromCityId: e.target.value})}
                          >
                            <option value="">Select From City</option>
                            {(cities as any[]).map((city: any) => (
                              <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">To City</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={formData.toCityId}
                            onChange={(e) => setFormData({...formData, toCityId: e.target.value})}
                          >
                            <option value="">Select To City</option>
                            {(cities as any[]).map((city: any) => (
                              <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Distance (KM)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.km}
                          onChange={(e) => setFormData({...formData, km: e.target.value})}
                          placeholder="450.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Base Pricing Information</label>
                        <div className="text-sm text-gray-500 mb-2">
                          Pricing will be automatically calculated based on distance and vehicle types
                        </div>
                      </div>
                    </>
                  )}

                  {/* Attraction-specific fields */}
                  {modalType === 'attraction' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={formData.cityId}
                          onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                        >
                          <option value="">Select City</option>
                          {(cities as any[]).map((city: any) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="Historical, Cultural, Adventure"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Duration</label>
                        <Input
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          placeholder="2 hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Ticket Price ($)</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.ticketPrice}
                          onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                          placeholder="25.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Opening Hours</label>
                        <Input
                          value={formData.openingHours}
                          onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                          placeholder="9:00 AM - 5:00 PM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Giza Plateau"
                        />
                      </div>
                    </>
                  )}

                  {/* Route specific fields */}
                  {modalType === 'route' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Route Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={formData.routeType}
                          onChange={(e) => setFormData({...formData, routeType: e.target.value, fromCityId: '', toCityId: '', fromLocation: '', toLocation: '', km: ''})}
                        >
                          <option value="">Select Route Type</option>
                          <option value="inter-city">Inter-City (Between Cities)</option>
                          <option value="intra-city">Intra-City (Within City)</option>
                        </select>
                      </div>

                      {formData.routeType === 'inter-city' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">From City</label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={formData.fromCityId}
                                onChange={(e) => setFormData({...formData, fromCityId: e.target.value})}
                              >
                                <option value="">Select From City</option>
                                {(cities as any[])?.map((city: any) => (
                                  <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">To City</label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                value={formData.toCityId}
                                onChange={(e) => setFormData({...formData, toCityId: e.target.value})}
                              >
                                <option value="">Select To City</option>
                                {(cities as any[])?.map((city: any) => (
                                  <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Distance (KM)</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.km}
                              onChange={(e) => setFormData({...formData, km: e.target.value})}
                              placeholder="302.5"
                            />
                          </div>
                        </>
                      )}

                      {formData.routeType === 'intra-city' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                              value={formData.fromCityId}
                              onChange={(e) => setFormData({...formData, fromCityId: e.target.value, toCityId: e.target.value})}
                            >
                              <option value="">Select City</option>
                              {(cities as any[])?.map((city: any) => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">From Location</label>
                              <Input
                                value={formData.fromLocation}
                                onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                                placeholder="e.g., Airport, Downtown, Hotel District"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">To Location</label>
                              <Input
                                value={formData.toLocation}
                                onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                                placeholder="e.g., Pyramids, City Center, Museum"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Distance (KM)</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.km}
                              onChange={(e) => setFormData({...formData, km: e.target.value})}
                              placeholder="25.0"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Add-on specific fields */}
                  {modalType === 'addon' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Service description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            placeholder="25.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Unit Type</label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={formData.unitType}
                            onChange={(e) => setFormData({...formData, unitType: e.target.value})}
                          >
                            <option value="">Select Unit Type</option>
                            <option value="per_person">Per Person</option>
                            <option value="per_unit">Per Unit</option>
                            <option value="per_trip">Per Trip</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          <option value="">Select Category</option>
                          <option value="transport">Transport</option>
                          <option value="experience">Experience</option>
                          <option value="meal">Meal</option>
                          <option value="ticket">Ticket</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Active checkbox for applicable types */}
                  {(modalType === 'city' || modalType === 'addon') && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <label className="text-sm">Active</label>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add {modalType === 'city' ? 'City' : modalType === 'vehicle' ? 'Vehicle' : modalType === 'guide' ? 'Guide' : modalType === 'addon' ? 'Add-on' : modalType === 'route' ? 'Route' : 'Attraction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={modalType === 'city' ? 'Cairo' : modalType === 'vehicle' ? 'Sedan' : modalType === 'guide' ? 'Ahmed Hassan' : 'Service name'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}