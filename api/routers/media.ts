import { z } from "zod";
import { createRouter, publicQuery, adminMutation } from "../middleware";
import { env } from "../lib/env";

/* ═══ Node.js 20 WebSocket polyfill (no ws dependency) ═══ */
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class MockWebSocket {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
    get readyState() { return 3; /* CLOSED */ }
    static CONNECTING = 0; static OPEN = 1; static CLOSING = 2; static CLOSED = 3;
  };
}

/* ═══ Supabase Storage upload — persistent cloud storage ═══ */

let supabaseClient: any = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!env.supabaseUrl || !env.supabaseServiceKey) return null;

  try {
    const { createClient } = require("@supabase/supabase-js");
    supabaseClient = createClient(env.supabaseUrl, env.supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      // No realtime — REST-only for Storage operations
    });
    return supabaseClient;
  } catch (err: any) {
    console.error("[Media] Supabase init failed:", err.message);
    return null; // Graceful fallback — media returns empty list
  }
}

function isConfigured() {
  return !!env.supabaseUrl && !!env.supabaseServiceKey;
}

export const mediaRouter = createRouter({
  /* ─── Upload image to Supabase Storage ─── */
  uploadImage: adminMutation
    .input(
      z.object({
        base64: z.string(),
        folder: z.string().default("menu"),
        fileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        return { success: false, error: "SUPABASE_NOT_CONFIGURED", url: null };
      }

      const sb = getSupabase();
      if (!sb) {
        return { success: false, error: "SUPABASE_INIT_FAILED", url: null };
      }

      try {
        /* Parse base64 */
        const match = input.base64.match(/^data:(.+);base64,(.+)$/);
        if (!match) {
          return { success: false, error: "INVALID_BASE64", url: null };
        }

        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        const ext = mimeType.split("/")[1] || "png";
        const name = input.fileName || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const path = `${input.folder}/${name}`;

        /* Upload to Supabase Storage */
        const { data, error } = await sb.storage
          .from(env.supabaseBucket)
          .upload(path, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (error) {
          console.error("[Supabase upload] error:", error);
          return { success: false, error: error.message, url: null };
        }

        /* Get public URL */
        const { data: urlData } = sb.storage
          .from(env.supabaseBucket)
          .getPublicUrl(path);

        return {
          success: true,
          error: null,
          url: urlData.publicUrl,
          path: data?.path || path,
        };
      } catch (err: any) {
        console.error("[Media upload] exception:", err);
        const msg = err.message || "UPLOAD_FAILED";
        if (msg === "fetch failed" && err.cause?.code === "ENOTFOUND") {
          return { success: false, error: "SUPABASE_HOST_UNREACHABLE — check SUPABASE_URL", url: null };
        }
        return { success: false, error: msg, url: null };
      }
    }),

  /* ─── Delete image from Supabase Storage ─── */
  deleteImage: adminMutation
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      if (!isConfigured()) {
        return { success: false, error: "SUPABASE_NOT_CONFIGURED" };
      }

      const sb = getSupabase();
      if (!sb) return { success: false, error: "SUPABASE_INIT_FAILED" };

      try {
        const { error } = await sb.storage
          .from(env.supabaseBucket)
          .remove([input.path]);

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, error: null };
      } catch (err: any) {
        console.error("[Media] deleteImage error:", err.message);
        const msg = err.message || "DELETE_FAILED";
        if (msg === "fetch failed" && err.cause?.code === "ENOTFOUND") {
          return { success: false, error: "SUPABASE_HOST_UNREACHABLE — check SUPABASE_URL" };
        }
        return { success: false, error: msg };
      }
    }),

  /* ─── List images in a folder ─── */
  listImages: publicQuery
    .input(z.object({ folder: z.string().default("menu") }).optional())
    .query(async ({ input }) => {
      if (!isConfigured()) {
        return { images: [], error: "SUPABASE_NOT_CONFIGURED" };
      }

      const sb = getSupabase();
      if (!sb) return { images: [], error: "SUPABASE_INIT_FAILED" };

      try {
        const { data, error } = await sb.storage
          .from(env.supabaseBucket)
          .list(input?.folder || "menu", { limit: 100 });

        if (error) {
          return { images: [], error: error.message };
        }

        const images = (data || [])
          .filter((f: any) => f.name !== ".emptyFolderPlaceholder")
          .map((f: any) => {
            const path = `${input?.folder || "menu"}/${f.name}`;
            const { data: urlData } = sb.storage
              .from(env.supabaseBucket)
              .getPublicUrl(path);
            return {
              name: f.name,
              path,
              url: urlData.publicUrl,
              size: f.metadata?.size || 0,
              createdAt: f.created_at,
            };
          });

        return { images, error: null };
      } catch (err: any) {
        console.error("[Media] listImages error:", err.message);
        const msg = err.message || "STORAGE_LIST_FAILED";
        if (msg === "fetch failed" && err.cause?.code === "ENOTFOUND") {
          return { images: [], error: "SUPABASE_HOST_UNREACHABLE — check SUPABASE_URL" };
        }
        return { images: [], error: msg };
      }
    }),

  /* ─── Check configuration status ─── */
  status: publicQuery.query(() => {
    return {
      configured: isConfigured(),
      bucket: env.supabaseBucket,
      url: env.supabaseUrl ? "set" : "missing",
      key: env.supabaseServiceKey ? "set" : "missing",
    };
  }),
});
