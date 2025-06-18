import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { CheckCircle, Clock, AlertCircle, Download, Mail, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useQuery } from "@tanstack/react-query";

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface BookingData {
  booking: {
    id: number;
    bookingReference: string;
    bookingStatus: BookingStatus;
    totalAmount: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerNotes?: string;
    startDate?: string;
    endDate?: string;
  };
  quote: {
    id: number;
    jsonBlob: any;
  };
}

export default function BookingConfirmation() {
  const [, params] = useRoute("/booking-confirmation/:reference");
  const reference = params?.reference;

  const { data: bookingData, isLoading, error } = useQuery({
    queryKey: [`/api/bookings/reference/${reference}`],
    enabled: !!reference,
  });

  // Fetch routes to resolve route IDs to names
  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
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

  const booking = bookingData?.booking;
  const quote = bookingData?.quote;

  // Helper function to get route name by ID
  const getRouteName = (routeId: number) => {
    const route = routes.find((r: any) => r.id === routeId);
    return route ? route.name : `Route ${routeId}`;
  };

  const downloadBookingPDF = async () => {
    if (!booking || !quote) return;
    
    try {
      // Create a temporary container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      const itinerary = quote.jsonBlob.cities || quote.jsonBlob.itinerary || [];
      
      pdfContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0d9488; margin: 0; font-size: 28px;">AffordEgypt</h1>
          <h2 style="margin: 10px 0; color: #374151;">Booking Confirmation</h2>
          <p style="color: #6b7280; margin: 0;">Reference: ${booking.bookingReference}</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">Booking Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Total Amount:</strong> ${parseFloat(booking.totalAmount).toLocaleString()} EGP<br>
              <strong>Status:</strong> ${booking.bookingStatus.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              ${booking.startDate ? `<strong>Start Date:</strong> ${formatDate(booking.startDate)}<br>` : ''}
              ${booking.endDate ? `<strong>End Date:</strong> ${formatDate(booking.endDate)}<br>` : ''}
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">Customer Information</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Name:</strong> ${booking.customerName}<br>
              <strong>Email:</strong> ${booking.customerEmail}
            </div>
            <div>
              <strong>Phone:</strong> ${booking.customerPhone}<br>
              ${booking.customerNotes ? `<strong>Special Requests:</strong> ${booking.customerNotes}` : ''}
            </div>
          </div>
        </div>
        
        ${itinerary.length > 0 ? `
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">Trip Itinerary</h3>
          ${itinerary.map((city: any, index: number) => `
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 4px solid #0d9488;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">${index + 1}. ${city.cityName}</h4>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Date:</strong> ${city.date} • <strong>Travelers:</strong> ${city.travelers}</p>
              
              ${city.selectedRoutes && city.selectedRoutes.length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">Transportation:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${city.selectedRoutes.map((route: any) => `
                      <li style="color: #6b7280;">${typeof route === 'object' ? (route.name || getRouteName(route.id)) : getRouteName(route)}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${city.selectedGuide ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">Guide Service:</strong>
                  <span style="color: #6b7280;"> ${city.selectedGuide.language} guide - ${city.selectedGuide.duration} hours</span>
                </div>
              ` : ''}
              
              ${(city.attractions || city.selectedAttractions) && (city.attractions || city.selectedAttractions).length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">Attractions:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${(city.attractions || city.selectedAttractions).map((attraction: string) => `
                      <li style="color: #6b7280;">${attraction}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${city.selectedAddOns && city.selectedAddOns.length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">Add-ons:</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${city.selectedAddOns.map((addOn: any) => {
                      const travelers = quote?.jsonBlob?.passengers || city.travelers || 1;
                      const isPerPerson = addOn.unitType === 'per_person' || addOn.type === 'per_person';
                      const displayQuantity = isPerPerson ? addOn.quantity * travelers : addOn.quantity;
                      return `<li style="color: #6b7280;">${addOn.name} x${displayQuantity}${isPerPerson ? ` (${addOn.quantity} per person)` : ''}</li>`;
                    }).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f0f9ff;">
          <h3 style="color: #0d9488; margin-top: 0;">Payment Information</h3>
          <p style="margin: 5px 0; color: #374151;"><strong>10% deposit required</strong></p>
          <p style="margin: 5px 0; color: #6b7280;">Our team will contact you to collect it and confirm your booking.</p>
          <p style="margin: 5px 0; color: #6b7280;">Pay the rest in cash to your guide after the tour.</p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 2px solid #0d9488; margin-top: 30px;">
          <h3 style="color: #0d9488; margin: 0 0 10px 0;">Contact Information</h3>
          <p style="margin: 5px 0; color: #374151;"><strong>Phone:</strong> +20 110 076 5283</p>
          <p style="margin: 5px 0; color: #374151;"><strong>WhatsApp:</strong> +20 110 076 5283</p>
          <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> info@affordegypt.com</p>
          <p style="margin: 15px 0 0 0; color: #6b7280; font-style: italic;">Thank you for choosing AffordEgypt for your Egypt adventure!</p>
        </div>
      `;
      
      document.body.appendChild(pdfContainer);
      
      // Generate PDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`AffordEgypt-Booking-${booking.bookingReference}.pdf`);
      
      // Clean up
      document.body.removeChild(pdfContainer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const generateBookingDetailsText = (booking: any, quote: any) => {
    const quoteData = quote.jsonBlob || {};
    const cities = quoteData.cities || [];
    
    let details = `AFFORDEGYPT - BOOKING CONFIRMATION
${'='.repeat(50)}

BOOKING INFORMATION
Booking Reference: ${booking.bookingReference}
Status: ${booking.bookingStatus.replace('_', ' ').toUpperCase()}
Total Amount: ${parseFloat(booking.totalAmount).toLocaleString()} EGP
`;

    if (booking.startDate) {
      details += `Trip Start Date: ${formatDate(booking.startDate)}\n`;
    }
    if (booking.endDate) {
      details += `Trip End Date: ${formatDate(booking.endDate)}\n`;
    }

    details += `
CUSTOMER INFORMATION
Name: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: ${booking.customerPhone}
`;

    if (booking.customerNotes) {
      details += `Special Requests: ${booking.customerNotes}\n`;
    }

    details += `
ITINERARY DETAILS
${'='.repeat(30)}
`;

    cities.forEach((city: any, index: number) => {
      details += `
${index + 1}. ${city.cityName}
   Date: ${city.date}
   Travelers: ${city.travelers}
`;

      if (city.selectedRoutes && city.selectedRoutes.length > 0) {
        details += `   Transportation:\n`;
        city.selectedRoutes.forEach((route: any) => {
          details += `   - ${typeof route === 'object' ? (route.name || getRouteName(route.id)) : getRouteName(route)}\n`;
        });
      }

      if (city.selectedGuide) {
        details += `   Guide Service: ${city.selectedGuide.language} guide - ${city.selectedGuide.duration} hours\n`;
      }

      if (city.attractions && city.attractions.length > 0) {
        details += `   Attractions:\n`;
        city.attractions.forEach((attraction: string) => {
          details += `   - ${attraction}\n`;
        });
      }

      if (city.selectedAddOns && city.selectedAddOns.length > 0) {
        details += `   Add-ons:\n`;
        city.selectedAddOns.forEach((addOn: any) => {
          const isPerPerson = addOn.unitType === 'per_person' || addOn.type === 'per_person';
          const displayQuantity = isPerPerson 
            ? addOn.quantity * city.travelers 
            : addOn.quantity;
          details += `   - ${addOn.name} x${displayQuantity}${isPerPerson ? ` (${addOn.quantity} per person)` : ''}\n`;
        });
      }
    });

    details += `
PAYMENT INFORMATION
${'='.repeat(30)}
10% deposit required
Our team will contact you to collect it and confirm your booking.
Pay the rest in cash to your guide after the tour.

CONTACT INFORMATION
${'='.repeat(30)}
Phone: +20 110 076 5283
WhatsApp: +20 110 076 5283
Email: info@affordegypt.com

Thank you for choosing AffordEgypt for your Egypt adventure!
`;

    return details;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="AffordEgypt Logo" className="h-12 mx-auto mb-4" />
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your Egypt adventure is booked. Here are your details.
          </p>
          
          {/* Download Button */}
          <div className="flex justify-center mt-6">
            <Button 
              onClick={downloadBookingPDF}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Confirmation
            </Button>
          </div>
        </div>

        {/* Main Booking Details - Full Width */}
        <div className="space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Information</span>
                  <div className="flex items-center">
                    {getStatusIcon(booking.bookingStatus)}
                    <span className="ml-2 text-sm">
                      Reference: {booking.bookingReference}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </label>
                    <p className="text-lg font-semibold">
                      {parseFloat(booking.totalAmount).toLocaleString()} EGP
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
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-lg">{booking.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg">{booking.customerEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-lg">{booking.customerPhone}</p>
                    </div>
                    {booking.customerNotes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Special Requests</label>
                        <p className="text-lg">{booking.customerNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Itinerary */}
            {quote && quote.jsonBlob && (quote.jsonBlob.cities || quote.jsonBlob.itinerary) && (
              <Card>
                <CardHeader>
                  <CardTitle>Trip Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(quote.jsonBlob.cities || quote.jsonBlob.itinerary || []).map((city: any, index: number) => (
                      <div key={index} className="border-l-4 border-teal-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{city.cityName}</h3>
                          <div className="text-sm text-muted-foreground">
                            {city.date} • {city.travelers} travelers
                          </div>
                        </div>
                        
                        {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Transportation</div>
                            <div className="space-y-1">
                              {city.selectedRoutes.map((route: any, rIndex: number) => (
                                <div key={rIndex} className="text-sm text-muted-foreground">
                                  {typeof route === 'object' ? (route.name || getRouteName(route.id)) : getRouteName(route)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {city.selectedGuide && (
                          <div>
                            <div className="font-medium text-sm mb-2">Guide Service</div>
                            <div className="text-sm text-muted-foreground">
                              {city.selectedGuide.language} guide - {city.selectedGuide.duration} hours
                            </div>
                          </div>
                        )}
                        
                        {(city.attractions || city.selectedAttractions) && (city.attractions || city.selectedAttractions).length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">Attractions</div>
                            <div className="space-y-1">
                              {(city.attractions || city.selectedAttractions).map((attraction: string, aIndex: number) => (
                                <div key={aIndex} className="text-sm text-muted-foreground">
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
                              {city.selectedAddOns.map((addOn: any, aoIndex: number) => {
                                // Calculate display quantity based on pricing type
                                const travelers = quote?.jsonBlob?.passengers || city.travelers || 1;
                                const isPerPerson = addOn.unitType === 'per_person' || addOn.type === 'per_person';
                                const displayQuantity = isPerPerson 
                                  ? addOn.quantity * travelers 
                                  : addOn.quantity;
                                
                                return (
                                  <div key={aoIndex} className="flex items-center justify-between text-sm">
                                    <span>{addOn.name}</span>
                                    <span className="text-muted-foreground">
                                      x{displayQuantity} {isPerPerson ? `(${addOn.quantity} per person)` : ''}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Simple booking details when quote data is not available */}
            {!quote && booking && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                        <p className="text-2xl font-bold text-primary">{booking.totalAmount} EGP</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <p className="text-lg capitalize">{booking.bookingStatus?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-center text-muted-foreground">
                      <p>Detailed itinerary information will be provided separately.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Success Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <h3 className="font-semibold text-green-900">Booking Created Successfully</h3>
                  <p className="text-sm text-green-700">
                    Your booking reference is <strong>{booking.bookingReference}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}