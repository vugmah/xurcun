/**
 * Meta Conversions API (CAPI) Router
 * Server-side event forwarding to Meta for deduplication with browser Pixel
 */
import { z } from "zod";
import { createRouter, publicMutation } from "../middleware";
import { createHash } from "crypto";

function sha256(str: string): string {
  return createHash("sha256").update(str.toLowerCase().trim()).digest("hex");
}

export const metaCapiRouter = createRouter({
  sendEvent: publicMutation
    .input(z.object({
      eventName: z.string(),
      eventTime: z.number(),
      eventSourceUrl: z.string(),
      eventId: z.string(),
      actionSource: z.string().default("website"),
      userData: z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        clientIpAddress: z.string().optional(),
        clientUserAgent: z.string().optional(),
        fbp: z.string().optional(),
        fbc: z.string().optional(),
      }).optional(),
      customData: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Only process if meta tracking is enabled
      const pixelId = process.env.META_PIXEL_ID;
      const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

      if (!pixelId || !accessToken) {
        return { success: false, error: "Meta CAPI not configured" };
      }

      const payload: Record<string, unknown> = {
        data: [{
          event_name: input.eventName,
          event_time: input.eventTime,
          event_source_url: input.eventSourceUrl,
          event_id: input.eventId,
          action_source: input.actionSource,
          user_data: {
            ...(input.userData?.email ? { em: sha256(input.userData.email) } : {}),
            ...(input.userData?.phone ? { ph: sha256(input.userData.phone) } : {}),
            ...(input.userData?.clientIpAddress ? { client_ip_address: input.userData.clientIpAddress } : {}),
            ...(input.userData?.clientUserAgent ? { client_user_agent: input.userData.clientUserAgent } : {}),
            ...(input.userData?.fbp ? { fbp: input.userData.fbp } : {}),
            ...(input.userData?.fbc ? { fbc: input.userData.fbc } : {}),
          },
          custom_data: input.customData ?? {},
        }],
      };

      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();
        return { success: true, result };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }),
});
