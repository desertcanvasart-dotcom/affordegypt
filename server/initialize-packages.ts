import { readFile } from "node:fs/promises";
import { sql } from "drizzle-orm";
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
  });
}
