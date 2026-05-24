#!/usr/bin/env tsx
/* Seed sample AI badge recommendations */

import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { menuItems, badgeRecommendations } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();

  // Get first 5 active items
  const items = await db.select().from(menuItems).where(eq(menuItems.isActive, true)).limit(5);
  if (items.length === 0) {
    console.log("No active menu items found.");
    process.exit(0);
  }

  const badges = ["isNew", "isPopular", "isRecommended", "isChefSpecial", "isBestseller"] as const;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const badge = badges[i % badges.length];

    const existing = await db.select().from(badgeRecommendations).where(eq(badgeRecommendations.itemId, item.id!));
    if (existing.length > 0) {
      console.log(`Skip ${item.nameAz} — already has recommendation`);
      continue;
    }

    await db.insert(badgeRecommendations).values({
      itemId: item.id!,
      itemName: item.nameAz,
      branchSlug: "white-city",
      badgeType: badge,
      confidence: 75 + Math.floor(Math.random() * 20),
      reason: `High engagement detected — ${badge} badge recommended based on menu analytics.`,
      dataPoints: JSON.stringify({ views: 42 + i * 10, hovers: 35 + i * 5, rank: i + 1 }),
      status: "pending",
    });

    console.log(`Inserted ${badge} for "${item.nameAz}"`);
  }

  console.log("\nDone seeding badge recommendations.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
