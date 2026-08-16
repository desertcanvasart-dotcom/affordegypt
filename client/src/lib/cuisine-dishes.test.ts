import { describe, expect, it } from "vitest";
import { DISH_FACTS } from "./cuisine-dishes";
import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import fr from "../i18n/locales/fr.json";
import de from "../i18n/locales/de.json";

/**
 * The cuisine passport is assembled at render time from two halves: the facts in
 * cuisine-dishes.ts and the prose in the locale files, joined by slug. Nothing at
 * runtime notices when a half is missing — a dish whose slug has no locale entry
 * renders with a blank name and empty sections, silently. These tests are that
 * notice.
 */

const LOCALES = { en, es, fr, de } as const;

/** Fields the page renders unconditionally; a missing one is a visible blank. */
const REQUIRED_TEXT = ["name", "description", "cookingTime", "priceRange", "culturalStory"] as const;
const REQUIRED_LISTS = ["ingredients", "bestLocations"] as const;

/** Rendered only when present, but must line up across locales when they are. */
const OPTIONAL_LISTS = [
  "signatureTraits", "servingStyles", "cookingMethods", "preparationTips",
  "regionalVariations", "traditionalUses", "celebrationOccasions",
  "healthBenefits", "preparationMethods",
] as const;

const dishesOf = (locale: keyof typeof LOCALES) =>
  (LOCALES[locale] as any).cuisinePassport.dishes as Record<string, any>;

describe("cuisine passport dish data", () => {
  it("has a unique id and slug for every dish", () => {
    expect(new Set(DISH_FACTS.map((d) => d.id)).size).toBe(DISH_FACTS.length);
    expect(new Set(DISH_FACTS.map((d) => d.slug)).size).toBe(DISH_FACTS.length);
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s has an entry for every dish and no orphans",
    (locale) => {
      const dishes = dishesOf(locale);
      const slugs = DISH_FACTS.map((d) => d.slug).sort();
      expect(Object.keys(dishes).sort()).toEqual(slugs);
    },
  );

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s fills every field the page renders",
    (locale) => {
      const dishes = dishesOf(locale);
      for (const { slug } of DISH_FACTS) {
        const dish = dishes[slug];
        for (const field of REQUIRED_TEXT) {
          expect(typeof dish[field], `${slug}.${field}`).toBe("string");
          expect(dish[field].trim(), `${slug}.${field}`).not.toBe("");
        }
        for (const field of REQUIRED_LISTS) {
          expect(Array.isArray(dish[field]), `${slug}.${field}`).toBe(true);
          expect(dish[field].length, `${slug}.${field}`).toBeGreaterThan(0);
        }
      }
    },
  );

  // A translated list that lost or gained an item is the failure mode that
  // survives a key-parity check: the key is there, the content silently is not.
  it.each((["es", "fr", "de"] as const))(
    "%s lists match English item for item",
    (locale) => {
      const source = dishesOf("en");
      const target = dishesOf(locale);
      for (const { slug } of DISH_FACTS) {
        for (const field of [...REQUIRED_LISTS, ...OPTIONAL_LISTS]) {
          const from = source[slug][field];
          if (from === undefined) {
            expect(target[slug][field], `${slug}.${field} exists only in ${locale}`).toBeUndefined();
            continue;
          }
          expect(target[slug][field]?.length, `${slug}.${field}`).toBe(from.length);
        }
      }
    },
  );

  /**
   * The page title and meta description both used to promise "25 Dishes"
   * against a card of nine. The number is interpolated from DISH_FACTS.length
   * now, so the only way to get it wrong again is for a locale to write a
   * literal back in — which is what this checks. A digit in these two strings
   * is always a mistake: the count is the only number they carry.
   */
  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s takes the dish count from the data rather than stating one",
    (locale) => {
      const cp = (LOCALES[locale] as any).cuisinePassport;
      for (const key of ["seoTitle", "seoDescription"] as const) {
        expect(cp[key], `${locale}.${key}`).toContain("{{count}}");
        expect(cp[key], `${locale}.${key} hardcodes a number`).not.toMatch(/\d/);
      }
    },
  );

  it("uses region, category and difficulty values the filters offer", () => {
    const regions = Object.keys((en as any).cuisinePassport.filters.regions).filter((k) => k !== "all");
    const categories = ["Appetizer", "Main", "Dessert", "Street Food", "Beverage"];
    const difficulties = ["Easy", "Medium", "Hard"];
    const allergens = Object.keys((en as any).cuisinePassport.allergens);
    for (const dish of DISH_FACTS) {
      expect(regions, dish.slug).toContain(dish.region);
      expect(categories, dish.slug).toContain(dish.category);
      expect(difficulties, dish.slug).toContain(dish.difficulty);
      for (const allergen of dish.allergens) expect(allergens, dish.slug).toContain(allergen);
    }
  });
});
