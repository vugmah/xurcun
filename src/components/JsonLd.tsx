/* ─── JSON-LD Structured Data ───
   Restaurant, LocalBusiness, Organization, WebSite, BreadcrumbList
   No fake reviews or ratings. Valid JSON only.
*/

const SITE = "https://xurcun.az";
const MAPS_URL = "";
const INSTAGRAM = "";
const FACEBOOK = "";

/* ─── Helper: clean undefined values from objects ─── */
function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  });
  return out;
}

/* ─── Organization ─── */
function orgSchema() {
  return clean({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "Xurcun",
    alternateName: "Xurcun",
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/assets/logo.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE}/assets/og-default.jpg`,
    description: "Premium restaurant and lounge.",
    sameAs: INSTAGRAM || FACEBOOK ? [INSTAGRAM, FACEBOOK].filter(Boolean) : undefined,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "reservations",
      availableLanguage: ["Azerbaijani", "Russian", "English", "Turkish"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
      addressLocality: "Baku",
      addressRegion: "Baku",
      addressCountry: "AZ",
    },
  });
}

/* ─── WebSite ─── */
function websiteSchema() {
  return clean({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "Xurcun",
    alternateName: "Xurcun",
    inLanguage: "az",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/#/menu?q={{search_term_string}}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

/* ─── LocalBusiness / Restaurant ─── */
function restaurantSchema() {
  return clean({
    "@context": "https://schema.org",
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": `${SITE}/#restaurant`,
    name: "Xurcun",
    alternateName: "Xurcun",
    url: SITE,
    image: `${SITE}/assets/og-default.jpg`,
    logo: `${SITE}/assets/logo.png`,
    telephone: "",
    email: "",
    priceRange: "$$$",
    currenciesAccepted: "AZN",
    paymentAccepted: "Cash, Credit Card",
    hasMap: MAPS_URL || undefined,
    description: "Premium restaurant and lounge in Baku.",
    servesCuisine: [
      "Azerbaijani",
      "European",
      "Italian",
      "Mediterranean",
      "Brunch",
      "Cocktails",
      "Premium Shisha",
      "Lounge",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "",
      addressLocality: "Baku",
      addressRegion: "Baku",
      addressCountry: "AZ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.4093",
      longitude: "49.8671",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "10:00",
        closes: "23:00",
      },
    ],
    sameAs: INSTAGRAM || FACEBOOK ? [INSTAGRAM, FACEBOOK].filter(Boolean) : undefined,
    menu: `${SITE}/#/menu`,
    acceptsReservations: "True",
    hasMenu: [
      {
        "@type": "Menu",
        name: "A La Carte Menu",
        url: `${SITE}/#/menu`,
      },
      {
        "@type": "Menu",
        name: "Beverage Menu",
        url: `${SITE}/#/menu`,
      },
      {
        "@type": "Menu",
        name: "Shisha Menu",
        url: `${SITE}/#/menu`,
      },
      {
        "@type": "Menu",
        name: "Snack Menu",
        url: `${SITE}/#/menu`,
      },
    ],
    department: [
      {
        "@type": "Restaurant",
        name: "Xurcun Main",
        address: {
          "@type": "PostalAddress",
          streetAddress: "",
          addressLocality: "Baku",
          addressCountry: "AZ",
        },
        telephone: "",
        url: `${SITE}/#/menu/main`,
      },
    ],
  });
}

/* ─── BreadcrumbList ─── */
function breadcrumbSchema(items: { name: string; url: string }[]) {
  return clean({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema()) }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
    />
  );
}

export function RestaurantJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema()) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(items)) }}
    />
  );
}

/** All schemas combined for homepage */
export function AllHomepageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <RestaurantJsonLd />
      <BreadcrumbJsonLd
        items={[{ name: "Ana Səhifə", url: SITE }]}
      />
    </>
  );
}

export default AllHomepageJsonLd;
