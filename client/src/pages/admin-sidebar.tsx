import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, LogOut, MapPin, Building2, Car, Users, Package, Map } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/admin-login";

export default function AdminSidebar() {
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
    routeType: "",
    fromCityId: "",
    toCityId: "",
    fromLocation: "",
    toLocation: "",
    km: "",
    basePriceByVehicle: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: cities = [] } = useQuery({ queryKey: ['/api/cities'] });
  const { data: vehicles = [] } = useQuery({ queryKey: ['/api/vehicle-types'] });
  const { data: guides = [] } = useQuery({ queryKey: ['/api/guide-rates'] });
  const { data: addOns = [] } = useQuery({ queryKey: ['/api/addons'] });
  const { data: routes = [] } = useQuery({ queryKey: ['/api/routes'] });
  const { data: attractions = [] } = useQuery({ queryKey: ['/api/attractions'] });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const endpoints = {
        city: '/api/cities',
        vehicle: '/api/vehicle-types',
        guide: '/api/guide-rates',
        addon: '/api/addons',
        route: '/api/routes',
        attraction: '/api/attractions'
      };
      const response = await fetch(`${endpoints[type as keyof typeof endpoints]}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guide-rates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/addons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });
      toast({ title: "Deleted successfully" });
    }
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

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
      routeType: "",
      fromCityId: "",
      toCityId: "",
      fromLocation: "",
      toLocation: "",
      km: "",
      basePriceByVehicle: ""
    });
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      slug: item.slug || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
      paxMin: item.paxMin || "",
      paxMax: item.paxMax || "",
      language: item.language || "",
      pricePerDay: item.pricePerDay || "",
      pricePerHour: item.pricePerHour || "",
      cityId: item.cityId || "",
      price: item.price || "",
      unitType: item.unitType || "",
      category: item.category || "",
      duration: item.duration || "",
      ticketPrice: item.ticketPrice || "",
      openingHours: item.openingHours || "",
      location: item.location || "",
      routeType: item.routeType || "",
      fromCityId: item.fromCityId || "",
      toCityId: item.toCityId || "",
      fromLocation: item.fromLocation || "",
      toLocation: item.toLocation || "",
      km: item.km || "",
      basePriceByVehicle: item.basePriceByVehicle || ""
    });
  };

  const handleSave = () => {
    // Implement save logic here
    setIsAddModalOpen(false);
    setEditingItem(null);
    resetForm();
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
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>City</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(cities as any[]).map((city: any) => (
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
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Passenger Range</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(vehicles as any[]).map((vehicle: any) => (
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
          </div>
        </div>
      </div>

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