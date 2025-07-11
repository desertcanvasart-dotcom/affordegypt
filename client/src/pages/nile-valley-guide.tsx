import { useState, useEffect } from "react";
import { MapPin, Clock, Camera, Star, Navigation, Plane, Train, Ship } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  detailImage?: string;
}

const nileValleyCities: NileCity[] = [
  {
    id: 1,
    name: "Alexandria",
    arabicName: "الإسكندرية",
    region: "Lower Egypt",
    latitude: 31.2001,
    longitude: 29.9187,
    population: "5.2 million",
    highlights: ["Library of Alexandria", "Qaitbay Citadel", "Mediterranean beaches", "Ancient Roman sites"],
    bestTimeToVisit: "March - November",
    averageStay: "2-3 days",
    keyAttractions: [
      {
        name: "attractions.alexandria.bibliotheca.name",
        description: "attractions.alexandria.bibliotheca.description",
        entryFee: "attractions.alexandria.bibliotheca.entryFee",
        hours: "attractions.alexandria.bibliotheca.hours"
      },
      {
        name: "attractions.alexandria.qaitbayCitadel.name",
        description: "attractions.alexandria.qaitbayCitadel.description",
        entryFee: "attractions.alexandria.qaitbayCitadel.entryFee",
        hours: "attractions.alexandria.qaitbayCitadel.hours"
      },
      {
        name: "attractions.alexandria.catacombs.name",
        description: "attractions.alexandria.catacombs.description",
        entryFee: "attractions.alexandria.catacombs.entryFee",
        hours: "attractions.alexandria.catacombs.hours"
      }
    ],
    transportation: {
      fromCairo: "2.5 hours by train/bus",
      localTransport: ["Tram", "Bus", "Taxi", "Uber"]
    },
    budgetTips: [
      "budgetTips.alexandria.stayNearCorniche",
      "budgetTips.alexandria.freshSeafood",
      "budgetTips.alexandria.historicTram"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/Alexandria.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/Alexandria.jpg"
  },
  {
    id: 2,
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
        name: "attractions.cairo.pyramidsGiza.name",
        description: "attractions.cairo.pyramidsGiza.description",
        entryFee: "attractions.cairo.pyramidsGiza.entryFee",
        hours: "attractions.cairo.pyramidsGiza.hours"
      },
      {
        name: "attractions.cairo.egyptianMuseum.name",
        description: "attractions.cairo.egyptianMuseum.description",
        entryFee: "attractions.cairo.egyptianMuseum.entryFee",
        hours: "attractions.cairo.egyptianMuseum.hours"
      },
      {
        name: "attractions.cairo.citadelSaladin.name",
        description: "attractions.cairo.citadelSaladin.description",
        entryFee: "attractions.cairo.citadelSaladin.entryFee",
        hours: "attractions.cairo.citadelSaladin.hours"
      }
    ],
    transportation: {
      fromCairo: "Starting point",
      localTransport: ["Metro", "Taxi", "Uber", "Bus"]
    },
    budgetTips: [
      "budgetTips.cairo.useMetro",
      "budgetTips.cairo.localRestaurants",
      "budgetTips.cairo.downtownAccommodation",
      "budgetTips.cairo.freeMosquesMarkets"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/pyramid-of-giza.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/giza-pyramids.jpg"
  },
  {
    id: 3,
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
        name: "attractions.beniSuef.meidumPyramid.name",
        description: "attractions.beniSuef.meidumPyramid.description",
        entryFee: "attractions.beniSuef.meidumPyramid.entryFee",
        hours: "attractions.beniSuef.meidumPyramid.hours"
      },
      {
        name: "attractions.beniSuef.beniSuefMuseum.name",
        description: "attractions.beniSuef.beniSuefMuseum.description",
        entryFee: "attractions.beniSuef.beniSuefMuseum.entryFee",
        hours: "attractions.beniSuef.beniSuefMuseum.hours"
      }
    ],
    transportation: {
      fromCairo: "2 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Tuk-tuk"]
    },
    budgetTips: [
      "budgetTips.beniSuef.affordableFood",
      "budgetTips.beniSuef.basicAccommodation",
      "budgetTips.beniSuef.bargainMarkets"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/beni-suef-1.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/Beni-Suef-.jpg"
  },
  {
    id: 4,
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
      "budgetTips.minya.akhenatonHotel",
      "budgetTips.minya.sharedTaxis",
      "budgetTips.minya.affordableRestaurants"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/el-minya.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/el-minya.jpg"
  },
  {
    id: 5,
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
        name: "attractions.asyut.monasteryVirginMary.name",
        description: "attractions.asyut.monasteryVirginMary.description",
        entryFee: "attractions.asyut.monasteryVirginMary.entryFee",
        hours: "attractions.asyut.monasteryVirginMary.hours"
      },
      {
        name: "attractions.asyut.asyutBarrage.name",
        description: "attractions.asyut.asyutBarrage.description",
        entryFee: "attractions.asyut.asyutBarrage.entryFee",
        hours: "attractions.asyut.asyutBarrage.hours"
      }
    ],
    transportation: {
      fromCairo: "5 hours by train/bus",
      localTransport: ["Taxi", "Microbus", "Horse cart"]
    },
    budgetTips: [
      "budgetTips.asyut.budgetFriendly",
      "budgetTips.asyut.traditionalWorkshops",
      "budgetTips.asyut.cheapBoatRides"
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
        name: "attractions.sohag.redMonastery.name",
        description: "attractions.sohag.redMonastery.description",
        entryFee: "attractions.sohag.redMonastery.entryFee",
        hours: "attractions.sohag.redMonastery.hours"
      },
      {
        name: "attractions.sohag.whiteMonastery.name",
        description: "attractions.sohag.whiteMonastery.description",
        entryFee: "attractions.sohag.whiteMonastery.entryFee",
        hours: "attractions.sohag.whiteMonastery.hours"
      },
      {
        name: "attractions.sohag.akhmim.name",
        description: "attractions.sohag.akhmim.description",
        entryFee: "attractions.sohag.akhmim.entryFee",
        hours: "attractions.sohag.akhmim.hours"
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
        name: "attractions.qena.denderaTemple.name",
        description: "attractions.qena.denderaTemple.description",
        entryFee: "attractions.qena.denderaTemple.entryFee",
        hours: "attractions.qena.denderaTemple.hours"
      },
      {
        name: "attractions.qena.qenaPotteryQuarter.name",
        description: "attractions.qena.qenaPotteryQuarter.description",
        entryFee: "attractions.qena.qenaPotteryQuarter.entryFee",
        hours: "attractions.qena.qenaPotteryQuarter.hours"
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
        name: "attractions.luxor.valleyKings.name",
        description: "attractions.luxor.valleyKings.description",
        entryFee: "attractions.luxor.valleyKings.entryFee",
        hours: "attractions.luxor.valleyKings.hours"
      },
      {
        name: "attractions.luxor.karnakTemple.name",
        description: "attractions.luxor.karnakTemple.description",
        entryFee: "attractions.luxor.karnakTemple.entryFee",
        hours: "attractions.luxor.karnakTemple.hours"
      },
      {
        name: "attractions.luxor.luxorTemple.name",
        description: "attractions.luxor.luxorTemple.description",
        entryFee: "attractions.luxor.luxorTemple.entryFee",
        hours: "attractions.luxor.luxorTemple.hours"
      },
      {
        name: "attractions.luxor.hatshepsutTemple.name",
        description: "attractions.luxor.hatshepsutTemple.description",
        entryFee: "attractions.luxor.hatshepsutTemple.entryFee",
        hours: "attractions.luxor.hatshepsutTemple.hours"
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
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/balloon-in-luxor.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg"
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
    highlights: ["highlights.aswan.philaeTemple", "highlights.aswan.highDam", "highlights.aswan.nubianVillages", "highlights.aswan.elephantineIsland"],
    bestTimeToVisit: "October - March",
    averageStay: "2-3 days",
    keyAttractions: [
      {
        name: "attractions.aswan.philaeTemple.name",
        description: "attractions.aswan.philaeTemple.description",
        entryFee: "attractions.aswan.philaeTemple.entryFee",
        hours: "attractions.aswan.philaeTemple.hours"
      },
      {
        name: "attractions.aswan.highDam.name",
        description: "attractions.aswan.highDam.description",
        entryFee: "attractions.aswan.highDam.entryFee",
        hours: "attractions.aswan.highDam.hours"
      },
      {
        name: "attractions.aswan.unfinishedObelisk.name",
        description: "attractions.aswan.unfinishedObelisk.description",
        entryFee: "attractions.aswan.unfinishedObelisk.entryFee",
        hours: "attractions.aswan.unfinishedObelisk.hours"
      },
      {
        name: "attractions.aswan.nubianVillage.name",
        description: "attractions.aswan.nubianVillage.description",
        entryFee: "attractions.aswan.nubianVillage.entryFee",
        hours: "attractions.aswan.nubianVillage.hours"
      }
    ],
    transportation: {
      fromCairo: "14 hours by train, 1.5 hours flight",
      localTransport: ["Felucca", "Taxi", "Motorboat"]
    },
    budgetTips: [
      "budgetTips.aswan.stayNearSouk",
      "budgetTips.aswan.feluccaRides",
      "budgetTips.aswan.nubianVillages",
      "budgetTips.aswan.spiceShopping"
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
        name: "attractions.abuSimbel.greatTempleRamesses.name",
        description: "attractions.abuSimbel.greatTempleRamesses.description",
        entryFee: "attractions.abuSimbel.greatTempleRamesses.entryFee",
        hours: "attractions.abuSimbel.greatTempleRamesses.hours"
      },
      {
        name: "attractions.abuSimbel.templeNefertari.name",
        description: "attractions.abuSimbel.templeNefertari.description",
        entryFee: "attractions.abuSimbel.templeNefertari.entryFee",
        hours: "attractions.abuSimbel.templeNefertari.hours"
      }
    ],
    transportation: {
      fromCairo: "Flight to Aswan + 3-hour drive",
      localTransport: ["Tour bus", "Private car"]
    },
    budgetTips: [
      "budgetTips.abuSimbel.dayTripFromAswan",
      "budgetTips.abuSimbel.joinGroupTours",
      "budgetTips.abuSimbel.bringLunchWater",
      "budgetTips.abuSimbel.earlyMorningArrival"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/abu-simbel.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/abu-simbel-1.jpg"
  }
];

