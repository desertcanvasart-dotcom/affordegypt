import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Ticket, ChevronDown, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatEGP } from "@/lib/utils";

interface EntranceFee {
  slug: string;
  name: string;
  city: string;
  price_per_person: number;
  currency?: string;
  notes?: string | null;
}

interface EntranceFeesSearchProps {
  entranceFees: EntranceFee[];
  selectedEntranceFees: string[]; // slugs
  onEntranceFeesChange: (slugs: string[]) => void;
  cityName: string;
}

// Entrance-fee picker for the multi-city planner. Selections are slugs, priced
// per-person on the server (entrance_fees.price_per_person × travelers).
export default function EntranceFeesSearch({
  entranceFees,
  selectedEntranceFees,
  onEntranceFeesChange,
  cityName,
}: EntranceFeesSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const cityFees = useMemo(() => {
    const c = (cityName || "").trim().toLowerCase();
    return entranceFees.filter((f) => (f.city || "").trim().toLowerCase() === c);
  }, [entranceFees, cityName]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return cityFees.filter((f) => f.name?.toLowerCase().includes(term));
  }, [cityFees, searchTerm]);

  const toggle = (slug: string) => {
    const next = selectedEntranceFees.includes(slug)
      ? selectedEntranceFees.filter((s) => s !== slug)
      : [...selectedEntranceFees, slug];
    onEntranceFeesChange(next);
  };

  const displayText =
    selectedEntranceFees.length === 0
      ? t("entranceFees.placeholder")
      : selectedEntranceFees.length === 1
        ? cityFees.find((f) => f.slug === selectedEntranceFees[0])?.name ??
          t("entranceFees.selected", { count: 1 })
        : t("entranceFees.selected", { count: selectedEntranceFees.length });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="truncate">{displayText}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-teal-600" />
              <h3 className="font-semibold">
                {t("entranceFees.headingForCity", { city: cityName })}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {selectedEntranceFees.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => onEntranceFeesChange([])}>
                  {t("entranceFees.clearAll")}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("entranceFees.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <div className="p-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t("entranceFees.noneFound", { city: cityName })}</p>
              </div>
            ) : (
              filtered.map((f) => (
                <div
                  key={f.slug}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedEntranceFees.includes(f.slug)
                      ? "border-teal-200 bg-teal-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggle(f.slug)}
                >
                  <Checkbox
                    checked={selectedEntranceFees.includes(f.slug)}
                    onCheckedChange={() => toggle(f.slug)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight">{f.name}</h4>
                    {f.notes && <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{f.notes}</p>}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatEGP(f.price_per_person)}
                    {/* The per-person suffix is a word, not punctuation: /pp
                        reads as nothing in German. */}
                    <span className="text-xs text-gray-500">
                      {t("entranceFees.perPerson")}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <Button onClick={() => setIsOpen(false)} className="w-full" size="sm">
            <Check className="w-4 h-4 mr-2" />
            {selectedEntranceFees.length > 0
              ? t("entranceFees.doneWith", { count: selectedEntranceFees.length })
              : t("entranceFees.done")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
