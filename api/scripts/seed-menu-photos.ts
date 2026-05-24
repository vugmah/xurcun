import { getDb } from "../queries/connection";
import { photos } from "../../db/schema";
import { inArray } from "drizzle-orm";

async function seed() {
  const db = getDb();
  const items = [
    { url: "/food-photos/menu-heineken.jpg", section: "menu", altAz: "Heineken" },
    { url: "/food-photos/menu-wookah.jpg", section: "menu", altAz: "Premium Shisha" },
    { url: "/food-photos/menu-bottega-brut.jpg", section: "menu", altAz: "Bottega Brut" },
    { url: "/food-photos/menu-blanc-de-blancs.jpg", section: "menu", altAz: "Blanc de Blancs" },
  ];

  const urls = items.map((i) => i.url);
  const existing = await db.select({ url: photos.url }).from(photos).where(inArray(photos.url, urls));
  const existingSet = new Set(existing.map((r) => r.url));

  const newItems = items
    .filter((i) => !existingSet.has(i.url))
    .map((i) => ({ ...i, sortOrder: 0, isActive: true }));

  if (newItems.length > 0) {
    await db.insert(photos).values(newItems);
    console.log(`Inserted ${newItems.length} photos`);
  } else {
    console.log("All photos already exist");
  }
}

seed().catch(console.error);
