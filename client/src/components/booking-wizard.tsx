import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Route, Plus } from "lucide-react";
import PricingSidebar from "./pricing-sidebar";
import { useBookingState } from "@/lib/booking-state";

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const maxSteps = 4;
  
  const {
    bookingData,
    updateTransportation,
    updateGuide,
    updateAddOns,
    resetBooking
  } = useBookingState();

  const { data: cities = [] } = useQuery({
    queryKey: ["/api/cities"],
  });

  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["/api/vehicle-types"],
  });

  const { data: tourGuides = [] } = useQuery({
    queryKey: ["/api/tour-guides"],
    enabled: !!bookingData.fromCityId,
  });

  const { data: addOns = [] } = useQuery({
    queryKey: ["/api/add-ons"],
    enabled: !!bookingData.fromCityId,
  });

  const handleVehicleSelect = (vehicleId: number, transportType: "route_based" | "hour_based") => {
    updateTransportation({
      vehicleTypeId: vehicleId,
      transportType,
    });
  };

  const handleGuideSelect = (guideId: number, guideType: "hourly" | "daily") => {
    updateGuide({
      tourGuideId: guideId,
      guideType,
      guideDays: guideType === "daily" ? 1 : 0,
      guideHours: guideType === "hourly" ? 8 : 0,
    });
  };

  const handleAddOnToggle = (addOnId: number) => {
    const existing = bookingData.selectedAddOns.find(a => a.id === addOnId);
    if (existing) {
      updateAddOns(bookingData.selectedAddOns.filter(a => a.id !== addOnId));
    } else {
      updateAddOns([...bookingData.selectedAddOns, { id: addOnId, quantity: 1 }]);
    }
  };

  const nextStep = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 1: return "Transportation";
      case 2: return "Tour Guide";
      case 3: return "Add-ons";
      case 4: return "Review & Book";
      default: return "";
    }
  };

  return (
    <section className="py-20 bg-muted" id="booking-wizard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Build Your Egypt Adventure
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select transportation, choose your guide, add experiences. Get instant pricing with no surprises.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Step {currentStep} of {maxSteps}</span>
                <span className="text-sm text-muted-foreground">{getStepName(currentStep)}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentStep / maxSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step 1: Transportation */}
            {currentStep === 1 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Route className="text-primary mr-3" size={24} />
                    Transportation & Route
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* City Selection */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">From City</label>
                      <Select 
                        value={bookingData.fromCityId?.toString()} 
                        onValueChange={(value) => updateTransportation({ fromCityId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select departure city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">To City</label>
                      <Select 
                        value={bookingData.toCityId?.toString()} 
                        onValueChange={(value) => updateTransportation({ toCityId: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.filter((city: any) => city.id !== bookingData.fromCityId).map((city: any) => (
                            <SelectItem key={city.id} value={city.id.toString()}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Transport Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">Transport Type</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div 
                        className={`selection-card ${bookingData.transportType === "route_based" ? "selected" : ""}`}
                        onClick={() => updateTransportation({ transportType: "route_based" })}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Route-Based</span>
                          <span className="text-green-600 font-semibold">$45</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Fixed route with scheduled stops</p>
                      </div>
                      <div 
                        className={`selection-card ${bookingData.transportType === "hour_based" ? "selected" : ""}`}
                        onClick={() => updateTransportation({ transportType: "hour_based" })}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Hour-Based</span>
                          <span className="text-green-600 font-semibold">$15/hr</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Flexible timing, pay per hour</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">Vehicle Type</label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {vehicleTypes.map((vehicle: any) => (
                        <div 
                          key={vehicle.id}
                          className={`selection-card ${bookingData.vehicleTypeId === vehicle.id ? "selected" : ""}`}
                          onClick={() => updateTransportation({ vehicleTypeId: vehicle.id })}
                        >
                          <img 
                            src={vehicle.image} 
                            alt={vehicle.name} 
                            className="w-full h-32 object-cover rounded-lg mb-3" 
                          />
                          <div className="text-center">
                            <div className="font-medium">{vehicle.name}</div>
                            <div className="text-sm text-muted-foreground">{vehicle.maxPassengers} passengers</div>
                            <div className="text-green-600 font-semibold mt-1">${vehicle.basePrice}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Passenger Count */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Number of Passengers</label>
                      <Select 
                        value={bookingData.passengerCount?.toString()} 
                        onValueChange={(value) => updateTransportation({ passengerCount: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select passengers" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} passenger{num > 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" className="w-full border-dashed">
                        <Plus className="mr-2" size={16} />
                        Add Next City
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Tour Guide */}
            {currentStep === 2 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select Tour Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {tourGuides.map((guide: any) => (
                      <div 
                        key={guide.id}
                        className={`selection-card ${bookingData.tourGuideId === guide.id ? "selected" : ""}`}
                        onClick={() => updateGuide({ tourGuideId: guide.id })}
                      >
                        <div className="flex items-center space-x-4">
                          <img 
                            src={guide.image} 
                            alt={guide.name} 
                            className="w-16 h-16 rounded-full object-cover" 
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{guide.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Languages: {guide.languages.join(", ")}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm">Daily: ${guide.dailyRate}</span>
                              <span className="text-sm">Hourly: ${guide.hourlyRate}</span>
                              <span className="text-sm">★ {guide.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Add-ons */}
            {currentStep === 3 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add Experiences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addOns.map((addOn: any) => (
                    <div 
                      key={addOn.id}
                      className={`selection-card ${bookingData.selectedAddOns.some(a => a.id === addOn.id) ? "selected" : ""}`}
                      onClick={() => handleAddOnToggle(addOn.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <img 
                          src={addOn.image} 
                          alt={addOn.name} 
                          className="w-16 h-16 rounded-lg object-cover" 
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{addOn.name}</h4>
                          <p className="text-sm text-muted-foreground">{addOn.description}</p>
                          <div className="text-green-600 font-semibold">EGP {Math.round(parseFloat(addOn.price) * 32)} {addOn.priceUnit.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Review & Book */}
            {currentStep === 4 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Review Your Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Review your selections and proceed to payment.
                  </p>
                  {/* This will be expanded with customer details form */}
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2" size={16} />
                Previous
              </Button>
              <Button 
                onClick={nextStep}
                disabled={currentStep === maxSteps}
                className="btn-primary"
              >
                {currentStep === maxSteps ? "Book Now" : "Continue"}
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <PricingSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
