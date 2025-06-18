import { Calculator, Download, Bookmark, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useBookingState } from "@/lib/booking-state";

export default function PricingSidebar() {
  const { bookingData } = useBookingState();

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["/api/calculate-pricing", bookingData],
    enabled: !!(bookingData.routeId || bookingData.guideLanguage || bookingData.selectedAttractions.length > 0 || bookingData.selectedAddOns.length > 0),
    queryFn: async () => {
      const response = await fetch("/api/calculate-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: bookingData.routeId,
          vehicleTypeId: bookingData.vehicleTypeId,
          cityId: bookingData.cityId,
          guideLanguage: bookingData.guideLanguage,
          guideHours: 8,
          attractionIds: bookingData.selectedAttractions || [],
          addOnIds: bookingData.selectedAddOns || [],
          travelers: bookingData.travelers || 1
        }),
      });
      if (!response.ok) throw new Error("Failed to calculate pricing");
      return response.json();
    },
  });

  const handleDownloadQuote = () => {
    // Implementation for PDF quote generation
    console.log("Download quote clicked");
  };

  const handleSaveQuote = () => {
    // Implementation for saving quote
    console.log("Save quote clicked");
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="text-primary mr-2" size={20} />
          Your Quote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm">Routes:</span>
            <span className="font-medium text-foreground">
              {isLoading ? "..." : pricing ? `${pricing.breakdown?.routes || 0} EGP` : "0 EGP"}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm">Guide:</span>
            <span className="font-medium text-foreground">
              {isLoading ? "..." : pricing ? `${pricing.breakdown?.guide || 0} EGP` : "0 EGP"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm">Attractions:</span>
            <span className="font-medium text-foreground">
              {isLoading ? "..." : pricing ? `${pricing.breakdown?.attractions || 0} EGP` : "0 EGP"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-sm">Add-ons:</span>
            <span className="font-medium text-foreground">
              {isLoading ? "..." : pricing ? `${pricing.breakdown?.addons || 0} EGP` : "0 EGP"}
            </span>
          </div>
          
          {bookingData.selectedAddOns.length > 0 ? (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm">Add-ons ({bookingData.selectedAddOns.length})</span>
              <span className="font-medium text-foreground">Included</span>
            </div>
          ) : (
            <div className="flex justify-between items-center py-2 border-b border-border text-muted-foreground">
              <span className="text-sm">Add-ons</span>
              <span className="text-sm">Not selected</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">
              {isLoading ? "..." : pricing ? `${pricing.total} EGP` : "0 EGP"}
            </span>
          </div>
        </div>

        {/* Commission Tier */}
        {pricing && (
          <div className={`${pricing.commissionTier === "Premium Tier" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"} border rounded-lg p-4`}>
            <div className="flex items-center">
              <Info className={`${pricing.commissionTier === "Premium Tier" ? "text-blue-600" : "text-green-600"} mr-2`} size={16} />
              <span className={`text-sm font-medium ${pricing.commissionTier === "Premium Tier" ? "text-blue-800" : "text-green-800"}`}>
                {pricing.commissionTier} ({(pricing.commissionRate * 100).toFixed(1)}% commission)
              </span>
            </div>
            {pricing.commissionTier === "Budget Tier" && (
              <p className="text-xs text-green-700 mt-1">Spend $100+ to unlock 8% commission tier</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={handleDownloadQuote}
            disabled={!pricing}
          >
            <Download className="mr-2" size={16} />
            Download Quote
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleSaveQuote}
            disabled={!pricing}
          >
            <Bookmark className="mr-2" size={16} />
            Save for Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
