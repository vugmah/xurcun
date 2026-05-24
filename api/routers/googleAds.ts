import { z } from "zod";
import { createRouter, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import {
  googleAdsSettings,
  googleAdsCampaigns,
  googleAdsAdGroups,
  googleAdsAds,
  googleAdsKeywords,
  googleAdsSchedules,
  googleAdsConversions,
} from "../../db/schema";
import { eq, desc, sql } from "drizzle-orm";
import * as adsApi from "../services/googleAds";

export const googleAdsRouter = createRouter({
  /* ═══════════════════════════════════════════
     STATUS
     ═══════════════════════════════════════════ */
  getStatus: adminQuery.query(async () => {
    const db = getDb();
    const settings = await db.select().from(googleAdsSettings).limit(1);
    const isApiReady = adsApi.isConfigured();

    let accountInfo = null;
    if (isApiReady) {
      accountInfo = await adsApi.getAccountInfo();
    }

    // Count stats
    const [campaignCount] = await db.select({ count: sql<number>`count(*)` }).from(googleAdsCampaigns);
    const [adGroupCount] = await db.select({ count: sql<number>`count(*)` }).from(googleAdsAdGroups);
    const [adCount] = await db.select({ count: sql<number>`count(*)` }).from(googleAdsAds);
    const [keywordCount] = await db.select({ count: sql<number>`count(*)` }).from(googleAdsKeywords);
    const [conversionCount] = await db.select({ count: sql<number>`count(*)` }).from(googleAdsConversions);

    return {
      apiConfigured: isApiReady,
      dbConfigured: settings.length > 0 && settings[0].isActive,
      accountInfo,
      counts: {
        campaigns: campaignCount?.count ?? 0,
        adGroups: adGroupCount?.count ?? 0,
        ads: adCount?.count ?? 0,
        keywords: keywordCount?.count ?? 0,
        conversions: conversionCount?.count ?? 0,
      },
    };
  }),

  /* ═══════════════════════════════════════════
     SETTINGS
     ═══════════════════════════════════════════ */
  getSettings: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(googleAdsSettings).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      clientId: r.clientId,
      developerToken: r.developerToken,
      loginCustomerId: r.loginCustomerId,
      isActive: r.isActive,
    };
  }),

  upsertSettings: adminMutation
    .input(z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
      developerToken: z.string().optional(),
      loginCustomerId: z.string().optional(),
      refreshToken: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(googleAdsSettings).limit(1);
      if (existing.length > 0) {
        await db.update(googleAdsSettings).set(input).where(eq(googleAdsSettings.id, existing[0].id));
      } else {
        await db.insert(googleAdsSettings).values({ ...input, isActive: input.isActive ?? false });
      }
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     CAMPAIGNS
     ═══════════════════════════════════════════ */
  listCampaigns: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(googleAdsCampaigns).orderBy(desc(googleAdsCampaigns.id));
  }),

  createCampaign: adminMutation
    .input(z.object({
      name: z.string().min(1),
      type: z.string().optional(),
      dailyBudget: z.string().optional(),
      biddingStrategy: z.string().optional(),
      budget: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(googleAdsCampaigns).values({ ...input, status: "PAUSED" });
      return { success: true };
    }),

  updateCampaign: adminMutation
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.string().optional(),
      status: z.string().optional(),
      dailyBudget: z.string().optional(),
      biddingStrategy: z.string().optional(),
      budget: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(googleAdsCampaigns).set(data).where(eq(googleAdsCampaigns.id, id));
      return { success: true };
    }),

  deleteCampaign: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsCampaigns).where(eq(googleAdsCampaigns.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     AD GROUPS
     ═══════════════════════════════════════════ */
  listAdGroups: adminQuery
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(googleAdsAdGroups)
        .where(eq(googleAdsAdGroups.campaignId, input.campaignId))
        .orderBy(desc(googleAdsAdGroups.id));
    }),

  createAdGroup: adminMutation
    .input(z.object({
      campaignId: z.number(),
      name: z.string().min(1),
      type: z.string().optional(),
      cpcBid: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(googleAdsAdGroups).values({ ...input, status: "PAUSED" });
      return { success: true };
    }),

  updateAdGroup: adminMutation
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.string().optional(),
      cpcBid: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(googleAdsAdGroups).set(data).where(eq(googleAdsAdGroups.id, id));
      return { success: true };
    }),

  deleteAdGroup: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsAdGroups).where(eq(googleAdsAdGroups.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     ADS
     ═══════════════════════════════════════════ */
  listAds: adminQuery
    .input(z.object({ adGroupId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(googleAdsAds)
        .where(eq(googleAdsAds.adGroupId, input.adGroupId))
        .orderBy(desc(googleAdsAds.id));
    }),

  createAd: adminMutation
    .input(z.object({
      adGroupId: z.number(),
      type: z.string(),
      headline1: z.string().optional(),
      headline2: z.string().optional(),
      headline3: z.string().optional(),
      description1: z.string().optional(),
      description2: z.string().optional(),
      finalUrl: z.string().optional(),
      callToAction: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(googleAdsAds).values({ ...input, status: "PAUSED" });
      return { success: true };
    }),

  updateAd: adminMutation
    .input(z.object({
      id: z.number(),
      headline1: z.string().optional(),
      headline2: z.string().optional(),
      headline3: z.string().optional(),
      description1: z.string().optional(),
      description2: z.string().optional(),
      finalUrl: z.string().optional(),
      callToAction: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(googleAdsAds).set(data).where(eq(googleAdsAds.id, id));
      return { success: true };
    }),

  deleteAd: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsAds).where(eq(googleAdsAds.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     KEYWORDS
     ═══════════════════════════════════════════ */
  listKeywords: adminQuery
    .input(z.object({ adGroupId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(googleAdsKeywords)
        .where(eq(googleAdsKeywords.adGroupId, input.adGroupId))
        .orderBy(desc(googleAdsKeywords.id));
    }),

  createKeyword: adminMutation
    .input(z.object({
      adGroupId: z.number(),
      keyword: z.string().min(1),
      matchType: z.string(),
      cpcBid: z.string().optional(),
      finalUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(googleAdsKeywords).values({ ...input, status: "PAUSED" });
      return { success: true };
    }),

  updateKeyword: adminMutation
    .input(z.object({
      id: z.number(),
      keyword: z.string().optional(),
      matchType: z.string().optional(),
      cpcBid: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(googleAdsKeywords).set(data).where(eq(googleAdsKeywords.id, id));
      return { success: true };
    }),

  deleteKeyword: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsKeywords).where(eq(googleAdsKeywords.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     SCHEDULES
     ═══════════════════════════════════════════ */
  listSchedules: adminQuery
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(googleAdsSchedules)
        .where(eq(googleAdsSchedules.campaignId, input.campaignId))
        .orderBy(googleAdsSchedules.dayOfWeek, googleAdsSchedules.startHour);
    }),

  createSchedule: adminMutation
    .input(z.object({
      campaignId: z.number(),
      dayOfWeek: z.string(),
      startHour: z.number().min(0).max(23),
      endHour: z.number().min(0).max(23),
      bidModifier: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(googleAdsSchedules).values(input);
      return { success: true };
    }),

  deleteSchedule: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsSchedules).where(eq(googleAdsSchedules.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     CONVERSIONS
     ═══════════════════════════════════════════ */
  listConversions: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(googleAdsConversions).orderBy(desc(googleAdsConversions.id));
  }),

  createConversion: adminMutation
    .input(z.object({
      name: z.string().min(1),
      category: z.string().optional(),
      value: z.string().optional(),
      countType: z.string().optional(),
      count: z.string().optional(),
      googleEvent: z.string().optional(),
      metaEvent: z.string().optional(),
      gtmTrigger: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { countType, ...rest } = input;
      await db.insert(googleAdsConversions).values({ ...rest, count: countType });
      return { success: true };
    }),

  updateConversion: adminMutation
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.string().optional(),
      value: z.string().optional(),
      countType: z.string().optional(),
      status: z.string().optional(),
      googleEvent: z.string().optional(),
      metaEvent: z.string().optional(),
      gtmTrigger: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(googleAdsConversions).set(data).where(eq(googleAdsConversions.id, id));
      return { success: true };
    }),

  deleteConversion: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(googleAdsConversions).where(eq(googleAdsConversions.id, input.id));
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     GOOGLE ADS API PROXY (sync from real API)
     ═══════════════════════════════════════════ */
  syncCampaignsFromApi: adminQuery.query(async () => {
    if (!adsApi.isConfigured()) return { synced: false, error: "Google Ads API not configured" };
    const result = await adsApi.listCampaigns();
    return { synced: true, data: result };
  }),

  syncMetricsFromApi: adminQuery
    .input(z.object({ campaignIds: z.array(z.string()).optional() }))
    .query(async ({ input }) => {
      if (!adsApi.isConfigured()) return { synced: false, error: "Google Ads API not configured" };
      const result = await adsApi.getMetrics(input.campaignIds);
      return { synced: true, data: result };
    }),
});
