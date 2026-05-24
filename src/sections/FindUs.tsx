import { useEffect, useRef, useState, useCallback } from "react";

declare const google: any;
import { MapPin, Navigation } from "lucide-react";
import { getGeneralSettings, getActiveBranches } from "@/lib/generalSettings";

/* ═══════════════════════════════════════════════════════════
   XURCUN — Verified Google Maps Integration
   ═══════════════════════════════════════════════════════════

   White City: 40.3799478, 49.8908821
   Verified: https://maps.app.goo.gl/A8tpvvMxoSp3haUg6

   Seabreeze: Location will be added when verified link provided.
   NO fake coordinates. NO guessed locations.
   ═══════════════════════════════════════════════════════════ */

const settings = getGeneralSettings();
const activeBranches = getActiveBranches();
const wcBranch = activeBranches.find((b) => b.slug === "white-city");

const BRANCHES = [
  {
    id: "white-city",
    name: "Xurcun White City",
    lat: 40.3799478,
    lng: 49.8908821,
    address: wcBranch?.address || "1-ci yaşıl ada, küçəsi, Bakı, Azərbaycan",
    mapsUrl: wcBranch?.mapsUrl || "https://maps.app.goo.gl/A8tpvvMxoSp3haUg6",
    phone: settings.phone || "+994502130555",
    verified: true,
  },
  {
    id: "seabreeze",
    name: "Xurcun Seabreeze",
    lat: null,
    lng: null,
    address: null,
    mapsUrl: null,
    phone: null,
    verified: false,
  },
] as const;

/* ─── Lazy-load Google Maps JS API ─── */
let mapsLoadPromise: Promise<any> | null = null;

