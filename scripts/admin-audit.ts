#!/usr/bin/env tsx
/* ═══════════════════════════════════════════════════════════════
   LIVE AUDIT SCRIPT — Run full site health check via direct API calls
   Usage: npx tsx scripts/admin-audit.ts
   ═══════════════════════════════════════════════════════════════ */

import "dotenv/config";
import { getDb } from "../api/queries/connection";
import {
  menuCategories, menuItems, branches, photos, seoSettings, seoPages,
  contactEmails, eventLogs, settings, popupCampaigns, trackingSettings,
  googleAdsCampaigns, badgeRecommendations, approvedBadges, menuEvents,
  menuItemBranches, photoAssignments,
} from "../db/schema";
import { sql, count, eq } from "drizzle-orm";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

interface AuditResult {
  section: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  details?: string;
}

const results: AuditResult[] = [];

function log(r: AuditResult) {
  results.push(r);
  const icon = r.status === "PASS" ? "✅" : r.status === "WARN" ? "⚠️" : "❌";
  console.log(`${icon} [${r.status}] ${r.section}: ${r.message}`);
  if (r.details) console.log(`   → ${r.details}`);
}

async function auditDatabase() {
  console.log("\n📊 DATABASE AUDIT\n" + "=".repeat(50));
  const db = getDb();

  // Table counts
  const tables = [
    { name: "menu_categories", table: menuCategories },
    { name: "menu_items", table: menuItems },
    { name: "branches", table: branches },
    { name: "menu_item_branches", table: menuItemBranches },
    { name: "photos", table: photos },
    { name: "seo_settings", table: seoSettings },
    { name: "seo_pages", table: seoPages },
    { name: "contact_emails", table: contactEmails },
    { name: "event_logs", table: eventLogs },
    { name: "settings", table: settings },
    { name: "popup_campaigns", table: popupCampaigns },
    { name: "tracking_settings", table: trackingSettings },
    { name: "google_ads_campaigns", table: googleAdsCampaigns },
    { name: "badge_recommendations", table: badgeRecommendations },
    { name: "approved_badges", table: approvedBadges },
    { name: "menu_events", table: menuEvents },
    { name: "photo_assignments", table: photoAssignments },
  ];

  for (const t of tables) {
    try {
      const rows = await db.select({ c: count() }).from(t.table);
      const c = rows[0]?.c ?? 0;
      const status = c > 0 ? "PASS" : "WARN";
      log({ section: `DB/${t.name}`, status, message: `${c} records` });
    } catch (err: any) {
      log({ section: `DB/${t.name}`, status: "FAIL", message: err.message });
    }
  }

  // Active menu items
  const activeItems = await db.select({ c: count() }).from(menuItems).where(eq(menuItems.isActive, true));
  log({ section: "DB/menu_items_active", status: "PASS", message: `${activeItems[0]?.c ?? 0} active items` });

  // Active categories
  const activeCats = await db.select({ c: count() }).from(menuCategories).where(eq(menuCategories.isActive, true));
  log({ section: "DB/menu_categories_active", status: "PASS", message: `${activeCats[0]?.c ?? 0} active categories` });

  // Branches
  const branchRows = await db.select().from(branches);
  log({ section: "DB/branches", status: "PASS", message: `${branchRows.length} branches`, details: branchRows.map((b) => b.slug).join(", ") });

  // Contact emails (unread)
  const unreadContacts = await db.select({ c: count() }).from(contactEmails).where(eq(contactEmails.isRead, false));
  log({ section: "DB/contact_unread", status: (unreadContacts[0]?.c ?? 0) > 0 ? "WARN" : "PASS", message: `${unreadContacts[0]?.c ?? 0} unread messages` });

  // SEO pages
  const seoPageRows = await db.select().from(seoPages);
  log({ section: "DB/seo_pages", status: "PASS", message: `${seoPageRows.length} entries`, details: seoPageRows.map((p) => `${p.path}(${p.lang})`).join(", ") || "none" });
}

async function auditMenuData() {
  console.log("\n🍽️  MENU AUDIT\n" + "=".repeat(50));
  const db = getDb();

  const cats = await db.select().from(menuCategories).where(eq(menuCategories.isActive, true));
  log({ section: "Menu/categories", status: "PASS", message: `${cats.length} active categories` });

  const items = await db.select().from(menuItems).where(eq(menuItems.isActive, true));
  log({ section: "Menu/items", status: "PASS", message: `${items.length} active items` });

  const withPrice = items.filter((i) => i.price && String(i.price).trim().length > 0);
  log({ section: "Menu/priced", status: "PASS", message: `${withPrice.length}/${items.length} items have prices` });

  const withImage = items.filter((i) => i.imageUrl && String(i.imageUrl).trim().length > 0);
  log({ section: "Menu/images", status: withImage.length > 0 ? "PASS" : "WARN", message: `${withImage.length}/${items.length} items have images` });

  const featured = items.filter((i) => i.isFeatured);
  log({ section: "Menu/featured", status: "PASS", message: `${featured.length} featured items` });

  const newItems = items.filter((i) => i.isNew);
  log({ section: "Menu/new", status: "PASS", message: `${newItems.length} NEW-badge items` });
}

