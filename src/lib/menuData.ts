export interface MenuItem {
  name_az: string
  name_ru: string
  name_en: string
  name_tr?: string
  price?: string
  desc_az?: string
  desc_ru?: string
  desc_en?: string
  desc_tr?: string
  image_url?: string
  is_new?: boolean
  is_meat?: boolean
  is_fish?: boolean
  is_vegetarian?: boolean
  is_halal?: boolean
  is_spicy?: boolean
  is_gluten_free?: boolean
  is_sugar_free?: boolean
}

export interface MenuCategory {
  id: string
  title_az: string
  title_ru: string
  title_en: string
  title_tr?: string
  sortOrder?: number
  items: MenuItem[]
}

export interface ShishaData {
  hookahs: { name_az: string; name_ru: string; name_en: string; name_tr?: string; price: string; image_url?: string; is_new?: boolean; is_meat?: boolean; is_fish?: boolean; is_vegetarian?: boolean; is_halal?: boolean }[]
  bestSellers: string[]
  premium: string[]
  classic: string[]
}

/* ═══════════════════════════════════════════
   UNIFIED TRANSLATION RESOLVERS
   Fallback order: selected → EN → AZ → RU → ""
   Supports both snake_case (menuData) and camelCase (API).
   ═══════════════════════════════════════════ */

function pick<T>(obj: any, snakeKey: string, camelKey?: string): T | undefined {
  if (!obj || typeof obj !== 'object') return undefined
  const v1 = obj[snakeKey]
  if (v1 !== undefined && v1 !== null && v1 !== '') return v1
  if (camelKey) {
    const v2 = obj[camelKey]
    if (v2 !== undefined && v2 !== null && v2 !== '') return v2
  }
  return undefined
}

export const getCategoryTitle = (cat: any, lang: string): string => {
  const tr = pick<string>(cat, 'title_tr', 'titleTr')
  const en = pick<string>(cat, 'title_en', 'titleEn')
  const az = pick<string>(cat, 'title_az', 'titleAz')
  const ru = pick<string>(cat, 'title_ru', 'titleRu')
  if (lang === 'tr' && tr) return tr
  if (lang === 'ru' && ru) return ru
  if (lang === 'en' && en) return en
  if (lang === 'az' && az) return az
  return en || az || ru || ''
}

export const getItemName = (item: any, lang: string): string => {
  const tr = pick<string>(item, 'name_tr', 'nameTr')
  const en = pick<string>(item, 'name_en', 'nameEn')
  const az = pick<string>(item, 'name_az', 'nameAz')
  const ru = pick<string>(item, 'name_ru', 'nameRu')
  if (lang === 'tr' && tr) return tr
  if (lang === 'ru' && ru) return ru
  if (lang === 'en' && en) return en
  if (lang === 'az' && az) return az
  return en || az || ru || ''
}

export const getItemDesc = (item: any, lang: string): string | undefined => {
  const tr = pick<string>(item, 'desc_tr', 'descTr')
  const en = pick<string>(item, 'desc_en', 'descEn')
  const az = pick<string>(item, 'desc_az', 'descAz')
  const ru = pick<string>(item, 'desc_ru', 'descRu')
  if (lang === 'tr' && tr) return tr
  if (lang === 'ru' && ru) return ru
  if (lang === 'en' && en) return en
  if (lang === 'az' && az) return az
  return en || az || ru || undefined
}

// ── Re-export static data for backward compatibility ──
export { alacarteData, beverageData, shishaData } from './menuData.static'
