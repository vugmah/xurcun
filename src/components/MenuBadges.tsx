/* ═══════════════════════════════════════════════════════════════════
   MENU BADGES — DB source-of-truth ONLY

   NO localStorage fallback. NO static fallback.
   Badge data MUST come from DB via `itemData` prop.

   itemData shape (from menuItems DB row):
   {
     isNew, isSpicy, isGlutenFree, isSugarFree,
     isMeat, isFish, isVegetarian, isHalal, isSnack
   }

   If itemData is NOT provided, component renders NOTHING.
   This enforces single source-of-truth.
   ═══════════════════════════════════════════════════════════════════ */

interface BadgeData {
  isNew?: boolean
  isSpicy?: boolean
  isGlutenFree?: boolean
  isSugarFree?: boolean
  isMeat?: boolean
  isFish?: boolean
  isVegetarian?: boolean
  isHalal?: boolean
  isSnack?: boolean
}

/** Extract badge state from DB itemData */
function resolveBadges(itemData: BadgeData | undefined) {
  if (!itemData) {
    /* DB source-of-truth enforced: no itemData = no badges */
    return {
      is_new: false, is_meat: false, is_fish: false,
      is_vegetarian: false, is_halal: false, is_spicy: false,
      is_snack: false, is_gluten_free: false, is_sugar_free: false,
    }
  }
  return {
    is_new: itemData.isNew ?? false,
    is_meat: itemData.isMeat ?? false,
    is_fish: itemData.isFish ?? false,
    is_vegetarian: itemData.isVegetarian ?? false,
    is_halal: itemData.isHalal ?? false,
    is_spicy: itemData.isSpicy ?? false,
    is_snack: itemData.isSnack ?? false,
    is_gluten_free: itemData.isGlutenFree ?? false,
    is_sugar_free: itemData.isSugarFree ?? false,
  }
}

/* ─── Homepage badge style — inline, compact ─── */
function HomepageBadge({ emoji, text, colorClass }: { emoji?: string; text: string; colorClass: string }) {
  if (text === 'NEW') {
    return (
      <span className="ml-2 inline-flex items-center rounded-full border border-red-500 bg-transparent px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-red-400">
        NEW
      </span>
    )
  }
  return (
    <span className={`ml-1.5 inline-flex items-center gap-1 rounded-full bg-opacity-10 px-2 py-0.5 text-[10px] ${colorClass}`}>
      {emoji && <span>{emoji}</span>}
      {text}
    </span>
  )
}

