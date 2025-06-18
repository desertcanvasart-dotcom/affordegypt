import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Search, Plus, Minus, Package, Users, Calendar, Star } from "lucide-react";

interface AddOn {
  id: number;
  name: string;
  description?: string;
  price: string;
  unitType: string;
  category: string;
  cityId?: number | null;
}

interface SelectedAddOn {
  id: number;
  name: string;
  quantity: number;
}

interface AddOnsSearchProps {
  addOns: AddOn[];
  selectedAddOns: SelectedAddOn[];
  onAddOnsChange: (addOns: SelectedAddOn[]) => void;
  cityId: number;
  cityName: string;
  unitTypeFilter?: 'per_person' | 'per_trip' | 'per_unit';
}

export function AddOnsSearch({ 
  addOns, 
  selectedAddOns, 
  onAddOnsChange, 
  cityId,
  cityName,
  unitTypeFilter 
}: AddOnsSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter add-ons based on criteria
  const filteredAddOns = useMemo(() => {
    return addOns.filter(addOn => {
      // City filter
      const cityMatch = addOn.cityId === null || addOn.cityId === cityId;
      
      // Unit type filter
      const unitTypeMatch = !unitTypeFilter || addOn.unitType === unitTypeFilter;
      
      // Search filter
      const searchMatch = !searchTerm || 
        addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addOn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addOn.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const categoryMatch = selectedCategory === "all" || addOn.category === selectedCategory;
      
      return cityMatch && unitTypeMatch && searchMatch && categoryMatch;
    });
  }, [addOns, cityId, unitTypeFilter, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(
      addOns
        .filter(a => (a.cityId === null || a.cityId === cityId) && (!unitTypeFilter || a.unitType === unitTypeFilter))
        .map(a => a.category)
    ));
    return cats.sort();
  }, [addOns, cityId, unitTypeFilter]);

  // Group add-ons by unit type for tabbed view
  const addOnsByType = useMemo(() => {
    const grouped = {
      per_person: filteredAddOns.filter(a => a.unitType === 'per_person' || a.unitType === 'per_trip'),
      per_unit: filteredAddOns.filter(a => a.unitType === 'per_unit')
    };
    return grouped;
  }, [filteredAddOns]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      'Meals': '🍽️',
      'Transportation': '🚗',
      'Activities': '🎯',
      'Accommodation': '🏨',
      'Equipment': '📱',
      'Services': '🔧',
      'Entertainment': '🎭',
      'Shopping': '🛍️',
      'Insurance': '🛡️',
      'Documentation': '📋'
    };
    return icons[category as keyof typeof icons] || '📦';
  };

  const getUnitTypeLabel = (unitType: string) => {
    switch (unitType) {
      case 'per_person': return 'Per Person';
      case 'per_trip': return 'Per Trip';
      case 'per_unit': return 'Per Unit';
      default: return unitType;
    }
  };

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case 'per_person': return 'bg-blue-100 text-blue-800';
      case 'per_trip': return 'bg-green-100 text-green-800';
      case 'per_unit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleAddOn = (addOn: AddOn) => {
    const existing = selectedAddOns.find(a => a.id === addOn.id);
    if (existing) {
      onAddOnsChange(selectedAddOns.filter(a => a.id !== addOn.id));
    } else {
      onAddOnsChange([...selectedAddOns, { id: addOn.id, name: addOn.name, quantity: 1 }]);
    }
  };

  const updateQuantity = (addOnId: number, quantity: number) => {
    if (quantity <= 0) {
      onAddOnsChange(selectedAddOns.filter(a => a.id !== addOnId));
    } else {
      onAddOnsChange(selectedAddOns.map(a => 
        a.id === addOnId ? { ...a, quantity } : a
      ));
    }
  };

  const getDisplayText = () => {
    if (selectedAddOns.length === 0) return "Select add-ons...";
    
    const totalItems = selectedAddOns.reduce((sum, addon) => sum + addon.quantity, 0);
    if (selectedAddOns.length === 1) {
      return `${selectedAddOns[0].name} ${totalItems > 1 ? `(×${totalItems})` : ''}`;
    }
    return `${selectedAddOns.length} add-ons selected (${totalItems} items)`;
  };

  const clearAll = () => {
    onAddOnsChange([]);
  };

  const AddOnCard = ({ addOn }: { addOn: AddOn }) => {
    const selectedAddOn = selectedAddOns.find(a => a.id === addOn.id);
    const isSelected = !!selectedAddOn;
    const quantity = selectedAddOn?.quantity || 0;

    return (
      <div className={`border rounded-lg p-3 ${isSelected ? 'border-teal-200 bg-teal-50' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleAddOn(addOn)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getCategoryIcon(addOn.category)}</span>
                <h4 className="font-medium text-sm">{addOn.name}</h4>
              </div>
              
              {addOn.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{addOn.description}</p>
              )}
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getUnitTypeColor(addOn.unitType)}`}>
                  {getUnitTypeLabel(addOn.unitType)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {addOn.category}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-teal-600">EGP {Math.round(parseFloat(addOn.price))}</div>
            <div className="text-xs text-gray-500">{getUnitTypeLabel(addOn.unitType)}</div>
          </div>
        </div>
        
        {isSelected && addOn.unitType === 'per_unit' && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">Quantity:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(addOn.id, quantity - 1)}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-8 text-center">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(addOn.id, quantity + 1)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-teal-600" />
            {getDisplayText()}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">Add-ons for {cityName}</h3>
            </div>
            {selectedAddOns.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search add-ons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1 flex-wrap">
            <Badge 
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryIcon(category)} {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!unitTypeFilter ? (
            <Tabs defaultValue="per_person" className="w-full">
              <TabsList className="w-full m-3 mb-0">
                <TabsTrigger value="per_person" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Per Person/Trip ({addOnsByType.per_person.length})
                </TabsTrigger>
                <TabsTrigger value="per_unit" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Per Unit ({addOnsByType.per_unit.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="per_person" className="p-3 space-y-3 mt-3">
                {addOnsByType.per_person.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No per-person add-ons available</p>
                  </div>
                ) : (
                  addOnsByType.per_person.map(addOn => (
                    <AddOnCard key={addOn.id} addOn={addOn} />
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="per_unit" className="p-3 space-y-3 mt-3">
                {addOnsByType.per_unit.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No per-unit add-ons available</p>
                  </div>
                ) : (
                  addOnsByType.per_unit.map(addOn => (
                    <AddOnCard key={addOn.id} addOn={addOn} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="p-3 space-y-3">
              {filteredAddOns.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No add-ons found matching your criteria</p>
                </div>
              ) : (
                filteredAddOns.map(addOn => (
                  <AddOnCard key={addOn.id} addOn={addOn} />
                ))
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}