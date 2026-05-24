#!/usr/bin/env tsx
/* Seed default Google Ads settings row */

import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { googleAdsSettings } from "../db/schema";
import { count } from "drizzle-orm";

async function main() {
  const db = getDb();

  const existing = await db.select({ c: count() }).from(googleAdsSettings);
  if ((existing[0]?.c ?? 0) > 0) {
    console.log("Skip — google_ads_settings already has rows");
    process.exit(0);
  }

  await db.insert(googleAdsSettings).values({
    developerToken: "",
    clientId: "",
    clientSecret: "",
    refreshToken: "",
    loginCustomerId: "",
    isActive: false,
  });

  console.log("Inserted default Google Ads settings row (inactive).");
  console.log("Activate and configure credentials in Admin → Google Ads.");
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
