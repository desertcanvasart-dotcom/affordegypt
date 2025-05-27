import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, MapPin, Camera, Clock, Users, Star, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Attraction {
  id: number;
  cityId: number;
  name: string;
  description: string;
  category: string;
  duration: number; // in hours
  ticketPrice: number;
  isActive: boolean;
  image?: string;
  coordinates?: string;
  bestTimeToVisit?: string;
  capacity?: number;
}

interface City {
  id: number;
  name: string;
  slug: string;
}

export default function AttractionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | "all">("all");
  const [formData, setFormData] = useState({
    cityId: "",
    name: "",
    description: "",
    category: "",
    duration: "",
    ticketPrice: "",
    isActive: true,
    image: "",
    coordinates: "",
    bestTimeToVisit: "",
    capacity: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attractions
  const { data: attractions = [], isLoading: attractionsLoading } = useQuery({
    queryKey: ["/api/attractions"],
  });

  // Fetch cities
  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  // Create attraction mutation
  const createAttractionMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/attractions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction created successfully!" });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create attraction", variant: "destructive" });
    }
  });

  // Update attraction mutation
  const updateAttractionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/attractions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction updated successfully!" });
      setEditingAttraction(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update attraction", variant: "destructive" });
    }
  });

  // Delete attraction mutation
  const deleteAttractionMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/attractions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      toast({ title: "Success", description: "Attraction deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete attraction", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setFormData({
      cityId: "",
      name: "",
      description: "",
      category: "",
      duration: "",
      ticketPrice: "",
      isActive: true,
      image: "",
      coordinates: "",
      bestTimeToVisit: "",
      capacity: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      cityId: parseInt(formData.cityId),
      duration: parseInt(formData.duration) || 2,
      ticketPrice: parseFloat(formData.ticketPrice) || 0,
      capacity: formData.capacity ? parseInt(formData.capacity) : null
    };

    if (editingAttraction) {
      updateAttractionMutation.mutate({ id: editingAttraction.id, data: submitData });
    } else {
      createAttractionMutation.mutate(submitData);
    }
  };

  const handleEdit = (attraction: Attraction) => {
    setEditingAttraction(attraction);
    setFormData({
      cityId: attraction.cityId.toString(),
      name: attraction.name,
      description: attraction.description,
      category: attraction.category,
      duration: attraction.duration.toString(),
      ticketPrice: attraction.ticketPrice.toString(),
      isActive: attraction.isActive,
      image: attraction.image || "",
      coordinates: attraction.coordinates || "",
      bestTimeToVisit: attraction.bestTimeToVisit || "",
      capacity: attraction.capacity?.toString() || ""
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this attraction?")) {
      deleteAttractionMutation.mutate(id);
    }
  };

  const filteredAttractions = selectedCity === "all" 
    ? attractions 
    : attractions.filter((attr: Attraction) => attr.cityId === selectedCity);

  const getCityName = (cityId: number) => {
    const city = cities.find((c: City) => c.id === cityId);
    return city?.name || "Unknown";
  };

  const categories = [
    "Historical Site",
    "Museum",
    "Religious Site", 
    "Natural Wonder",
    "Cultural Experience",
    "Entertainment",
    "Market/Bazaar",
    "Architecture",
    "Archaeological Site",
    "Monument"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Attractions Management</h1>
              <p className="text-sm text-gray-600">Manage attractions and link them to specific cities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats and Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Manage Attractions</h2>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                resetForm();
                setEditingAttraction(null);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Attraction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAttraction ? "Edit Attraction" : "Add New Attraction"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cityId">City *</Label>
                        <Select value={formData.cityId} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, cityId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: City) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">Attraction Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Pyramids of Giza"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the attraction..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Visit Duration (hours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="2"
                          min="1"
                          max="24"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="ticketPrice">Ticket Price (EGP)</Label>
                        <Input
                          id="ticketPrice"
                          type="number"
                          step="0.01"
                          value={formData.ticketPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                          placeholder="0.00"
                          min="0"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <Label htmlFor="coordinates">GPS Coordinates</Label>
                      <Input
                        id="coordinates"
                        value={formData.coordinates}
                        onChange={(e) => setFormData(prev => ({ ...prev, coordinates: e.target.value }))}
                        placeholder="29.9792, 31.1342"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bestTimeToVisit">Best Time to Visit</Label>
                        <Input
                          id="bestTimeToVisit"
                          value={formData.bestTimeToVisit}
                          onChange={(e) => setFormData(prev => ({ ...prev, bestTimeToVisit: e.target.value }))}
                          placeholder="Morning, Evening, etc."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="capacity">Max Capacity</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Optional"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={createAttractionMutation.isPending || updateAttractionMutation.isPending}
                  >
                    {editingAttraction ? "Update" : "Create"} Attraction
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Label>Filter by City:</Label>
              </div>
              <Select value={selectedCity.toString()} onValueChange={(value) => 
                setSelectedCity(value === "all" ? "all" : parseInt(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city: City) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                {filteredAttractions.length} attraction{filteredAttractions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Attractions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attractions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {attractionsLoading ? (
              <div className="p-8 text-center text-gray-500">Loading attractions...</div>
            ) : filteredAttractions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No attractions found. Add your first attraction to get started!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Ticket Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttractions.map((attraction: Attraction) => (
                    <TableRow key={attraction.id}>
                      <TableCell>
                        <div className="font-medium">{attraction.name}</div>
                        {attraction.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {attraction.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCityName(attraction.cityId)}</Badge>
                      </TableCell>
                      <TableCell>{attraction.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{attraction.duration}h</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {attraction.ticketPrice > 0 ? `${attraction.ticketPrice} EGP` : "Free"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attraction.isActive ? "default" : "secondary"}>
                          {attraction.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(attraction)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(attraction.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="text-2xl font-bold">{attractions.length}</div>
                  <div className="text-sm text-gray-500">Total Attractions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{cities.length}</div>
                  <div className="text-sm text-gray-500">Cities with Attractions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {attractions.filter((a: Attraction) => a.isActive).length}
                  </div>
                  <div className="text-sm text-gray-500">Active Attractions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {new Set(attractions.map((a: Attraction) => a.category)).size}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}