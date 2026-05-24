/**
 * Menu Seed Module - Inline data, no external JSON dependency
 * Auto-creates tables if they don't exist.
 */
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";

interface SeedItem {
  nameAz: string; nameRu: string; nameEn: string;
  price?: string; descAz?: string; descRu?: string; descEn?: string;
  sortOrder?: number; isFeatured?: boolean; active?: boolean;
}

interface SeedCategory {
  titleAz: string; titleRu: string; titleEn: string;
  tab: string; sortOrder: number; active: boolean; items: SeedItem[];
}

// ─── INLINE SEED DATA ─── (no external JSON file needed)
const SEED_DATA: SeedCategory[] = [
  // ── FOOD ──
  {
    titleAz: "Salatlar", titleRu: "Салаты", titleEn: "Salads",
    tab: "food", sortOrder: 10, active: true,
    items: [
      { nameAz: "Sezar Salat", nameRu: "Салат Цезарь", nameEn: "Caesar Salad", price: "14", descAz: "Toyuq filesi, parmesan, romaine salat, kruton", descRu: "Куриное филе, пармезан, салат романо, крутоны", descEn: "Chicken fillet, parmesan, romaine, croutons", sortOrder: 10 },
      { nameAz: "Yunan Salat", nameRu: "Греческий салат", nameEn: "Greek Salad", price: "12", descAz: "Pomidor, xiyar, feta pendir, zeytun", descRu: "Помидоры, огурцы, сыр фета, оливки", descEn: "Tomatoes, cucumber, feta cheese, olives", sortOrder: 20 },
      { nameAz: "Caprese Salat", nameRu: "Салат Капрезе", nameEn: "Caprese Salad", price: "15", descAz: "Pomidor, mozzarella, basil", descRu: "Помидоры, моцарелла, базилик", descEn: "Tomatoes, mozzarella, basil", sortOrder: 30 },
    ],
  },
  {
    titleAz: "Isti Qazan", titleRu: "Горячие блюда", titleEn: "Hot Dishes",
    tab: "food", sortOrder: 20, active: true,
    items: [
      { nameAz: "Beef Steak", nameRu: "Бифштекс", nameEn: "Beef Steak", price: "35", descAz: "250gr dana filesi, tereyagi", descRu: "250гр говяжье филе, сливочное масло", descEn: "250gr beef fillet, butter", isFeatured: true, sortOrder: 10 },
      { nameAz: "Toyuq Sote", nameRu: "Куриное соте", nameEn: "Chicken Saute", price: "18", descAz: "Toyuq filesi, gOB&ccedil;eresq, tərəvəz", descRu: "Куриное филе, овощи", descEn: "Chicken fillet, vegetables", sortOrder: 20 },
      { nameAz: "Qizilbaliq", nameRu: "Лосось", nameEn: "Salmon", price: "32", descAz: "Qril qizilbaliq, sparj", descRu: "Лосось на гриле, спаржа", descEn: "Grilled salmon, asparagus", isFeatured: true, sortOrder: 30 },
    ],
  },
  {
    titleAz: "Fast Food", titleRu: "Фастфуд", titleEn: "Fast Food",
    tab: "food", sortOrder: 30, active: true,
    items: [
      { nameAz: "Burger", nameRu: "Бургер", nameEn: "Burger", price: "16", descAz: "Dana kotlet, cheddar, turspu", descRu: "Говяжья котлета, чеддер, маринованные огурцы", descEn: "Beef patty, cheddar, pickles", sortOrder: 10 },
      { nameAz: "Pizza Margherita", nameRu: "Пицца Маргарита", nameEn: "Pizza Margherita", price: "20", descAz: "Pomidor sousu, mozzarella, basil", descRu: "Томатный соус, моцарелла, базилик", descEn: "Tomato sauce, mozzarella, basil", sortOrder: 20 },
      { nameAz: "Pizza Pepperoni", nameRu: "Пицца Пепперони", nameEn: "Pizza Pepperoni", price: "24", descAz: "Pepperoni, mozzarella, pomidor sousu", descRu: "Пепперони, моцарелла, томатный соус", descEn: "Pepperoni, mozzarella, tomato sauce", sortOrder: 30 },
      { nameAz: "Lahmacun", nameRu: "Лахмаджун", nameEn: "Lahmacun", price: "10", descAz: "INC qabiliyyat, Qiyma, terevEz", descRu: "Тонкое тесто, фарш, овощи", descEn: "Thin dough, minced meat, vegetables", sortOrder: 40 },
    ],
  },
  {
    titleAz: "Qarnir", titleRu: "Гарниры", titleEn: "Side Dishes",
    tab: "food", sortOrder: 40, active: true,
    items: [
      { nameAz: "Kartof FRI", nameRu: "Картофель фри", nameEn: "French Fries", price: "7", sortOrder: 10 },
      { nameAz: "Püre", nameRu: "Пюре", nameEn: "Mashed Potatoes", price: "8", sortOrder: 20 },
      { nameAz: "Düyü", nameRu: "Рис", nameEn: "Rice", price: "6", sortOrder: 30 },
    ],
  },
  {
    titleAz: "Souslar", titleRu: "Соусы", titleEn: "Sauces",
    tab: "food", sortOrder: 50, active: true,
    items: [
      { nameAz: "BBQ Sousu", nameRu: "BBQ соус", nameEn: "BBQ Sauce", price: "4", sortOrder: 10 },
      { nameAz: "Sarimsaqli Mayonez", nameRu: "Чесночный майонез", nameEn: "Garlic Mayo", price: "4", sortOrder: 20 },
      { nameAz: "Pomidor Sousu", nameRu: "Томатный соус", nameEn: "Tomato Sauce", price: "4", sortOrder: 30 },
    ],
  },

  // ── BEVERAGE ──
  {
    titleAz: "Isti İckiler", titleRu: "Горячие напитки", titleEn: "Hot Beverages",
    tab: "beverage", sortOrder: 10, active: true,
    items: [
      { nameAz: "Espresso", nameRu: "Эспрессо", nameEn: "Espresso", price: "6", sortOrder: 10 },
      { nameAz: "Americano", nameRu: "Американо", nameEn: "Americano", price: "7", sortOrder: 20 },
      { nameAz: "Cappuccino", nameRu: "Капучино", nameEn: "Cappuccino", price: "9", sortOrder: 30 },
      { nameAz: "Latte", nameRu: "Латте", nameEn: "Latte", price: "9", sortOrder: 40 },
      { nameAz: "Türk Qəhvəsi", nameRu: "Турецкий кофе", nameEn: "Turkish Coffee", price: "8", sortOrder: 50 },
      { nameAz: "Çay", nameRu: "Чай", nameEn: "Tea", price: "5", sortOrder: 60 },
    ],
  },
  {
    titleAz: "Soyuq İckiler", titleRu: "Холодные напитки", titleEn: "Cold Beverages",
    tab: "beverage", sortOrder: 20, active: true,
    items: [
      { nameAz: "Mojito", nameRu: "Мохито", nameEn: "Mojito", price: "12", descAz: "Nane, laym, soda", descRu: "Мята, лайм, содовая", descEn: "Mint, lime, soda", sortOrder: 10 },
      { nameAz: "Limonad", nameRu: "Лимонад", nameEn: "Lemonade", price: "8", sortOrder: 20 },
      { nameAz: "Taze Sıxılmış Şirə", nameRu: "Свежевыжатый сок", nameEn: "Fresh Juice", price: "10", descAz: "Portağal/alma", descRu: "Апельсин/яблоко", descEn: "Orange/apple", sortOrder: 30 },
      { nameAz: "Cola", nameRu: "Кола", nameEn: "Cola", price: "5", sortOrder: 40 },
      { nameAz: "Su", nameRu: "Вода", nameEn: "Water", price: "3", sortOrder: 50 },
    ],
  },
  {
    titleAz: "Kokteyllər", titleRu: "Коктейли", titleEn: "Cocktails",
    tab: "beverage", sortOrder: 30, active: true,
    items: [
      { nameAz: "Aperol Spritz", nameRu: "Апероль Спритц", nameEn: "Aperol Spritz", price: "18", sortOrder: 10 },
      { nameAz: "Negroni", nameRu: "Негрони", nameEn: "Negroni", price: "20", sortOrder: 20 },
      { nameAz: "Margarita", nameRu: "Маргарита", nameEn: "Margarita", price: "18", sortOrder: 30 },
      { nameAz: "Old Fashioned", nameRu: "Олд Фэшн", nameEn: "Old Fashioned", price: "22", sortOrder: 40 },
    ],
  },
  {
    titleAz: "Sütdən İckiler", titleRu: "Молочные напитки", titleEn: "Milk Beverages",
    tab: "beverage", sortOrder: 40, active: true,
    items: [
      { nameAz: "Milkshake Çiyələk", nameRu: "Милкшейк Клубника", nameEn: "Strawberry Milkshake", price: "12", sortOrder: 10 },
      { nameAz: "Milkshake Vanil", nameRu: "Милкшейк Ваниль", nameEn: "Vanilla Milkshake", price: "12", sortOrder: 20 },
      { nameAz: "Milkshake Şokolad", nameRu: "Милкшейк Шоколад", nameEn: "Chocolate Milkshake", price: "12", sortOrder: 30 },
    ],
  },

  // ── SHISHA ──
  {
    titleAz: "Nargile - Klassik", titleRu: "Кальян - Классический", titleEn: "Shisha - Classic",
    tab: "shisha", sortOrder: 10, active: true,
    items: [
      { nameAz: "Al Fakher - İki Alma", nameRu: "Al Fakher - Двойное Яблоко", nameEn: "Al Fakher - Double Apple", price: "25", sortOrder: 10 },
      { nameAz: "Al Fakher - Nanə", nameRu: "Al Fakher - Мята", nameEn: "Al Fakher - Mint", price: "25", sortOrder: 20 },
      { nameAz: "Al Fakher - Çiyələk", nameRu: "Al Fakher - Клубника", nameEn: "Al Fakher - Strawberry", price: "25", sortOrder: 30 },
      { nameAz: "Al Fakher - Üzüm", nameRu: "Al Fakher - Виноград", nameEn: "Al Fakher - Grape", price: "25", sortOrder: 40 },
      { nameAz: "Al Fakher - Limon", nameRu: "Al Fakher - Лимон", nameEn: "Al Fakher - Lemon", price: "25", sortOrder: 50 },
    ],
  },
  {
    titleAz: "Nargile - Premium", titleRu: "Кальян - Премиум", titleEn: "Shisha - Premium",
    tab: "shisha", sortOrder: 20, active: true,
    items: [
      { nameAz: "Must Have - Magic", nameRu: "Must Have - Мэджик", nameEn: "Must Have - Magic", price: "35", descAz: "Ananas, marakuya", descRu: "Ананас, маракуйя", descEn: "Pineapple, passion fruit", sortOrder: 10 },
      { nameAz: "Must Have - Ice", nameRu: "Must Have - Айс", nameEn: "Must Have - Ice", price: "35", descAz: "Super soyuq efekt", descRu: "Супер холодный эффект", descEn: "Super cold effect", sortOrder: 20 },
      { nameAz: "Black Burn - La", nameRu: "Black Burn - Ла", nameEn: "Black Burn - La", price: "35", descAz: "Mix meyvəli", descRu: "Микс фруктовый", descEn: "Mixed fruity", sortOrder: 30 },
      { nameAz: "Chabacco - Strong Chill", nameRu: "Chabacco - Стронг Чилл", nameEn: "Chabacco - Strong Chill", price: "35", sortOrder: 40 },
      { nameAz: "Darkside - Supernova", nameRu: "Darkside - Супернова", nameEn: "Darkside - Supernova", price: "40", descAz: "Nar, tut", descRu: "Гранат, черника", descEn: "Pomegranate, blueberry", sortOrder: 50 },
    ],
  },
  {
    titleAz: "Nargile - Xüsusi", titleRu: "Кальян - Особый", titleEn: "Shisha - Special",
    tab: "shisha", sortOrder: 30, active: true,
    items: [
      { nameAz: "Woo Special Mix", nameRu: "Woo Спешл Микс", nameEn: "Woo Special Mix", price: "50", descAz: "Nargile ustasının xüsusi mixi", descRu: "Специальный микс мастера кальяна", descEn: "Master's special mix", isFeatured: true, sortOrder: 10 },
      { nameAz: "Portağal Baş", nameRu: "Апельсиновая чаша", nameEn: "Orange Bowl", price: "45", descAz: "Taze portağal üzərində", descRu: "На свежем апельсине", descEn: "On fresh orange", sortOrder: 20 },
      { nameAz: "Ananas Baş", nameRu: "Ананасовая чаша", nameEn: "Pineapple Bowl", price: "45", descAz: "Taze ananas üzərində", descRu: "На свежем ананасе", descEn: "On fresh pineapple", sortOrder: 30 },
      { nameAz: "Karpuz Baş", nameRu: "Арбузная чаша", nameEn: "Watermelon Bowl", price: "40", descAz: "Taze karpuz üzərində", descRu: "На свежем арбузе", descEn: "On fresh watermelon", sortOrder: 40 },
    ],
  },
];

