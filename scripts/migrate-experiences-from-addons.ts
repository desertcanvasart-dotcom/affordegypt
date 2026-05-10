// Migrate misclassified rows out of `add_ons` into the new `experiences`
// table (created by docs/migrations/PR-Path-B-3.sql). Run AFTER the DDL.
//
// Behavior, per PR-Path-B-3:
//   - id=1 Felucca Ride          (cairo)  → MIGRATE to experiences
//   - id=2 Horse Carriage        (luxor)  → MIGRATE to experiences
//   - id=3 Traditional Lunch     (no city) → STAYS in add_ons untouched
//   - id=4 Skip-the-Line Pyramids (cairo) → DELETE (already packaged
//     into entrance_fees pricing; this row is misrepresented data)
//
// Halt-on-bad-data: if any of the four target rows isn't shaped as
// expected (wrong category, missing city for the migrate rows, etc.),
// abort before any write.
//
// Idempotent: experiences upsert by slug; add_ons deletes are no-ops
// after the first successful run. Wrapped in a single transaction so
// the migration is atomic.
//
// Usage (from the main checkout, NOT the worktree, so .env.production
// resolves):
//   npx dotenv-cli -e .env.production -- npx tsx scripts/migrate-experiences-from-addons.ts

import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import { addOns, cities, experiences } from "../shared/schema.ts";

type Plan =
  | { action: "migrate"; addOnId: number; slugHint: string }
  | { action: "delete"; addOnId: number; reason: string }
  | { action: "skip"; addOnId: number; reason: string };

