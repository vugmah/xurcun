import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { blogPosts, type BlogSectionRow } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

const L5 = z.object({
  az: z.string(),
  ru: z.string(),
  en: z.string(),
  tr: z.string(),
  ar: z.string(),
});

const sectionSchema = z.object({
  h2: L5,
  body: z.array(L5),
  image: z.string().optional(),
  imageAlt: L5.optional(),
  gallery: z.array(z.object({ src: z.string(), alt: L5 })).optional(),
});

const blogInput = z.object({
  slug: z.string().min(1),
  date: z.string().min(1),
  cover: z.string().optional(),
  video: z.string().optional(),
  title: L5,
  desc: L5,
  h1: L5,
  lead: L5,
  sections: z.array(sectionSchema).default([]),
  sortOrder: z.number().optional(),
  published: z.boolean().optional(),
});

type BlogRow = typeof blogPosts.$inferSelect;
type BlogInput = z.infer<typeof blogInput>;

// Flat DB columns → nested API shape.
function rowToPost(r: BlogRow) {
  return {
    id: r.id,
    slug: r.slug,
    date: r.date,
    cover: r.cover,
    video: r.video,
    title: { az: r.titleAz ?? "", ru: r.titleRu ?? "", en: r.titleEn ?? "", tr: r.titleTr ?? "", ar: r.titleAr ?? "" },
    desc: { az: r.descAz ?? "", ru: r.descRu ?? "", en: r.descEn ?? "", tr: r.descTr ?? "", ar: r.descAr ?? "" },
    h1: { az: r.h1Az ?? "", ru: r.h1Ru ?? "", en: r.h1En ?? "", tr: r.h1Tr ?? "", ar: r.h1Ar ?? "" },
    lead: { az: r.leadAz ?? "", ru: r.leadRu ?? "", en: r.leadEn ?? "", tr: r.leadTr ?? "", ar: r.leadAr ?? "" },
    sections: (r.sections ?? []) as BlogSectionRow[],
    sortOrder: r.sortOrder ?? 0,
    published: r.published ?? true,
  };
}

// Nested API input → flat DB columns. Null for missing cover/video.
function inputToRow(i: Omit<BlogInput, "id">) {
  return {
    slug: i.slug,
    date: i.date,
    cover: i.cover ?? null,
    video: i.video ?? null,
    titleAz: i.title.az, titleRu: i.title.ru, titleEn: i.title.en, titleTr: i.title.tr, titleAr: i.title.ar,
    descAz: i.desc.az, descRu: i.desc.ru, descEn: i.desc.en, descTr: i.desc.tr, descAr: i.desc.ar,
    h1Az: i.h1.az, h1Ru: i.h1.ru, h1En: i.h1.en, h1Tr: i.h1.tr, h1Ar: i.h1.ar,
    leadAz: i.lead.az, leadRu: i.lead.ru, leadEn: i.lead.en, leadTr: i.lead.tr, leadAr: i.lead.ar,
    sections: i.sections as BlogSectionRow[],
    sortOrder: i.sortOrder ?? 0,
    published: i.published ?? true,
  };
}

export const blogRouter = createRouter({
  // Public: published posts, ordered
  list: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(asc(blogPosts.sortOrder), asc(blogPosts.id));
    return rows.map(rowToPost);
  }),

  // Public: one published post by slug
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.published, true)))
        .limit(1);
      return rows[0] ? rowToPost(rows[0]) : null;
    }),

  // Admin: all posts (including unpublished), ordered
  adminList: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select()
      .from(blogPosts)
      .orderBy(asc(blogPosts.sortOrder), asc(blogPosts.id));
    return rows.map(rowToPost);
  }),

  // Admin: create post
  create: adminMutation
    .input(blogInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(blogPosts).values(inputToRow(input));
      return { success: true };
    }),

  // Admin: update post (full input required)
  update: adminMutation
    .input(blogInput.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...rest } = input;
      await db.update(blogPosts).set(inputToRow(rest as Omit<BlogInput, "id">)).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  // Admin: delete post
  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Admin: reorder posts
  reorder: adminMutation
    .input(z.object({ items: z.array(z.object({ id: z.number(), sortOrder: z.number() })) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const it of input.items) {
        await db.update(blogPosts).set({ sortOrder: it.sortOrder }).where(eq(blogPosts.id, it.id));
      }
      return { success: true };
    }),
});
