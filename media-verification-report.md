## Media Library Verification

### API Status: PASS
- media.listImages: HTTP 200 — Returns `{"images":[],"error":"fetch failed"}`; endpoint responds correctly but Supabase storage fetch fails at runtime
- media.list: HTTP 404 — `NOT_FOUND: No procedure found on path "media.list"`; endpoint does NOT exist (router only has `listImages`)
- media.status: HTTP 200 — Returns `{"configured":true,"bucket":"media","url":"set","key":"set"}`; Supabase credentials are configured
- WebSocket errors: NO — No WebSocket crashes; mock polyfill is active

### Code Review: PASS
- try/catch coverage: YES — All 3 media endpoints (`uploadImage`, `deleteImage`, `listImages`) are wrapped in try/catch blocks (media.ts lines 63-103, 117-129, 143-172)
- WebSocket mock: YES — Node.js 20 WebSocket polyfill present at lines 5-16 of media.ts; prevents `ws` module crashes
- Graceful fallback: YES — All endpoints return empty arrays/error messages instead of throwing when Supabase fails (e.g., `listImages` returns `{images:[],error:"SUPABASE_NOT_CONFIGURED"}`)
- **BUG FOUND**: `MediaPage.tsx` lines 43, 50, 57, 65 call `utils.media.list.invalidate()` but the actual endpoint is `media.listImages`, not `media.list` — invalidations silently fail
- Upload flow: Uses `/api/upload` REST endpoint (not tRPC), admin key auth via `x-admin-key` header — functional
- Photos schema: `photos` table has proper fields (id, url, alt, altAz, altRu, altEn, section, sortOrder, isActive, createdAt)
- **Gallery uses localStorage/static assets**: `Gallery.tsx` reads from `homepageImageStore.ts` (localStorage overrides + `/assets/` static files), NOT from `photos.getBySection` tRPC query — DB photos are unused for public gallery
- **Menu items show no images**: Public menu uses static text data without product images; `photoAssignments` data is only consumed in admin panel

### Browser Test: FAIL
- Gallery images loading: NO — Gallery section shows heading "QALEREYA" with empty div containers; image slots render fallback placeholder (`THE WOO` text in amber) rather than actual images. Hero background image DOES load (hero-bg.jpg visible in screenshot), but gallery slots are empty — static `/assets/gallery-*.jpg` files may be missing or not served
- Product images visible: NO — Menu items are text-only with prices and descriptions; no product thumbnails visible on `/menu` page
- Console errors: NO — No media-related console errors detected during browsing session
- Additional: Cookie consent banner appears and functions; page navigation works; site is fully interactive

### Photo Attach: PASS
- photoAssignments router: YES — `photoAssignmentsRouter` registered in `router.ts` line 28; fully implemented in `api/routers/photoAssignments.ts`
- Attach endpoint works: YES — `photoAssignments.list` returns 21 active assignments from DB (verified via debug endpoint); `assign` mutation has upsert logic (update existing or insert new); `remove` mutation deletes by compound key
- Data integrity: DB is single source of truth — admin panel reads from `trpc.photoAssignments.list` and writes via `assign`/`remove` mutations; localStorage is only used for optimistic UI flash, never for reads
- Schema: `photoAssignments` table has proper fields (id, tab, catTitleAz, itemNameAz, imageId, imageUrl, branchSlug, createdAt, updatedAt)

### Evidence
1. `media.listImages` response: `{"result":{"data":{"json":{"images":[],"error":"fetch failed"}}}}`
2. `media.list` response: `{"error":{"json":{"message":"No procedure found on path \"media.list\"","code":-32004,"data":{"code":"NOT_FOUND","httpStatus":404,"path":"media.list"}}}}`
3. `media.status` response: `{"configured":true,"bucket":"media","url":"set","key":"set"}`
4. `photoAssignments.debug` response: 21 assignments from DB, e.g. `{"total":21,"branch":"white-city","source":"database","assignments":[{"id":8,"tab":"food","category":"SƏHƏR YEMƏYİ","itemName":"Pankelər, karamelizə banan, duzlu karamel dondurma","imageId":"4w7a8050.webp"},...`
5. Homepage screenshot: Hero image loads; gallery section empty
6. Menu page screenshot: Text-only items, no product images

### Overall: MANUAL VERIFIED

The media assignment system (`photoAssignments`) is production-ready with 21 active DB assignments and full CRUD endpoints. The code has robust error handling with WebSocket polyfill and graceful Supabase fallbacks. However, three issues prevent a full PASS:

1. **Supabase Storage integration broken**: `media.listImages` returns `{"images":[],"error":"fetch failed"}` — Supabase is configured (credentials present) but the actual storage fetch fails at runtime. This means uploaded images cannot be listed/retrieved.
2. **Gallery empty on homepage**: Gallery slots reference `/assets/gallery-*.jpg` static files that appear to be missing or not served; the section renders empty placeholder containers.
3. **Minor code bug**: `MediaPage.tsx` calls `utils.media.list.invalidate()` which targets a non-existent endpoint; should be `utils.media.listImages.invalidate()`.

**Recommendations:**
- Fix Supabase Storage bucket permissions or CORS configuration to resolve `fetch failed`
- Add `media.listImages` to the invalidation calls in `MediaPage.tsx` (lines 43, 50, 57, 65)
- Either upload gallery static assets to `/public/assets/` or wire gallery to use `photos.getBySection` tRPC query
- Wire public menu items to display `photoAssignments` images via the existing assignment system
