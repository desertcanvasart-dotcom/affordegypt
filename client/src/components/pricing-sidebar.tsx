import { Calculator, Download, Bookmark, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useBookingState } from "@/lib/booking-state";

export default function PricingSidebar() {
  const { bookingData } = useBookingState();

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["/api/calculate-pricing", bookingData],
    enabled: !!(bookingData.vehicleTypeId || bookingData.tourGuideId || bookingData.selectedAddOns.length > 0),
    queryFn: async () => {
      const response = await fetch("/api/calculate-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
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
        {/* Selected Items */}
        <div className="space-y-4">
          {bookingData.fromCityId && bookingData.toCityId && bookingData.vehicleTypeId && (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm">Transportation</span>
              <span className="font-medium text-foreground">
                {isLoading ? "..." : pricing ? `$${(parseFloat(pricing.subtotal) * 0.7).toFixed(2)}` : "$0.00"}
              </span>
            </div>
          )}
          
          {bookingData.tourGuideId ? (
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm">Tour Guide</span>
              <span className="font-medium text-foreground">
                {isLoading ? "..." : pricing ? `$${(parseFloat(pricing.subtotal) * 0.3).toFixed(2)}` : "$0.00"}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center py-2 border-b border-border text-muted-foreground">
              <span className="text-sm">Tour Guide</span>
              <span className="text-sm">Not selected</span>
            </div>
          )}
          
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

        {/* Price Breakdown */}
        {pricing && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${pricing.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Portal Commission ({(pricing.commissionRate * 100).toFixed(1)}%)</span>
              <span>${pricing.commission}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes & Fees</span>
              <span>${pricing.taxes}</span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="pricing-red">${pricing.total}</span>
              </div>
            </div>
          </div>
        )}

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
