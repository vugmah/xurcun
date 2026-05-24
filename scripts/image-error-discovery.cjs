/**
 * THE WOO — Image Console Error Discovery v2
 * Captures ALL >=400 responses and request failures, then filters images.
 */
const { chromium } = require('playwright');

const BASE = 'https://thewoo.az';
const ADMIN_KEY = '191868Vm!!';

const failedImages = [];

function recordFail(url, status, pageName, type, resourceType) {
  failedImages.push({ url, status: status || 'FAILED', page: pageName, type, resourceType });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  let currentPage = 'unknown';

  // Capture ALL >=400 responses (we'll filter images later)
  page.on('response', res => {
    const status = res.status();
    const rt = res.request().resourceType();
    if (status >= 400) {
      recordFail(res.url(), status, currentPage, `response-${status}`, rt);
    }
  });

  // Capture request failures
  page.on('requestfailed', req => {
    recordFail(req.url(), 'FAILED', currentPage, 'requestfailed', req.request().resourceType());
  });

  // Also capture console errors for cross-check
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Failed to load resource')) {
      console.log(`  [console] ${currentPage}: ${msg.text()}`);
    }
  });

  // ═══════════════════════════════════════════════════════════
  // 1. HOMEPAGE
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== 1. HOMEPAGE ===');
  currentPage = 'homepage';
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  // ═══════════════════════════════════════════════════════════
  // 2. QR MENU
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== 2. QR MENU ===');
  currentPage = 'qr-menu';
  await page.goto(`${BASE}/#/menu/white-city`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const tabs = ['Yemək', 'İçki', 'Qəlyan'];
  for (const t of tabs) {
    const btn = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(t, 'i') }).first();
    if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(1000); }
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  // ═══════════════════════════════════════════════════════════
  // 3. ADMIN MEDIA PANEL
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== 3. ADMIN MEDIA PANEL ===');
  currentPage = 'admin-media';
  await page.goto(`${BASE}/#/admin/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const pw = page.locator('input[type="password"]').first();
  if (await pw.count() > 0) {
    await pw.fill(ADMIN_KEY);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2500);
  }

  await page.goto(`${BASE}/#/admin/media`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  const imageFails = failedImages.filter(i => i.resourceType === 'image');
  const unique = [...new Map(imageFails.map(i => [i.url, i])).values()];

  console.log('\n=== Image Console Error Discovery Report ===');
  console.log('Total >=400 responses+failures:', failedImages.length);
  console.log('Image type errors:', imageFails.length);
  console.log('Unique failed image URLs:', unique.length);

  if (unique.length > 0) {
    console.log('\n--- Unique Failed Image URLs ---');
    for (const u of unique) {
      console.log(`  [${u.status}] ${u.url}  (page: ${u.page})`);
    }
  }

  const patterns = {
    uploads: unique.filter(i => i.url.includes('/uploads')),
    foodPhotos: unique.filter(i => i.url.includes('/food-photos')),
    doubleWebp: unique.filter(i => i.url.includes('.webp.webp') || i.url.match(/\.webp\.[a-z]+$/)),
    external: unique.filter(i => i.url.startsWith('http') && !i.url.includes('thewoo.az') && !i.url.includes('supabase.co')),
    supabase: unique.filter(i => i.url.includes('supabase.co')),
    unknown: unique.filter(i => !i.url.includes('/uploads') && !i.url.includes('/food-photos') && !i.url.includes('.webp.webp') && !i.url.includes('supabase.co') && (!i.url.startsWith('http') || i.url.includes('thewoo.az'))),
  };

  console.log('\n--- Patterns ---');
  console.log(`/uploads: ${patterns.uploads.length}`);
  console.log(`/food-photos: ${patterns.foodPhotos.length}`);
  console.log(`.webp.webp / double ext: ${patterns.doubleWebp.length}`);
  console.log(`external: ${patterns.external.length}`);
  console.log(`supabase: ${patterns.supabase.length}`);
  console.log(`unknown/other: ${patterns.unknown.length}`);

  console.log('\n--- Non-image >=400 (for context) ---');
  const nonImage = failedImages.filter(i => i.resourceType !== 'image');
  for (const u of [...new Map(nonImage.map(i => [i.url, i])).values()]) {
    console.log(`  [${u.status}] ${u.url}  (page: ${u.page}, type: ${u.resourceType})`);
  }

  console.log('\n--- Likely Root Cause ---');
  if (patterns.foodPhotos.length > 0) console.log('• /food-photos/ missing .webp variants or wrong IDs');
  if (patterns.uploads.length > 0) console.log('• Remaining /uploads/ references in DB/code');
  if (patterns.doubleWebp.length > 0) console.log('• Double .webp extension from polluted imageId');
  if (patterns.supabase.length > 0) console.log('• Supabase bucket files missing');
  if (patterns.external.length > 0) console.log('• External CDN errors');

  await browser.close();
}

run().catch(err => {
  console.error('Discovery fatal error:', err);
  process.exit(1);
});
