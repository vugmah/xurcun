/**
 * ═══════════════════════════════════════════════════════════════
 * ONE-TIME PHOTO MIGRATION SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * Migrates legacy menu_items.imageUrl values to the photo_assignments table.
 *
 * Usage:
 *   npx tsx api/scripts/migratePhotos.ts        # full migration
 *   npx tsx api/scripts/migratePhotos.ts dry    # dry-run (no writes)
 *
 * Safety features:
 *   - Skips items that already have a matching photo_assignments entry
 *   - Skips items with missing / orphaned categoryId references
 *   - Does NOT delete or modify menu_items.imageUrl (legacy data preserved)
 *   - Reports per-item actions and summary counts
 *   - Logs in a machine-parseable format for audit trails
 */

import { getDb } from "../queries/connection";
import { menuItems, menuCategories, photoAssignments } from "../../db/schema";
import { and, eq, isNotNull, not } from "drizzle-orm";

const DRY_RUN = process.argv.includes("dry");

async function log(label: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  if (data !== undefined) {
    console.log(`[${timestamp}] ${label}`, data);
  } else {
    console.log(`[${timestamp}] ${label}`);
  }
}

async function migrate() {
  const db = getDb();

  await log(`=== PHOTO MIGRATION STARTED ${DRY_RUN ? "(DRY RUN)" : ""} ===`);

  /* ── 1. Audit: Count items with legacy imageUrl ───────────────────── */
  const itemsWithImages = await db
    .select({
      itemId: menuItems.id,
      itemNameAz: menuItems.nameAz,
      itemNameRu: menuItems.nameRu,
      itemNameEn: menuItems.nameEn,
      categoryId: menuItems.categoryId,
      imageUrl: menuItems.imageUrl,
    })
    .from(menuItems)
    .where(
      and(
        isNotNull(menuItems.imageUrl),
        not(eq(menuItems.imageUrl, "")),
        not(eq(menuItems.imageUrl, "null")),
      ),
    );

  await log(`AUDIT: Items with non-null imageUrl`, {
    count: itemsWithImages.length,
  });

  if (itemsWithImages.length === 0) {
    await log("No legacy images to migrate. Exiting.");
    return;
  }

  /* ── 2. Audit: Count existing photo_assignments ───────────────────── */
  const existingAssignments = await db.select().from(photoAssignments);
  await log("AUDIT: Existing photo_assignments", {
    count: existingAssignments.length,
  });

  /* ── 3. Build category lookup map (avoid N+1) ─────────────────────── */
  const allCategories = await db.select().from(menuCategories);
  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));
  await log(`CACHE: Loaded ${allCategories.length} categories into lookup map`);

  /* ── 4. Process each item ─────────────────────────────────────────── */
  let migrated = 0;
  let skippedExisting = 0;
  let skippedNoCategory = 0;
  let skippedNoUrl = 0;
  const errors: Array<{ itemId: number; name: string; error: string }> = [];

  for (const item of itemsWithImages) {
    // Defensive: ensure URL is actually usable
    const trimmedUrl = item.imageUrl?.trim();
    if (!trimmedUrl || trimmedUrl === "" || trimmedUrl === "null") {
      skippedNoUrl++;
      continue;
    }

    // Resolve category
    const category = categoryMap.get(item.categoryId);
    if (!category) {
      await log(
        `SKIP (orphan categoryId=${item.categoryId}): ${item.itemNameAz}`,
      );
      skippedNoCategory++;
      continue;
    }

    // Check for existing assignment
    const existing = await db
      .select()
      .from(photoAssignments)
      .where(
        and(
          eq(photoAssignments.tab, category.menuType),
          eq(photoAssignments.catTitleAz, category.titleAz),
          eq(photoAssignments.itemNameAz, item.itemNameAz),
          eq(photoAssignments.branchSlug, "white-city"),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await log(
        `SKIP (already assigned): ${category.menuType} / ${category.titleAz} / ${item.itemNameAz}`,
      );
      skippedExisting++;
      continue;
    }

    // Derive imageId from URL (last path segment)
    const urlParts = trimmedUrl.split("/");
    const imageId = urlParts[urlParts.length - 1]?.trim() || trimmedUrl;

    if (!DRY_RUN) {
      try {
        await db.insert(photoAssignments).values({
          tab: category.menuType,
          catTitleAz: category.titleAz,
          itemNameAz: item.itemNameAz,
          imageUrl: trimmedUrl,
          imageId,
          branchSlug: "white-city",
        });
        await log(
          `MIGRATED: ${category.menuType} / ${category.titleAz} / ${item.itemNameAz} → imageId=${imageId}`,
        );
        migrated++;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : String(err);
        await log(
          `ERROR inserting ${item.itemNameAz}: ${errorMsg}`,
        );
        errors.push({
          itemId: item.itemId,
          name: item.itemNameAz,
          error: errorMsg,
        });
      }
    } else {
      // Dry-run: log what *would* happen
      await log(
        `[DRY-RUN] WOULD MIGRATE: ${category.menuType} / ${category.titleAz} / ${item.itemNameAz} → imageId=${imageId}`,
      );
      migrated++;
    }
  }

  /* ── 5. Final Summary ─────────────────────────────────────────────── */
  await log("=== MIGRATION SUMMARY ===");
  await log(`  Total legacy items scanned    : ${itemsWithImages.length}`);
  await log(`  Already assigned (skipped)    : ${skippedExisting}`);
  await log(`  Missing category (skipped)    : ${skippedNoCategory}`);
  await log(`  Empty/invalid URL (skipped)   : ${skippedNoUrl}`);
  await log(`  Errors                        : ${errors.length}`);
  if (!DRY_RUN) {
    await log(`  NEWLY MIGRATED                : ${migrated}`);
  } else {
    await log(`  WOULD MIGRATE (dry-run)       : ${migrated}`);
  }
  await log(`  Pre-existing assignments      : ${existingAssignments.length}`);

  if (errors.length > 0) {
    await log("ERRORS DETAILED:", errors);
  }

  await log(`=== MIGRATION COMPLETE ${DRY_RUN ? "(DRY RUN)" : ""} ===`);
}

migrate().catch(async (err) => {
  await log("FATAL ERROR:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
