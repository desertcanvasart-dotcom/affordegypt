import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Calendar, Percent, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface QuoteBreakdown {
  date?: Date;
  services?: Array<{
    id: number;
    service: { title: string; type: string };
    subtotal: string;
    passengers: number;
  }>;
  dayTotal?: string;
  discount?: string;
  type?: string;
  description?: string;
  amount?: string;
}

interface Quote {
  totalAmount: string;
  breakdown: QuoteBreakdown[];
}

interface PricingSidebarProps {
  quote?: Quote;
}

export function PricingSidebar({ quote }: PricingSidebarProps) {
  const dailyBreakdowns = quote?.breakdown?.filter(item => item.date) || [];
  const adjustments = quote?.breakdown?.filter(item => item.type) || [];
  const totalAmount = parseFloat(quote?.totalAmount || "0");

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "tour":
        return "bg-green-100 text-green-800";
      case "guide":
        return "bg-purple-100 text-purple-800";
      case "addon":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 sticky top-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-teal-600" />
            <span>Pricing Summary</span>
          </CardTitle>
          <CardDescription>
            Real-time pricing for your custom itinerary
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {totalAmount === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No services added yet</p>
              <p className="text-sm">Start adding services to see pricing</p>
            </div>
          ) : (
            <>
              {/* Daily Breakdowns */}
              {dailyBreakdowns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                    Daily Breakdown
                  </h4>
                  <div className="space-y-3">
                    {dailyBreakdowns.map((day, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">
                            {day.date && format(new Date(day.date), "MMM d")}
                          </span>
                          <span className="font-medium text-teal-600">
                            EGP {parseFloat(day.dayTotal || "0").toFixed(2)}
                          </span>
                        </div>
                        
                        {day.services && day.services.length > 0 && (
                          <div className="space-y-1">
                            {day.services.map((service, serviceIndex) => (
                              <div key={serviceIndex} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2">
                                  <Badge className={`text-xs ${getServiceTypeColor(service.service.type)}`}>
                                    {service.service.type}
                                  </Badge>
                                  <span className="truncate max-w-32" title={service.service.title}>
                                    {service.service.title}
                                  </span>
                                </div>
                                <span className="text-gray-600">
                                  EGP {parseFloat(service.subtotal).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {day.discount && parseFloat(day.discount) > 0 && (
                          <div className="flex items-center justify-between text-xs text-green-600 mt-1 pt-1 border-t">
                            <span className="flex items-center">
                              <Percent className="h-3 w-3 mr-1" />
                              Day bundle discount
                            </span>
                            <span>-EGP {parseFloat(day.discount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Adjustments (Discounts/Surcharges) */}
              {adjustments.length > 0 && (
                <div>
                  <Separator />
                  <div className="space-y-2">
                    {adjustments.map((adjustment, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">{adjustment.description}</span>
                        </div>
                        <span className="text-green-600 font-medium">
                          EGP {parseFloat(adjustment.amount || "0").toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-teal-600">EGP {totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Prices shown in Egyptian Pounds
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-teal-50 rounded-lg p-3">
                <h5 className="font-medium text-teal-800 mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Options
                </h5>
                <div className="text-sm text-teal-700 space-y-1">
                  <p>• Pay in USD, EUR, or GBP</p>
                  <p>• Secure online payment</p>
                  <p>• Instant confirmation</p>
                </div>
              </div>

              {/* Discount Information */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Percent className="h-4 w-4 mr-2" />
                  Available Discounts
                </h5>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• 5% off days with 3+ services</p>
                  <p>• 3% off trips of 7+ days</p>
                  <p>• Automatic application at checkout</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Checkout Button */}
      {totalAmount > 0 && (
        <Button className="w-full bg-teal-600 hover:bg-teal-700" size="lg">
          <CreditCard className="h-4 w-4 mr-2" />
          Proceed to Checkout
        </Button>
      )}
    </div>
  );
}