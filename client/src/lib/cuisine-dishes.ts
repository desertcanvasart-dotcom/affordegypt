/**
 * The non-translatable half of the cuisine passport.
 *
 * Everything a reader sees as words — names, descriptions, ingredients, tips —
 * lives in the locale files under `cuisinePassport.dishes.<slug>`. What stays
 * here is what does not change with the language: the identity of the dish, its
 * picture, its numbers, and the enum values the page filters and colours on.
 *
 * `region`, `category` and `difficulty` are keys, not labels. They are compared
 * against the filter dropdowns and looked up for display via
 * `cuisinePassport.filters.*`, so translating them here would break filtering.
 *
 * Arabic names are the subject matter rather than copy, so they are defined once
 * and shared by every locale.
 */

export type DishCategory = "Appetizer" | "Main" | "Dessert" | "Street Food" | "Beverage";
export type DishDifficulty = "Easy" | "Medium" | "Hard";

export interface DishFacts {
  id: number;
  /** Key into `cuisinePassport.dishes` in the locale files. */
  slug: string;
  arabicName: string;
  /** Key into `cuisinePassport.filters.regions`. */
  region: string;
  category: DishCategory;
  difficulty: DishDifficulty;
  /** 0–5, drawn as flames. */
  spiceLevel: number;
  popularity: number;
  nutritionScore: number;
  image: string;
  /** Keys into `cuisinePassport.allergens`. */
  allergens: string[];
}

export const DISH_FACTS: DishFacts[] = [
  { id: 1, slug: "koshari", arabicName: "كشري", region: "cairo", category: "Main", difficulty: "Medium", spiceLevel: 2, popularity: 95, nutritionScore: 85, image: "/images/koshary.jpg", allergens: ["gluten"] },
  { id: 2, slug: "fulMedames", arabicName: "فول مدمس", region: "upperEgypt", category: "Main", difficulty: "Easy", spiceLevel: 1, popularity: 90, nutritionScore: 92, image: "/images/fool-medames.jpg", allergens: [] },
  { id: 3, slug: "molokhia", arabicName: "ملوخية", region: "nileDelta", category: "Main", difficulty: "Medium", spiceLevel: 2, popularity: 80, nutritionScore: 88, image: "/images/molo5eya.jpg", allergens: [] },
  { id: 4, slug: "mahshi", arabicName: "محشي", region: "alexandria", category: "Main", difficulty: "Hard", spiceLevel: 2, popularity: 75, nutritionScore: 90, image: "/images/mashi.jpg", allergens: [] },
  { id: 5, slug: "baladiBread", arabicName: "عيش بلدي", region: "allEgypt", category: "Appetizer", difficulty: "Medium", spiceLevel: 0, popularity: 100, nutritionScore: 70, image: "/images/3esh.jpg", allergens: ["gluten"] },
  { id: 6, slug: "ummAli", arabicName: "أم علي", region: "cairo", category: "Dessert", difficulty: "Easy", spiceLevel: 0, popularity: 85, nutritionScore: 60, image: "/images/om-3aly.jpg", allergens: ["gluten", "nuts", "dairy"] },
  // Listed in the order they appear on the page, which is not id order.
  { id: 9, slug: "riceMuammar", arabicName: "رز معمر", region: "upperEgypt", category: "Main", difficulty: "Medium", spiceLevel: 0, popularity: 78, nutritionScore: 75, image: "/images/rice-muammar-.jpg", allergens: ["dairy"] },
  { id: 7, slug: "hawawshi", arabicName: "حواوشي", region: "cairo", category: "Street Food", difficulty: "Medium", spiceLevel: 3, popularity: 85, nutritionScore: 75, image: "/images/7awawshy.jpg", allergens: ["gluten"] },
  { id: 8, slug: "karkade", arabicName: "كركديه", region: "aswan", category: "Beverage", difficulty: "Easy", spiceLevel: 0, popularity: 70, nutritionScore: 95, image: "/images/karkade.jpg", allergens: [] },
];
