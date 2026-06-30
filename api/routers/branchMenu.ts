import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import {
  branches,
  menuCategories,
  menuItems,
  menuItemBranches,
  photoAssignments,
} from "@db/schema";
import { eq, and, asc, inArray, sql } from "drizzle-orm";

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
  // Public: Get the menu for a branch with per-branch overrides applied.
  // Drop-in shape for catalog.storefront: { categories, items } (flat),
  // where each item is a full menuItems row with `price` swapped to the
  // branch price when an override exists. Items the branch marks unavailable
  // are excluded.
  getMenuForBranch: publicQuery
    .input(
      z.object({
        branchSlug: z.string(),
        menuType: z.enum(["catalog", "cafe"]).default("catalog"),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // 1. Find the active branch by slug
      const branchRows = await db
        .select()
        .from(branches)
        .where(and(eq(branches.slug, input.branchSlug), eq(branches.isActive, true)))
        .limit(1);
      const branch = branchRows[0];
      if (!branch) return { categories: [], items: [] };

      // 2. Active categories for this menu type
      const categories = await db
        .select()
        .from(menuCategories)
        .where(
          and(
            eq(menuCategories.menuType, input.menuType),
            eq(menuCategories.isActive, true)
          )
        )
        .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));

      const catIds = categories.map((c) => c.id);
      if (catIds.length === 0) return { categories, items: [] };

      // 3. Active items in those categories
      const baseItems = await db
        .select()
        .from(menuItems)
        .where(and(inArray(menuItems.categoryId, catIds), eq(menuItems.isActive, true)))
        .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));

      const itemIds = baseItems.map((i) => i.id);

      // 4. Branch overrides for those items
      let overrides: (typeof menuItemBranches.$inferSelect)[] = [];
      if (itemIds.length > 0) {
        overrides = await db
          .select()
          .from(menuItemBranches)
          .where(
            and(
              inArray(menuItemBranches.menuItemId, itemIds),
              eq(menuItemBranches.branchId, branch.id),
              eq(menuItemBranches.isActive, true)
            )
          );
      }
      const overrideMap = new Map<number, (typeof menuItemBranches.$inferSelect)>();
      for (const o of overrides) overrideMap.set(o.menuItemId, o);

      // 5. Build the flat item list: drop unavailable, swap price in place
      const items = [];
      for (const item of baseItems) {
        const override = overrideMap.get(item.id);
        if (override && override.isAvailable === false) continue;
        items.push({ ...item, price: override?.branchPrice ?? item.price });
      }

      return { categories, items };
    }),

  // Admin: branch override rows for one menu item (pre-fills the editor)
  getMenuItemBranches: adminQuery
    .input(z.object({ menuItemId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(menuItemBranches)
        .where(eq(menuItemBranches.menuItemId, input.menuItemId));
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
