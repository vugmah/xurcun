import { createHash, timingSafeEqual } from "node:crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "";

/**
 * Real client IP. Behind Cloudflare, `CF-Connecting-IP` is the only trustworthy
 * source — `X-Forwarded-For` is appendable by the client and was spoofable.
 */
export function clientIp(get: (name: string) => string | null | undefined): string {
  const cf = get("cf-connecting-ip");
  if (cf) return cf;
  const xff = get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "unknown";
}

/**
 * Constant-time admin-key check. Both sides are SHA-256 hashed to fixed 32-byte
 * buffers so timingSafeEqual never throws on length mismatch and length isn't leaked.
 */
export function verifyAdminKey(provided: string | null | undefined): boolean {
  if (!provided || !ADMIN_SECRET) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(ADMIN_SECRET).digest();
  return timingSafeEqual(a, b);
}
