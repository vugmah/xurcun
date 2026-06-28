/**
 * Rate Limiting Middleware
 * In-memory store with sliding window
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 600_000);

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function rateLimit(config: RateLimitConfig) {
  return {
    check: (identifier: string): { allowed: boolean; retryAfter: number } => {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || entry.resetTime < now) {
        store.set(identifier, {
          count: 1,
          resetTime: now + config.windowMs,
        });
        return { allowed: true, retryAfter: 0 };
      }

      if (entry.count >= config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, retryAfter };
      }

      entry.count++;
      return { allowed: true, retryAfter: 0 };
    },
  };
}

// Pre-configured rate limiters
export const loginLimiter = rateLimit({ maxRequests: 5, windowMs: 15 * 60_000 }); // 5 per 15 min
export const contactLimiter = rateLimit({ maxRequests: 5, windowMs: 10 * 60_000 }); // 5 per 10 min
export const uploadLimiter = rateLimit({ maxRequests: 10, windowMs: 10 * 60_000 }); // 10 per 10 min
export const adminLimiter = rateLimit({ maxRequests: 100, windowMs: 60_000 }); // 100 per 1 min
// Generous cap for public analytics writes (popup views/clicks, Meta CAPI) — high
// enough for real traffic, low enough to stop a script hammering the DB / Facebook.
export const trackingLimiter = rateLimit({ maxRequests: 200, windowMs: 10 * 60_000 }); // 200 per 10 min