// Source-of-truth plan from PR-Path-B-3. Keyed by the add_ons.id we
// expect to find. The script verifies the row's category/name match
// the assumption before acting.
const PLAN: Record<number, {
  expectName: RegExp;
  expectCategory: string;
  action: "migrate" | "delete" | "skip";
  reason?: string;
}> = {
  1: { expectName: /felucca/i,            expectCategory: "experience", action: "migrate" },
  2: { expectName: /horse\s*carriage/i,   expectCategory: "experience", action: "migrate" },
  3: { expectName: /traditional\s*lunch/i, expectCategory: "meal",       action: "skip", reason: "standalone meal stays in add_ons" },
  4: { expectName: /skip[-\s]*the[-\s]*line/i, expectCategory: "ticket", action: "delete", reason: "skip-the-line is already packaged into entrance_fees pricing" },
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['"`’]/g, "")
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set — run with dotenv-cli pointing at .env.production");
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  let migrated = 0;
  let deleted = 0;
  let skipped = 0;

  try {
    // Pre-load city id → slug map so we can resolve add_ons.cityId without
    // hard-coding 1→cairo, 3→luxor in the script body.
    const cityRows = await db.select({ id: cities.id, slug: cities.slug }).from(cities);
    const cityIdToSlug = new Map(cityRows.map((c) => [c.id, c.slug]));

    const allAddOns = await db.select().from(addOns);
    const addOnsById = new Map(allAddOns.map((r) => [r.id, r]));

    // Validate every planned row exists and matches expectation. Halt
    // before any write if anything looks off.
    const plans: Plan[] = [];
    for (const [idStr, expect] of Object.entries(PLAN)) {
      const id = Number(idStr);
      const row = addOnsById.get(id);
      if (!row) {
        // Already deleted (idempotent re-run) — record as skip.
        plans.push({ action: "skip", addOnId: id, reason: "row not present (already migrated/deleted)" });
        continue;
      }
      if (!expect.expectName.test(row.name)) {
        throw new Error(
          `add_ons.id=${id}: name "${row.name}" does not match expected ${expect.expectName}. Halting.`,
        );
      }
      if (row.category !== expect.expectCategory) {
        throw new Error(
          `add_ons.id=${id}: category "${row.category}" does not match expected "${expect.expectCategory}". Halting.`,
        );
      }

      if (expect.action === "migrate") {
        if (row.cityId == null) {
          throw new Error(`add_ons.id=${id}: cityId is NULL but row is planned for migrate. Halting.`);
        }
        const citySlug = cityIdToSlug.get(row.cityId);
        if (!citySlug) {
          throw new Error(`add_ons.id=${id}: cityId=${row.cityId} not found in cities table. Halting.`);
        }
        plans.push({ action: "migrate", addOnId: id, slugHint: `${citySlug}-${slugify(row.name)}` });
      } else if (expect.action === "delete") {
        plans.push({ action: "delete", addOnId: id, reason: expect.reason ?? "" });
      } else {
        plans.push({ action: "skip", addOnId: id, reason: expect.reason ?? "" });
      }
    }

    // Slug collision check before write.
    const slugCounts = new Map<string, number>();
    for (const p of plans) {
      if (p.action === "migrate") {
        slugCounts.set(p.slugHint, (slugCounts.get(p.slugHint) ?? 0) + 1);
      }
    }
    for (const [slug, n] of slugCounts) {
      if (n > 1) throw new Error(`Slug collision on "${slug}" — halting before write.`);
    }

    console.log("Plan:");
    for (const p of plans) console.log(`  add_ons.id=${p.addOnId}  ${p.action}${"reason" in p && p.reason ? `  (${p.reason})` : ""}${p.action === "migrate" ? `  → experiences/${p.slugHint}` : ""}`);

    // Atomic apply.
    await db.transaction(async (tx) => {
      for (const p of plans) {
        if (p.action === "migrate") {
          const row = addOnsById.get(p.addOnId)!;
          const citySlug = cityIdToSlug.get(row.cityId!)!;

          // English name source: prefer name_translations.en if present,
          // else the legacy `name` column.
          const enFromJson =
            row.nameTranslations &&
            typeof row.nameTranslations === "object" &&
            typeof (row.nameTranslations as Record<string, unknown>).en === "string"
              ? ((row.nameTranslations as Record<string, string>).en).trim()
              : "";
          const enName = enFromJson || row.name;

          const values = {
            slug: p.slugHint,
            nameTranslations: { en: enName },
            descriptionTranslations:
              row.descriptionTranslations && typeof row.descriptionTranslations === "object"
                ? (row.descriptionTranslations as Record<string, unknown>)
                : row.description
                  ? { en: row.description }
                  : null,
            city: citySlug,
            price: String(row.price),
            unitType: row.unitType,
            imageUrl: row.image ?? null,
            isActive: row.isActive ?? true,
            sortOrder: 0,
          };

          await tx
            .insert(experiences)
            .values(values)
            .onConflictDoUpdate({
              target: experiences.slug,
              set: {
                nameTranslations: values.nameTranslations,
                descriptionTranslations: values.descriptionTranslations,
                city: values.city,
                price: values.price,
                unitType: values.unitType,
                imageUrl: values.imageUrl,
                updatedAt: sql`now()`,
              },
            });

          await tx.delete(addOns).where(eq(addOns.id, p.addOnId));
          migrated += 1;
          console.log(`  ✓ migrated add_ons.id=${p.addOnId} → experiences/${p.slugHint} and deleted from add_ons`);
        } else if (p.action === "delete") {
          const result = await tx.delete(addOns).where(eq(addOns.id, p.addOnId));
          deleted += 1;
          console.log(`  ✓ deleted add_ons.id=${p.addOnId}  (${p.reason})  rowCount=${(result as any).rowCount ?? "?"}`);
        } else {
          skipped += 1;
          console.log(`  · skipped add_ons.id=${p.addOnId}  (${p.reason})`);
        }
      }
    });

    const remaining = await db.select({ id: addOns.id, name: addOns.name, category: addOns.category }).from(addOns);

    console.log("\n=== Summary ===");
    console.log(`Migrated:  ${migrated}`);
    console.log(`Deleted:   ${deleted}`);
    console.log(`Skipped:   ${skipped}`);
    console.log(`Remaining in add_ons (${remaining.length}):`);
    for (const r of remaining) console.log(`  id=${r.id}  ${r.category.padEnd(12)}  ${r.name}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("\nMIGRATION HALTED:", err.message);
  process.exit(1);
});
