import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import fr from "../i18n/locales/fr.json";
import de from "../i18n/locales/de.json";

/**
 * The FAQ answers are plain strings, and `renderAnswer` turns a phrase into a
 * link by splitting the answer on that exact phrase. If a translator rewords
 * the phrase inside the answer but not in `linkTexts` (or the reverse), the
 * split finds nothing, the anchor is never emitted, and the page renders a
 * paragraph with a missing link — no error, no warning, nothing in the
 * console. Key parity cannot see it either: both keys are present and both
 * are translated.
 *
 * So it is asserted here instead, for every locale.
 *
 * The ids and the link URLs are read out of the component source rather than
 * imported, because importing the component would pull in React and the whole
 * UI tree for what is a data check — same approach as nile-valley-guide.test.
 */

const LOCALES = { en, es, fr, de } as const;

const SOURCE = readFileSync(new URL("./faq-section.tsx", import.meta.url), "utf8");

/** The `FAQ_IDS` tuple, in page order. */
const FAQ_IDS: string[] = (() => {
  const m = SOURCE.match(/const FAQ_IDS = \[([\s\S]*?)\] as const;/);
  if (!m) throw new Error("FAQ_IDS not found in faq-section.tsx — has its shape changed?");
  return [...m[1].matchAll(/"([a-zA-Z]+)"/g)].map((x) => x[1]);
})();

/** How many hrefs each id declares in `FAQ_LINK_HREFS`. */
const HREF_COUNTS: Record<string, number> = (() => {
  const m = SOURCE.match(/const FAQ_LINK_HREFS[^=]*= \{([\s\S]*?)\n\};/);
  if (!m) throw new Error("FAQ_LINK_HREFS not found in faq-section.tsx — has its shape changed?");
  const out: Record<string, number> = {};
  for (const entry of m[1].matchAll(/(\w+):\s*\[([\s\S]*?)\]/g)) {
    out[entry[1]] = [...entry[2].matchAll(/"https?:[^"]+"/g)].length;
  }
  return out;
})();

describe("homepage FAQ locale data", () => {
  it("finds the ids and link targets in the component", () => {
    expect(FAQ_IDS.length).toBeGreaterThan(0);
    expect(Object.keys(HREF_COUNTS).length).toBeGreaterThan(0);
    for (const id of Object.keys(HREF_COUNTS)) expect(FAQ_IDS).toContain(id);
  });

  for (const [name, locale] of Object.entries(LOCALES)) {
    const faq = (locale as any).faq;

    describe(name, () => {
      it("has a question and an answer for every id, and no extras", () => {
        expect(Object.keys(faq.items).sort()).toEqual([...FAQ_IDS].sort());
        for (const id of FAQ_IDS) {
          expect(faq.items[id].question, `${name}: ${id}.question`).toBeTruthy();
          expect(faq.items[id].answer, `${name}: ${id}.answer`).toBeTruthy();
        }
      });

      it("has the section chrome", () => {
        for (const k of ["title", "subtitle", "stillQuestions", "whatsapp", "email"]) {
          expect(faq[k], `${name}: faq.${k}`).toBeTruthy();
        }
      });

      it("declares one link text per href, and each appears exactly once in its answer", () => {
        for (const id of FAQ_IDS) {
          const texts: string[] | undefined = faq.items[id].linkTexts;
          const expected = HREF_COUNTS[id] ?? 0;
          expect(texts?.length ?? 0, `${name}: ${id} linkTexts vs hrefs`).toBe(expected);

          for (const text of texts ?? []) {
            const occurrences = faq.items[id].answer.split(text).length - 1;
            expect(
              occurrences,
              `${name}: ${id} link phrase ${JSON.stringify(text)} occurs ${occurrences}x in the answer — it must occur exactly once or the link silently disappears`,
            ).toBe(1);
          }
        }
      });

      it("keeps the {{floor}} placeholder wherever English uses one", () => {
        for (const id of FAQ_IDS) {
          const count = (s: string) => (s.match(/\{\{floor\}\}/g) || []).length;
          expect(count(faq.items[id].answer), `${name}: ${id} {{floor}}`).toBe(
            count((en as any).faq.items[id].answer),
          );
        }
      });
    });
  }
});
