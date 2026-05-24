## Cleanup Audit - The Woo Codebase
**Date:** 2025-06-15  
**Scope:** `/mnt/agents/thewoo-az/`  
**Auditor:** Automated Code Quality Audit

---

### 1. Debug Logs: FAIL
**Status: 13 console.log + 1 console.warn in production code**

| # | File | Line | Content |
|---|------|------|---------|
| 1 | `src/main.tsx` | 28 | `console.warn("[CHUNK ERROR] Stale chunk detected...")` |
| 2 | `src/main.tsx` | 52 | `console.warn("[CHUNK REJECT] Stale chunk detected...")` |
| 3 | `src/pages/admin/PrintPreviewPage.tsx` | 50 | `console.log("[Capture] element:", el.tagName, ...)` |
| 4 | `src/pages/admin/PrintPreviewPage.tsx` | 56 | `console.log("[Capture] fallback offset:", w2, "x", h2)` |
| 5 | `src/pages/admin/PrintPreviewPage.tsx` | 68 | `console.log("[Capture] converting", imgs.length, "images...")` |
| 6 | `src/pages/admin/PrintPreviewPage.tsx` | 77 | `console.log("[Capture] converted image:", ...)` |
| 7 | `src/pages/admin/PrintPreviewPage.tsx` | 79 | `console.warn("[Capture] failed to convert image...")` |
| 8 | `src/pages/admin/PrintPreviewPage.tsx` | 84 | `console.log("[Capture] images converted:", ...)` |
| 9 | `src/pages/admin/PrintPreviewPage.tsx` | 87 | `console.log("[Capture] pre-loading images...")` |
| 10 | `src/pages/admin/PrintPreviewPage.tsx` | 93 | `console.warn("[Capture] image failed:", ...)` |
| 11 | `src/pages/admin/PrintPreviewPage.tsx` | 98 | `console.log("[Capture] images loaded")` |
| 12 | `src/pages/admin/PrintPreviewPage.tsx` | 147 | `console.log("[Capture] SVG built, length:", ...)` |
| 13 | `src/pages/admin/PrintPreviewPage.tsx` | 156 | `console.log("[Capture] SVG loaded:", ...)` |
| 14 | `src/pages/admin/PrintPreviewPage.tsx` | 167 | `console.log("[Capture] PNG generated, length:", ...)` |
| 15 | `src/pages/admin/PrintPreviewPage.tsx` | 182 | `console.log("[Capture] restored", ...)` |
| 16 | `src/pages/admin/PrintPreviewPage.tsx` | 689 | `console.warn("[PrintPreview] Logo data URI conversion failed:", err)` |

**Findings:**
- 13 `console.log` statements in PrintPreviewPage.tsx (all "[Capture]" debug logs for PNG export)
- 2 `console.warn` in main.tsx (CHUNK ERROR handling - these are defensive and acceptable)
- 1 `console.warn` in PrintPreviewPage.tsx (logo conversion failure)
- No `debugger` statements found
- **Critical log leaks: NO** - no sensitive data logged, but verbose capture diagnostics in production

**Recommendation:** Remove all `[Capture]` debug logs from PrintPreviewPage.tsx before production builds.

---

### 2. Legacy Code: FAIL
**Status: Dead code and unused components found**

#### TODO/FIXME/HACK Comments: PASS
- Zero TODO/FIXME/HACK/XXX markers found in admin pages
- (grep matched "Google Tag Manager ID" / "GA4 Measurement ID" as false positives from SettingsPage field labels)

#### ComingSoonPage Usage: DEAD CODE
- `ComingSoonPage.tsx` exists at `src/pages/admin/ComingSoonPage.tsx` (21 lines)
- **It is imported** in `src/App.tsx:26` as a lazy import
- **It is NEVER used** in any `<Route>` element - no route renders ComingSoonPage
- This is a dead import + dead component

#### Unused Page Components (orphaned files):
| File | Route | Status |
|------|-------|--------|
| `SocialMediaPage.tsx` | `/admin/social` | Route exists but redirects to `/admin/settings` |
| `TrackingPage.tsx` | `/admin/tracking` | Route exists but redirects to `/admin/settings` |

