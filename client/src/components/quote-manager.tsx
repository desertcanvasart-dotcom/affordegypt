import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  Trash2, 
  Edit3, 
  Copy, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign,
  Search,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface SavedQuote {
  id: number;
  name: string;
  jsonBlob: string;
  total: string;
  commissionPct: string;
  createdAt: string;
  travelers?: number;
  cities?: string[];
}

interface QuoteManagerProps {
  currentQuote?: any;
  onLoadQuote?: (quote: any) => void;
}

export default function QuoteManager({ currentQuote, onLoadQuote }: QuoteManagerProps) {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "total" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [quoteName, setQuoteName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved quotes
  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["/api/quotes"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Save quote mutation
  const saveQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/quotes", data);
    },
    onSuccess: () => {
      toast({
        title: t('home.quoteSaved'),
        description: t('home.quoteSavedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setShowSaveForm(false);
      setQuoteName("");
    },
    onError: () => {
      toast({
        title: t('home.saveFailed'),
        description: t('home.saveFailedDescription'),
        variant: "destructive",
      });
    },
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/quotes/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('home.quoteDeleted'),
        description: t('home.quoteDeletedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
    onError: () => {
      toast({
        title: t('home.deleteFailed'),
        description: t('home.deleteFailedDescription'),
        variant: "destructive",
      });
    },
  });

  // Duplicate quote mutation
  const duplicateQuoteMutation = useMutation({
    mutationFn: async (quote: SavedQuote) => {
      return apiRequest("POST", "/api/quotes", {
        ...JSON.parse(quote.jsonBlob),
        name: `${quote.name} (Copy)`,
      });
    },
    onSuccess: () => {
      toast({
        title: t('home.quoteDuplicated'),
        description: t('home.quoteDuplicatedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
    },
  });

  const handleSaveQuote = () => {
    if (!currentQuote || !quoteName.trim()) return;
    
    saveQuoteMutation.mutate({
      ...currentQuote,
      name: quoteName.trim(),
    });
  };

  const handleLoadQuote = (quote: SavedQuote) => {
    if (onLoadQuote) {
      const quoteData = JSON.parse(quote.jsonBlob);
      onLoadQuote(quoteData);
      toast({
        title: t('home.quoteLoaded'),
        description: t('home.quoteLoadedDescription'),
      });
    }
  };

  const handleBookNow = (quote: SavedQuote) => {
    setLocation(`/booking/${quote.id}`);
  };

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter((quote: SavedQuote) => 
      quote.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.cities?.some(city => city.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a: SavedQuote, b: SavedQuote) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case "total":
          aVal = parseFloat(a.total || "0");
          bVal = parseFloat(b.total || "0");
          break;
        case "name":
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
          break;
        default: // date
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }
      
      const modifier = sortOrder === "asc" ? 1 : -1;
      return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0;
    });

  const getQuoteDetails = (quote: SavedQuote) => {
    try {
      const data = JSON.parse(quote.jsonBlob);
      return {
        travelers: data.totalTravelers || data.travelers || 1,
        cities: data.cityServices?.map((cs: any) => cs.cityName) || [],
        // commissionPct is stored as a fraction (0.15 = 15%). Don't divide by 100.
        totalWithCommission: Math.round(parseFloat(quote.total) * (1 + parseFloat(quote.commissionPct || "0"))),
      };
    } catch {
      return {
        travelers: 1,
        cities: [],
        totalWithCommission: parseFloat(quote.total || "0"),
      };
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            {t('home.quoteManager')}
          </CardTitle>
          {currentQuote && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSaveForm(!showSaveForm)}
            >
              {t('home.saveCurrentQuote')}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Save Current Quote Form */}
        {showSaveForm && currentQuote && (
          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Input
                  placeholder={t('home.enterQuoteName')}
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveQuote}
                    disabled={!quoteName.trim() || saveQuoteMutation.isPending}
                    size="sm"
                  >
                    {saveQuoteMutation.isPending ? t('home.saving') : t('home.saveQuote')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSaveForm(false)}
                  >
                    {t('home.cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Sort Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('home.searchQuotesPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "date" ? "name" : sortBy === "name" ? "total" : "date")}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              {sortBy === "date" ? t('home.date') : sortBy === "name" ? t('home.name') : t('home.price')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1"
            >
              {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Quotes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? t('home.noQuotesMatchSearch') : t('home.noSavedQuotesYet')}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map((quote: SavedQuote) => {
              const details = getQuoteDetails(quote);
              
              return (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{quote.name || `Quote #${quote.id}`}</h4>
                          <Badge variant="outline" className="text-xs">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {details.travelers} traveler{details.travelers > 1 ? 's' : ''}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {details.cities.length} cit{details.cities.length === 1 ? 'y' : 'ies'}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${details.totalWithCommission}
                          </div>
                        </div>
                        
                        {details.cities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {details.cities.slice(0, 3).map((city, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {city}
                              </Badge>
                            ))}
                            {details.cities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{details.cities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {onLoadQuote && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadQuote(quote)}
                            title="Load quote"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateQuoteMutation.mutate(quote)}
                          title="Duplicate quote"
                          disabled={duplicateQuoteMutation.isPending}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuoteMutation.mutate(quote.id)}
                          title="Delete quote"
                          disabled={deleteQuoteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleBookNow(quote)}
                          className="ml-2"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}