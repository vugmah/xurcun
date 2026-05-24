#!/usr/bin/env tsx
/* Test contact form by inserting a test message and verifying it appears */

import "dotenv/config";
import { getDb } from "../api/queries/connection";
import { contactEmails } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();

  // Insert test message
  await db.insert(contactEmails).values({
    email: "test@example.com",
    name: "Audit Bot",
    subject: "Live Audit Test",
    message: "This is an automated test message from the live audit script. If you see this in the admin inbox, the contact form flow is working correctly.",
    isRead: false,
  });

  console.log("✅ Test contact message inserted.");

  // Verify
  const rows = await db.select().from(contactEmails).where(eq(contactEmails.isRead, false));
  console.log(`📬 Unread messages in inbox: ${rows.length}`);
  console.log(`   Latest: "${rows[rows.length - 1]?.subject}" from ${rows[rows.length - 1]?.name}`);

  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
