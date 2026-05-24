import { relations } from "drizzle-orm";
import {
  menuCategories,
  menuItems,
  menuItemBranches,
  branches,
  popupCampaigns,
  popupViews,
  popupClicks,
  googleAdsCampaigns,
  googleAdsAdGroups,
  googleAdsAds,
  googleAdsKeywords,
  googleAdsSchedules,
  badgeRecommendations,
  approvedBadges,
  menuEvents,
} from "./schema";

// ═══════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════

export const menuCategoryRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemRelations = relations(menuItems, ({ one, many }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  branches: many(menuItemBranches),
  events: many(menuEvents),
  badgeRecommendations: many(badgeRecommendations),
  approvedBadges: many(approvedBadges),
}));

// ═══════════════════════════════════════════════════════
// BRANCHES
// ═══════════════════════════════════════════════════════

export const branchRelations = relations(branches, ({ many }) => ({
  menuItems: many(menuItemBranches),
}));

export const menuItemBranchRelations = relations(menuItemBranches, ({ one }) => ({
  branch: one(branches, {
    fields: [menuItemBranches.branchId],
    references: [branches.id],
  }),
  menuItem: one(menuItems, {
    fields: [menuItemBranches.menuItemId],
    references: [menuItems.id],
  }),
}));

// ═══════════════════════════════════════════════════════
// POPUP CAMPAIGNS
// ═══════════════════════════════════════════════════════

export const popupCampaignRelations = relations(popupCampaigns, ({ many }) => ({
  views: many(popupViews),
  clicks: many(popupClicks),
}));

export const popupViewRelations = relations(popupViews, ({ one }) => ({
  campaign: one(popupCampaigns, {
    fields: [popupViews.campaignId],
    references: [popupCampaigns.id],
  }),
}));

export const popupClickRelations = relations(popupClicks, ({ one }) => ({
  campaign: one(popupCampaigns, {
    fields: [popupClicks.campaignId],
    references: [popupCampaigns.id],
  }),
}));

// ═══════════════════════════════════════════════════════
// GOOGLE ADS
// ═══════════════════════════════════════════════════════

export const googleAdsCampaignRelations = relations(googleAdsCampaigns, ({ many }) => ({
  adGroups: many(googleAdsAdGroups),
  schedules: many(googleAdsSchedules),
}));

export const googleAdsAdGroupRelations = relations(googleAdsAdGroups, ({ one, many }) => ({
  campaign: one(googleAdsCampaigns, {
    fields: [googleAdsAdGroups.campaignId],
    references: [googleAdsCampaigns.id],
  }),
  ads: many(googleAdsAds),
  keywords: many(googleAdsKeywords),
}));

export const googleAdsAdRelations = relations(googleAdsAds, ({ one }) => ({
  adGroup: one(googleAdsAdGroups, {
    fields: [googleAdsAds.adGroupId],
    references: [googleAdsAdGroups.id],
  }),
}));

export const googleAdsKeywordRelations = relations(googleAdsKeywords, ({ one }) => ({
  adGroup: one(googleAdsAdGroups, {
    fields: [googleAdsKeywords.adGroupId],
    references: [googleAdsAdGroups.id],
  }),
}));

export const googleAdsScheduleRelations = relations(googleAdsSchedules, ({ one }) => ({
  campaign: one(googleAdsCampaigns, {
    fields: [googleAdsSchedules.campaignId],
    references: [googleAdsCampaigns.id],
  }),
}));

// ═══════════════════════════════════════════════════════
// AI MENU INTELLIGENCE
// ═══════════════════════════════════════════════════════

export const menuEventRelations = relations(menuEvents, ({ one }) => ({
  item: one(menuItems, {
    fields: [menuEvents.itemId],
    references: [menuItems.id],
  }),
}));

export const badgeRecommendationRelations = relations(badgeRecommendations, ({ one }) => ({
  item: one(menuItems, {
    fields: [badgeRecommendations.itemId],
    references: [menuItems.id],
  }),
}));

export const approvedBadgeRelations = relations(approvedBadges, ({ one }) => ({
  item: one(menuItems, {
    fields: [approvedBadges.itemId],
    references: [menuItems.id],
  }),
}));
