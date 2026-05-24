/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS ROUTER — Anonymous menu event tracking + insights
   ═══════════════════════════════════════════════════════════════════ */

import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { menuEvents, approvedBadges } from "../../db/schema";
import { sql, desc, eq, and, gte } from "drizzle-orm";

export const analyticsRouter = createRouter({
  // ═══ Public: Ingest anonymous event (GDPR-safe, no PII) ═══
  track: publicQuery
    .input(z.object({
      sessionId: z.string().min(1).max(64),
      eventType: z.enum(["view", "hover", "qr_scan", "print", "favorite"]),
      itemId: z.number().optional(),
      itemName: z.string().max(200).optional(),
      category: z.string().max(100).optional(),
      branchSlug: z.string().max(50).default("white-city"),
      lang: z.string().max(10).default("az"),
      source: z.enum(["qr", "homepage", "admin"]).default("qr"),
      metadata: z.string().optional(), // JSON string
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        await db.insert(menuEvents).values({
          sessionId: input.sessionId,
          eventType: input.eventType,
          itemId: input.itemId ?? null,
          itemName: input.itemName ?? null,
          category: input.category ?? null,
          branchSlug: input.branchSlug,
          lang: input.lang,
          source: input.source,
          metadata: input.metadata ?? null,
        });
        return { success: true };
      } catch (err) {
        console.error("[analytics.track] error:", err);
        return { success: false, error: "Failed to track event" };
      }
    }),

  // ═══ Public: Batch track (for queue) ═══
  trackBatch: publicQuery
    .input(z.object({
      events: z.array(z.object({
        sessionId: z.string(),
        eventType: z.enum(["view", "hover", "qr_scan", "print", "favorite"]),
        itemId: z.number().optional(),
        itemName: z.string().optional(),
        category: z.string().optional(),
        branchSlug: z.string().default("white-city"),
        lang: z.string().default("az"),
        source: z.enum(["qr", "homepage", "admin"]).default("qr"),
        metadata: z.string().optional(),
      })).max(50), // max 50 events per batch
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      try {
        const rows = input.events.map((e) => ({
          sessionId: e.sessionId,
          eventType: e.eventType,
          itemId: e.itemId ?? null,
          itemName: e.itemName ?? null,
          category: e.category ?? null,
          branchSlug: e.branchSlug,
          lang: e.lang,
          source: e.source,
          metadata: e.metadata ?? null,
        }));
        await db.insert(menuEvents).values(rows);
        return { success: true, count: rows.length };
      } catch (err) {
        console.error("[analytics.trackBatch] error:", err);
        return { success: false, error: "Failed to track batch" };
      }
    }),

  // ═══ Admin: Get top items by event type ═══
  getTopItems: publicQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
      eventType: z.enum(["view", "hover", "qr_scan", "print", "favorite"]).optional(),
      days: z.number().min(1).max(365).default(30),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days ?? 30));

      const conditions = [
        gte(menuEvents.createdAt, daysAgo),
        eq(menuEvents.branchSlug, input?.branchSlug ?? "white-city"),
      ];
      if (input?.eventType) {
        // @ts-ignore
        conditions.push(eq(menuEvents.eventType, input.eventType));
      }

      const rows = await db
        .select({
          itemId: menuEvents.itemId,
          itemName: menuEvents.itemName,
          category: menuEvents.category,
          count: sql<number>`count(*)`,
          uniqueSessions: sql<number>`count(distinct ${menuEvents.sessionId})`,
          avgTime: sql<number>`avg(CASE WHEN ${menuEvents.eventType} = 'hover' THEN CAST(JSON_UNQUOTE(JSON_EXTRACT(${menuEvents.metadata}, '$.duration')) AS DECIMAL) END)`,
        })
        .from(menuEvents)
        .where(and(...conditions))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(input?.limit ?? 20);

      return rows;
    }),

  // ═══ Admin: Get insights for AI badge generation ═══
  getInsights: publicQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
      days: z.number().min(1).max(90).default(30),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days ?? 30));

      const conditions = [
        gte(menuEvents.createdAt, daysAgo),
        eq(menuEvents.branchSlug, input?.branchSlug ?? "white-city"),
      ];

      // Top by views
      const topViews = await db
        .select({ itemId: menuEvents.itemId, itemName: menuEvents.itemName, category: menuEvents.category, count: sql<number>`count(*)` })
        .from(menuEvents)
        .where(and(...conditions, eq(menuEvents.eventType, "view")))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Top by hovers (engagement)
      const topHovers = await db
        .select({ itemId: menuEvents.itemId, itemName: menuEvents.itemName, category: menuEvents.category, count: sql<number>`count(*)` })
        .from(menuEvents)
        .where(and(...conditions, eq(menuEvents.eventType, "hover")))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Top by favorites
      const topFavorites = await db
        .select({ itemId: menuEvents.itemId, itemName: menuEvents.itemName, category: menuEvents.category, count: sql<number>`count(*)` })
        .from(menuEvents)
        .where(and(...conditions, eq(menuEvents.eventType, "favorite")))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      // Event distribution
      const eventDist = await db
        .select({ type: menuEvents.eventType, count: sql<number>`count(*)` })
        .from(menuEvents)
        .where(and(...conditions))
        .groupBy(menuEvents.eventType);

      // Category distribution
      const categoryDist = await db
        .select({ category: menuEvents.category, count: sql<number>`count(*)` })
        .from(menuEvents)
        .where(and(...conditions))
        .groupBy(menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(10);

      return {
        topViews,
        topHovers,
        topFavorites,
        eventDistribution: eventDist,
        categoryDistribution: categoryDist,
      };
    }),

  // ═══ Admin: Get approved badges for rendering ═══
  getApprovedBadges: publicQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(approvedBadges)
        .where(and(
          eq(approvedBadges.branchSlug, input?.branchSlug ?? "white-city"),
          eq(approvedBadges.isActive, true),
        ))
        .orderBy(approvedBadges.displayOrder);
    }),
});
