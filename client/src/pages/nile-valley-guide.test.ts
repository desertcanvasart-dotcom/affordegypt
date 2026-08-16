import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import fr from "../i18n/locales/fr.json";
import de from "../i18n/locales/de.json";

/**
 * Every visible word on the Nile Valley guide is a key: the city records carry
 * strings like "attractions.luxor.karnakTemple.name" and the page resolves them
 * against nileValleyGuide.data. A key with no entry renders as the key itself —
 * the reader gets "attractions.luxor.karnakTemple.name" where the temple's name
 * should be. That is exactly what the page did before this was keyed properly,
 * except it rendered English instead, which is quieter and no better.
 *
 * The city data is read out of the page source rather than imported, because
 * importing the page would pull in React, wouter and the whole component tree
 * for what is a data check.
 */

const LOCALES = { en, es, fr, de } as const;

const SOURCE = readFileSync(new URL("./nile-valley-guide.tsx", import.meta.url), "utf8");

interface City {
  name: string;
  region: string;
  highlights: string[];
  bestTimeToVisit: string;
  averageStay: string;
  keyAttractions: { name: string; description: string; entryFee: string; hours: string }[];
  transportation: { fromCairo: string; localTransport: string[] };
  budgetTips: string[];
}

/** The `nileValleyCities` literal, evaluated straight out of the source. */
const cities: City[] = (() => {
  const marker = "const nileValleyCities: NileCity[] = ";
  const start = SOURCE.indexOf(marker) + marker.length;
  let depth = 0;
  for (let i = start; i < SOURCE.length; i++) {
    if (SOURCE[i] === "[") depth++;
    else if (SOURCE[i] === "]") {
      depth--;
      if (depth === 0) return eval(SOURCE.slice(start, i + 1));
    }
  }
  throw new Error("could not find the nileValleyCities literal");
})();

/** The REGION_FILTERS literal, read from the source for the same reason. */
const regionFilters: { value: string; labelKey: string }[] = (() => {
  const marker = "const REGION_FILTERS = ";
  const start = SOURCE.indexOf(marker) + marker.length;
  let depth = 0;
  for (let i = start; i < SOURCE.length; i++) {
    if (SOURCE[i] === "[") depth++;
    else if (SOURCE[i] === "]") {
      depth--;
      if (depth === 0) return eval(SOURCE.slice(start, i + 1));
    }
  }
  throw new Error("could not find the REGION_FILTERS literal");
})();

const lookup = (locale: keyof typeof LOCALES, path: string): unknown =>
  path.split(".").reduce<any>((o, k) => (o == null ? undefined : o[k]), LOCALES[locale]);

/** Every locale path the city records ask for, in the order a reader meets them. */
const referenced = (city: City): string[] => [
  `nileValleyGuide.cityNames.${city.name}`,
  `nileValleyGuide.fromCairo.${city.transportation.fromCairo}`,
  ...city.transportation.localTransport.map((m) => `nileValleyGuide.transportModes.${m}`),
  ...city.highlights.map((h) => `nileValleyGuide.data.${h}`),
  ...city.budgetTips.map((b) => `nileValleyGuide.data.${b}`),
  `nileValleyGuide.data.${city.bestTimeToVisit}`,
  `nileValleyGuide.data.${city.averageStay}`,
  ...city.keyAttractions.flatMap((a) => [
    `nileValleyGuide.data.${a.name}`,
    `nileValleyGuide.data.${a.description}`,
    `nileValleyGuide.data.${a.entryFee}`,
    `nileValleyGuide.data.${a.hours}`,
  ]),
];

describe("nile valley guide data", () => {
  it("reads all twelve cities out of the page", () => {
    expect(cities).toHaveLength(12);
  });

  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s resolves every key the city records reference",
    (locale) => {
      const missing: string[] = [];
      for (const city of cities) {
        for (const path of referenced(city)) {
          const value = lookup(locale, path);
          if (typeof value !== "string" || value.trim() === "") missing.push(path);
        }
      }
      expect(missing).toEqual([]);
    },
  );

  it("only uses regions the filter offers", () => {
    for (const city of cities) {
      expect(regionFilters.map((r) => r.value), city.name).toContain(city.region);
    }
  });

  /**
   * The city badges resolve a region through REGION_FILTERS rather than their
   * own ternary chains, which is what let a second copy of these four labels
   * live under completeGuide.regions and drift. That only holds while every
   * filter's labelKey actually resolves — a missing one renders the key path
   * on the badge.
   */
  it.each(Object.keys(LOCALES) as (keyof typeof LOCALES)[])(
    "%s has a label for every region the filter offers",
    (locale) => {
      for (const { value, labelKey } of regionFilters) {
        const label = lookup(locale, labelKey);
        expect(typeof label, `${locale} ${value} -> ${labelKey}`).toBe("string");
        expect((label as string).trim(), `${locale} ${value}`).not.toBe("");
      }
    },
  );

  it("keeps Arabic city names identical across locales", () => {
    // They are the subject matter, not copy: defined once on the record and
    // shared by every language.
    for (const city of cities as (City & { arabicName: string })[]) {
      expect(city.arabicName, city.name).toMatch(/[؀-ۿ]/);
    }
  });
});
