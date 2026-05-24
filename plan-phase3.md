# Phase 3: AI Menu Intelligence + Human Approved Badge System

## Architecture
- Anonymous event tracking (GDPR-safe, batched)
- DB storage for events + recommendations + badges
- Admin AI Insights dashboard
- Human approval flow (Approve/Reject/Ignore/Snooze)
- Branch-aware badge rendering
- Menu sync across all surfaces

## Files to Create/Modify

### DB Schema (db/schema.ts)
- menuEvents — anonymous tracking events
- badgeRecommendations — AI suggestions
- approvedBadges — human-approved badges

### Backend (api/routers/)
- analytics.ts — event ingest + query
- badges.ts — recommendation CRUD + approval flow

### Frontend
- src/lib/analytics.ts — client tracking library
- src/pages/admin/AiInsightsPage.tsx — AI dashboard
- src/components/BadgeRenderer.tsx — approved badge display
- src/hooks/useMenuIntelligence.ts — data hook

### Integration Points
- MenuPage.tsx — badge render
- QRMenuPage.tsx — badge render  
- PrintPreviewPage.tsx — badge render
- DashboardPage.tsx — insights widget

## Implementation Order
1. DB schema + migration
2. Backend routers
3. Client tracking library
4. AI Insights dashboard
5. Badge approval flow
6. Badge rendering integration
7. Final verify
