import { useState, useEffect, useRef } from "react";
import SeoMeta from "@/components/seo-meta";
import { articleSchema } from "@/lib/article-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslation } from "react-i18next";
import { 
  Utensils, 
  MapPin, 
  Star, 
  Heart,
  Camera,
  Clock,
  ChefHat,
  Award,
  Search,
  Filter,
  Flame,
  Leaf,
  DollarSign,
  Users,
  Play,
  Eye,
  CheckCircle,
  TrendingUp,
  X
} from "lucide-react";
import { Link } from "wouter";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";
import { DISH_FACTS, type DishFacts } from "@/lib/cuisine-dishes";

// Sentinel values for the "no filter" option in each dropdown. They are compared
// against, never shown, so they must not be translated — the visible label comes
// from cuisinePassport.filters.*.all.
const ALL_REGIONS = "__all_regions__";
const ALL_CATEGORIES = "__all_categories__";
const ALL_LEVELS = "__all_levels__";

/*
 * Search metadata used to live here as two module constants, both promising
 * "25 Dishes". The page builds itself from DISH_FACTS, which holds nine — so
 * the title of the page, and the description Google shows under it, invited
 * people to a card with 25 dishes on it and delivered nine.
 *
 * The count is read from the data now and interpolated, so it cannot be wrong
 * again: add a dish and the claim follows. cuisine-dishes.test.ts asserts that
 * no locale hardcodes a number in its place.
 *
 * The old comment here said these stay English "the same as every other page's
 * SeoMeta". That is no longer true of any page — the transfer, guide-service,
 * airport, destinations, Sinai, reviews and home meta are all translated — so
 * these are too.
 */

/**
 * A dish as the page uses it: the facts from the data module merged with the
 * prose for the active language.
 */
type Dish = DishFacts & {
  name: string;
  description: string;
  cookingTime: string;
  priceRange: string;
  culturalStory: string;
  ingredients: string[];
  bestLocations: string[];
  signatureTraits?: string[];
  servingStyles?: string[];
  cookingMethods?: string[];
  preparationTips?: string[];
  regionalVariations?: string[];
  traditionalUses?: string[];
  celebrationOccasions?: string[];
  healthBenefits?: string[];
  preparationMethods?: string[];
};

