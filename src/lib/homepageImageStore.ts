/* ─── Homepage image slots ───────────────────────────────────────────────
 * Each slot maps to one overridable image on the public HomePage.
 * Overrides persist server-side in the `photos` table, one row per slot,
 * keyed by section = `homepage:<key>` (see api/routers/photos.ts).
 * The `defaultSrc` of each slot mirrors the in-code constant in HomePage.tsx
 * and is the SSR / no-JS / empty-DB fallback.
 * ───────────────────────────────────────────────────────────────────────── */

export interface HomepageImageSlot {
  key: string;
  /** Human label (AZ) */
  label: string;
  /** photos.section value for this slot */
  section: string;
  defaultSrc: string;
  alt?: string;
}

export function homepageSection(key: string): string {
  return `homepage:${key}`;
}

export const HOMEPAGE_IMAGE_SLOTS: HomepageImageSlot[] = [
  {
    key: "logo",
    label: "Loqo",
    section: homepageSection("logo"),
    defaultSrc: "/brand/logo-gold.png",
    alt: "Xurcun",
  },
  {
    key: "hero_poster",
    label: "Hero video posteri",
    section: homepageSection("hero_poster"),
    defaultSrc: "/images/home/hero.webp",
  },
  {
    key: "gift",
    label: "Hədiyyə bölməsi şəkli",
    section: homepageSection("gift"),
    defaultSrc: "/images/home/gift.jpg",
  },
  {
    key: "about_poster",
    label: "Haqqımızda video posteri",
    section: homepageSection("about_poster"),
    defaultSrc: "/images/gv-ribbons.webp",
  },
  {
    key: "anniversary_poster",
    label: "İldönümü video posteri",
    section: homepageSection("anniversary_poster"),
    defaultSrc: "/images/anniversary.webp",
  },
];

export function defaultFor(key: string): string {
  return HOMEPAGE_IMAGE_SLOTS.find((s) => s.key === key)?.defaultSrc ?? "";
}
