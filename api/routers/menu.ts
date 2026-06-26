import { z } from "zod";
import { createRouter, publicQuery, publicMutation, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems, photoAssignments } from "../../db/schema";
import { eq, and, asc, inArray, sql } from "drizzle-orm";
import { resetAndSeedMenuData } from "../seed";

export const menuRouter = createRouter({
  // Public: Get active menu categories with items by menu_type
  // Auto-seeds DB if empty
  // OPTIMIZED: Single batched query for items instead of N+1
  getMenu: publicQuery
    .input(z.object({ tab: z.enum(["food", "beverage", "shisha", "snack"]) }))
    .query(async ({ input }) => {
      const db = getDb();

      // 1. Fetch categories for the tab
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

      // 2. Batch-load ALL items for ALL categories in a single query
      const categoryIds = categories.map((c) => c.id);
      let allItems: typeof menuItems.$inferSelect[] = [];
      if (categoryIds.length > 0) {
        allItems = await db
          .select()
          .from(menuItems)
          .where(
            and(
              inArray(menuItems.categoryId, categoryIds),
              eq(menuItems.isActive, true)
            )
          )
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
      }

      // 3. Group items by category in memory (O(N))
      const itemsByCategory = new Map<number, typeof allItems>();
      for (const item of allItems) {
        const list = itemsByCategory.get(item.categoryId) || [];
        list.push(item);
        itemsByCategory.set(item.categoryId, list);
      }

      // 4. Build result preserving category order
      const result = categories.map((cat) => ({
        ...cat,
        items: itemsByCategory.get(cat.id) || [],
      }));
      return result;
    }),

  // Admin: Get ALL menu categories with ALL items (active + inactive)
  // Same structure as getMenu but without isActive filter on items
  adminGetMenu: adminQuery
    .input(z.object({ tab: z.enum(["food", "beverage", "shisha", "snack"]) }))
    .query(async ({ input }) => {
      const db = getDb();

      // 1. Fetch categories for the tab
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

      // 2. Batch-load ALL items (active + inactive) for ALL categories
      const categoryIds = categories.map((c) => c.id);
      let allItems: typeof menuItems.$inferSelect[] = [];
      if (categoryIds.length > 0) {
        allItems = await db
          .select()
          .from(menuItems)
          .where(inArray(menuItems.categoryId, categoryIds))
          .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
      }

      // 3. Group items by category in memory
      const itemsByCategory = new Map<number, typeof allItems>();
      for (const item of allItems) {
        const list = itemsByCategory.get(item.categoryId) || [];
        list.push(item);
        itemsByCategory.set(item.categoryId, list);
      }

      // 4. Build result preserving category order
      const result = categories.map((cat) => ({
        ...cat,
        items: itemsByCategory.get(cat.id) || [],
      }));
      return result;
    }),

  // Admin: Get all categories with item count (public read for admin panel visibility)
  // OPTIMIZED: Single aggregation query instead of N+1
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
      menuType: z.enum(["catalog", "cafe", "food", "beverage", "shisha", "snack"]),
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
      menuType: z.enum(["catalog", "cafe", "food", "beverage", "shisha", "snack"]).optional(),
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

      // 2. NEW: If imageUrl provided, also write to photo_assignments
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

  // Admin: Reset all menu data and re-seed (requires admin auth)
  resetAndSeed: adminQuery.mutation(async () => {
    const result = await resetAndSeedMenuData();
    return result;
  }),

  // Admin: Import real menu data from menuData.ts (replaces all existing data)
  importRealMenu: adminQuery
    .input(z.array(z.object({
      titleAz: z.string().min(1),
      titleRu: z.string(),
      titleEn: z.string(),
      menuType: z.enum(["food", "beverage", "shisha", "snack"]),
      sortOrder: z.number().optional(),
      items: z.array(z.object({
        nameAz: z.string().min(1),
        nameRu: z.string().optional(),
        nameEn: z.string().optional(),
        price: z.string().optional(),
        descAz: z.string().optional(),
        descRu: z.string().optional(),
        descEn: z.string().optional(),
        imageUrl: z.string().optional(),
        isNew: z.boolean().optional(),
        isMeat: z.boolean().optional(),
        isFish: z.boolean().optional(),
        isVegetarian: z.boolean().optional(),
        isHalal: z.boolean().optional(),
        isSpicy: z.boolean().optional(),
        isGlutenFree: z.boolean().optional(),
        isSugarFree: z.boolean().optional(),
        isSnack: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })),
    })))
    .mutation(async ({ input }) => {
      const db = getDb();

      // 1. Delete all existing items first (foreign key constraint)
      await db.delete(menuItems);
      // 2. Delete all existing categories
      await db.delete(menuCategories);

      let catCount = 0;
      let itemCount = 0;

      // 3. Insert new categories with their items
      for (const cat of input) {
        const catResult = await db.insert(menuCategories).values({
          menuType: cat.menuType,
          titleAz: cat.titleAz,
          titleRu: cat.titleRu || "",
          titleEn: cat.titleEn || "",
          sortOrder: cat.sortOrder || 0,
          isActive: true,
        });
        const categoryId = catResult[0]?.insertId;
        catCount++;

        for (const item of cat.items) {
          await db.insert(menuItems).values({
            categoryId: categoryId ?? 0,
            nameAz: item.nameAz,
            nameRu: item.nameRu || "",
            nameEn: item.nameEn || "",
            price: item.price || "0",
            descAz: item.descAz || "",
            descRu: item.descRu || "",
            descEn: item.descEn || "",
            imageUrl: item.imageUrl || null,
            isNew: item.isNew ?? false,
            isMeat: item.isMeat ?? false,
            isFish: item.isFish ?? false,
            isVegetarian: item.isVegetarian ?? false,
            isHalal: item.isHalal ?? false,
            isSpicy: item.isSpicy ?? false,
            isGlutenFree: item.isGlutenFree ?? false,
            isSugarFree: item.isSugarFree ?? false,
            isSnack: item.isSnack ?? false,
            sortOrder: item.sortOrder || 0,
            isActive: true,
          });
          itemCount++;
        }
      }

      return { success: true, categories: catCount, items: itemCount };
    }),
});