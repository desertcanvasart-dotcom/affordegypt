import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslatedQuery } from "@/hooks/useTranslatedQuery";
import { useTranslation, Trans } from "react-i18next";
import { useParams, useLocation, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, User, Calendar, Users, MapPin } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { formatEGP } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { hasSentLead, markLeadSent, trackQualifiedLead } from "@/lib/analytics";

// A factory, not a module constant: the validation messages are translated, so
// the schema must be built after i18next is available and rebuilt when the
// visitor switches language. Same pattern as contact.tsx.
const makeBookingSchema = (t: (key: string) => string) =>
  z.object({
    customerName: z.string().min(2, t("validation.nameMin")),
    customerEmail: z.string().email(t("validation.invalidEmail")),
    customerPhone: z.string().min(10, t("validation.invalidPhone")),
    travelDate: z.string().min(1, t("validation.selectDate")),
    specialRequests: z.string().optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t("validation.acceptTerms"),
    }),
  });

type BookingFormData = z.infer<ReturnType<typeof makeBookingSchema>>;

export default function BookPage() {
  const { t, i18n } = useTranslation();
  const bookingSchema = useMemo(() => makeBookingSchema(t), [t, i18n.language]);

  // The guide's language is stored on the quote as an English word ("English",
  // "French"). Rendering it raw gave "Guía en English" here, the same way it
  // did on the confirmation page — keep both screens on the same lookup.
  const guideLanguage = (language: string) =>
    t(`pricing.guideLanguages.${String(language).toLowerCase()}`, { defaultValue: language });

  const params = useParams();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse URL parameters for fallback quote data
  const urlParams = new URLSearchParams(search);
  
  // Handle transfer module parameters
  const routeId = urlParams.get('route');
  const vehicleType = urlParams.get('vehicle');
  const price = urlParams.get('price');
  
  const fallbackQuote = {
    total: price || urlParams.get('total') || '0',
    travelers: parseInt(urlParams.get('travelers') || '1'),
    cities: urlParams.get('cities')?.split(',') || [],
    travelDate: urlParams.get('travelDate') || '',
    itinerary: urlParams.get('itinerary') ? JSON.parse(decodeURIComponent(urlParams.get('itinerary')!)) : [],
    // Transfer-specific data
    routeId: routeId ? parseInt(routeId) : null,
    vehicleType: vehicleType || null,
    isTransferBooking: !!(routeId && vehicleType && price)
  };

  // Fetch quote if ID is provided
  const { data: quote, isLoading } = useQuery<any>({
    queryKey: [`/api/quotes/${params.id}`],
    enabled: !!params.id,
    retry: false,
  });

  // Fetch add-ons data for proper quantity display
  const { data: addOns } = useTranslatedQuery<any[]>("/api/addons");

  // Fetch attractions data for proper name display
  const { data: attractions } = useTranslatedQuery<any[]>("/api/attractions");

  // Fetch route data for transfer bookings
  const { data: routeData } = useQuery<any>({
    queryKey: [`/api/routes/${fallbackQuote.routeId}`],
    enabled: !!fallbackQuote.routeId && fallbackQuote.isTransferBooking,
    retry: false,
  });

  // Fetch cities data for route display
  const { data: cities } = useTranslatedQuery<any[]>("/api/cities", {
    enabled: fallbackQuote.isTransferBooking,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      travelDate: fallbackQuote.travelDate || "",
      specialRequests: "",
      acceptTerms: false,
    },
  });

  // Update form when quote data loads
  useEffect(() => {
    if (quote?.jsonBlob?.travelDate && !form.getValues('travelDate')) {
      form.setValue('travelDate', quote.jsonBlob.travelDate);
    }
  }, [quote, form]);

  // Report the quote as a lead ("Request quotes" goal in Ads, via the imported
  // GA4 event `qualify_lead`).
  //
  // This page does not create the quote — it loads one by id — so the lead may
  // already have been reported when the quote was created in the builder. The
  // shared per-quote marker makes this a no-op in that case, and the only
  // reports that get through are quotes that reached /book without ever being
  // counted (a saved quote opened later, or a shared /book/:id link).
  useEffect(() => {
    if (!quote?.id) return;
    if (hasSentLead(quote.id)) return;

    const quoteValue = Number(
      quote?.jsonBlob?.totalAmount ?? quote?.total ?? NaN,
    );
    trackQualifiedLead({
      quoteId: quote.id,
      value: Number.isFinite(quoteValue) && quoteValue > 0 ? quoteValue : undefined,
      currency: 'EGP',
    });
    markLeadSent(quote.id);
  }, [quote]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      if (!response.ok) {
        // Status only: the response body can echo back what we posted, which
        // is the customer's name, email and phone.
        throw new Error(`Booking failed: ${response.status}`); // i18n-exempt: Error for the console, never rendered
      }
      return response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: t("booking.successTitle"),
        description: t("booking.successBody", { reference: booking.bookingReference }),
      });
      setLocation(`/booking-confirmation/${booking.bookingReference}`);
    },
    onError: () => {
      toast({
        title: t("booking.failTitle"),
        description: t("booking.failBody"),
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsProcessing(true);
    
    try {
      // Prepare booking data with proper structure
      const bookingData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        travelDate: quoteTravelDate || data.travelDate,
        specialRequests: data.specialRequests || '',
        quoteId: quote?.id || null,
        totalAmount: totalAmount,
        travelers: travelers,
        itinerary: quoteItinerary || fallbackQuote.itinerary || [],
        // Transfer-specific data
        ...(fallbackQuote.isTransferBooking && {
          routeId: fallbackQuote.routeId,
          vehicleType: fallbackQuote.vehicleType,
          isTransferBooking: true
        })
      };
      
      await bookingMutation.mutateAsync(bookingData);
    } catch (error) {
      // The message carries the HTTP status and no customer data.
      console.error("Booking submission failed:", (error as Error)?.message); // i18n-exempt: console only
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

  const totalAmount = quote?.jsonBlob?.totalAmount || quote?.total || parseInt(fallbackQuote.total);
  const travelers = quote?.jsonBlob?.passengers || fallbackQuote.travelers;
  const quoteTravelDate = quote?.jsonBlob?.travelDate || fallbackQuote.travelDate;
  const quoteItinerary = quote?.jsonBlob?.itinerary || fallbackQuote.itinerary;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="mb-8 text-center">
        <img src="/logo.png" alt={t("bookingConfirmation.logoAlt")} className="h-12 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">{t("booking.title")}</h1>
        <p className="text-muted-foreground">
          {t("booking.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("booking.contactInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                {/* noValidate: the `required` attributes are there for
                    assistive tech, but zod owns the user-facing messages. */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("booking.fullName")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("booking.fullNamePlaceholder")} required autoComplete="name" {...field} />
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
                        <FormLabel>{t("booking.email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" required autoComplete="email" {...field} />
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
                        <FormLabel>{t("booking.phone")}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 (555) 123-4567" required autoComplete="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travelDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("booking.travelDate")}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value || quoteTravelDate || fallbackQuote.travelDate || ''}
                          />
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
                        <FormLabel>{t("booking.specialRequests")}</FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full px-3 py-2 border border-input rounded-md resize-none"
                            rows={3}
                            placeholder={t("booking.specialRequestsPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">
                            {/* Trans, not concatenation: the two links sit in
                                different places in each language's sentence. */}
                            <Trans
                              i18nKey="booking.acceptTerms"
                              components={{
                                terms: (
                                  <a
                                    href="/terms-of-service"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  />
                                ),
                                agreement: (
                                  <a
                                    href="/booking-agreement"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  />
                                ),
                              }}
                            />
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Deposit Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💵</div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">{t("booking.depositTitle")}</h4>
                        <p className="text-sm text-blue-800 mb-2">
                          {t("booking.depositCollect")}
                        </p>
                        <p className="text-sm text-blue-800">
                          {t("booking.depositRest")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Currency Note */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {t("booking.currencyNote")}
                  </p>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isProcessing || bookingMutation.isPending || !form.watch('acceptTerms')}
                  >
                    {isProcessing ? (
                      t("booking.processing")
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {t("booking.confirmCta", { amount: formatEGP(totalAmount) })}
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
                {t("booking.summaryTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t("booking.travelers")}
                </span>
                <Badge variant="secondary">{travelers}</Badge>
              </div>

              {/* Travel Date Display */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("booking.travelDate")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {quoteTravelDate ? new Date(quoteTravelDate).toLocaleDateString(i18n.language) :
                   fallbackQuote.travelDate ? new Date(fallbackQuote.travelDate).toLocaleDateString(i18n.language) :
                   t("booking.noDate")}
                </span>
              </div>

              {/* Booking Items Display */}
              <div className="space-y-3">
                <h4 className="font-medium">{t("booking.yourBooking")}</h4>
                
                {/* Transfer Booking Display */}
                {fallbackQuote.isTransferBooking && routeData && cities && (
                  <div className="border rounded-md p-3 space-y-2">
                    <div className="font-medium text-sm">
                      {cities.find((c: any) => c.id === routeData.fromCityId)?.name} → {cities.find((c: any) => c.id === routeData.toCityId)?.name}
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">{t("bookingConfirmation.transportation")}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("booking.vehicleLine", {
                          vehicle: fallbackQuote.vehicleType
                            ? fallbackQuote.vehicleType.charAt(0).toUpperCase() + fallbackQuote.vehicleType.slice(1)
                            : "",
                          distance: routeData.distanceKm,
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">{t("booking.serviceType")}</div>
                      <div className="text-xs text-muted-foreground">
                        {routeData.tripMode === 'transfer' && t("booking.tripModeTransfer")}
                        {routeData.tripMode === 'day_trip' && t("booking.tripModeDayTrip")}
                        {routeData.tripMode === 'overnight' && t("booking.tripModeOvernight")}
                        {routeData.tripMode === 'multi_day' && t("booking.tripModeMultiDay")}
                      </div>
                    </div>
                  </div>
                )}
                
                {quoteItinerary && !fallbackQuote.isTransferBooking && (
                  <div className="space-y-3">
                    {quoteItinerary.map((city: any, index: number) => (
                      <div key={index} className="border rounded-md p-3 space-y-2">
                        <div className="font-medium text-sm">{city.cityName}</div>
                        
                        {city.selectedRoutes && city.selectedRoutes.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">{t("bookingConfirmation.transportation")}</div>
                            {city.selectedRoutes.map((route: any, rIndex: number) => (
                              <div key={rIndex} className="text-xs text-muted-foreground">
                                {route.fromLocation} → {route.toLocation}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {city.selectedGuide && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">{t("bookingConfirmation.guideService")}</div>
                            <div className="text-xs text-muted-foreground">
                              {t("bookingConfirmation.guideLine", {
                                language: guideLanguage(city.selectedGuide.language),
                                hours: city.selectedGuide.duration,
                              })}
                            </div>
                          </div>
                        )}
                        
                        {(city.selectedAttractions || city.attractions) && (city.selectedAttractions || city.attractions).length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">{t("bookingConfirmation.attractions")}</div>
                            {(city.selectedAttractions || city.attractions).map((attraction: any, aIndex: number) => {
                              // Handle both ID numbers and attraction name strings
                              let name: string | null = null;
                              if (typeof attraction === 'string') {
                                name = attraction;
                              } else if (typeof attraction === 'number') {
                                // Look up attraction name by ID
                                const attractionsList = attractions as any[] || [];
                                const fullAttraction = attractionsList.find((a: any) => a.id === attraction);
                                name = fullAttraction?.name || t("booking.attractionFallback", { id: attraction });
                              } else if (attraction?.name) {
                                name = attraction.name;
                              }
                              if (!name) return null;
                              return (
                                <div key={aIndex} className="text-xs text-muted-foreground">
                                  {name} {t("booking.itemQuantity", { count: travelers })}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {city.selectedAddOns && city.selectedAddOns.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">{t("bookingConfirmation.addOns")}</div>
                            {city.selectedAddOns.map((addOn: any, aoIndex: number) => {
                              // Fetch the full add-on data to get name and unitType
                              const fullAddOn = addOns?.find((a: any) => a.id === addOn.id);
                              const addOnName = addOn.name || fullAddOn?.name || t("booking.unknownAddOn");
                              const isPerPerson = fullAddOn?.unitType === 'per_person' || addOn.unitType === 'per_person' || addOn.type === 'per_person';
                              const displayQuantity = isPerPerson 
                                ? travelers // For per-person add-ons, show traveler count
                                : (addOn.quantity || 1); // For per-unit add-ons, show actual quantity
                              
                              return (
                                <div key={aoIndex} className="text-xs text-muted-foreground">
                                  {addOnName} {t("booking.itemQuantity", { count: displayQuantity })}
                                </div>
                              );
                            })}
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
                  <span>{t("booking.subtotal")}</span>
                  <span>{formatEGP(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("booking.taxes")}</span>
                  <span>{formatEGP(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t("booking.total")}</span>
                  <span>{formatEGP(totalAmount)}</span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md text-xs text-muted-foreground">
                <p className="mb-1">{t("booking.depositNote")}</p>
                <p>{t("booking.depositCollect")}</p>
                <p>{t("booking.depositRest")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}