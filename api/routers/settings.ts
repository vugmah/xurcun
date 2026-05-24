import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { settings } from "../../db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  // Public: Get all settings as key-value map
  getAll: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(settings);
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value ?? "";
    }
    return result;
  }),

  // Public: Get single setting by key
  getByKey: publicQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key));
      return rows[0]?.value ?? null;
    }),

  // Admin: Get all settings (raw rows)
  adminGetAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(settings);
  }),

  // Admin: Create or update setting
  upsert: adminMutation
    .input(z.object({
      key: z.string().min(1),
      value: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, input.key));

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: input.value })
          .where(eq(settings.key, input.key));
      } else {
        await db.insert(settings).values(input);
      }
      return { success: true };
    }),

  // Admin: Delete setting
  delete: adminMutation
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(settings).where(eq(settings.key, input.key));
      return { success: true };
    }),

  // Admin: Bulk update settings
  bulkUpsert: adminMutation
    .input(z.array(z.object({
      key: z.string().min(1),
      value: z.string(),
    })))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        const existing = await db
          .select()
          .from(settings)
          .where(eq(settings.key, item.key));
        if (existing.length > 0) {
          await db
            .update(settings)
            .set({ value: item.value })
            .where(eq(settings.key, item.key));
        } else {
          await db.insert(settings).values(item);
        }
      }
      return { success: true };
    }),
});
