import { useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import SEO from "@/sections/SEO";
import { trpc } from "@/providers/trpc";
import { defaultsForPage } from "@/lib/pageTextStore";

export default function CookiePolicyPage() {
  const { lang } = useLanguage();

  const { data } = trpc.pageText.getAll.useQuery({ page: "cookie" });
  const def = useMemo(() => defaultsForPage("cookie"), []);
  const map = useMemo(
    () => Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, Record<string, string>>,
    [data],
  );
  const txt = (key: string, l = lang) => map[key]?.[l] || def[key]?.[l] || def[key]?.az || "";

  return (
    <>
      <SEO page="cookie-policy" />
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
