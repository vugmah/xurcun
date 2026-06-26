import { z } from "zod";
import { createRouter, publicQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { productImages, productVariants, menuItems, menuCategories } from "../../db/schema";
import { eq, asc, and, desc, isNull } from "drizzle-orm";

/**
 * Xurcun catalog extras — product image gallery + variants (size/color).
 * Plus public homepage feeds (categories + featured products).
 * itemId references menu_items.id (the product).
 */
export const catalogRouter = createRouter({
  // ── Public homepage feeds ──
  // Top-level catalog categories (for the homepage category strip).
  categories: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.menuType, "catalog"),
          isNull(menuCategories.parentId),
          eq(menuCategories.isActive, true),
        ),
      )
      .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
  }),

  // Featured/active catalog products with their category title (homepage grid).
  featured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: menuItems.id,
        nameAz: menuItems.nameAz, nameRu: menuItems.nameRu, nameEn: menuItems.nameEn,
        nameTr: menuItems.nameTr, nameAr: menuItems.nameAr,
        price: menuItems.price, priceVisible: menuItems.priceVisible,
        imageUrl: menuItems.imageUrl, isNew: menuItems.isNew,
        catTitleAz: menuCategories.titleAz, catTitleRu: menuCategories.titleRu,
        catTitleEn: menuCategories.titleEn, catTitleTr: menuCategories.titleTr, catTitleAr: menuCategories.titleAr,
      })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(and(eq(menuCategories.menuType, "catalog"), eq(menuItems.isActive, true)))
      .orderBy(desc(menuItems.isFeatured), desc(menuItems.id))
      .limit(8);
  }),

  // ── Product images (gallery) ──
  getImages: publicQuery
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(productImages)
        .where(eq(productImages.itemId, input.itemId))
        .orderBy(asc(productImages.sortOrder), asc(productImages.id));
    }),

  addImage: adminMutation
    .input(z.object({
      itemId: z.number(),
      url: z.string().min(1),
      altAz: z.string().optional(),
      altEn: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(productImages).values(input);
      return { success: true };
    }),

  deleteImage: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(productImages).where(eq(productImages.id, input.id));
      return { success: true };
    }),

  // ── Product variants (size / color) ──
  getVariants: publicQuery
    .input(z.object({ itemId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(productVariants)
        .where(eq(productVariants.itemId, input.itemId))
        .orderBy(asc(productVariants.sortOrder), asc(productVariants.id));
    }),

  addVariant: adminMutation
    .input(z.object({
      itemId: z.number(),
      nameAz: z.string().min(1),
      nameRu: z.string().optional(),
      nameEn: z.string().optional(),
      nameTr: z.string().optional(),
      nameAr: z.string().optional(),
      price: z.string().optional(),
      sku: z.string().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(productVariants).values(input);
      return { success: true };
    }),

  updateVariant: adminMutation
    .input(z.object({
      id: z.number(),
      nameAz: z.string().optional(),
      nameRu: z.string().optional(),
      nameEn: z.string().optional(),
      nameTr: z.string().optional(),
      nameAr: z.string().optional(),
      price: z.string().optional(),
      sku: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(productVariants).set(data).where(eq(productVariants.id, id));
      return { success: true };
    }),

  deleteVariant: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(productVariants).where(eq(productVariants.id, input.id));
      return { success: true };
    }),
});