/**
 * Create tables if they don't exist
 */
async function ensureTables(db: any) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      menu_type VARCHAR(50) NOT NULL,
      title_az VARCHAR(200) NOT NULL,
      title_ru VARCHAR(200) NOT NULL,
      title_en VARCHAR(200) NOT NULL,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Add is_featured column if missing (backward compat)
  try {
    await db.execute(`ALTER TABLE menu_categories ADD COLUMN is_featured BOOLEAN DEFAULT false`);
  } catch { /* column may already exist */ }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name_az VARCHAR(300) NOT NULL,
      name_ru VARCHAR(300) NOT NULL,
      name_en VARCHAR(300) NOT NULL,
      price VARCHAR(50),
      desc_az TEXT,
      desc_ru TEXT,
      desc_en TEXT,
      sort_order INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Add new tag columns if missing (backward compat)
  const newCols = [
    "is_featured", "is_new", "is_meat", "is_fish", "is_vegetarian", "is_halal"
  ];
  for (const col of newCols) {
    try {
      await db.execute(`ALTER TABLE menu_items ADD COLUMN ${col} BOOLEAN DEFAULT false`);
    } catch { /* column may already exist */ }
  }

  // ─── BRANCH TABLES (required for QR menu branch isolation) ───
  await db.execute(`
    CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(100) NOT NULL,
      address TEXT,
      phone VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS menu_item_branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branch_id INT NOT NULL,
      menu_item_id INT NOT NULL,
      branch_price VARCHAR(50),
      is_available BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // ─── PHOTO ASSIGNMENTS TABLE (required for admin photo system) ───
  await db.execute(`
    CREATE TABLE IF NOT EXISTS photo_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tab VARCHAR(50) NOT NULL,
      cat_title_az VARCHAR(200) NOT NULL,
      item_name_az VARCHAR(300) NOT NULL,
      branch_slug VARCHAR(100) DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // ─── Seed default branches if empty ───
  const branchCount = await db.execute(`SELECT COUNT(*) as c FROM branches`);
  const bCount = Number(branchCount[0]?.[0]?.c || 0);
  if (bCount === 0) {
    await db.execute(`
      INSERT INTO branches (name, slug, address, phone, is_active)
      VALUES
        ('White City', 'white-city', 'Baku, White City', NULL, true),
        ('Seabreeze Marina', 'seabreeze', 'Baku, Seabreeze Marina', NULL, true)
    `);
  }
}

