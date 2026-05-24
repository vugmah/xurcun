import { getDb } from "../api/queries/connection";
import { branches } from "./schema";

/**
 * Seed initial branch data.
 * Run: npx tsx db/seed.ts
 */
async function seed() {
  console.log("Seeding branches...");
  const db = getDb();

  const existing = await db.select().from(branches);
  if (existing.length > 0) {
    console.log(`Branches already exist (${existing.length}), skipping seed.`);
    return;
  }

  await db.insert(branches).values([
    {
      name: "Main Branch",
      slug: "main",
      address: "Baku, Azerbaijan",
      phone: "",
      isActive: true,
    },
  ]);

  console.log("Seeded 1 branch.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
