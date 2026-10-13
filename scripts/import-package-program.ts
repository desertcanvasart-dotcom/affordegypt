import { applyPackageMealPolicy } from "../shared/package-meals";
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "../server/db";
import { travelPackages } from "../shared/schema";
import { packageContentSchema } from "../shared/travel-packages";

// Import operator-supplied content as a draft. Existing real programs are never overwritten.
const manifestSchema = z
  .object({
    slot: z.number().int().min(1).max(3),
    content: packageContentSchema,
  })
  .strict();
const filename = process.argv[2];
if (!filename)
  throw new Error(
    "Usage: tsx scripts/import-package-program.ts content/packages/<program>.json",
  );
try {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(resolve(filename), "utf8")),
  );
  manifest.content = applyPackageMealPolicy(manifest.content);
  if (manifest.content.status !== "draft")
    throw new Error(
      "Program imports must be drafts; publish through the admin editor after reviewing prices and terms",
    );
  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(784331, ${manifest.slot})`,
    );
    const [existing] = await tx
      .select()
      .from(travelPackages)
      .where(eq(travelPackages.slot, manifest.slot))
      .for("update");
    if (existing?.slug === manifest.content.slug)
      return "Already imported; manage further edits in the admin editor";
    const value = {
      ...manifest.content,
      slot: manifest.slot,
      singleSupplement:
        manifest.content.singleSupplement === null
          ? null
          : manifest.content.singleSupplement.toFixed(2),
      updatedAt: new Date(),
    };
    if (existing) {
      const hostname = new URL(process.env.DATABASE_URL!).hostname;
      if (
        !["127.0.0.1", "localhost"].includes(hostname) ||
        existing.slug !== `qa-package-${manifest.slot}`
      )
        throw new Error(
          "This slot contains another program; review it in the admin editor rather than replacing it",
        );
      // QA placeholders exist only in the disposable local preview, never production.
      await tx
        .update(travelPackages)
        .set({ ...value, version: existing.version + 1 })
        .where(eq(travelPackages.slot, manifest.slot));
      return "Replaced the local QA placeholder with the program draft";
    }
    await tx.insert(travelPackages).values(value);
    return "Imported the program draft";
  });
  console.log(`${result}: slot ${manifest.slot}, ${manifest.content.title}`);
} finally {
  await pool.end();
}
