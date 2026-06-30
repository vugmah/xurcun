import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { trackingSettings } from "../../db/schema";
import { eq } from "drizzle-orm";

// Conversions API endpoint
export const trackingRouter = createRouter({
  // Public: Get all tracking settings as key-value map (safe to expose)
  getPublic: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(trackingSettings);
    // These MUST match the DB keys the admin writes (SettingsPage dbKeyMap)
    // and the public reader (trackingSettings.ts keyMap). A mismatch silently
    // drops the value before it reaches the site.
    const publicKeys = [
      "meta_pixel_id",
      "enable_meta_pixel",
      "meta_domain_verification",
      "gtm_container_id",
      "ga4_measurement_id",
      "google_ads_id",
    ];
    const result: Record<string, string> = {};
    for (const row of rows) {
      if (publicKeys.includes(row.key)) {
        result[row.key] = row.value ?? "";
      }
    }
    return result;
  }),

  // Admin: Get all tracking settings
  adminGetAll: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(trackingSettings);
  }),

  // Admin: Get single tracking setting
  adminGetByKey: adminQuery
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(trackingSettings)
        .where(eq(trackingSettings.key, input.key));
      return rows[0] ?? null;
    }),

  // Admin: Upsert tracking setting
  upsert: adminMutation
    .input(z.object({
      key: z.string().min(1),
      value: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(trackingSettings)
        .where(eq(trackingSettings.key, input.key));

      if (existing.length > 0) {
        await db
          .update(trackingSettings)
          .set({ value: input.value })
          .where(eq(trackingSettings.key, input.key));
      } else {
        await db.insert(trackingSettings).values(input);
      }
      return { success: true };
    }),

  // Admin: Bulk upsert
  bulkUpsert: adminMutation
    .input(z.array(z.object({
      key: z.string().min(1),
      value: z.string(),
    })))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        const existing = await db
          .select()
          .from(trackingSettings)
          .where(eq(trackingSettings.key, item.key));
        if (existing.length > 0) {
          await db
            .update(trackingSettings)
            .set({ value: item.value })
            .where(eq(trackingSettings.key, item.key));
        } else {
          await db.insert(trackingSettings).values(item);
        }
      }
      return { success: true };
    }),

  // Admin: Delete tracking setting
  delete: adminMutation
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(trackingSettings).where(eq(trackingSettings.key, input.key));
      return { success: true };
    }),

  // Public: Meta Conversions API proxy
  metaConversion: publicQuery
    .input(z.object({
      eventName: z.string(),
      eventTime: z.number(),
      eventSourceUrl: z.string(),
      actionSource: z.string().default("website"),
      eventId: z.string(),
      userData: z.record(z.string(), z.string()).optional(),
      customData: z.record(z.string(), z.any()).optional(),
      testEventCode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const pixelId = process.env.META_PIXEL_ID;
      const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

      if (!pixelId || !accessToken) {
        return { success: false, error: "CAPI not configured" };
      }

      const url = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

      const payload: Record<string, unknown> = {
        data: [{
          event_name: input.eventName,
          event_time: input.eventTime,
          event_source_url: input.eventSourceUrl,
          action_source: input.actionSource,
          event_id: input.eventId,
          user_data: input.userData ?? {},
          custom_data: input.customData ?? {},
        }],
      };

      if (input.testEventCode) {
        payload.test_event_code = input.testEventCode;
      }

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        return { success: res.ok, data: json };
      } catch {
        return { success: false, error: "Network error" };
      }
    }),
});
