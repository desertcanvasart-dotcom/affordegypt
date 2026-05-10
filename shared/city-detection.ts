// Source of truth for multi-word Egyptian city detection. Used by:
//   - scripts/import-catalog-from-xlsx.ts  (per-row city derivation)
//   - server/public-catalog-routes.ts      (GET /api/services/cities)
//
// The detection rule: route names start with the origin city. Where
// the origin is multi-word ("Marsa Alam", "Sharm El Sheikh"), splitting
// on first whitespace gives a wrong/partial city. The list below is
// matched prefix-first, longest match wins, before falling back to the
// first-token rule.
//
// Add new entries when production catalog rows surface a multi-word
// origin not covered here. Keep entries Title-cased exactly as they
// should display to customers — the deriveCity output flows directly
// into the UI without further casing.

export const MULTI_WORD_CITIES = [
  "Marsa Alam",
  "Sharm El Sheikh",
  "El Gouna",
  "Sahl Hasheesh",
  "Marsa Matruh",
  "El Quseir",
  "Abu Simbel",
  "South Sinai",
] as const;

export function deriveCity(routeName: string): string {
  const lower = routeName.toLowerCase();
  for (const city of MULTI_WORD_CITIES) {
    if (lower.startsWith(city.toLowerCase())) return city;
  }
  return routeName.split(/\s/)[0] ?? "";
}
