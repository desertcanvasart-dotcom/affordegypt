import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
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

interface Dish {
  id: number;
  name: string;
  arabicName: string;
  description: string;
  region: string;
  spiceLevel: number;
  difficulty: "Easy" | "Medium" | "Hard";
  cookingTime: string;
  priceRange: string;
  ingredients: string[];
  allergens: string[];
  category: "Appetizer" | "Main" | "Dessert" | "Street Food" | "Beverage";
  popularity: number;
  tried: boolean;
  image: string;
  arPreview?: string;
  nutritionScore: number;
  culturalStory: string;
  bestLocations: string[];
  healthBenefits?: string[];
  servingStyles?: string[];
  preparationMethods?: string[];
  signatureTraits?: string[];
  regionalVariations?: string[];
  cookingMethods?: string[];
}

const egyptianDishes: Dish[] = [
  {
    id: 1,
    name: "Koshari",
    arabicName: "كشري",
    description: "Egypt's national dish - a hearty mix of rice, lentils, pasta, and chickpeas topped with spicy tomato sauce and crispy onions",
    region: "Cairo",
    spiceLevel: 2,
    difficulty: "Medium",
    cookingTime: "45 minutes",
    priceRange: "25-50 EGP",
    ingredients: ["Rice", "Lentils", "Pasta", "Chickpeas", "Tomato sauce", "Onions", "Garlic"],
    allergens: ["Gluten"],
    category: "Main",
    popularity: 95,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/koshary.jpg",
    nutritionScore: 85,
    culturalStory: "Created in the 19th century by mixing various grain dishes from different cultures trading in Egypt",
    bestLocations: ["Abou Tarek - Downtown Cairo", "Koshari El Tahrir", "Koshari Hind"]
  },
  {
    id: 2,
    name: "Ful Medames",
    arabicName: "فول مدمس",
    description: "Traditional breakfast of slow-cooked fava beans served with olive oil, garlic, and lemon",
    region: "Upper Egypt",
    spiceLevel: 1,
    difficulty: "Easy",
    cookingTime: "6 hours",
    priceRange: "15-30 EGP",
    ingredients: ["Fava beans", "Olive oil", "Garlic", "Lemon", "Cumin", "Tahini"],
    allergens: [],
    category: "Main",
    popularity: 90,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/fool-medames.jpg",
    nutritionScore: 92,
    culturalStory: "Ancient dish dating back to Pharaonic times, traditionally cooked overnight in buried clay pots",
    bestLocations: ["Al Malky Restaurant", "Traditional street carts", "Local cafes"]
  },
  {
    id: 3,
    name: "Molokhia",
    arabicName: "ملوخية",
    description: "Green soup made from jute leaves, garlic, and coriander, served with rice and meat",
    region: "Nile Delta",
    spiceLevel: 2,
    difficulty: "Medium",
    cookingTime: "30 minutes",
    priceRange: "40-80 EGP",
    ingredients: ["Molokhia leaves", "Chicken broth", "Garlic", "Coriander", "Rice"],
    allergens: [],
    category: "Main",
    popularity: 80,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/molo5eya.jpg",
    nutritionScore: 88,
    culturalStory: "Originally forbidden for commoners in Pharaonic times as it was considered food for royalty",
    bestLocations: ["Naguib Mahfouz Cafe", "Traditional family restaurants", "Hotel restaurants"]
  },
  {
    id: 4,
    name: "Mahshi",
    arabicName: "محشي",
    description: "Stuffed vegetables (zucchini, eggplant, peppers) filled with rice, herbs, and sometimes meat",
    region: "Alexandria",
    spiceLevel: 2,
    difficulty: "Hard",
    cookingTime: "90 minutes",
    priceRange: "60-120 EGP",
    ingredients: ["Mixed vegetables", "Rice", "Fresh herbs", "Tomato sauce", "Ground meat"],
    allergens: [],
    category: "Main",
    popularity: 75,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/mashi.jpg",
    nutritionScore: 90,
    culturalStory: "Ottoman influence dish that became deeply rooted in Egyptian family traditions",
    bestLocations: ["Alexandrian family restaurants", "Traditional homes", "Coastal restaurants"]
  },
  {
    id: 5,
    name: "Baladi Bread",
    arabicName: "عيش بلدي",
    description: "Traditional Egyptian flatbread baked in wood-fired ovens, the staple of every Egyptian meal",
    region: "All Egypt",
    spiceLevel: 0,
    difficulty: "Medium",
    cookingTime: "3 hours",
    priceRange: "2-5 EGP",
    ingredients: ["Wheat flour", "Water", "Salt", "Yeast"],
    allergens: ["Gluten"],
    category: "Appetizer",
    popularity: 100,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/3esh.jpg",
    nutritionScore: 70,
    culturalStory: "Essential part of Egyptian culture for over 5,000 years, often called 'aysh' meaning life",
    bestLocations: ["Local bakeries", "Street vendors", "Every Egyptian table"]
  },
  {
    id: 6,
    name: "Umm Ali",
    arabicName: "أم علي",
    description: "Warm bread pudding with milk, nuts, and raisins - Egypt's most famous dessert",
    region: "Cairo",
    spiceLevel: 0,
    difficulty: "Easy",
    cookingTime: "20 minutes",
    priceRange: "30-60 EGP",
    ingredients: ["Puff pastry", "Milk", "Sugar", "Nuts", "Raisins", "Coconut"],
    allergens: ["Gluten", "Nuts", "Dairy"],
    category: "Dessert",
    popularity: 85,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/om-3aly.jpg",
    nutritionScore: 60,
    culturalStory: "Named after the wife of Sultan Ezz El Din Aybek, created to celebrate a victory",
    bestLocations: ["Groppi Cafe", "Traditional cafes", "Hotel restaurants"]
  },
  {
    id: 7,
    name: "Hawawshi",
    arabicName: "حواوشي",
    description: "Classic Egyptian meat-stuffed bread - spiced minced beef or lamb mixed with vegetables and herbs, stuffed into baladi bread and baked until crispy golden outside with juicy filling inside.",
    region: "Cairo",
    spiceLevel: 3,
    difficulty: "Medium",
    cookingTime: "25 minutes",
    priceRange: "35-70 EGP",
    ingredients: ["Ground beef or lamb", "Baladi bread", "Onion", "Bell pepper", "Garlic", "Green chilli", "Parsley", "Cumin", "Paprika", "Cinnamon", "Allspice"],
    allergens: ["Gluten"],
    category: "Street Food",
    popularity: 85,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/7awawshy.jpg",
    nutritionScore: 75,
    culturalStory: "Created in Cairo's working-class neighborhoods as a quick, filling meal that's become one of Egypt's most beloved street foods. Often compared to a Middle Eastern-style meat pie or spiced burger in pita, it's popular as a street snack, family meal, or party dish.",
    bestLocations: ["El Refai Restaurant", "Street food vendors", "Local grills", "Cairo street food stalls"],
    signatureTraits: [
      "Crispy and golden on the outside",
      "Juicy, spiced meat filling inside", 
      "Packed with onions, peppers, and warm spices",
      "Perfect balance of texture and flavor"
    ],
    servingStyles: [
      "Sliced in halves or quarters",
      "Served with tahini sauce",
      "Accompanied by pickles",
      "With fresh salad on the side"
    ],
    regionalVariations: [
      "Alexandrian Hawawshi: Spicier version in fresh kneaded dough",
      "Modern twist: Add cheese for extra richness",
      "Lighter version: Use whole wheat pita bread"
    ],
    cookingMethods: [
      "Oven method: 200°C for 20-25 minutes, flip halfway",
      "Skillet method: 5-7 minutes per side on medium heat"
    ]
  },
  {
    id: 8,
    name: "Karkade",
    arabicName: "كركديه",
    description: "Traditional Egyptian hibiscus tea made from dried Hibiscus sabdariffa petals. Deep crimson in color, tart and fruity flavor similar to cranberry. Rich in antioxidants and caffeine-free.",
    region: "Aswan",
    spiceLevel: 0,
    difficulty: "Easy",
    cookingTime: "10 minutes (hot) / 6-12 hours (cold brew)",
    priceRange: "10-25 EGP",
    ingredients: ["Dried hibiscus petals", "Water", "Sugar", "Optional: lemon, cinnamon, clove"],
    allergens: [],
    category: "Beverage",
    popularity: 70,
    tried: false,
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/karkade.jpg",
    nutritionScore: 95,
    culturalStory: "Also spelled Karkaday or Karkadi, this traditional drink holds deep cultural significance in Egypt. Served during weddings and festive gatherings, it's a Ramadan favorite for breaking the fast. Known for medicinal benefits including lowering blood pressure, aiding digestion, and boosting liver health. Can be prepared as cold brew (traditional Egyptian method for smoother taste) or hot brew for stronger flavor.",
    bestLocations: ["Aswan street vendors", "Traditional cafes", "Cairo street cafés with shisha", "Wedding celebrations", "Ramadan iftar tables"],
    healthBenefits: [
      "Lowers blood pressure (clinically studied)",
      "Aids digestion", 
      "Boosts liver health",
      "Rich in vitamin C and antioxidants",
      "Caffeine-free alternative to tea/coffee"
    ],
    servingStyles: [
      "Hot as soothing herbal tea",
      "Cold as refreshing summer drink", 
      "With rosewater for floral twist",
      "Infused with ginger or mint",
      "Mixed with sparkling water as hibiscus soda"
    ],
    preparationMethods: [
      "Cold Brew: Soak petals 6-12 hours for gentler flavor",
      "Hot Brew: Simmer 10-15 minutes for stronger taste"
    ]
  }
];

