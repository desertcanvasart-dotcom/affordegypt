import { LEGAL_DATES } from "@shared/operator-facts";

/**
 * The legal pages' effective and last-updated dates, formatted in the reader's
 * language.
 *
 * Both dates were previously typed as English strings ("March 2, 2020") into
 * each of the four legal pages, so they stayed English on the Spanish, French
 * and German versions of documents that were otherwise translated.
 *
 * Parsed as UTC and formatted as UTC deliberately: `new Date("2020-03-02")` is
 * midnight UTC, and formatting that in a timezone behind UTC renders the day
 * before. An effective date that reads March 1 in one timezone and March 2 in
 * another is the kind of detail a legal page cannot get wrong.
 */
export function formatLegalDate(iso: string, language: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(language, {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const effectiveDate = (language: string) =>
  formatLegalDate(LEGAL_DATES.effective, language);

export const lastUpdatedDate = (language: string) =>
  formatLegalDate(LEGAL_DATES.lastUpdated, language);
