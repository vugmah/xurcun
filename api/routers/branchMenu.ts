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