- Both `SocialMediaPage.tsx` and `TrackingPage.tsx` are exported components that are never rendered by any route
- They exist as orphaned files with no route mapping to them

#### Dead Code Blocks: NO
- No commented-out dead code blocks found in admin pages

---

### 3. localStorage: PASS
**Status: All localStorage usage is intentional and feature-related**

| Key | File | Purpose |
|-----|------|---------|
| `thewoo_general_settings_v1` | `SettingsPage.tsx:105` | **Intentionally removed** (migration cleanup) |
| `thewoo_audit_history_v1` | `AiAuditorPage.tsx` | Audit history persistence |
| `thewoo_last_recheck_v1` | `AiAuditorPage.tsx` | Last recheck timestamp |
| `thewoo_audit_checked_v1` | `AiAuditorPage.tsx` | Checked items tracking |
| `thewoo_content_checks_v1` | `AiAuditorPage.tsx` | Content check results |
| `thewoo_seo_checks_v1` | `AiAuditorPage.tsx` | SEO check results |
| `thewoo_qr_checks_v1` | `AiAuditorPage.tsx` | QR menu check results |
| `thewoo_export_checks_v1` | `AiAuditorPage.tsx` | Export check results |
| `thewoo_ai_suggestions_v2` | `AiAuditorPage.tsx` | AI suggestions (intentionally removed) |

- All localStorage usage is tied to active features (AiAuditor, Menu caching, Settings migration)
- `thewoo_general_settings_v1` is being **cleaned up** by SettingsPage (correct migration pattern)
- `thewoo_ai_suggestions_v2` is being **removed** by AiAuditorPage (correct cleanup)
- **Stale dependencies: 0**
- **Orphan keys: NONE**

---

### 4. Broken Routes: PASS
**Status: All routes resolve correctly, 2 intentional redirects**

#### Route-to-File Mapping (all 15 lazy imports verified):
| Route Path | Lazy Import File | Status |
|------------|-----------------|--------|
| `/menu/:branchSlug?` | `QRMenuPage.tsx` | MATCH |
| `/admin/login` | `LoginPage.tsx` | MATCH |
| `/admin` (index) | `DashboardPage.tsx` | MATCH |
| `/admin/menu` | `MenuPage.tsx` | MATCH |
| `/admin/seo` | `SeoPage.tsx` | MATCH |
| `/admin/media` | `MediaPage.tsx` | MATCH |
| `/admin/mail-settings` | `MailSettingsPage.tsx` | MATCH |
| `/admin/google-ads` | `GoogleAdsPage.tsx` | MATCH |
| `/admin/homepage-photos` | `HomepagePhotosPage.tsx` | MATCH |
| `/admin/settings` | `SettingsPage.tsx` | MATCH |
| `/admin/ai-auditor` | `AiAuditorPage.tsx` | MATCH |
| `/admin/shisha-discount` | `ShishaDiscountPage.tsx` | MATCH |
| `/admin/popups` | `PopupCampaignsPage.tsx` | MATCH |
| `/admin/menu/print-preview` | `PrintPreviewPage.tsx` | MATCH |

#### Redirect Routes (intentional):
| Route | Target | Purpose |
|-------|--------|---------|
| `/admin/tracking` | `/admin/settings` | Tracking moved to Settings |
| `/admin/social` | `/admin/settings` | Social moved to Settings |
| `/login/admin` | `/admin/login` | Legacy URL redirect |

#### Orphan Components (not in any route):
- `ComingSoonPage.tsx` - imported but never rendered
- `SocialMediaPage.tsx` - file exists, route redirects away
- `TrackingPage.tsx` - file exists, route redirects away

#### Orphan routes: NONE
#### Missing lazy imports: NONE

---

### 5. Build: FAIL
**Status: Cannot verify - missing dependencies**

```
- vite: NOT INSTALLED (node_modules/.bin/vite missing)
- typescript: NOT INSTALLED (node_modules/typescript missing)
- tsc command: NOT FOUND
- npm install: TIMED OUT after 120s
```