function loadGoogleMaps(): Promise<any> {
  if (mapsLoadPromise) return mapsLoadPromise;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("MAP_KEY_MISSING")); // silent internal code, NOT shown to users

  mapsLoadPromise = new Promise((resolve, reject) => {
    const scriptId = "google-maps-script";
    if (document.getElementById(scriptId)) {
      const check = setInterval(() => {
        if ((window as any).google?.maps) { clearInterval(check); resolve((window as any).google.maps); }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=__initGMap`;
    script.async = true;
    script.defer = true;
    (window as any).__initGMap = () => resolve((window as any).google.maps);
    script.onerror = () => reject(new Error("Google Maps load failed"));
    document.head.appendChild(script);
  });

  return mapsLoadPromise;
}

/* ─── XURCUN marker — uses the uploaded brand logo image exactly ───
   Siyah dairesel arka plan + altın "W" + "XURCUN" yazısı.
   Kullanıcının verdiği logonun birebir aynısı.
   ═══════════════════════════════════════════════════════════ */
function createMarkerPin(): HTMLElement {
  const div = document.createElement("div");
  div.style.position = "relative";
  div.style.width = "44px";
  div.style.height = "44px";
  div.style.cursor = "pointer";
  div.innerHTML = `
    <img src="/assets/the-woo-marker.jpg"
         alt="XURCUN"
         width="44"
         height="44"
         style="width:44px;height:44px;border-radius:50%;object-fit:cover;
                box-shadow:0 2px 6px rgba(0,0,0,0.5),0 0 0 2px #C9A96E;
                border:2px solid #C9A96E;display:block;"
    />
  `;
  return div;
}

/* ─── Dark luxury map style ─── */
const MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#C9A96E" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A0A" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#C9A96E" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8A8A8A" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#141414" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#222222" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#333333" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#999999" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2A2A2A" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#C9A96E" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1A1A1A" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D0D0D" }] },
];

/* ═══ Map Component ═══ */
function WooMap({ activeBranch, onMarkerClick }: {
  activeBranch: string | null;
  onMarkerClick: (id: string) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const initMap = useCallback(async () => {
    if (!mapDivRef.current) return;
    try {
      const maps = await loadGoogleMaps();
      const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as any;

      const verifiedBranch = BRANCHES.find(b => b.verified);
      const center = verifiedBranch
        ? { lat: verifiedBranch.lat!, lng: verifiedBranch.lng! }
        : { lat: 40.3799, lng: 49.8908 };

      const map = new maps.Map(mapDivRef.current, {
        center,
        zoom: 15,
        mapId: "THE_WOO_MAP",
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "cooperative",
        styles: MAP_STYLE,
      });

      mapRef.current = map;

      // Create markers ONLY for verified branches
      for (const branch of BRANCHES) {
        if (!branch.verified || branch.lat === null || branch.lng === null) continue;

        const pin = createMarkerPin();
        pin.addEventListener("click", () => onMarkerClick(branch.id));

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: branch.lat, lng: branch.lng },
          content: pin,
          title: branch.name,
        });

        marker.addEventListener("gmp-click", () => onMarkerClick(branch.id));
        markersRef.current.set(branch.id, marker);
      }

      // If only one marker, center on it
      if (markersRef.current.size === 1) {
        const m = Array.from(markersRef.current.values())[0];
        const pos = m.position;
        if (pos) map.setCenter(pos);
      }

    } catch (err: any) {
      setError(err?.message || "Map failed to load");
    }
  }, [onMarkerClick]);

  useEffect(() => {
    initMap();
    return () => {
      markersRef.current.forEach(m => { m.map = null; });
      markersRef.current.clear();
      mapRef.current = null;
    };
  }, [initMap]);

  // Pan to selected branch
  useEffect(() => {
    if (!mapRef.current || !activeBranch) return;
    const branch = BRANCHES.find(b => b.id === activeBranch);
    if (branch?.verified && branch.lat && branch.lng) {
      mapRef.current.panTo({ lat: branch.lat, lng: branch.lng });
      mapRef.current.setZoom(16);
    }
  }, [activeBranch]);

  if (error) {
    /* ─── Clean fallback when map can't load (no API key, network, etc.) ─── */
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#111] px-6">
        <MapPin className="w-10 h-10 mb-3 text-[#C9A96E]" />
        <p className="text-white text-sm font-medium mb-4">Our Locations</p>
        <div className="w-full max-w-sm space-y-3">
          {BRANCHES.filter((b) => b.verified).map((branch) => (
            <div key={branch.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#222] bg-[#0A0A0A]">
              <div className="w-8 h-8 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">{branch.name}</p>
                <p className="text-xs text-white/50 truncate">{branch.address}</p>
              </div>
              {branch.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 rounded-md bg-[#C9A96E] text-[#0A0A0A] text-xs font-semibold hover:bg-[#D4A853] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open in Maps
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div ref={mapDivRef} className="w-full h-full" />;
}

/* ═══ Main Section ═══ */
export default function FindUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Lazy-load map on scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(section); }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setActiveBranch(id);
    const branch = BRANCHES.find(b => b.id === id);
    if (branch?.verified) {
      setShowComingSoon(false);
    }
  }, []);

  const handleCardClick = useCallback((branch: typeof BRANCHES[number]) => {
    if (branch.verified) {
      setActiveBranch(branch.id);
      setShowComingSoon(false);
    } else {
      setActiveBranch(branch.id);
      setShowComingSoon(true);
    }
  }, []);

  const activeData = BRANCHES.find(b => b.id === activeBranch);

  return (
    <section ref={sectionRef} id="find-us" className="w-full bg-[#0A0A0A] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 text-[#C9A96E] mb-4">
            <MapPin className="w-5 h-5" />
            <span className="text-xs tracking-[0.25em] uppercase font-medium">Find Us</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
            Find Us
          </h2>
          <div className="w-16 h-px bg-[#C9A96E] mx-auto mt-4" />
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-[#222] shadow-2xl shadow-black/50"
          style={{ aspectRatio: "16 / 9", minHeight: "300px", maxHeight: "500px" }}>
          {isVisible ? (
            <WooMap activeBranch={activeBranch} onMarkerClick={handleMarkerClick} />
          ) : (
            <div className="w-full h-full bg-[#111] flex items-center justify-center">
              <div className="text-center text-white/30">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse text-[#C9A96E]" />
                <p className="text-sm">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Coming soon message for Seabreeze */}
        {showComingSoon && activeData && !activeData.verified && (
          <div className="mt-4 p-4 rounded-lg border border-[#C9A96E]/30 bg-[#1A1508] text-center">
            <p className="text-[#C9A96E] text-sm font-medium">{activeData.name}</p>
            <p className="text-white/50 text-xs mt-1">Location will be added soon</p>
          </div>
        )}

        {/* Branch cards */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {BRANCHES.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleCardClick(branch)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-200
                ${activeBranch === branch.id && branch.verified
                  ? "border-[#C9A96E] bg-[#1A1508]"
                  : activeBranch === branch.id && !branch.verified
                    ? "border-[#C9A96E]/50 bg-[#1A1508]/50"
                    : "border-[#222] bg-[#111] hover:border-[#333] hover:bg-[#141414]"
                }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors
                ${activeBranch === branch.id && branch.verified ? "bg-[#C9A96E]" : "bg-[#1A1A1A] group-hover:bg-[#222]"}`}>
                <MapPin className={`w-4 h-4 ${activeBranch === branch.id && branch.verified ? "text-[#0A0A0A]" : "text-[#C9A96E]"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{branch.name}</p>
                <p className="text-xs text-white/50 truncate">
                  {branch.verified ? branch.address : "Coming soon"}
                </p>
              </div>
              {branch.verified && branch.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 p-1.5 rounded-md text-white/30 hover:text-[#C9A96E] hover:bg-[#1A1A1A] transition-colors"
                  title="Open in Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
