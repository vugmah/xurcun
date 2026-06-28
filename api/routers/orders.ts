import { z } from "zod";
import { createRouter, adminQuery, adminMutation, rateLimitedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, orderItems } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const STATUS = ["new", "contacted", "completed", "cancelled"] as const;

const itemInput = z.object({
  itemId: z.number().optional(),
  name: z.string().min(1).max(200),
  qty: z.number().int().min(1).default(1),
  price: z.string().max(50).optional(),
});

type OrderInput = {
  customerName?: string;
  customerPhone?: string;
  note?: string;
  source: string;
  lang?: string;
  total?: string;
  items: { itemId?: number; name: string; qty?: number; price?: string }[];
};

async function insertOrder(input: OrderInput) {
  const db = getDb();
  const res = await db.insert(orders).values({
    status: "new",
    source: input.source,
    customerName: input.customerName || null,
    customerPhone: input.customerPhone || null,
    note: input.note || null,
    total: input.total || null,
    lang: input.lang || "az",
  });
  // drizzle/mysql2 returns [ResultSetHeader, ...]; be defensive about the shape.
  const orderId = Number((res as any)?.[0]?.insertId ?? (res as any)?.insertId);
  if (input.items?.length && orderId) {
    await db.insert(orderItems).values(
      input.items.map((it) => ({
        orderId,
        itemId: it.itemId ?? null,
        name: it.name,
        qty: it.qty ?? 1,
        price: it.price ?? null,
      })),
    );
  }
  return { success: true, id: orderId };
}

export const ordersRouter = createRouter({
  // Admin: list all orders (optionally by status), newest first
  adminList: adminQuery
    .input(z.object({ status: z.enum(STATUS).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      if (input?.status) {
        return db.select().from(orders).where(eq(orders.status, input.status)).orderBy(desc(orders.id));
      }
      return db.select().from(orders).orderBy(desc(orders.id));
    }),

  // Admin: one order + its line items
  adminGet: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [order] = await db.select().from(orders).where(eq(orders.id, input.id)).limit(1);
      if (!order) return null;
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.id)).orderBy(orderItems.id);
      return { order, items };
    }),

  // Admin: create an order manually
  create: adminMutation
    .input(z.object({
      customerName: z.string().max(200).optional(),
      customerPhone: z.string().max(50).optional(),
      note: z.string().max(2000).optional(),
      source: z.enum(["manual", "catalog", "corporate"]).default("manual"),
      lang: z.string().max(5).optional(),
      total: z.string().max(50).optional(),
      items: z.array(itemInput).max(100).default([]),
    }))
    .mutation(({ input }) => insertOrder(input)),

  // Public: capture an order from the storefront (rate-limited)
  submit: rateLimitedMutation
    .input(z.object({
      customerName: z.string().max(200).optional(),
      customerPhone: z.string().max(50).optional(),
      note: z.string().max(2000).optional(),
      source: z.enum(["catalog", "corporate"]).default("catalog"),
      lang: z.string().max(5).optional(),
      total: z.string().max(50).optional(),
      items: z.array(itemInput).max(100).default([]),
    }))
    .mutation(({ input }) => insertOrder(input)),

  updateStatus: adminMutation
    .input(z.object({ id: z.number(), status: z.enum(STATUS) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status, updatedAt: new Date() }).where(eq(orders.id, input.id));
      return { success: true };
    }),

  delete: adminMutation
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(orderItems).where(eq(orderItems.orderId, input.id));
      await db.delete(orders).where(eq(orders.id, input.id));
      return { success: true };
    }),
});
