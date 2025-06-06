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
  const [deleteConfirm, setDeleteConfirm] = useState<{type: string, id: number, name: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
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
  const { data: cities } = useQuery({ queryKey: ['/api/cities'] });
  const { data: vehicles } = useQuery({ queryKey: ['/api/vehicle-types'] });
  const { data: guides } = useQuery({ queryKey: ['/api/guide-rates'] });
  const { data: addOns } = useQuery({ queryKey: ['/api/addons'] });
  const { data: routes } = useQuery({ queryKey: ['/api/routes'] });
  const { data: attractions } = useQuery({ queryKey: ['/api/attractions'] });

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const sessionAuth = sessionStorage.getItem('adminAuthenticated');
      const localAuth = localStorage.getItem('adminAuthenticated');
      if (sessionAuth === 'true' || localAuth === 'true') {
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (rememberMe: boolean) => {
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      sessionStorage.setItem('adminAuthenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminAuthenticated');
  };

  // Reset pagination when section changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
  }, [activeSection]);

  const endpoints = {
    city: '/api/cities',
    vehicle: '/api/vehicle-types',
    guide: '/api/guide-rates',
    addon: '/api/addons',
    route: '/api/routes',
    attraction: '/api/attractions'
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
    setEditingItem(null);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    setModalType(type as any);
    if (type === 'route') {
      setFormData({
        ...item,
        routeType: item.fromCityId === item.toCityId ? 'intra-city' : 'inter-city',
        vehiclePricing: item.basePriceByVehicle || {},
        basePriceByVehicle: JSON.stringify(item.basePriceByVehicle || {})
      });
    } else {
      setFormData(item);
    }
    setIsAddModalOpen(true);
  };

  const handleAdd = (type: string) => {
    resetForm();
    setModalType(type as any);
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (item: any, type: string) => {
    setDeleteConfirm({ type, id: item.id, name: item.name });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      setIsSubmitting(true);
      
      // Prepare payload based on the modal type
      const payload = modalType === 'city' ? {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        isActive: true
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
        category: formData.category || 'service'
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to ${editingItem ? 'update' : 'create'} ${modalType}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoints[modalType as keyof typeof endpoints]] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} ${editingItem ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: `Failed to ${editingItem ? 'update' : 'create'} ${modalType}`,
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteConfirm) return;
      
      const response = await fetch(`${endpoints[deleteConfirm.type as keyof typeof endpoints]}/${deleteConfirm.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete ${deleteConfirm.type}: ${errorText}`);
      }
    },
    onSuccess: () => {
      if (deleteConfirm) {
        queryClient.invalidateQueries({ queryKey: [endpoints[deleteConfirm.type as keyof typeof endpoints]] });
        toast({
          title: `${deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)} deleted successfully`,
        });
        setDeleteConfirm(null);
      }
    },
    onError: (error) => {
      toast({
        title: `Failed to delete ${deleteConfirm?.type}`,
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    mutation.mutate();
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your travel platform</p>
        </div>
        
        <nav className="mt-6">
          {[
            { key: 'cities', label: 'Cities', icon: MapPin },
            { key: 'vehicles', label: 'Vehicles', icon: Car },
            { key: 'routes', label: 'Routes', icon: Map },
            { key: 'guides', label: 'Guides', icon: Users },
            { key: 'addons', label: 'Add-ons', icon: Package },
            { key: 'attractions', label: 'Attractions', icon: Building2 }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                activeSection === key
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex-1 mr-2">
                View Site
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
              <p className="text-gray-600 mt-1">Manage your {activeSection}</p>
            </div>
            <Button onClick={() => handleAdd(activeSection.slice(0, -1))}>
              <Plus className="w-4 h-4 mr-2" />
              Add {activeSection.slice(0, -1).charAt(0).toUpperCase() + activeSection.slice(0, -1).slice(1)}
            </Button>
          </div>

          {/* Routes Section with Pagination */}
          {activeSection === 'routes' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Routes Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search routes..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-64"
                    />
                    <span className="text-sm text-gray-500">
                      {(() => {
                        const filteredRoutes = (routes as any[])?.filter((route: any) => {
                          if (!searchTerm) return true;
                          const routeName = route.name || 
                            (route.fromLocation && route.toLocation ? `${route.fromLocation} → ${route.toLocation}` : 
                             `${(cities as any[])?.find((c: any) => c.id === route.fromCityId)?.name || 'Unknown'} → ${(cities as any[])?.find((c: any) => c.id === route.toCityId)?.name || 'Unknown'}`);
                          return routeName.toLowerCase().includes(searchTerm.toLowerCase());
                        }) || [];
                        return `${filteredRoutes.length} routes`;
                      })()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Route</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Vehicle Types</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredRoutes = (routes as any[])?.filter((route: any) => {
                        if (!searchTerm) return true;
                        const routeName = route.name || 
                          (route.fromLocation && route.toLocation ? `${route.fromLocation} → ${route.toLocation}` : 
                           `${(cities as any[])?.find((c: any) => c.id === route.fromCityId)?.name || 'Unknown'} → ${(cities as any[])?.find((c: any) => c.id === route.toCityId)?.name || 'Unknown'}`);
                        return routeName.toLowerCase().includes(searchTerm.toLowerCase());
                      }) || [];
                      
                      const startIndex = (currentPage - 1) * pageSize;
                      const endIndex = startIndex + pageSize;
                      const paginatedRoutes = filteredRoutes.slice(startIndex, endIndex);
                      
                      return paginatedRoutes.map((route: any) => (
                        <TableRow key={route.id} className="h-12">
                          <TableCell>
                            <div className="text-sm">
                              {(() => {
                                if (route.name) {
                                  return route.name;
                                }
                                
                                if (route.fromCityId === route.toCityId) {
                                  if (route.fromLocation && route.toLocation) {
                                    return `${route.fromLocation} → ${route.toLocation}`;
                                  } else {
                                    const cityName = (cities as any[])?.find((c: any) => c.id === route.fromCityId)?.name || 'Unknown';
                                    return `${cityName} City Tour`;
                                  }
                                } else {
                                  const fromCity = (cities as any[])?.find((c: any) => c.id === route.fromCityId)?.name || 'Unknown';
                                  const toCity = (cities as any[])?.find((c: any) => c.id === route.toCityId)?.name || 'Unknown';
                                  return `${fromCity} → ${toCity}`;
                                }
                              })()}
                            </div>
                            {route.fromLocation && route.toLocation && (
                              <div className="text-xs text-gray-500 mt-1">
                                {route.fromLocation && route.toLocation
                                  ? `${route.fromLocation} → ${route.toLocation}`
                                  : ''
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
                                const vehicle = (vehicles as any[])?.find((v: any) => v.id.toString() === vehicleId);
                                return vehicle ? (
                                  <Badge key={vehicleId} variant="secondary" className="text-xs">
                                    {vehicle.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </TableCell>
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
                                onClick={() => handleDeleteClick(route, 'route')}
                                title="Delete route"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {(() => {
                  const filteredRoutes = (routes as any[])?.filter((route: any) => {
                    if (!searchTerm) return true;
                    const routeName = route.name || 
                      (route.fromLocation && route.toLocation ? `${route.fromLocation} → ${route.toLocation}` : 
                       `${(cities as any[])?.find((c: any) => c.id === route.fromCityId)?.name || 'Unknown'} → ${(cities as any[])?.find((c: any) => c.id === route.toCityId)?.name || 'Unknown'}`);
                    return routeName.toLowerCase().includes(searchTerm.toLowerCase());
                  }) || [];
                  
                  const totalPages = Math.ceil(filteredRoutes.length / pageSize);
                  
                  if (totalPages <= 1) return null;
                  
                  return (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredRoutes.length)} of {filteredRoutes.length} routes
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              const distance = Math.abs(page - currentPage);
                              return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                            })
                            .map((page, index, array) => {
                              const prevPage = array[index - 1];
                              const showEllipsis = prevPage && page - prevPage > 1;
                              
                              return (
                                <div key={page} className="flex items-center">
                                  {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                                  <Button
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {page}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Other sections remain the same as original file... */}
          
          {/* Add/Edit Modal */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder={`Enter ${modalType} name`}
                  />
                </div>

                {modalType === 'city' && (
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      placeholder="Enter URL slug"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={() => setIsAddModalOpen(false)} 
                    variant="outline" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p>Are you sure you want to delete "{deleteConfirm?.name}"?</p>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
                
                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={() => setDeleteConfirm(null)} 
                    variant="outline" 
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDeleteConfirm} 
                    variant="destructive" 
                    className="flex-1"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}