/* ─── QR badge style — below description ─── */
function QrBadge({ emoji, text, colorClass }: { emoji?: string; text: string; colorClass: string }) {
  if (text === 'NEW') {
    return (
      <span className="ml-1.5 inline-flex items-center rounded-full border border-white bg-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red-500">
        NEW
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-0.5 rounded bg-opacity-10 px-1.5 py-0.5 text-[9px] ${colorClass}`}>
      {emoji && <span>{emoji}</span>}
      {text}
    </span>
  )
}

/* ═══ Homepage badges — DB-driven ONLY ═══ */
export function MenuBadgesHomepage({ itemData, isDessert }: { itemData?: BadgeData; isDessert?: boolean }) {
  if (isDessert) {
    const b = resolveBadges(itemData)
    if (!b.is_new && !b.is_gluten_free && !b.is_sugar_free) return null
    return (
      <>
        {b.is_new && <HomepageBadge text="NEW" colorClass="" />}
        {b.is_gluten_free && <HomepageBadge emoji="🌾" text="Glutensiz" colorClass="text-teal-300 bg-teal-400" />}
        {b.is_sugar_free && <HomepageBadge emoji="🚫" text="Şəkərsiz" colorClass="text-purple-300 bg-purple-400" />}
      </>
    )
  }
  const b = resolveBadges(itemData)
  if (!b.is_new && !b.is_meat && !b.is_fish && !b.is_vegetarian && !b.is_halal && !b.is_spicy && !b.is_snack) return null

  return (
    <>
      {b.is_new && <HomepageBadge text="NEW" colorClass="" />}
      {b.is_meat && <HomepageBadge emoji="🥩" text="Et" colorClass="text-red-300 bg-red-400" />}
      {b.is_fish && <HomepageBadge emoji="🐟" text="Balıq" colorClass="text-blue-300 bg-blue-400" />}
      {b.is_vegetarian && <HomepageBadge emoji="🥬" text="Vegetarian" colorClass="text-green-300 bg-green-400" />}
      {b.is_halal && <HomepageBadge emoji="☪" text="Halal" colorClass="text-[#C9A96E] bg-[#C9A96E]" />}
      {b.is_spicy && <HomepageBadge emoji="🌶️" text="Acılı" colorClass="text-red-500 bg-red-600" />}
      {b.is_snack && <HomepageBadge emoji="" text="Snack" colorClass="text-orange-300 bg-orange-400" />}
    </>
  )
}

/* ═══ QR menu badges — DB-driven ONLY ═══ */
export function MenuBadgesQR({ itemData, isDessert }: { itemData?: BadgeData; isDessert?: boolean }) {
  if (isDessert) {
    const b = resolveBadges(itemData)
    if (!b.is_new && !b.is_gluten_free && !b.is_sugar_free) return null
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {b.is_gluten_free && <QrBadge emoji="🌾" text="Glutensiz" colorClass="text-teal-300 bg-teal-400" />}
        {b.is_sugar_free && <QrBadge emoji="🚫" text="Şəkərsiz" colorClass="text-purple-300 bg-purple-400" />}
      </div>
    )
  }
  const b = resolveBadges(itemData)
  if (!b.is_new && !b.is_meat && !b.is_fish && !b.is_vegetarian && !b.is_halal && !b.is_spicy && !b.is_snack) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {b.is_meat && <QrBadge emoji="🥩" text="Et" colorClass="text-red-300 bg-red-400" />}
      {b.is_fish && <QrBadge emoji="🐟" text="Balıq" colorClass="text-blue-300 bg-blue-400" />}
      {b.is_vegetarian && <QrBadge emoji="🥬" text="Vegetarian" colorClass="text-green-300 bg-green-400" />}
      {b.is_halal && <QrBadge emoji="☪" text="Halal" colorClass="text-[#C9A96E] bg-[#C9A96E]" />}
      {b.is_spicy && <QrBadge emoji="🌶️" text="Acılı" colorClass="text-red-500 bg-red-600" />}
      {b.is_snack && <QrBadge emoji="" text="Snack" colorClass="text-orange-300 bg-orange-400" />}
    </div>
  )
}

export function NewBadgeQR() {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-full border border-white bg-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red-500">
      NEW
    </span>
  )
}

/** DEPRECATED: Use itemData.isNew directly */
export function hasNewBadge(): boolean {
  return false
}

/* ═══ Admin product list badges — DB-driven ═══ */
export function AdminBadges({ itemData }: { itemData: BadgeData }) {
  const badges = [
    itemData.isNew && { emoji: '', text: 'NEW', color: 'text-red-400 border-red-400' },
    itemData.isMeat && { emoji: '🥩', text: 'Et', color: 'text-red-300 bg-red-400/10' },
    itemData.isFish && { emoji: '🐟', text: 'Balıq', color: 'text-blue-300 bg-blue-400/10' },
    itemData.isVegetarian && { emoji: '🥬', text: 'Vegetarian', color: 'text-green-300 bg-green-400/10' },
    itemData.isHalal && { emoji: '☪', text: 'Halal', color: 'text-[#C9A96E] bg-[#C9A96E]/10' },
    itemData.isSpicy && { emoji: '🌶️', text: 'Acılı', color: 'text-red-500 bg-red-600/10' },
    itemData.isSnack && { emoji: '', text: 'Snack', color: 'text-orange-300 bg-orange-400/10' },
    itemData.isGlutenFree && { emoji: '🌾', text: 'Glutensiz', color: 'text-teal-300 bg-teal-400/10' },
    itemData.isSugarFree && { emoji: '🚫', text: 'Şəkərsiz', color: 'text-purple-300 bg-purple-400/10' },
  ].filter(Boolean) as { emoji: string; text: string; color: string }[]

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b, i) => (
        <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${b.color}`}>
          {b.emoji && <span>{b.emoji}</span>} {b.text}
        </span>
      ))}
    </div>
  )
}
