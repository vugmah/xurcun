import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { homepageText } from "@db/schema";
import { eq, asc } from "drizzle-orm";

const L5 = z.object({
  az: z.string(),
  ru: z.string(),
  en: z.string(),
  tr: z.string(),
  ar: z.string(),
});

type TextRow = typeof homepageText.$inferSelect;

// Flat DB columns → nested API shape.
function rowToText(r: TextRow) {
  return {
    key: r.key,
    value: { az: r.valueAz ?? "", ru: r.valueRu ?? "", en: r.valueEn ?? "", tr: r.valueTr ?? "", ar: r.valueAr ?? "" },
    updatedAt: r.updatedAt,
  };
}

export const homepageTextRouter = createRouter({
  // Public: all stored overrides, ordered by key
  getAll: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(homepageText).orderBy(asc(homepageText.key));
    return rows.map(rowToText);
  }),

  // Admin: same as getAll (kept separate to mirror FAQ adminList)
  adminList: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(homepageText).orderBy(asc(homepageText.key));
    return rows.map(rowToText);
  }),

  // Admin: upsert a single field keyed by `key`
  upsert: adminMutation
    .input(z.object({ key: z.string().min(1), value: L5 }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(homepageText)
        .where(eq(homepageText.key, input.key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(homepageText)
          .set({
            valueAz: input.value.az,
            valueRu: input.value.ru,
            valueEn: input.value.en,
            valueTr: input.value.tr,
            valueAr: input.value.ar,
          })
          .where(eq(homepageText.key, input.key));
      } else {
        await db.insert(homepageText).values({
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
    .input(z.object({ key: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(homepageText).where(eq(homepageText.key, input.key));
      return { success: true };
    }),
});