export default function CuisinePassport() {
  const { t } = useTranslation();
  // Counted from the data, never typed. See the note above the component.
  const seoTitle = t("cuisinePassport.seoTitle", { count: DISH_FACTS.length });
  const seoDescription = t("cuisinePassport.seoDescription", {
    count: DISH_FACTS.length,
  });
  const [selectedRegion, setSelectedRegion] = useState(ALL_REGIONS);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedDifficulty, setSelectedDifficulty] = useState(ALL_LEVELS);
  // Which dishes the visitor has ticked off. Held by id rather than on the dish
  // objects, because those are rebuilt from the locale on every language change.
  const [triedIds, setTriedIds] = useState<number[]>([]);

  // The prose half of each dish comes from the locale files; the facts half from
  // the data module. `defaultValue` keeps the page standing if a locale is ever
  // missing an entry — the dish renders with its facts and empty prose rather
  // than throwing, which is what returnObjects does on a missing key.
  const dishes: Dish[] = DISH_FACTS.map((facts) => ({
    ...facts,
    ...(t(`cuisinePassport.dishes.${facts.slug}`, { returnObjects: true, defaultValue: {} }) as object),
  })) as Dish[];

  const regionOptions = [
    { value: ALL_REGIONS, label: t('cuisinePassport.filters.regions.all') },
    { value: "cairo", label: t('cuisinePassport.filters.regions.cairo') },
    { value: "alexandria", label: t('cuisinePassport.filters.regions.alexandria') },
    { value: "upperEgypt", label: t('cuisinePassport.filters.regions.upperEgypt') },
    { value: "nileDelta", label: t('cuisinePassport.filters.regions.nileDelta') },
    { value: "aswan", label: t('cuisinePassport.filters.regions.aswan') },
    { value: "allEgypt", label: t('cuisinePassport.filters.regions.allEgypt') }
  ];

  const categoryOptions = [
    { value: ALL_CATEGORIES, label: t('cuisinePassport.filters.categories.all') },
    { value: "Appetizer", label: t('cuisinePassport.filters.categories.appetizer') },
    { value: "Main", label: t('cuisinePassport.filters.categories.main') },
    { value: "Dessert", label: t('cuisinePassport.filters.categories.dessert') },
    { value: "Street Food", label: t('cuisinePassport.filters.categories.streetFood') },
    { value: "Beverage", label: t('cuisinePassport.filters.categories.beverage') }
  ];

  const difficultyOptions = [
    { value: ALL_LEVELS, label: t('cuisinePassport.filters.difficulties.all') },
    { value: "Easy", label: t('cuisinePassport.filters.difficulties.easy') },
    { value: "Medium", label: t('cuisinePassport.filters.difficulties.medium') },
    { value: "Hard", label: t('cuisinePassport.filters.difficulties.hard') }
  ];

  const regionLabel = (key: string) =>
    regionOptions.find((o) => o.value === key)?.label ?? key;
  const categoryLabel = (key: string) =>
    categoryOptions.find((o) => o.value === key)?.label ?? key;
  const difficultyLabel = (key: string) =>
    difficultyOptions.find((o) => o.value === key)?.label ?? key;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showARPreview, setShowARPreview] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isTried = (dishId: number) => triedIds.includes(dishId);
  const triedCount = triedIds.length;
  const progressPercentage = (triedCount / dishes.length) * 100;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Derived, not state. `dishes` is rebuilt on every render from the locale, so
  // an effect that filtered into state and listed it as a dependency would
  // re-run forever.
  const needle = searchTerm.toLowerCase();
  const filteredDishes = dishes.filter((dish) =>
    (selectedRegion === ALL_REGIONS || dish.region === selectedRegion) &&
    (selectedCategory === ALL_CATEGORIES || dish.category === selectedCategory) &&
    (selectedDifficulty === ALL_LEVELS || dish.difficulty === selectedDifficulty) &&
    (!searchTerm ||
      dish.name.toLowerCase().includes(needle) ||
      dish.arabicName.includes(searchTerm) ||
      dish.description.toLowerCase().includes(needle))
  );

  const toggleTried = (dishId: number) => {
    setTriedIds((ids) =>
      ids.includes(dishId) ? ids.filter((id) => id !== dishId) : [...ids, dishId]
    );
  };

  const getSpiceIcons = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Flame 
        key={i} 
        className={`w-3 h-3 ${i < level ? 'text-red-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const startARCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsARActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error); // i18n-exempt: console, not UI
      setCameraError(t('cuisinePassport.cameraError'));
    }
  };

  const stopARCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
  };

  const closeARPreview = () => {
    stopARCamera();
    setShowARPreview(false);
    setSelectedDish(null);
  };

  // Auto-start camera when AR preview opens
  useEffect(() => {
    if (showARPreview && selectedDish) {
      startARCamera();
    }
  }, [showARPreview, selectedDish]);

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <SeoMeta
        title={seoTitle}
        description={seoDescription}
        canonical="https://affordegypt.com/cuisine-passport"
        ogImage="https://affordegypt.com/images/egyptian-food.jpg"
        schema={[articleSchema({
          headline: seoTitle,
          description: seoDescription,
          canonical: "https://affordegypt.com/cuisine-passport",
          image: "https://affordegypt.com/images/egyptian-food.jpg",
          datePublished: "2025-06-14",
          dateModified: "2026-08-12",
        }), breadcrumbSchema(trailFor("/cuisine-passport")!)]}
        ogType="article"
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        <PageBreadcrumbs />
        
        {/* Hero Section */}
        <header
          className="min-h-[90vh] flex items-center justify-center relative bg-cover bg-center bg-fixed bg-[url('/images/egyptian-food.jpg')]"
        >
          <div className="absolute inset-0 bg-black/60 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
              {`${t('cuisinePassport.hero.title')} `}
              <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
                {t('cuisinePassport.hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
              {t('cuisinePassport.hero.description')}
            </p>
            
            {/* Progress Card */}
            <Card className="max-w-md mx-auto mb-8 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{t('cuisinePassport.progress.title')}</h3>
                  <Award className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('cuisinePassport.progress.dishesTriedLabel')}</span>
                    <span className="font-medium">{`${triedCount}/${dishes.length}`}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">
                    {triedCount === 0 && t('cuisinePassport.progress.messages.start')}
                    {triedCount > 0 && triedCount < 3 && t('cuisinePassport.progress.messages.beginner')}
                    {triedCount >= 3 && triedCount < 6 && t('cuisinePassport.progress.messages.intermediate')}
                    {triedCount >= 6 && t('cuisinePassport.progress.messages.advanced')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Filters Section */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('cuisinePassport.filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="p-2 border rounded-md bg-white"
              >
                {regionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-md bg-white"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="p-2 border rounded-md bg-white"
              >
                {difficultyOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>{t('cuisinePassport.filters.foundDishes', { count: filteredDishes.length })}</span>
            </div>
          </div>
        </section>

        {/* Dishes Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDishes.map((dish) => (
                <Card key={dish.id} className={`overflow-hidden transition-all hover:shadow-xl ${isTried(dish.id) ? 'ring-2 ring-primary' : ''}`}>
                  <div className="relative">
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={getDifficultyColor(dish.difficulty)}>
                        {difficultyLabel(dish.difficulty)}
                      </Badge>
                      {isTried(dish.id) && (
                        <Badge className="bg-primary text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('cuisinePassport.dish.tried')}
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTried(dish.id)}
                      className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
                        isTried(dish.id) ? 'bg-primary text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isTried(dish.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{dish.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{dish.popularity}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-1">{dish.arabicName}</p>
                    <Badge variant="outline" className="mb-3">{regionLabel(dish.region)}</Badge>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{dish.description}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">{`${t('cuisinePassport.dish.spiceLevel')}:`}</span>
                          <div className="flex gap-1">
                            {getSpiceIcons(dish.spiceLevel)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {dish.cookingTime}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <DollarSign className="w-3 h-3" />
                          {dish.priceRange}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Leaf className="w-3 h-3" />
                          {`${t('cuisinePassport.dish.healthLabel')}: ${dish.nutritionScore}%`}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setSelectedDish(dish)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {t('cuisinePassport.dish.details')}
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedDish(dish);
                            setShowARPreview(true);
                          }}
                        >
                          <ChefHat className="w-3 h-3 mr-1" />
                          {t('cuisinePassport.dish.explore')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dish Detail Modal */}
        {selectedDish && !showARPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader className="relative">
                <button
                  onClick={() => setSelectedDish(null)}
                  className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
                <div className="grid md:grid-cols-2 gap-6">
                  <img 
                    src={selectedDish.image} 
                    alt={selectedDish.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <div>
                    <CardTitle className="text-2xl mb-2">{selectedDish.name}</CardTitle>
                    <p className="text-gray-600 mb-2">{selectedDish.arabicName}</p>
                    <div className="flex gap-2 mb-4">
                      <Badge>{regionLabel(selectedDish.region)}</Badge>
                      <Badge variant="outline">{categoryLabel(selectedDish.category)}</Badge>
                      <Badge className={getDifficultyColor(selectedDish.difficulty)}>
                        {difficultyLabel(selectedDish.difficulty)}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedDish.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{t('cuisinePassport.dish.cookingTime')}:</span>
                        <p>{selectedDish.cookingTime}</p>
                      </div>
                      <div>
                        <span className="font-medium">{t('cuisinePassport.dish.priceRange')}:</span>
                        <p>{selectedDish.priceRange}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">{t('cuisinePassport.dish.culturalStory')}</h4>
                  <p className="text-gray-700 text-sm">{selectedDish.culturalStory}</p>
                </div>

                {selectedDish.healthBenefits && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">{t('cuisinePassport.dish.healthBenefits')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.healthBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Leaf className="w-3 h-3 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.servingStyles && (
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">{t('cuisinePassport.dish.servingStyles')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.servingStyles!.map((style, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ChefHat className="w-3 h-3 text-primary" />
                          {style}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.preparationMethods && (
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">{t('cuisinePassport.dish.preparationMethods')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.preparationMethods.map((method, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-blue-500" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.signatureTraits && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">{t('cuisinePassport.dish.signatureTraits')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.signatureTraits!.map((trait, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-orange-500" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.regionalVariations && (
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-600">{t('cuisinePassport.dish.regionalVariations')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.regionalVariations.map((variation, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          {variation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.cookingMethods && (
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">{t('cuisinePassport.dish.cookingMethods')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.cookingMethods!.map((method, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ChefHat className="w-3 h-3 text-primary" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.preparationTips && (
                  <div>
                    <h4 className="font-semibold mb-2 text-yellow-600">{t('cuisinePassport.dish.preparationTips')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.preparationTips!.map((tip, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-yellow-500" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.traditionalUses && (
                  <div>
                    <h4 className="font-semibold mb-2 text-amber-600">{t('cuisinePassport.dish.traditionalUses')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.traditionalUses.map((use, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-amber-500" />
                          {use}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedDish.celebrationOccasions && (
                  <div>
                    <h4 className="font-semibold mb-2 text-pink-600">{t('cuisinePassport.dish.celebrationOccasions')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.celebrationOccasions.map((occasion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Heart className="w-3 h-3 text-pink-500" />
                          {occasion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">{t('cuisinePassport.dish.ingredients')}</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t('cuisinePassport.dish.bestLocations')}</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.bestLocations.map((location, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-primary" />
                          {location}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedDish.allergens.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">{t('cuisinePassport.dish.allergens')}</h4>
                    <div className="flex gap-1">
                      {selectedDish.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {t(`cuisinePassport.allergens.${allergen}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => toggleTried(selectedDish.id)}
                    className={isTried(selectedDish.id) ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isTried(selectedDish.id) ? t('cuisinePassport.dish.markAsNotTried') : t('cuisinePassport.dish.markAsTried')}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowARPreview(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {t('cuisinePassport.dish.arPreview')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dish Details Modal */}
        {selectedDish && showARPreview && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader className="relative">
                <button
                  onClick={closeARPreview}
                  className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center pr-12">
                  <h2 className="text-3xl font-bold text-primary mb-2">{selectedDish.name}</h2>
                  <p className="text-xl text-gray-600 mb-3">{selectedDish.arabicName}</p>
                  <Badge className="bg-primary text-white">
                    {selectedDish.category === "Beverage" ? t('cuisinePassport.badges.traditionalDrink') : t('cuisinePassport.badges.traditionalDish')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Cultural Story */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">{t('cuisinePassport.dish.culturalStory')}</h3>
                      <p className="text-amber-700 leading-relaxed">{selectedDish.culturalStory}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{t('cuisinePassport.dish.cookingTime')}</span>
                    </div>
                    <p className="text-gray-700">{selectedDish.cookingTime}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{t('cuisinePassport.dish.priceRange')}</span>
                    </div>
                    <p className="text-gray-700">{selectedDish.priceRange}</p>
                  </div>
                </div>

                {/* Spice Level */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{t('cuisinePassport.dish.spiceLevel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {getSpiceIcons(selectedDish.spiceLevel)}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">({selectedDish.spiceLevel})</span>
                  </div>
                </div>

                {/* Nutrition Score */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">{t('cuisinePassport.dish.nutritionScore')}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-1000" 
                      style={{ width: `${selectedDish.nutritionScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{selectedDish.nutritionScore}% {t('cuisinePassport.dish.healthyScore')}</p>
                </div>

                {/* Best Places to Try */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-800">{t('cuisinePassport.dish.bestPlacesToTry')}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedDish.bestLocations.map((location, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-blue-100">
                        <p className="text-blue-700 font-medium">{location}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Ingredients */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{t('cuisinePassport.dish.keyIngredients')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDish.ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="bg-white border-gray-300">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button
                    onClick={() => toggleTried(selectedDish.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors flex-1 ${
                      isTried(selectedDish.id)
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isTried(selectedDish.id) ? 'fill-current' : ''}`} />
                    {isTried(selectedDish.id) ? t('cuisinePassport.dish.markedAsTried') : t('cuisinePassport.dish.markAsTried')}
                  </button>
                  
                  <button
                    onClick={closeARPreview}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                  >
                    <X className="w-5 h-5" />
                    {t('cuisinePassport.dish.close')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}