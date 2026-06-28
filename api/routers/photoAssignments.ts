import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createRouter, publicQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { photoAssignments, menuItems } from "../../db/schema";

export const photoAssignmentsRouter = createRouter({
  /* ─── Count assignments (fast, for admin counter) ─── */
  count: publicQuery
    .input(z.object({ branchSlug: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const branch = input?.branchSlug || "white-city";
      const rows = await db
        .select()
        .from(photoAssignments)
        .where(eq(photoAssignments.branchSlug, branch));
      return {
        total: rows.length,
        branch,
        source: "database",
      };
    }),

  /* ─── Debug: full assignment report (proves DB is source of truth) ─── */
  debug: publicQuery
    .input(z.object({ branchSlug: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const branch = input?.branchSlug || "white-city";
      const rows = await db
        .select()
        .from(photoAssignments)
        .where(eq(photoAssignments.branchSlug, branch));

      return {
        total: rows.length,
        branch,
        source: "database",
        generatedAt: new Date().toISOString(),
        assignments: rows.map((r) => ({
          id: r.id,
          tab: r.tab,
          category: r.catTitleAz,
          itemName: r.itemNameAz,
          imageId: r.imageId,
          imageUrl: r.imageUrl,
          updatedAt: r.updatedAt,
        })),
      };
    }),

  /* ─── Get assignments for a tab ─── */
  list: publicQuery
    .input(z.object({ tab: z.string().optional(), branchSlug: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const tab = input?.tab;
      const branch = input?.branchSlug || "white-city";

      const where = tab
        ? and(eq(photoAssignments.tab, tab), eq(photoAssignments.branchSlug, branch))
        : eq(photoAssignments.branchSlug, branch);

      const rows = await db.select().from(photoAssignments).where(where);

      // Return as key-value map for easy lookup
      const map: Record<string, { imageId: string; imageUrl: string }> = {};
      for (const row of rows) {
        const key = `${row.tab}:${row.catTitleAz}:${row.itemNameAz}`;
        map[key] = { imageId: row.imageId, imageUrl: row.imageUrl };
      }

      return { assignments: map, rows };
    }),

  /* ─── Assign photo to item ─── */
  assign: adminMutation
    .input(
      z.object({
        tab: z.string(),
        catTitleAz: z.string(),
        itemNameAz: z.string(),
        imageId: z.string(),
        imageUrl: z.string(),
        branchSlug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const branch = input.branchSlug || "white-city";

      // Check existing
      const existing = await db
        .select()
        .from(photoAssignments)
        .where(
          and(
            eq(photoAssignments.tab, input.tab),
            eq(photoAssignments.catTitleAz, input.catTitleAz),
            eq(photoAssignments.itemNameAz, input.itemNameAz),
            eq(photoAssignments.branchSlug, branch)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db
          .update(photoAssignments)
          .set({
            imageId: input.imageId,
            imageUrl: input.imageUrl,
            updatedAt: new Date(),
          })
          .where(eq(photoAssignments.id, existing[0].id));

        return { success: true, id: existing[0].id, action: "updated" };
      }

      // Insert new
      const result = await db.insert(photoAssignments).values({
        tab: input.tab,
        catTitleAz: input.catTitleAz,
        itemNameAz: input.itemNameAz,
        imageId: input.imageId,
        imageUrl: input.imageUrl,
        branchSlug: branch,
      });

      return { success: true, id: Number(result[0].insertId), action: "created" };
    }),

  /* ─── Bulk sync all 22 fruit tea photo assignments ─── */
  bulkSyncTea: adminMutation
    .mutation(async () => {
      const db = getDb();
      const BRANCH = "white-city";
      const TAB = "beverage";
      const CAT = "ÇAY";

      const TEA_DATA = [
        { itemId: 516, itemNameAz: "Chouchou & Loulou", imageUrl: "/food-photos/tea-516-chouchou.webp" },
        { itemId: 517, itemNameAz: "Douce Nuit", imageUrl: "/food-photos/tea-517-douce-nuit-v2.webp" },
        { itemId: 518, itemNameAz: "La Tete dans les Etoiles", imageUrl: "/food-photos/tea-518-la-tete.webp" },
        { itemId: 519, itemNameAz: "Le Temps Present Bio", imageUrl: "/food-photos/tea-519-temps-present.webp" },
        { itemId: 520, itemNameAz: "Les Cloches Sonnent", imageUrl: "/food-photos/tea-520-cloches.webp" },
        { itemId: 521, itemNameAz: "Cascara Tea", imageUrl: "/food-photos/tea-521-cascara-v2.webp" },
        { itemId: 522, itemNameAz: "Marcel de Provence", imageUrl: "/food-photos/tea-522-marcel-proust-v2.webp" },
        { itemId: 523, itemNameAz: "Mon Beau Sapin", imageUrl: "/food-photos/tea-523-sapin.webp" },
        { itemId: 524, itemNameAz: "Pain d'Epice", imageUrl: "/food-photos/tea-524-pain-epice-v2.webp" },
        { itemId: 525, itemNameAz: "Pomme Verte", imageUrl: "/food-photos/tea-525-pomme-verte.webp" },
        { itemId: 526, itemNameAz: "Rouge Ananas", imageUrl: "/food-photos/tea-526-rouge-ananas-v2.webp" },
        { itemId: 527, itemNameAz: "Si T'es Sage", imageUrl: "/food-photos/tea-527-si-tes-sage.webp" },
        { itemId: 528, itemNameAz: "The de la Chance", imageUrl: "/food-photos/tea-528-the-chance.webp" },
        { itemId: 529, itemNameAz: "Toujours La", imageUrl: "/food-photos/tea-529-toujours-v2.webp" },
        { itemId: 530, itemNameAz: "Vachement Sympa", imageUrl: "/food-photos/tea-530-vachement.webp" },
        { itemId: 531, itemNameAz: "Coco Givrees", imageUrl: "/food-photos/tea-531-coco.webp" },
        { itemId: 532, itemNameAz: "Rose en Sucre", imageUrl: "/food-photos/tea-532-rose-sucre.webp" },
        { itemId: 533, itemNameAz: "Energie du Yogi Bio", imageUrl: "/food-photos/tea-533-yogi-v2.webp" },
        { itemId: 534, itemNameAz: "Jardin Emeraude Bio", imageUrl: "/food-photos/tea-534-jardin-hiver-v2.webp" },
        { itemId: 535, itemNameAz: "Le Temps des Cerises", imageUrl: "/food-photos/tea-535-cerises.webp" },
        { itemId: 536, itemNameAz: "Ma Bonne Etoile", imageUrl: "/food-photos/tea-536-bonne-etoile.webp" },
        { itemId: 537, itemNameAz: "Sucre d'Orge", imageUrl: "/food-photos/tea-537-sucre-orge.webp" },
      ];

      let paCreated = 0;
      let paUpdated = 0;
      let miUpdated = 0;
      let miNotFound = 0;

      for (const tea of TEA_DATA) {
        // 1. Update photoAssignments
        const existing = await db
          .select()
          .from(photoAssignments)
          .where(
            and(
              eq(photoAssignments.tab, TAB),
              eq(photoAssignments.catTitleAz, CAT),
              eq(photoAssignments.itemNameAz, tea.itemNameAz),
              eq(photoAssignments.branchSlug, BRANCH)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(photoAssignments)
            .set({
              imageUrl: tea.imageUrl,
              imageId: tea.imageUrl,
              updatedAt: new Date(),
            })
            .where(eq(photoAssignments.id, existing[0].id));
          paUpdated++;
        } else {
          await db.insert(photoAssignments).values({
            tab: TAB,
            catTitleAz: CAT,
            itemNameAz: tea.itemNameAz,
            imageUrl: tea.imageUrl,
            imageId: tea.imageUrl,
            branchSlug: BRANCH,
          });
          paCreated++;
        }

        // 2. Update menuItems.imageUrl (CRITICAL - admin panel uses this)
        const miExisting = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.id, tea.itemId))
          .limit(1);

        if (miExisting.length > 0) {
          await db
            .update(menuItems)
            .set({
              imageUrl: tea.imageUrl,
              updatedAt: new Date(),
            })
            .where(eq(menuItems.id, tea.itemId));
          miUpdated++;
        } else {
          miNotFound++;
        }
      }

      return {
        success: true,
        photoAssignments: { created: paCreated, updated: paUpdated },
        menuItems: { updated: miUpdated, notFound: miNotFound },
        total: TEA_DATA.length,
        note: "Lənkəran çayı (515) dokunulmadı. Both photoAssignments AND menuItems.imageUrl updated.",
      };
    }),

  /* ─── Remove assignment ─── */
  remove: adminMutation
    .input(
      z.object({
        tab: z.string(),
        catTitleAz: z.string(),
        itemNameAz: z.string(),
        branchSlug: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const branch = input.branchSlug || "white-city";

      await db
        .delete(photoAssignments)
        .where(
          and(
            eq(photoAssignments.tab, input.tab),
            eq(photoAssignments.catTitleAz, input.catTitleAz),
            eq(photoAssignments.itemNameAz, input.itemNameAz),
            eq(photoAssignments.branchSlug, branch)
          )
        );

      return { success: true };
    }),
});
