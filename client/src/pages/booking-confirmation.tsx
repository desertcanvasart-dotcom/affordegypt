import { useEffect } from "react";
import { useRoute } from "wouter";
import { CheckCircle, Clock, AlertCircle, Download, DollarSign } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatEGP } from "@/lib/utils";
import {
  hasSentConversion,
  markConversionSent,
  shouldSendBookingConversion,
  trackPurchase,
} from "@/lib/analytics";

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export default function BookingConfirmation() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute("/booking-confirmation/:reference");
  const reference = params?.reference;

  const { data: bookingData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/bookings/reference/${reference}`],
    enabled: !!reference,
  });

  // Fetch routes to resolve route IDs to names
  const { data: routes = [] } = useQuery<any[]>({
    queryKey: ["/api/routes"],
  });

  // Report the booking as a GA4 `purchase`, exactly once per booking reference.
  // Google Ads imports that event as the "Afford Egypt (web) purchase"
  // conversion action — see trackPurchase for why the event name is load-bearing.
  //
  // This page is a permalink: customers reload it, bookmark it, and get it by
  // email, so firing on every mount would inflate the count. Two independent
  // guards prevent that — a localStorage marker keyed by reference (stops the
  // send locally) and transaction_id (lets GA4 de-duplicate even across
  // devices, where localStorage can't help).
  //
  // Cancelled bookings are excluded; everything else means a real booking was
  // placed, including `pending`, which is the normal state right after checkout.
  useEffect(() => {
    const booking = bookingData?.booking;
    if (!booking?.bookingReference) return;

    // The quote builder already reports the purchase at checkout, so for the
    // common path this marker is set before the customer ever opens this page
    // from their email — this call is the fallback for the /book flow and for
    // anyone whose checkout-time event didn't get through.
    if (!shouldSendBookingConversion(booking, hasSentConversion(booking.bookingReference))) return;

    const value = Number(booking.totalAmount);

    trackPurchase({
      transactionId: booking.bookingReference,
      value: Number.isFinite(value) && value > 0 ? value : undefined,
      currency: "EGP",
      items: [
        {
          item_id: booking.bookingReference,
          item_name: "Egypt trip booking", // i18n-exempt: GA4 item name, not UI
          item_category: "trip",
          price: Number.isFinite(value) && value > 0 ? value : undefined,
          quantity: 1,
        },
      ],
    });

    markConversionSent(booking.bookingReference);
  }, [bookingData]);

  // The guide's language is stored on the booking as an English word
  // ("English", "French"). Rendering it raw gave "Guía en English" on the
  // Spanish confirmation; pricing.guideLanguages already holds the translations.
  const guideLanguage = (language: string) =>
    t(`pricing.guideLanguages.${String(language).toLowerCase()}`, { defaultValue: language });

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Dates follow the reader's language: "15 septembre 2026", not
  // "September 15, 2026" on an otherwise French confirmation.
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
              <h2 className="text-xl font-bold mb-2">{t('bookingConfirmation.notFoundTitle')}</h2>
              <p className="text-muted-foreground mb-4">
                {t('bookingConfirmation.notFoundBody', { reference })}
              </p>
              <Button onClick={() => window.location.href = '/'}>
                {t('bookingConfirmation.returnHome')}
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
          <h2 style="margin: 10px 0; color: #374151;">${t('bookingConfirmation.pdf.title')}</h2>
          <p style="color: #6b7280; margin: 0;">${t('bookingConfirmation.pdf.referenceLabel')} ${booking.bookingReference}</p>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">${t('bookingConfirmation.pdf.bookingInformation')}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>${t('bookingConfirmation.pdf.totalAmount')}</strong> ${formatEGP(booking.totalAmount)}<br>
              <strong>${t('bookingConfirmation.pdf.status')}</strong> ${booking.bookingStatus.replace('_', ' ').toUpperCase()}
            </div>
            <div>
              ${booking.startDate ? `<strong>${t('bookingConfirmation.pdf.startDate')}</strong> ${formatDate(booking.startDate)}<br>` : ''}
              ${booking.endDate ? `<strong>${t('bookingConfirmation.pdf.endDate')}</strong> ${formatDate(booking.endDate)}<br>` : ''}
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">${t('bookingConfirmation.pdf.customerInformation')}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>${t('bookingConfirmation.pdf.name')}</strong> ${booking.customerName}<br>
              <strong>${t('bookingConfirmation.pdf.email')}</strong> ${booking.customerEmail}
            </div>
            <div>
              <strong>${t('bookingConfirmation.pdf.phone')}</strong> ${booking.customerPhone}<br>
              ${booking.customerNotes ? `<strong>${t('bookingConfirmation.pdf.specialRequests')}</strong> ${booking.customerNotes}` : ''}
            </div>
          </div>
        </div>
        
        ${itinerary.length > 0 ? `
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="color: #0d9488; margin-top: 0;">${t('bookingConfirmation.pdf.itinerary')}</h3>
          ${itinerary.map((city: any, index: number) => `
            <div style="margin-bottom: 20px; padding-left: 15px; border-left: 4px solid #0d9488;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">${index + 1}. ${city.cityName}</h4>
              <p style="margin: 5px 0; color: #6b7280;"><strong>${t('bookingConfirmation.pdf.date')}</strong> ${city.date} • <strong>${t('bookingConfirmation.pdf.travelers')}</strong> ${city.travelers}</p>
              
              ${city.selectedRoutes && city.selectedRoutes.length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">${t('bookingConfirmation.pdf.transportation')}</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${city.selectedRoutes.map((route: any) => `
                      <li style="color: #6b7280;">${typeof route === 'object' ? (route.name || getRouteName(route.id)) : getRouteName(route)}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${city.selectedGuide ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">${t('bookingConfirmation.pdf.guideService')}</strong>
                  <span style="color: #6b7280;"> ${t('bookingConfirmation.guideLine', { language: guideLanguage(city.selectedGuide.language), hours: city.selectedGuide.duration })}</span>
                </div>
              ` : ''}
              
              ${(city.attractions || city.selectedAttractions) && (city.attractions || city.selectedAttractions).length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">${t('bookingConfirmation.pdf.attractions')}</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${(city.attractions || city.selectedAttractions).map((attraction: string) => `
                      <li style="color: #6b7280;">${attraction}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${city.selectedAddOns && city.selectedAddOns.length > 0 ? `
                <div style="margin: 10px 0;">
                  <strong style="color: #374151;">${t('bookingConfirmation.pdf.addOns')}</strong>
                  <ul style="margin: 5px 0; padding-left: 20px;">
                    ${city.selectedAddOns.map((addOn: any) => {
                      const travelers = quote?.jsonBlob?.passengers || city.travelers || 1;
                      const isPerPerson = addOn.unitType === 'per_person' || addOn.type === 'per_person';
                      const displayQuantity = isPerPerson ? addOn.quantity * travelers : addOn.quantity;
                      const qty = isPerPerson
                        ? t('bookingConfirmation.addOnPerPerson', { quantity: displayQuantity, each: addOn.quantity })
                        : t('bookingConfirmation.addOnQuantity', { quantity: displayQuantity });
                      return `<li style="color: #6b7280;">${addOn.name} ${qty}</li>`;
                    }).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f0f9ff;">
          <h3 style="color: #0d9488; margin-top: 0;">${t('bookingConfirmation.payment.title')}</h3>
          <p style="margin: 5px 0; color: #374151;"><strong>${t('bookingConfirmation.payment.depositLabel')}</strong></p>
          <p style="margin: 5px 0; color: #6b7280;">${t('bookingConfirmation.payment.depositBody')}</p>
          <p style="margin: 5px 0; color: #6b7280;">${t('bookingConfirmation.payment.remainder')}</p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 2px solid #0d9488; margin-top: 30px;">
          <h3 style="color: #0d9488; margin: 0 0 10px 0;">${t('bookingConfirmation.pdf.contactInformation')}</h3>
          <p style="margin: 5px 0; color: #374151;"><strong>${t('bookingConfirmation.pdf.phone')}</strong> +20 110 076 5283</p>
          <p style="margin: 5px 0; color: #374151;"><strong>${t('bookingConfirmation.pdf.whatsapp')}</strong> +20 110 076 5283</p>
          <p style="margin: 5px 0; color: #374151;"><strong>${t('bookingConfirmation.pdf.email')}</strong> hello@affordegypt.com</p>
          <p style="margin: 15px 0 0 0; color: #6b7280; font-style: italic;">${t('bookingConfirmation.pdf.thanks')}</p>
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
      console.error('Error generating PDF:', error); // i18n-exempt: console, not UI
      alert(t('bookingConfirmation.pdfError'));
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt={t('bookingConfirmation.logoAlt')} className="h-12 mx-auto mb-4" />
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('bookingConfirmation.heading', { name: booking.customerName })}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('bookingConfirmation.subheading')}
          </p>

          {/* Download Button */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={downloadBookingPDF}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('bookingConfirmation.downloadPdf')}
            </Button>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mb-6 border-teal-200">
          <CardHeader>
            <CardTitle>{t('bookingConfirmation.nextSteps.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('bookingConfirmation.nextSteps.step1Title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('bookingConfirmation.nextSteps.step1Body')}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('bookingConfirmation.nextSteps.step2Title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('bookingConfirmation.nextSteps.step2Body')}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('bookingConfirmation.nextSteps.step3Title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('bookingConfirmation.nextSteps.step3Body')}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('bookingConfirmation.nextSteps.step4Title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('bookingConfirmation.nextSteps.step4Body')}
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Main Booking Details - Full Width */}
        <div className="space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('bookingConfirmation.bookingInformation')}</span>
                  <div className="flex items-center">
                    {getStatusIcon(booking.bookingStatus)}
                    <span className="ml-2 text-sm">
                      {t('bookingConfirmation.reference', { reference: booking.bookingReference })}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('bookingConfirmation.totalAmount')}
                    </label>
                    <p className="text-lg font-semibold">
                      {formatEGP(booking.totalAmount)}
                    </p>
                  </div>
                  {booking.startDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('bookingConfirmation.tripStartDate')}
                      </label>
                      <p className="text-lg">{formatDate(booking.startDate)}</p>
                    </div>
                  )}
                  {booking.endDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        {t('bookingConfirmation.tripEndDate')}
                      </label>
                      <p className="text-lg">{formatDate(booking.endDate)}</p>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('bookingConfirmation.bookingStatus')}
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
                <CardTitle>{t('bookingConfirmation.customerInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.name')}</label>
                      <p className="text-lg">{booking.customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.email')}</label>
                      <p className="text-lg">{booking.customerEmail}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.phone')}</label>
                      <p className="text-lg">{booking.customerPhone}</p>
                    </div>
                    {booking.customerNotes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.specialRequests')}</label>
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
                  <CardTitle>{t('bookingConfirmation.itineraryTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(quote.jsonBlob.cities || quote.jsonBlob.itinerary || []).map((city: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-teal-500">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div className="flex items-center gap-3 mb-2 md:mb-0">
                              <Badge className="bg-teal-600 text-white px-3 py-1 text-sm">
                                {t('bookingConfirmation.day', { number: city.dayNumber || index + 1 })}
                              </Badge>
                              <h3 className="font-semibold text-xl">{city.cityName}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{city.date ? formatDate(city.date) : formatDate(booking.startDate || new Date().toISOString())}</span>
                              </div>
                              <div>
                                {t('bookingConfirmation.travelerCount', { count: city.travelers })}
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="mb-4" />
                        
                        {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">{t('bookingConfirmation.transportation')}</div>
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
                            <div className="font-medium text-sm mb-2">{t('bookingConfirmation.guideService')}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('bookingConfirmation.guideLine', { language: guideLanguage(city.selectedGuide.language), hours: city.selectedGuide.duration })}
                            </div>
                          </div>
                        )}
                        
                        {(city.attractions || city.selectedAttractions) && (city.attractions || city.selectedAttractions).length > 0 && (
                          <div>
                            <div className="font-medium text-sm mb-2">{t('bookingConfirmation.attractions')}</div>
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
                            <div className="font-medium text-sm mb-2">{t('bookingConfirmation.addOns')}</div>
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
                                      {isPerPerson
                                        ? t('bookingConfirmation.addOnPerPerson', { quantity: displayQuantity, each: addOn.quantity })
                                        : t('bookingConfirmation.addOnQuantity', { quantity: displayQuantity })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Simple booking details when quote data is not available */}
            {!quote && booking && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('bookingConfirmation.bookingDetails')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.totalAmount')}</label>
                        <p className="text-2xl font-bold text-primary">{formatEGP(booking.totalAmount)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">{t('bookingConfirmation.status')}</label>
                        <p className="text-lg capitalize">{booking.bookingStatus?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-center text-muted-foreground">
                      <p>{t('bookingConfirmation.itinerarySeparately')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">{t('bookingConfirmation.payment.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                    <p className="text-sm text-blue-900">
                      <strong>{t('bookingConfirmation.payment.depositLabel')}</strong> - {t('bookingConfirmation.payment.depositBody')}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                    <p className="text-sm text-blue-900">
                      {t('bookingConfirmation.payment.remainder')}
                    </p>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-center gap-2 bg-white border border-blue-300 rounded-md px-4 py-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {t('bookingConfirmation.payment.acceptedIn')} <strong>{t('bookingConfirmation.payment.currencies')}</strong>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Success Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <h3 className="font-semibold text-green-900">{t('bookingConfirmation.success.title')}</h3>
                  <p className="text-sm text-green-700">
                    {t('bookingConfirmation.success.body')} <strong>{booking.bookingReference}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}