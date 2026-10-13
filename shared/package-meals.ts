// Operator policy for ready-made programs, independent of the custom planner.
export const PACKAGE_MEAL_INCLUSION =
  "All meals from dinner on arrival day through breakfast on departure day, including breakfast, lunch and dinner on each full day in between.";
const OVERVIEW_MEALS =
  "All meals are included, from dinner on arrival day through breakfast on departure day. Breakfast, lunch and dinner are included on every full day in between.";

export function packageDayMeals(day: number, days: number): string {
  if (days === 1) return "Dinner on arrival and breakfast on departure";
  if (day === 1) return "Dinner";
  if (day === days) return "Breakfast";
  return "Breakfast, lunch and dinner";
}

export function applyPackageMealPolicy<
  T extends {
    durationDays: number;
    description: string;
    inclusions: string[];
    itinerary: Array<{ title: string; description: string }>;
  },
>(program: T): T {
  return {
    ...program,
    description: !program.description.trim()
      ? program.description
      : program.description.includes(OVERVIEW_MEALS)
        ? program.description
        : `${program.description.trim()}\n\n${OVERVIEW_MEALS}`.trim(),
    inclusions: [
      ...program.inclusions.filter(
        (line) =>
          !/^(?:meals?:|(?:all\s+)?(?:breakfast|lunch|dinner|meals)\b)/i.test(
            line.trim(),
          ),
      ),
      PACKAGE_MEAL_INCLUSION,
    ],
    itinerary: program.itinerary.map((day, index) => {
      if (!day.description.trim()) return day;
      const mealLine = `Meals: ${packageDayMeals(index + 1, program.durationDays)}`;
      let description = day.description;
      if (/^Meals:/m.test(description))
        description = description.replace(/^Meals:[^\n]*/m, (old) => {
          const overnight = old.split("|").slice(1).join("|").trim();
          return overnight ? `${mealLine} | ${overnight}` : mealLine;
        });
      else if (/^Overnight:/m.test(description))
        description = description.replace(
          /^Overnight:/m,
          `${mealLine} | Overnight:`,
        );
      else description = `${description.trim()}\n\n${mealLine}`;
      return { ...day, description };
    }),
  };
}
