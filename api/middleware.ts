import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { loginLimiter, contactLimiter, adminLimiter, trackingLimiter } from "./middleware/rateLimit";
import { clientIp, verifyAdminKey } from "./lib/adminAuth";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const publicMutation = t.procedure;

// Fail fast at startup if the admin secret isn't configured.
if (!process.env.ADMIN_SECRET_KEY) {
  throw new Error("ADMIN_SECRET_KEY environment variable is required");
}

// Shared admin gate: constant-time key check, brute-force throttle on failures,
// then the normal admin rate limit. Used by both admin queries and mutations.
async function adminGate(ctx: TrpcContext, next: () => any) {
  const ip = clientIp((n) => ctx.req.headers.get(n));
  if (!verifyAdminKey(ctx.req.headers.get("x-admin-key"))) {
    // Throttle wrong-key attempts (5 per 15 min) to blunt brute force.
    const fail = loginLimiter.check(`admin-fail-${ip}`);
    if (!fail.allowed) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many attempts. Retry after ${fail.retryAfter}s` });
    }
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  const result = adminLimiter.check(`admin-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
}

export const adminQuery = t.procedure.use(({ ctx, next }) => adminGate(ctx, next));
export const adminMutation = t.procedure.use(({ ctx, next }) => adminGate(ctx, next));

// Public rate-limited procedures (5 per 10 min per real IP).
function publicGate(ctx: TrpcContext, next: () => any) {
  const ip = clientIp((n) => ctx.req.headers.get(n));
  const result = contactLimiter.check(`public-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
}

export const rateLimitedQuery = t.procedure.use(({ ctx, next }) => publicGate(ctx, next));
export const rateLimitedMutation = t.procedure.use(({ ctx, next }) => publicGate(ctx, next));

// Public analytics writes (popup view/click, Meta CAPI) — generous per-IP cap.
export const trackingMutation = t.procedure.use(({ ctx, next }) => {
  const ip = clientIp((n) => ctx.req.headers.get(n));
  const result = trackingLimiter.check(`track-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
});
