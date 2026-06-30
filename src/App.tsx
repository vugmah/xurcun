import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";
import RootErrorBoundary from "@/components/RootErrorBoundary";
import HomePage from "./pages/HomePage";
const QRMenuPage = lazy(() => import("./pages/QRMenuPage"));
const CatalogStorefront = lazy(() => import("./pages/CatalogPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
import PrivacyPage from "./pages/PrivacyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import AboutPage from "./pages/AboutPage";
import FaqPage from "./pages/FaqPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CorporatePage from "./pages/CorporatePage";
import GiftCardPage from "./pages/GiftCardPage";
import NotFoundPage from "./pages/NotFoundPage";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { useAutoPageView } from "./hooks/useTracking";
import { useConversionTracking } from "./hooks/useConversionTracking";
import { initCopyProtection } from "./lib/copyProtection";
import { useEffect } from "react";
import PopupRenderer from "./components/PopupRenderer";
import WhatsAppFab from "./components/WhatsAppFab";

// Admin shell is NOT lazy-loaded — it renders instantly
import AdminLayout from "./pages/admin/AdminLayout";
const LoginPage = lazy(() => import("./pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const CatalogPage = lazy(() => import("./pages/admin/CatalogPage"));
const CafeMenuPage = lazy(() => import("./pages/admin/CafeMenuPage"));
const BranchesPage = lazy(() => import("./pages/admin/BranchesPage"));
const QrPage = lazy(() => import("./pages/admin/QrPage"));
const SeoPage = lazy(() => import("./pages/admin/SeoPage"));
const MediaPage = lazy(() => import("./pages/admin/MediaPage"));
const MailSettingsPage = lazy(() => import("./pages/admin/MailSettingsPage"));
const InboxPage = lazy(() => import("./pages/admin/InboxPage"));
const OrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const GoogleAdsPage = lazy(() => import("./pages/admin/GoogleAdsPage"));
const HomepagePhotosPage = lazy(() => import("./pages/admin/HomepagePhotosPage"));
const SettingsPage = lazy(() => import("./pages/admin/SettingsPage"));

const AiAuditorPage = lazy(() => import("./pages/admin/AiAuditorPage"));
const AiInsightsPage = lazy(() => import("./pages/admin/AiInsightsPage"));
const PopupCampaignsPage = lazy(() => import("./pages/admin/PopupCampaignsPage"));
const BlogAdminPage = lazy(() => import("./pages/admin/BlogAdminPage"));
const FaqAdminPage = lazy(() => import("./pages/admin/FaqAdminPage"));
const HomepageTextAdminPage = lazy(() => import("./pages/admin/HomepageTextAdminPage"));
const PageTextAdminPage = lazy(() => import("./pages/admin/PageTextAdminPage"));

/** Section skeleton — shows inside the admin content area only */
function SectionSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-6 w-32 bg-white/10 rounded mb-2" />
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-white/5 mb-3" />
            <div className="h-5 w-12 bg-white/10 rounded mb-1" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-3/4 bg-white/5 rounded" />
          <div className="h-3 w-1/2 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function App() {
  useAutoPageView();
  useConversionTracking();

  useEffect(() => {
    initCopyProtection();
  }, []);

  return (
    <RootErrorBoundary>
      <PopupRenderer />
      <WhatsAppFab />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/menu/:branchSlug?" element={<Suspense fallback={<div className="min-h-screen bg-[#F6F2E9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#9D7C38] border-t-transparent rounded-full animate-spin" /></div>}><QRMenuPage /></Suspense>} />
        <Route path="/catalog" element={<Suspense fallback={<div className="min-h-screen bg-[#F6F2E9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#9D7C38] border-t-transparent rounded-full animate-spin" /></div>}><CatalogStorefront /></Suspense>} />
        <Route path="/catalog/:slug" element={<Suspense fallback={<div className="min-h-screen bg-[#F6F2E9] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#9D7C38] border-t-transparent rounded-full animate-spin" /></div>}><ProductDetailPage /></Suspense>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/corporate" element={<CorporatePage />} />
        <Route path="/gift-card" element={<GiftCardPage />} />
        <Route path="/admin/login" element={<Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}><LoginPage /></Suspense>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Suspense fallback={<SectionSkeleton />}><DashboardPage /></Suspense>} />
          <Route path="catalog" element={<Suspense fallback={<SectionSkeleton />}><CatalogPage /></Suspense>} />
          <Route path="cafe" element={<Suspense fallback={<SectionSkeleton />}><CafeMenuPage /></Suspense>} />
          <Route path="branches" element={<Suspense fallback={<SectionSkeleton />}><BranchesPage /></Suspense>} />
          <Route path="qr" element={<Suspense fallback={<SectionSkeleton />}><QrPage /></Suspense>} />
          <Route path="seo" element={<Suspense fallback={<SectionSkeleton />}><SeoPage /></Suspense>} />
          <Route path="media" element={<Suspense fallback={<SectionSkeleton />}><MediaPage /></Suspense>} />
          <Route path="tracking" element={<Navigate to="/admin/settings" replace />} />
          <Route path="mail-settings" element={<Suspense fallback={<SectionSkeleton />}><MailSettingsPage /></Suspense>} />
          <Route path="inbox" element={<Suspense fallback={<SectionSkeleton />}><InboxPage /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<SectionSkeleton />}><OrdersPage /></Suspense>} />
          <Route path="google-ads" element={<Suspense fallback={<SectionSkeleton />}><GoogleAdsPage /></Suspense>} />
          <Route path="social" element={<Navigate to="/admin/settings" replace />} />
          <Route path="homepage-photos" element={<Suspense fallback={<SectionSkeleton />}><HomepagePhotosPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<SectionSkeleton />}><SettingsPage /></Suspense>} />
          <Route path="ai-auditor" element={
            <Suspense fallback={<SectionSkeleton />}>
              <AdminErrorBoundary>
                <AiAuditorPage />
              </AdminErrorBoundary>
            </Suspense>
          } />
          <Route path="ai-insights" element={
            <Suspense fallback={<SectionSkeleton />}>
              <AdminErrorBoundary>
                <AiInsightsPage />
              </AdminErrorBoundary>
            </Suspense>
          } />
          <Route path="popups" element={<Suspense fallback={<SectionSkeleton />}><PopupCampaignsPage /></Suspense>} />
          <Route path="blog" element={<Suspense fallback={<SectionSkeleton />}><BlogAdminPage /></Suspense>} />
          <Route path="faq" element={<Suspense fallback={<SectionSkeleton />}><FaqAdminPage /></Suspense>} />
          <Route path="homepage-text" element={<Suspense fallback={<SectionSkeleton />}><HomepageTextAdminPage /></Suspense>} />
          <Route path="page-text" element={<Suspense fallback={<SectionSkeleton />}><PageTextAdminPage /></Suspense>} />
        </Route>

        {/* Fallback — unknown routes → home page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieConsentBanner />
    </RootErrorBoundary>
  );
}

export default App;
// deploy trigger 1778670727
