import { useState, useEffect } from "react";
import { useTranslatedQuery } from "@/hooks/useTranslatedQuery";
import { useLocation } from "wouter";
import { Car, MapPin, Clock, Users, CheckCircle, Zap, Plane, Building, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslation } from "react-i18next";

import { RouteData, CityData } from "../../../shared/types";

// Multilingual content for transfers page
const transfersContent = {
  en: {
    title: "Transfer Only",
    subtitle: "Simple point-to-point transportation across Egypt",
    instantQuotes: "Instant quotes",
    noHiddenFees: "No hidden fees", 
    licensedDrivers: "Licensed drivers",
    intercityTravel: "Intercity Travel",
    localTours: "Local Tours",
    intercityTransportation: "Intercity Transportation",
    localToursTransportation: "Local Tours & Transportation",
    fromCity: "From City",
    toCity: "To City",
    selectDepartureCity: "Select departure city",
    selectDestinationCity: "Select destination city",
    matchingRoutes: "Matching Routes",
    popularRoutes: "Popular Routes",
    clickToSeeVehicleOptions: "Click to see vehicle options",
    selectCity: "Select City",
    chooseACityForLocalTours: "Choose a city for local tours",
    availableLocalRoutes: "Available Local Routes",
    selectVehicle: "Select Vehicle",
    choosePreferredVehicleType: "Choose your preferred vehicle type for this route",
    backToRoutes: "← Back to Routes",
    distance: "Distance",
    duration: "Duration",
    serviceType: "Service Type",
    transferDropOff: "Transfer & Drop-off",
    dayTrip: "Day Trip",
    dayTripReturn: "Day Trip (Return Same Day)",
    overnight: "Overnight",
    overnightStay: "Overnight Stay (1 Night)",
    multiDay: "Multi-Day",
    multiDayTour: "Multi-Day Tour (2+ Nights)",
    transfer: "Transfer"
  },
  es: {
    title: "Solo Traslado",
    subtitle: "Transporte simple punto a punto por Egipto",
    instantQuotes: "Cotizaciones instantáneas",
    noHiddenFees: "Sin costos ocultos",
    licensedDrivers: "Conductores licenciados",
    intercityTravel: "Viaje Interurbano",
    localTours: "Tours Locales",
    intercityTransportation: "Transporte Interurbano",
    localToursTransportation: "Tours Locales y Transporte",
    fromCity: "Ciudad de Origen",
    toCity: "Ciudad de Destino",
    selectDepartureCity: "Seleccionar ciudad de salida",
    selectDestinationCity: "Seleccionar ciudad de destino",
    matchingRoutes: "Rutas Coincidentes",
    popularRoutes: "Rutas Populares",
    clickToSeeVehicleOptions: "Haz clic para ver opciones de vehículos",
    selectCity: "Seleccionar Ciudad",
    chooseACityForLocalTours: "Elige una ciudad para tours locales",
    availableLocalRoutes: "Rutas Locales Disponibles",
    selectVehicle: "Seleccionar Vehículo",
    choosePreferredVehicleType: "Elige tu tipo de vehículo preferido para esta ruta",
    backToRoutes: "← Volver a Rutas",
    distance: "Distancia",
    duration: "Duración",
    serviceType: "Tipo de Servicio",
    transferDropOff: "Traslado y Entrega",
    dayTrip: "Viaje de un Día",
    dayTripReturn: "Viaje de un Día (Regreso el Mismo Día)",
    overnight: "Pernoctar",
    overnightStay: "Estancia de una Noche (1 Noche)",
    multiDay: "Varios Días",
    multiDayTour: "Tour de Varios Días (2+ Noches)",
    transfer: "Traslado"
  },
  fr: {
    title: "Transfert Uniquement",
    subtitle: "Transport simple point à point à travers l'Égypte",
    instantQuotes: "Devis instantanés",
    noHiddenFees: "Pas de frais cachés",
    licensedDrivers: "Chauffeurs agréés",
    intercityTravel: "Voyage Intercité",
    localTours: "Tours Locaux",
    intercityTransportation: "Transport Intercité",
    localToursTransportation: "Tours Locaux et Transport",
    fromCity: "Ville de Départ",
    toCity: "Ville de Destination",
    selectDepartureCity: "Sélectionner la ville de départ",
    selectDestinationCity: "Sélectionner la ville de destination",
    matchingRoutes: "Itinéraires Correspondants",
    popularRoutes: "Itinéraires Populaires",
    clickToSeeVehicleOptions: "Cliquez pour voir les options de véhicules",
    selectCity: "Sélectionner la Ville",
    chooseACityForLocalTours: "Choisissez une ville pour les tours locaux",
    availableLocalRoutes: "Itinéraires Locaux Disponibles",
    selectVehicle: "Sélectionner le Véhicule",
    choosePreferredVehicleType: "Choisissez votre type de véhicule préféré pour cet itinéraire",
    backToRoutes: "← Retour aux Itinéraires",
    distance: "Distance",
    duration: "Durée",
    serviceType: "Type de Service",
    transferDropOff: "Transfert et Dépose",
    dayTrip: "Excursion d'un Jour",
    dayTripReturn: "Excursion d'un Jour (Retour le Même Jour)",
    overnight: "Nuitée",
    overnightStay: "Séjour d'une Nuit (1 Nuit)",
    multiDay: "Plusieurs Jours",
    multiDayTour: "Tour de Plusieurs Jours (2+ Nuits)",
    transfer: "Transfert"
  },
  de: {
    title: "Nur Transfer",
    subtitle: "Einfacher Punkt-zu-Punkt-Transport durch Ägypten",
    instantQuotes: "Sofortige Angebote",
    noHiddenFees: "Keine versteckten Gebühren",
    licensedDrivers: "Lizenzierte Fahrer",
    intercityTravel: "Intercity-Reisen",
    localTours: "Lokale Touren",
    intercityTransportation: "Intercity-Transport",
    localToursTransportation: "Lokale Touren und Transport",
    fromCity: "Von Stadt",
    toCity: "Nach Stadt",
    selectDepartureCity: "Abfahrtsstadt auswählen",
    selectDestinationCity: "Zielstadt auswählen",
    matchingRoutes: "Passende Routen",
    popularRoutes: "Beliebte Routen",
    clickToSeeVehicleOptions: "Klicken Sie, um Fahrzeugoptionen zu sehen",
    selectCity: "Stadt Auswählen",
    chooseACityForLocalTours: "Wählen Sie eine Stadt für lokale Touren",
    availableLocalRoutes: "Verfügbare Lokale Routen",
    selectVehicle: "Fahrzeug Auswählen",
    choosePreferredVehicleType: "Wählen Sie Ihren bevorzugten Fahrzeugtyp für diese Route",
    backToRoutes: "← Zurück zu Routen",
    distance: "Entfernung",
    duration: "Dauer",
    serviceType: "Service-Typ",
    transferDropOff: "Transfer und Abgabe",
    dayTrip: "Tagesausflug",
    dayTripReturn: "Tagesausflug (Rückkehr am selben Tag)",
    overnight: "Übernachtung",
    overnightStay: "Übernachtung (1 Nacht)",
    multiDay: "Mehrtägig",
    multiDayTour: "Mehrtägige Tour (2+ Nächte)",
    transfer: "Transfer"
  }
};

