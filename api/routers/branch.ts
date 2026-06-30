import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { branches } from "@db/schema";
import { eq, and, asc } from "drizzle-orm";

const branchInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  mapUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  googleReviewUrl: z.string().optional(),
  tripadvisorUrl: z.string().optional(),
  hasCafe: z.boolean().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const branchRouter = createRouter({
  // Public: Get all active branches
  getBranches: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(branches)
      .where(eq(branches.isActive, true))
      .orderBy(branches.id);
  }),

  // Public: Get one branch by slug
  getBranchBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(branches)
        .where(
          and(
            eq(branches.slug, input.slug),
            eq(branches.isActive, true)
          )
        )
        .limit(1);
      return rows[0] ?? null;
    }),

  // Admin: all branches (including inactive), ordered
  adminGetBranches: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(branches).orderBy(asc(branches.sortOrder), asc(branches.id));
  }),

  // Admin: create branch
  createBranch: adminMutation
    .input(branchInput)
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(branches).values(input);
      return { success: true };
    }),

  // Admin: update branch
  updateBranch: adminMutation
    .input(branchInput.partial().extend({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(branches).set(data).where(eq(branches.id, id));
      return { success: true };
    }),

  // Admin: delete branch
  deleteBranch: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(branches).where(eq(branches.id, input.id));
      return { success: true };
    }),
});
