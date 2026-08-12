import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Camera,
  Star,
  Navigation,
  Plane,
  Train,
  Ship,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import Navbar from "@/components/navbar";
import GuideToc from "@/components/guide-toc";
import Footer from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SeoMeta from "@/components/seo-meta";
import { articleSchema } from "@/lib/article-schema";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

interface NileCity {
  id: number;
  /** Key into nileValleyGuide.cityNames. */
  name: string;
  arabicName: string;
  region: "Lower Egypt" | "Middle Egypt" | "Upper Egypt" | "Nubia";
  latitude: number;
  longitude: number;
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
    /** Key into nileValleyGuide.fromCairo. */
    fromCairo: string;
    /** Keys into nileValleyGuide.transportModes. */
    localTransport: string[];
  };
  budgetTips: string[];
  image: string;
  detailImage?: string;
}

// Search metadata. Google indexes the English prerender, so these stay English
// whatever the visitor has selected, the same as every other page's SeoMeta.
const SEO_TITLE = "Nile Valley Travel Guide | Beyond Luxor & Aswan"; // i18n-exempt
const SEO_DESCRIPTION = "The hidden gems of the Nile Valley between Luxor and Aswan. Edfu, Kom Ombo, Dendera, Esna. How to see them on a budget with a private guide."; // i18n-exempt

/**
 * The region filter. `value` is compared against NileCity.region, so it is a
 * key and never shown; the button text comes from the locale files.
 */
const REGION_FILTERS = [
  { value: "All", labelKey: "nileValleyGuide.regions.all" },
  { value: "Lower Egypt", labelKey: "nileValleyGuide.regions.lowerEgypt" },
  { value: "Middle Egypt", labelKey: "nileValleyGuide.regions.middleEgypt" },
  { value: "Upper Egypt", labelKey: "nileValleyGuide.regions.upperEgypt" },
  { value: "Nubia", labelKey: "nileValleyGuide.regions.nubia" },
] as const;

