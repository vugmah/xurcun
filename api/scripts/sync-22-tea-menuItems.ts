/**
 * XURCUN — Sync 22 Fruit Tea imageUrl in menuItems table
 * Run: npx tsx api/scripts/sync-22-tea-menuItems.ts
 * 
 * Updates menuItems.imageUrl for all 22 fruit teas (516-537)
 * Lənkəran (515) is NOT touched.
 */

import { getDb } from "../queries/connection";
import { menuItems } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const TEA_UPDATES = [
  { itemId: 516, imageUrl: "/food-photos/tea-516-chouchou.webp" },
  { itemId: 517, imageUrl: "/food-photos/tea-517-douce-nuit-v2.webp" },
  { itemId: 518, imageUrl: "/food-photos/tea-518-la-tete.webp" },
  { itemId: 519, imageUrl: "/food-photos/tea-519-temps-present.webp" },
  { itemId: 520, imageUrl: "/food-photos/tea-520-cloches.webp" },
  { itemId: 521, imageUrl: "/food-photos/tea-521-cascara-v2.webp" },
  { itemId: 522, imageUrl: "/food-photos/tea-522-marcel-proust-v2.webp" },
  { itemId: 523, imageUrl: "/food-photos/tea-523-sapin.webp" },
  { itemId: 524, imageUrl: "/food-photos/tea-524-pain-epice-v2.webp" },
  { itemId: 525, imageUrl: "/food-photos/tea-525-pomme-verte.webp" },
  { itemId: 526, imageUrl: "/food-photos/tea-526-rouge-ananas-v2.webp" },
  { itemId: 527, imageUrl: "/food-photos/tea-527-si-tes-sage.webp" },
  { itemId: 528, imageUrl: "/food-photos/tea-528-the-chance.webp" },
  { itemId: 529, imageUrl: "/food-photos/tea-529-toujours-v2.webp" },
  { itemId: 530, imageUrl: "/food-photos/tea-530-vachement.webp" },
  { itemId: 531, imageUrl: "/food-photos/tea-531-coco.webp" },
  { itemId: 532, imageUrl: "/food-photos/tea-532-rose-sucre.webp" },
  { itemId: 533, imageUrl: "/food-photos/tea-533-yogi-v2.webp" },
  { itemId: 534, imageUrl: "/food-photos/tea-534-jardin-hiver-v2.webp" },
  { itemId: 535, imageUrl: "/food-photos/tea-535-cerises.webp" },
  { itemId: 536, imageUrl: "/food-photos/tea-536-bonne-etoile.webp" },
  { itemId: 537, imageUrl: "/food-photos/tea-537-sucre-orge.webp" },
];

async function sync() {
  const db = getDb();
  let updated = 0;
  let notFound = 0;

  for (const tea of TEA_UPDATES) {
    const existing = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, tea.itemId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(menuItems)
        .set({
          imageUrl: tea.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, tea.itemId));
      updated++;
      console.log(`[UPDATED menuItems] ID ${tea.itemId} → ${tea.imageUrl}`);
    } else {
      notFound++;
      console.log(`[NOT FOUND] ID ${tea.itemId}`);
    }
  }

  console.log(`\n=== menuItems SYNC COMPLETE ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Total: ${TEA_UPDATES.length}`);
}

sync().catch(console.error);
