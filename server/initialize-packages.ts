import { readFile } from "node:fs/promises";
import { revisedPackageContent } from "@shared/package-revisions";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { travelPackages } from "@shared/schema";
import { packageContentSchema, publicationIssues } from "@shared/travel-packages";
import { applyPackageMealPolicy } from "@shared/package-meals";

// Only the three operator-approved programs are initialized; existing edits are preserved.
export async function initializePackages() {
  const migration = await readFile("migrations/0008_ready_made_packages.sql", "utf8");
  const filenames = ["egypt-discovery-cairo-luxor-6-days", "egypt-discovery-8-days", "egypt-discovery-11-days"];
  const programs = await Promise.all(filenames.map(async name => {
    const manifest = JSON.parse(await readFile(`content/packages/${name}.json`, "utf8"));
    const content = packageContentSchema.parse(applyPackageMealPolicy(manifest.content));
    const issues = publicationIssues(content);
    if (issues.length || ![1, 2, 3].includes(manifest.slot)) throw new Error(`Invalid launch program ${name}: ${issues.join(", ")}`);
    return { ...content, slot: manifest.slot, status: "published", singleSupplement: content.singleSupplement!.toFixed(2) };
  }));
  await db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(784331, 0)`);
    await tx.execute(sql.raw(migration.replace(/^BEGIN;\s*/i, "").replace(/COMMIT;\s*$/i, "")));
    for (const program of programs) await tx.insert(travelPackages).values(program).onConflictDoNothing();
    // Apply the operator-requested revision once; preserve configured rates and all other edits.
    const rows = await tx.select().from(travelPackages).for("update");
    for (const row of rows) {
      const revised = revisedPackageContent(row);
      if (JSON.stringify([row.perPersonRates, row.inclusions, row.itinerary]) === JSON.stringify([revised.perPersonRates, revised.inclusions, revised.itinerary])) continue;
      await tx.update(travelPackages).set({perPersonRates: revised.perPersonRates, inclusions: revised.inclusions, itinerary: revised.itinerary, version: row.version + 1, updatedAt: new Date()}).where(eq(travelPackages.id, row.id));
    }
  });
}
