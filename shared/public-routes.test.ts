import { describe, expect, it } from "vitest";
import {
  SLUG_MAPPINGS,
  languageOfSlug,
  canonicalForPath,
  type SupportedLanguage,
} from "./public-routes";

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

/**
 * Every hreflang alternate must be self-canonical or Google discards it. The
 * pages hardcode their English canonical, so a translated route has to rewrite
 * it — otherwise /reiseziele tells Google it is a duplicate of /destinations
 * and the German page never gets indexed at all.
 */
describe("canonicalForPath", () => {
  const SITE = "https://affordegypt.com";

  it("follows the path to the same page in another language", () => {
    expect(canonicalForPath(`${SITE}/destinations`, "/reiseziele")).toBe(
      `${SITE}/reiseziele`,
    );
    expect(canonicalForPath(`${SITE}/travel-tips`, "/conseils-voyage")).toBe(
      `${SITE}/conseils-voyage`,
    );
  });

  it("decodes a percent-encoded path", () => {
    expect(canonicalForPath(`${SITE}/reviews`, "/rese%C3%B1as")).toBe(
      `${SITE}/rese%C3%B1as`,
    );
  });

  it("leaves the canonical alone when the path is the same page", () => {
    expect(canonicalForPath(`${SITE}/destinations`, "/destinations")).toBe(
      `${SITE}/destinations`,
    );
  });

  it("refuses to rewrite across different pages", () => {
    // /reisetipps is a real slug, but it is not a translation of destinations.
    expect(canonicalForPath(`${SITE}/destinations`, "/reisetipps")).toBe(
      `${SITE}/destinations`,
    );
    expect(canonicalForPath(`${SITE}/destinations`, "/not-a-page")).toBe(
      `${SITE}/destinations`,
    );
  });

  it("survives a canonical that is not a URL", () => {
    expect(canonicalForPath("not a url", "/reiseziele")).toBe("not a url");
  });

  it("gives every translated route a self-referencing canonical", () => {
    for (const lang of LANGS) {
      for (const [enKey, slug] of Object.entries(SLUG_MAPPINGS[lang])) {
        const english = `${SITE}/${SLUG_MAPPINGS.en[enKey]}`;
        expect(canonicalForPath(english, `/${slug}`), `${lang} ${slug}`).toBe(
          `${SITE}/${encodeURI(slug).replace(/%25/g, "%")}`,
        );
      }
    }
  });
});
