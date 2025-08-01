import { useState, useEffect } from "react";
import { MapPin, Clock, Camera, Star, Navigation, Plane, Train, Ship } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
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
    highlights: ["highlights.alexandria.library", "highlights.alexandria.qaitbayCitadel", "highlights.alexandria.mediterraneanBeaches", "highlights.alexandria.romanSites"],
    bestTimeToVisit: "nile.bestTime.marchNovember",
    averageStay: "nile.stay.2_3days",
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
    highlights: ["highlights.cairo.pyramidsGiza", "highlights.cairo.egyptianMuseum", "highlights.cairo.islamicCairo", "highlights.cairo.khanElKhalili"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.3_4days",
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
      fromCairo: "nile.transport.starting_point",
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
    highlights: ["highlights.beniSuef.meidumPyramid", "highlights.beniSuef.ruralNile", "highlights.beniSuef.traditionalMarkets"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1day",
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
      fromCairo: "nile.transport.2h_train_bus",
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
    highlights: ["highlights.minya.tellElAmarna", "highlights.minya.beniHassan", "highlights.minya.tunaElGebel"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.2days",
    keyAttractions: [
      {
        name: "attractions.minya.tellElAmarna.name",
        description: "attractions.minya.tellElAmarna.description",
        entryFee: "attractions.minya.tellElAmarna.entryFee",
        hours: "attractions.minya.tellElAmarna.hours"
      },
      {
        name: "attractions.minya.beniHassan.name",
        description: "attractions.minya.beniHassan.description",
        entryFee: "attractions.minya.beniHassan.entryFee",
        hours: "attractions.minya.beniHassan.hours"
      },
      {
        name: "attractions.minya.tunaElGebel.name",
        description: "attractions.minya.tunaElGebel.description",
        entryFee: "attractions.minya.tunaElGebel.entryFee",
        hours: "attractions.minya.tunaElGebel.hours"
      }
    ],
    transportation: {
      fromCairo: "nile.transport.4h_train_bus",
      localTransport: ["Taxi", "Microbus", "Felucca"]
    },
    budgetTips: [
      "budgetTips.minya.dayTripFromCairo",
      "budgetTips.minya.localGuides",
      "budgetTips.minya.groupTours"
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
    highlights: ["highlights.asyut.copticMonasteries", "highlights.asyut.traditionalCrafts", "highlights.asyut.nileCorniche"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1_2days",
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
      fromCairo: "nile.transport.5h_train_bus",
      localTransport: ["Taxi", "Microbus", "Horse cart"]
    },
    budgetTips: [
      "budgetTips.asyut.affordableStays",
      "budgetTips.asyut.localTransport",
      "budgetTips.asyut.traditionalFood"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/asyut.jpg"
  },
  {
    id: 6,
    name: "Sohag",
    arabicName: "سوهاج",
    region: "Upper Egypt",
    latitude: 26.5569,
    longitude: 31.6948,
    population: "290,000",
    highlights: ["highlights.sohag.redWhiteMonasteries", "highlights.sohag.akhmimTextiles", "highlights.sohag.ruralCulture"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1_2days",
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
      fromCairo: "nile.transport.6h_train_bus",
      localTransport: ["Taxi", "Microbus", "Bicycle"]
    },
    budgetTips: [
      "budgetTips.sohag.cheapAccommodation",
      "budgetTips.sohag.localFood",
      "budgetTips.sohag.walkingTours"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/abydos-temple.jpg"
  },
  {
    id: 7,
    name: "Qena",
    arabicName: "قنا",
    region: "Upper Egypt",
    latitude: 26.1551,
    longitude: 32.7160,
    population: "235,000",
    highlights: ["highlights.qena.gatewayDendera", "highlights.qena.traditionalPottery", "highlights.qena.nileIslands"],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1day",
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
      fromCairo: "nile.transport.7h_train_bus",
      localTransport: ["Taxi", "Microbus", "Horse cart"]
    },
    budgetTips: [
      "budgetTips.qena.budgetFriendly",
      "budgetTips.qena.localMarkets",
      "budgetTips.qena.basicHotels"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/dendera-temple.jpg"
  },
  {
    id: 8,
    name: "Luxor",
    arabicName: "الأقصر",
    region: "Upper Egypt",
    latitude: 25.6872,
    longitude: 32.6396,
    population: "507,000",
    highlights: ["highlights.luxor.valleyKings", "highlights.luxor.karnakTemple", "highlights.luxor.luxorTemple", "highlights.luxor.westBankTombs"],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.3_4days",
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
      fromCairo: "nile.transport.10h_train_1h_flight",
      localTransport: ["Taxi", "Bicycle", "Caleche", "Felucca"]
    },
    budgetTips: [
      "budgetTips.luxor.eastBankStay",
      "budgetTips.luxor.groupTickets",
      "budgetTips.luxor.earlyMorning",
      "budgetTips.luxor.localRestaurants"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/balloon-in-luxor.jpg",
    detailImage: "http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg"
  },
  {
    id: 9,
    name: "Edfu",
    arabicName: "إدفو",
    region: "Upper Egypt",
    latitude: 24.9777,
    longitude: 32.8713,
    population: "133,000",
    highlights: ["highlights.edfu.templeHorus", "highlights.edfu.traditionalMarkets", "highlights.edfu.nileCruiseStop"],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.halfday",
    keyAttractions: [
      {
        name: "attractions.edfu.templeHorus.name",
        description: "attractions.edfu.templeHorus.description",
        entryFee: "attractions.edfu.templeHorus.entryFee",
        hours: "attractions.edfu.templeHorus.hours"
      },
      {
        name: "attractions.edfu.edfuMarket.name",
        description: "attractions.edfu.edfuMarket.description",
        entryFee: "attractions.edfu.edfuMarket.entryFee",
        hours: "attractions.edfu.edfuMarket.hours"
      }
    ],
    transportation: {
      fromCairo: "nile.transport.12h_train_bus",
      localTransport: ["Horse cart", "Taxi", "Walking"]
    },
    budgetTips: [
      "budgetTips.edfu.nileCruiseStop",
      "budgetTips.edfu.horseCartRide",
      "budgetTips.edfu.affordableFood"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/edfu.jpg"
  },
  {
    id: 10,
    name: "Kom Ombo",
    arabicName: "كوم أمبو",
    region: "Upper Egypt",
    latitude: 24.4539,
    longitude: 32.9478,
    population: "67,000",
    highlights: ["highlights.komOmbo.doubleTemple", "highlights.komOmbo.crocodileMuseum", "highlights.komOmbo.sugarCaneFields"],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.halfday",
    keyAttractions: [
      {
        name: "attractions.komOmbo.templeKomOmbo.name",
        description: "attractions.komOmbo.templeKomOmbo.description",
        entryFee: "attractions.komOmbo.templeKomOmbo.entryFee",
        hours: "attractions.komOmbo.templeKomOmbo.hours"
      },
      {
        name: "attractions.komOmbo.crocodileMuseum.name",
        description: "attractions.komOmbo.crocodileMuseum.description",
        entryFee: "attractions.komOmbo.crocodileMuseum.entryFee",
        hours: "attractions.komOmbo.crocodileMuseum.hours"
      }
    ],
    transportation: {
      fromCairo: "nile.transport.13h_train_bus",
      localTransport: ["Horse cart", "Taxi", "Walking"]
    },
    budgetTips: [
      "budgetTips.komOmbo.combineWithEdfu",
      "budgetTips.komOmbo.sunsetViews",
      "budgetTips.komOmbo.basicTown"
    ],
    image: "http://travel2egypt.org/wp-content/uploads/2025/06/ko-mombo-temple.jpg"
  },
  {
    id: 11,
    name: "Aswan",
    arabicName: "أسوان",
    region: "Upper Egypt",
    latitude: 24.0889,
    longitude: 32.8998,
    population: "290,000",
    highlights: ["highlights.aswan.philaeTemple", "highlights.aswan.highDam", "highlights.aswan.nubianVillages", "highlights.aswan.elephantineIsland"],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.2_3days",
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
      fromCairo: "nile.transport.14h_train_1.5h_flight",
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
    highlights: ["highlights.abuSimbel.greatTemple", "highlights.abuSimbel.templeNefertari", "highlights.abuSimbel.unescoSite"],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.1day",
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
      fromCairo: "nile.transport.flight_3h_drive",
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
  const { t, i18n } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<NileCity | null>(nileValleyCities[0]); // Default to Alexandria
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const currentLanguage = i18n.language;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content: Record<string, any> = {
    en: {
      title: "Nile Valley Travel Guide",
      subtitle: "Journey Through Egypt's Ancient Heartland",
      description: "Follow the lifeblood of Egypt from the Mediterranean coast to the heart of Nubia, exploring ancient temples, vibrant cities, and timeless traditions along the mighty Nile River.",
      hero: {
        badge1: "5,000 Years of History",
        badge2: "Ancient Temples & Tombs", 
        badge3: "Authentic Egyptian Culture",
        features: {
          cities: { title: "12+ Historic Cities", description: "From Alexandria to Abu Simbel" },
          sites: { title: "Ancient Monuments", description: "Temples, tombs, and pyramids" },
          budget: { title: "Budget-Friendly", description: "Affordable travel options" }
        },
        cta: "Start Planning Your Journey"
      },
      regions: {
        title: "Explore the Nile Valley by Region",
        all: "All Regions",
        lowerEgypt: "Lower Egypt",
        middleEgypt: "Middle Egypt",
        upperEgypt: "Upper Egypt", 
        nubia: "Nubia"
      },
      map: {
        title: "Interactive Nile Valley Map",
        clickCities: "Click on cities to explore detailed information"
      },
      cityDetails: {
        population: "Population:",
        bestTime: "Best time to visit:",
        recommendedStay: "Recommended stay:",
        keyHighlights: "Key Highlights",
        budgetTips: "Budget Tips",
        transportation: "Transportation",
        localTransport: "Local transport:",
        topAttractions: "Top Attractions",
        entry: "Entry:",
        hours: "Hours:"
      },
      completeGuide: {
        title: "Complete Nile Valley City Guide",
        population: "Population:",
        bestTime: "Best time:",
        stayDuration: "Stay duration:",
        fromCairo: "From Cairo:",
        keyHighlights: "Key Highlights",
        topAttractions: "Top Attractions",
        regions: {
          upperEgypt: "Upper Egypt",
          middleEgypt: "Middle Egypt", 
          lowerEgypt: "Lower Egypt",
          nubia: "Nubia"
        }
      },
      transportation: {
        title: "Getting Around the Nile Valley",
        train: {
          title: "Train Travel",
          description: "Affordable and scenic rail connections between major cities along the Nile Valley.",
          cairoLuxor: "Cairo to Luxor: 10-12 hours overnight",
          cairoAswan: "Cairo to Aswan: 13-14 hours overnight",
          acCoaches: "Air-conditioned coaches available",
          nightTrains: "Comfortable sleeper trains with dining cars"
        },
        cruise: {
          title: "Nile River Cruises",
          description: "The most scenic way to travel between Luxor and Aswan, offering stunning views of ancient temples and traditional villages along the riverbanks.",
          threeFourDays: "Luxor to Aswan: 3-4 days",
          allMeals: "All meals included onboard",
          entranceFees: "Temple entrance fees usually extra",
          bestTime: "Best time: October to April for comfortable weather"
        },
        flights: {
          title: "Domestic Flights",
          description: "Quick and efficient connections between major cities, perfect for travelers with limited time.",
          cairoLuxor: "Cairo to Luxor: 1.5 hours",
          cairoAswan: "Cairo to Aswan: 1.5 hours", 
          abuSimbel: "Abu Simbel: Daily flights from Cairo and Aswan",
          flightTimes: "Flight times vary by season and airline"
        }
      },
      travelTips: {
        title: "Essential Nile Valley Travel Tips",
        bestTime: {
          title: "Best Time to Visit",
          peakSeason: "Peak Season (Oct-Apr)",
          peakDescription: "Perfect weather, higher prices, crowded attractions",
          shoulderSeason: "Shoulder Season (May, Sep)",
          shoulderDescription: "Good weather, moderate prices, fewer crowds",
          lowSeason: "Low Season (Jun-Aug)",
          lowDescription: "Very hot weather, lowest prices, minimal crowds"
        },
        budgetBreakdown: {
          title: "Budget Breakdown",
          budget: {
            title: "Budget Travel ($30-50/day)",
            description: "Hostels, local food, public transport, group tours"
          },
          midRange: {
            title: "Mid-range ($50-120/day)",
            description: "Mid-range hotels, mix of local and tourist restaurants, private tours"
          },
          luxury: {
            title: "Luxury ($120+/day)",
            description: "5-star hotels, fine dining, private guides, premium experiences"
          }
        },
        culturalEtiquette: {
          title: "Cultural Etiquette",
          dressModestly: "Dress modestly, especially when visiting religious sites",
          removeShoes: "Remove shoes when entering mosques",
          askPermission: "Ask permission before photographing people",
          bargainRespectfully: "Bargain respectfully in markets",
          tipStaff: "Tip hotel and restaurant staff appropriately",
          learnGreetings: "Learn basic Arabic greetings"
        },
        healthSafety: {
          title: "Health & Safety",
          drinkBottledWater: "Drink only bottled or filtered water",
          useSunscreen: "Use high SPF sunscreen and wear protective clothing",
          packMedications: "Pack any prescription medications you need",
          getTravelInsurance: "Get comprehensive travel insurance",
          keepCopies: "Keep copies of important documents",
          useRegisteredGuides: "Use only registered tour guides",
          stayHydrated: "Stay hydrated, especially during summer months"
        }
      }
    },
    es: {
      title: "Guía de Viaje del Valle del Nilo", 
      subtitle: "Viaje a Través del Corazón Ancestral de Egipto",
      description: "Sigue la línea vital de Egipto desde la costa mediterránea hasta el corazón de Nubia, explorando templos antiguos, ciudades vibrantes y tradiciones atemporales a lo largo del poderoso río Nilo.",
      hero: {
        badge1: "5,000 Años de Historia",
        badge2: "Templos y Tumbas Antiguas",
        badge3: "Cultura Egipcia Auténtica",
        features: {
          cities: { title: "12+ Ciudades Históricas", description: "De Alejandría a Abu Simbel" },
          sites: { title: "Monumentos Antiguos", description: "Templos, tumbas y pirámides" },
          budget: { title: "Económico", description: "Opciones de viaje asequibles" }
        },
        cta: "Comienza a Planificar tu Viaje"
      },
      regions: {
        title: "Explora el Valle del Nilo por Región",
        all: "Todas las Regiones",
        lowerEgypt: "Bajo Egipto",
        middleEgypt: "Egipto Medio",
        upperEgypt: "Alto Egipto",
        nubia: "Nubia"
      },
      map: {
        title: "Mapa Interactivo del Valle del Nilo",
        clickCities: "Haz clic en las ciudades para explorar información detallada"
      },
      cityDetails: {
        population: "Población:",
        bestTime: "Mejor época para visitar:",
        recommendedStay: "Estancia recomendada:",
        keyHighlights: "Puntos Destacados",
        budgetTips: "Consejos de Presupuesto",
        transportation: "Transporte",
        localTransport: "Transporte local:",
        topAttractions: "Principales Atracciones",
        entry: "Entrada:",
        hours: "Horarios:"
      },
      completeGuide: {
        title: "Guía Completa de Ciudades del Valle del Nilo",
        population: "Población:",
        bestTime: "Mejor época:",
        stayDuration: "Duración de estancia:",
        fromCairo: "Desde El Cairo:",
        keyHighlights: "Puntos Destacados",
        topAttractions: "Principales Atracciones",
        regions: {
          upperEgypt: "Alto Egipto",
          middleEgypt: "Egipto Medio",
          lowerEgypt: "Bajo Egipto",
          nubia: "Nubia"
        }
      },
      transportation: {
        title: "Cómo Moverse por el Valle del Nilo",
        cruise: {
          title: "Cruceros por el Río Nilo",
          description: "La forma más pintoresca de viajar entre Luxor y Asuán, ofreciendo vistas impresionantes de templos antiguos y pueblos tradicionales a lo largo de las orillas del río.",
          luxorAswan: "Luxor a Asuán: 3-4 días",
          aswanLuxor: "Asuán a Luxor: 4-5 días",
          stops: "Las paradas incluyen Edfu, Kom Ombo y Esna",
          bestTime: "Mejor época: octubre a abril para clima cómodo"
        },
        flights: {
          title: "Vuelos Domésticos",
          description: "Conexiones rápidas y eficientes entre las principales ciudades, perfectas para viajeros con tiempo limitado.",
          cairoLuxor: "El Cairo a Luxor: 1.5 horas",
          cairoAswan: "El Cairo a Asuán: 1.5 horas",
          abuSimbel: "Abu Simbel: Vuelos diarios desde El Cairo y Asuán",
          flightTimes: "Los horarios de vuelos varían según temporada y aerolínea"
        }
      },
      travelTips: {
        title: "Consejos Esenciales de Viaje al Valle del Nilo",
        bestTime: {
          title: "Mejor Época para Visitar",
          peakSeason: "Temporada Alta (Oct-Abr)",
          peakDescription: "Clima perfecto, precios más altos, atracciones concurridas",
          shoulderSeason: "Temporada Media (May, Sep)",
          shoulderDescription: "Buen clima, precios moderados, menos multitudes",
          lowSeason: "Temporada Baja (Jun-Ago)",
          lowDescription: "Clima muy caluroso, precios más bajos, multitudes mínimas"
        },
        budgetBreakdown: {
          title: "Desglose de Presupuesto",
          budget: {
            title: "Viaje Económico ($30-50/día)",
            description: "Albergues, comida local, transporte público, tours grupales"
          },
          midRange: {
            title: "Rango Medio ($50-120/día)",
            description: "Hoteles de rango medio, mezcla de restaurantes locales y turísticos, tours privados"
          },
          luxury: {
            title: "Lujo ($120+/día)",
            description: "Hoteles 5 estrellas, alta gastronomía, guías privados, experiencias premium"
          }
        },
        culturalEtiquette: {
          title: "Etiqueta Cultural",
          dressModestly: "Vístete modestamente, especialmente al visitar sitios religiosos",
          removeShoes: "Quítate los zapatos al entrar a mezquitas",
          askPermission: "Pide permiso antes de fotografiar a las personas",
          bargainRespectfully: "Regatear respetuosamente en los mercados",
          tipStaff: "Dar propina apropiadamente al personal de hoteles y restaurantes",
          learnGreetings: "Aprende saludos básicos en árabe"
        },
        healthSafety: {
          title: "Salud y Seguridad",
          drinkBottledWater: "Bebe solo agua embotellada o filtrada",
          useSunscreen: "Usa protector solar de alto FPS y ropa protectora",
          packMedications: "Empaca cualquier medicamento recetado que necesites",
          getTravelInsurance: "Obtén un seguro de viaje integral",
          keepCopies: "Mantén copias de documentos importantes",
          useRegisteredGuides: "Usa solo guías turísticos registrados",
          stayHydrated: "Mantente hidratado, especialmente durante los meses de verano"
        }
      }
    },
    fr: {
      title: "Guide de Voyage de la Vallée du Nil",
      subtitle: "Voyage à Travers le Cœur Ancestral de l'Égypte", 
      description: "Suivez la ligne de vie de l'Égypte depuis la côte méditerranéenne jusqu'au cœur de la Nubie, en explorant des temples anciens, des villes vibrantes et des traditions intemporelles le long du puissant fleuve Nil.",
      hero: {
        badge1: "5,000 Ans d'Histoire",
        badge2: "Temples et Tombes Antiques",
        badge3: "Culture Égyptienne Authentique",
        features: {
          cities: { title: "12+ Villes Historiques", description: "D'Alexandrie à Abou Simbel" },
          sites: { title: "Monuments Antiques", description: "Temples, tombes et pyramides" },
          budget: { title: "Économique", description: "Options de voyage abordables" }
        },
        cta: "Commencez à Planifier Votre Voyage"
      },
      regions: {
        title: "Explorez la Vallée du Nil par Région",
        all: "Toutes les Régions",
        lowerEgypt: "Basse-Égypte",
        middleEgypt: "Moyenne-Égypte", 
        upperEgypt: "Haute-Égypte",
        nubia: "Nubie"
      },
      map: {
        title: "Carte Interactive de la Vallée du Nil",
        clickCities: "Cliquez sur les villes pour explorer des informations détaillées"
      },
      cityDetails: {
        population: "Population:",
        bestTime: "Meilleure période pour visiter:",
        recommendedStay: "Séjour recommandé:",
        keyHighlights: "Points Forts",
        budgetTips: "Conseils Budget",
        transportation: "Transport",
        localTransport: "Transport local:",
        topAttractions: "Principales Attractions",
        entry: "Entrée:",
        hours: "Heures:"
      },
      completeGuide: {
        title: "Guide Complet des Villes de la Vallée du Nil",
        population: "Population:",
        bestTime: "Meilleure période:",
        stayDuration: "Durée de séjour:",
        fromCairo: "Depuis Le Caire:",
        keyHighlights: "Points Forts",
        topAttractions: "Principales Attractions",
        regions: {
          upperEgypt: "Haute-Égypte",
          middleEgypt: "Moyenne-Égypte",
          lowerEgypt: "Basse-Égypte",
          nubia: "Nubie"
        }
      },
      transportation: {
        title: "Se Déplacer dans la Vallée du Nil",
        cruise: {
          title: "Croisières sur le Nil",
          description: "La façon la plus pittoresque de voyager entre Louxor et Assouan, offrant des vues magnifiques sur les temples anciens et les villages traditionnels le long des rives du fleuve.",
          luxorAswan: "Louxor à Assouan: 3-4 jours",
          aswanLuxor: "Assouan à Louxor: 4-5 jours",
          stops: "Les arrêts incluent Edfou, Kom Ombo et Esna",
          bestTime: "Meilleure période: octobre à avril pour un climat confortable"
        },
        flights: {
          title: "Vols Domestiques",
          description: "Connexions rapides et efficaces entre les principales villes, parfaites pour les voyageurs avec un temps limité.",
          cairoLuxor: "Le Caire à Louxor: 1.5 heures",
          cairoAswan: "Le Caire à Assouan: 1.5 heures",
          abuSimbel: "Abou Simbel: Vols quotidiens depuis Le Caire et Assouan",
          flightTimes: "Les horaires de vol varient selon la saison et la compagnie aérienne"
        }
      },
      travelTips: {
        title: "Conseils Essentiels de Voyage dans la Vallée du Nil",
        bestTime: {
          title: "Meilleure Période pour Visiter",
          peakSeason: "Haute Saison (Oct-Avr)",
          peakDescription: "Climat parfait, prix plus élevés, attractions bondées",
          shoulderSeason: "Saison Intermédiaire (Mai, Sep)",
          shoulderDescription: "Bon climat, prix modérés, moins de foules",
          lowSeason: "Basse Saison (Jun-Aoû)",
          lowDescription: "Climat très chaud, prix les plus bas, foules minimales"
        },
        budgetBreakdown: {
          title: "Répartition du Budget",
          budget: {
            title: "Voyage Économique ($30-50/jour)",
            description: "Auberges, nourriture locale, transport public, tours de groupe"
          },
          midRange: {
            title: "Gamme Moyenne ($50-120/jour)",
            description: "Hôtels de gamme moyenne, mélange de restaurants locaux et touristiques, tours privés"
          },
          luxury: {
            title: "Luxe ($120+/jour)",
            description: "Hôtels 5 étoiles, cuisine raffinée, guides privés, expériences premium"
          }
        },
        culturalEtiquette: {
          title: "Étiquette Culturelle",
          dressModestly: "Habillez-vous modestement, surtout lors de la visite de sites religieux",
          removeShoes: "Retirez vos chaussures en entrant dans les mosquées",
          askPermission: "Demandez la permission avant de photographier les gens",
          bargainRespectfully: "Marchandez respectueusement dans les marchés",
          tipStaff: "Donnez un pourboire approprié au personnel des hôtels et restaurants",
          learnGreetings: "Apprenez les salutations de base en arabe"
        },
        healthSafety: {
          title: "Santé et Sécurité",
          drinkBottledWater: "Buvez uniquement de l'eau en bouteille ou filtrée",
          useSunscreen: "Utilisez une crème solaire à haut FPS et portez des vêtements protecteurs",
          packMedications: "Emportez tous les médicaments sur ordonnance dont vous avez besoin",
          getTravelInsurance: "Souscrivez une assurance voyage complète",
          keepCopies: "Gardez des copies des documents importants",
          useRegisteredGuides: "Utilisez uniquement des guides touristiques enregistrés",
          stayHydrated: "Restez hydraté, surtout pendant les mois d'été"
        }
      }
    },
    de: {
      title: "Niltal Reiseführer",
      subtitle: "Reise Durch Ägyptens Antikes Herzland",
      description: "Folgen Sie der Lebensader Ägyptens von der Mittelmeerküste bis ins Herz Nubiens und erkunden Sie antike Tempel, lebendige Städte und zeitlose Traditionen entlang des mächtigen Nils.",
      hero: {
        badge1: "5.000 Jahre Geschichte", 
        badge2: "Antike Tempel & Gräber",
        badge3: "Authentische Ägyptische Kultur",
        features: {
          cities: { title: "12+ Historische Städte", description: "Von Alexandria bis Abu Simbel" },
          sites: { title: "Antike Monumente", description: "Tempel, Gräber und Pyramiden" },
          budget: { title: "Budget-freundlich", description: "Erschwingliche Reiseoptionen" }
        },
        cta: "Beginnen Sie Ihre Reiseplanung"
      },
      regions: {
        title: "Erkunden Sie das Niltal nach Regionen",
        all: "Alle Regionen",
        lowerEgypt: "Unterägypten",
        middleEgypt: "Mittelägypten",
        upperEgypt: "Oberägypten",
        nubia: "Nubien"
      },
      map: {
        title: "Interaktive Niltal-Karte",
        clickCities: "Klicken Sie auf Städte, um detaillierte Informationen zu erkunden"
      },
      cityDetails: {
        population: "Bevölkerung:",
        bestTime: "Beste Reisezeit:",
        recommendedStay: "Empfohlener Aufenthalt:",
        keyHighlights: "Wichtige Highlights",
        budgetTips: "Budget-Tipps",
        transportation: "Transport",
        localTransport: "Lokaler Transport:",
        topAttractions: "Top-Attraktionen",
        entry: "Eintritt:",
        hours: "Öffnungszeiten:"
      },
      completeGuide: {
        title: "Vollständiger Niltal-Städteführer",
        population: "Bevölkerung:",
        bestTime: "Beste Zeit:",
        stayDuration: "Aufenthaltsdauer:",
        fromCairo: "Von Kairo:",
        keyHighlights: "Wichtige Highlights",
        topAttractions: "Top-Attraktionen",
        regions: {
          upperEgypt: "Oberägypten",
          middleEgypt: "Mittelägypten",
          lowerEgypt: "Unterägypten",
          nubia: "Nubien"
        }
      },
      transportation: {
        title: "Fortbewegung im Niltal",
        cruise: {
          title: "Nilkreuzfahrten",
          description: "Die schönste Art, zwischen Luxor und Assuan zu reisen, mit atemberaubenden Ausblicken auf antike Tempel und traditionelle Dörfer entlang der Flussufer.",
          luxorAswan: "Luxor nach Assuan: 3-4 Tage",
          aswanLuxor: "Assuan nach Luxor: 4-5 Tage",
          stops: "Stopps beinhalten Edfu, Kom Ombo und Esna",
          bestTime: "Beste Zeit: Oktober bis April für angenehmes Wetter"
        },
        flights: {
          title: "Inlandsflüge",
          description: "Schnelle und effiziente Verbindungen zwischen den wichtigsten Städten, perfekt für Reisende mit begrenzter Zeit.",
          cairoLuxor: "Kairo nach Luxor: 1,5 Stunden",
          cairoAswan: "Kairo nach Assuan: 1,5 Stunden",
          abuSimbel: "Abu Simbel: Tägliche Flüge von Kairo und Assuan",
          flightTimes: "Flugzeiten variieren je nach Saison und Fluggesellschaft"
        }
      },
      travelTips: {
        title: "Wichtige Niltal-Reisetipps",
        bestTime: {
          title: "Beste Reisezeit",
          peakSeason: "Hauptsaison (Okt-Apr)",
          peakDescription: "Perfektes Wetter, höhere Preise, überfüllte Attraktionen",
          shoulderSeason: "Zwischensaison (Mai, Sep)",
          shoulderDescription: "Gutes Wetter, moderate Preise, weniger Menschenmassen",
          lowSeason: "Nebensaison (Jun-Aug)",
          lowDescription: "Sehr heißes Wetter, niedrigste Preise, minimale Menschenmassen"
        },
        budgetBreakdown: {
          title: "Budget-Aufschlüsselung",
          budget: {
            title: "Budget-Reise ($30-50/Tag)",
            description: "Herbergen, lokales Essen, öffentliche Verkehrsmittel, Gruppentouren"
          },
          midRange: {
            title: "Mittelklasse ($50-120/Tag)",
            description: "Mittelklasse-Hotels, Mischung aus lokalen und touristischen Restaurants, private Touren"
          },
          luxury: {
            title: "Luxus ($120+/Tag)",
            description: "5-Sterne-Hotels, gehobene Küche, private Reiseführer, Premium-Erlebnisse"
          }
        },
        culturalEtiquette: {
          title: "Kulturelle Etikette",
          dressModestly: "Kleiden Sie sich bescheiden, besonders beim Besuch religiöser Stätten",
          removeShoes: "Ziehen Sie die Schuhe aus, wenn Sie Moscheen betreten",
          askPermission: "Fragen Sie um Erlaubnis, bevor Sie Menschen fotografieren",
          bargainRespectfully: "Handeln Sie respektvoll auf Märkten",
          tipStaff: "Geben Sie Hotel- und Restaurantpersonal angemessenes Trinkgeld",
          learnGreetings: "Lernen Sie grundlegende arabische Begrüßungen"
        },
        healthSafety: {
          title: "Gesundheit & Sicherheit",
          drinkBottledWater: "Trinken Sie nur Flaschen- oder gefiltertes Wasser",
          useSunscreen: "Verwenden Sie hohen LSF-Sonnenschutz und tragen Sie schützende Kleidung",
          packMedications: "Packen Sie alle verschreibungspflichtigen Medikamente ein, die Sie benötigen",
          getTravelInsurance: "Schließen Sie eine umfassende Reiseversicherung ab",
          keepCopies: "Bewahren Sie Kopien wichtiger Dokumente auf",
          useRegisteredGuides: "Verwenden Sie nur registrierte Reiseführer",
          stayHydrated: "Bleiben Sie hydratisiert, besonders in den Sommermonaten"
        }
      }
    }
  };
  
  const currentContent = content[currentLanguage] || content.en;

  // Handle regions with multilingual content
  const regions = currentLanguage === 'es' ? 
    ["Todas las Regiones", "Bajo Egipto", "Egipto Medio", "Alto Egipto", "Nubia"] :
    currentLanguage === 'fr' ?
    ["Toutes les Régions", "Basse-Égypte", "Moyenne-Égypte", "Haute-Égypte", "Nubie"] :
    currentLanguage === 'de' ?
    ["Alle Regionen", "Unterägypten", "Mittelägypten", "Oberägypten", "Nubien"] :
    ["All Regions", "Lower Egypt", "Middle Egypt", "Upper Egypt", "Nubia"];
  
  // Create a mapping between translated regions and English region names
  const regionMap: { [key: string]: string } = {
    "All Regions": "All",
    "Lower Egypt": "Lower Egypt",
    "Middle Egypt": "Middle Egypt", 
    "Upper Egypt": "Upper Egypt",
    "Nubia": "Nubia",
    // Spanish
    "Todas las Regiones": "All",
    "Bajo Egipto": "Lower Egypt",
    "Egipto Medio": "Middle Egypt",
    "Alto Egipto": "Upper Egypt",
    // French
    "Toutes les Régions": "All",
    "Basse-Égypte": "Lower Egypt",
    "Moyenne-Égypte": "Middle Egypt",
    "Haute-Égypte": "Upper Egypt",
    "Nubie": "Nubia",
    // German
    "Alle Regionen": "All",
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
            {currentContent.title}{" "}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              {currentContent.subtitle}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance text-center">
            {currentContent.description}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{currentContent.hero.features.cities.title}</h4>
              <p className="text-sm text-white/80">{currentContent.hero.features.cities.description}</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{currentContent.hero.features.sites.title}</h4>
              <p className="text-sm text-white/80">{currentContent.hero.features.sites.description}</p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">{currentContent.hero.features.budget.title}</h4>
              <p className="text-sm text-white/80">{currentContent.hero.features.budget.description}</p>
            </div>
          </div>
          
          <Button 
            onClick={navigateToQuote}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1"
          >
            {currentContent.hero.cta} →
          </Button>
        </div>
      </header>

      {/* Interactive Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {currentContent.map.title}
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
                <p className="text-xs sm:text-sm font-medium text-gray-700">{currentContent.map.clickCities}</p>
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
                  <Badge className="mb-4">{
                    selectedCity.region === "Upper Egypt" ? currentContent.completeGuide.regions.upperEgypt :
                    selectedCity.region === "Middle Egypt" ? currentContent.completeGuide.regions.middleEgypt :
                    selectedCity.region === "Lower Egypt" ? currentContent.completeGuide.regions.lowerEgypt :
                    selectedCity.region === "Nubia" ? currentContent.completeGuide.regions.nubia :
                    selectedCity.region
                  }</Badge>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{currentContent.cityDetails.population} {selectedCity.population}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{currentContent.cityDetails.bestTime} {selectedCity.bestTimeToVisit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>{currentContent.cityDetails.recommendedStay} {selectedCity.averageStay}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{currentContent.cityDetails.keyHighlights}</h4>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    {selectedCity.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mb-2">{currentContent.cityDetails.budgetTips}</h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedCity.budgetTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <img 
                    src={selectedCity.detailImage || selectedCity.image} 
                    alt={selectedCity.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <h4 className="font-semibold mb-3">{currentContent.cityDetails.transportation}</h4>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="w-4 h-4 text-primary" />
                      <span className="text-sm">{selectedCity.transportation.fromCairo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="text-sm">{currentContent.cityDetails.localTransport} {selectedCity.transportation.localTransport.join(', ')}</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{currentContent.cityDetails.topAttractions}</h4>
                  <div className="space-y-2">
                    {selectedCity.keyAttractions.slice(0, 2).map((attraction, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium">{attraction.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{attraction.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{currentContent.cityDetails.entry} {attraction.entryFee}</span>
                          <span>{currentContent.cityDetails.hours} {attraction.hours}</span>
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
            {currentContent.completeGuide.title}
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
                        city.region === "Upper Egypt" ? currentContent.completeGuide.regions.upperEgypt :
                        city.region === "Middle Egypt" ? currentContent.completeGuide.regions.middleEgypt :
                        city.region === "Lower Egypt" ? currentContent.completeGuide.regions.lowerEgypt :
                        city.region === "Nubia" ? currentContent.completeGuide.regions.nubia :
                        city.region
                      }</Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-1">{city.arabicName}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">{currentContent.completeGuide.population}</span> {city.population}
                      </div>
                      <div>
                        <span className="font-medium">{currentContent.completeGuide.bestTime}</span> {city.bestTimeToVisit}
                      </div>
                      <div>
                        <span className="font-medium">{currentContent.completeGuide.stayDuration}</span> {city.averageStay}
                      </div>
                      <div>
                        <span className="font-medium">{currentContent.completeGuide.fromCairo}</span> {city.transportation.fromCairo}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">{currentContent.completeGuide.keyHighlights}</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline">{highlight}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">{currentContent.completeGuide.topAttractions}</h4>
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
                        <h4 className="font-semibold mb-2">{currentContent.completeGuide.budgetTips}</h4>
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
            {currentContent.transportation.title}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Train className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{currentContent.transportation.train.title}</h3>
              <p className="text-gray-600 mb-4">
                {currentContent.transportation.train.description}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {currentContent.transportation.train.cairoLuxor}</li>
                <li>• {currentContent.transportation.train.cairoAswan}</li>
                <li>• {currentContent.transportation.train.acCoaches}</li>
                <li>• {currentContent.transportation.train.nightTrains}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Ship className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{currentContent.transportation.cruise.title}</h3>
              <p className="text-gray-600 mb-4">
                {currentContent.transportation.cruise.description}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {currentContent.transportation.cruise.threeFourDays}</li>
                <li>• {currentContent.transportation.cruise.allMeals}</li>
                <li>• {currentContent.transportation.cruise.entranceFees}</li>
                <li>• {currentContent.transportation.cruise.bestTime}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{currentContent.transportation.flights.title}</h3>
              <p className="text-gray-600 mb-4">
                {currentContent.transportation.flights.description}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>• {currentContent.transportation.flights.cairoLuxor}</li>
                <li>• {currentContent.transportation.flights.cairoAswan}</li>
                <li>• {currentContent.transportation.flights.abuSimbel}</li>
                <li>• {currentContent.transportation.flights.flightTimes}</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Planning Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {currentContent.travelTips.title}
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