async function auditSEO() {
  console.log("\n🔍 SEO AUDIT\n" + "=".repeat(50));
  const db = getDb();

  const seoRows = await db.select().from(seoSettings);
  log({ section: "SEO/seo_settings", status: "PASS", message: `${seoRows.length} legacy entries` });

  const pages = await db.select().from(seoPages);
  log({ section: "SEO/seo_pages", status: "PASS", message: `${pages.length} path-based entries` });

  // Check homepage SEO
  const homeSeo = seoRows.find((s) => s.page === "home");
  if (homeSeo?.titleAz) {
    log({ section: "SEO/home_title", status: "PASS", message: homeSeo.titleAz.slice(0, 60) });
  } else {
    log({ section: "SEO/home_title", status: "WARN", message: "Homepage title not set in DB (using fallback)" });
  }
}

async function auditMedia() {
  console.log("\n📸 MEDIA AUDIT\n" + "=".repeat(50));
  const db = getDb();

  const photoRows = await db.select().from(photos);
  log({ section: "Media/photos", status: "PASS", message: `${photoRows.length} photos in DB` });

  const assignments = await db.select().from(photoAssignments);
  log({ section: "Media/assignments", status: "PASS", message: `${assignments.length} photo assignments` });

  // Supabase config check
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    log({ section: "Media/supabase_config", status: "WARN", message: "SUPABASE_URL or SUPABASE_SERVICE_KEY missing" });
  } else {
    log({ section: "Media/supabase_config", status: "PASS", message: "Credentials configured" });
    // Try DNS resolve
    try {
      const dns = await import("dns");
      const hostname = new URL(supabaseUrl).hostname;
      await new Promise((resolve, reject) => {
        dns.lookup(hostname, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });
      log({ section: "Media/supabase_dns", status: "PASS", message: `${hostname} resolves` });
    } catch (err: any) {
      log({ section: "Media/supabase_dns", status: "FAIL", message: `DNS failed: ${err.code}`, details: "Supabase Storage will not work until URL is fixed" });
    }
  }
}

async function auditQR() {
  console.log("\n📱 QR MENU AUDIT\n" + "=".repeat(50));
  const db = getDb();

  const branchRows = await db.select().from(branches).where(eq(branches.isActive, true));
  log({ section: "QR/branches", status: "PASS", message: `${branchRows.length} active branches` });

  for (const b of branchRows) {
    const branchItems = await db.select().from(menuItemBranches).where(eq(menuItemBranches.branchId, b.id!));
    const available = branchItems.filter((bi) => bi.isAvailable !== false);
    log({ section: `QR/${b.slug}`, status: "PASS", message: `${available.length}/${branchItems.length} items available` });
  }

  // Check photo assignments per tab
  const tabs = ["food", "beverage", "shisha"];
  for (const tab of tabs) {
    const tabAssignments = await db.select().from(photoAssignments).where(eq(photoAssignments.tab, tab));
    log({ section: `QR/photos_${tab}`, status: tabAssignments.length > 0 ? "PASS" : "WARN", message: `${tabAssignments.length} photo assignments` });
  }
}

async function auditAdmin() {
  console.log("\n🔐 ADMIN AUDIT\n" + "=".repeat(50));

  if (!ADMIN_KEY) {
    log({ section: "Admin/key", status: "FAIL", message: "ADMIN_SECRET_KEY not set" });
    return;
  }
  if (ADMIN_KEY.length < 8) {
    log({ section: "Admin/key_strength", status: "WARN", message: "Key is short (< 8 chars)" });
  } else {
    log({ section: "Admin/key_strength", status: "PASS", message: "Key length OK" });
  }

  // Check if key matches .env
  log({ section: "Admin/key_config", status: "PASS", message: "Key loaded from env" });
}

async function auditTracking() {
  console.log("\n📊 TRACKING AUDIT\n" + "=".repeat(50));
  const db = getDb();

  const events = await db.select({ c: count() }).from(menuEvents);
  log({ section: "Tracking/menu_events", status: "PASS", message: `${events[0]?.c ?? 0} tracked events` });

  const logs = await db.select({ c: count() }).from(eventLogs);
  log({ section: "Tracking/event_logs", status: "PASS", message: `${logs[0]?.c ?? 0} event logs` });
}

async function printSummary() {
  console.log("\n" + "=".repeat(50));
  console.log("📋 AUDIT SUMMARY\n" + "=".repeat(50));

  const pass = results.filter((r) => r.status === "PASS").length;
  const warn = results.filter((r) => r.status === "WARN").length;
  const fail = results.filter((r) => r.status === "FAIL").length;

  console.log(`Total checks: ${results.length}`);
  console.log(`  ✅ PASS:  ${pass}`);
  console.log(`  ⚠️  WARN:  ${warn}`);
  console.log(`  ❌ FAIL:  ${fail}`);

  if (fail > 0) {
    console.log("\n❌ FAILED ITEMS:");
    results.filter((r) => r.status === "FAIL").forEach((r) => {
      console.log(`  • ${r.section}: ${r.message}`);
    });
  }

  if (warn > 0) {
    console.log("\n⚠️  WARNINGS:");
    results.filter((r) => r.status === "WARN").forEach((r) => {
      console.log(`  • ${r.section}: ${r.message}`);
    });
  }

  console.log("\n" + "=".repeat(50));
}

async function main() {
  console.log("🚀 THE WOO WHITE CITY — LIVE AUDIT");
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log(`🔑 Admin key: ${ADMIN_KEY ? "***configured***" : "MISSING"}`);

  try {
    await auditAdmin();
    await auditDatabase();
    await auditMenuData();
    await auditSEO();
    await auditMedia();
    await auditQR();
    await auditTracking();
  } catch (err: any) {
    log({ section: "Audit/fatal", status: "FAIL", message: err.message });
    console.error(err);
  }

  await printSummary();
  process.exit(0);
}

main();