/**
 * Reset all menu data and re-seed from scratch.
 */
export async function resetAndSeedMenuData() {
  /* Production guard: never allow destructive reset in production */
  if (process.env.NODE_ENV === "production") {
    console.warn("[Seed] resetAndSeedMenuData blocked in production");
    return { success: false, error: "PRODUCTION_FORBIDDEN" };
  }

  const db = getDb();

  try {
    // Ensure tables exist
    await ensureTables(db);

    // Clear existing data
    await db.execute(`DELETE FROM menu_items`);
    await db.execute(`DELETE FROM menu_categories`);

    let totalCategories = 0;
    let totalItems = 0;

    // Insert each category and its items
    for (let i = 0; i < SEED_DATA.length; i++) {
      const cat = SEED_DATA[i];

      await db.execute(sql`
        INSERT INTO menu_categories (menu_type, title_az, title_ru, title_en, sort_order, is_active)
        VALUES (${cat.tab}, ${cat.titleAz}, ${cat.titleRu}, ${cat.titleEn}, ${cat.sortOrder ?? (i + 1) * 10}, ${cat.active ?? true ? 1 : 0})
      `);

      const lidResult: any = await db.execute(`SELECT LAST_INSERT_ID() as lid`);
      const catId = Number(lidResult[0]?.[0]?.lid || lidResult[0]?.[0]?.['LAST_INSERT_ID()']);

      if (!catId) continue;
      totalCategories++;

      if (cat.items && cat.items.length > 0) {
        for (let j = 0; j < cat.items.length; j++) {
          const item = cat.items[j];
          await db.execute(sql`
            INSERT INTO menu_items (
              category_id, name_az, name_ru, name_en, price,
              desc_az, desc_ru, desc_en, sort_order, is_active, is_featured
            ) VALUES (
              ${catId}, ${item.nameAz}, ${item.nameRu}, ${item.nameEn}, ${item.price || null},
              ${item.descAz || null}, ${item.descRu || null}, ${item.descEn || null},
              ${item.sortOrder ?? (j + 1) * 10}, ${item.active ?? true ? 1 : 0}, ${item.isFeatured ?? false ? 1 : 0}
            )
          `);
          totalItems++;
        }
      }
    }

    return { success: true, categories: totalCategories, items: totalItems };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Auto-seed: only runs if database is empty.
 * Called on first public menu request.
 */
export async function seedMenuData() {
  try {
    const db = getDb();
    await ensureTables(db);

    const existing: any = await db.execute(`SELECT COUNT(*) as c FROM menu_categories`);
    const count = Number(existing[0]?.[0]?.c || 0);

    if (count > 0) {
      return { success: true, skipped: true, categories: count };
    }

    return await resetAndSeedMenuData();
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
