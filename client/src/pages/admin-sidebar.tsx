import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Trash2, Plus, LogOut, MapPin, Building2, Car, Users, Package, Map, Calendar, Star } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/admin-login";
import AdminBookings from "@/components/admin-bookings";
import AdminReviews from "@/pages/admin-reviews";

export default function AdminSidebar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'city' | 'vehicle' | 'guide' | 'addon' | 'attraction' | 'route'>('city');
  const [activeSection, setActiveSection] = useState<'cities' | 'vehicles' | 'guides' | 'addons' | 'routes' | 'attractions' | 'bookings' | 'reviews'>('cities');
  const [selectedCityForRoutes, setSelectedCityForRoutes] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: string, id: number, name: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({
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
    routeType: "inter-city",
    fromCityId: "",
    toCityId: "",
    fromLocation: "",
    toLocation: "",
    km: "",
    basePriceByVehicle: "",
    vehiclePricing: {}
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
      setDeleteConfirm(null);
    }
  });

  const handleDeleteClick = (item: any, type: string) => {
    setDeleteConfirm({
      type,
      id: item.id,
      name: item.name || item.language || `${type} #${item.id}`
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate({ type: deleteConfirm.type, id: deleteConfirm.id });
    }
  };

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
      routeType: "inter-city",
      fromCityId: "",
      toCityId: "",
      fromLocation: "",
      toLocation: "",
      km: "",
      basePriceByVehicle: "",
      vehiclePricing: {}
    });
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setModalType(type as any);
    
    // Parse basePriceByVehicle for editing
    let vehiclePricing = {};
    if (item.basePriceByVehicle) {
      try {
        vehiclePricing = typeof item.basePriceByVehicle === 'string' 
          ? JSON.parse(item.basePriceByVehicle) 
          : item.basePriceByVehicle;
      } catch (e) {
        console.error('Error parsing basePriceByVehicle:', e);
        vehiclePricing = {};
      }
    }
    
    setFormData({
      name: item.name || "",
      description: item.description || "",
      slug: item.slug || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
      paxMin: item.paxMin?.toString() || "",
      paxMax: item.paxMax?.toString() || "",
      language: item.language || "",
      pricePerDay: item.pricePerDay?.toString() || "",
      pricePerHour: item.hourlyPrice?.toString() || "",
      cityId: item.cityId?.toString() || "",
      price: item.price?.toString() || "",
      unitType: item.unitType || "",
      category: item.category || "",
      duration: item.duration || "",
      ticketPrice: item.ticketPrice?.toString() || "",
      openingHours: item.openingHours || "",
      location: item.location || "",
      routeType: item.routeType || (item.fromCityId && item.toCityId && item.fromCityId !== item.toCityId ? 'inter-city' : 'intra-city'),
      fromCityId: item.fromCityId?.toString() || "",
      toCityId: item.toCityId?.toString() || "",
      fromLocation: item.fromLocation || "",
      toLocation: item.toLocation || "",
      km: item.km?.toString() || "",
      displayOrder: item.displayOrder?.toString() || "",
      basePriceByVehicle: typeof item.basePriceByVehicle === 'string' ? item.basePriceByVehicle : JSON.stringify(item.basePriceByVehicle || {}),
      vehiclePricing: vehiclePricing
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('handleSave called - modalType:', modalType);
      console.log('Current formData:', formData);
      
      const endpoints = {
        city: '/api/cities',
        vehicle: '/api/vehicle-types',
        guide: '/api/guide-rates',
        addon: '/api/addons',
        route: '/api/routes',
        attraction: '/api/attractions'
      };

      const payload = modalType === 'city' ? {
        name: formData.name,
        description: formData.description,
        slug: formData.slug || formData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim('-'), // Remove leading/trailing hyphens
        isActive: formData.isActive
      } : modalType === 'vehicle' ? {
        name: formData.name,
        description: formData.description,
        paxMin: parseInt(formData.paxMin) || 1,
        paxMax: parseInt(formData.paxMax) || 4
      } : modalType === 'guide' ? {
        name: formData.name,
        language: formData.language,
        hourlyPrice: parseFloat(formData.pricePerHour) || 0,
        cityId: parseInt(formData.cityId) || 1
      } : modalType === 'addon' ? {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        unitType: formData.unitType || 'per_unit',
        category: formData.category || 'service',
        cityId: formData.cityId ? parseInt(formData.cityId) : null
      } : modalType === 'route' ? {
        name: formData.name,
        description: formData.description,
        routeType: formData.routeType || 'inter-city',
        fromCityId: formData.fromCityId ? parseInt(formData.fromCityId) : null,
        toCityId: formData.routeType === 'inter-city' 
          ? (formData.toCityId ? parseInt(formData.toCityId) : null)
          : (formData.fromCityId ? parseInt(formData.fromCityId) : null),
        fromLocation: formData.fromLocation || null,
        toLocation: formData.toLocation || null,
        km: parseFloat(formData.km) || 0,
        displayOrder: parseInt(formData.displayOrder) || 0,
        basePriceByVehicle: formData.vehiclePricing && Object.keys(formData.vehiclePricing).length > 0 
          ? formData.vehiclePricing 
          : (formData.basePriceByVehicle ? JSON.parse(formData.basePriceByVehicle) : {})
      } : {
        name: formData.name,
        description: formData.description,
        cityId: parseInt(formData.cityId) || 1,
        ticketPrice: parseFloat(formData.ticketPrice) || 0,
        duration: parseInt((formData.duration || '2').toString().replace(/[^\d]/g, '')) || 2,
        location: formData.location || '',
        category: formData.category || 'historical',
        openingHours: formData.openingHours || '9:00 AM - 5:00 PM'
      };

      console.log('Prepared payload for', modalType, ':', payload);

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem 
        ? `${endpoints[modalType as keyof typeof endpoints]}/${editingItem.id}`
        : endpoints[modalType as keyof typeof endpoints];

      console.log('Making request to:', url, 'with method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(editingItem ? 'Failed to update' : 'Failed to create');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/cities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicle-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/guide-rates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/addons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attractions'] });

      toast({ title: editingItem ? "Updated successfully" : "Created successfully" });
      setIsAddModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('duplicate key')) {
        if (errorMessage.includes('cities_name_key')) {
          toast({ title: "City name already exists", description: `A city with the name "${formData.name}" already exists`, variant: "destructive" });
        } else if (errorMessage.includes('cities_slug_key')) {
          toast({ title: "City URL already exists", description: `A city with this URL slug already exists. Try a different name.`, variant: "destructive" });
        } else {
          toast({ title: "Item already exists", description: "An item with this name or identifier already exists", variant: "destructive" });
        }
      } else {
        toast({ title: editingItem ? "Failed to update" : "Failed to create", description: errorMessage, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
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
            onClick={() => setActiveSection('bookings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'bookings' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings</span>
          </button>

          <div>
            <button
              onClick={() => {
                if (activeSection === 'routes') {
                  // If already active, deactivate to close subcategories
                  setActiveSection('cities');
                  setSelectedCityForRoutes(null);
                } else {
                  setActiveSection('routes');
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'routes' 
                  ? 'bg-teal-100 text-teal-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Routes</span>
            </button>
            
            {/* City subcategories for Routes */}
            {activeSection === 'routes' && (
              <div className="ml-6 mt-1 space-y-1">
                {(cities as any[]).map((city: any) => (
                  <button
                    key={city.id}
                    onClick={() => setSelectedCityForRoutes(city.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedCityForRoutes === city.id
                        ? 'bg-teal-50 text-teal-600 border-l-2 border-teal-400'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

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

          <button
            onClick={() => setActiveSection('reviews')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'reviews' 
                ? 'bg-teal-100 text-teal-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reviews</span>
          </button>

          <Link href="/attractions" className="w-full">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <MapPin className="w-4 h-4" />
              <span>Attractions Portal</span>
            </button>
          </Link>

          <Link href="/admin/routes/" className="w-full">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <Car className="w-4 h-4" />
              <span>Transfer Dashboard</span>
            </button>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
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
            {activeSection !== 'addons' && (
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  setModalType(activeSection === 'cities' ? 'city' : 
                             activeSection === 'vehicles' ? 'vehicle' :
                             activeSection === 'guides' ? 'guide' :
                             activeSection === 'routes' ? 'route' : 'attraction');
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                  resetForm();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {activeSection.slice(0, -1)}
              </Button>
            )}
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
                                onClick={() => handleDeleteClick(city, 'city')}
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
                                onClick={() => handleDeleteClick(vehicle, 'vehicle')}
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
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Language</TableHead>
                        <TableHead>Guide Name</TableHead>
                        <TableHead>Daily Price</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(guides as any[]).map((guide: any) => (
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
                          <TableCell className="text-sm">{guide.name || 'Professional Guide'}</TableCell>
                          <TableCell className="font-mono text-sm">EGP {parseFloat(guide.hourlyPrice || '0').toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {(cities as any[]).find((city: any) => city.id === guide.cityId)?.name || 'Unknown'}
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
                                onClick={() => handleDeleteClick(guide, 'guide')}
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
              <div className="space-y-6">
                {/* Per Person Add-ons */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Per Person Add-ons</CardTitle>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          setModalType('addon');
                          setEditingItem(null);
                          setIsAddModalOpen(true);
                          setFormData({...formData, unitType: 'per_person'});
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Per Person Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(addOns as any[]).filter((addon: any) => addon.unitType === 'per_person' || addon.unitType === 'per_trip').map((addon: any) => {
                          const city = (cities as any[]).find((c: any) => c.id === addon.cityId);
                          return (
                            <TableRow key={addon.id} className="h-12">
                              <TableCell>
                                <div className="font-medium text-sm">{addon.name}</div>
                                <div className="text-xs text-gray-500">{addon.description}</div>
                              </TableCell>
                              <TableCell>
                                {city ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {city.name}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-gray-500">
                                    All Cities
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {addon.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">EGP {addon.price}</TableCell>
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
                                    onClick={() => handleDeleteClick(addon, 'addon')}
                                    title="Delete add-on"
                                  >
                                    <Trash2 className="w-3 h-3" />
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

                {/* Per Unit Add-ons */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Per Unit Add-ons</CardTitle>
                      <Button 
                        className="bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          setModalType('addon');
                          setEditingItem(null);
                          setIsAddModalOpen(true);
                          setFormData({...formData, unitType: 'per_unit'});
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Per Unit Service
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(addOns as any[]).filter((addon: any) => addon.unitType === 'per_unit').map((addon: any) => {
                          const city = (cities as any[]).find((c: any) => c.id === addon.cityId);
                          return (
                            <TableRow key={addon.id} className="h-12">
                              <TableCell>
                                <div className="font-medium text-sm">{addon.name}</div>
                                <div className="text-xs text-gray-500">{addon.description}</div>
                              </TableCell>
                              <TableCell>
                                {city ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {city.name}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-gray-500">
                                    All Cities
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {addon.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">EGP {addon.price}</TableCell>
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
                                    onClick={() => handleDeleteClick(addon, 'addon')}
                                    title="Delete add-on"
                                  >
                                    <Trash2 className="w-3 h-3" />
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
              </div>
            )}

            {activeSection === 'routes' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      <span>Routes</span>
                      {selectedCityForRoutes && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <Badge variant="outline">
                            {(cities as any[]).find((c: any) => c.id === selectedCityForRoutes)?.name || 'Selected City'}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setModalType('route');
                        setIsAddModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add route
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Distance</TableHead>
                        <TableHead>Vehicle Types</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(routes as any[])
                        .filter((route: any) => {
                          // If no city is selected, show all routes
                          if (!selectedCityForRoutes) return true;
                          // Show routes that start from or go to the selected city
                          return route.fromCityId === selectedCityForRoutes || route.toCityId === selectedCityForRoutes;
                        })
                        .map((route: any) => (
                        <TableRow key={route.id} className="h-12">
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">
                              {route.displayOrder || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {(() => {
                                // Priority: 1. Custom name, 2. Location names for intra-city, 3. City names for inter-city
                                if (route.name) {
                                  return route.name;
                                }
                                
                                if (route.fromCityId === route.toCityId) {
                                  // Intra-city route
                                  if (route.fromLocation && route.toLocation) {
                                    return `${route.fromLocation} → ${route.toLocation}`;
                                  } else {
                                    const cityName = (cities as any[]).find((c: any) => c.id === route.fromCityId)?.name || 'Unknown';
                                    return `${cityName} City Tour`;
                                  }
                                } else {
                                  // Inter-city route
                                  const fromCity = (cities as any[]).find((c: any) => c.id === route.fromCityId)?.name || 'Unknown';
                                  const toCity = (cities as any[]).find((c: any) => c.id === route.toCityId)?.name || 'Unknown';
                                  return `${fromCity} → ${toCity}`;
                                }
                              })()}
                            </div>
                            {route.fromLocation && route.toLocation && (
                              <div className="text-xs text-gray-500 mt-1">
                                {route.fromLocation && route.toLocation
                                  ? `${route.fromLocation} → ${route.toLocation}`
                                  : `${(cities as any[]).find((c: any) => c.id === route.fromCityId)?.name || 'Unknown'} → ${(cities as any[]).find((c: any) => c.id === route.toCityId)?.name || 'Unknown'}`
                                }
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {route.fromCityId === route.toCityId ? 'intra-city' : 'inter-city'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{route.km} km</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {route.basePriceByVehicle && Object.keys(route.basePriceByVehicle).map((vehicleId: string) => {
                                const vehicle = (vehicles as any[]).find((v: any) => v.id.toString() === vehicleId);
                                return vehicle ? (
                                  <Badge key={vehicleId} variant="secondary" className="text-xs">
                                    {vehicle.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            <div className="space-y-1">
                              {(() => {
                                if (route.basePriceByVehicle && typeof route.basePriceByVehicle === 'object') {
                                  const prices = [];
                                  // Check for sedan pricing (vehicle ID 1)
                                  if (route.basePriceByVehicle['1']?.['1']) {
                                    prices.push(`Sedan: ${route.basePriceByVehicle['1']['1']} EGP`);
                                  }
                                  // Check for minivan pricing (vehicle ID 2)
                                  if (route.basePriceByVehicle['2']?.['1']) {
                                    prices.push(`Minivan: ${route.basePriceByVehicle['2']['1']} EGP`);
                                  }
                                  // Check for van pricing (vehicle ID 3)
                                  if (route.basePriceByVehicle['3']?.['1']) {
                                    prices.push(`Van: ${route.basePriceByVehicle['3']['1']} EGP`);
                                  }
                                  
                                  return prices.length > 0 ? prices.map((price, index) => (
                                    <div key={index}>{price}</div>
                                  )) : 'No pricing set';
                                }
                                return 'No pricing set';
                              })()}
                            </div>
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
                                onClick={() => handleDeleteClick(route, 'route')}
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
                <CardContent>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Attraction</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Ticket Price</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(attractions as any[]).map((attraction: any) => (
                        <TableRow key={attraction.id} className="h-12">
                          <TableCell>
                            <div className="font-medium text-sm">{attraction.name}</div>
                            <div className="text-xs text-gray-500">{attraction.location}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              {(cities as any[]).find((city: any) => city.id === attraction.cityId)?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">EGP {attraction.ticketPrice}</TableCell>
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
                                onClick={() => handleDeleteClick(attraction, 'attraction')}
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

            {activeSection === 'bookings' && (
              <AdminBookings />
            )}

            {activeSection === 'reviews' && (
              <AdminReviews />
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit' : 'Add'} {modalType === 'city' ? 'City' : modalType === 'vehicle' ? 'Vehicle' : modalType === 'guide' ? 'Guide' : modalType === 'addon' ? 'Add-on' : modalType === 'route' ? 'Route' : 'Attraction'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Common fields */}
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

              {/* City specific fields */}
              {modalType === 'city' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="cairo"
                  />
                </div>
              )}

              {/* Vehicle specific fields */}
              {modalType === 'vehicle' && (
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
              )}

              {/* Guide specific fields */}
              {modalType === 'guide' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <Input
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      placeholder="English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Daily Price (EGP)</label>
                    <Input
                      type="number"
                      value={formData.pricePerHour}
                      onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.cityId}
                      onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                    >
                      <option value="">Select City</option>
                      {(cities as any[]).map((city: any) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Add-on specific fields */}
              {modalType === 'addon' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (EGP)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="375"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.unitType}
                      onChange={(e) => setFormData({...formData, unitType: e.target.value})}
                    >
                      <option value="per_unit">Per Unit</option>
                      <option value="per_person">Per Person</option>
                      <option value="per_trip">Per Trip</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="service"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.cityId}
                      onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                    >
                      <option value="">All Cities</option>
                      {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Attraction specific fields */}
              {modalType === 'attraction' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
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
                    <label className="block text-sm font-medium mb-1">Ticket Price (EGP)</label>
                    <Input
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                      placeholder="500"
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
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Giza Plateau"
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
                </div>
              )}

              {/* Route specific fields */}
              {modalType === 'route' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Route Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.routeType}
                      onChange={(e) => setFormData({...formData, routeType: e.target.value})}
                    >
                      <option value="inter-city">Inter-city</option>
                      <option value="intra-city">Intra-city</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Order</label>
                    <Input
                      type="number"
                      value={formData.displayOrder || ''}
                      onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first in the pricing tool</p>
                  </div>
                  
                  {formData.routeType === 'inter-city' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">From City</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={formData.fromCityId}
                          onChange={(e) => {
                            console.log('From City selected:', e.target.value);
                            setFormData({...formData, fromCityId: e.target.value});
                          }}
                        >
                          <option value="">Select City</option>
                          {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">To City</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={formData.toCityId}
                          onChange={(e) => {
                            console.log('To City selected:', e.target.value);
                            setFormData({...formData, toCityId: e.target.value});
                          }}
                        >
                          <option value="">Select City</option>
                          {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={formData.fromCityId}
                          onChange={(e) => {
                            console.log('Intra-city City selected:', e.target.value);
                            setFormData({...formData, fromCityId: e.target.value, toCityId: e.target.value});
                          }}
                        >
                          <option value="">Select City</option>
                          {(cities as any[])?.sort((a: any, b: any) => a.name.localeCompare(b.name)).map((city: any) => (
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
                            placeholder="Hotel District"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">To Location</label>
                          <Input
                            value={formData.toLocation}
                            onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                            placeholder="Airport"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Distance (km)</label>
                    <Input
                      type="number"
                      value={formData.km}
                      onChange={(e) => setFormData({...formData, km: e.target.value})}
                      placeholder="302"
                    />
                  </div>
                  
                  {/* Vehicle Pricing Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Vehicle Pricing (EGP)</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {(vehicles as any[])
                          .sort((a, b) => {
                            const order = ['Sedan', 'Minivan', 'Van', 'Coach'];
                            return order.indexOf(a.name) - order.indexOf(b.name);
                          })
                          .map((vehicle: any) => (
                          <div key={vehicle.id} className="grid grid-cols-2 gap-2 items-center">
                            <div className="text-sm font-medium">{vehicle.name}</div>
                            <div>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price (EGP)"
                                value={formData.vehiclePricing?.[vehicle.id]?.['1'] || ''}
                                onChange={(e) => {
                                  const newPricing = { ...formData.vehiclePricing };
                                  if (!newPricing[vehicle.id]) newPricing[vehicle.id] = {};
                                  newPricing[vehicle.id]['1'] = e.target.value;
                                  setFormData({...formData, vehiclePricing: newPricing});
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Set pricing for each vehicle type in EGP.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-teal-600 hover:bg-teal-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
              <p className="text-sm text-gray-600 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}