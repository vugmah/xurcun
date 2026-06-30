import { z } from "zod";
import { createRouter, publicQuery, adminQuery, adminMutation, rateLimitedMutation } from "../middleware";
import { getDb } from "../queries/connection";
import { mailSettings, cpanelConfig, smtpSettings, contactEmails } from "../../db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import {
  isCpanelConfigured,
  listMailAccounts,
  createMailAccount,
  deleteMailAccount,
  changeMailPassword,
  changeMailQuota,
  getCpanelDomain,
} from "../services/cpanel";

export const mailRouter = createRouter({
  /* ═══════════════════════════════════════════
     PUBLIC: Website Contact Emails
     ═══════════════════════════════════════════ */

  getContactEmails: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(mailSettings);
    const defaults: Record<string, string> = {
      infoEmail: "info@xurcun.az",
      supportEmail: "support@xurcun.az",
      marketingEmail: "marketing@xurcun.az",
      hrEmail: "hr@xurcun.az",
      complaintsEmail: "complaints@xurcun.az",
    };
    for (const row of rows) {
      if (row.key in defaults) defaults[row.key] = row.value ?? defaults[row.key];
    }
    return defaults;
  }),

  /* ═══════════════════════════════════════════
     ADMIN: Contact Emails CRUD
     ═══════════════════════════════════════════ */

  adminGetContactEmails: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(mailSettings).limit(1);
    return rows[0] ?? null;
  }),

  upsertContactEmails: adminMutation
    .input(z.object({
      infoEmail: z.string().email().optional(),
      supportEmail: z.string().email().optional(),
      marketingEmail: z.string().email().optional(),
      hrEmail: z.string().email().optional(),
      complaintsEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        const existing = await db.select().from(mailSettings).where(eq(mailSettings.key, key));
        if (existing.length > 0) {
          await db.update(mailSettings).set({ value }).where(eq(mailSettings.key, key));
        } else {
          await db.insert(mailSettings).values({ key, value });
        }
      }
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     ADMIN: cPanel Config
     ═══════════════════════════════════════════ */

  getCpanelStatus: adminQuery.query(async () => {
    const db = getDb();
    const configured = isCpanelConfigured();
    const saved = await db.select().from(cpanelConfig).limit(1);
    return {
      envConfigured: configured,
      savedConfig: saved[0] ?? null,
      domain: getCpanelDomain(),
    };
  }),

  upsertCpanelConfig: adminMutation
    .input(z.object({
      baseUrl: z.string().url().optional(),
      username: z.string().optional(),
      apiToken: z.string().optional(),
      domain: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(cpanelConfig).limit(1);
      if (existing.length > 0) {
        await db.update(cpanelConfig).set(input).where(eq(cpanelConfig.id, existing[0].id));
      } else {
        await db.insert(cpanelConfig).values({ ...input, isActive: input.active ?? true });
      }
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     ADMIN: cPanel Mail Accounts
     ═══════════════════════════════════════════ */

  listMailAccounts: adminQuery.query(async () => {
    if (!isCpanelConfigured()) return { accounts: [], cpanelReady: false };
    try {
      const accounts = await listMailAccounts();
      return { accounts, cpanelReady: true };
    } catch (err) {
      return {
        accounts: [],
        cpanelReady: false,
        error: err instanceof Error ? err.message : "cPanel connection failed",
      };
    }
  }),

  createMailAccount: adminMutation
    .input(z.object({
      username: z.string().min(1),
      password: z.string().min(6),
      quotaMb: z.number().int().min(0).optional(),
    }))
    .mutation(async ({ input }) => {
      if (!isCpanelConfigured()) {
        throw new Error("cPanel not configured");
      }
      return createMailAccount(input.username, input.password, input.quotaMb ?? 0);
    }),

  deleteMailAccount: adminMutation
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      if (!isCpanelConfigured()) {
        throw new Error("cPanel not configured");
      }
      return deleteMailAccount(input.email);
    }),

  changeMailPassword: adminMutation
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      if (!isCpanelConfigured()) {
        throw new Error("cPanel not configured");
      }
      return changeMailPassword(input.email, input.password);
    }),

  changeMailQuota: adminMutation
    .input(z.object({
      email: z.string().email(),
      quotaMb: z.number().int().min(0),
    }))
    .mutation(async ({ input }) => {
      if (!isCpanelConfigured()) {
        throw new Error("cPanel not configured");
      }
      return changeMailQuota(input.email, input.quotaMb);
    }),

  /* ═══════════════════════════════════════════
     ADMIN: SMTP Settings
     ═══════════════════════════════════════════ */

  getSmtpSettings: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(smtpSettings).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      host: r.host,
      port: r.port,
      username: r.username,
      secure: r.secure,
      fromEmail: r.fromEmail,
      fromName: r.fromName,
      isActive: r.isActive,
    };
  }),

  upsertSmtpSettings: adminMutation
    .input(z.object({
      host: z.string().optional(),
      port: z.number().int().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      secure: z.boolean().optional(),
      fromEmail: z.string().email().optional(),
      fromName: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(smtpSettings).limit(1);
      if (existing.length > 0) {
        await db.update(smtpSettings).set(input).where(eq(smtpSettings.id, existing[0].id));
      } else {
        await db.insert(smtpSettings).values({ ...input, isActive: input.active ?? false });
      }
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     PUBLIC: Contact Form Submissions
     ═══════════════════════════════════════════ */

  submitContact: rateLimitedMutation
    .input(z.object({
      name: z.string().min(1).max(200),
      email: z.string().email().max(200),
      subject: z.string().max(300).optional(),
      message: z.string().min(1).max(5000),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contactEmails).values({
        name: input.name,
        email: input.email,
        subject: input.subject ?? null,
        message: input.message,
        isRead: false,
      });
      return { success: true };
    }),

  /* ═══════════════════════════════════════════
     ADMIN: Contact Inbox Management
     ═══════════════════════════════════════════ */

  listContacts: adminQuery
    .input(z.object({
      filter: z.enum(["all", "unread"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }).optional().default({ filter: "all", limit: 50, offset: 0 }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input?.filter === "unread") {
        conditions.push(eq(contactEmails.isRead, false));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(contactEmails)
        .where(whereClause)
        .orderBy(desc(contactEmails.createdAt))
        .limit(input?.limit ?? 50)
        .offset(input?.offset ?? 0);

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactEmails)
        .where(whereClause);

      const total = countResult[0]?.count ?? 0;
      const unreadResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(contactEmails)
        .where(eq(contactEmails.isRead, false));
      const unread = unreadResult[0]?.count ?? 0;

      return { items: rows, total, unread };
    }),

  markContactRead: adminMutation
    .input(z.object({ id: z.number().int(), isRead: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(contactEmails)
        .set({ isRead: input.isRead })
        .where(eq(contactEmails.id, input.id));
      return { success: true };
    }),

  deleteContact: adminMutation
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contactEmails).where(eq(contactEmails.id, input.id));
      return { success: true };
    }),
});
