import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Camera, Mountain, Waves, Sun, Compass, AlertTriangle, Thermometer } from "lucide-react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/navbar";
import GuideToc from "@/components/guide-toc";
import Footer from "@/components/footer";
import { useTranslation } from 'react-i18next';
import SeoMeta from "@/components/seo-meta";
import { articleSchema } from "@/lib/article-schema";
import { breadcrumbSchema, trailFor } from "@/lib/breadcrumb-schema";
import PageBreadcrumbs from "@/components/page-breadcrumbs";

export default function SinaiPeninsulaGuide() {
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const currentLanguage = i18n.language;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const content: Record<string, any> = {
    en: {
      title: "Sinai Peninsula",
      subtitle: "Where Desert Meets Sea",
      description: "Discover Egypt's most diverse region, where ancient mountains meet crystal-clear waters, and Bedouin culture thrives in pristine desert landscapes.",
      safetyNoteLabel: "Safety note:",
      safetyNote: "Advice for Sinai varies sharply by area and can change. Check your government's current travel advice, local access rules, and insurance coverage immediately before travel; do not treat northern or interior Sinai as generally open to tourists.",
      destinations: {
        title: "Top Destinations",
        description: "From world-class diving sites to sacred mountains, explore the peninsula's most captivating locations.",
        items: [
          {
            name: "Sharm El Sheikh",
            description: "Egypt's premier Red Sea resort destination with world-class diving and luxury resorts",
            highlights: ["Ras Mohammed National Park", "Naama Bay", "Tiran Island", "Luxury resorts"],
            bestTime: "Oct-Apr",
            duration: "3-7 days",
            difficulty: "Easy",
            image: "🏖️",
            details: "The Red Sea's crown jewel, evolved from a Bedouin fishing settlement into one of the world's most celebrated diving destinations"
          },
          {
            name: "Dahab",
            description: "Laid-back coastal town famous for the Blue Hole and backpacker-friendly atmosphere",
            highlights: ["Blue Hole diving", "Windsurfing", "Bedouin camps", "Coral reefs"],
            bestTime: "Oct-Apr",
            duration: "2-5 days",
            difficulty: "Moderate",
            image: "🤿",
            details: "A laid-back coastal town beloved by backpackers and divers, famous for the Blue Hole and relaxed atmosphere"
          },
          {
            name: "Mount Sinai",
            description: "Mountain traditionally identified in Jewish, Christian, and Islamic tradition with Moses and the Ten Commandments",
            highlights: ["Sunrise trek", "St. Catherine's Monastery", "Biblical history", "Desert views"],
            bestTime: "Oct-Apr",
            duration: "1-2 days",
            difficulty: "Moderate",
            image: "⛰️",
            details: "A major pilgrimage destination near St. Catherine's Monastery, with sunrise hikes and mountain scenery"
          },
          {
            name: "Nuweiba",
            description: "Peaceful port town offering pristine beaches and authentic Bedouin experiences",
            highlights: ["Colored Canyon", "Fjord Bay", "Tarabin beach", "Desert safaris"],
            bestTime: "Oct-Apr",
            duration: "2-3 days",
            difficulty: "Easy",
            image: "🏕️",
            details: "Peaceful port town offering pristine beaches, coral reefs, and authentic Bedouin experiences"
          }
        ]
      },
      activities: {
        title: "Adventures & Experiences",
        description: "From underwater exploration to desert adventures, the Sinai offers experiences for every type of traveler.",
        priceNote: "The USD prices below are indicative starting rates from local operators, not fixed tariffs. They vary by season, group size and inclusions, so ask for a dated quote before you book.",
        categories: [
          {
            category: "Water Sports & Diving",
            items: [
              { name: "World-Class Diving", price: "From $45/day", description: "Explore legendary dive sites with pristine coral reefs and historic wrecks in crystal-clear Red Sea waters." },
              { name: "Coral Reef Snorkeling", price: "From $25/day", description: "Discover colorful marine life in shallow reefs perfect for beginners and experienced snorkelers alike." },
              { name: "Windsurfing", price: "From $35/hour", description: "Perfect wind conditions in Dahab make it ideal for windsurfing enthusiasts." },
              { name: "Kitesurfing", price: "From $50/lesson", description: "Learn kitesurfing in ideal wind conditions with professional instructors." }
            ]
          },
          {
            category: "Desert Adventures",
            items: [
              { name: "Multi-Day Camel Trek", price: "From $80/day", description: "Journey deep into the desert on traditional camel caravans with overnight camping under stars." },
              { name: "Desert Safari Adventures", price: "From $50/day", description: "Explore dramatic canyons, oases, and Bedouin camps with local guides who share ancient desert wisdom." },
              { name: "Colored Canyon Trek", price: "From $45/person", description: "Hike through spectacular multicolored rock formations carved by millennia of wind and water." },
              { name: "Bedouin Desert Camp", price: "From $55/night", description: "Sleep under brilliant desert stars while enjoying traditional music, food, and storytelling." }
            ]
          },
          {
            category: "Cultural Experiences",
            items: [
              { name: "Mount Sinai Sunrise Trek", price: "From $35/person", description: "Climb the sacred mountain in darkness to witness a breathtaking sunrise over the desert landscape." },
              { name: "St. Catherine's Monastery", price: "From $20/person", description: "Visit St. Catherine's, one of the world's oldest continuously functioning Christian monasteries, with an important manuscript and icon collection." },
              { name: "Bedouin Village Experience", price: "From $30/person", description: "Share traditional meals and stories with Bedouin families in authentic desert settlements." },
              { name: "Wadi Feiran Oasis", price: "From $35/person", description: "Explore a palm-filled oasis associated by tradition with the biblical Rephidim; the identification is not archaeologically certain." }
            ]
          }
        ]
      },
      practical: {
        title: "Practical Information",
        description: "Essential information for planning your Sinai adventure, from weather to safety tips.",
        items: [
          {
            title: "Best Time to Visit",
            content: "October to April usually offers milder conditions, but mountain nights can be cold and coastal conditions vary. Summer heat can exceed 40°C inland; check the local forecast and activity conditions."
          },
          {
            title: "Getting There",
            content: "Fly to Sharm El Sheikh (SSH) for southern Sinai. Taba airport service is limited and date-dependent, so verify that a flight actually operates before suggesting it. Cairo-Sharm road journeys commonly take about 6-8 hours, while Dahab, Nuweiba, St. Catherine, and Taba take longer depending on route, stops, and checkpoints."
          },
          {
            title: "Safety Tips",
            content: "Stay hydrated, use sun protection, and inform others of your hiking plans. Follow local guidelines for diving and desert activities. Respect Bedouin customs and traditions."
          },
          {
            title: "What to Pack",
            content: "Lightweight clothing for day, warm layers for desert nights, sturdy hiking boots, sun hat, reef-safe sunscreen, and plenty of water. Bring cash for local purchases."
          }
        ]
      },
      itineraries: {
        title: "Sample Itineraries",
        description: "Carefully crafted journeys to help you make the most of your Sinai adventure.",
        items: [
          {
            title: "Sinai Highlights (5 Days)",
            days: ["Arrive Sharm El Sheikh, Red Sea diving", "Mount Sinai sunrise trek, St. Catherine's Monastery", "Colored Canyon and Nuweiba", "Dahab relaxation and Blue Hole", "Departure from Sharm El Sheikh"],
            price: "From $450 per person"
          },
          {
            title: "Adventure Explorer (7 Days)",
            days: ["Arrival and Sharm diving", "Camel trek into desert", "Mount Sinai and monastery visit", "Colored Canyon adventures", "Dahab wind and kitesurfing", "Bedouin cultural experience", "Final diving and departure"],
            price: "From $650 per person"
          },
          {
            title: "Relaxed Discovery (4 Days)",
            days: ["Sharm El Sheikh arrival and snorkeling", "Mount Sinai easy trek", "Dahab relaxation day", "Final Red Sea diving and departure"],
            price: "From $320 per person"
          }
        ]
      },
      cta: {
        title: "Ready to Explore Sinai?",
        description: "Book your Sinai Peninsula adventure today and discover where desert magic meets Red Sea paradise.",
        button: "Start Planning Your Trip"
      }
    },
    es: {
      title: "Península del Sinaí",
      subtitle: "Donde el Desierto se Encuentra con el Mar",
      description: "Descubre la región más diversa de Egipto, donde las montañas antiguas se encuentran con aguas cristalinas y la cultura beduina prospera en paisajes desérticos prístinos.",
      destinations: {
        title: "Principales Destinos",
        description: "Desde sitios de buceo de clase mundial hasta montañas sagradas, explora las ubicaciones más cautivadoras de la península.",
        items: [
          {
            name: "Sharm El Sheikh",
            description: "El principal destino turístico del Mar Rojo de Egipto con buceo de clase mundial y resorts de lujo",
            highlights: ["Parque Nacional Ras Mohammed", "Bahía Naama", "Isla Tiran", "Resorts de lujo"],
            bestTime: "Oct-Abr",
            duration: "3-7 días",
            difficulty: "Fácil",
            image: "🏖️",
            details: "La joya de la corona del Mar Rojo, evolucionó de un asentamiento pesquero beduino a uno de los destinos de buceo más célebres del mundo"
          },
          {
            name: "Dahab",
            description: "Ciudad costera relajada famosa por el Agujero Azul y ambiente amigable para mochileros",
            highlights: ["Buceo Agujero Azul", "Windsurf", "Campamentos beduinos", "Arrecifes de coral"],
            bestTime: "Oct-Abr",
            duration: "2-5 días",
            difficulty: "Moderado",
            image: "🤿",
            details: "Una ciudad costera relajada querida por mochileros y buceadores, famosa por el Agujero Azul y ambiente relajado"
          },
          {
            name: "Monte Sinaí",
            description: "Montaña sagrada donde Moisés recibió los Diez Mandamientos",
            highlights: ["Caminata al amanecer", "Monasterio de Santa Catalina", "Historia bíblica", "Vistas del desierto"],
            bestTime: "Oct-Abr",
            duration: "1-2 días",
            difficulty: "Moderado",
            image: "⛰️",
            details: "Montaña sagrada donde Moisés recibió los Diez Mandamientos, hogar de monasterios antiguos y peregrinación espiritual"
          },
          {
            name: "Nuweiba",
            description: "Ciudad portuaria pacífica que ofrece playas prístinas y experiencias beduinas auténticas",
            highlights: ["Cañón de Colores", "Bahía Fjord", "Playa Tarabin", "Safaris del desierto"],
            bestTime: "Oct-Abr",
            duration: "2-3 días",
            difficulty: "Fácil",
            image: "🏕️",
            details: "Ciudad portuaria pacífica que ofrece playas prístinas, arrecifes de coral y experiencias beduinas auténticas"
          }
        ]
      },
      activities: {
        title: "Aventuras y Experiencias",
        description: "Desde exploración submarina hasta aventuras desérticas, el Sinaí ofrece experiencias para todo tipo de viajero.",
        categories: [
          {
            category: "Deportes Acuáticos y Buceo",
            items: [
              { name: "Buceo de Clase Mundial", price: "Desde $45/día", description: "Explora sitios de buceo legendarios con arrecifes de coral prístinos y naufragios históricos en aguas cristalinas del Mar Rojo." },
              { name: "Snorkel en Arrecifes", price: "Desde $25/día", description: "Descubre la colorida vida marina en arrecifes poco profundos perfectos para principiantes y snorkelers experimentados." },
              { name: "Windsurf", price: "Desde $35/hora", description: "Las condiciones perfectas de viento en Dahab lo hacen ideal para entusiastas del windsurf." },
              { name: "Kitesurf", price: "Desde $50/lección", description: "Aprende kitesurf en condiciones ideales de viento con instructores profesionales." }
            ]
          },
          {
            category: "Aventuras del Desierto",
            items: [
              { name: "Trekking de Camellos", price: "Desde $80/día", description: "Viaja profundo en el desierto en caravanas tradicionales de camellos con campamento nocturno bajo las estrellas." },
              { name: "Safari del Desierto", price: "Desde $50/día", description: "Explora cañones dramáticos, oasis y campamentos beduinos con guías locales que comparten sabiduría ancestral del desierto." },
              { name: "Caminata Cañón de Colores", price: "Desde $45/persona", description: "Camina a través de formaciones rocosas multicolores espectaculares talladas por milenios de viento y agua." },
              { name: "Campamento Beduino", price: "Desde $55/noche", description: "Duerme bajo brillantes estrellas del desierto mientras disfrutas música, comida y narración tradicional." }
            ]
          },
          {
            category: "Experiencias Culturales",
            items: [
              { name: "Caminata Amanecer Monte Sinaí", price: "Desde $35/persona", description: "Escala la montaña sagrada en la oscuridad para presenciar un amanecer impresionante sobre el paisaje desértico." },
              { name: "Monasterio Santa Catalina", price: "Desde $20/persona", description: "Visita uno de los monasterios en funcionamiento continuo más antiguos del mundo con manuscritos y arte invaluables." },
              { name: "Experiencia Pueblo Beduino", price: "Desde $30/persona", description: "Comparte comidas y historias tradicionales con familias beduinas en asentamientos auténticos del desierto." },
              { name: "Oasis Wadi Feiran", price: "Desde $35/persona", description: "Explora el desierto bíblico donde vagaron los israelitas, ahora un oasis exuberante con palmeras datileras." }
            ]
          }
        ]
      },
      practical: {
        title: "Información Práctica",
        description: "Información esencial para planificar tu aventura en el Sinaí, desde el clima hasta consejos de seguridad.",
        items: [
          {
            title: "Mejor Época para Visitar",
            content: "Octubre a abril ofrece clima perfecto con días cálidos y noches frescas. Evita los meses de verano (junio-agosto) cuando las temperaturas superan los 40°C. La primavera (marzo-mayo) es ideal para senderismo y buceo."
          },
          {
            title: "Cómo Llegar",
            content: "Vuela a Sharm El Sheikh (SSH) para el sur del Sinaí o Taba para áreas del norte. Los traslados terrestres desde El Cairo toman 6-7 horas a través de paisajes desérticos impresionantes."
          },
          {
            title: "Consejos de Seguridad",
            content: "Mantente hidratado, usa protección solar e informa a otros de tus planes de senderismo. Sigue las pautas locales para buceo y actividades desérticas. Respeta las costumbres y tradiciones beduinas."
          },
          {
            title: "Qué Empacar",
            content: "Ropa ligera para el día, capas abrigadas para noches desérticas, botas de senderismo resistentes, sombrero, protector solar seguro para arrecifes y mucha agua. Trae efectivo para compras locales."
          }
        ]
      },
      itineraries: {
        title: "Itinerarios de Muestra",
        description: "Viajes cuidadosamente elaborados para ayudarte a aprovechar al máximo tu aventura en el Sinaí.",
        items: [
          {
            title: "Aspectos Destacados del Sinaí (5 Días)",
            days: ["Llegada Sharm El Sheikh, buceo Mar Rojo", "Caminata amanecer Monte Sinaí, Monasterio Santa Catalina", "Cañón de Colores y Nuweiba", "Relajación en Dahab y Agujero Azul", "Salida desde Sharm El Sheikh"],
            price: "Desde $450 por persona"
          },
          {
            title: "Explorador de Aventuras (7 Días)",
            days: ["Llegada y buceo en Sharm", "Trekking de camellos al desierto", "Monte Sinaí y visita al monasterio", "Aventuras Cañón de Colores", "Windsurf y kitesurf en Dahab", "Experiencia cultural beduina", "Buceo final y salida"],
            price: "Desde $650 por persona"
          },
          {
            title: "Descubrimiento Relajado (4 Días)",
            days: ["Llegada Sharm El Sheikh y snorkel", "Caminata fácil Monte Sinaí", "Día de relajación en Dahab", "Buceo final Mar Rojo y salida"],
            price: "Desde $320 por persona"
          }
        ]
      },
      cta: {
        title: "¿Listo para Explorar el Sinaí?",
        description: "Reserva tu aventura en la Península del Sinaí hoy y descubre donde la magia del desierto se encuentra con el paraíso del Mar Rojo.",
        button: "Comenzar a Planificar tu Viaje"
      }
    },
    fr: {
      title: "Péninsule du Sinaï",
      subtitle: "Où le Désert Rencontre la Mer",
      description: "Découvrez la région la plus diverse d'Égypte, où les montagnes anciennes rencontrent des eaux cristallines et la culture bédouine prospère dans des paysages désertiques pristins.",
      destinations: {
        title: "Principales Destinations",
        description: "Des sites de plongée de classe mondiale aux montagnes sacrées, explorez les lieux les plus captivants de la péninsule.",
        items: [
          {
            name: "Sharm El Sheikh",
            description: "La principale destination touristique de la mer Rouge d'Égypte avec plongée de classe mondiale et complexes de luxe",
            highlights: ["Parc National Ras Mohammed", "Baie Naama", "Île Tiran", "Complexes de luxe"],
            bestTime: "Oct-Avr",
            duration: "3-7 jours",
            difficulty: "Facile",
            image: "🏖️",
            details: "Le joyau de la couronne de la mer Rouge, évoluant d'un village de pêcheurs bédouins à l'une des destinations de plongée les plus célèbres au monde"
          },
          {
            name: "Dahab",
            description: "Ville côtière décontractée célèbre pour le Trou Bleu et l'atmosphère conviviale pour les routards",
            highlights: ["Plongée Trou Bleu", "Planche à voile", "Camps bédouins", "Récifs coralliens"],
            bestTime: "Oct-Avr",
            duration: "2-5 jours",
            difficulty: "Modéré",
            image: "🤿",
            details: "Une ville côtière décontractée aimée des routards et plongeurs, célèbre pour le Trou Bleu et l'atmosphère relaxante"
          },
          {
            name: "Mont Sinaï",
            description: "Montagne sacrée où Moïse reçut les Dix Commandements",
            highlights: ["Randonnée lever du soleil", "Monastère Sainte-Catherine", "Histoire biblique", "Vues du désert"],
            bestTime: "Oct-Avr",
            duration: "1-2 jours",
            difficulty: "Modéré",
            image: "⛰️",
            details: "Montagne sacrée où Moïse reçut les Dix Commandements, foyer de monastères anciens et pèlerinage spirituel"
          },
          {
            name: "Nuweiba",
            description: "Ville portuaire paisible offrant des plages pristines et des expériences bédouines authentiques",
            highlights: ["Canyon Coloré", "Baie Fjord", "Plage Tarabin", "Safaris du désert"],
            bestTime: "Oct-Avr",
            duration: "2-3 jours",
            difficulty: "Facile",
            image: "🏕️",
            details: "Ville portuaire paisible offrant des plages pristines, récifs coralliens et expériences bédouines authentiques"
          }
        ]
      },
      activities: {
        title: "Aventures et Expériences",
        description: "De l'exploration sous-marine aux aventures désertiques, le Sinaï offre des expériences pour tout type de voyageur.",
        categories: [
          {
            category: "Sports Nautiques et Plongée",
            items: [
              { name: "Plongée de Classe Mondiale", price: "À partir de $45/jour", description: "Explorez des sites de plongée légendaires avec récifs coralliens pristins et épaves historiques dans les eaux cristallines de la mer Rouge." },
              { name: "Snorkeling Récifs Coralliens", price: "À partir de $25/jour", description: "Découvrez la vie marine colorée dans des récifs peu profonds parfaits pour débutants et snorkelers expérimentés." },
              { name: "Planche à Voile", price: "À partir de $35/heure", description: "Les conditions de vent parfaites à Dahab en font l'endroit idéal pour les passionnés de planche à voile." },
              { name: "Kitesurf", price: "À partir de $50/leçon", description: "Apprenez le kitesurf dans des conditions de vent idéales avec des instructeurs professionnels." }
            ]
          },
          {
            category: "Aventures du Désert",
            items: [
              { name: "Randonnée Chameau Multi-Jours", price: "À partir de $80/jour", description: "Voyagez profondément dans le désert sur des caravanes traditionnelles de chameaux avec camping nocturne sous les étoiles." },
              { name: "Safari du Désert", price: "À partir de $50/jour", description: "Explorez des canyons dramatiques, oasis et camps bédouins avec guides locaux qui partagent la sagesse ancestrale du désert." },
              { name: "Randonnée Canyon Coloré", price: "À partir de $45/personne", description: "Marchez à travers des formations rocheuses multicolores spectaculaires sculptées par des millénaires de vent et d'eau." },
              { name: "Camp Bédouin du Désert", price: "À partir de $55/nuit", description: "Dormez sous les étoiles brillantes du désert en profitant de musique, nourriture et contes traditionnels." }
            ]
          },
          {
            category: "Expériences Culturelles",
            items: [
              { name: "Randonnée Lever Soleil Mont Sinaï", price: "À partir de $35/personne", description: "Escaladez la montagne sacrée dans l'obscurité pour assister à un lever de soleil à couper le souffle sur le paysage désertique." },
              { name: "Monastère Sainte-Catherine", price: "À partir de $20/personne", description: "Visitez l'un des monastères en fonctionnement continu les plus anciens au monde avec manuscrits et art inestimables." },
              { name: "Expérience Village Bédouin", price: "À partir de $30/personne", description: "Partagez repas et histoires traditionnels avec familles bédouines dans settlements authentiques du désert." },
              { name: "Oasis Wadi Feiran", price: "À partir de $35/personne", description: "Explorez le désert biblique où errèrent les Israélites, maintenant une oasis luxuriante avec palmiers dattiers." }
            ]
          }
        ]
      },
      practical: {
        title: "Informations Pratiques",
        description: "Informations essentielles pour planifier votre aventure au Sinaï, de la météo aux conseils de sécurité.",
        items: [
          {
            title: "Meilleure Période pour Visiter",
            content: "Octobre à avril offre un temps parfait avec journées chaudes et nuits fraîches. Évitez les mois d'été (juin-août) quand les températures dépassent 40°C. Le printemps (mars-mai) est idéal pour randonnée et plongée."
          },
          {
            title: "Comment S'y Rendre",
            content: "Volez vers Sharm El Sheikh (SSH) pour le sud du Sinaï ou Taba pour les zones nord. Les transferts terrestres depuis Le Caire prennent 6-7 heures à travers des paysages désertiques époustouflants."
          },
          {
            title: "Conseils de Sécurité",
            content: "Restez hydraté, utilisez protection solaire et informez autres de vos plans de randonnée. Suivez directives locales pour plongée et activités désertiques. Respectez coutumes et traditions bédouines."
          },
          {
            title: "Que Emballer",
            content: "Vêtements légers pour jour, couches chaudes pour nuits désertiques, bottes de randonnée robustes, chapeau soleil, crème solaire safe-reef et beaucoup d'eau. Apportez espèces pour achats locaux."
          }
        ]
      },
      itineraries: {
        title: "Itinéraires Exemples",
        description: "Voyages soigneusement conçus pour vous aider à tirer le meilleur parti de votre aventure au Sinaï.",
        items: [
          {
            title: "Points Forts du Sinaï (5 Jours)",
            days: ["Arrivée Sharm El Sheikh, plongée mer Rouge", "Randonnée lever soleil Mont Sinaï, Monastère Sainte-Catherine", "Canyon Coloré et Nuweiba", "Relaxation Dahab et Trou Bleu", "Départ depuis Sharm El Sheikh"],
            price: "À partir de $450 par personne"
          },
          {
            title: "Explorateur Aventure (7 Jours)",
            days: ["Arrivée et plongée à Sharm", "Randonnée chameau dans désert", "Mont Sinaï et visite monastère", "Aventures Canyon Coloré", "Planche à voile et kitesurf Dahab", "Expérience culturelle bédouine", "Plongée finale et départ"],
            price: "À partir de $650 par personne"
          },
          {
            title: "Découverte Relaxée (4 Jours)",
            days: ["Arrivée Sharm El Sheikh et snorkeling", "Randonnée facile Mont Sinaï", "Jour relaxation Dahab", "Plongée finale mer Rouge et départ"],
            price: "À partir de $320 par personne"
          }
        ]
      },
      cta: {
        title: "Prêt à Explorer le Sinaï?",
        description: "Réservez votre aventure dans la Péninsule du Sinaï aujourd'hui et découvrez où la magie du désert rencontre le paradis de la mer Rouge.",
        button: "Commencer à Planifier Votre Voyage"
      }
    },
    de: {
      title: "Sinai-Halbinsel",
      subtitle: "Wo Wüste auf Meer Trifft",
      description: "Entdecken Sie Ägyptens vielfältigste Region, wo uralte Berge auf kristallklares Wasser treffen und die Beduinenkultur in unberührten Wüstenlandschaften gedeiht.",
      destinations: {
        title: "Top-Reiseziele",
        description: "Von Weltklasse-Tauchplätzen bis zu heiligen Bergen, erkunden Sie die faszinierendsten Orte der Halbinsel.",
        items: [
          {
            name: "Sharm El Sheikh",
            description: "Ägyptens führendes Rotes-Meer-Resort-Ziel mit Weltklasse-Tauchen und Luxusresorts",
            highlights: ["Ras Mohammed Nationalpark", "Naama Bay", "Tiran Insel", "Luxusresorts"],
            bestTime: "Okt-Apr",
            duration: "3-7 Tage",
            difficulty: "Einfach",
            image: "🏖️",
            details: "Das Kronjuwel des Roten Meeres, entwickelt von einer Beduinen-Fischersiedlung zu einem der berühmtesten Tauchziele der Welt"
          },
          {
            name: "Dahab",
            description: "Entspannte Küstenstadt berühmt für das Blaue Loch und backpacker-freundliche Atmosphäre",
            highlights: ["Blaues Loch Tauchen", "Windsurfen", "Beduinencamps", "Korallenriffe"],
            bestTime: "Okt-Apr",
            duration: "2-5 Tage",
            difficulty: "Moderat",
            image: "🤿",
            details: "Eine entspannte Küstenstadt, geliebt von Backpackern und Tauchern, berühmt für das Blaue Loch und entspannte Atmosphäre"
          },
          {
            name: "Berg Sinai",
            description: "Heiliger Berg, wo Moses die Zehn Gebote erhielt",
            highlights: ["Sonnenaufgang-Wanderung", "Katharinenkloster", "Biblische Geschichte", "Wüstenblicke"],
            bestTime: "Okt-Apr",
            duration: "1-2 Tage",
            difficulty: "Moderat",
            image: "⛰️",
            details: "Heiliger Berg, wo Moses die Zehn Gebote erhielt, Heimat uralter Klöster und spiritueller Pilgerfahrt"
          },
          {
            name: "Nuweiba",
            description: "Friedliche Hafenstadt mit unberührten Stränden und authentischen Beduinen-Erlebnissen",
            highlights: ["Farbiger Canyon", "Fjord Bay", "Tarabin Strand", "Wüstensafaris"],
            bestTime: "Okt-Apr",
            duration: "2-3 Tage",
            difficulty: "Einfach",
            image: "🏕️",
            details: "Friedliche Hafenstadt mit unberührten Stränden, Korallenriffen und authentischen Beduinen-Erlebnissen"
          }
        ]
      },
      activities: {
        title: "Abenteuer & Erlebnisse",
        description: "Von Unterwasser-Erkundung bis Wüstenabenteuer bietet der Sinai Erlebnisse für jeden Reisetyp.",
        categories: [
          {
            category: "Wassersport & Tauchen",
            items: [
              { name: "Weltklasse-Tauchen", price: "Ab $45/Tag", description: "Erkunden Sie legendäre Tauchplätze mit unberührten Korallenriffen und historischen Wracks in kristallklaren Roten-Meer-Gewässern." },
              { name: "Korallenriff-Schnorcheln", price: "Ab $25/Tag", description: "Entdecken Sie farbenfrohe Meereslebewesen in flachen Riffen, perfekt für Anfänger und erfahrene Schnorchler." },
              { name: "Windsurfen", price: "Ab $35/Stunde", description: "Perfekte Windbedingungen in Dahab machen es ideal für Windsurfing-Enthusiasten." },
              { name: "Kitesurfen", price: "Ab $50/Lektion", description: "Lernen Sie Kitesurfen unter idealen Windbedingungen mit professionellen Lehrern." }
            ]
          },
          {
            category: "Wüstenabenteuer",
            items: [
              { name: "Mehrtägige Kamel-Wanderung", price: "Ab $80/Tag", description: "Reisen Sie tief in die Wüste auf traditionellen Kamelkarawanen mit nächtlichem Camping unter Sternen." },
              { name: "Wüstensafari-Abenteuer", price: "Ab $50/Tag", description: "Erkunden Sie dramatische Canyons, Oasen und Beduinencamps mit örtlichen Führern, die uralte Wüstenweisheit teilen." },
              { name: "Farbiger Canyon Wanderung", price: "Ab $45/Person", description: "Wandern Sie durch spektakuläre mehrfarbige Felsformationen, geformt von Jahrtausenden von Wind und Wasser." },
              { name: "Beduinen-Wüstencamp", price: "Ab $55/Nacht", description: "Schlafen Sie unter brillanten Wüstensternen während Sie traditionelle Musik, Essen und Geschichtenerzählen genießen." }
            ]
          },
          {
            category: "Kulturelle Erlebnisse",
            items: [
              { name: "Berg Sinai Sonnenaufgang-Wanderung", price: "Ab $35/Person", description: "Besteigen Sie den heiligen Berg in Dunkelheit, um einen atemberaubenden Sonnenaufgang über der Wüstenlandschaft zu erleben." },
              { name: "Katharinenkloster", price: "Ab $20/Person", description: "Besuchen Sie eines der ältesten kontinuierlich betriebenen Klöster der Welt mit unbezahlbaren Manuskripten und Kunst." },
              { name: "Beduinendorf-Erlebnis", price: "Ab $30/Person", description: "Teilen Sie traditionelle Mahlzeiten und Geschichten mit Beduinenfamilien in authentischen Wüstensiedlungen." },
              { name: "Wadi Feiran Oase", price: "Ab $35/Person", description: "Erkunden Sie die biblische Wildnis, wo die Israeliten wanderten, jetzt eine üppige Oase mit Dattelpalmen." }
            ]
          }
        ]
      },
      practical: {
        title: "Praktische Informationen",
        description: "Wesentliche Informationen für die Planung Ihres Sinai-Abenteuers, vom Wetter bis zu Sicherheitstipps.",
        items: [
          {
            title: "Beste Reisezeit",
            content: "Oktober bis April bietet perfektes Wetter mit warmen Tagen und kühlen Nächten. Vermeiden Sie Sommermonate (Juni-August), wenn Temperaturen 40°C übersteigen. Frühling (März-Mai) ist ideal für Wandern und Tauchen."
          },
          {
            title: "Anreise",
            content: "Fliegen Sie nach Sharm El Sheikh (SSH) für Süd-Sinai oder Taba für nördliche Bereiche. Landtransfers von Kairo dauern 6-7 Stunden durch atemberaubende Wüstenlandschaften."
          },
          {
            title: "Sicherheitstipps",
            content: "Bleiben Sie hydratisiert, verwenden Sie Sonnenschutz und informieren Sie andere über Ihre Wanderpläne. Befolgen Sie örtliche Richtlinien für Tauchen und Wüstenaktivitäten. Respektieren Sie Beduinen-Bräuche und Traditionen."
          },
          {
            title: "Was Einpacken",
            content: "Leichte Kleidung für Tag, warme Schichten für Wüstennächte, robuste Wanderstiefel, Sonnenhut, riff-sichere Sonnencreme und viel Wasser. Bringen Sie Bargeld für örtliche Einkäufe mit."
          }
        ]
      },
      itineraries: {
        title: "Beispiel-Reiserouten",
        description: "Sorgfältig gestaltete Reisen, um das Beste aus Ihrem Sinai-Abenteuer zu machen.",
        items: [
          {
            title: "Sinai Höhepunkte (5 Tage)",
            days: ["Ankunft Sharm El Sheikh, Rotes Meer Tauchen", "Berg Sinai Sonnenaufgang-Wanderung, Katharinenkloster", "Farbiger Canyon und Nuweiba", "Dahab Entspannung und Blaues Loch", "Abreise von Sharm El Sheikh"],
            price: "Ab $450 pro Person"
          },
          {
            title: "Abenteuer-Explorer (7 Tage)",
            days: ["Ankunft und Tauchen in Sharm", "Kamel-Wanderung in Wüste", "Berg Sinai und Klosterbesuch", "Farbiger Canyon Abenteuer", "Wind- und Kitesurfen in Dahab", "Beduinen-Kulturerlebnis", "Finales Tauchen und Abreise"],
            price: "Ab $650 pro Person"
          },
          {
            title: "Entspannte Entdeckung (4 Tage)",
            days: ["Sharm El Sheikh Ankunft und Schnorcheln", "Berg Sinai leichte Wanderung", "Dahab Entspannungstag", "Finales Rotes Meer Tauchen und Abreise"],
            price: "Ab $320 pro Person"
          }
        ]
      },
      cta: {
        title: "Bereit, den Sinai zu Erkunden?",
        description: "Buchen Sie heute Ihr Sinai-Halbinsel-Abenteuer und entdecken Sie, wo Wüstenmagie auf Rotes-Meer-Paradies trifft.",
        button: "Beginnen Sie Ihre Reiseplanung"
      }
    }
  };

  const currentContent = content[currentLanguage] || content.en;

  const destinations = currentContent.destinations.items;
  const activities = currentContent.activities.categories;
  const practicalInfo = currentContent.practical.items.map((item: any, index: number) => ({
    ...item,
    icon: [
      <Thermometer className="w-5 h-5 text-orange-500" />,
      <Compass className="w-5 h-5 text-blue-500" />,
      <AlertTriangle className="w-5 h-5 text-red-500" />,
      <Mountain className="w-5 h-5 text-green-500" />
    ][index]
  }));
  const itineraries = currentContent.itineraries.items;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
  <SeoMeta
          title="Sinai Peninsula Travel Guide | Mt. Sinai, Dahab, St. Catherine"
          description="From the rugged peaks of Mt. Sinai to the diving capitals of Dahab and Sharm El Sheikh. A practical, operator-honest guide to traveling Sinai."
          canonical="https://affordegypt.com/sinai-peninsula-guide"
          ogImage="https://affordegypt.com/images/sinai-monastery.jpg"
          schema={[articleSchema({
            headline: "Sinai Peninsula Travel Guide | Mt. Sinai, Dahab, St. Catherine",
            description:
              "From the rugged peaks of Mt. Sinai to the diving capitals of Dahab and Sharm El Sheikh. A practical, operator-honest guide to traveling Sinai.",
            canonical: "https://affordegypt.com/sinai-peninsula-guide",
            image: "https://affordegypt.com/images/sinai-monastery.jpg",
            datePublished: "2025-06-07",
            dateModified: "2026-08-12",
          }), breadcrumbSchema(trailFor("/sinai-peninsula-guide")!)]}
          ogType="article"
        />
      <Navbar />
      <PageBreadcrumbs />
      <GuideToc />
      {/* Hero Section */}
      <div
        className="relative text-white min-h-screen flex items-center bg-cover bg-center bg-fixed bg-[url('/images/red-sea-diving.jpg')]"
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                {currentContent.title}
              </h1>
              <p className="text-2xl md:text-3xl text-teal-100 font-light">
                {currentContent.subtitle}
              </p>
            </div>
            <p className="text-lg md:text-xl text-teal-200 max-w-4xl mx-auto leading-relaxed">
              {currentContent.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Waves className="w-5 h-5 mr-3" />
                Red Sea Diving Paradise
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Mountain className="w-5 h-5 mr-3" />
                Biblical Mount Sinai  
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Sun className="w-5 h-5 mr-3" />
                Bedouin Desert Culture
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Destinations Grid */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{currentContent.destinations.title}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {currentContent.destinations.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinations.map((destination: any, index: number) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3 text-teal-900">
                        <span className="text-3xl">{destination.image}</span>
                        {destination.name}
                      </CardTitle>
                      <p className="text-slate-600 mt-2">{destination.description}</p>
                      <p className="text-slate-700 mt-3 text-sm leading-relaxed">{destination.details}</p>
                    </div>
                    <Badge variant={destination.difficulty === 'Easy' || destination.difficulty === 'Facile' || destination.difficulty === 'Fácil' || destination.difficulty === 'Einfach' ? 'default' : destination.difficulty === 'Moderate' || destination.difficulty === 'Modéré' || destination.difficulty === 'Moderado' || destination.difficulty === 'Moderat' ? 'secondary' : 'destructive'}>
                      {destination.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights && Array.isArray(destination.highlights) && destination.highlights.map((highlight: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-teal-200 text-teal-700">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {destination.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        {destination.bestTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{currentContent.activities.title}</h2>
            <p className="text-xl text-slate-600">
              {currentContent.activities.description}
            </p>
            <p className="text-sm text-slate-600 max-w-3xl mx-auto mt-4">
              {currentContent.activities.priceNote || content.en.activities.priceNote}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activities.map((category: any, index: number) => (
              <Card key={index} className="border-0 bg-gradient-to-br from-white to-teal-50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center text-teal-900">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-teal-400 pl-4 py-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-slate-800">{item.name}</h4>
                          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                            {item.price}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sample Itineraries */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{currentContent.itineraries.title}</h2>
            <p className="text-xl text-slate-600">
              {currentContent.itineraries.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itineraries.map((itinerary: any, index: number) => (
              <Card key={index} className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-teal-900">{itinerary.title}</CardTitle>
                  <Badge variant="outline" className="w-fit border-teal-200 text-teal-700">
                    {itinerary.price}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {itinerary.days.map((day: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700 min-w-[32px] h-8 flex items-center justify-center">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm text-slate-600 leading-relaxed">{day}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Practical Information */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-900 mb-4">{currentContent.practical.title}</h2>
            <p className="text-xl text-slate-600">
              {currentContent.practical.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {practicalInfo.map((info: any, index: number) => (
              <Card key={index} className="border-0 bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-teal-900">
                    {info.icon}
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4">{currentContent.cta.title}</h2>
            <p className="text-xl mb-8 text-teal-100">
              {currentContent.cta.description}
            </p>
            <Button 
              size="lg" 
              // Buttons are white-space:nowrap. This label is 270px in English but
              // 338px in German ("Beginnen Sie Ihre Reiseplanung"), which pushed
              // past a 375px viewport and made the page scroll sideways. Sentence
              // -length CTAs must be allowed to wrap, or every longer translation
              // becomes a layout bug.
              className="bg-white text-teal-600 hover:bg-teal-50 text-base sm:text-lg px-6 sm:px-8 py-4 font-semibold whitespace-normal max-w-full"
              onClick={() => setLocation('/contact')}
            >
              {currentContent.cta.button}
            </Button>
          </div>
        </section>

        {/* Travel advisory. Advice for Sinai is area-specific and volatile, and
            a guide that reads as a blanket invitation is the one failure mode
            here that is a safety problem rather than a pricing one. Falls back
            to English so a locale without the string still shows the warning
            rather than silently dropping it. */}
        <section className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-6">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-900">
              <strong>{currentContent.safetyNoteLabel || content.en.safetyNoteLabel}</strong>{' '}
              {currentContent.safetyNote || content.en.safetyNote}
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}