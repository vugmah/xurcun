import { z } from "zod";
import { createRouter, publicQuery, publicMutation, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems, photoAssignments } from "../../db/schema";
import { eq, and, asc, inArray, sql } from "drizzle-orm";

export const menuRouter = createRouter({
  // Public: Get active menu categories with items by menu_type
  // Auto-seeds DB if empty
  // OPTIMIZED: Single batched query for items instead of N+1
  adminGetCategories: publicQuery.query(async () => {
    const db = getDb();

    const cats = await db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));

    // Batch count all items per category in a single query
    const categoryIds = cats.map((c) => c.id);
    const countsMap = new Map<number, number>();
    if (categoryIds.length > 0) {
      const countRows = await db
        .select({
          catId: menuItems.categoryId,
          count: sql<number>`COUNT(*)`,
        })
        .from(menuItems)
        .where(inArray(menuItems.categoryId, categoryIds))
        .groupBy(menuItems.categoryId);
      for (const row of countRows) {
        countsMap.set(row.catId, row.count);
      }
    }

    return cats.map((cat) => ({
      ...cat,
      itemCount: countsMap.get(cat.id) || 0,
    }));
  }),

  // Public: Get items by category (read-only for admin panel display)
  getItemsByCategory: publicQuery
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(menuItems)
        .where(eq(menuItems.categoryId, input.categoryId))
        .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
    }),

  // Create category
  createCategory: adminMutation
    .input(z.object({
      titleAz: z.string().min(1),
      titleRu: z.string().min(1),
      titleEn: z.string().min(1),
      titleTr: z.string().optional(),
      titleAr: z.string().optional(),
      // "catalog" = məhsul kataloqu · "cafe" = mağaza içi kofe menyusu
      menuType: z.enum(["catalog", "cafe"]),
      parentId: z.number().nullable().optional(), // alt kateqoriya üçün ana id
      isFeatured: z.boolean().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(menuCategories).values(input);
      return { success: true };
    }),

  // Update category
  updateCategory: adminMutation
    .input(z.object({
      id: z.number(),
      titleAz: z.string().optional(),
      titleRu: z.string().optional(),
      titleEn: z.string().optional(),
      titleTr: z.string().optional(),
      titleAr: z.string().optional(),
      menuType: z.enum(["catalog", "cafe"]).optional(),
      parentId: z.number().nullable().optional(),
      isFeatured: z.boolean().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(menuCategories).set(data).where(eq(menuCategories.id, id));
      return { success: true };
    }),

  // Delete category (cascades to items)
  deleteCategory: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete items first
      await db.delete(menuItems).where(eq(menuItems.categoryId, input.id));
      // Then delete category
      await db.delete(menuCategories).where(eq(menuCategories.id, input.id));
      return { success: true };
    }),

  // Create item
  createItem: adminMutation
    .input(z.object({
      categoryId: z.number(),
      nameAz: z.string().min(1),
      nameRu: z.string().min(1),
      nameEn: z.string().min(1),
      nameTr: z.string().optional(),
      nameAr: z.string().optional(),
      price: z.string().optional(),
      priceVisible: z.boolean().optional(),
      unit: z.string().optional(),
      minOrder: z.string().optional(),
      descAz: z.string().optional(),
      descRu: z.string().optional(),
      descEn: z.string().optional(),
      descTr: z.string().optional(),
      descAr: z.string().optional(),
      imageUrl: z.string().optional(),
      imageAltAz: z.string().optional(),
      imageAltRu: z.string().optional(),
      imageAltEn: z.string().optional(),
      sortOrder: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      isNew: z.boolean().optional(),
      isMeat: z.boolean().optional(),
      isFish: z.boolean().optional(),
      isVegetarian: z.boolean().optional(),
      isHalal: z.boolean().optional(),
      isSpicy: z.boolean().optional(),
      isGlutenFree: z.boolean().optional(),
      isSugarFree: z.boolean().optional(),
      isSnack: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(menuItems).values(input);
      return { success: true };
    }),

  // Update item
  updateItem: adminMutation
    .input(z.object({
      id: z.number(),
      nameAz: z.string().optional(),
      nameRu: z.string().optional(),
      nameEn: z.string().optional(),
      nameTr: z.string().optional(),
      nameAr: z.string().optional(),
      price: z.string().optional(),
      priceVisible: z.boolean().optional(),
      unit: z.string().optional(),
      minOrder: z.string().optional(),
      descAz: z.string().optional(),
      descRu: z.string().optional(),
      descEn: z.string().optional(),
      descTr: z.string().optional(),
      descAr: z.string().optional(),
      imageUrl: z.string().optional(),
      imageAltAz: z.string().optional(),
      imageAltRu: z.string().optional(),
      imageAltEn: z.string().optional(),
      sortOrder: z.number().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      isNew: z.boolean().optional(),
      isMeat: z.boolean().optional(),
      isFish: z.boolean().optional(),
      isVegetarian: z.boolean().optional(),
      isHalal: z.boolean().optional(),
      isSpicy: z.boolean().optional(),
      isGlutenFree: z.boolean().optional(),
      isSugarFree: z.boolean().optional(),
      isSnack: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      // 1. Keep existing menu_items update for backward compatibility
      await db.update(menuItems).set(data).where(eq(menuItems.id, id));

      // 2. NEW: If imageUrl provided, also write to photo_assignments.
      // Best-effort sync: a failure here (e.g. schema drift) must not fail the core update above.
      try {
      if (input.imageUrl) {
        // Fetch the item being updated to get nameAz and categoryId
        const itemRows = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.id, id))
          .limit(1);

        if (itemRows.length > 0) {
          const item = itemRows[0];
          const branchSlug = "white-city";

          // Fetch the category to get tab and catTitleAz
          const catRows = await db
            .select()
            .from(menuCategories)
            .where(eq(menuCategories.id, item.categoryId))
            .limit(1);

          if (catRows.length > 0) {
            const cat = catRows[0];
            const tab = cat.menuType;
            const catTitleAz = cat.titleAz;
            // Use updated nameAz if provided in input, otherwise use DB value
            const itemNameAz = input.nameAz ?? item.nameAz;
            // Derive imageId from URL (last path segment)
            const urlParts = input.imageUrl.split("/");
            const imageId = urlParts[urlParts.length - 1] || input.imageUrl;

            // Check if assignment already exists for this item+branch
            const existing = await db
              .select()
              .from(photoAssignments)
              .where(
                and(
                  eq(photoAssignments.tab, tab),
                  eq(photoAssignments.catTitleAz, catTitleAz),
                  eq(photoAssignments.itemNameAz, itemNameAz),
                  eq(photoAssignments.branchSlug, branchSlug),
                ),
              )
              .limit(1);

            if (existing.length > 0) {
              // Update existing assignment
              await db
                .update(photoAssignments)
                .set({
                  imageId,
                  imageUrl: input.imageUrl,
                  updatedAt: new Date(),
                })
                .where(eq(photoAssignments.id, existing[0].id));
            } else {
              // Create new assignment
              await db.insert(photoAssignments).values({
                tab,
                catTitleAz,
                itemNameAz,
                imageId,
                imageUrl: input.imageUrl,
                branchSlug,
              });
            }
          }
        }
      }
      } catch (err) {
        console.error("[updateItem] photo_assignments sync failed (non-fatal):", err);
      }

      return { success: true };
    }),

  // Delete item
  deleteItem: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(menuItems).where(eq(menuItems.id, input.id));
      return { success: true };
    }),
});