export default function TransfersPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1); // 1: Route Selection, 2: Vehicle Selection
  const [activeTab, setActiveTab] = useState("intercity");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [routeOptions, setRouteOptions] = useState<RouteData[]>([]);
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [selectedCityForLocal, setSelectedCityForLocal] = useState("");
  const [showLocalRoutes, setShowLocalRoutes] = useState(false);
  const { toast } = useToast();
  const { i18n } = useTranslation();
  
  // Get current language and ensure it's valid
  const currentLanguage = i18n.language || 'en';
  const language = ['en', 'es', 'fr', 'de'].includes(currentLanguage) ? currentLanguage : 'en';

  // Get translated content based on current language
  const t = transfersContent[language as keyof typeof transfersContent] || transfersContent.en;

  // Fetch cities
  const { data: cities = [] } = useTranslatedQuery<CityData[]>("/api/cities");

  // Fetch routes
  const { data: routes = [] } = useTranslatedQuery<RouteData[]>("/api/routes");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFromCity("");
    setToCity("");
    setSelectedCityForLocal("");
    setShowLocalRoutes(false);
    setCurrentStep(1);
    setSelectedRoute(null);
  };

  const handleRouteSelection = (route: RouteData) => {
    setSelectedRoute(route);
    setCurrentStep(2);
    
    if (activeTab === "intercity") {
      setFromCity(route.fromCityId?.toString() || "");
      setToCity(route.toCityId?.toString() || "");
    } else {
      setSelectedCityForLocal(route.fromCityId?.toString() || "");
      setShowLocalRoutes(true);
    }
  };

  const getValidPrice = (route: RouteData, vehicleType: string): number => {
    const price = route.vehiclePrices?.[vehicleType] || route.basePriceByVehicle?.[vehicleType];
    return typeof price === 'number' ? price : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              {t.subtitle}
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                <span>{t.instantQuotes}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>{t.noHiddenFees}</span>
              </div>
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-2" />
                <span>{t.licensedDrivers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          // Step 1: Route Selection
          <>
            {/* Tab Interface */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="intercity" className="flex items-center space-x-2">
                  <Plane className="w-4 h-4" />
                  <span>{t.intercityTravel}</span>
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>{t.localTours}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intercity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Navigation className="w-5 h-5" />
                      <span>{t.intercityTransportation}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* City Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.fromCity}</label>
                        <Select value={fromCity} onValueChange={setFromCity}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectDepartureCity} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.toCity}</label>
                        <Select value={toCity} onValueChange={setToCity}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectDestinationCity} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Suggested Routes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {fromCity || toCity ? t.matchingRoutes : t.popularRoutes}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(() => {
                          let suggestedRoutes = [];
                          
                          if (fromCity && toCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId?.toString() === fromCity && 
                              route.toCityId?.toString() === toCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else if (fromCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId?.toString() === fromCity && 
                              route.toCityId?.toString() !== toCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else if (toCity) {
                            suggestedRoutes = routes.filter(route => 
                              route.toCityId?.toString() === toCity && 
                              route.fromCityId?.toString() !== fromCity &&
                              route.fromCityId !== route.toCityId
                            );
                          } else {
                            suggestedRoutes = routes.filter(route => 
                              route.fromCityId !== route.toCityId
                            );
                          }
                          
                          return suggestedRoutes.slice(0, 6).map((route) => {
                            const fromCityName = cities.find(c => c.id === route.fromCityId)?.name;
                            const toCityName = cities.find(c => c.id === route.toCityId)?.name;
                            
                            return (
                              <div
                                key={route.id}
                                className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                                onClick={() => handleRouteSelection(route)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold text-sm">
                                    {fromCityName} → {toCityName}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs">
                                    {route.tripMode === 'transfer' && t.transferDropOff}
                                    {route.tripMode === 'day_trip' && t.dayTrip}
                                    {route.tripMode === 'overnight' && t.overnight}
                                    {route.tripMode === 'multi_day' && t.multiDay}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{route.distanceKm || 0} km</p>
                                <p className="text-sm text-gray-500 mt-1">{t.clickToSeeVehicleOptions}</p>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="local" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building className="w-5 h-5" />
                      <span>{t.localToursTransportation}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* City Selection for Local */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectCity}</label>
                      <Select value={selectedCityForLocal} onValueChange={(value) => {
                        setSelectedCityForLocal(value);
                        setShowLocalRoutes(true);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.chooseACityForLocalTours} />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Local Routes */}
                    {showLocalRoutes && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          {t.availableLocalRoutes}
                          {selectedCityForLocal === '3' && (
                            <span className="text-sm text-red-500 ml-2">
                              (Debug: {routes.filter(route => route.fromCityId?.toString() === selectedCityForLocal).length} found)
                            </span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {routes
                            .filter(route => 
                              route.fromCityId?.toString() === selectedCityForLocal
                            )
                            .map((route) => {
                              const cityName = cities.find(c => c.id === route.fromCityId)?.name;
                              const toCityName = cities.find(c => c.id === route.toCityId)?.name;
                              
                              return (
                                <div
                                  key={route.id}
                                  className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                                  onClick={() => handleRouteSelection(route)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm">
                                      {route.name || (route.fromCityId === route.toCityId 
                                        ? `${route.fromLocation} → ${route.toLocation}`
                                        : `${cityName} → ${toCityName}`
                                      )}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {route.tripMode === 'transfer' && t.transfer}
                                      {route.tripMode === 'day_trip' && t.dayTrip}
                                      {route.tripMode === 'overnight' && t.overnight}
                                      {route.tripMode === 'multi_day' && t.multiDay}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600">{route.distanceKm || 0} km</p>
                                  <p className="text-sm text-gray-500 mt-1">{t.clickToSeeVehicleOptions}</p>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Step 2: Vehicle Selection
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.selectVehicle}</h2>
                <p className="text-gray-600 mt-1">{t.choosePreferredVehicleType}</p>
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                {t.backToRoutes}
              </button>
            </div>

            {selectedRoute && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeTab === "intercity" 
                      ? `${cities.find(c => c.id === selectedRoute.fromCityId)?.name} → ${cities.find(c => c.id === selectedRoute.toCityId)?.name}`
                      : selectedRoute.name || `${selectedRoute.fromLocation} → ${selectedRoute.toLocation}`
                    }
                  </CardTitle>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {t.distance}: {selectedRoute.distanceKm || 0} km | 
                      {t.duration}: {selectedRoute.estimatedDuration || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{t.serviceType}:</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRoute.tripMode === 'transfer' && t.transferDropOff}
                        {selectedRoute.tripMode === 'day_trip' && t.dayTripReturn}
                        {selectedRoute.tripMode === 'overnight' && t.overnightStay}
                        {selectedRoute.tripMode === 'multi_day' && t.multiDayTour}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                      // Handle both new format {sedan: "365", minivan: "465"} and old format {"1": {"1": "365"}}
                      const vehiclePrices = selectedRoute.vehiclePrices || {};
                      const basePrices = selectedRoute.basePriceByVehicle || {};
                      
                      // Map vehicle IDs to names
                      const vehicleIdToName = { "1": "sedan", "2": "minivan", "3": "van", "4": "bus" };
                      const vehicleNameToId = { sedan: "1", minivan: "2", van: "3", bus: "4" };
                      
                      let processedPrices: Record<string, string> = {};
                      
                      // Check if vehiclePrices has direct vehicle names (new format)
                      if (vehiclePrices.sedan || vehiclePrices.minivan || vehiclePrices.van) {
                        processedPrices = {
                          sedan: vehiclePrices.sedan || "0",
                          minivan: vehiclePrices.minivan || "0", 
                          van: vehiclePrices.van || "0",
                          ...(vehiclePrices.bus && { bus: vehiclePrices.bus })
                        };
                      } else {
                        // Handle old format with numeric IDs
                        Object.entries(vehiclePrices).forEach(([id, priceData]) => {
                          const vehicleName = vehicleIdToName[id as keyof typeof vehicleIdToName];
                          if (vehicleName && priceData && typeof priceData === 'object') {
                            processedPrices[vehicleName] = (priceData as any)["1"] || "0";
                          }
                        });
                        
                        // Fallback to basePriceByVehicle if vehiclePrices is empty
                        if (Object.keys(processedPrices).length === 0) {
                          Object.entries(basePrices).forEach(([id, priceData]) => {
                            const vehicleName = vehicleIdToName[id as keyof typeof vehicleIdToName];
                            if (vehicleName && priceData && typeof priceData === 'object') {
                              processedPrices[vehicleName] = (priceData as any)["1"] || "0";
                            }
                          });
                        }
                      }
                      
                      return Object.entries(processedPrices)
                        .sort(([a], [b]) => {
                          const order = { sedan: 1, minivan: 2, van: 3, bus: 4 };
                          return (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999);
                        })
                        .map(([vehicleType, price]) => {
                          const priceValue = typeof price === 'number' ? price : (typeof price === 'string' ? parseFloat(price) : 0);
                          const vehicleId = vehicleNameToId[vehicleType as keyof typeof vehicleNameToId] || vehicleType;
                          
                          return (
                            <div
                              key={vehicleType}
                              className="border rounded-lg p-4 hover:border-teal-300 cursor-pointer transition-colors"
                              onClick={() => {
                                // Proceed to booking with dynamic price
                                window.location.href = `/book?route=${selectedRoute.id}&vehicle=${vehicleId}&price=${Math.round(priceValue)}`;
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold capitalize">{vehicleType.replace('_', ' ')}</h3>
                                <Car className="w-5 h-5 text-teal-600" />
                              </div>
                              <p className="text-2xl font-bold text-teal-600">{Math.round(priceValue)} EGP</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {vehicleType === 'sedan' && '1-2 passengers'}
                                {vehicleType === 'minivan' && '3-8 passengers'}
                                {vehicleType === 'van' && '9-15 passengers'}
                                {vehicleType === 'coach' && '16-35 passengers'}
                                {vehicleType === 'bus' && '16-35 passengers'}
                              </p>
                            </div>
                          );
                        });
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}