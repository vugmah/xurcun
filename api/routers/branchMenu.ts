import { z } from "zod";
import { createRouter, publicQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import {
  branches,
  menuCategories,
  menuItems,
  menuItemBranches,
  photoAssignments,
} from "@db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { seedMenuData } from "../seed";

/**
 * Helper: Look up the photo assignment for a given menu item.
 * Uses composite key (tab + catTitleAz + itemNameAz + branchSlug).
 * Returns null if no assignment found (QR menu handles null gracefully).
 */
async function getPhotoAssignmentForItem(
  tab: string,
  catTitleAz: string,
  itemNameAz: string,
  branchSlug: string,
  db: any
): Promise<string | null> {
  const exactRows = await db
    .select()
    .from(photoAssignments)
    .where(
      and(
        eq(photoAssignments.tab, tab),
        eq(photoAssignments.catTitleAz, catTitleAz),
        eq(photoAssignments.itemNameAz, itemNameAz),
        eq(photoAssignments.branchSlug, branchSlug)
      )
    )
    .limit(1);
  if (exactRows[0]?.imageUrl) return exactRows[0].imageUrl;

  const normalize = (value: string) =>
    value.toLowerCase()
      .replace(/ə/g, "e")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/[^a-z0-9]/g, "");

  const normalizeCategory = (value: string) => {
    const normalized = normalize(value);
    const shishaDeviceAliases = new Set([
      "qelyancihazlari",
      "nargilecihazlari",
      "hookahdevices",
      "shishadevices",
    ]);
    if (shishaDeviceAliases.has(normalized)) return "shishadevices";
    return normalized;
  };

  const rows = await db
    .select()
    .from(photoAssignments)
    .where(
      and(
        eq(photoAssignments.tab, tab),
        eq(photoAssignments.itemNameAz, itemNameAz),
        eq(photoAssignments.branchSlug, branchSlug)
      )
    );

  const wantedCat = normalizeCategory(catTitleAz);
  const looseMatch = rows.find((row: any) => normalizeCategory(row.catTitleAz) === wantedCat) ?? rows[0];
  return looseMatch?.imageUrl ?? null;
}

/**
 * Branch Menu Router
 *
 * Returns menu items merged with branch-specific overrides:
 * - branchPrice overrides base price
 * - isAvailable=false hides item at this branch
 * - If no menuItemBranches row exists, item is available by default
 */
export const branchMenuRouter = createRouter({
  // Public: Get menu for a specific branch (by slug)
  getMenuByBranch: publicQuery
    .input(
      z.object({
        branchSlug: z.string(),
        tab: z.enum(["food", "beverage", "shisha", "snack"]),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // 1. Find the branch
      const branchRows = await db
        .select()
        .from(branches)
        .where(eq(branches.slug, input.branchSlug))
        .limit(1);

      const branch = branchRows[0];

      // 2. Get active categories for this tab
      const categories = await db
        .select()
        .from(menuCategories)
        .where(
          and(
            eq(menuCategories.menuType, input.tab),
            eq(menuCategories.isActive, true)
          )
        )
        .orderBy(asc(menuCategories.sortOrder));

      // 3. For each category, get items with branch overrides
      const result = [];
      for (const cat of categories) {
        const items = await db
          .select()
          .from(menuItems)
          .where(
            and(
              eq(menuItems.categoryId, cat.id),
              eq(menuItems.isActive, true)
            )
          )
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));

        // Merge with branch-specific data
        const mergedItems = [];
        for (const item of items) {
          // Check for branch override (only if branch exists)
          let override: any = null;
          if (branch) {
            const overrideRows = await db
              .select()
              .from(menuItemBranches)
              .where(
                and(
                  eq(menuItemBranches.menuItemId, item.id),
                  eq(menuItemBranches.branchId, branch.id),
                  eq(menuItemBranches.isActive, true)
                )
              )
              .limit(1);
            override = overrideRows[0] ?? null;
          }

          // If override says not available, skip this item
          if (override && override.isAvailable === false) {
            continue;
          }

          const basePrice = item.price;
          const branchPrice = override?.branchPrice ?? null;
          const finalPrice = branchPrice ?? basePrice;

          // Look up photo from photo_assignments table
          const photoImageUrl = await getPhotoAssignmentForItem(
            input.tab,
            cat.titleAz,
            item.nameAz,
            input.branchSlug,
            db
          );

          mergedItems.push({
            // Core fields
            id: item.id,
            categoryId: item.categoryId,

            // Names
            nameAz: item.nameAz,
            nameRu: item.nameRu,
            nameEn: item.nameEn,

            // Descriptions
            descAz: item.descAz,
            descRu: item.descRu,
            descEn: item.descEn,

            // Pricing
            price: basePrice,
            branchPrice,
            finalPrice,

            // Flags
            isActive: item.isActive,
            isNew: item.isNew,
            isMeat: item.isMeat,
            isFish: item.isFish,
            isVegetarian: item.isVegetarian,
            isHalal: item.isHalal,
            isSpicy: item.isSpicy,
            isGlutenFree: item.isGlutenFree,
            isSugarFree: item.isSugarFree,
            isSnack: item.isSnack,

            // Image (from photo_assignments; null if no assignment)
            imageUrl: photoImageUrl,
            imageAltAz: item.imageAltAz,
            imageAltRu: item.imageAltRu,
            imageAltEn: item.imageAltEn,

            // Branch-specific
            currentBranchAvailable:
              override?.isAvailable ?? true,
            hasBranchOverride: !!override,
          });
        }

        if (mergedItems.length > 0) {
          result.push({
            ...cat,
            titleAz: cat.titleAz,
            titleRu: cat.titleRu,
            titleEn: cat.titleEn,
            items: mergedItems,
          });
        }
      }

      return {
        branch: branch
          ? {
              id: branch.id,
              name: branch.name,
              slug: branch.slug,
            }
          : null,
        categories: result,
      };
    }),

  // Admin: Update branch-specific item settings
  updateMenuItemBranch: adminMutation
    .input(
      z.object({
        menuItemId: z.number(),
        branchId: z.number(),
        isAvailable: z.boolean().optional(),
        branchPrice: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if row already exists
      const existing = await db
        .select()
        .from(menuItemBranches)
        .where(
          and(
            eq(menuItemBranches.menuItemId, input.menuItemId),
            eq(menuItemBranches.branchId, input.branchId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing row
        const updateData: any = {};
        if (input.isAvailable !== undefined)
          updateData.isAvailable = input.isAvailable;
        if (input.branchPrice !== undefined)
          updateData.branchPrice = input.branchPrice;

        await db
          .update(menuItemBranches)
          .set(updateData)
          .where(eq(menuItemBranches.id, existing[0].id));

        return { id: existing[0].id, updated: true };
      } else {
        // Insert new row
        const result = await db.insert(menuItemBranches).values({
          menuItemId: input.menuItemId,
          branchId: input.branchId,
          isAvailable: input.isAvailable ?? true,
          branchPrice: input.branchPrice ?? null,
        });

        return { id: Number(result[0].insertId), created: true };
      }
    }),
});
