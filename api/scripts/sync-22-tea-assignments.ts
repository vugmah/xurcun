/**
 * XURCUN — Sync 22 Fruit Tea Photo Assignments
 * Run: npx tsx api/scripts/sync-22-tea-assignments.ts
 * 
 * This script upserts photoAssignments for all 22 fruit teas (516-537)
 * Lənkəran (515) is NOT touched.
 */

import { getDb } from "../queries/connection";
import { photoAssignments } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const BRANCH = "white-city";
const TAB = "beverage";
const CAT = "ÇAY";

// 22 fruit teas with their correct names from seed_data.json
// and their corresponding image files
const TEA_ASSIGNMENTS = [
  { itemNameAz: "Chouchou & Loulou", imageUrl: "/food-photos/tea-516-chouchou.webp" },
  { itemNameAz: "Douce Nuit", imageUrl: "/food-photos/tea-517-douce-nuit-v2.webp" },
  { itemNameAz: "La Tete dans les Etoiles", imageUrl: "/food-photos/tea-518-la-tete.webp" },
  { itemNameAz: "Le Temps Present Bio", imageUrl: "/food-photos/tea-519-temps-present.webp" },
  { itemNameAz: "Les Cloches Sonnent", imageUrl: "/food-photos/tea-520-cloches.webp" },
  { itemNameAz: "Cascara Tea", imageUrl: "/food-photos/tea-521-cascara-v2.webp" },
  { itemNameAz: "Marcel de Provence", imageUrl: "/food-photos/tea-522-marcel-proust-v2.webp" },
  { itemNameAz: "Mon Beau Sapin", imageUrl: "/food-photos/tea-523-sapin.webp" },
  { itemNameAz: "Pain d'Epice", imageUrl: "/food-photos/tea-524-pain-epice-v2.webp" },
  { itemNameAz: "Pomme Verte", imageUrl: "/food-photos/tea-525-pomme-verte.webp" },
  { itemNameAz: "Rouge Ananas", imageUrl: "/food-photos/tea-526-rouge-ananas-v2.webp" },
  { itemNameAz: "Si T'es Sage", imageUrl: "/food-photos/tea-527-si-tes-sage.webp" },
  { itemNameAz: "The de la Chance", imageUrl: "/food-photos/tea-528-the-chance.webp" },
  { itemNameAz: "Toujours La", imageUrl: "/food-photos/tea-529-toujours-v2.webp" },
  { itemNameAz: "Vachement Sympa", imageUrl: "/food-photos/tea-530-vachement.webp" },
  { itemNameAz: "Coco Givrees", imageUrl: "/food-photos/tea-531-coco.webp" },
  { itemNameAz: "Rose en Sucre", imageUrl: "/food-photos/tea-532-rose-sucre.webp" },
  { itemNameAz: "Energie du Yogi Bio", imageUrl: "/food-photos/tea-533-yogi-v2.webp" },
  { itemNameAz: "Jardin Emeraude Bio", imageUrl: "/food-photos/tea-534-jardin-hiver-v2.webp" },
  { itemNameAz: "Le Temps des Cerises", imageUrl: "/food-photos/tea-535-cerises.webp" },
  { itemNameAz: "Ma Bonne Etoile", imageUrl: "/food-photos/tea-536-bonne-etoile.webp" },
  { itemNameAz: "Sucre d'Orge", imageUrl: "/food-photos/tea-537-sucre-orge.webp" },
];

async function sync() {
  const db = getDb();
  let created = 0;
  let updated = 0;

  for (const tea of TEA_ASSIGNMENTS) {
    // Check existing
    const existing = await db
      .select()
      .from(photoAssignments)
      .where(
        and(
          eq(photoAssignments.tab, TAB),
          eq(photoAssignments.catTitleAz, CAT),
          eq(photoAssignments.itemNameAz, tea.itemNameAz),
          eq(photoAssignments.branchSlug, BRANCH)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(photoAssignments)
        .set({
          imageUrl: tea.imageUrl,
          imageId: tea.imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(photoAssignments.id, existing[0].id));
      updated++;
      console.log(`[UPDATED] ${tea.itemNameAz} → ${tea.imageUrl}`);
    } else {
      // Insert
      await db.insert(photoAssignments).values({
        tab: TAB,
        catTitleAz: CAT,
        itemNameAz: tea.itemNameAz,
        imageUrl: tea.imageUrl,
        imageId: tea.imageUrl,
        branchSlug: BRANCH,
      });
      created++;
      console.log(`[CREATED] ${tea.itemNameAz} → ${tea.imageUrl}`);
    }
  }

  console.log(`\n=== SYNC COMPLETE ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Total: ${TEA_ASSIGNMENTS.length}`);
  console.log(`Branch: ${BRANCH}`);
  console.log(`Category: ${CAT}`);
}

sync().catch(console.error);
