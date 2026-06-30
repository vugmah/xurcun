import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { faqItems } from "@db/schema";
import { eq, asc } from "drizzle-orm";

const L5 = z.object({
  az: z.string(),
  ru: z.string(),
  en: z.string(),
  tr: z.string(),
  ar: z.string(),
});

const faqInput = z.object({
  question: L5,
  answer: L5,
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

type FaqRow = typeof faqItems.$inferSelect;
type FaqInput = z.infer<typeof faqInput>;

// Flat DB columns → nested API shape.
function rowToFaq(r: FaqRow) {
  return {
    id: r.id,
    question: { az: r.questionAz ?? "", ru: r.questionRu ?? "", en: r.questionEn ?? "", tr: r.questionTr ?? "", ar: r.questionAr ?? "" },
    answer: { az: r.answerAz ?? "", ru: r.answerRu ?? "", en: r.answerEn ?? "", tr: r.answerTr ?? "", ar: r.answerAr ?? "" },
    sortOrder: r.sortOrder ?? 0,
    published: r.published ?? true,
  };
}

// Nested API input → flat DB columns.
function inputToRow(i: Omit<FaqInput, "id">) {
  return {
    questionAz: i.question.az, questionRu: i.question.ru, questionEn: i.question.en, questionTr: i.question.tr, questionAr: i.question.ar,
    answerAz: i.answer.az, answerRu: i.answer.ru, answerEn: i.answer.en, answerTr: i.answer.tr, answerAr: i.answer.ar,
    sortOrder: i.sortOrder ?? 0,
    published: i.published ?? true,
  };
}

export const faqRouter = createRouter({
  // Public: published items, ordered
  list: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(faqItems)
      .where(eq(faqItems.published, true))
      .orderBy(asc(faqItems.sortOrder), asc(faqItems.id));
    return rows.map(rowToFaq);
  }),

  // Admin: all items (including unpublished), ordered
  adminList: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(faqItems)
      .orderBy(asc(faqItems.sortOrder), asc(faqItems.id));
    return rows.map(rowToFaq);
  }),

  // Admin: create item
  create: adminMutation
    .input(faqInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(faqItems).values(inputToRow(input));
      return { success: true };
    }),

  // Admin: update item (partial input)
  update: adminMutation
    .input(faqInput.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      await db.update(faqItems).set(inputToRow(rest as Omit<FaqInput, "id">)).where(eq(faqItems.id, id));
      return { success: true };
    }),

  // Admin: delete item
  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(faqItems).where(eq(faqItems.id, input.id));
      return { success: true };
    }),

  // Admin: reorder items
  reorder: adminMutation
    .input(z.object({ items: z.array(z.object({ id: z.number(), sortOrder: z.number() })) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const it of input.items) {
        await db.update(faqItems).set({ sortOrder: it.sortOrder }).where(eq(faqItems.id, it.id));
      }
      return { success: true };
    }),
});
