import { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import SEO from "@/sections/SEO";
import { trpc } from "@/providers/trpc";
import { defaultsForPage, type L5 } from "@/lib/pageTextStore";

export default function PrivacyPage() {
  const { lang } = useLanguage();

  const q = trpc.pageText.getAll.useQuery({ page: 'privacy' }, { retry: false });
  const map = useMemo(() => {
    const m: Record<string, L5> = {};
    (q.data ?? []).forEach((r) => { m[r.key] = r.value; });
    return m;
  }, [q.data]);
  const def = defaultsForPage('privacy');
  const txt = (key: string, l = lang) => map[key]?.[l] || def[key]?.[l] || def[key]?.az || '';

  return (
    <>
      <SEO page="privacy" />
    <div className="min-h-screen bg-[#F6F2E9] text-[#2E2A25] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-[#7E6228] mb-8" style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontWeight: 600 }}>{txt('title')}</h1>
        <div className="font-body text-sm text-[#3A352E] leading-relaxed whitespace-pre-line">
          {txt('body')}
        </div>
      </div>
    </div>
    </>
  );
}
