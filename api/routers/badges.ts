/* ═══════════════════════════════════════════════════════════════════
   BADGES ROUTER — AI recommendations + human approval lifecycle
   ═══════════════════════════════════════════════════════════════════ */

import { z } from "zod";
import { createRouter, adminQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { badgeRecommendations, approvedBadges } from "../../db/schema";
import { sql, desc, eq, and, gte, count } from "drizzle-orm";

export const badgesRouter = createRouter({
  // ═══ Admin: List all recommendations with filter ═══
  adminList: adminQuery
    .input(z.object({
      status: z.enum(["all", "pending", "approved", "rejected", "snoozed"]).default("all"),
      branchSlug: z.string().default("white-city"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [
        eq(badgeRecommendations.branchSlug, input?.branchSlug ?? "white-city"),
      ];
      if (input?.status && input.status !== "all") {
        // @ts-ignore
        conditions.push(eq(badgeRecommendations.status, input.status));
      }

      return db
        .select()
        .from(badgeRecommendations)
        .where(and(...conditions))
        .orderBy(desc(badgeRecommendations.confidence))
        .limit(input?.limit ?? 50);
    }),

  // ═══ Admin: Approve a recommendation ═══
  approve: adminQuery
    .input(z.object({
      recommendationId: z.number(),
      approvedBy: z.string().max(100),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();

      // Get the recommendation
      const [rec] = await db
        .select()
        .from(badgeRecommendations)
        .where(eq(badgeRecommendations.id, input.recommendationId))
        .limit(1);

      if (!rec) return { success: false, error: "Recommendation not found" };

      // Update recommendation status
      await db
        .update(badgeRecommendations)
        .set({
          status: "approved",
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(badgeRecommendations.id, input.recommendationId));

      // Upsert into approved_badges
      const existing = await db
        .select()
        .from(approvedBadges)
        .where(and(
          eq(approvedBadges.itemId, rec.itemId),
          eq(approvedBadges.badgeType, rec.badgeType),
          eq(approvedBadges.branchSlug, rec.branchSlug ?? "white-city"),
        ))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(approvedBadges)
          .set({
            isActive: true,
            aiConfidence: rec.confidence,
            aiReason: rec.reason,
            approvedBy: input.approvedBy,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(approvedBadges.id, existing[0].id));
      } else {
        await db.insert(approvedBadges).values({
          itemId: rec.itemId,
          itemName: rec.itemName,
          branchSlug: rec.branchSlug ?? "white-city",
          badgeType: rec.badgeType,
          aiConfidence: rec.confidence,
          aiReason: rec.reason,
          approvedBy: input.approvedBy,
          approvedAt: new Date(),
          displayOrder: 0,
          isActive: true,
        });
      }

      return { success: true };
    }),

  // ═══ Admin: Reject a recommendation ═══
  reject: adminQuery
    .input(z.object({
      recommendationId: z.number(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(badgeRecommendations)
        .set({
          status: "rejected",
          rejectedReason: input.reason ?? null,
          updatedAt: new Date(),
        })
        .where(eq(badgeRecommendations.id, input.recommendationId));
      return { success: true };
    }),

  // ═══ Admin: Snooze a recommendation ═══
  snooze: adminQuery
    .input(z.object({
      recommendationId: z.number(),
      days: z.number().min(1).max(90).default(14),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const snoozeUntil = new Date();
      snoozeUntil.setDate(snoozeUntil.getDate() + input.days);
      await db
        .update(badgeRecommendations)
        .set({
          status: "snoozed",
          snoozeUntil,
          updatedAt: new Date(),
        })
        .where(eq(badgeRecommendations.id, input.recommendationId));
      return { success: true };
    }),

  // ═══ Admin: Generate AI recommendations from analytics ═══
  generate: adminQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
      days: z.number().min(1).max(90).default(30),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { analyticsRouter } = await import("./analytics");
      // We can't call router directly, so we'll query the DB

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - (input?.days ?? 30));
      const branch = input?.branchSlug ?? "white-city";

      // Get top items by views (potential "Popular" / "Bestseller")
      const topViews = await db
        .select({
          itemId: menuEvents.itemId,
          itemName: menuEvents.itemName,
          category: menuEvents.category,
          count: sql<number>`count(*)`,
        })
        .from(menuEvents)
        .where(and(
          gte(menuEvents.createdAt, daysAgo),
          eq(menuEvents.branchSlug, branch),
          eq(menuEvents.eventType, "view"),
        ))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(15);

      // Get top by hovers (potential "Staff Pick" / "Chef Special")
      const topHovers = await db
        .select({
          itemId: menuEvents.itemId,
          itemName: menuEvents.itemName,
          category: menuEvents.category,
          count: sql<number>`count(*)`,
        })
        .from(menuEvents)
        .where(and(
          gte(menuEvents.createdAt, daysAgo),
          eq(menuEvents.branchSlug, branch),
          eq(menuEvents.eventType, "hover"),
        ))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(15);

      // Get top by favorites (potential "Recommended")
      const topFavorites = await db
        .select({
          itemId: menuEvents.itemId,
          itemName: menuEvents.itemName,
          category: menuEvents.category,
          count: sql<number>`count(*)`,
        })
        .from(menuEvents)
        .where(and(
          gte(menuEvents.createdAt, daysAgo),
          eq(menuEvents.branchSlug, branch),
          eq(menuEvents.eventType, "favorite"),
        ))
        .groupBy(menuEvents.itemId, menuEvents.itemName, menuEvents.category)
        .orderBy(desc(sql`count(*)`))
        .limit(15);

      // Clear old pending recommendations for this branch
      await db
        .update(badgeRecommendations)
        .set({ status: "rejected", rejectedReason: "superseded by new generation" })
        .where(and(
          eq(badgeRecommendations.branchSlug, branch),
          eq(badgeRecommendations.status, "pending"),
        ));

      // Generate new recommendations
      const allRecs: { itemId: number; itemName: string; badgeType: string; confidence: number; reason: string; dataPoints: string }[] = [];

      // Top 5 views → "Bestseller"
      topViews.slice(0, 5).forEach((item, idx) => {
        if (!item.itemId || !item.itemName) return;
        const conf = Math.min(95, 60 + (5 - idx) * 7);
        allRecs.push({
          itemId: item.itemId,
          itemName: item.itemName,
          badgeType: idx === 0 ? "isBestseller" : "isPopular",
          confidence: conf,
          reason: `${item.count} görüntülenme — menüde en çok görüntülenen ${idx + 1}. ürün`,
          dataPoints: JSON.stringify({ views: item.count, rank: idx + 1 }),
        });
      });

      // Top 5 hovers → "Staff Pick" / "Chef Special"
      topHovers.slice(0, 5).forEach((item, idx) => {
        if (!item.itemId || !item.itemName) return;
        const conf = Math.min(90, 55 + (5 - idx) * 7);
        const existing = allRecs.find((r) => r.itemId === item.itemId);
        if (existing) return; // Skip if already recommended
        allRecs.push({
          itemId: item.itemId,
          itemName: item.itemName,
          badgeType: idx < 3 ? "isStaffPick" : "isChefSpecial",
          confidence: conf,
          reason: `${item.count} hover etkileşimi — kullanıcılar bu ürüne uzun süre bakıyor`,
          dataPoints: JSON.stringify({ hovers: item.count, rank: idx + 1 }),
        });
      });

      // Top 3 favorites → "Recommended"
      topFavorites.slice(0, 3).forEach((item, idx) => {
        if (!item.itemId || !item.itemName) return;
        const conf = Math.min(85, 50 + (3 - idx) * 10);
        const existing = allRecs.find((r) => r.itemId === item.itemId);
        if (existing) return;
        allRecs.push({
          itemId: item.itemId,
          itemName: item.itemName,
          badgeType: "isRecommended",
          confidence: conf,
          reason: `${item.count} favori — kullanıcılar bu ürünü favorilere ekliyor`,
          dataPoints: JSON.stringify({ favorites: item.count, rank: idx + 1 }),
        });
      });

      // Insert all recommendations
      if (allRecs.length > 0) {
        await db.insert(badgeRecommendations).values(
          allRecs.map((r) => ({
            itemId: r.itemId,
            itemName: r.itemName,
            branchSlug: branch,
            badgeType: r.badgeType,
            confidence: r.confidence,
            reason: r.reason,
            dataPoints: r.dataPoints,
            status: "pending" as const,
          }))
        );
      }

      return { success: true, count: allRecs.length };
    }),

  // ═══ Admin: Get approved badges for management ═══
  adminGetApproved: adminQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(approvedBadges)
        .where(eq(approvedBadges.branchSlug, input?.branchSlug ?? "white-city"))
        .orderBy(desc(approvedBadges.approvedAt));
    }),

  // ═══ Admin: Toggle approved badge active state ═══
  toggleActive: adminQuery
    .input(z.object({
      badgeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [badge] = await db
        .select()
        .from(approvedBadges)
        .where(eq(approvedBadges.id, input.badgeId))
        .limit(1);

      if (!badge) return { success: false, error: "Badge not found" };

      await db
        .update(approvedBadges)
        .set({ isActive: !badge.isActive, updatedAt: new Date() })
        .where(eq(approvedBadges.id, input.badgeId));

      return { success: true, isActive: !badge.isActive };
    }),

  // ═══ Public: Get approved badges for rendering (cached) ═══
  getPublic: publicQuery
    .input(z.object({
      branchSlug: z.string().default("white-city"),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(approvedBadges)
        .where(and(
          eq(approvedBadges.branchSlug, input.branchSlug),
          eq(approvedBadges.isActive, true),
        ))
        .orderBy(approvedBadges.displayOrder);
    }),

  // ═══ Admin: Get stats ═══
  stats: adminQuery
    .query(async () => {
      const db = getDb();
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(badgeRecommendations).where(eq(badgeRecommendations.status, "pending"));
      const [approved] = await db.select({ count: sql<number>`count(*)` }).from(badgeRecommendations).where(eq(badgeRecommendations.status, "approved"));
      const [rejected] = await db.select({ count: sql<number>`count(*)` }).from(badgeRecommendations).where(eq(badgeRecommendations.status, "rejected"));
      const [snoozed] = await db.select({ count: sql<number>`count(*)` }).from(badgeRecommendations).where(eq(badgeRecommendations.status, "snoozed"));
      const [totalBadges] = await db.select({ count: sql<number>`count(*)` }).from(approvedBadges);
      const [activeBadges] = await db.select({ count: sql<number>`count(*)` }).from(approvedBadges).where(eq(approvedBadges.isActive, true));

      return {
        pending: pending?.count ?? 0,
        approved: approved?.count ?? 0,
        rejected: rejected?.count ?? 0,
        snoozed: snoozed?.count ?? 0,
        totalBadges: totalBadges?.count ?? 0,
        activeBadges: activeBadges?.count ?? 0,
      };
    }),
});

// Need to import menuEvents for generate endpoint
import { menuEvents } from "../../db/schema";
