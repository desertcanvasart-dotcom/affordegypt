import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, Users, Car, UserCheck, Plus, ArrowRight, ArrowLeft, Calculator } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface City {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface VehicleType {
  id: number;
  name: string;
  description: string | null;
  paxMin: number;
  paxMax: number;
  image: string | null;
}

interface GuideRate {
  id: number;
  name: string;
  language: string;
  hourlyPrice: string;
  rating: string | null;
  cityId: number;
  image: string | null;
}

interface AddOn {
  id: number;
  name: string;
  description: string | null;
  price: string;
  unitType: string;
  category: string;
  cityId: number | null;
  image: string | null;
}

interface QuoteData {
  passengers: number;
  itinerary: any[];
  guides: any[];
  addons: any[];
}

export default function QuoteBuilderWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState<QuoteData>({
    passengers: 2,
    itinerary: [],
    guides: [],
    addons: []
  });
  const [pricing, setPricing] = useState<any>(null);

  // Fetch data
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["/api/cities"],
  });

  const { data: vehicleTypes = [] } = useQuery<VehicleType[]>({
    queryKey: ["/api/vehicle-types"],
  });

  const { data: guideRates = [] } = useQuery<GuideRate[]>({
    queryKey: ["/api/guide-rates"],
  });

  const { data: addOns = [] } = useQuery<AddOn[]>({
    queryKey: ["/api/add-ons"],
  });

  // Calculate pricing mutation
  const pricingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/calculate-pricing", data);
      return response.json();
    },
    onSuccess: (data) => {
      setPricing(data);
    }
  });

  // Update pricing when quote data changes
  useEffect(() => {
    if (quoteData.itinerary.length > 0 || quoteData.addons.length > 0) {
      pricingMutation.mutate({
        itinerary: quoteData.itinerary,
        addons: quoteData.addons,
        passengers: quoteData.passengers
      });
    }
  }, [quoteData]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addItineraryItem = (type: string, data: any) => {
    setQuoteData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { ...data, mode: type }]
    }));
  };

  const addGuide = (guide: GuideRate, hours: number) => {
    setQuoteData(prev => ({
      ...prev,
      guides: [...prev.guides, { ...guide, hours }]
    }));
  };

  const addAddon = (addon: AddOn, quantity: number) => {
    setQuoteData(prev => ({
      ...prev,
      addons: [...prev.addons, { id: addon.id, quantity, name: addon.name, price: addon.price, unitType: addon.unitType }]
    }));
  };

  return (
    <div id="quote-builder" className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Build Your Egypt Adventure</h2>
        <p className="text-muted-foreground text-lg">Get an instant quote in 4 simple steps</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Wizard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`step-number ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {step}
                      </div>
                      {step < 4 && <div className="w-8 h-px bg-border mx-2" />}
                    </div>
                  ))}
                </div>
                <Badge variant="outline" className="font-mono">
                  Step {currentStep} of 4
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Travel Details</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Passengers</label>
                    <Select value={quoteData.passengers.toString()} onValueChange={(value) => 
                      setQuoteData(prev => ({ ...prev, passengers: parseInt(value) }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 border-2 border-primary cursor-pointer hover:bg-primary/5">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Route-Based Travel
                      </h4>
                      <p className="text-sm text-muted-foreground">Travel between cities with fixed pricing</p>
                    </Card>
                    
                    <Card className="p-4 border-2 hover:border-primary cursor-pointer hover:bg-primary/5">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Hourly City Tours
                      </h4>
                      <p className="text-sm text-muted-foreground">Explore cities with flexible timing</p>
                    </Card>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Car className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Transportation</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {vehicleTypes.map((vehicle) => (
                      <Card key={vehicle.id} className="p-4 border-2 hover:border-primary cursor-pointer hover:bg-primary/5">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{vehicle.name}</h4>
                            <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Capacity: {vehicle.paxMin}-{vehicle.paxMax} passengers
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="price-chip">From $50</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Tour Guides</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {guideRates.slice(0, 4).map((guide) => (
                      <Card key={guide.id} className="p-4 border-2 hover:border-primary cursor-pointer hover:bg-primary/5">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{guide.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {guide.language} • Rating: {guide.rating}/5
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="price-chip">${guide.hourlyPrice}/hr</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold">Add-ons & Experiences</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {addOns.slice(0, 6).map((addon) => (
                      <Card key={addon.id} className="p-4 border-2 hover:border-primary cursor-pointer hover:bg-primary/5">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{addon.name}</h4>
                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {addon.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="price-chip">${addon.price}</div>
                            <p className="text-xs text-muted-foreground mt-1">{addon.unitType}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <Button 
                  onClick={nextStep} 
                  disabled={currentStep === 4}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Pricing Sidebar */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Passengers:</span>
                <span className="font-mono font-semibold">{quoteData.passengers}</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Itinerary Items:</div>
                {quoteData.itinerary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                ) : (
                  quoteData.itinerary.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.mode} - Item {idx + 1}
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {pricing && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono">${pricing.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission ({pricing.commissionPct}%):</span>
                    <span className="font-mono">${pricing.commission}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="font-mono text-primary">${pricing.total}</span>
                  </div>
                </div>
              )}

              {!pricing && quoteData.itinerary.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Add items to see pricing</p>
                </div>
              )}

              {currentStep === 4 && pricing && (
                <Button className="w-full mt-4" size="lg">
                  Get Quote
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}