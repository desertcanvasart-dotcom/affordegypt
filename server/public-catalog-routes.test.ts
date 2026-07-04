// Pins the display-name precedence for the public catalog API. The
// regression this guards: name_translations.en (stamped on every row by
// the import scripts) used to shadow the `name` column, making admin
// renames invisible on the customer site.
import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ db: {}, pool: {} }));

import { pickName } from "./public-catalog-routes";

describe("pickName", () => {
  it("prefers the name column — what the admin dashboard edits — over name_translations.en", () => {
    expect(
      pickName({
        name: "Airport → Dam / Philae / Obelisk → Airport", // fresh admin rename
        slug: "aswan-airport-dam-philae-obelisk-hotel-b",
        nameTranslations: { en: "Airport → Dam / Philae / Obelisk → Hotel (B)" }, // stale import copy
      }),
    ).toBe("Airport → Dam / Philae / Obelisk → Airport");
  });

  it("falls back to name_translations.en for rows without a name column (entrance fees, experiences)", () => {
    expect(
      pickName({
        name: null,
        slug: "aswan-abu-simbel-temple",
        nameTranslations: { en: "Abu Simbel Temple" },
      }),
    ).toBe("Abu Simbel Temple");
  });

  it("humanises the slug when both are missing or blank", () => {
    expect(
      pickName({ name: "  ", slug: "luxor-karnak-temple", nameTranslations: null }),
    ).toBe("Luxor Karnak Temple");
    expect(
      pickName({ name: null, slug: "luxor-karnak-temple", nameTranslations: { en: "" } }),
    ).toBe("Luxor Karnak Temple");
  });
});
