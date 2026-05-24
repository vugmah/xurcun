import { useState, useMemo } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { formatPrice } from '../lib/formatPrice'
import { getCategoryTitle as resolveCategoryTitle, getItemName as resolveItemName, getItemDesc as resolveItemDesc } from '../lib/menuData'
import { reorderCategoriesForTime } from '../lib/bakuTime'

type TabType = 'food' | 'beverage' | 'shisha'

// API types
interface ApiCategory {
  id: number;
  menuType: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  sortOrder: number | null;
  isActive: boolean | null;
  items?: ApiItem[];
}

interface ApiItem {
  id: number;
  categoryId: number;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  price: string | null;
  descAz: string | null;
  descRu: string | null;
  descEn: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
  isNew: boolean | null;
}

export default function MenuPage() {
  const { t, lang } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('food')

  const tabs = [
    { key: 'food' as const, label: t.menu_alacarte },
    { key: 'beverage' as const, label: t.menu_beverages },
    { key: 'shisha' as const, label: t.menu_shisha },
  ]

  return (
    <section className="relative bg-[#0A0A0A] min-h-screen pt-28 pb-20 px-[3vw]">
      <div className="max-w-[900px] mx-auto">
        <h2 className="font-display text-[4.5vw] text-white text-center mb-4">{t.menu_label}</h2>
        <p className="font-body text-sm text-[#8A8A8A] text-center mb-12">{t.menu_subtitle}</p>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-16 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-mono text-xs uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-[#D4A853] text-[#0A0A0A]'
                  : 'border border-white/30 text-[#8A8A8A] hover:border-white hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'food' && <MenuTab tab="food" lang={lang} />}
        {activeTab === 'beverage' && <MenuTab tab="beverage" lang={lang} />}
        {activeTab === 'shisha' && <ShishaTab lang={lang} />}

        {/* Service Notes -- only for Food and Beverage, NOT Shisha */}
        {activeTab !== 'shisha' && (
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="font-body text-xs text-[#8A8A8A] mb-2">{t.service_note}</p>
            <p className="font-body text-xs text-[#8A8A8A]">{t.allergy_note}</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* --- Menu Tab: DB-only, no static fallback --- */
function MenuTab({ tab, lang }: { tab: TabType; lang: string }) {
  const { data: categories = [], isLoading } = trpc.menu.getMenu.useQuery({ tab }, {
    retry: false,
    refetchOnWindowFocus: false,
  })

  const displayCategories = useMemo(() => {
    const activeCats = (categories as ApiCategory[]).filter((c: ApiCategory) => c.isActive !== false)
    return tab === 'food' ? reorderCategoriesForTime(activeCats as any).categories : activeCats
  }, [categories, tab])

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (displayCategories.length === 0) {
    return <div className="text-center py-12 text-[#8A8A8A] font-body text-sm">No items</div>
  }

  return (
    <div>
      {displayCategories.map((cat: any) => (
        <div key={cat.id} className="mb-12">
          <h3 className="font-display text-xl text-[#D4A853] mb-6 pb-3 border-b border-[#D4A853]/30">
            {resolveCategoryTitle(cat, lang)}
          </h3>
          <div className="space-y-4">
            {cat.items?.filter((item: ApiItem) => item.isActive !== false).map((item: ApiItem) => (
              <div key={item.id} className="flex items-start justify-between gap-4 w-full">
                <div className="min-w-0 flex-1">
                  <span className="font-body text-sm text-white break-words">{resolveItemName(item, lang)}</span>
                  {item.isNew && (
                    <span className="ml-2 inline-block bg-[#D4A853] text-[#0A0A0A] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                  )}
                  {resolveItemDesc(item, lang) && (
                    <p className="font-body text-xs font-light text-[#8A8A8A] mt-1 leading-relaxed break-words">
                      {resolveItemDesc(item, lang)}
                    </p>
                  )}
                </div>
                {item.price && (
                  <div className="shrink-0 whitespace-nowrap text-right">
                    <span className="font-mono text-xs text-[#D4A853]">{formatPrice(item.price)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* --- Shisha Tab: API-driven via trpc.menu.getMenu --- */
function ShishaTab({ lang }: { lang: string }) {
  const { t } = useLanguage()
  const { data: shishaCategories = [], isLoading } = trpc.menu.getMenu.useQuery(
    { tab: "shisha" },
    { retry: false, refetchOnWindowFocus: false }
  )

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-2 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (shishaCategories.length === 0) {
    return <div className="text-center py-12 text-[#8A8A8A] font-body text-sm">No items</div>
  }

  return (
    <div>
      {(shishaCategories as ApiCategory[]).map((cat: ApiCategory) => (
        <div key={cat.id} className="mb-12">
          <h3 className="font-display text-xl text-[#D4A853] mb-6 pb-3 border-b border-[#D4A853]/30">
            {resolveCategoryTitle(cat, lang)}
          </h3>
          <div className="space-y-4">
            {cat.items?.filter((item: ApiItem) => item.isActive !== false).map((item: ApiItem) => (
              <div key={item.id} className="flex items-start justify-between gap-4 w-full">
                <div className="min-w-0 flex-1">
                  <span className="font-body text-sm text-white break-words">{resolveItemName(item, lang)}</span>
                  {item.isNew && (
                    <span className="ml-2 inline-block bg-[#D4A853] text-[#0A0A0A] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                  )}
                  {resolveItemDesc(item, lang) && (
                    <p className="font-body text-xs font-light text-[#8A8A8A] mt-1 leading-relaxed break-words">
                      {resolveItemDesc(item, lang)}
                    </p>
                  )}
                </div>
                {item.price && (
                  <div className="shrink-0 whitespace-nowrap text-right">
                    <span className="font-mono text-xs text-[#D4A853]">{formatPrice(item.price)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Shisha Note */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="font-body text-xs text-[#8A8A8A] italic">{t.shisha_note}</p>
      </div>
    </div>
  )
}
