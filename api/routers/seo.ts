import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { seoSettings, seoPages, menuCategories, menuItems, branches } from "../../db/schema";
import { eq, and } from "drizzle-orm";

export const seoRouter = createRouter({
  // ═══════════════════════════════════════════════════════
  // LEGACY: seoSettings routes (backward compatibility)
  // ═══════════════════════════════════════════════════════

  // Public: Get SEO settings for a page
  getByPage: publicQuery
    .input(z.object({ page: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.page, input.page));
      return rows[0] ?? null;
    }),

  // Public: Get all SEO settings
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(seoSettings);
  }),

  // Admin: Get all SEO settings
  adminGetAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(seoSettings);
  }),

  // Admin: Create SEO setting
  create: adminMutation
    .input(z.object({
      page: z.string().min(1),
      titleAz: z.string().optional(),
      titleRu: z.string().optional(),
      titleEn: z.string().optional(),
      titleTr: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionTr: z.string().optional(),
      keywordsAz: z.string().optional(),
      keywordsRu: z.string().optional(),
      keywordsEn: z.string().optional(),
      keywordsTr: z.string().optional(),
      ogTitleAz: z.string().optional(),
      ogTitleRu: z.string().optional(),
      ogTitleEn: z.string().optional(),
      ogTitleTr: z.string().optional(),
      ogDescriptionAz: z.string().optional(),
      ogDescriptionRu: z.string().optional(),
      ogDescriptionEn: z.string().optional(),
      ogDescriptionTr: z.string().optional(),
      ogImage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(seoSettings).values(input);
      return { success: true };
    }),

  // Admin: Update SEO setting
  update: adminMutation
    .input(z.object({
      id: z.number(),
      page: z.string().optional(),
      titleAz: z.string().optional(),
      titleRu: z.string().optional(),
      titleEn: z.string().optional(),
      titleTr: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionTr: z.string().optional(),
      keywordsAz: z.string().optional(),
      keywordsRu: z.string().optional(),
      keywordsEn: z.string().optional(),
      keywordsTr: z.string().optional(),
      ogTitleAz: z.string().optional(),
      ogTitleRu: z.string().optional(),
      ogTitleEn: z.string().optional(),
      ogTitleTr: z.string().optional(),
      ogDescriptionAz: z.string().optional(),
      ogDescriptionRu: z.string().optional(),
      ogDescriptionEn: z.string().optional(),
      ogDescriptionTr: z.string().optional(),
      ogImage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(seoSettings).set(data).where(eq(seoSettings.id, id));
      return { success: true };
    }),

  // Admin: Upsert by page name
  upsertByPage: adminMutation
    .input(z.object({
      page: z.string().min(1),
      titleAz: z.string().optional(),
      titleRu: z.string().optional(),
      titleEn: z.string().optional(),
      titleTr: z.string().optional(),
      descriptionAz: z.string().optional(),
      descriptionRu: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionTr: z.string().optional(),
      keywordsAz: z.string().optional(),
      keywordsRu: z.string().optional(),
      keywordsEn: z.string().optional(),
      keywordsTr: z.string().optional(),
      ogTitleAz: z.string().optional(),
      ogTitleRu: z.string().optional(),
      ogTitleEn: z.string().optional(),
      ogTitleTr: z.string().optional(),
      ogDescriptionAz: z.string().optional(),
      ogDescriptionRu: z.string().optional(),
      ogDescriptionEn: z.string().optional(),
      ogDescriptionTr: z.string().optional(),
      ogImage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(seoSettings)
        .where(eq(seoSettings.page, input.page));

      if (existing.length > 0) {
        await db
          .update(seoSettings)
          .set(input)
          .where(eq(seoSettings.page, input.page));
      } else {
        await db.insert(seoSettings).values(input);
      }
      return { success: true };
    }),

  // Admin: Delete SEO setting
  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(seoSettings).where(eq(seoSettings.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════
  // SEO PAGES — per-path multilingual SEO
  // ═══════════════════════════════════════════════════════

  // Public: Get SEO data by path + lang (auto-generates fallback)
  getByPath: publicQuery
    .input(z.object({
      path: z.string().min(1),   // e.g., "/menu/white-city"
      lang: z.string().min(2),   // "az", "en", "ru", "tr"
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const { path, lang } = input;

      // 1. Try exact match from seoPages
      const rows = await db
        .select()
        .from(seoPages)
        .where(and(eq(seoPages.path, path), eq(seoPages.lang, lang)));

      if (rows.length > 0) {
        return rows[0];
      }

      // 2. Auto-generate from menu content if path looks like a menu page
      const generated = await generateSeoFromContent(db, path, lang);
      if (generated) {
        return generated;
      }

      // 3. Return a safe fallback
      return generateFallbackSeo(path, lang);
    }),

  // Admin: Upsert SEO page entry
  upsert: adminMutation
    .input(z.object({
      path: z.string().min(1),
      lang: z.string().min(1),
      title: z.string().optional(),
      description: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      keywords: z.string().optional(),
      canonical: z.string().optional(),
      noIndex: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { path, lang, ...data } = input;

      const existing = await db
        .select()
        .from(seoPages)
        .where(and(eq(seoPages.path, path), eq(seoPages.lang, lang)));

      if (existing.length > 0) {
        await db
          .update(seoPages)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(seoPages.path, path), eq(seoPages.lang, lang)));
      } else {
        await db.insert(seoPages).values({
          path,
          lang,
          ...data,
        });
      }
      return { success: true };
    }),

  // Public: List all SEO pages for a language
  listByLang: publicQuery
    .input(z.object({
      lang: z.string().min(2),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(seoPages).where(eq(seoPages.lang, input.lang));
    }),

  // Admin: Get all seoPages entries
  getAllPages: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(seoPages);
  }),

  // Admin: Delete seoPages entry
  deletePage: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(seoPages).where(eq(seoPages.id, input.id));
      return { success: true };
    }),
});

