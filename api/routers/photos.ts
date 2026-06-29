import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { photos } from "../../db/schema";
import { eq, asc, inArray } from "drizzle-orm";

export const photosRouter = createRouter({
  // Public: Get all active photos by section
  getBySection: publicQuery
    .input(z.object({
      section: z.string(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(photos)
        .where(eq(photos.section, input.section))
        .orderBy(asc(photos.sortOrder));
    }),

  // Public: Get all active photos
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(photos)
      .where(eq(photos.isActive, true))
      .orderBy(asc(photos.sortOrder));
  }),

  // Admin: Get all photos (including inactive)
  adminGetAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(photos).orderBy(asc(photos.sortOrder));
  }),

  // Admin: Create photo entry
  create: adminMutation
    .input(z.object({
      filename: z.string().min(1),
      altAz: z.string().optional(),
      altRu: z.string().optional(),
      altEn: z.string().optional(),
      section: z.string().min(1),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { filename, ...rest } = input;
      await db.insert(photos).values({ url: filename, ...rest });
      return { success: true };
    }),

  // Admin: Update photo
  update: adminMutation
    .input(z.object({
      id: z.number(),
      filename: z.string().optional(),
      altAz: z.string().optional(),
      altRu: z.string().optional(),
      altEn: z.string().optional(),
      section: z.string().optional(),
      sortOrder: z.number().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(photos).set(data).where(eq(photos.id, id));
      return { success: true };
    }),

  // Admin: Upsert a single photo keyed by its section (used for homepage image slots)
  upsertBySection: adminMutation
    .input(z.object({
      section: z.string().min(1),
      url: z.string().min(1),
      altAz: z.string().optional(),
      altRu: z.string().optional(),
      altEn: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(photos)
        .where(eq(photos.section, input.section))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(photos)
          .set({
            url: input.url,
            altAz: input.altAz,
            altRu: input.altRu,
            altEn: input.altEn,
          })
          .where(eq(photos.id, existing[0].id));
      } else {
        await db.insert(photos).values({
          url: input.url,
          section: input.section,
          altAz: input.altAz,
          altRu: input.altRu,
          altEn: input.altEn,
          isActive: true,
          sortOrder: 0,
        });
      }
      return { success: true };
    }),

  // Admin: Delete photo
  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(photos).where(eq(photos.id, input.id));
      return { success: true };
    }),

  // Admin: Bulk delete photos
  bulkDelete: adminMutation
    .input(z.object({ ids: z.array(z.number()).min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(photos).where(inArray(photos.id, input.ids));
      return { success: true, deleted: input.ids.length };
    }),

  // Admin: Bulk create static photo entries (for files in public/food-photos/)
  bulkCreateStatic: adminMutation
    .input(z.object({
      filenames: z.array(z.string()).min(1),
      section: z.string().default("menu"),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const values = input.filenames.map((name) => ({
        url: name.startsWith("/") ? name : `/food-photos/${name}`,
        section: input.section,
        sortOrder: 0,
        isActive: true,
      }));
      await db.insert(photos).values(values);
      return { success: true, count: values.length };
    }),
});
