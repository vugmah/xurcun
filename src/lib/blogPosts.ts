// Xurcun blog — evergreen, SEO-focused articles (AZ). Content-in-code (no CMS).
// Each post: SEO meta + structured body. Slugs are stable; also mirrored in
// api/lib/vite.ts (ROUTE_META) and api/boot.ts (sitemap).

export type BlogSection = { h2: string; body: string[] };
export type BlogPost = {
  slug: string;
  title: string;   // <title> (50–60 char)
  desc: string;    // meta description (150–160)
  h1: string;
  date: string;    // ISO
  cover: string;   // og + hero image
  lead: string;    // intro paragraph
  sections: BlogSection[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "toy-xoncasi",
    title: "Toy xonçası — premium hədiyyə xonçaları | Xurcun",
    desc: "Toy, nişan və hədiyyə xonçaları: necə hazırlanır, içində nə olur və Xurcun-dan premium xonça necə sifariş edilir. Bakıda 11 mağaza.",
    h1: "Toy xonçası — ənənə və zərafət bir arada",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    lead: "Toy və nişan mərasimlərinin ən gözəl ənənələrindən biri olan xonça — qarşı tərəfə hörmət və zövqün ifadəsidir. Xurcun premium quru meyvə, qoz-fındıq, şokolad, lokum və paxlava ilə bəzədilmiş, əl işi xonçalar hazırlayır.",
    sections: [
      {
        h2: "Xonça nədir və niyə vacibdir?",
        body: [
          "Xonça — bəzədilmiş sini və ya qutuda təqdim olunan hədiyyə dəstidir. Azərbaycan toy adətlərində oğlan və qız evi arasında hörmət əlaməti kimi mübadilə olunur.",
          "Xonçanın görünüşü və içindəkilər ailənin zövqünü əks etdirir — buna görə keyfiyyət və zərafət əsasdır.",
        ],
      },
      {
        h2: "Xurcun xonçalarının içində nə olur?",
        body: [
          "Seçmə quru meyvələr (ərik, əncir, gavalı), premium qoz-fındıq, ləziz şokoladlar, müxtəlif çeşid lokum və ənənəvi paxlava.",
          "Hər xonça əl işi ilə, qızıl lent və zövqlü tərtibatla hazırlanır — istəyə görə tərkibi fərdiləşdirmək mümkündür.",
        ],
      },
      {
        h2: "Necə sifariş etmək olar?",
        body: [
          "Kataloqdan bəyəndiyiniz məhsulları seçib WhatsApp ilə sifariş edə, yaxud Bakıdakı 11 Xurcun mağazasından birinə yaxınlaşa bilərsiniz.",
          "Korporativ və çoxsaylı sifarişlər üçün xüsusi tərtibat və endirim imkanları mövcuddur.",
        ],
      },
    ],
  },
  {
    slug: "bayram-hediyyeleri",
    title: "Bayram hədiyyələri — Novruz, Ramazan, Yeni il | Xurcun",
    desc: "Bayramlar üçün premium hədiyyə ideyaları: quru meyvə, şokolad, lokum və paxlava qutuları. Xurcun-dan zövqlü bayram hədiyyələri, Bakı.",
    h1: "Bayram hədiyyələri — hər mərasim üçün zövqlü seçim",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    lead: "Novruz, Ramazan, Yeni il və ya doğum günü — hər bayramın öz dadı var. Xurcun premium quru meyvə, çərəz və şirniyyatlardan ibarət, hər münasibətə uyğun hədiyyə qutuları təqdim edir.",
    sections: [
      {
        h2: "Novruz üçün",
        body: [
          "Novruz süfrəsinin yaraşığı — quru meyvə, qoz-fındıq, şəkərbura və paxlava. Xurcun bayram qutuları milli ənənəni premium keyfiyyətlə birləşdirir.",
        ],
      },
      {
        h2: "Ramazan və Yeni il üçün",
        body: [
          "Ramazanda lokum, xurma və çay dəstləri; Yeni ildə isə şokolad və qarışıq hədiyyə qutuları ən çox seçilən variantlardır.",
          "Bütün qutular əl işi ilə bəzədilir və hədiyyə üçün hazır təqdim olunur.",
        ],
      },
      {
        h2: "Korporativ bayram hədiyyələri",
        body: [
          "Şirkətlər üçün loqolu və xüsusi tərtibatlı korporativ hədiyyə qutuları hazırlayırıq. Çoxsaylı sifarişlərə xüsusi şərtlər tətbiq olunur.",
        ],
      },
    ],
  },
  {
    slug: "premium-hediyye-qutulari",
    title: "Premium hədiyyəlik qutular | Xurcun — əl işi qutular",
    desc: "Əl işi premium hədiyyə qutuları — korporativ, bayram və şəxsi münasibətlər üçün. Quru meyvə, şokolad, lokum və paxlava ilə. Xurcun, Bakı.",
    h1: "Premium hədiyyəlik qutular",
    date: "2026-06-28",
    cover: "/brand/og-image.jpg",
    lead: "Hədiyyə vermək bir incəsənətdir. Xurcun-un əl işi ağac və qutu tərtibatlı premium hədiyyə dəstləri — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün hazırlanır.",
    sections: [
      {
        h2: "Kimlər üçün uyğundur?",
        body: [
          "Korporativ müştərilər, biznes tərəfdaşları, sevdikləriniz və ya özünüz üçün — hər zövqə uyğun ölçü və tərkib seçimi mövcuddur.",
        ],
      },
      {
        h2: "Fərdiləşdirmə",
        body: [
          "Qutunun içindəkiləri, ölçüsünü və tərtibatını istəyinizə görə seçə bilərsiniz. Korporativ sifarişlər üçün loqo və xüsusi dizayn mümkündür.",
        ],
      },
      {
        h2: "Sifariş",
        body: [
          "Kataloqa baxın, bəyəndiyinizi seçin və WhatsApp ilə sifariş edin — və ya Bakıdakı 11 mağazamızdan birinə gəlin.",
        ],
      },
    ],
  },
  {
    slug: "sokolad",
    title: "Premium şokolad | Xurcun — süd və qara şokolad",
    desc: "Xurcun premium şokoladları — süd, qara və qarışıq çeşidlər. Hədiyyə üçün ideal şokolad qutuları. Bakıda 11 mağaza, WhatsApp ilə sifariş.",
    h1: "Premium şokolad seçimi",
    date: "2026-06-28",
    cover: "/images/home/about.webp",
    lead: "Keyfiyyətli kakao, zərif dad. Xurcun-un premium şokolad çeşidi — həm gündəlik zövq, həm də hədiyyə üçün mükəmməl seçimdir.",
    sections: [
      {
        h2: "Çeşidlər",
        body: [
          "Süd şokoladı, qara şokolad və qoz-fındıqlı qarışıqlar. Hər biri seçmə tərkib və zərif təqdimatla.",
        ],
      },
      {
        h2: "Hədiyyə üçün şokolad",
        body: [
          "Şokoladlar premium hədiyyə qutularının da əsas tərkib hissəsidir — bayram və korporativ hədiyyələr üçün ideal.",
        ],
      },
    ],
  },
  {
    slug: "paxlava",
    title: "Paxlava | Xurcun — ənənəvi dad, premium keyfiyyət",
    desc: "Xurcun paxlavası — ənənəvi resept, seçmə qoz-fındıq və premium keyfiyyət. Bayram süfrələri və hədiyyə üçün. Bakıda 11 mağaza.",
    h1: "Paxlava — ənənəvi dad, premium keyfiyyət",
    date: "2026-06-28",
    cover: "/images/home/about.webp",
    lead: "Paxlava — Azərbaycan və Şərq süfrələrinin baş tacı. Xurcun paxlavası ənənəvi resept əsasında, seçmə qoz-fındıq və keyfiyyətli tərkiblə hazırlanır.",
    sections: [
      {
        h2: "Niyə Xurcun paxlavası?",
        body: [
          "Təbii tərkib, konservant yoxdur, seçmə qoz-fındıq və balanslı şirinlik — hər tikədə ənənəvi dad.",
        ],
      },
      {
        h2: "Bayram və hədiyyə üçün",
        body: [
          "Paxlava bayram süfrələrinin və hədiyyə xonçalarının ayrılmaz hissəsidir. Hədiyyə üçün hazır qutularda təqdim olunur.",
        ],
      },
    ],
  },
  {
    slug: "lokum",
    title: "Lokum (rahat) | Xurcun — çeşidlər və hədiyyə",
    desc: "Xurcun lokumu — qoz, püstə və meyvəli çeşidlər. Hədiyyə üçün zərif lokum qutuları. Premium keyfiyyət, Bakıda 11 mağaza.",
    h1: "Lokum — zərif dad, rəngarəng çeşid",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    lead: "Lokum (rahat) — yumşaq, ətirli və rəngarəng. Xurcun-un lokum çeşidi seçmə tərkib və zərif təqdimatla həm zövq, həm hədiyyə üçün uyğundur.",
    sections: [
      {
        h2: "Çeşidlər",
        body: [
          "Qoz lokum, püstəli lokum və meyvəli variantlar — müxtəlif dad və rəng seçimi.",
        ],
      },
      {
        h2: "Hədiyyə üçün lokum",
        body: [
          "Lokum premium hədiyyə qutularının və toy xonçalarının sevimli tərkib hissəsidir.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