const regions = ["All Regions", "Cairo", "Alexandria", "Upper Egypt", "Nile Delta", "Aswan"];
const categories = ["All Categories", "Appetizer", "Main", "Dessert", "Street Food", "Beverage"];
const difficulties = ["All Levels", "Easy", "Medium", "Hard"];

export default function CuisinePassport() {
  const [dishes, setDishes] = useState<Dish[]>(egyptianDishes);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>(egyptianDishes);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [showARPreview, setShowARPreview] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const triedCount = dishes.filter(dish => dish.tried).length;
  const progressPercentage = (triedCount / dishes.length) * 100;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let filtered = dishes;

    if (selectedRegion !== "All Regions") {
      filtered = filtered.filter(dish => dish.region === selectedRegion);
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(dish => dish.category === selectedCategory);
    }

    if (selectedDifficulty !== "All Levels") {
      filtered = filtered.filter(dish => dish.difficulty === selectedDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.arabicName.includes(searchTerm) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDishes(filtered);
  }, [selectedRegion, selectedCategory, selectedDifficulty, searchTerm, dishes]);

  const toggleTried = (dishId: number) => {
    const updatedDishes = dishes.map(dish => 
      dish.id === dishId ? { ...dish, tried: !dish.tried } : dish
    );
    setDishes(updatedDishes);
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
      console.error('Camera access error:', error);
      setCameraError('Camera access denied. Please enable camera permissions to use AR features.');
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
      <Helmet>
        <title>Interactive Local Cuisine Flavor Passport - Afford Egypt</title>
        <meta name="description" content="Discover authentic Egyptian cuisine with our interactive flavor passport. Track your culinary journey, explore traditional dishes, and experience AR menu previews." />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />
        
        {/* Hero Section */}
        <header 
          className="min-h-[70vh] flex items-center justify-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('http://travel2egypt.org/wp-content/uploads/2025/06/egyptian-cuisine-hero.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
              Egyptian Cuisine{" "}
              <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
                Flavor Passport
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance">
              Embark on an interactive culinary journey through authentic Egyptian flavors.<br/>
              Track your taste adventures with AR menu previews and cultural stories.
            </p>
            
            {/* Progress Card */}
            <Card className="max-w-md mx-auto mb-8 bg-white/95 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Your Culinary Journey</h3>
                  <Award className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dishes Tried</span>
                    <span className="font-medium">{triedCount}/{dishes.length}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-600 text-center">
                    {triedCount === 0 && "Start your flavor adventure!"}
                    {triedCount > 0 && triedCount < 3 && "Great start! Keep exploring."}
                    {triedCount >= 3 && triedCount < 6 && "You're becoming a food explorer!"}
                    {triedCount >= 6 && "Culinary master in the making!"}
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
                  placeholder="Search dishes..."
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
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-md bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="p-2 border rounded-md bg-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Found {filteredDishes.length} dishes</span>
            </div>
          </div>
        </section>

        {/* Dishes Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDishes.map((dish) => (
                <Card key={dish.id} className={`overflow-hidden transition-all hover:shadow-xl ${dish.tried ? 'ring-2 ring-primary' : ''}`}>
                  <div className="relative">
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={getDifficultyColor(dish.difficulty)}>
                        {dish.difficulty}
                      </Badge>
                      {dish.tried && (
                        <Badge className="bg-primary text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Tried
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTried(dish.id)}
                      className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
                        dish.tried ? 'bg-primary text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${dish.tried ? 'fill-current' : ''}`} />
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
                    <Badge variant="outline" className="mb-3">{dish.region}</Badge>
                    
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{dish.description}</p>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Spice Level:</span>
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
                          Health: {dish.nutritionScore}%
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
                          Details
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
                          Explore
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
                      <Badge>{selectedDish.region}</Badge>
                      <Badge variant="outline">{selectedDish.category}</Badge>
                      <Badge className={getDifficultyColor(selectedDish.difficulty)}>
                        {selectedDish.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedDish.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Cooking Time:</span>
                        <p>{selectedDish.cookingTime}</p>
                      </div>
                      <div>
                        <span className="font-medium">Price Range:</span>
                        <p>{selectedDish.priceRange}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Cultural Story</h4>
                  <p className="text-gray-700 text-sm">{selectedDish.culturalStory}</p>
                </div>

                {selectedDish.healthBenefits && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Health Benefits</h4>
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
                    <h4 className="font-semibold mb-2 text-primary">Serving Styles</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.servingStyles.map((style, index) => (
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
                    <h4 className="font-semibold mb-2 text-blue-600">Preparation Methods</h4>
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
                    <h4 className="font-semibold mb-2 text-orange-600">Signature Traits</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.signatureTraits.map((trait, index) => (
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
                    <h4 className="font-semibold mb-2 text-purple-600">Regional Variations</h4>
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
                    <h4 className="font-semibold mb-2 text-primary">Cooking Methods</h4>
                    <ul className="text-sm space-y-1">
                      {selectedDish.cookingMethods.map((method, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <ChefHat className="w-3 h-3 text-primary" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Best Locations to Try</h4>
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
                    <h4 className="font-semibold mb-2 text-red-600">Allergens</h4>
                    <div className="flex gap-1">
                      {selectedDish.allergens.map((allergen, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => toggleTried(selectedDish.id)}
                    className={selectedDish.tried ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {selectedDish.tried ? "Mark as Not Tried" : "Mark as Tried"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowARPreview(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    AR Preview
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
                    {selectedDish.category === "Beverage" ? "Traditional Egyptian Drink" : "Traditional Egyptian Dish"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Cultural Story */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Star className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">Cultural Story</h3>
                      <p className="text-amber-700 leading-relaxed">{selectedDish.culturalStory}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Cook Time</span>
                    </div>
                    <p className="text-gray-700">{selectedDish.cookingTime}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Price Range</span>
                    </div>
                    <p className="text-gray-700">{selectedDish.priceRange}</p>
                  </div>
                </div>

                {/* Spice Level */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Spice Level</span>
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
                    <span className="font-semibold">Nutrition Score</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-1000" 
                      style={{ width: `${selectedDish.nutritionScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{selectedDish.nutritionScore}% Healthy Score</p>
                </div>

                {/* Best Places to Try */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-800">Best Places to Try</span>
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
                    <span className="font-semibold">Key Ingredients</span>
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
                      selectedDish.tried 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${selectedDish.tried ? 'fill-current' : ''}`} />
                    {selectedDish.tried ? 'Marked as Tried!' : 'Mark as Tried'}
                  </button>
                  
                  <button
                    onClick={closeARPreview}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors flex-1 sm:flex-none"
                  >
                    <X className="w-5 h-5" />
                    Close
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