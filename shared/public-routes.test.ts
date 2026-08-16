import { describe, expect, it } from "vitest";
import { SLUG_MAPPINGS, languageOfSlug, type SupportedLanguage } from "./public-routes";

const LANGS = Object.keys(SLUG_MAPPINGS) as SupportedLanguage[];

/**
 * languageOfSlug decides two things that must never disagree:
 *
 *   - which language i18n switches to when someone opens a translated URL
 *   - which hreflang alternates the sitemap advertises
 *
 * If the sitemap promised Google a French page at a URL the app answers in
 * English, the mismatch invalidates the alternate cluster — so the promise and
 * the behaviour are asserted against each other here rather than trusted.
 */
describe("translated slugs", () => {
  it("gives every language the same set of pages", () => {
    const en = Object.keys(SLUG_MAPPINGS.en).sort();
    for (const lang of LANGS) {
      expect(Object.keys(SLUG_MAPPINGS[lang]).sort(), lang).toEqual(en);
    }
  });

  it("resolves a slug to the language that owns it", () => {
    for (const lang of LANGS) {
      for (const [enSlug, slug] of Object.entries(SLUG_MAPPINGS[lang])) {
        const owners = LANGS.filter((l) =>
          Object.values(SLUG_MAPPINGS[l]).includes(slug),
        );
        const resolved = languageOfSlug(slug);
        if (owners.length === 1) {
          expect(resolved, `${slug} (${enSlug})`).toBe(owners[0]);
        } else {
          // Shared with another language — naming a page but not a language.
          expect(resolved, `${slug} is claimed by ${owners.join("/")}`).toBeNull();
        }
      }
    }
  });

  it("never resolves an unknown slug", () => {
    expect(languageOfSlug("not-a-real-page")).toBeNull();
    expect(languageOfSlug("")).toBeNull();
  });

  /**
   * The four known collisions, pinned deliberately. A new one is not a bug —
   * languages legitimately share words — but it silently removes that page's
   * alternate for that language, so it should be a decision rather than a
   * surprise. Update this list when one is added or resolved.
   */
  it("has exactly the collisions we know about", () => {
    const collisions: string[] = [];
    const seen = new Map<string, SupportedLanguage[]>();
    for (const lang of LANGS) {
      for (const slug of Object.values(SLUG_MAPPINGS[lang])) {
        seen.set(slug, [...(seen.get(slug) ?? []), lang]);
      }
    }
    for (const [slug, langs] of seen) {
      if (langs.length > 1) collisions.push(`${slug}:${langs.join("/")}`);
    }
    expect(collisions.sort()).toEqual([
      "attractions:en/fr",
      "contact:en/fr",
      "destinations:en/fr",
      "transfers:en/de",
    ]);
  });
});