export default function NileValleyGuide() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<NileCity | null>(nileValleyCities[0]); // Default to Alexandria
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle regions with fallback
  const regionsTranslation = t('blog.nileValley.regions', { returnObjects: true });
  const regions = Array.isArray(regionsTranslation) ? regionsTranslation : ["All", "Lower Egypt", "Middle Egypt", "Upper Egypt", "Nubia"];
  
  // Create a mapping between translated regions and English region names
  const regionMap: { [key: string]: string } = {
    "All": "All",
    "Lower Egypt": "Lower Egypt",
    "Middle Egypt": "Middle Egypt", 
    "Upper Egypt": "Upper Egypt",
    "Nubia": "Nubia",
    // Spanish
    "Todos": "All",
    "Bajo Egipto": "Lower Egypt",
    "Egipto Medio": "Middle Egypt",
    "Alto Egipto": "Upper Egypt",
    // French
    "Tous": "All",
    "Basse-Égypte": "Lower Egypt",
    "Moyenne-Égypte": "Middle Egypt",
    "Haute-Égypte": "Upper Egypt",
    "Nubie": "Nubia",
    // German
    "Alle": "All",
    "Unterägypten": "Lower Egypt",
    "Mittelägypten": "Middle Egypt",
    "Oberägypten": "Upper Egypt",
    "Nubien": "Nubia"
  };
  
  const englishRegion = regionMap[selectedRegion] || selectedRegion;
  const filteredCities = englishRegion === "All" 
    ? nileValleyCities 
    : nileValleyCities.filter(city => city.region === englishRegion);

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
            {t('blog.nileValley.title')}{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              {t('blog.nileValley.subtitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance text-center">
            {t('blog.nileValley.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{t('blog.nileValley.hero.features.cities.title')}</h4>
              <p className="text-sm text-white/80">{t('blog.nileValley.hero.features.cities.description')}</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{t('blog.nileValley.hero.features.sites.title')}</h4>
              <p className="text-sm text-white/80">{t('blog.nileValley.hero.features.sites.description')}</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{t('blog.nileValley.hero.features.budget.title')}</h4>
              <p className="text-sm text-white/80">{t('blog.nileValley.hero.features.budget.description')}</p>
            </div>
          </div>
          
          <Button 
            onClick={navigateToQuote}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1"
          >
            {t('blog.nileValley.hero.cta')} →
          </Button>
        </div>
      </header>

      {/* Interactive Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('blog.nileValley.map.title')}
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
                <p className="text-xs sm:text-sm font-medium text-gray-700">{t('blog.nileValley.map.clickCities')}</p>
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
                        top: filteredCities.length === 1 
                          ? '50%' 
                          : `${(index / (filteredCities.length - 1)) * 70 + 15}%`
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
                      <span>{t('blog.nileValley.cityDetails.population')} {selectedCity.population}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{t('blog.nileValley.cityDetails.bestTime')} {selectedCity.bestTimeToVisit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>{t('blog.nileValley.cityDetails.recommendedStay')} {selectedCity.averageStay}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{t('blog.nileValley.cityDetails.keyHighlights')}</h4>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    {selectedCity.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mb-2">{t('blog.nileValley.cityDetails.budgetTips')}</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedCity.budgetTips.map((tip, index) => (
                      <li key={index}>{t(tip)}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <img 
                    src={selectedCity.detailImage || selectedCity.image} 
                    alt={selectedCity.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <h4 className="font-semibold mb-3">{t('blog.nileValley.cityDetails.transportation')}</h4>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="w-4 h-4 text-primary" />
                      <span className="text-sm">{selectedCity.transportation.fromCairo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="text-sm">{t('blog.nileValley.cityDetails.localTransport')} {selectedCity.transportation.localTransport.join(', ')}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{t('blog.nileValley.cityDetails.topAttractions')}</h4>
                  <div className="space-y-2">
                    {selectedCity.keyAttractions.slice(0, 2).map((attraction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium">{attraction.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{attraction.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{t('blog.nileValley.cityDetails.entry')} {attraction.entryFee}</span>
                          <span>{t('blog.nileValley.cityDetails.hours')} {attraction.hours}</span>
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
            {t('blog.nileValley.completeGuide.title')}
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
                      <Badge>{
                        city.region === "Upper Egypt" ? t('blog.nileValley.regions.3') :
                        city.region === "Middle Egypt" ? t('blog.nileValley.regions.2') :
                        city.region === "Lower Egypt" ? t('blog.nileValley.regions.1') :
                        city.region === "Nubia" ? t('blog.nileValley.regions.4') :
                        city.region
                      }</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-1">{city.arabicName}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">{t('blog.nileValley.completeGuide.population')}</span> {city.population}
                      </div>
                      <div>
                        <span className="font-medium">{t('blog.nileValley.completeGuide.bestTime')}</span> {city.bestTimeToVisit}
                      </div>
                      <div>
                        <span className="font-medium">{t('blog.nileValley.completeGuide.stayDuration')}</span> {city.averageStay}
                      </div>
                      <div>
                        <span className="font-medium">{t('blog.nileValley.completeGuide.fromCairo')}</span> {city.transportation.fromCairo}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">{t('blog.nileValley.completeGuide.keyHighlights')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline">{t(highlight)}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">{t('blog.nileValley.completeGuide.topAttractions')}</h4>
                        <ul className="text-sm space-y-1">
                          {city.keyAttractions.slice(0, 3).map((attraction, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{t(attraction.name)}</span>
                              <span className="text-primary">{t(attraction.entryFee)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">{t('blog.nileValley.completeGuide.budgetTips')}</h4>
                        <ul className="text-sm space-y-1">
                          {city.budgetTips.slice(0, 2).map((tip, index) => (
                            <li key={index} className="text-gray-600">• {t(tip)}</li>
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
            {t('blog.nileValley.transportation.title')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Train className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('blog.nileValley.transportation.train.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('blog.nileValley.transportation.train.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {t('blog.nileValley.transportation.train.cairoLuxor')}</li>
                <li>• {t('blog.nileValley.transportation.train.cairoAswan')}</li>
                <li>• {t('blog.nileValley.transportation.train.acCoaches')}</li>
                <li>• {t('blog.nileValley.transportation.train.nightTrains')}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Ship className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('blog.nileValley.transportation.cruise.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('blog.nileValley.transportation.cruise.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {t('blog.nileValley.transportation.cruise.threeFourDays')}</li>
                <li>• {t('blog.nileValley.transportation.cruise.allMeals')}</li>
                <li>• {t('blog.nileValley.transportation.cruise.entranceFees')}</li>
                <li>• {t('blog.nileValley.transportation.cruise.bestTime')}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{t('blog.nileValley.transportation.flights.title')}</h3>
              <p className="text-gray-600 mb-4">
                {t('blog.nileValley.transportation.flights.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {t('blog.nileValley.transportation.flights.cairoLuxor')}</li>
                <li>• {t('blog.nileValley.transportation.flights.cairoAswan')}</li>
                <li>• {t('blog.nileValley.transportation.flights.abuSimbel')}</li>
                <li>• {t('blog.nileValley.transportation.flights.flightTimes')}</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Planning Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('blog.nileValley.travelTips.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('blog.nileValley.travelTips.bestTime.title')}</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.bestTime.peakSeason')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.bestTime.peakDescription')}</p>
                </div>
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.bestTime.shoulderSeason')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.bestTime.shoulderDescription')}</p>
                </div>
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.bestTime.lowSeason')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.bestTime.lowDescription')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('blog.nileValley.travelTips.budgetBreakdown.title')}</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.budgetBreakdown.budget.title')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.budgetBreakdown.budget.description')}</p>
                </div>
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.budgetBreakdown.midRange.title')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.budgetBreakdown.midRange.description')}</p>
                </div>
                <div>
                  <h4 className="font-medium">{t('blog.nileValley.travelTips.budgetBreakdown.luxury.title')}</h4>
                  <p className="text-sm text-gray-600">{t('blog.nileValley.travelTips.budgetBreakdown.luxury.description')}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('blog.nileValley.travelTips.culturalEtiquette.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.dressModestly')}</li>
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.removeShoes')}</li>
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.askPermission')}</li>
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.bargainRespectfully')}</li>
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.tipStaff')}</li>
                <li>• {t('blog.nileValley.travelTips.culturalEtiquette.learnGreetings')}</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">{t('blog.nileValley.travelTips.healthSafety.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li>• {t('blog.nileValley.travelTips.healthSafety.drinkBottledWater')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.useSunscreen')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.packMedications')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.getTravelInsurance')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.keepCopies')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.useRegisteredGuides')}</li>
                <li>• {t('blog.nileValley.travelTips.healthSafety.stayHydrated')}</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}