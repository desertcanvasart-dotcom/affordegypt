import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import SeoMeta from "@/components/seo-meta";

export default function AttractionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cityId: "",
    category: "",
    duration: "",
    ticketPrice: "",
    openingHours: "",
    location: ""
  });
  
  const { data: attractions = [] } = useQuery({
    queryKey: ["/api/attractions"],
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/attractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create attraction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Attraction created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create attraction",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      cityId: "",
      category: "",
      duration: "",
      ticketPrice: "",
      openingHours: "",
      location: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      description: formData.description,
      cityId: parseInt(formData.cityId),
      category: formData.category,
      duration: parseInt(formData.duration) || 2, // Convert to integer hours
      ticketPrice: parseFloat(formData.ticketPrice) || 0,
      isActive: true
    };
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
  <SeoMeta
          title="Egypt Attractions & Entrance Fees | Real Prices, No Markup"
          description="Pyramids, Karnak, Valley of the Kings, Abu Simbel, and dozens more. Real ticket prices, average duration, and how to combine attractions into an efficient itinerary. Book private guide service from LE 5,000/day."
          canonical="https://affordegypt.com/attractions"
        />
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
          <Card>
            <CardHeader>
              <CardTitle>Attractions Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{`Total Attractions: ${Array.isArray(attractions) ? attractions.length : 0}`}</p>
                <p>{`Total Cities: ${Array.isArray(cities) ? cities.length : 0}`}</p>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
                      resetForm();
                      setIsModalOpen(true);
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Attraction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Attraction</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Pyramids of Giza"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Ancient pyramids complex"
                        />
                      </div>

                      <div>
                        <Label htmlFor="cityId">City</Label>
                        <select
                          id="cityId"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          value={formData.cityId}
                          onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                          required
                        >
                          <option value="">Select City</option>
                          {(cities as any[]).map((city: any) => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          placeholder="Historical"
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration">Duration (hours)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          placeholder="2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="ticketPrice">Ticket Price (EGP)</Label>
                        <Input
                          id="ticketPrice"
                          type="number"
                          step="0.01"
                          value={formData.ticketPrice}
                          onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                          placeholder="25.00"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createMutation.isPending}>
                          {createMutation.isPending ? "Creating..." : "Create Attraction"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}