import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { branches } from "@db/schema";
import { eq, and } from "drizzle-orm";

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
});
