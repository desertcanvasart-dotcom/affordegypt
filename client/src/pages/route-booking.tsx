import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Clock, Users, Calendar, Phone, Mail, MessageSquare, CheckCircle, Download, ArrowRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Route {
  id: number;
  fromCityId: number;
  toCityId: number;
  name?: string;
  description?: string;
  km?: string;
  estimatedDuration?: string;
  displayOrder?: number;
  sedanPrice?: string;
  minivanPrice?: string;
  vanPrice?: string;
}

interface City {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface VehicleType {
  id: number;
  name: string;
  description?: string;
  paxMin: number;
  paxMax: number;
}

export default function RouteBooking() {
  const [match, params] = useRoute("/routes/book/:routeId");
  const routeId = params?.routeId ? parseInt(params.routeId) : null;
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const { toast } = useToast();

  const { data: routes } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
  });

  const { data: vehicleTypes } = useQuery({
    queryKey: ["/api/vehicle-types"],
  });

  // Find the selected route
  const selectedRoute = routes && Array.isArray(routes) ? 
    (routes as Route[]).find((route: Route) => route.id === routeId) : undefined;
  

  
  // Helper functions
  const getCityName = (cityId: number) => {
    if (!cities) return 'Unknown';
    const city = (cities as City[]).find(c => c.id === cityId);
    return city?.name || 'Unknown';
  };

  const getVehiclePrice = (vehicleType: string) => {
    if (!selectedRoute) return "0";
    switch (vehicleType.toLowerCase()) {
      case 'sedan':
        return selectedRoute.sedanPrice || "0";
      case 'minivan':
        return selectedRoute.minivanPrice || "0";
      case 'van':
        return selectedRoute.vanPrice || "0";
      default:
        return "0";
    }
  };

  const calculateTotal = () => {
    const basePrice = parseFloat(getVehiclePrice(selectedVehicle));
    return basePrice;
  };

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/route-bookings", bookingData);
    },
    onSuccess: (data) => {
      // Store booking confirmation data
      const confirmationData = {
        ...data,
        route: selectedRoute,
        vehicleType: selectedVehicle,
        passengers,
        travelDate,
        customerName,
        customerEmail,
        customerPhone,
        specialRequests,
        totalAmount: calculateTotal(),
        submittedAt: new Date().toISOString()
      };
      
      setBookingData(confirmationData);
      setBookingConfirmed(true);
      
      toast({
        title: "Booking Submitted Successfully",
        description: "Your booking confirmation is ready to download.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoute || !selectedVehicle || !travelDate || !customerName || !customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      routeId: selectedRoute.id,
      vehicleType: selectedVehicle,
      passengers,
      travelDate,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
      totalAmount: calculateTotal(),
      bookingType: 'route-only'
    };

    bookingMutation.mutate(bookingData);
  };

  const downloadConfirmation = () => {
    if (!bookingData) return;
    
    const confirmationText = `
BOOKING CONFIRMATION
Afford Egypt Transportation Services

Booking Reference: ${bookingData.bookingReference || 'RT-' + Date.now()}
Booking Date: ${new Date(bookingData.submittedAt).toLocaleDateString()}

ROUTE DETAILS
From: ${getCityName(bookingData.route.fromCityId)}
To: ${getCityName(bookingData.route.toCityId)}
${bookingData.route.name ? `Route: ${bookingData.route.name}` : ''}
${bookingData.route.km ? `Distance: ${bookingData.route.km} km` : ''}
${bookingData.route.estimatedDuration ? `Duration: ${bookingData.route.estimatedDuration}` : ''}

BOOKING DETAILS
Vehicle Type: ${bookingData.vehicleType.charAt(0).toUpperCase() + bookingData.vehicleType.slice(1)}
Passengers: ${bookingData.passengers}
Travel Date: ${new Date(bookingData.travelDate).toLocaleDateString()}
Total Amount: $${bookingData.totalAmount}

CUSTOMER INFORMATION
Name: ${bookingData.customerName}
Email: ${bookingData.customerEmail}
Phone: ${bookingData.customerPhone}
${bookingData.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ''}

NEXT STEPS
1. We will contact you within 24 hours to confirm your booking
2. Payment will be processed upon confirmation
3. You will receive driver details 24 hours before travel
4. For any changes, contact us at support@affordegypt.com

Thank you for choosing Afford Egypt!
Website: affordegypt.com
Phone: +20 123 456 7890
Email: support@affordegypt.com
    `;

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${bookingData.bookingReference || 'RT-' + Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyBookingReference = () => {
    const reference = bookingData?.bookingReference || 'RT-' + Date.now();
    navigator.clipboard.writeText(reference);
    toast({
      title: "Copied to clipboard",
      description: "Booking reference copied successfully",
    });
  };

  const startNewBooking = () => {
    setBookingConfirmed(false);
    setBookingData(null);
    setSelectedVehicle("");
    setPassengers(2);
    setTravelDate("");
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSpecialRequests("");
  };

  if (!selectedRoute) {
    return (
      <>
        <Helmet>
          <title>Route Not Found | Afford Egypt</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Route Not Found</h1>
                <p className="text-gray-600 mb-6">The requested route could not be found.</p>
                <Link href="/routes">
                  <Button>Browse All Routes</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Show confirmation screen after successful booking
  if (bookingConfirmed && bookingData) {
    return (
      <>
        <Helmet>
          <title>Booking Confirmed | Afford Egypt</title>
          <meta name="description" content="Your transportation booking has been confirmed. Download your confirmation and review next steps." />
        </Helmet>
        
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-lg text-gray-600">Your transportation request has been submitted successfully</p>
            </div>

            {/* Booking Reference */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Booking Reference</h3>
                    <p className="text-2xl font-mono text-teal-600">{bookingData.bookingReference || 'RT-' + Date.now()}</p>
                  </div>
                  <Button variant="outline" onClick={copyBookingReference} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    Route Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">From:</span> {getCityName(bookingData.route.fromCityId)}
                    </div>
                    <div>
                      <span className="font-medium">To:</span> {getCityName(bookingData.route.toCityId)}
                    </div>
                    {bookingData.route.name && (
                      <div>
                        <span className="font-medium">Route:</span> {bookingData.route.name}
                      </div>
                    )}
                    {bookingData.route.km && (
                      <div>
                        <span className="font-medium">Distance:</span> {bookingData.route.km} km
                      </div>
                    )}
                    {bookingData.route.estimatedDuration && (
                      <div>
                        <span className="font-medium">Duration:</span> {bookingData.route.estimatedDuration}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-teal-600" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Vehicle:</span> {bookingData.vehicleType.charAt(0).toUpperCase() + bookingData.vehicleType.slice(1)}
                    </div>
                    <div>
                      <span className="font-medium">Passengers:</span> {bookingData.passengers}
                    </div>
                    <div>
                      <span className="font-medium">Travel Date:</span> {new Date(bookingData.travelDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Total Amount:</span> <span className="text-lg font-bold text-teal-600">${bookingData.totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Name:</span> {bookingData.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {bookingData.customerEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {bookingData.customerPhone}
                  </div>
                  {bookingData.specialRequests && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Special Requests:</span> {bookingData.specialRequests}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-600" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h4 className="font-medium">Confirmation Call</h4>
                      <p className="text-gray-600">We'll contact you within 24 hours to confirm your booking details and arrange payment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h4 className="font-medium">Payment Processing</h4>
                      <p className="text-gray-600">Payment will be processed securely upon booking confirmation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Driver Assignment</h4>
                      <p className="text-gray-600">You'll receive driver details and contact information 24 hours before your trip.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={downloadConfirmation} className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download Confirmation
              </Button>
              <Button variant="outline" onClick={startNewBooking}>
                Book Another Route
              </Button>
              <Link href="/">
                <Button variant="outline">
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Contact Information */}
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">Contact us for any questions or changes to your booking</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-teal-600" />
                    +20 123 456 7890
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-teal-600" />
                    support@affordegypt.com
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Book Transportation: {getCityName(selectedRoute.fromCityId)} to {getCityName(selectedRoute.toCityId)} | Afford Egypt</title>
        <meta name="description" content={`Book reliable transportation from ${getCityName(selectedRoute.fromCityId)} to ${getCityName(selectedRoute.toCityId)}. Professional drivers, competitive prices, flexible scheduling.`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Route Details */}
            <Card>
              <CardHeader className="bg-teal-50">
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-6 h-6 text-teal-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    <div>
                      <div className="font-semibold">
                        {getCityName(selectedRoute.fromCityId)} → {getCityName(selectedRoute.toCityId)}
                      </div>
                      {selectedRoute.name && (
                        <div className="text-sm text-gray-600">{selectedRoute.name}</div>
                      )}
                    </div>
                  </div>
                  
                  {selectedRoute.km && (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5" />
                      <div className="text-sm">
                        <span className="font-medium">Distance:</span> {selectedRoute.km} km
                      </div>
                    </div>
                  )}
                  
                  {selectedRoute.estimatedDuration && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-teal-600" />
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span> {selectedRoute.estimatedDuration}
                      </div>
                    </div>
                  )}
                  
                  {selectedRoute.description && (
                    <div className="pt-2">
                      <p className="text-gray-600 text-sm">{selectedRoute.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Book Your Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Vehicle Selection */}
                  <div>
                    <Label>Vehicle Type *</Label>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose vehicle type" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {selectedRoute?.sedanPrice && (
                          <SelectItem value="sedan">
                            Sedan - ${selectedRoute.sedanPrice}
                          </SelectItem>
                        )}
                        {selectedRoute?.minivanPrice && (
                          <SelectItem value="minivan">
                            Minivan - ${selectedRoute.minivanPrice}
                          </SelectItem>
                        )}
                        {selectedRoute?.vanPrice && (
                          <SelectItem value="van">
                            Van - ${selectedRoute.vanPrice}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label>Number of Passengers *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="15"
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Travel Date */}
                  <div>
                    <Label>Travel Date *</Label>
                    <Input
                      type="date"
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Customer Details */}
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label>Special Requests</Label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requirements or requests..."
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  {selectedVehicle && (
                    <div className="bg-teal-50 p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Cost:</span>
                        <span className="text-2xl font-bold text-teal-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Transportation only • No hidden fees
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={bookingMutation.isPending}
                  >
                    {bookingMutation.isPending ? "Submitting..." : "Book Transportation"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our booking terms. 
                    We'll contact you to confirm details and payment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Need Full Service? */}
          <Card className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Need a Complete Travel Package?</h3>
                <p className="text-gray-600 mb-4">
                  Add tour guides, attractions, and more with our comprehensive pricing tool
                </p>
                <Link href="/#quote-builder">
                  <Button variant="outline" className="border-orange-200 hover:bg-orange-100">
                    Build Complete Package
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}