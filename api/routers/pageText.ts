import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { pageText } from "@db/schema";
import { and, eq, asc } from "drizzle-orm";

const L5 = z.object({
  az: z.string(),
  ru: z.string(),
  en: z.string(),
  tr: z.string(),
  ar: z.string(),
});

type TextRow = typeof pageText.$inferSelect;

// Flat DB columns → nested API shape.
function rowToText(r: TextRow) {
  return {
    page: r.page,
    key: r.key,
    value: { az: r.valueAz ?? "", ru: r.valueRu ?? "", en: r.valueEn ?? "", tr: r.valueTr ?? "", ar: r.valueAr ?? "" },
    updatedAt: r.updatedAt,
  };
}

export const pageTextRouter = createRouter({
  // Public: all stored overrides for one page, ordered by key
  getAll: publicQuery
    .input(z.object({ page: z.string().min(1).max(40) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(pageText)
        .where(eq(pageText.page, input.page))
        .orderBy(asc(pageText.key));
      return rows.map(rowToText);
    }),

  // Admin: every override row across all pages
  adminListAll: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(pageText)
      .orderBy(asc(pageText.page), asc(pageText.key));
    return rows.map(rowToText);
  }),

  // Admin: upsert a single field keyed by (page, key)
  upsert: adminMutation
    .input(z.object({ page: z.string().min(1).max(40), key: z.string().min(1).max(80), value: L5 }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(pageText)
        .where(and(eq(pageText.page, input.page), eq(pageText.key, input.key)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(pageText)
          .set({
            valueAz: input.value.az,
            valueRu: input.value.ru,
            valueEn: input.value.en,
            valueTr: input.value.tr,
            valueAr: input.value.ar,
          })
          .where(and(eq(pageText.page, input.page), eq(pageText.key, input.key)));
      } else {
        await db.insert(pageText).values({
          page: input.page,
          key: input.key,
          valueAz: input.value.az,
          valueRu: input.value.ru,
          valueEn: input.value.en,
          valueTr: input.value.tr,
          valueAr: input.value.ar,
        });
      }
      return { success: true };
    }),

  // Admin: reset a field to its in-code default (delete the override row)
  reset: adminMutation
    .input(z.object({ page: z.string().min(1), key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pageText).where(and(eq(pageText.page, input.page), eq(pageText.key, input.key)));
      return { success: true };
    }),
});
