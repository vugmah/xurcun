import { z } from "zod";
import { createRouter, publicQuery, publicMutation, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { popupCampaigns, popupViews, popupClicks } from "../../db/schema";
import { eq, and, count } from "drizzle-orm";

export const popupRouter = createRouter({
  // ─── Public: Get active campaigns for current context ───
  list: publicQuery
    .input(
      z.object({
        placement: z.string().optional(),
        branch: z.string().optional(),
        lang: z.string().optional(),
        sessionId: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const now = new Date();
      const currentHour = now.getHours();

      const allCampaigns = await db
        .select()
        .from(popupCampaigns)
        .where(eq(popupCampaigns.isActive, true));

      const result = [];

      for (const campaign of allCampaigns) {
        // Check date range
        if (campaign.startDate && new Date(campaign.startDate) > now) continue;
        if (campaign.endDate && new Date(campaign.endDate) < now) continue;

        // Check hour range (for time-based campaigns)
        if (campaign.startHour !== null && campaign.endHour !== null) {
          if (currentHour < campaign.startHour || currentHour > campaign.endHour) continue;
        }

        // Check placement filter ("all" | "homepage" | "qr" | "homepage+qr")
        const placement = campaign.placement ?? "all";
        if (placement !== "all" && placement !== input?.placement) continue;

        // Check branch filter
        if (campaign.branch && campaign.branch !== input?.branch) continue;

        // Check language filter
        if (campaign.lang && campaign.lang !== input?.lang) continue;

        // Check frequency (session-based max shows)
        if (input?.sessionId && campaign.frequency !== null && campaign.frequency > 0) {
          const viewCount = await db
            .select({ count: count() })
            .from(popupViews)
            .where(
              and(
                eq(popupViews.campaignId, campaign.id),
                eq(popupViews.sessionId, input.sessionId)
              )
            );
          if (viewCount.length > 0 && viewCount[0].count >= campaign.frequency) continue;
        }

        result.push(campaign);
      }

      return result;
    }),

  // ─── Public: Track a popup view ───
  trackView: publicMutation
    .input(
      z.object({
        campaignId: z.number(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(popupViews).values({
        campaignId: input.campaignId,
        sessionId: input.sessionId ?? null,
      });
      return { success: true };
    }),

  // ─── Public: Track a popup click ───
  trackClick: publicMutation
    .input(
      z.object({
        campaignId: z.number(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(popupClicks).values({
        campaignId: input.campaignId,
        sessionId: input.sessionId ?? null,
      });
      return { success: true };
    }),

  // ═══════════════════════════════════════════════════════
  // ADMIN PROCEDURES
  // ═══════════════════════════════════════════════════════

  // Admin: Get all campaigns
  adminList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(popupCampaigns).orderBy(popupCampaigns.id);
  }),

  // Admin: Create campaign
  create: adminMutation
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["welcome", "time", "discount", "exit", "scroll", "branch", "event"]),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        isActive: z.boolean().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        startHour: z.number().min(0).max(23).optional(),
        endHour: z.number().min(0).max(23).optional(),
        placement: z.enum(["all", "homepage", "qr", "homepage+qr"]).optional(),
        branch: z.string().optional(),
        lang: z.string().optional(),
        frequency: z.number().min(1).optional(),
        delay: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(popupCampaigns).values({
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      });
      return { success: true };
    }),

  // Admin: Update campaign
  update: adminMutation
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(["welcome", "time", "discount", "exit", "scroll", "branch", "event"]).optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        isActive: z.boolean().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        startHour: z.number().min(0).max(23).optional(),
        endHour: z.number().min(0).max(23).optional(),
        placement: z.enum(["all", "homepage", "qr", "homepage+qr"]).optional(),
        branch: z.string().optional(),
        lang: z.string().optional(),
        frequency: z.number().min(1).optional(),
        delay: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      const updateData: Record<string, unknown> = { ...data };
      if (data.startDate !== undefined) {
        updateData.startDate = data.startDate ? new Date(data.startDate) : null;
      }
      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate ? new Date(data.endDate) : null;
      }

      await db
        .update(popupCampaigns)
        .set(updateData)
        .where(eq(popupCampaigns.id, id));
      return { success: true };
    }),

  // Admin: Delete campaign
  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete views and clicks first
      await db.delete(popupViews).where(eq(popupViews.campaignId, input.id));
      await db.delete(popupClicks).where(eq(popupClicks.campaignId, input.id));
      // Delete campaign
      await db.delete(popupCampaigns).where(eq(popupCampaigns.id, input.id));
      return { success: true };
    }),

  // Admin: Toggle active status
  toggleActive: adminMutation
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(popupCampaigns)
        .set({ isActive: input.isActive })
        .where(eq(popupCampaigns.id, input.id));
      return { success: true };
    }),

  // Admin: Get campaign stats (views + clicks)
  stats: adminQuery
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const viewRows = await db
        .select({ count: count() })
        .from(popupViews)
        .where(eq(popupViews.campaignId, input.campaignId));
      const clickRows = await db
        .select({ count: count() })
        .from(popupClicks)
        .where(eq(popupClicks.campaignId, input.campaignId));
      return {
        views: viewRows[0]?.count ?? 0,
        clicks: clickRows[0]?.count ?? 0,
      };
    }),
});
