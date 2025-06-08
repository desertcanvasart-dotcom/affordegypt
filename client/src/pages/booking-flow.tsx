import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, MapPin, CreditCard, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  startDate: string;
  totalTravelers: number;
}

export default function BookingFlow() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/booking/:quoteId");
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
    startDate: "",
    totalTravelers: 1
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch quote details
  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuery({
    queryKey: ["/api/quotes", params?.quoteId],
    enabled: !!params?.quoteId,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully!",
      });
      setLocation(`/booking-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof BookingData, value: string | number) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(bookingData.firstName && bookingData.lastName && bookingData.email && bookingData.phone);
      case 2:
        return !!bookingData.startDate;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitBooking = async () => {
    if (!quote) return;
    
    setIsSubmitting(true);
    
    try {
      const bookingPayload = {
        quoteId: quote.id,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests,
        startDate: bookingData.startDate,
        totalTravelers: bookingData.totalTravelers,
        status: "pending_payment"
      };

      await createBookingMutation.mutateAsync(bookingPayload);
    } catch (error) {
      console.error("Booking submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quoteLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (quoteError || !quote) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Quote Not Found</h2>
              <p className="text-muted-foreground mb-6">The quote you're looking for doesn't exist or has expired.</p>
              <Button onClick={() => setLocation("/")}>Return Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const quoteData = JSON.parse(quote.jsonBlob);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing Tool
          </Button>
          <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          <p className="text-muted-foreground">Secure your Egypt adventure with a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ${
                    step < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={bookingData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={bookingData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelers">Number of Travelers</Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      max="20"
                      value={bookingData.totalTravelers}
                      onChange={(e) => handleInputChange("totalTravelers", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleNext}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Travel Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Preferred Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Textarea
                      id="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder="Any dietary restrictions, accessibility needs, or special occasions we should know about..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={handleNext}>Continue</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Confirm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{bookingData.firstName} {bookingData.lastName}</p>
                      <p>{bookingData.email}</p>
                      <p>{bookingData.phone}</p>
                      <p>{bookingData.totalTravelers} traveler{bookingData.totalTravelers > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Travel Details</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Start Date: {new Date(bookingData.startDate).toLocaleDateString()}</p>
                      {bookingData.specialRequests && (
                        <p>Special Requests: {bookingData.specialRequests}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Terms and Conditions Agreement */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                        className="mt-1"
                      />
                      <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        I have reviewed and agree to the{" "}
                        <a 
                          href="/terms-of-service" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a 
                          href="/booking-agreement" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          Booking Agreement
                        </a>{" "}
                        before confirming my booking.
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmitBooking}
                      disabled={isSubmitting || !termsAccepted}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      {isSubmitting ? "Processing..." : "Proceed to Payment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{bookingData.totalTravelers} traveler{bookingData.totalTravelers > 1 ? 's' : ''}</span>
                </div>
                
                {bookingData.startDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(bookingData.startDate).toLocaleDateString()}</span>
                  </div>
                )}

                <Separator />

                {/* Itinerary Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Your Itinerary</h4>
                  {quoteData.cityServices?.map((city: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{city.cityName}</span>
                      <Badge variant="secondary" className="text-xs">
                        Day {index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-mono">${quote.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Commission ({quote.commissionPct}%):</span>
                    <span className="font-mono">
                      ${Math.round(parseFloat(quote.total) * parseFloat(quote.commissionPct) / 100)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="font-mono text-primary">
                      ${Math.round(parseFloat(quote.total) * (1 + parseFloat(quote.commissionPct) / 100))}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Per person: ${Math.round(parseFloat(quote.total) * (1 + parseFloat(quote.commissionPct) / 100) / bookingData.totalTravelers)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}