// ═══════════════════════════════════════════════════════
// Auto-generation helpers
// ═══════════════════════════════════════════════════════

async function generateSeoFromContent(db: ReturnType<typeof getDb>, path: string, lang: string) {
  // Parse path patterns: /menu/:branchSlug or /:branchSlug/menu
  const parts = path.split("/").filter(Boolean);
  let branchSlug: string | null = null;

  if (parts.length >= 2 && parts[0] === "menu") {
    branchSlug = parts[1] ?? null;
  } else if (parts.length >= 2 && parts[parts.length - 1] === "menu") {
    branchSlug = parts[0] ?? null;
  } else if (parts.length === 1 && parts[0] === "menu") {
    branchSlug = "white-city";
  }

  if (!branchSlug) return null;

  // Fetch branch info
  const branchRows = await db
    .select()
    .from(branches)
    .where(eq(branches.slug, branchSlug));
  const branch = branchRows[0];

  // Fetch active menu categories (limit to first 6 for SEO text)
  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.isActive, true))
    .limit(6);

  // Fetch featured menu items (limit to 4)
  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.isActive, true))
    .limit(4);

  const branchName = branch?.name ?? branchSlug;

  // Build category names list based on language
  const catNames = categories.map((c) => {
    if (lang === "az") return c.titleAz;
    if (lang === "ru") return c.titleRu;
    if (lang === "tr") return c.titleEn; // fallback to en for tr
    return c.titleEn;
  }).filter(Boolean);

  // Build item names based on language
  const itemNames = items.map((item) => {
    if (lang === "az") return item.nameAz;
    if (lang === "ru") return item.nameRu;
    if (lang === "tr") return item.nameEn;
    return item.nameEn;
  }).filter(Boolean);

  // Select language-specific templates
  const t = getTemplates(lang);

  const title = t.title(branchName, catNames[0] ?? "");
  const description = t.description(branchName, catNames.slice(0, 4).join(", "), itemNames.slice(0, 3).join(", "));
  const keywords = [...catNames, ...itemNames, branchName, t.restaurant].filter(Boolean).join(", ");

  return {
    id: 0, // indicates auto-generated (not stored)
    path,
    lang,
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: null as string | null,
    keywords,
    canonical: null as string | null,
    noIndex: false,
    updatedAt: new Date(),
  };
}

