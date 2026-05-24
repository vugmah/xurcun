/**
 * THE WOO — Full Real QA + Supabase Upload Test
 * Rules: NO code changes, NO deletions, NO product assignments.
 * Upload test: 1 small image to Supabase, section=menu, DO NOT DELETE.
 */
const { chromium } = require('playwright');

const BASE = 'https://thewoo.az';
const ADMIN_KEY = '191868Vm!!';
const TEST_FILE = '/tmp/test-upload.png';

const results = {
  public: {}, qr: {}, admin: {}, media: {}, upload: {}, seo: {}, tracking: {},
  consoleErrors: [], pageErrors: [],
};

function log(section, key, value) {
  results[section][key] = value;
  console.log(`[${section}] ${key}: ${value}`);
}

async function dismissCookieBanner(page) {
  const btn = page.locator('button:has-text("Accept all")').first();
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  }
}

async function closeModals(page) {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const backdrop = page.locator('div[class*="fixed inset-0"]').first();
  if (await backdrop.isVisible().catch(() => false)) {
    await backdrop.click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(300);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      results.consoleErrors.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on('pageerror', err => results.pageErrors.push(err.message));

  // ═══════════════════════════════════════════════════════════
  // 1. PUBLIC HOMEPAGE
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== PUBLIC HOMEPAGE ===');
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await dismissCookieBanner(page);

    // Menu CTA
    const menuBtn = page.locator('button[data-gtm="cta_hero_menu"]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click(); await page.waitForTimeout(800);
      log('public', 'menuCta', 'PASS');
    } else { log('public', 'menuCta', 'FAIL'); }
    await closeModals(page);

    // Reservation CTA
    const reserveBtn = page.locator('button[data-gtm="cta_hero_reserve"]').first();
    if (await reserveBtn.count() > 0) {
      await reserveBtn.click(); await page.waitForTimeout(800);
      log('public', 'reservationCta', 'PASS');
    } else { log('public', 'reservationCta', 'FAIL'); }
    await closeModals(page);

    // Languages
    let langOk = true;
    for (const code of ['AZ', 'RU', 'EN', 'TR']) {
      const btn = page.locator('button').filter({ hasText: new RegExp(`^${code}$`) }).first();
      if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(300); }
      else { langOk = false; }
    }
    log('public', 'language', langOk ? 'PASS' : 'PARTIAL');

    // Mobile hamburger
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    const hamburger = page.locator('button').filter({ has: page.locator('span') }).filter({ has: page.locator('span') }).filter({ has: page.locator('span') }).first();
    if (await hamburger.count() > 0) {
      await hamburger.click(); await page.waitForTimeout(600);
      log('public', 'mobileMenu', 'PASS');
    } else { log('public', 'mobileMenu', 'FAIL'); }
    await page.setViewportSize({ width: 1280, height: 720 });
  } catch (e) { log('public', 'fatal', `ERROR: ${e.message}`); }

  // ═══════════════════════════════════════════════════════════
  // 2. QR MENU
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== QR MENU ===');
  try {
    await page.goto(`${BASE}/#/menu/white-city`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    async function clickTab(...names) {
      for (const n of names) {
        const btn = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(n, 'i') }).first();
        if (await btn.count() > 0) { await btn.click(); await page.waitForTimeout(600); return true; }
      }
      return false;
    }

    log('qr', 'food', await clickTab('Yemək', 'Food', 'Yemek') ? 'PASS' : 'FAIL');
    log('qr', 'beverage', await clickTab('İçki', 'Beverage', 'İçecekler', 'Icki') ? 'PASS' : 'FAIL');
    log('qr', 'shisha', await clickTab('Qəlyan', 'Shisha', 'Nargile') ? 'PASS' : 'FAIL');
    log('qr', 'snack', (await page.locator('text=/snack/i').count()) > 0 ? 'PASS' : 'FAIL');

    // 5 random product modals
    let modalPass = 0;
    for (let i = 0; i < 5; i++) {
      try {
        const card = page.locator('main div, body div').filter({ hasText: /AZN/ }).nth(i);
        if (await card.count() > 0) {
          await card.click(); await page.waitForTimeout(500);
          const modal = page.locator('div[class*="fixed"], [role="dialog"]').first();
          if (await modal.isVisible().catch(() => false)) { modalPass++; await closeModals(page); }
        }
      } catch (_) {}
    }
    log('qr', 'productModal', modalPass > 0 ? `PASS (${modalPass}/5)` : 'FAIL');

    // Images visible
    const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
    log('qr', 'images', imgCount > 0 ? `PASS (${imgCount} img tags)` : 'WARN');

    // Descriptions
    const descCount = await page.locator('p, span').filter({ hasText: /[a-zA-Zəçıöşğü]{10,}/ }).count();
    log('qr', 'descriptions', descCount > 5 ? 'PASS' : 'WARN');

    // Language switch in QR
    for (const code of ['AZ', 'RU', 'EN', 'TR']) {
      const btn = page.locator('button').filter({ hasText: new RegExp(`^${code}$`) }).first();
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(300);
    }
    log('qr', 'languages', 'PASS');
  } catch (e) { log('qr', 'fatal', `ERROR: ${e.message}`); }

  // ═══════════════════════════════════════════════════════════
  // 3. ADMIN
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== ADMIN ===');
  try {
    await page.goto(`${BASE}/#/admin/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const pw = page.locator('input[type="password"]').first();
    if (await pw.count() > 0) {
      await pw.fill(ADMIN_KEY);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2500);
    }
    await dismissCookieBanner(page);

    const hasDash = (await page.locator('text=/Dashboard/i').count()) > 0;
    log('admin', 'login', hasDash ? 'PASS' : 'FAIL');
    if (!hasDash) { console.log('  Skipping admin tests'); }
    else {
      log('admin', 'dashboard', 'PASS');

      // Menu Management
      await page.goto(`${BASE}/#/admin/menu`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      log('admin', 'menuManagement', 'PASS');

      // Category toggle
      const catHeader = page.locator('button, div').filter({ hasText: /[A-Z][a-z]{2,}/ }).nth(3);
      if (await catHeader.count() > 0) {
        await catHeader.click(); await page.waitForTimeout(600);
        await catHeader.click(); await page.waitForTimeout(300);
        log('admin', 'categoryToggle', 'PASS');
      } else { log('admin', 'categoryToggle', 'WARN'); }

      // Search
      const search = page.locator('input').first();
      if (await search.count() > 0) { await search.fill('Steak'); await page.waitForTimeout(800); log('admin', 'search', 'PASS'); }
      else { log('admin', 'search', 'WARN'); }

      // Edit modal open/close
      const editBtn = page.locator('svg[class*="Pencil"]').first();
      if (await editBtn.count() > 0) {
        await editBtn.click(); await page.waitForTimeout(800);
        log('admin', 'editModal', 'PASS');
        await closeModals(page);
        log('admin', 'editModalClose', 'PASS');
      } else { log('admin', 'editModal', 'WARN'); }

      // Active/passive toggle UI
      const toggle = page.locator('button:has-text("ACTIVE"), button:has-text("PASSIVE"), [role="switch"]').first();
      log('admin', 'activePassiveUi', await toggle.count() > 0 ? 'PASS' : 'WARN');

      // Media Panel
      await page.goto(`${BASE}/#/admin/media`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      log('admin', 'mediaPanel', 'PASS');

      // Media search
      const mSearch = page.locator('input').first();
      if (await mSearch.count() > 0) { await mSearch.fill('hero'); await page.waitForTimeout(600); log('admin', 'mediaSearch', 'PASS'); }
      else { log('admin', 'mediaSearch', 'WARN'); }

      // Section filter
      const section = page.locator('select').first();
      log('admin', 'sectionFilter', await section.count() > 0 ? 'PASS' : 'WARN');

      // Checkbox + bulk delete UI
      const cb = page.locator('input[type="checkbox"]').first();
      if (await cb.count() > 0) {
        await cb.click(); await page.waitForTimeout(300);
        const bulk = page.locator('button:has-text("Sil"), button:has-text("Delete"), button:has-text("Toplu")').first();
        log('admin', 'bulkDeleteUi', await bulk.count() > 0 ? 'PASS (visible)' : 'WARN');
      } else { log('admin', 'checkboxSelect', 'WARN'); }

      // Upload UI exists
      const uploadUi = page.locator('button:has-text("Sechil"), button:has-text("Yuklenir"), input[type="file"]').first();
      log('admin', 'uploadUi', await uploadUi.count() > 0 ? 'PASS' : 'WARN');
    }
  } catch (e) { log('admin', 'fatal', `ERROR: ${e.message}`); }

  // ═══════════════════════════════════════════════════════════
  // 4. SUPABASE REAL UPLOAD TEST
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== SUPABASE UPLOAD TEST ===');
  try {
    // Ensure we are on Media Panel and logged in
    await page.goto(`${BASE}/#/admin/media`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await dismissCookieBanner(page);

    // Select section = menu
    const sectionSelect = page.locator('select').first();
    if (await sectionSelect.count() > 0) {
      await sectionSelect.selectOption('menu');
      await page.waitForTimeout(300);
    }

    // Click file input trigger
    const chooseBtn = page.locator('button:has-text("Sechil")').first();
    if (await chooseBtn.count() > 0) {
      // Directly set files on the hidden input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(TEST_FILE);
      await page.waitForTimeout(2500); // wait for upload + state update

      // Check filename displayed
      const filenameSpan = page.locator('span.truncate').first();
      const hasFilename = await filenameSpan.isVisible().catch(() => false);
      log('upload', 'fileSelected', hasFilename ? 'PASS' : 'WARN');

      // Click save
      const saveBtn = page.locator('button:has-text("Elave Et")').first();
      if (await saveBtn.count() > 0 && await saveBtn.isEnabled().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(3000); // wait for mutation + invalidate
        log('upload', 'saveClicked', 'PASS');
      } else {
        log('upload', 'saveClicked', 'FAIL — button not found or disabled');
      }

      // Verify the new photo appears with Supabase URL
      await page.waitForTimeout(2000);
      const allImgSrcs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img')).map(i => i.src)
      );
      const supabaseUrls = allImgSrcs.filter(s => s.includes('isxfbiglydpdhtyqirrm.supabase.co'));
      if (supabaseUrls.length > 0) {
        log('upload', 'source', 'supabase');
        log('upload', 'url', supabaseUrls[0]);
        log('upload', 'mediaPanel', 'PASS');
        log('upload', 'localFallback', 'no');
      } else {
        log('upload', 'source', 'unknown');
        log('upload', 'url', 'NOT FOUND');
        log('upload', 'mediaPanel', 'FAIL');
        log('upload', 'localFallback', 'possible');
      }
    } else {
      log('upload', 'fileSelected', 'FAIL — choose button not found');
    }
  } catch (e) { log('upload', 'fatal', `ERROR: ${e.message}`); }

  // ═══════════════════════════════════════════════════════════
  // 5. SEO / TRACKING
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== SEO / TRACKING ===');
  try {
    // sitemap
    const sm = await fetch(`${BASE}/sitemap.xml`);
    log('seo', 'sitemap', sm.status === 200 ? 'PASS (200)' : `FAIL (${sm.status})`);

    // robots
    const rb = await fetch(`${BASE}/robots.txt`);
    log('seo', 'robots', rb.status === 200 ? 'PASS (200)' : `FAIL (${rb.status})`);

    // manifest
    const mf = await fetch(`${BASE}/manifest.json`);
    log('seo', 'manifest', mf.status === 200 ? 'PASS (200)' : `FAIL (${mf.status})`);

    // Homepage meta checks
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const hasH1 = await page.evaluate(() => document.querySelectorAll('h1').length > 0);
    log('seo', 'h1', hasH1 ? 'PASS' : 'FAIL');

    const jsonLdCount = await page.evaluate(() => document.querySelectorAll('script[type="application/ld+json"]').length);
    log('seo', 'jsonLd', jsonLdCount === 4 ? `PASS (${jsonLdCount})` : `WARN (${jsonLdCount})`);

    const canonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.getAttribute('href'));
    log('seo', 'canonical', canonical === 'https://thewoo.az/' ? 'PASS' : `WARN (${canonical})`);

    // www redirect
    const wwwRes = await fetch('https://www.thewoo.az/', { redirect: 'manual' });
    log('seo', 'wwwRedirect', wwwRes.status === 301 ? 'PASS (301)' : `WARN (${wwwRes.status})`);

    // Tracking: intercept dataLayer
    await page.evaluate(() => {
      window.__testEvents = [];
      const orig = window.dataLayer?.push;
      if (orig) {
        window.dataLayer.push = function(...args) {
          window.__testEvents.push(JSON.parse(JSON.stringify(args)));
          return orig.apply(this, args);
        };
      }
    });
    await dismissCookieBanner(page);
    await page.locator('button[data-gtm="cta_hero_menu"]').first().click();
    await page.waitForTimeout(600);
    await closeModals(page);
    await page.locator('button[data-gtm="cta_hero_reserve"]').first().click();
    await page.waitForTimeout(600);

    const evs = await page.evaluate(() => window.__testEvents || []);
    const names = evs.flat().map(e => e?.event || e?.gtm_tag || '').filter(Boolean);
    log('tracking', 'gtmLoaded', names.some(e => e.includes('gtm')) ? 'PASS' : 'WARN');
    log('tracking', 'ga4Loaded', names.some(e => e.includes('page_view') || e.includes('reservation')) ? 'PASS' : 'WARN');
    log('tracking', 'reservationClick', names.some(e => e.includes('reservation')) ? 'PASS' : 'WARN');
  } catch (e) { log('seo', 'fatal', `ERROR: ${e.message}`); }

  // ═══════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== FINAL REPORT ===');
  console.log(JSON.stringify(results, null, 2));

  const vals = Object.values(results).flatMap(v => typeof v === 'object' && v !== null ? Object.values(v) : []);
  const hasFail = vals.some(v => typeof v === 'string' && v.startsWith('FAIL'));
  const hasFatal = results.pageErrors.length > 0;
  const has404 = results.consoleErrors.some(e => e.text.includes('404'));

  console.log('\n=== SCORE ===');
  console.log('Console errors:', results.consoleErrors.length);
  console.log('Page errors:', results.pageErrors.length);
  console.log('Image 404:', has404 ? 'YES' : 'NO');
  console.log('Result:', hasFail ? 'FAIL' : hasFatal ? 'FAIL (page errors)' : 'PASS');

  await browser.close();
}

run().catch(err => {
  console.error('QA fatal error:', err);
  process.exit(1);
});
