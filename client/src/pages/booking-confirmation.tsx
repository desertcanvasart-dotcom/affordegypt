import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { CheckCircle, Clock, AlertCircle, Download, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

interface BookingDetails {
  booking: {
    id: number;
    bookingReference: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    paymentStatus: string;
    bookingStatus: string;
    totalAmount: string;
    startDate?: string;
    endDate?: string;
    confirmationEmailSent: boolean;
    createdAt: string;
  };
  quote?: {
    id: number;
    jsonBlob: any;
    total: string;
    commissionPct: string;
  };
}

export default function BookingConfirmation() {
  const [, params] = useRoute("/booking/:reference");
  const reference = params?.reference;

  const { data: bookingData, isLoading, error } = useQuery<BookingDetails>({
    queryKey: [`/api/bookings/reference/${reference}`],
    enabled: !!reference
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find a booking with reference: {reference}
              </p>
              <Button onClick={() => window.location.href = '/'}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { booking, quote } = bookingData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your Egypt adventure is booked. Here are your details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Booking Information
                  <Badge className={getStatusColor(booking.paymentStatus)} variant="secondary">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(booking.paymentStatus)}
                      {booking.paymentStatus.toUpperCase()}
                    </span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Booking Reference
                    </label>
                    <p className="text-lg font-semibold text-primary">
                      {booking.bookingReference}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </label>
                    <p className="text-lg font-semibold">
                      ${booking.totalAmount}
                    </p>
                  </div>
                  {booking.startDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Trip Start Date
                      </label>
                      <p className="text-lg">{formatDate(booking.startDate)}</p>
                    </div>
                  )}
                  {booking.endDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Trip End Date
                      </label>
                      <p className="text-lg">{formatDate(booking.endDate)}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Booking Status
                  </label>
                  <Badge variant="outline" className="ml-2">
                    {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.customerEmail}</span>
                </div>
                {booking.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.customerPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Items Details */}
            {quote && quote.jsonBlob && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quote.jsonBlob.itinerary && quote.jsonBlob.itinerary.map((city: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="font-semibold text-lg">{city.cityName}</div>
                        <div className="text-sm text-muted-foreground">
                          {city.date} • {city.travelers} travelers
                        </div>
                        
                        {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Transportation</div>
                            <div className="space-y-1">
                              {city.selectedRoutes.map((route: any, rIndex: number) => (
                                <div key={rIndex} className="flex items-center justify-between text-sm">
                                  <span>{route.fromLocation} → {route.toLocation}</span>
                                  <span className="text-muted-foreground">{route.km} km</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {city.selectedGuide && (
                          <div>
                            <div className="font-medium text-sm mb-2">Guide Service</div>
                            <div className="text-sm">
                              {city.selectedGuide.language} speaking guide - {city.selectedGuide.duration} hours
                            </div>
                          </div>
                        )}
                        
                        {city.attractions && city.attractions.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Attractions</div>
                            <div className="grid grid-cols-1 gap-1">
                              {city.attractions.map((attraction: string, aIndex: number) => (
                                <div key={aIndex} className="text-sm flex items-center">
                                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                  {attraction}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {city.selectedAddOns && city.selectedAddOns.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Add-ons</div>
                            <div className="space-y-1">
                              {city.selectedAddOns.map((addOn: any, aoIndex: number) => (
                                <div key={aoIndex} className="flex items-center justify-between text-sm">
                                  <span>{addOn.name}</span>
                                  <span className="text-muted-foreground">x{addOn.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Details
                </Button>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-muted-foreground">
                      {booking.confirmationEmailSent 
                        ? 'Sent to your email address'
                        : 'Will be sent shortly'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Trip Preparation</p>
                    <p className="text-muted-foreground">
                      We'll contact you with final arrangements 48 hours before your trip.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Have questions about your booking? Contact our support team.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>support@affordegypt.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+20 123 456 7890</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Please include your booking reference: {booking.bookingReference}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}