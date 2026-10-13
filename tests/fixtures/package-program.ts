import { applyPackageMealPolicy } from "../../shared/package-meals";
import type { PackageContent } from "../../shared/travel-packages";
// Disposable QA content; never seed these programs or prices into production.
export function packageFixture(slot: number): PackageContent {
  return applyPackageMealPolicy({
    slug: `qa-package-${slot}`,
    title: `Preview program ${slot}`,
    summary: "Sample content for checking the package layout and booking flow.",
    description:
      "This is disposable test content. Real programs will be supplied by the operator.",
    imageUrl: "/images/karnak-temple.jpg",
    durationDays: 3,
    nights: 2,
    itinerary: [
      { title: "Arrival", description: "Sample arrival and transfer details." },
      {
        title: "Guided visits",
        description: "Sample tour day, with the final sites to be supplied.",
      },
      { title: "Departure", description: "Sample departure details." },
    ],
    inclusions: ["Sample accommodation", "Sample guided visits"],
    exclusions: ["Sample exclusion"],
    bookingTerms:
      "Test terms only. Arrangements and payment instructions will be confirmed by the operator.",
    perPersonRates: {
      "2": 1000,
      "4": 900,
      "6": 800,
      "8": 700,
      "10": 600,
      "12": 500,
    },
    singleSupplement: 300,
    status: "draft",
  });
}
