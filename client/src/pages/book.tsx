import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, User, Mail, Phone, Calendar, Users, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  travelDate: z.string().min(1, "Please select a travel date"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse URL parameters for fallback quote data
  const urlParams = new URLSearchParams(search);
  const fallbackQuote = {
    total: urlParams.get('total') || '0',
    travelers: parseInt(urlParams.get('travelers') || '1'),
    cities: urlParams.get('cities')?.split(',') || []
  };

  // Fetch quote if ID is provided
  const { data: quote, isLoading } = useQuery({
    queryKey: ["/api/quotes", params.id],
    enabled: !!params.id,
    retry: false,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      travelDate: "",
      specialRequests: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData & { quoteId?: number }) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Created Successfully",
        description: `Your booking reference is ${booking.bookingReference}`,
      });
      setLocation(`/booking/${booking.bookingReference}`);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsProcessing(true);
    try {
      await bookingMutation.mutateAsync({
        ...data,
        quoteId: quote?.id || undefined,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const displayQuote = quote || fallbackQuote;
  const totalAmount = quote?.total || fallbackQuote.total;
  const travelers = quote?.passengers || fallbackQuote.travelers;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
        <p className="text-muted-foreground">
          Please provide your details to confirm your Egypt travel booking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full px-3 py-2 border border-input rounded-md resize-none"
                            rows={3}
                            placeholder="Any special requirements or requests..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isProcessing || bookingMutation.isPending}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Confirm Booking - ${totalAmount}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Travelers
                </span>
                <Badge variant="secondary">{travelers}</Badge>
              </div>

              {/* Booking Items Display */}
              <div className="space-y-3">
                <h4 className="font-medium">Your Booking</h4>
                
                {quote && quote.itinerary && (
                  <div className="space-y-3">
                    {JSON.parse(quote.itinerary).map((city: any, index: number) => (
                      <div key={index} className="border rounded-md p-3 space-y-2">
                        <div className="font-medium text-sm">{city.cityName}</div>
                        
                        {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Transportation</div>
                            {city.selectedRoutes.map((route: any, rIndex: number) => (
                              <div key={rIndex} className="text-xs text-muted-foreground">
                                {route.fromLocation} → {route.toLocation}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {city.selectedGuide && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Guide Service</div>
                            <div className="text-xs text-muted-foreground">
                              {city.selectedGuide.language} guide - {city.selectedGuide.duration} hours
                            </div>
                          </div>
                        )}
                        
                        {city.attractions && city.attractions.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Attractions</div>
                            {city.attractions.map((attraction: string, aIndex: number) => (
                              <div key={aIndex} className="text-xs text-muted-foreground">
                                {attraction}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {city.selectedAddOns && city.selectedAddOns.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">Add-ons</div>
                            {city.selectedAddOns.map((addOn: any, aoIndex: number) => (
                              <div key={aoIndex} className="text-xs text-muted-foreground">
                                {addOn.name} x{addOn.quantity}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {fallbackQuote.cities.length > 0 && !quote && (
                  <div>
                    <div className="space-y-1">
                      {fallbackQuote.cities.map((city, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {city}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes & Fees</span>
                  <span>$0</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalAmount}</span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
                <p className="mb-1">💰 No payment required now</p>
                <p>Pay directly to your guide upon service completion</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}