function generateFallbackSeo(path: string, lang: string) {
  const t = getTemplates(lang);
  const title = t.fallbackTitle(path);
  return {
    id: 0,
    path,
    lang,
    title,
    description: t.fallbackDesc(path),
    ogTitle: title,
    ogDescription: t.fallbackDesc(path),
    ogImage: null as string | null,
    keywords: t.restaurant,
    canonical: null as string | null,
    noIndex: false,
    updatedAt: new Date(),
  };
}

function getTemplates(lang: string) {
  const templates: Record<string, {
    title: (branch: string, category: string) => string;
    description: (branch: string, categories: string, items: string) => string;
    fallbackTitle: (path: string) => string;
    fallbackDesc: (path: string) => string;
    restaurant: string;
  }> = {
    az: {
      title: (b, c) => `${b} menyusu – ${c ? c + " və daha çox" : "dadlı yeməklər"} | Xurcun`,
      description: (b, cats, items) =>
        `${b} filialımızda ${cats ? cats + " kateqoriyalarından " : ""}ən seçkin yeməklər: ${items || "mükəmməl dad"}. Xurcun – unikal atmosfer və mükəmməl xidmət.`,
      fallbackTitle: (p) => `Xurcun – ${p}`,
      fallbackDesc: (p) => `Xurcun restoranı – ${p} səhifəsi. Zəngin menyu, unikal atmosfer və mükəmməl xidmət.`,
      restaurant: "restoran, menyu, yemək, Xurcun",
    },
    ru: {
      title: (b, c) => `Меню ${b} – ${c ? c + " и многое другое" : "вкусные блюда"} | Xurcun`,
      description: (b, cats, items) =>
        `В филиале ${b} лучшие блюда ${cats ? "из категорий " + cats + ". " : ""}${items || "превосходный вкус"}. Xurcun – уникальная атмосфера и отличный сервис.`,
      fallbackTitle: (p) => `Xurcun – ${p}`,
      fallbackDesc: (p) => `Ресторан Xurcun – страница ${p}. Богатое меню, уникальная атмосфера и отличный сервис.`,
      restaurant: "ресторан, меню, еда, Xurcun",
    },
    tr: {
      title: (b, c) => `${b} menüsü – ${c ? c + " ve daha fazlası" : "lezzetli yemekler"} | Xurcun`,
      description: (b, cats, items) =>
        `${b} şubemizde ${cats ? cats + " kategorilerinden " : ""}en seçkin lezzetler: ${items || "mükemmel tat"}. Xurcun – eşsiz atmosfer ve mükemmel hizmet.`,
      fallbackTitle: (p) => `Xurcun – ${p}`,
      fallbackDesc: (p) => `Xurcun restoranı – ${p} sayfası. Zengin menü, eşsiz atmosfer ve mükemmel hizmet.`,
      restaurant: "restoran, menü, yemek, Xurcun",
    },
    en: {
      title: (b, c) => `${b} menu – ${c ? c + " and more" : "delicious dishes"} | Xurcun`,
      description: (b, cats, items) =>
        `At our ${b} branch, enjoy the finest ${cats ? cats + " selections" : "dishes"}: ${items || "exceptional taste"}. Xurcun – unique atmosphere and excellent service.`,
      fallbackTitle: (p) => `Xurcun – ${p}`,
      fallbackDesc: (p) => `Xurcun restaurant – ${p} page. Rich menu, unique atmosphere and excellent service.`,
      restaurant: "restaurant, menu, food, Xurcun",
    },
  };

  return templates[lang] ?? templates.en;
}
