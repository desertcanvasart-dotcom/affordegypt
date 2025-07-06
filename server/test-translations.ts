import { db } from "./db";
import { cities } from "@shared/schema";
import { eq } from "drizzle-orm";

// Manual translation test for key cities
async function testTranslations() {
  console.log("Adding test translations for key cities...");
  
  try {
    // Update Cairo
    await db.update(cities)
      .set({
        nameTranslations: {
          en: "Cairo",
          es: "El Cairo",
          fr: "Le Caire", 
          de: "Kairo"
        },
        descriptionTranslations: {
          en: "Egypt's Capital with The Famous Pyramids",
          es: "Capital de Egipto con las Famosas Pirámides",
          fr: "Capitale de l'Égypte avec les Célèbres Pyramides",
          de: "Ägyptens Hauptstadt mit den berühmten Pyramiden"
        }
      })
      .where(eq(cities.name, "Cairo"));
    
    // Update Alexandria  
    await db.update(cities)
      .set({
        nameTranslations: {
          en: "Alexandria",
          es: "Alejandría",
          fr: "Alexandrie",
          de: "Alexandria"
        },
        descriptionTranslations: {
          en: "Mediterranean coastal city",
          es: "Ciudad costera mediterránea",
          fr: "Ville côtière méditerranéenne",
          de: "Mediterrane Küstenstadt"
        }
      })
      .where(eq(cities.name, "Alexandria"));
      
    // Update Luxor
    await db.update(cities)
      .set({
        nameTranslations: {
          en: "Luxor",
          es: "Lúxor",
          fr: "Louxor",
          de: "Luxor"
        },
        descriptionTranslations: {
          en: "Ancient city with temples and tombs",
          es: "Ciudad antigua con templos y tumbas",
          fr: "Ville antique avec des temples et des tombeaux",
          de: "Antike Stadt mit Tempeln und Gräbern"
        }
      })
      .where(eq(cities.name, "Luxor"));
    
    console.log("Test translations added successfully!");
    
  } catch (error) {
    console.error("Error adding test translations:", error);
  }
}

testTranslations();