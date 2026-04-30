import { useState, useEffect } from "react";
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
import { MapPin, Car, Clock, Star, Users, Calendar, Phone, Mail, MessageSquare, CheckCircle, Download, ArrowRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { formatEGP } from "@/lib/utils";

interface Route {
  id: number;
  fromCityId: number;
  toCityId: number;
  name?: string;
  description?: string;
  km?: string;
  estimatedDuration?: string;
  routeHighlights?: string;
  travelTips?: string;
  pickupInstructions?: string;
  dropoffInstructions?: string;
  displayOrder?: number;
  sedanPrice?: string;
  minivanPrice?: string;
  vanPrice?: string;
  basePriceByVehicle?: any;
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
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);
  const routeId = params?.routeId ? parseInt(params.routeId) : pendingBookingData?.routeId;
  
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [travelDate, setTravelDate] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
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

  // Check for pending booking data and scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check for pending booking data from transfers page
    const pendingData = sessionStorage.getItem('pendingBooking');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        setPendingBookingData(data);
        setSelectedVehicle(data.vehicleType || "");
        setPassengers(data.passengers || 2);
        setTravelDate(data.travelDate || "");
        // Clear the session data after loading
        sessionStorage.removeItem('pendingBooking');
      } catch (error) {
        console.error('Error parsing pending booking data:', error);
      }
    }
  }, []);

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
    if (!selectedRoute) {
      // If no route selected but we have pending booking data, use that total
      return pendingBookingData?.totalAmount?.toString() || "0";
    }
    
    // Try to get price from basePriceByVehicle object
    if ((selectedRoute as any).basePriceByVehicle && typeof (selectedRoute as any).basePriceByVehicle === 'object') {
      const price = (selectedRoute as any).basePriceByVehicle[vehicleType];
      if (typeof price === 'number' && price > 0) return price.toString();
    }
    
    // Fallback to individual price fields for compatibility
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
Total Amount: ${formatEGP(bookingData.totalAmount)}

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
          
          <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-sm text-gray-600">Your transportation request has been submitted successfully</p>
            </div>

            {/* Booking Reference */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-gray-700">Booking Reference</h3>
                    <p className="text-lg font-mono text-teal-600">{bookingData.bookingReference || 'RT-' + Date.now()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyBookingReference} className="flex items-center gap-1 text-xs">
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    Route Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">From:</span> <span className="font-medium">{getCityName(bookingData.route.fromCityId)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">To:</span> <span className="font-medium">{getCityName(bookingData.route.toCityId)}</span>
                    </div>
                    {bookingData.route.name && (
                      <div className="text-sm">
                        <span className="text-gray-600">Route:</span> <span className="font-medium">{bookingData.route.name}</span>
                      </div>
                    )}
                    {bookingData.route.km && (
                      <div className="text-sm">
                        <span className="text-gray-600">Distance:</span> <span className="font-medium">{bookingData.route.km} km</span>
                      </div>
                    )}
                    {bookingData.route.estimatedDuration && (
                      <div className="text-sm">
                        <span className="text-gray-600">Duration:</span> <span className="font-medium">{bookingData.route.estimatedDuration}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Car className="w-4 h-4 text-teal-600" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Vehicle:</span> <span className="font-medium">{bookingData.vehicleType.charAt(0).toUpperCase() + bookingData.vehicleType.slice(1)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Passengers:</span> <span className="font-medium">{bookingData.passengers}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Travel Date:</span> <span className="font-medium">{new Date(bookingData.travelDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Total Amount:</span> <span className="text-lg font-bold text-teal-600">{formatEGP(bookingData.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Information */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-teal-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm">
                    <span className="text-gray-600">Name:</span> <span className="font-medium">{bookingData.customerName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Email:</span> <span className="font-medium">{bookingData.customerEmail}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Phone:</span> <span className="font-medium">{bookingData.customerPhone}</span>
                  </div>
                  {bookingData.specialRequests && (
                    <div className="md:col-span-2 text-sm">
                      <span className="text-gray-600">Special Requests:</span> <span className="font-medium">{bookingData.specialRequests}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Confirmation Call</h4>
                      <p className="text-xs text-gray-600">We'll contact you within 24 hours to confirm your booking details and arrange payment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Payment Processing</h4>
                      <p className="text-xs text-gray-600">Payment will be processed securely upon booking confirmation.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-800">Driver Assignment</h4>
                      <p className="text-xs text-gray-600">You'll receive driver details and contact information 24 hours before your trip.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button onClick={downloadConfirmation} size="sm" className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2 text-xs">
                <Download className="w-3 h-3" />
                Download Confirmation
              </Button>
              <Button variant="outline" size="sm" onClick={startNewBooking} className="text-xs">
                Book Another Route
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs">
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Contact Information */}
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-3">Contact us for any questions or changes to your booking</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3 text-teal-600" />
                    +20 123 456 7890
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-3 h-3 text-teal-600" />
                    bookings@affordegypt.com
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
        
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Route Details */}
            <Card>
              <CardHeader className="bg-teal-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="w-5 h-5 text-teal-600" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {/* Main route info */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm">
                        {getCityName(selectedRoute.fromCityId)} → {getCityName(selectedRoute.toCityId)}
                      </div>
                      {selectedRoute.name && (
                        <div className="text-xs text-gray-600">{selectedRoute.name}</div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick facts */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-3">
                    {selectedRoute.km && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Distance</div>
                        <div className="text-sm font-medium">{selectedRoute.km} km</div>
                      </div>
                    )}
                    {selectedRoute.estimatedDuration && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Duration</div>
                        <div className="text-sm font-medium">{selectedRoute.estimatedDuration}</div>
                      </div>
                    )}
                  </div>
                  
                  {selectedRoute.description && (
                    <div className="bg-blue-50 border-l-4 border-blue-300 p-3">
                      <p className="text-xs text-gray-700 leading-relaxed">{selectedRoute.description}</p>
                    </div>
                  )}
                  
                  {selectedRoute.routeHighlights && (
                    <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50">
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-xs text-yellow-800 mb-1">Route Highlights</div>
                          <p className="text-xs text-yellow-700 leading-relaxed">{selectedRoute.routeHighlights}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedRoute.travelTips && (
                    <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                      <div className="flex items-start gap-2">
                        <div className="w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                        <div>
                          <div className="font-medium text-xs text-blue-800 mb-1">Travel Tips</div>
                          <p className="text-xs text-blue-700 leading-relaxed">{selectedRoute.travelTips}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(selectedRoute.pickupInstructions || selectedRoute.dropoffInstructions) && (
                    <div className="space-y-2">
                      {selectedRoute.pickupInstructions && (
                        <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-xs text-green-800 mb-1">Pickup</div>
                              <p className="text-xs text-green-700 leading-relaxed">{selectedRoute.pickupInstructions}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedRoute.dropoffInstructions && (
                        <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-xs text-red-800 mb-1">Dropoff</div>
                              <p className="text-xs text-red-700 leading-relaxed">{selectedRoute.dropoffInstructions}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader className="bg-orange-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Book Your Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Trip Details Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-1">
                      Trip Details
                    </h4>
                    
                    {/* Vehicle Selection & Passengers in one row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Vehicle Type *</Label>
                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                          <SelectTrigger className="w-full h-9 text-sm">
                            <SelectValue placeholder="Choose vehicle" />
                          </SelectTrigger>
                          <SelectContent className="z-50">
                            {selectedRoute?.sedanPrice && (
                              <SelectItem value="sedan" className="text-sm">
                                Sedan - {formatEGP(selectedRoute.sedanPrice)}
                              </SelectItem>
                            )}
                            {selectedRoute?.minivanPrice && (
                              <SelectItem value="minivan" className="text-sm">
                                Minivan - {formatEGP(selectedRoute.minivanPrice)}
                              </SelectItem>
                            )}
                            {selectedRoute?.vanPrice && (
                              <SelectItem value="van" className="text-sm">
                                Van - {formatEGP(selectedRoute.vanPrice)}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600">Passengers *</Label>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={passengers}
                          onChange={(e) => setPassengers(parseInt(e.target.value))}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Travel Date */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Travel Date *</Label>
                      <Input
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Customer Information Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-1">
                      Contact Information
                    </h4>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Full Name *</Label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-medium text-gray-600">Email *</Label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="h-9 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-gray-600">Phone</Label>
                        <Input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+20 123 456 7890"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div>
                      <Label className="text-xs font-medium text-gray-600">Special Requests</Label>
                      <Textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Any special requirements..."
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  {selectedVehicle && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                        <span className="text-xl font-bold text-teal-600">
                          {formatEGP(calculateTotal())}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Transportation only • No hidden fees
                      </p>
                    </div>
                  )}

                  {/* Deposit Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-lg">💵</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">10% deposit required</h4>
                        <p className="text-xs text-blue-800 mb-1">
                          Our team will contact you to collect it and confirm your booking.
                        </p>
                        <p className="text-xs text-blue-800">
                          Pay the rest in cash to your guide after the tour.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Currency Note */}
                  <p className="text-xs text-gray-600 text-center">
                    All prices in EGP • International cards accepted
                  </p>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-2 py-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="acceptTerms" className="text-xs text-gray-700 leading-tight">
                      I agree to the Terms of Service and Booking Agreement
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700 h-10 text-sm font-medium"
                    disabled={bookingMutation.isPending || !acceptTerms}
                  >
                    {bookingMutation.isPending ? "Submitting..." : "Book Transportation"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center leading-tight">
                    By submitting this form, you agree to our booking terms. 
                    We'll contact you to confirm details and payment.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Need Full Service? */}
          <Card className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-sm font-bold mb-2 text-gray-800">Need a Complete Travel Package?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Add tour guides, attractions, and more with our comprehensive pricing tool
                </p>
                <Link href="/#quote-builder">
                  <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-100 text-xs">
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