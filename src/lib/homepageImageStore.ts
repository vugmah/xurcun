const STORAGE_KEY = "xurcun_homepage_images_v1";

export interface HomepageImageSlot {
  key: string;
  label: string;
  label_tr: string;
  defaultSrc: string;
  alt_az: string;
  alt_ru: string;
  alt_en: string;
  image_url?: string;
  is_active?: boolean;
}

/* ─── All homepage image slots with their current static image sources ─── */
export const HOMEPAGE_IMAGE_SLOTS: HomepageImageSlot[] = [
  {
    key: "hero_background",
    label: "Hero Background",
    label_tr: "Ana Sayfa Arkaplan",
    defaultSrc: "/assets/hero-bg.jpg",
    alt_az: "Xurcun White City",
    alt_ru: "Xurcun White City",
    alt_en: "Xurcun White City",
    is_active: true,
  },
  {
    key: "about_image_1",
    label: "About - Image 1 (Top)",
    label_tr: "Hakkımızda - Fotoğraf 1 (Üst)",
    defaultSrc: "/assets/about-1.jpg",
    alt_az: "XURCUN Interior",
    alt_ru: "XURCUN Интерьер",
    alt_en: "XURCUN Interior",
    is_active: true,
  },
  {
    key: "about_image_2",
    label: "About - Image 2 (Bottom)",
    label_tr: "Hakkımızda - Fotoğraf 2 (Alt)",
    defaultSrc: "/assets/about-2.jpg",
    alt_az: "XURCUN Lounge",
    alt_ru: "XURCUN Лаунж",
    alt_en: "XURCUN Lounge",
    is_active: true,
  },
  {
    key: "concept_restaurant",
    label: "Concept - Restaurant",
    label_tr: "Konsept - Restoran",
    defaultSrc: "/assets/concept-restaurant.jpg",
    alt_az: "Restoran",
    alt_ru: "Ресторан",
    alt_en: "Restaurant",
    is_active: true,
  },
  {
    key: "concept_bar",
    label: "Concept - Bar",
    label_tr: "Konsept - Bar",
    defaultSrc: "/assets/concept-bar.jpg",
    alt_az: "Bar",
    alt_ru: "Бар",
    alt_en: "Bar",
    is_active: true,
  },
  {
    key: "concept_lounge",
    label: "Concept - Lounge",
    label_tr: "Konsept - Lounge",
    defaultSrc: "/assets/concept-lounge.jpg",
    alt_az: "Lounge",
    alt_ru: "Лаунж",
    alt_en: "Lounge",
    is_active: true,
  },
  {
    key: "concept_events",
    label: "Concept - Events",
    label_tr: "Konsept - Etkinlikler",
    defaultSrc: "/assets/concept-events.jpg",
    alt_az: "Etkinlikler",
    alt_ru: "События",
    alt_en: "Events",
    is_active: true,
  },
  {
    key: "gallery_1",
    label: "Gallery - Image 1",
    label_tr: "Galeri - Fotoğraf 1",
    defaultSrc: "/assets/gallery-1.jpg",
    alt_az: "Restoran dış mekan",
    alt_ru: "Ресторан снаружи",
    alt_en: "Restaurant exterior",
    is_active: true,
  },
  {
    key: "gallery_2",
    label: "Gallery - Image 2",
    label_tr: "Galeri - Fotoğraf 2",
    defaultSrc: "/assets/gallery-2.jpg",
    alt_az: "Açık mutfak",
    alt_ru: "Открытая кухня",
    alt_en: "Open kitchen",
    is_active: true,
  },
  {
    key: "gallery_3",
    label: "Gallery - Image 3",
    label_tr: "Galeri - Fotoğraf 3",
    defaultSrc: "/assets/gallery-3.jpg",
    alt_az: "Bar hazırlığı",
    alt_ru: "Бар",
    alt_en: "Bar",
    is_active: true,
  },
  {
    key: "gallery_pizza",
    label: "Gallery - Pizza",
    label_tr: "Galeri - Pizza",
    defaultSrc: "/assets/menu-pizza.jpg",
    alt_az: "Odun fırın pizzası",
    alt_ru: "Пицца из дровяной печи",
    alt_en: "Wood-fired pizza",
    is_active: true,
  },
  {
    key: "gallery_cocktail",
    label: "Gallery - Cocktail",
    label_tr: "Galeri - Kokteyl",
    defaultSrc: "/assets/menu-cocktail.jpg",
    alt_az: "Kokteyl",
    alt_ru: "Коктейль",
    alt_en: "Cocktail",
    is_active: true,
  },
  {
    key: "events_music",
    label: "Events - Music",
    label_tr: "Etkinlikler - Müzik",
    defaultSrc: "/assets/events-music.jpg",
    alt_az: "Canlı müzik",
    alt_ru: "Живая музыка",
    alt_en: "Live music",
    is_active: true,
  },
  {
    key: "logo",
    label: "Site Logo",
    label_tr: "Site Logosu",
    defaultSrc: "/assets/logo.png",
    alt_az: "Xurcun White City",
    alt_ru: "Xurcun White City",
    alt_en: "Xurcun White City",
    is_active: true,
  },
];

export interface HomepageImageEdit {
  image_url?: string;
  alt_az?: string;
  alt_ru?: string;
  alt_en?: string;
  is_active?: boolean;
}

export function getHomepageImageEdits(): Record<string, HomepageImageEdit> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveHomepageImageEdits(edits: Record<string, HomepageImageEdit>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(edits));
}

export function saveHomepageImageEdit(key: string, edit: HomepageImageEdit) {
  const edits = getHomepageImageEdits();
  edits[key] = { ...edits[key], ...edit };
  saveHomepageImageEdits(edits);
}

export function resetHomepageImage(key: string) {
  const edits = getHomepageImageEdits();
  delete edits[key];
  saveHomepageImageEdits(edits);
}

/* ─── Get effective image source: admin image or default fallback ─── */
export function getHomepageImageSrc(key: string): string {
  const edits = getHomepageImageEdits();
  const edit = edits[key];
  if (edit?.image_url && edit.image_url.trim() !== "") return edit.image_url;
  const slot = HOMEPAGE_IMAGE_SLOTS.find(s => s.key === key);
  return slot?.defaultSrc || "";
}

/* ─── Get effective alt text ─── */
export function getHomepageImageAlt(key: string, lang: string): string {
  const edits = getHomepageImageEdits();
  const edit = edits[key];
  const slot = HOMEPAGE_IMAGE_SLOTS.find(s => s.key === key);
  if (edit) {
    if (lang === "ru" && edit.alt_ru) return edit.alt_ru;
    if (lang === "en" && edit.alt_en) return edit.alt_en;
    if (lang === "tr") return edit.alt_az || edit.alt_en || slot?.alt_az || "Xurcun White City";
    if (edit.alt_az) return edit.alt_az;
  }
  if (!slot) return "Xurcun White City";
  if (lang === "ru") return slot.alt_ru;
  if (lang === "en") return slot.alt_en;
  if (lang === "tr") return slot.alt_az || slot.alt_en;
  return slot.alt_az;
}

/* ─── Check if slot is active ─── */
export function isHomepageImageActive(key: string): boolean {
  const edits = getHomepageImageEdits();
  const edit = edits[key];
  if (edit?.is_active !== undefined) return edit.is_active;
  const slot = HOMEPAGE_IMAGE_SLOTS.find(s => s.key === key);
  return slot?.is_active ?? true;
}
