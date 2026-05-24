/**
 * localStorage-based data persistence layer
 * All CRUD operations work in browser
 */

const STORAGE_KEY = "xurcun_mock_db";

interface MockCategory {
  id: number;
  menuType: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface MockItem {
  id: number;
  categoryId: number;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  price: string | null;
  descAz: string | null;
  descRu: string | null;
  descEn: string | null;
  sortOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  isNew: boolean;
  isMeat: boolean;
  isFish: boolean;
  isVegetarian: boolean;
  isHalal: boolean;
}

interface MockDB {
  categories: MockCategory[];
  items: MockItem[];
  nextId: number;
}

const DEFAULT_CATEGORIES: MockCategory[] = [
  { id: 1, menuType: "food", titleAz: "Salatlar", titleRu: "Салаты", titleEn: "Salads", sortOrder: 10, isActive: true, isFeatured: false },
  { id: 2, menuType: "food", titleAz: "Isti Qazan", titleRu: "Горячие блюда", titleEn: "Hot Dishes", sortOrder: 20, isActive: true, isFeatured: false },
  { id: 3, menuType: "food", titleAz: "Fast Food", titleRu: "Фастфуд", titleEn: "Fast Food", sortOrder: 30, isActive: true, isFeatured: false },
  { id: 4, menuType: "beverage", titleAz: "Isti Ickiler", titleRu: "Горячие напитки", titleEn: "Hot Beverages", sortOrder: 10, isActive: true, isFeatured: false },
  { id: 5, menuType: "beverage", titleAz: "Soyuq Ickiler", titleRu: "Холодные напитки", titleEn: "Cold Beverages", sortOrder: 20, isActive: true, isFeatured: false },
  { id: 6, menuType: "shisha", titleAz: "Nargile - Klassik", titleRu: "Кальян - Классический", titleEn: "Shisha - Classic", sortOrder: 10, isActive: true, isFeatured: false },
  { id: 7, menuType: "shisha", titleAz: "Nargile - Premium", titleRu: "Кальян - Премиум", titleEn: "Shisha - Premium", sortOrder: 20, isActive: true, isFeatured: false },
  { id: 8, menuType: "shisha", titleAz: "Nargile - Xususi", titleRu: "Кальян - Особый", titleEn: "Shisha - Special", sortOrder: 30, isActive: true, isFeatured: false },
];

const DEFAULT_ITEMS: MockItem[] = [
  { id: 1, categoryId: 1, nameAz: "Sezar Salat", nameRu: "Салат Цезарь", nameEn: "Caesar Salad", price: "14", descAz: "Toyuq filesi, parmesan, romaine salat", descRu: "Куриное филе, пармезан", descEn: "Chicken fillet, parmesan", sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 2, categoryId: 1, nameAz: "Yunan Salat", nameRu: "Греческий салат", nameEn: "Greek Salad", price: "12", descAz: "Pomidor, xiyar, feta pendir", descRu: "Помидоры, огурцы, фета", descEn: "Tomatoes, cucumber, feta", sortOrder: 20, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 3, categoryId: 2, nameAz: "Beef Steak", nameRu: "Бифштекс", nameEn: "Beef Steak", price: "35", descAz: "250gr dana filesi", descRu: "250гр говяжье филе", descEn: "250gr beef fillet", sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: true, isFish: false, isVegetarian: false, isHalal: true },
  { id: 4, categoryId: 2, nameAz: "Qizilbaliq", nameRu: "Лосось", nameEn: "Salmon", price: "32", descAz: "Qril qizilbaliq", descRu: "Лосось на гриле", descEn: "Grilled salmon", sortOrder: 20, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: true, isVegetarian: false, isHalal: true },
  { id: 5, categoryId: 3, nameAz: "Burger", nameRu: "Бургер", nameEn: "Burger", price: "16", descAz: "Dana kotlet, cheddar", descRu: "Говяжья котлета, чеддер", descEn: "Beef patty, cheddar", sortOrder: 10, isFeatured: false, isActive: true, isNew: true, isMeat: true, isFish: false, isVegetarian: false, isHalal: true },
  { id: 6, categoryId: 4, nameAz: "Espresso", nameRu: "Эспрессо", nameEn: "Espresso", price: "6", descAz: null, descRu: null, descEn: null, sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 7, categoryId: 4, nameAz: "Americano", nameRu: "Американо", nameEn: "Americano", price: "7", descAz: null, descRu: null, descEn: null, sortOrder: 20, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 8, categoryId: 5, nameAz: "Mojito", nameRu: "Мохито", nameEn: "Mojito", price: "12", descAz: "Nane, laym, soda", descRu: "Мята, лайм, содовая", descEn: "Mint, lime, soda", sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 9, categoryId: 6, nameAz: "Al Fakher - Iki Alma", nameRu: "Al Fakher - Двойное Яблоко", nameEn: "Al Fakher - Double Apple", price: "25", descAz: null, descRu: null, descEn: null, sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 10, categoryId: 6, nameAz: "Al Fakher - Nane", nameRu: "Al Fakher - Мята", nameEn: "Al Fakher - Mint", price: "25", descAz: null, descRu: null, descEn: null, sortOrder: 20, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 11, categoryId: 7, nameAz: "Must Have - Magic", nameRu: "Must Have - Мэджик", nameEn: "Must Have - Magic", price: "35", descAz: "Ananas, marakuya", descRu: "Ананас, маракуйя", descEn: "Pineapple, passion fruit", sortOrder: 10, isFeatured: false, isActive: true, isNew: false, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
  { id: 12, categoryId: 8, nameAz: "Woo Special Mix", nameRu: "Woo Спешл Микс", nameEn: "Woo Special Mix", price: "50", descAz: "Nargile ustasinin xususi mixi", descRu: "Специальный микс мастера", descEn: "Master's special mix", sortOrder: 10, isFeatured: false, isActive: true, isNew: true, isMeat: false, isFish: false, isVegetarian: true, isHalal: true },
];

function loadDB(): MockDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { categories: [...DEFAULT_CATEGORIES], items: [...DEFAULT_ITEMS], nextId: 100 };
}

function saveDB(db: MockDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ─── API Methods ───

export const mockApi = {
  getMenu(tab: string) {
    const db = loadDB();
    const cats = db.categories
      .filter((c) => c.menuType === tab && c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return cats.map((cat) => ({
      ...cat,
      items: db.items
        .filter((i) => i.categoryId === cat.id && i.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    }));
  },

  adminGetCategories() {
    const db = loadDB();
    return db.categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => ({
      ...cat,
      itemCount: db.items.filter((i) => i.categoryId === cat.id).length,
    }));
  },

  getItemsByCategory(categoryId: number) {
    const db = loadDB();
    return db.items
      .filter((i) => i.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  },

  createCategory(data: Omit<MockCategory, "id">) {
    const db = loadDB();
    const id = db.nextId++;
    db.categories.push({ ...data, id });
    saveDB(db);
    return { success: true };
  },

  updateCategory(id: number, data: Partial<MockCategory>) {
    const db = loadDB();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      db.categories[idx] = { ...db.categories[idx], ...data };
      saveDB(db);
    }
    return { success: true };
  },

  deleteCategory(id: number) {
    const db = loadDB();
    db.items = db.items.filter((i) => i.categoryId !== id);
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDB(db);
    return { success: true };
  },

  createItem(data: Omit<MockItem, "id">) {
    const db = loadDB();
    const id = db.nextId++;
    db.items.push({ ...data, id });
    saveDB(db);
    return { success: true };
  },

  updateItem(id: number, data: Partial<MockItem>) {
    const db = loadDB();
    const idx = db.items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      db.items[idx] = { ...db.items[idx], ...data };
      saveDB(db);
    }
    return { success: true };
  },

  deleteItem(id: number) {
    const db = loadDB();
    db.items = db.items.filter((i) => i.id !== id);
    saveDB(db);
    return { success: true };
  },

  resetAndSeed() {
    const db: MockDB = { categories: [...DEFAULT_CATEGORIES], items: [...DEFAULT_ITEMS], nextId: 100 };
    saveDB(db);
    return { success: true, categories: DEFAULT_CATEGORIES.length, items: DEFAULT_ITEMS.length };
  },
};
