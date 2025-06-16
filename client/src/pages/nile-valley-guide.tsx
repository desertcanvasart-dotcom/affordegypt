import { useState, useEffect } from "react";
import { MapPin, Clock, Camera, Star, Navigation, Plane, Train, Ship } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NileCity {
  id: number;
  name: string;
  arabicName: string;
  region: "Lower Egypt" | "Middle Egypt" | "Upper Egypt" | "Nubia";
  latitude: number;
  longitude: number;
  population: string;
  highlights: string[];
  bestTimeToVisit: string;
  averageStay: string;
  keyAttractions: {
    name: string;
    description: string;
    entryFee: string;
    hours: string;
  }[];
  transportation: {
    fromCairo: string;
    localTransport: string[];
  };
  budgetTips: string[];
  image: string;
}

const nileValleyCities: NileCity[] = [
  {
    id: 1,
    name: "Cairo",
    arabicName: "القاهرة",
    region: "Lower Egypt",
    latitude: 30.0444,
    longitude: 31.2357,
    population: "20+ million",
    highlights: ["Pyramids of Giza", "Egyptian Museum", "Islamic Cairo", "Khan el-Khalili Bazaar"],
    bestTimeToVisit: "October - April",
    averageStay: "3-4 days",
    keyAttractions: [
      {
        name: "Pyramids of Giza",
        description: "The last surviving Wonder of the Ancient World, including the Great Pyramid and Sphinx",
        entryFee: "700 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Egyptian Museum",
        description: "World's finest collection of ancient Egyptian artifacts including Tutankhamun's treasures",
        entryFee: "550 EGP",
        hours: "9:00 AM - 5:00 PM"
      },
      {
        name: "Citadel of Saladin",
        description: "Medieval Islamic fortification with stunning views of Cairo",
        entryFee: "550 EGP",
        hours: "8:00 AM - 5:00 PM"
      }
    ],
    transportation: {
      fromCairo: "Starting point",
      localTransport: ["Metro", "Taxi", "Uber", "Bus"]
    },
    budgetTips: [
      "Use metro for cheap transportation (5-15 EGP)",
      "Eat at local restaurants (50-100 EGP per meal)",
      "Stay in Downtown Cairo for budget accommodation",
      "Visit free mosques and markets"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/pyramid-of-giza.jpg"
  },
  {
    id: 2,
    name: "Beni Suef",
    arabicName: "بني سويف",
    region: "Middle Egypt",
    latitude: 29.0661,
    longitude: 31.0994,
    population: "250,000",
    highlights: ["Meidum Pyramid", "Rural Nile landscapes", "Traditional markets"],
    bestTimeToVisit: "October - April",
    averageStay: "1 day",
    keyAttractions: [
      {
        name: "Meidum Pyramid",
        description: "Unique collapsed pyramid showing ancient construction techniques",
        entryFee: "180 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Beni Suef Museum",
        description: "Local artifacts and Pharaonic remains from the region",
        entryFee: "120 EGP",
        hours: "9:00 AM - 4:00 PM"
      }
    ],
    transportation: {
      fromCairo: "2 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Tuk-tuk"]
    },
    budgetTips: [
      "Very affordable local food (20-50 EGP)",
      "Basic accommodation available (200-400 EGP/night)",
      "Bargain at local markets"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/beni-suef-1.jpg"
  },
  {
    id: 3,
    name: "Minya",
    arabicName: "المنيا",
    region: "Middle Egypt",
    latitude: 28.1099,
    longitude: 30.7503,
    population: "260,000",
    highlights: ["Tell el-Amarna", "Beni Hassan tombs", "Tuna el-Gebel"],
    bestTimeToVisit: "October - April",
    averageStay: "2 days",
    keyAttractions: [
      {
        name: "Tell el-Amarna",
        description: "Akhenaten's capital city with unique Amarna Period art",
        entryFee: "200 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Beni Hassan",
        description: "Middle Kingdom tombs with well-preserved wall paintings",
        entryFee: "200 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Tuna el-Gebel",
        description: "Greco-Roman necropolis and ibis mummy catacombs",
        entryFee: "200 EGP",
        hours: "8:00 AM - 4:00 PM"
      }
    ],
    transportation: {
      fromCairo: "4 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Felucca"]
    },
    budgetTips: [
      "Stay at Akhenaten Hotel for budget option",
      "Take shared taxis between sites",
      "Local restaurants very affordable (30-70 EGP)"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/el-minya.jpg"
  },
  {
    id: 4,
    name: "Asyut",
    arabicName: "أسيوط",
    region: "Middle Egypt",
    latitude: 27.1783,
    longitude: 31.1859,
    population: "420,000",
    highlights: ["Coptic monasteries", "Traditional crafts", "Nile corniche"],
    bestTimeToVisit: "October - April",
    averageStay: "1-2 days",
    keyAttractions: [
      {
        name: "Monastery of the Virgin Mary",
        description: "Important Coptic Christian pilgrimage site",
        entryFee: "Free",
        hours: "6:00 AM - 6:00 PM"
      },
      {
        name: "Asyut Barrage",
        description: "Historic Nile dam with scenic views",
        entryFee: "Free",
        hours: "24 hours"
      }
    ],
    transportation: {
      fromCairo: "5 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Horse cart"]
    },
    budgetTips: [
      "Very budget-friendly destination",
      "Traditional workshops for handicrafts",
      "Cheap Nile boat rides"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/asyut.jpg"
  },
  {
    id: 5,
    name: "Sohag",
    arabicName: "سوهاج",
    region: "Upper Egypt",
    latitude: 26.5569,
    longitude: 31.6948,
    population: "290,000",
    highlights: ["Red and White Monasteries", "Akhmim textiles", "Rural culture"],
    bestTimeToVisit: "October - April",
    averageStay: "1-2 days",
    keyAttractions: [
      {
        name: "Red Monastery",
        description: "5th-century Coptic monastery with stunning frescoes",
        entryFee: "50 EGP",
        hours: "8:00 AM - 5:00 PM"
      },
      {
        name: "White Monastery",
        description: "Ancient Coptic monastery with unique architecture",
        entryFee: "50 EGP",
        hours: "8:00 AM - 5:00 PM"
      },
      {
        name: "Akhmim",
        description: "Traditional textile weaving town on the Nile",
        entryFee: "Free",
        hours: "Daylight hours"
      }
    ],
    transportation: {
      fromCairo: "6 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Bicycle"]
    },
    budgetTips: [
      "Stay in local guesthouses",
      "Visit textile workshops for authentic souvenirs",
      "Extremely affordable local food"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/abydos-temple.jpg"
  },
  {
    id: 6,
    name: "Qena",
    arabicName: "قنا",
    region: "Upper Egypt",
    latitude: 26.1551,
    longitude: 32.7160,
    population: "235,000",
    highlights: ["Gateway to Dendera", "Traditional pottery", "Nile islands"],
    bestTimeToVisit: "October - April",
    averageStay: "1 day",
    keyAttractions: [
      {
        name: "Dendera Temple Complex",
        description: "Best-preserved temple complex dedicated to goddess Hathor",
        entryFee: "300 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Qena Pottery Quarter",
        description: "Traditional pottery workshops using ancient techniques",
        entryFee: "Free",
        hours: "8:00 AM - 6:00 PM"
      }
    ],
    transportation: {
      fromCairo: "7 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Horse cart"]
    },
    budgetTips: [
      "Base for visiting Dendera Temple",
      "Buy authentic pottery directly from artisans",
      "Very affordable accommodation options"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/dendera-temple.jpg"
  },
  {
    id: 7,
    name: "Luxor",
    arabicName: "الأقصر",
    region: "Upper Egypt",
    latitude: 25.6872,
    longitude: 32.6396,
    population: "507,000",
    highlights: ["Valley of the Kings", "Karnak Temple", "Luxor Temple", "West Bank tombs"],
    bestTimeToVisit: "October - March",
    averageStay: "3-4 days",
    keyAttractions: [
      {
        name: "Valley of the Kings",
        description: "Royal burial ground with elaborately decorated tombs",
        entryFee: "750 EGP for 3 tombs",
        hours: "6:00 AM - 4:00 PM"
      },
      {
        name: "Karnak Temple",
        description: "Massive temple complex dedicated to Amun-Ra",
        entryFee: "600 EGP",
        hours: "6:00 AM - 5:30 PM"
      },
      {
        name: "Luxor Temple",
        description: "Beautiful temple in the heart of modern Luxor",
        entryFee: "500 EGP",
        hours: "6:00 AM - 9:00 PM"
      },
      {
        name: "Temple of Hatshepsut",
        description: "Mortuary temple of Egypt's famous female pharaoh",
        entryFee: "140 EGP",
        hours: "6:00 AM - 4:00 PM"
      }
    ],
    transportation: {
      fromCairo: "10 hours by train, 1 hour flight",
      localTransport: ["Taxi", "Bicycle", "Caleche", "Felucca"]
    },
    budgetTips: [
      "Stay on West Bank for cheaper accommodation",
      "Rent bicycle to explore sites",
      "Eat at local restaurants away from tourist areas",
      "Buy combination tickets for multiple sites"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/balloon-in-luxor.jpg"
  },
  {
    id: 8,
    name: "Edfu",
    arabicName: "إدفو",
    region: "Upper Egypt",
    latitude: 24.9777,
    longitude: 32.8713,
    population: "133,000",
    highlights: ["Temple of Horus", "Traditional markets", "Nile cruise stop"],
    bestTimeToVisit: "October - March",
    averageStay: "Half day",
    keyAttractions: [
      {
        name: "Temple of Horus",
        description: "Best-preserved ancient Egyptian temple",
        entryFee: "550 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Edfu Market",
        description: "Traditional local market with authentic atmosphere",
        entryFee: "Free",
        hours: "Morning hours"
      }
    ],
    transportation: {
      fromCairo: "12 hours by train/bus",
      localTransport: ["Horse cart", "Taxi", "Walking"]
    },
    budgetTips: [
      "Perfect for Nile cruise stopovers",
      "Horse cart ride to temple is authentic experience",
      "Local food very affordable"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/edfu.jpg"
  },
  {
    id: 9,
    name: "Kom Ombo",
    arabicName: "كوم أمبو",
    region: "Upper Egypt",
    latitude: 24.4539,
    longitude: 32.9478,
    population: "67,000",
    highlights: ["Double temple", "Crocodile museum", "Sugar cane fields"],
    bestTimeToVisit: "October - March",
    averageStay: "Half day",
    keyAttractions: [
      {
        name: "Temple of Kom Ombo",
        description: "Unique double temple dedicated to Sobek and Haroeris",
        entryFee: "450 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Crocodile Museum",
        description: "Mummified crocodiles and artifacts related to Sobek worship",
        entryFee: "Free",
        hours: "8:00 AM - 4:00 PM"
      }
    ],
    transportation: {
      fromCairo: "13 hours by train/bus",
      localTransport: ["Horse cart", "Taxi", "Walking"]
    },
    budgetTips: [
      "Combine with Edfu visit for efficiency",
      "Beautiful sunset views from temple",
      "Small town with basic amenities"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/ko-mombo-temple.jpg"
  },
  {
    id: 10,
    name: "Aswan",
    arabicName: "أسوان",
    region: "Upper Egypt",
    latitude: 24.0889,
    longitude: 32.8998,
    population: "290,000",
    highlights: ["Philae Temple", "High Dam", "Nubian villages", "Elephantine Island"],
    bestTimeToVisit: "October - March",
    averageStay: "2-3 days",
    keyAttractions: [
      {
        name: "Philae Temple",
        description: "Beautiful temple complex on an island, dedicated to Isis",
        entryFee: "550 EGP + boat fees",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "High Dam",
        description: "Engineering marvel that created Lake Nasser",
        entryFee: "200 EGP",
        hours: "8:00 AM - 5:00 PM"
      },
      {
        name: "Unfinished Obelisk",
        description: "Ancient granite quarry showing obelisk carving techniques",
        entryFee: "220 EGP",
        hours: "8:00 AM - 4:00 PM"
      },
      {
        name: "Nubian Village",
        description: "Colorful traditional villages showcasing Nubian culture",
        entryFee: "Boat ride 200-300 EGP",
        hours: "Daylight hours"
      }
    ],
    transportation: {
      fromCairo: "14 hours by train, 1.5 hours flight",
      localTransport: ["Felucca", "Taxi", "Motorboat"]
    },
    budgetTips: [
      "Stay near the souk for atmosphere",
      "Take felucca rides at sunset",
      "Visit Nubian villages for authentic culture",
      "Excellent value spice shopping"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/philae-temple.jpg"
  },
  {
    id: 11,
    name: "Abu Simbel",
    arabicName: "أبو سمبل",
    region: "Nubia",
    latitude: 22.3372,
    longitude: 31.6256,
    population: "2,600",
    highlights: ["Great Temple of Ramesses II", "Temple of Nefertari", "UNESCO World Heritage"],
    bestTimeToVisit: "October - March",
    averageStay: "1 day",
    keyAttractions: [
      {
        name: "Great Temple of Ramesses II",
        description: "Massive rock-cut temple relocated to save from flooding",
        entryFee: "875 EGP",
        hours: "6:00 AM - 5:00 PM"
      },
      {
        name: "Temple of Nefertari",
        description: "Smaller temple dedicated to Ramesses II's beloved queen",
        entryFee: "Free",
        hours: "6:00 AM - 5:00 PM"
      }
    ],
    transportation: {
      fromCairo: "Flight to Aswan + 3-hour drive",
      localTransport: ["Tour bus", "Private car"]
    },
    budgetTips: [
      "Day trip from Aswan is most economical",
      "Join group tours to split costs",
      "Bring lunch and water",
      "Early morning arrival for best photos"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/abu-simbel.jpg"
  }
];

export default function NileValleyGuide() {
  const [selectedCity, setSelectedCity] = useState<NileCity | null>(nileValleyCities[0]); // Default to Cairo
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const regions = ["All", "Lower Egypt", "Middle Egypt", "Upper Egypt", "Nubia"];
  
  const filteredCities = selectedRegion === "All" 
    ? nileValleyCities 
    : nileValleyCities.filter(city => city.region === selectedRegion);

  const navigateToQuote = () => {
    // Navigate to the pricing tool page
    window.location.href = '/pricing-tool';
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <header 
        className="min-h-[90vh] flex items-center justify-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('http://travel2egypt.org/wp-content/uploads/2025/06/nile-valley-1.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
            Nile Valley{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              Complete Guide
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance text-center">
            Journey through 5,000 years of history along the world's longest river.<br/>
            From Cairo's pyramids to Abu Simbel's temples - your complete Nile adventure.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">11 Historic Cities</h4>
              <p className="text-sm text-white/80">From Cairo to Abu Simbel along the Nile</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">50+ Ancient Sites</h4>
              <p className="text-sm text-white/80">Temples, tombs, and archaeological wonders</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">Budget Planning</h4>
              <p className="text-sm text-white/80">Transportation, accommodation & dining tips</p>
            </div>
          </div>
          
          <Button 
            onClick={navigateToQuote}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1"
          >
            Plan Your Nile Journey →
          </Button>
        </div>
      </header>

      {/* Interactive Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Interactive Nile Valley Map
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {regions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? "default" : "outline"}
                  onClick={() => setSelectedRegion(region)}
                  className="text-sm"
                >
                  {region}
                </Button>
              ))}
            </div>
            
            <div className="relative bg-gradient-to-b from-blue-50 to-amber-50 rounded-lg p-4 sm:p-8 min-h-[400px] sm:min-h-[500px] overflow-hidden">
              {/* Egypt Map SVG Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg viewBox="0 0 400 600" className="w-full h-full max-w-md">
                  <defs>
                    <linearGradient id="egyptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#f4f1de", stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:"#e07a5f", stopOpacity:0.3}} />
                    </linearGradient>
                  </defs>
                  {/* Egypt country outline - simplified */}
                  <path 
                    d="M 50 50 
                       L 350 50 
                       L 350 120
                       L 320 140
                       L 300 160
                       L 280 180
                       L 260 200
                       L 240 240
                       L 220 280
                       L 200 320
                       L 180 360
                       L 160 400
                       L 140 440
                       L 120 480
                       L 100 520
                       L 80 550
                       L 50 580
                       L 30 560
                       L 20 540
                       L 15 520
                       L 10 500
                       L 8 480
                       L 5 460
                       L 3 440
                       L 2 420
                       L 1 400
                       L 2 380
                       L 5 360
                       L 10 340
                       L 15 320
                       L 20 300
                       L 25 280
                       L 30 260
                       L 35 240
                       L 40 220
                       L 45 200
                       L 48 180
                       L 50 160
                       L 50 140
                       L 50 120
                       L 50 100
                       L 50 80
                       L 50 60
                       Z" 
                    fill="url(#egyptGradient)" 
                    stroke="#d4a574" 
                    strokeWidth="2"
                  />
                  {/* Red Sea */}
                  <path 
                    d="M 350 120 
                       L 380 140
                       L 390 180
                       L 385 220
                       L 375 260
                       L 365 300
                       L 350 340
                       L 320 360
                       L 300 380
                       L 280 400
                       L 260 420
                       L 240 440
                       L 220 460
                       L 200 480
                       L 180 500
                       L 160 520
                       L 140 540
                       L 120 560
                       L 100 580
                       L 80 590
                       L 80 550
                       L 100 520
                       L 120 480
                       L 140 440
                       L 160 400
                       L 180 360
                       L 200 320
                       L 220 280
                       L 240 240
                       L 260 200
                       L 280 180
                       L 300 160
                       L 320 140
                       Z" 
                    fill="rgba(59, 130, 246, 0.2)" 
                    stroke="rgba(59, 130, 246, 0.4)" 
                    strokeWidth="1"
                  />
                  {/* Nile River */}
                  <path 
                    d="M 200 50 
                       Q 190 100 185 150
                       Q 180 200 175 250
                       Q 170 300 165 350
                       Q 160 400 155 450
                       Q 150 500 145 530
                       L 120 550
                       L 100 565
                       L 85 580" 
                    fill="none" 
                    stroke="rgba(59, 130, 246, 0.6)" 
                    strokeWidth="4"
                  />
                  {/* Nile Delta */}
                  <path 
                    d="M 200 50 
                       Q 150 80 120 120
                       Q 160 90 200 50
                       Q 250 80 280 120
                       Q 220 70 200 50" 
                    fill="rgba(34, 197, 94, 0.3)" 
                    stroke="rgba(34, 197, 94, 0.5)" 
                    strokeWidth="1"
                  />
                  
                  {/* Desert Labels */}
                  <text x="90" y="300" fill="#8B4513" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.7">
                    Western
                  </text>
                  <text x="90" y="315" fill="#8B4513" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.7">
                    Desert
                  </text>
                  
                  <text x="310" y="300" fill="#8B4513" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.7">
                    Eastern
                  </text>
                  <text x="310" y="315" fill="#8B4513" fontSize="12" fontWeight="bold" textAnchor="middle" opacity="0.7">
                    Desert
                  </text>
                  
                  {/* Desert terrain indicators */}
                  {/* Western Desert sand dunes */}
                  <circle cx="70" cy="200" r="3" fill="#D2B48C" opacity="0.4"/>
                  <circle cx="85" cy="210" r="2" fill="#D2B48C" opacity="0.4"/>
                  <circle cx="75" cy="380" r="4" fill="#D2B48C" opacity="0.4"/>
                  <circle cx="90" cy="370" r="2" fill="#D2B48C" opacity="0.4"/>
                  <circle cx="60" cy="450" r="3" fill="#D2B48C" opacity="0.4"/>
                  
                  {/* Eastern Desert rocky terrain */}
                  <polygon points="320,200 325,195 330,200 325,205" fill="#8B7355" opacity="0.5"/>
                  <polygon points="335,250 340,245 345,250 340,255" fill="#8B7355" opacity="0.5"/>
                  <polygon points="315,380 320,375 325,380 320,385" fill="#8B7355" opacity="0.5"/>
                  <polygon points="340,420 345,415 350,420 345,425" fill="#8B7355" opacity="0.5"/>
                </svg>
              </div>
              
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border">
                <p className="text-xs sm:text-sm font-medium text-gray-700">📍 Click cities to explore</p>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Simplified Nile River visualization */}
                <div className="w-2 bg-blue-400 h-full absolute left-1/2 transform -translate-x-1/2 rounded-full opacity-40"></div>
                
                {/* City markers positioned along the "river" */}
                <div className="relative w-full h-full">
                  {filteredCities.map((city, index) => (
                    <div
                      key={city.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        selectedCity?.id === city.id ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        left: '50%',
                        top: `${(index / (filteredCities.length - 1)) * 80 + 10}%`
                      }}
                      onClick={() => {
                        setSelectedCity(city);
                        // Scroll to city details card after a short delay to allow state update
                        setTimeout(() => {
                          const element = document.getElementById('selected-city-details');
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'center',
                              inline: 'nearest'
                            });
                          }
                        }, 100);
                      }}
                    >
                      <div className={`
                        flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 shadow-lg
                        ${selectedCity?.id === city.id 
                          ? 'bg-primary text-white border-primary scale-110 shadow-xl' 
                          : 'bg-white border-gray-300 hover:border-primary hover:scale-105 hover:shadow-xl hover:bg-primary/5'
                        }
                      `}>
                        <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedCity?.id === city.id ? 'animate-pulse' : ''}`} />
                        <span className="font-medium text-xs sm:text-sm">{city.name}</span>
                        <Badge variant={selectedCity?.id === city.id ? "outline" : "secondary"} className="text-xs hidden sm:block">
                          {city.region}
                        </Badge>
                      </div>
                      {selectedCity?.id === city.id && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-ping"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected City Details */}
          {selectedCity && (
            <Card id="selected-city-details" className="p-6 border-primary border-2">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedCity.name}</h3>
                  <p className="text-gray-600 mb-1">{selectedCity.arabicName}</p>
                  <Badge className="mb-4">{selectedCity.region}</Badge>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>Population: {selectedCity.population}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Best time: {selectedCity.bestTimeToVisit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>Recommended stay: {selectedCity.averageStay}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">Key Highlights:</h4>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    {selectedCity.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mb-2">Budget Tips:</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedCity.budgetTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <img 
                    src={selectedCity.image} 
                    alt={selectedCity.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <h4 className="font-semibold mb-3">Transportation:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="w-4 h-4 text-primary" />
                      <span className="text-sm">{selectedCity.transportation.fromCairo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="text-sm">Local: {selectedCity.transportation.localTransport.join(', ')}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">Top Attractions:</h4>
                  <div className="space-y-2">
                    {selectedCity.keyAttractions.slice(0, 2).map((attraction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium">{attraction.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{attraction.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Entry: {attraction.entryFee}</span>
                          <span>Hours: {attraction.hours}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Complete City Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Complete Nile Valley City Guide
          </h2>
          
          <div className="grid gap-8">
            {nileValleyCities.map((city) => (
              <Card key={city.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img 
                      src={city.image} 
                      alt={city.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">{city.name}</h3>
                      <Badge>{city.region}</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-1">{city.arabicName}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">Population:</span> {city.population}
                      </div>
                      <div>
                        <span className="font-medium">Best time:</span> {city.bestTimeToVisit}
                      </div>
                      <div>
                        <span className="font-medium">Stay duration:</span> {city.averageStay}
                      </div>
                      <div>
                        <span className="font-medium">From Cairo:</span> {city.transportation.fromCairo}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Highlights:</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline">{highlight}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Top Attractions:</h4>
                        <ul className="text-sm space-y-1">
                          {city.keyAttractions.slice(0, 3).map((attraction, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{attraction.name}</span>
                              <span className="text-primary">{attraction.entryFee}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Budget Tips:</h4>
                        <ul className="text-sm space-y-1">
                          {city.budgetTips.slice(0, 2).map((tip, index) => (
                            <li key={index} className="text-gray-600">• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transportation Guide */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nile Valley Transportation Guide
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Train className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Train Travel</h3>
              <p className="text-gray-600 mb-4">
                Comfortable overnight trains connect Cairo to Luxor and Aswan. 
                Book sleeping cars for long journeys.
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• Cairo-Luxor: 1000-1250 EGP</li>
                <li>• Cairo-Aswan: 1100-1450 EGP</li>
                <li>• AC coaches available</li>
                <li>• Night trains include meals</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Ship className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Nile Cruises</h3>
              <p className="text-gray-600 mb-4">
                Luxor to Aswan cruises stop at Edfu and Kom Ombo. 
                3-7 day options available.
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• 3-4 days: 14500-17000 EGP</li>
                <li>• All meals included</li>
                <li>• Site entrance fees extra</li>
                <li>• Best Oct-Apr weather</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Domestic Flights</h3>
              <p className="text-gray-600 mb-4">
                Quick flights to Luxor, Aswan, and Abu Simbel. 
                Book early for better prices.
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• Cairo-Luxor: 4300-6000 EGP</li>
                <li>• Cairo-Aswan: 5200-7000 EGP</li>
                <li>• Abu Simbel day trips</li>
                <li>• 1-2 hour flight times</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Planning Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Essential Planning Tips
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Best Time to Visit</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">October - March (Peak Season)</h4>
                  <p className="text-sm text-gray-600">Perfect weather, comfortable temperatures (20-25°C), higher prices</p>
                </div>
                <div>
                  <h4 className="font-medium">April - May (Shoulder Season)</h4>
                  <p className="text-sm text-gray-600">Warm but manageable (25-30°C), fewer crowds, good prices</p>
                </div>
                <div>
                  <h4 className="font-medium">June - September (Low Season)</h4>
                  <p className="text-sm text-gray-600">Very hot (35-45°C), lowest prices, early morning visits essential</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Budget Breakdown (Per Day)</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Budget Traveler</h4>
                  <p className="text-sm text-gray-600">Hostel/guesthouse, local food, public transport: 800-1200 EGP</p>
                </div>
                <div>
                  <h4 className="font-medium">Mid-Range Traveler</h4>
                  <p className="text-sm text-gray-600">3-star hotel, mix of restaurants, private transport: 2300-3500 EGP</p>
                </div>
                <div>
                  <h4 className="font-medium">Luxury Traveler</h4>
                  <p className="text-sm text-gray-600">5-star hotels, fine dining, guided tours: 9000+ EGP</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Cultural Etiquette</h3>
              <ul className="space-y-2 text-sm">
                <li>• Dress modestly, especially at religious sites</li>
                <li>• Remove shoes when entering mosques</li>
                <li>• Ask permission before photographing people</li>
                <li>• Bargain respectfully at markets</li>
                <li>• Tip service staff (10-15%)</li>
                <li>• Learn basic Arabic greetings</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">Health & Safety</h3>
              <ul className="space-y-2 text-sm">
                <li>• Drink bottled water only</li>
                <li>• Use sunscreen and hat in summer</li>
                <li>• Pack basic medications</li>
                <li>• Get travel insurance</li>
                <li>• Keep copies of documents</li>
                <li>• Use registered tour guides</li>
                <li>• Stay hydrated in desert climate</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}