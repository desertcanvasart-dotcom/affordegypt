import { useState, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Search, Plus, Minus, Package, Users, Calendar, Star, X, Check } from "lucide-react";

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

/**
 * Categories are free text in the add-ons table and have already picked up a
 * trailing space: both "Lunch" and "Lunch " are stored, which rendered as two
 * identical "Lunch" filter chips, each matching only half the lunches.
 * Trimming here collapses them into one working filter. The stored values
 * still need cleaning — this stops the UI lying about them meanwhile.
 */
const normaliseCategory = (category: string) => category.trim();

export function AddOnsSearch({
  addOns,
  selectedAddOns,
  onAddOnsChange,
  cityId,
  cityName,
  unitTypeFilter
}: AddOnsSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

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
      const categoryMatch =
        selectedCategory === "all" ||
        normaliseCategory(addOn.category) === selectedCategory;
      
      return cityMatch && unitTypeMatch && searchMatch && categoryMatch;
    });
  }, [addOns, cityId, unitTypeFilter, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(
      addOns
        .filter(a => (a.cityId === null || a.cityId === cityId) && (!unitTypeFilter || a.unitType === unitTypeFilter))
        .map(a => normaliseCategory(a.category))
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

  /**
   * Icons keyed on the categories the add-ons table actually stores.
   *
   * The previous map listed Meals / Transportation / Activities /
   * Accommodation / Equipment / Services / Entertainment / Shopping /
   * Insurance / Documentation — a taxonomy nothing in the data uses, so every
   * row fell through to the generic 📦 box.
   */
  const getCategoryIcon = (category: string) => {
    const icons = {
      'Dinner': '🍽️',
      'Lunch': '🍽️',
      'Felucca Ride': '⛵',
      'Horse Carriage': '🐴',
      'Sunrise-Baloon Ride': '🎈',
      'Post-Sunrise-Balloon Ride': '🎈',
    };
    return icons[category as keyof typeof icons] || '📦';
  };

  const getUnitTypeLabel = (unitType: string) => {
    const key = `addons.unitTypes.${unitType}`;
    const label = t(key);
    // i18next echoes the key back when it is missing; show the raw slug instead
    // of a key path if the catalog ever grows a unit type the locales lack.
    return label === key ? unitType : label;
  };

  /**
   * Category names arrive from the database in English ("Dinner", "Felucca
   * Ride") and were rendered raw on the filter chips and on every card, so a
   * German visitor filtered add-ons by English words. Translated through a
   * lookup keyed on the stored value, falling back to that value so a category
   * added later still shows something readable rather than a key path.
   *
   * The English side is not always the identity: the table stores
   * "Sunrise-Baloon Ride", and the locale spells it correctly.
   */
  const getCategoryLabel = (category: string) => {
    const key = `addons.categories.${category}`;
    const label = t(key);
    return label === key ? category : label;
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
    if (selectedAddOns.length === 0) return t('addons.selectAddOns');
    
    const totalItems = selectedAddOns.reduce((sum, addon) => sum + addon.quantity, 0);
    if (selectedAddOns.length === 1) {
      return `${selectedAddOns[0].name} ${totalItems > 1 ? `(×${totalItems})` : ''}`;
    }
    return t('addons.addOnsSelected', { count: selectedAddOns.length, items: totalItems });
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
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleAddOn(addOn)}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCategoryIcon(normaliseCategory(addOn.category))}</span>
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
                {getCategoryLabel(normaliseCategory(addOn.category))}
              </Badge>
            </div>
          </div>
        </div>
        
        {isSelected && addOn.unitType === 'per_unit' && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">{t('addons.quantity')}</span>
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              <h3 className="font-semibold">
                {t('addons.headingForCity', { city: cityName })}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedAddOns.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {t('addons.selectedCount', { count: selectedAddOns.length })}
                </Badge>
              )}
              {selectedAddOns.length > 0 && (
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  {t('addons.clearAll')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('addons.searchPlaceholder')}
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
              {t('addons.allCategories')}
            </Badge>
            {categories.map(category => (
              <Badge 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryIcon(category)} {getCategoryLabel(category)}
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
                  {t('addons.tabs.perPersonTrip', { count: addOnsByType.per_person.length })}
                </TabsTrigger>
                <TabsTrigger value="per_unit" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('addons.tabs.perUnit', { count: addOnsByType.per_unit.length })}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="per_person" className="p-3 space-y-3 mt-3">
                {addOnsByType.per_person.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t('addons.empty.perPerson')}</p>
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
                    <p>{t('addons.empty.perUnit')}</p>
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
                  <p>{t('addons.empty.noMatch')}</p>
                </div>
              ) : (
                filteredAddOns.map(addOn => (
                  <AddOnCard key={addOn.id} addOn={addOn} />
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Done Button */}
        <div className="p-4 border-t">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            {selectedAddOns.length > 0
              ? t('addons.doneWith', { count: selectedAddOns.length })
              : t('addons.done')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}