const nileValleyCities: NileCity[] = [
  {
    id: 1,
    name: "alexandria",
    arabicName: "الإسكندرية",
    region: "Lower Egypt",
    latitude: 31.2001,
    longitude: 29.9187,
    highlights: [
      "highlights.alexandria.library",
      "highlights.alexandria.qaitbayCitadel",
      "highlights.alexandria.mediterraneanBeaches",
      "highlights.alexandria.romanSites",
    ],
    bestTimeToVisit: "nile.bestTime.marchNovember",
    averageStay: "nile.stay.2_3days",
    keyAttractions: [
      {
        name: "attractions.alexandria.bibliotheca.name",
        description: "attractions.alexandria.bibliotheca.description",
        entryFee: "attractions.alexandria.bibliotheca.entryFee",
        hours: "attractions.alexandria.bibliotheca.hours",
      },
      {
        name: "attractions.alexandria.qaitbayCitadel.name",
        description: "attractions.alexandria.qaitbayCitadel.description",
        entryFee: "attractions.alexandria.qaitbayCitadel.entryFee",
        hours: "attractions.alexandria.qaitbayCitadel.hours",
      },
      {
        name: "attractions.alexandria.catacombs.name",
        description: "attractions.alexandria.catacombs.description",
        entryFee: "attractions.alexandria.catacombs.entryFee",
        hours: "attractions.alexandria.catacombs.hours",
      },
    ],
    transportation: {
      fromCairo: "alexandria",
      localTransport: ["tram", "bus", "taxi", "uber"],
    },
    budgetTips: [
      "budgetTips.alexandria.stayNearCorniche",
      "budgetTips.alexandria.freshSeafood",
      "budgetTips.alexandria.historicTram",
    ],
    image: "/images/alexandria.jpg",
    detailImage:
      "/images/alexandria.jpg",
  },
  {
    id: 2,
    name: "cairo",
    arabicName: "القاهرة",
    region: "Lower Egypt",
    latitude: 30.0444,
    longitude: 31.2357,
    highlights: [
      "highlights.cairo.pyramidsGiza",
      "highlights.cairo.egyptianMuseum",
      "highlights.cairo.islamicCairo",
      "highlights.cairo.khanElKhalili",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.3_4days",
    keyAttractions: [
      {
        name: "attractions.cairo.pyramidsGiza.name",
        description: "attractions.cairo.pyramidsGiza.description",
        entryFee: "attractions.cairo.pyramidsGiza.entryFee",
        hours: "attractions.cairo.pyramidsGiza.hours",
      },
      {
        name: "attractions.cairo.egyptianMuseum.name",
        description: "attractions.cairo.egyptianMuseum.description",
        entryFee: "attractions.cairo.egyptianMuseum.entryFee",
        hours: "attractions.cairo.egyptianMuseum.hours",
      },
      {
        name: "attractions.cairo.citadelSaladin.name",
        description: "attractions.cairo.citadelSaladin.description",
        entryFee: "attractions.cairo.citadelSaladin.entryFee",
        hours: "attractions.cairo.citadelSaladin.hours",
      },
      {
        name: "attractions.cairo.copticMuseum.name",
        description: "attractions.cairo.copticMuseum.description",
        entryFee: "attractions.cairo.copticMuseum.entryFee",
        hours: "attractions.cairo.copticMuseum.hours",
      },
    ],
    transportation: {
      fromCairo: "cairo",
      localTransport: ["metro", "taxi", "uber", "bus"],
    },
    budgetTips: [
      "budgetTips.cairo.useMetro",
      "budgetTips.cairo.localRestaurants",
      "budgetTips.cairo.downtownAccommodation",
      "budgetTips.cairo.freeMosquesMarkets",
    ],
    image:
      "/images/pyramid-of-giza.jpg",
    detailImage:
      "/images/giza-pyramids.jpg",
  },
  {
    id: 3,
    name: "benisuef",
    arabicName: "بني سويف",
    region: "Middle Egypt",
    latitude: 29.0661,
    longitude: 31.0994,
    highlights: [
      "highlights.beniSuef.meidumPyramid",
      "highlights.beniSuef.ruralNile",
      "highlights.beniSuef.traditionalMarkets",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1day",
    keyAttractions: [
      {
        name: "attractions.beniSuef.meidumPyramid.name",
        description: "attractions.beniSuef.meidumPyramid.description",
        entryFee: "attractions.beniSuef.meidumPyramid.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "benisuef",
      localTransport: ["taxi", "microbus", "tuktuk"],
    },
    budgetTips: [
      "budgetTips.beniSuef.affordableFood",
      "budgetTips.beniSuef.basicAccommodation",
      "budgetTips.beniSuef.bargainMarkets",
    ],
    image: "/images/beni-suef-1.jpg",
    detailImage:
      "/images/beni-suef-.jpg",
  },
  {
    id: 4,
    name: "minya",
    arabicName: "المنيا",
    region: "Middle Egypt",
    latitude: 28.1099,
    longitude: 30.7503,
    highlights: [
      "highlights.minya.tellElAmarna",
      "highlights.minya.beniHassan",
      "highlights.minya.tunaElGebel",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.2days",
    keyAttractions: [
      {
        name: "attractions.minya.tellElAmarna.name",
        description: "attractions.minya.tellElAmarna.description",
        entryFee: "attractions.minya.tellElAmarna.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.minya.beniHassan.name",
        description: "attractions.minya.beniHassan.description",
        entryFee: "attractions.minya.beniHassan.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.minya.tunaElGebel.name",
        description: "attractions.minya.tunaElGebel.description",
        entryFee: "attractions.minya.tunaElGebel.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "minya",
      localTransport: ["taxi", "microbus", "felucca"],
    },
    budgetTips: [
      "budgetTips.minya.dayTripFromCairo",
      "budgetTips.minya.localGuides",
      "budgetTips.minya.groupTours",
    ],
    image: "/images/el-minya.jpg",
    detailImage:
      "/images/el-minya.jpg",
  },
  {
    id: 5,
    name: "asyut",
    arabicName: "أسيوط",
    region: "Middle Egypt",
    latitude: 27.1783,
    longitude: 31.1859,
    highlights: [
      "highlights.asyut.copticMonasteries",
      "highlights.asyut.traditionalCrafts",
      "highlights.asyut.nileCorniche",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1_2days",
    keyAttractions: [
      {
        name: "attractions.asyut.monasteryVirginMary.name",
        description: "attractions.asyut.monasteryVirginMary.description",
        entryFee: "attractions.asyut.monasteryVirginMary.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.asyut.asyutBarrage.name",
        description: "attractions.asyut.asyutBarrage.description",
        entryFee: "attractions.asyut.asyutBarrage.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "asyut",
      localTransport: ["taxi", "microbus", "horsecart"],
    },
    budgetTips: [
      "budgetTips.asyut.affordableStays",
      "budgetTips.asyut.localTransport",
      "budgetTips.asyut.traditionalFood",
    ],
    image: "/images/asyut.jpg",
  },
  {
    id: 6,
    name: "sohag",
    arabicName: "سوهاج",
    region: "Upper Egypt",
    latitude: 26.5569,
    longitude: 31.6948,
    highlights: [
      "highlights.sohag.abydosTemple",
      "highlights.sohag.redWhiteMonasteries",
      "highlights.sohag.akhmimTextiles",
      "highlights.sohag.ruralCulture",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1_2days",
    keyAttractions: [
      {
        name: "attractions.sohag.abydosTemple.name",
        description: "attractions.sohag.abydosTemple.description",
        entryFee: "attractions.sohag.abydosTemple.entryFee",
        hours: "attractions.sohag.abydosTemple.hours",
      },
      {
        name: "attractions.sohag.redMonastery.name",
        description: "attractions.sohag.redMonastery.description",
        entryFee: "attractions.sohag.redMonastery.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.sohag.whiteMonastery.name",
        description: "attractions.sohag.whiteMonastery.description",
        entryFee: "attractions.sohag.whiteMonastery.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.sohag.akhmim.name",
        description: "attractions.sohag.akhmim.description",
        entryFee: "attractions.sohag.akhmim.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "sohag",
      localTransport: ["taxi", "microbus", "bicycle"],
    },
    budgetTips: [
      "budgetTips.sohag.cheapAccommodation",
      "budgetTips.sohag.localFood",
      "budgetTips.sohag.walkingTours",
    ],
    image:
      "/images/abydos-temple.jpg",
  },
  {
    id: 7,
    name: "qena",
    arabicName: "قنا",
    region: "Upper Egypt",
    latitude: 26.1551,
    longitude: 32.716,
    highlights: [
      "highlights.qena.gatewayDendera",
      "highlights.qena.traditionalPottery",
      "highlights.qena.nileIslands",
    ],
    bestTimeToVisit: "nile.bestTime.octoberApril",
    averageStay: "nile.stay.1day",
    keyAttractions: [
      {
        name: "attractions.qena.denderaTemple.name",
        description: "attractions.qena.denderaTemple.description",
        entryFee: "attractions.qena.denderaTemple.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.qena.qenaPotteryQuarter.name",
        description: "attractions.qena.qenaPotteryQuarter.description",
        entryFee: "attractions.qena.qenaPotteryQuarter.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "qena",
      localTransport: ["taxi", "microbus", "horsecart"],
    },
    budgetTips: [
      "budgetTips.qena.budgetFriendly",
      "budgetTips.qena.localMarkets",
      "budgetTips.qena.basicHotels",
    ],
    image:
      "/images/dendera-temple.jpg",
  },
  {
    id: 8,
    name: "luxor",
    arabicName: "الأقصر",
    region: "Upper Egypt",
    latitude: 25.6872,
    longitude: 32.6396,
    highlights: [
      "highlights.luxor.valleyKings",
      "highlights.luxor.karnakTemple",
      "highlights.luxor.luxorTemple",
      "highlights.luxor.westBankTombs",
    ],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.3_4days",
    keyAttractions: [
      {
        name: "attractions.luxor.valleyKings.name",
        description: "attractions.luxor.valleyKings.description",
        entryFee: "attractions.luxor.valleyKings.entryFee",
        hours: "attractions.luxor.valleyKings.hours",
      },
      {
        name: "attractions.luxor.karnakTemple.name",
        description: "attractions.luxor.karnakTemple.description",
        entryFee: "attractions.luxor.karnakTemple.entryFee",
        hours: "attractions.luxor.karnakTemple.hours",
      },
      {
        name: "attractions.luxor.luxorTemple.name",
        description: "attractions.luxor.luxorTemple.description",
        entryFee: "attractions.luxor.luxorTemple.entryFee",
        hours: "attractions.luxor.luxorTemple.hours",
      },
      {
        name: "attractions.luxor.luxorMuseum.name",
        description: "attractions.luxor.luxorMuseum.description",
        entryFee: "attractions.luxor.luxorMuseum.entryFee",
        hours: "attractions.luxor.luxorMuseum.hours",
      },
      {
        name: "attractions.luxor.hatshepsutTemple.name",
        description: "attractions.luxor.hatshepsutTemple.description",
        entryFee: "attractions.luxor.hatshepsutTemple.entryFee",
        hours: "attractions.luxor.hatshepsutTemple.hours",
      },
      {
        name: "attractions.luxor.medinet.name",
        description: "attractions.luxor.medinet.description",
        entryFee: "attractions.luxor.medinet.entryFee",
        hours: "attractions.luxor.medinet.hours",
      },
      {
        name: "attractions.luxor.ramesseum.name",
        description: "attractions.luxor.ramesseum.description",
        entryFee: "attractions.luxor.ramesseum.entryFee",
        hours: "attractions.luxor.ramesseum.hours",
      },
      {
        name: "attractions.luxor.deir.name",
        description: "attractions.luxor.deir.description",
        entryFee: "attractions.luxor.deir.entryFee",
        hours: "attractions.luxor.deir.hours",
      },
    ],
    transportation: {
      fromCairo: "luxor",
      localTransport: ["taxi", "bicycle", "caleche", "felucca"],
    },
    budgetTips: [
      "budgetTips.luxor.eastBankStay",
      "budgetTips.luxor.groupTickets",
      "budgetTips.luxor.earlyMorning",
      "budgetTips.luxor.localRestaurants",
    ],
    image:
      "/images/balloon-in-luxor.jpg",
    detailImage:
      "/images/karnak-temple.jpg",
  },
  {
    id: 9,
    name: "edfu",
    arabicName: "إدفو",
    region: "Upper Egypt",
    latitude: 24.9777,
    longitude: 32.8713,
    highlights: [
      "highlights.edfu.templeHorus",
      "highlights.edfu.traditionalMarkets",
      "highlights.edfu.nileCruiseStop",
    ],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.halfday",
    keyAttractions: [
      {
        name: "attractions.edfu.templeHorus.name",
        description: "attractions.edfu.templeHorus.description",
        entryFee: "attractions.edfu.templeHorus.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.edfu.edfuMarket.name",
        description: "attractions.edfu.edfuMarket.description",
        entryFee: "attractions.edfu.edfuMarket.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "edfu",
      localTransport: ["horsecart", "taxi", "walking"],
    },
    budgetTips: [
      "budgetTips.edfu.nileCruiseStop",
      "budgetTips.edfu.horseCartRide",
      "budgetTips.edfu.affordableFood",
    ],
    image: "/images/edfu.jpg",
  },
  {
    id: 10,
    name: "komombo",
    arabicName: "كوم أمبو",
    region: "Upper Egypt",
    latitude: 24.4539,
    longitude: 32.9478,
    highlights: [
      "highlights.komOmbo.doubleTemple",
      "highlights.komOmbo.crocodileMuseum",
      "highlights.komOmbo.sugarCaneFields",
    ],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.halfday",
    keyAttractions: [
      {
        name: "attractions.komOmbo.templeKomOmbo.name",
        description: "attractions.komOmbo.templeKomOmbo.description",
        entryFee: "attractions.komOmbo.templeKomOmbo.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.komOmbo.crocodileMuseum.name",
        description: "attractions.komOmbo.crocodileMuseum.description",
        entryFee: "attractions.komOmbo.crocodileMuseum.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "komombo",
      localTransport: ["horsecart", "taxi", "walking"],
    },
    budgetTips: [
      "budgetTips.komOmbo.combineWithEdfu",
      "budgetTips.komOmbo.sunsetViews",
      "budgetTips.komOmbo.basicTown",
    ],
    image:
      "/images/ko-mombo-temple.jpg",
  },
  {
    id: 11,
    name: "aswan",
    arabicName: "أسوان",
    region: "Upper Egypt",
    latitude: 24.0889,
    longitude: 32.8998,
    highlights: [
      "highlights.aswan.philaeTemple",
      "highlights.aswan.highDam",
      "highlights.aswan.nubianVillages",
      "highlights.aswan.elephantineIsland",
    ],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.2_3days",
    keyAttractions: [
      {
        name: "attractions.aswan.philaeTemple.name",
        description: "attractions.aswan.philaeTemple.description",
        entryFee: "attractions.aswan.philaeTemple.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.aswan.highDam.name",
        description: "attractions.aswan.highDam.description",
        entryFee: "attractions.aswan.highDam.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.aswan.unfinishedObelisk.name",
        description: "attractions.aswan.unfinishedObelisk.description",
        entryFee: "attractions.aswan.unfinishedObelisk.entryFee",
        hours: "attractions.aswan.unfinishedObelisk.hours",
      },
      {
        name: "attractions.aswan.nubian.name",
        description: "attractions.aswan.nubian.description",
        entryFee: "attractions.aswan.nubian.entryFee",
        hours: "attractions.aswan.nubian.hours",
      },
      {
        name: "attractions.aswan.nubianVillage.name",
        description: "attractions.aswan.nubianVillage.description",
        entryFee: "attractions.aswan.nubianVillage.entryFee",
        hours: "attractions.aswan.nubianVillage.hours",
      },
      {
        name: "attractions.aswan.botanical.name",
        description: "attractions.aswan.botanical.description",
        entryFee: "attractions.aswan.botanical.entryFee",
        hours: "attractions.aswan.botanical.hours",
      },
    ],
    transportation: {
      fromCairo: "aswan",
      localTransport: ["felucca", "taxi", "motorboat"],
    },
    budgetTips: [
      "budgetTips.aswan.stayNearSouk",
      "budgetTips.aswan.feluccaRides",
      "budgetTips.aswan.nubianVillages",
      "budgetTips.aswan.spiceShopping",
    ],
    image:
      "/images/philae-temple.jpg",
  },
  {
    id: 12,
    name: "abusimbel",
    arabicName: "أبو سمبل",
    region: "Nubia",
    latitude: 22.3372,
    longitude: 31.6256,
    highlights: [
      "highlights.abuSimbel.greatTemple",
      "highlights.abuSimbel.templeNefertari",
      "highlights.abuSimbel.unescoSite",
    ],
    bestTimeToVisit: "nile.bestTime.octoberMarch",
    averageStay: "nile.stay.1day",
    keyAttractions: [
      {
        name: "attractions.abuSimbel.greatTempleRamesses.name",
        description: "attractions.abuSimbel.greatTempleRamesses.description",
        entryFee: "attractions.abuSimbel.greatTempleRamesses.entryFee",
        hours: "attractions.hoursVary",
      },
      {
        name: "attractions.abuSimbel.templeNefertari.name",
        description: "attractions.abuSimbel.templeNefertari.description",
        entryFee: "attractions.abuSimbel.templeNefertari.entryFee",
        hours: "attractions.hoursVary",
      },
    ],
    transportation: {
      fromCairo: "abusimbel",
      localTransport: ["tourbus", "privatecar"],
    },
    budgetTips: [
      "budgetTips.abuSimbel.dayTripFromAswan",
      "budgetTips.abuSimbel.joinGroupTours",
      "budgetTips.abuSimbel.bringLunchWater",
      "budgetTips.abuSimbel.earlyMorningArrival",
    ],
    image: "/images/abu-simbel.jpg",
    detailImage:
      "/images/abu-simbel-1.jpg",
  },
];

export default function NileValleyGuide() {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState<NileCity | null>(
    nileValleyCities[0],
  ); // Default to Alexandria
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // City copy is stored as keys on the city records; the words live in the
  // locale files under nileValleyGuide.data. This used to be a 1,000-line
  // en/es/fr/de map inlined in the component, in which fr and de were missing
  // 94 of the 218 entries and es 52 — all of them silently falling back to
  // English on a page the visitor had asked to read in their own language.
  const translateKey = (key: string): string => t(`nileValleyGuide.data.${key}`);

  // The filter compares region keys, never their labels. Previously the button
  // text WAS the state — a translated label mapped back to English through a
  // hand-kept table of every language's wording, so a single missing entry
  // silently filtered the list down to nothing.
  const filteredCities =
    selectedRegion === "All"
      ? nileValleyCities
      : nileValleyCities.filter((city) => city.region === selectedRegion);

  const navigateToQuote = () => {
    // Navigate to the pricing tool page
    window.location.href = "/pricing-tool";
  };

  return (
    <div className="min-h-screen bg-white">
  <SeoMeta
          title={SEO_TITLE}
          description={SEO_DESCRIPTION}
          canonical="https://affordegypt.com/nile-valley-guide"
          ogImage="https://affordegypt.com/images/nile-valley.jpg"
          schema={[articleSchema({
            headline: SEO_TITLE,
            description: SEO_DESCRIPTION,
            canonical: "https://affordegypt.com/nile-valley-guide",
            image: "https://affordegypt.com/images/nile-valley.jpg",
            datePublished: "2025-06-07",
            dateModified: "2026-08-12",
          }), breadcrumbSchema(trailFor("/nile-valley-guide")!)]}
          ogType="article"
        />
      <Navbar />
      <PageBreadcrumbs />

      <GuideToc />
      {/* Hero Section */}
      <header
        className="min-h-[90vh] flex items-center justify-center relative bg-cover bg-center bg-fixed bg-[url('/images/nile-valley-1.jpg')]"
      >
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
            {`${t('nileValleyGuide.title')} `}
            <span className="text-primary-foreground bg-primary px-3 py-1 rounded-lg inline-block">
              {t('nileValleyGuide.subtitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto text-balance text-center">
            {t('nileValleyGuide.description')}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">
                {t('nileValleyGuide.hero.features.cities.title')}
              </h4>
              <p className="text-sm text-white/80">
                {t('nileValleyGuide.hero.features.cities.description')}
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">
                {t('nileValleyGuide.hero.features.sites.title')}
              </h4>
              <p className="text-sm text-white/80">
                {t('nileValleyGuide.hero.features.sites.description')}
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
              <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="font-semibold mb-2 text-green-primary">
                {t('nileValleyGuide.hero.features.budget.title')}
              </h4>
              <p className="text-sm text-white/80">
                {t('nileValleyGuide.hero.features.budget.description')}
              </p>
            </div>
          </div>

          <Button
            onClick={navigateToQuote}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1"
          >
            {`${t('nileValleyGuide.hero.cta')} →`}
          </Button>
        </div>
      </header>

      {/* Interactive Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('nileValleyGuide.map.title')}
          </h2>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {REGION_FILTERS.map(({ value, labelKey }) => (
                <Button
                  key={value}
                  variant={selectedRegion === value ? "default" : "outline"}
                  onClick={() => setSelectedRegion(value)}
                  className="text-sm"
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>

            <div className="relative bg-gradient-to-b from-blue-50 to-amber-50 rounded-lg p-4 sm:p-8 min-h-[400px] sm:min-h-[500px] overflow-hidden">
              {/* Egypt Map SVG Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg viewBox="0 0 400 600" className="w-full h-full max-w-md">
                  <defs>
                    <linearGradient
                      id="egyptGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor="#f4f1de"
                        stopOpacity={1}
                      />
                      <stop
                        offset="100%"
                        stopColor="#e07a5f"
                        stopOpacity={0.3}
                      />
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
                  <text
                    x="90"
                    y="300"
                    fill="#8B4513"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    {t('nileValleyGuide.mapLabels.western')}
                  </text>
                  <text
                    x="90"
                    y="315"
                    fill="#8B4513"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    {t('nileValleyGuide.mapLabels.desert')}
                  </text>

                  <text
                    x="310"
                    y="300"
                    fill="#8B4513"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    {t('nileValleyGuide.mapLabels.eastern')}
                  </text>
                  <text
                    x="310"
                    y="315"
                    fill="#8B4513"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity="0.7"
                  >
                    {t('nileValleyGuide.mapLabels.desert')}
                  </text>

                  {/* Desert terrain indicators */}
                  {/* Western Desert sand dunes */}
                  <circle cx="70" cy="200" r="3" fill="#D2B48C" opacity="0.4" />
                  <circle cx="85" cy="210" r="2" fill="#D2B48C" opacity="0.4" />
                  <circle cx="75" cy="380" r="4" fill="#D2B48C" opacity="0.4" />
                  <circle cx="90" cy="370" r="2" fill="#D2B48C" opacity="0.4" />
                  <circle cx="60" cy="450" r="3" fill="#D2B48C" opacity="0.4" />

                  {/* Eastern Desert rocky terrain */}
                  <polygon
                    points="320,200 325,195 330,200 325,205"
                    fill="#8B7355"
                    opacity="0.5"
                  />
                  <polygon
                    points="335,250 340,245 345,250 340,255"
                    fill="#8B7355"
                    opacity="0.5"
                  />
                  <polygon
                    points="315,380 320,375 325,380 320,385"
                    fill="#8B7355"
                    opacity="0.5"
                  />
                  <polygon
                    points="340,420 345,415 350,420 345,425"
                    fill="#8B7355"
                    opacity="0.5"
                  />
                </svg>
              </div>

              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg border">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  {t('nileValleyGuide.map.clickCities')}
                </p>
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
                        selectedCity?.id === city.id ? "z-10" : "z-0"
                      }`}
                      style={{
                        left: "50%",
                        top:
                          filteredCities.length === 1
                            ? "50%"
                            : `${(((index / (filteredCities.length - 1)) * 70 + 15) * 10000 | 0) / 10000}%`,
                      }}
                      onClick={() => {
                        setSelectedCity(city);
                        // Scroll to city details card after a short delay to allow state update
                        setTimeout(() => {
                          const element = document.getElementById(
                            "selected-city-details",
                          );
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                              inline: "nearest",
                            });
                          }
                        }, 100);
                      }}
                    >
                      <div
                        className={`
                        flex items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg border-2 transition-all duration-300 shadow-lg
                        ${
                          selectedCity?.id === city.id
                            ? "bg-primary text-white border-primary scale-110 shadow-xl"
                            : "bg-white border-gray-300 hover:border-primary hover:scale-105 hover:shadow-xl hover:bg-primary/5"
                        }
                      `}
                      >
                        <MapPin
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedCity?.id === city.id ? "animate-pulse" : ""}`}
                        />
                        <span className="font-medium text-xs sm:text-sm">
                          {t(`nileValleyGuide.cityNames.${city.name}`)}
                        </span>
                        <Badge
                          variant={
                            selectedCity?.id === city.id
                              ? "outline"
                              : "secondary"
                          }
                          className="text-xs hidden sm:block"
                        >
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
            <Card
              id="selected-city-details"
              className="p-6 border-primary border-2"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {t(`nileValleyGuide.cityNames.${selectedCity.name}`)}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    {selectedCity.arabicName}
                  </p>
                  <Badge className="mb-4">
                    {selectedCity.region === "Upper Egypt"
                      ? t('nileValleyGuide.completeGuide.regions.upperEgypt')
                      : selectedCity.region === "Middle Egypt"
                        ? t('nileValleyGuide.completeGuide.regions.middleEgypt')
                        : selectedCity.region === "Lower Egypt"
                          ? t('nileValleyGuide.completeGuide.regions.lowerEgypt')
                          : selectedCity.region === "Nubia"
                            ? t('nileValleyGuide.completeGuide.regions.nubia')
                            : selectedCity.region}
                  </Badge>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>
                        {`${t('nileValleyGuide.cityDetails.bestTime')} ${translateKey(selectedCity.bestTimeToVisit)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>
                        {`${t('nileValleyGuide.cityDetails.recommendedStay')} ${translateKey(selectedCity.averageStay)}`}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">
                    {t('nileValleyGuide.cityDetails.keyHighlights')}
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    {selectedCity.highlights.map((highlight, index) => (
                      <li key={index}>{translateKey(highlight)}</li>
                    ))}
                  </ul>

                  <h4 className="font-semibold mb-2">
                    {t('nileValleyGuide.cityDetails.budgetTips')}
                  </h4>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedCity.budgetTips.map((tip, index) => (
                      <li key={index}>{translateKey(tip)}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <img
                    src={selectedCity.detailImage || selectedCity.image}
                    alt={t(`nileValleyGuide.cityNames.${selectedCity.name}`)}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />

                  <h4 className="font-semibold mb-3">
                    {t('nileValleyGuide.cityDetails.transportation')}
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Train className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {t(`nileValleyGuide.fromCairo.${selectedCity.transportation.fromCairo}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {`${t('nileValleyGuide.cityDetails.localTransport')} ${selectedCity.transportation.localTransport.map((m) => t(`nileValleyGuide.transportModes.${m}`)).join(", ")}`}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">
                    {t('nileValleyGuide.cityDetails.topAttractions')}
                  </h4>
                  <div className="space-y-2">
                    {selectedCity.keyAttractions
                      .slice(0, 2)
                      .map((attraction, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium">
                            {translateKey(attraction.name)}
                          </h5>
                          <p className="text-sm text-gray-600 mb-1">
                            {translateKey(attraction.description)}
                          </p>
                          <div className="flex flex-col gap-1 text-xs text-gray-500">
                            <span>
                              {`${t('nileValleyGuide.cityDetails.entry')} ${translateKey(attraction.entryFee)}`}
                            </span>
                            <span>
                              {`${t('nileValleyGuide.cityDetails.hours')} ${translateKey(attraction.hours)}`}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {t('nileValleyGuide.priceNote')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Complete City Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t('nileValleyGuide.completeGuide.title')}
          </h2>
          <p className="text-sm text-gray-600 text-center max-w-3xl mx-auto mb-12">
            {t('nileValleyGuide.priceNote')}
          </p>

          <div className="grid gap-8">
            {nileValleyCities.map((city) => (
              <Card
                key={city.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img
                      src={city.image}
                      alt={t(`nileValleyGuide.cityNames.${city.name}`)}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">{t(`nileValleyGuide.cityNames.${city.name}`)}</h3>
                      <Badge>
                        {city.region === "Upper Egypt"
                          ? t('nileValleyGuide.completeGuide.regions.upperEgypt')
                          : city.region === "Middle Egypt"
                            ? t('nileValleyGuide.completeGuide.regions.middleEgypt')
                            : city.region === "Lower Egypt"
                              ? t('nileValleyGuide.completeGuide.regions.lowerEgypt')
                              : city.region === "Nubia"
                                ? t('nileValleyGuide.completeGuide.regions.nubia')
                                : city.region}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-1">{city.arabicName}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium">{`${t('nileValleyGuide.completeGuide.bestTime')} `}</span>
                        {translateKey(city.bestTimeToVisit)}
                      </div>
                      <div>
                        <span className="font-medium">{`${t('nileValleyGuide.completeGuide.stayDuration')} `}</span>
                        {translateKey(city.averageStay)}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">{`${t('nileValleyGuide.completeGuide.fromCairo')} `}</span>
                        {t(`nileValleyGuide.fromCairo.${city.transportation.fromCairo}`)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">
                        {t('nileValleyGuide.completeGuide.keyHighlights')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {city.highlights.map((highlight, index) => (
                          <Badge key={index} variant="outline">
                            {translateKey(highlight)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">
                          {t('nileValleyGuide.completeGuide.topAttractions')}
                        </h4>
                        <ul className="text-sm space-y-1">
                          {city.keyAttractions
                            .slice(0, 8)
                            .map((attraction, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{translateKey(attraction.name)}</span>
                                <span className="text-primary">
                                  {translateKey(attraction.entryFee)}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          {t('nileValleyGuide.completeGuide.budgetTips')}
                        </h4>
                        <ul className="text-sm space-y-1">
                          {city.budgetTips.slice(0, 2).map((tip, index) => (
                            <li key={index} className="text-gray-600">
                              {`• ${translateKey(tip)}`}
                            </li>
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
            {t('nileValleyGuide.transportation.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Train className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t('nileValleyGuide.transportation.train.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('nileValleyGuide.transportation.train.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>{`• ${t('nileValleyGuide.transportation.train.cairoLuxor')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.train.cairoAswan')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.train.acCoaches')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.train.nightTrains')}`}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Ship className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t('nileValleyGuide.transportation.cruise.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('nileValleyGuide.transportation.cruise.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>{`• ${t('nileValleyGuide.transportation.cruise.threeFourDays')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.cruise.allMeals')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.cruise.entranceFees')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.cruise.bestTime')}`}</li>
              </ul>
            </Card>

            <Card className="p-6 text-center">
              <Plane className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">
                {t('nileValleyGuide.transportation.flights.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('nileValleyGuide.transportation.flights.description')}
              </p>
              <ul className="text-sm text-left space-y-1">
                <li>{`• ${t('nileValleyGuide.transportation.flights.cairoLuxor')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.flights.cairoAswan')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.flights.abuSimbel')}`}</li>
                <li>{`• ${t('nileValleyGuide.transportation.flights.flightTimes')}`}</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Planning Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('nileValleyGuide.travelTips.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t('nileValleyGuide.travelTips.bestTime.title')}
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.bestTime.peakSeason')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('nileValleyGuide.travelTips.bestTime.peakDescription')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.bestTime.shoulderSeason')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('nileValleyGuide.travelTips.bestTime.shoulderDescription')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.bestTime.lowSeason')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('nileValleyGuide.travelTips.bestTime.lowDescription')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t('nileValleyGuide.travelTips.budgetBreakdown.title')}
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.budgetBreakdown.budget.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {
                      t('nileValleyGuide.travelTips.budgetBreakdown.budget.description')
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.budgetBreakdown.midRange.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {
                      t('nileValleyGuide.travelTips.budgetBreakdown.midRange.description')
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">
                    {t('nileValleyGuide.travelTips.budgetBreakdown.luxury.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {
                      t('nileValleyGuide.travelTips.budgetBreakdown.luxury.description')
                    }
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t('nileValleyGuide.travelTips.culturalEtiquette.title')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.dressModestly')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.removeShoes')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.askPermission')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.bargainRespectfully')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.tipStaff')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.culturalEtiquette.learnGreetings')}`}
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {t('nileValleyGuide.travelTips.healthSafety.title')}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  {`• ${t('nileValleyGuide.travelTips.healthSafety.drinkBottledWater')}`}
                </li>
                <li>{`• ${t('nileValleyGuide.travelTips.healthSafety.useSunscreen')}`}</li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.healthSafety.packMedications')}`}
                </li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.healthSafety.getTravelInsurance')}`}
                </li>
                <li>{`• ${t('nileValleyGuide.travelTips.healthSafety.keepCopies')}`}</li>
                <li>
                  {`• ${t('nileValleyGuide.travelTips.healthSafety.useRegisteredGuides')}`}
                </li>
                <li>{`• ${t('nileValleyGuide.travelTips.healthSafety.stayHydrated')}`}</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
