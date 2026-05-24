import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { loginLimiter, contactLimiter, uploadLimiter, adminLimiter } from "./middleware/rateLimit";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;
export const publicMutation = t.procedure;

// Admin procedure - requires admin key + rate limit
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;
if (!ADMIN_SECRET) {
  throw new Error("ADMIN_SECRET_KEY environment variable is required");
}

export const adminQuery = t.procedure.use(async ({ ctx, next }) => {
  const adminKey = ctx.req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== ADMIN_SECRET) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  const ip = ctx.req.headers.get("x-forwarded-for") || "unknown";
  const result = adminLimiter.check(`admin-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
});

export const adminMutation = t.procedure.use(async ({ ctx, next }) => {
  const adminKey = ctx.req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== ADMIN_SECRET) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  const ip = ctx.req.headers.get("x-forwarded-for") || "unknown";
  const result = adminLimiter.check(`admin-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
});

// Public rate-limited procedures
export const rateLimitedQuery = t.procedure.use(async ({ ctx, next }) => {
  const ip = ctx.req.headers.get("x-forwarded-for") || "unknown";
  const result = contactLimiter.check(`public-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
});

export const rateLimitedMutation = t.procedure.use(async ({ ctx, next }) => {
  const ip = ctx.req.headers.get("x-forwarded-for") || "unknown";
  const result = contactLimiter.check(`public-${ip}`);
  if (!result.allowed) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Rate limited. Retry after ${result.retryAfter}s` });
  }
  return next();
});
