import { z } from "zod";
import { createRouter, publicQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { productImages, productVariants } from "../../db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Xurcun catalog extras — product image gallery + variants (size/color).
 * itemId references menu_items.id (the product).
 */
export const catalogRouter = createRouter({
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