**Findings:**
- `npm run check` (tsc -b) fails because tsc is not installed
- `npm run build` would fail because vite is not installed
- The prebuild script `scripts/check-null-bytes.cjs` exists and is valid (47 lines)
- **Cannot determine TypeScript error count without installing dependencies**

**Missing Dependencies (cannot verify):**
- Full `node_modules/` directory is missing
- Need to run `npm install` successfully before build/type-check can run

---

### 6. Unused Backend Endpoints (tRPC Router Audit)

#### Fully Used Routers (all endpoints consumed by frontend):
| Router | Used Endpoints | Status |
|--------|---------------|--------|
| `popup` | adminList, create, update, delete, toggleActive, stats, list, trackView, trackClick | ALL USED |
| `mail` | adminGetContactEmails, upsertContactEmails, getCpanelStatus, listMailAccounts, createMailAccount, deleteMailAccount, changeMailPassword, changeMailQuota, getSmtpSettings, upsertSmtpSettings, getContactEmails | ALL USED |
| `googleAds` | getStatus, getSettings, upsertSettings, listCampaigns, createCampaign, updateCampaign, deleteCampaign, listConversions, createConversion, updateConversion, deleteConversion | ALL USED |
| `branchMenu` | getMenuByBranch, updateMenuItemBranch | ALL USED |

#### Partially Used Routers (some endpoints unused):
| Router | Used | Unused (orphan endpoints) |
|--------|------|--------------------------|
| `menu` | getMenu(13), updateItem(2) | **adminGetCategories, getItemsByCategory, createCategory, updateCategory, deleteCategory, createItem, deleteItem, resetAndSeed, importRealMenu** (9 unused) |
| `settings` | getByKey, upsert, getAll | **adminGetAll, delete, bulkUpsert** (3 unused) |
| `media` | listImages | **uploadImage, deleteImage, status** (3 unused) |
| `tracking` | upsert (via SettingsPage) | **getPublic, adminGetAll, adminGetByKey, bulkUpsert, delete, metaConversion** (6 unused) |
| `branch` | getBranches | **getBranchBySlug** (1 unused) |
| `photoAssignments` | list, assign, remove | **count, debug** (2 unused) |
| `photos` | adminGetAll, create, update, delete, bulkDelete | **getBySection, getAll** (2 unused) |
| `seo` | adminGetAll, upsertByPage, delete, getByPage | **create, update, getByPath, upsert, listByLang, getAllPages, deletePage** (7 unused) |
| `stats` | invalidate (referenced) | **getDashboard** (1 unused - defined but never called) |

**Total unused backend endpoints: ~34**

---

## Summary

| Audit Area | Status | Key Issues |
|------------|--------|------------|
| Debug Logs | **FAIL** | 13 console.log in PrintPreviewPage.tsx |
| Legacy Code | **FAIL** | ComingSoonPage dead import, 2 orphaned pages (SocialMedia, Tracking) |
| localStorage | **PASS** | All usage intentional, no orphan keys |
| Broken Routes | **PASS** | All routes match files, 2 intentional redirects |
| Build | **FAIL** | node_modules missing, cannot run tsc or vite |
| Unused Endpoints | **WARN** | ~34 backend endpoints defined but never called by frontend |

## Recommendations (Priority Order)

1. **HIGH:** Run `npm install` to restore node_modules (required for any build)
2. **HIGH:** Remove 13 `[Capture]` console.log statements from PrintPreviewPage.tsx
3. **MEDIUM:** Remove dead ComingSoonPage import from App.tsx (line 26) and delete ComingSoonPage.tsx
4. **MEDIUM:** Delete orphaned SocialMediaPage.tsx and TrackingPage.tsx (or wire them to routes)
5. **LOW:** Clean up ~34 unused backend tRPC endpoints (or confirm they are for future use)
6. **LOW:** Remove unused imports/variables if any (ESLint would catch these)

---

### Overall: MANUAL VERIFIED
**Note:** Build check could not complete due to missing node_modules. All other checks are based on static source code analysis.
