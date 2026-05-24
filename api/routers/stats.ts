import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems, photos, seoSettings, settings, photoAssignments } from "../../db/schema";
import { sql } from "drizzle-orm";

export const statsRouter = createRouter({
  // Admin: Get dashboard statistics — single source of truth from DB
  getDashboard: adminQuery.query(async () => {
    const db = getDb();

    const [menuCatCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuCategories);
    const [menuItemCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems);
    const [activeItemCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .where(sql`${menuItems.isActive} = true`);
    const [inactiveItemCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .where(sql`${menuItems.isActive} = false`);
    const [photoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(photos);
    const [photoAssignedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(photoAssignments);
    const [seoCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(seoSettings);
    const [settingsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(settings);

    // Count by tab (JOIN with categories)
    const alacarteItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .innerJoin(menuCategories, sql`${menuItems.categoryId} = ${menuCategories.id}`)
      .where(sql`${menuCategories.menuType} = 'food'`);

    const beverageItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .innerJoin(menuCategories, sql`${menuItems.categoryId} = ${menuCategories.id}`)
      .where(sql`${menuCategories.menuType} = 'beverage'`);

    const shishaItems = await db
      .select({ count: sql<number>`count(*)` })
      .from(menuItems)
      .innerJoin(menuCategories, sql`${menuItems.categoryId} = ${menuCategories.id}`)
      .where(sql`${menuCategories.menuType} = 'shisha'`);

    const totalItems = menuItemCount?.count ?? 0;
    const withPhotos = photoAssignedCount?.count ?? 0;

    return {
      menuCategories: menuCatCount?.count ?? 0,
      menuItems: totalItems,
      activeItems: activeItemCount?.count ?? 0,
      inactiveItems: inactiveItemCount?.count ?? 0,
      photos: photoCount?.count ?? 0,
      withPhotos,
      withoutPhotos: totalItems - withPhotos,
      seoPages: seoCount?.count ?? 0,
      settings: settingsCount?.count ?? 0,
      byTab: {
        alacarte: alacarteItems[0]?.count ?? 0,
        beverages: beverageItems[0]?.count ?? 0,
        shisha: shishaItems[0]?.count ?? 0,
      },
    };
  }),
});
