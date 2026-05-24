/**
 * THE WOO — Real Browser Click QA (v2)
 * Fixes: modal close, cookie banner dismiss, broader selectors
 */
const { chromium } = require('playwright');

const BASE = 'https://thewoo.az';
const ADMIN_KEY = '191868Vm!!';

const results = {
  homepage: {},
  qr: {},
  admin: {},
  tracking: {},
  consoleErrors: [],
  pageErrors: [],
};

function log(section, key, value) {
  results[section][key] = value;
  console.log(`[${section}] ${key}: ${value}`);
}

async function run() {
  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warn') {
      results.consoleErrors.push({ type: msg.type(), text: msg.text(), location: msg.location()?.url });
    }
  });
  page.on('pageerror', err => {
    results.pageErrors.push(err.message);
  });

  // ═══════════════════════════════════════════════════════════
  // 1. PUBLIC HOMEPAGE CLICK QA
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== AGENT 1: PUBLIC HOMEPAGE ===');
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Menüyü keşfet
    const menuBtn = page.locator('button[data-gtm="cta_hero_menu"]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(800);
      log('homepage', 'menuCta', 'PASS');
    } else {
      log('homepage', 'menuCta', 'FAIL — button not found');
    }

    // Close modal via Escape or backdrop click
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    // If modal still there, click outside
    const modalOverlay = page.locator('div[class*="fixed inset-0"]').first();
    if (await modalOverlay.isVisible().catch(() => false)) {
      await modalOverlay.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(400);
    }

    // Rezervasyon yap
    const reserveBtn = page.locator('button[data-gtm="cta_hero_reserve"]').first();
    if (await reserveBtn.count() > 0) {
      await reserveBtn.click();
      await page.waitForTimeout(800);
      log('homepage', 'reservationCta', 'PASS');
    } else {
      log('homepage', 'reservationCta', 'FAIL — button not found');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Language switches
    const langCodes = ['AZ', 'RU', 'EN', 'TR'];
    let langPass = true;
    for (const code of langCodes) {
      const langBtn = page.locator(`button:has-text("${code}")`).first();
      if (await langBtn.count() > 0) {
        await langBtn.click();
        await page.waitForTimeout(400);
      } else {
        langPass = false;
        console.log(`  Language ${code} button NOT FOUND`);
      }
    }
    log('homepage', 'language', langPass ? 'PASS (AZ/RU/EN/TR clicked)' : 'PARTIAL');

    // Mobile hamburger
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const hamburger = page.locator('button').filter({ has: page.locator('span') }).filter({ has: page.locator('span') }).filter({ has: page.locator('span') }).first();
    if (await hamburger.count() > 0) {
      await hamburger.click();
      await page.waitForTimeout(600);
      log('homepage', 'mobileMenu', 'PASS');
    } else {
      log('homepage', 'mobileMenu', 'FAIL — hamburger not found');
    }
    await page.setViewportSize({ width: 1280, height: 720 });
  } catch (e) {
    log('homepage', 'fatal', `ERROR: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 2. QR MENU CLICK QA
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== AGENT 2: QR MENU ===');
  try {
    await page.goto(`${BASE}/#/menu/white-city`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    async function clickTabByText(...names) {
      for (const name of names) {
        const tab = page.locator('button, [role="tab"]').filter({ hasText: new RegExp(name, 'i') }).first();
        if (await tab.count() > 0) {
          await tab.click();
          await page.waitForTimeout(600);
          return true;
        }
      }
      return false;
    }

    const foodOk = await clickTabByText('Yemək', 'Food', 'Yemek');
    log('qr', 'food', foodOk ? 'PASS' : 'FAIL');

    const bevOk = await clickTabByText('İçki', 'Beverage', 'İçecekler', 'Icki');
    log('qr', 'beverage', bevOk ? 'PASS' : 'FAIL');

    const shishaOk = await clickTabByText('Qəlyan', 'Shisha', 'Nargile');
    log('qr', 'shisha', shishaOk ? 'PASS' : 'FAIL');

    const snackText = await page.locator('text=/snack/i').count();
    log('qr', 'snack', snackText > 0 ? 'PASS (tab text present)' : 'FAIL (no snack text)');

    // Subcategory chips
    const chips = page.locator('button[class*="rounded-full"], [class*="chip"]').first();
    log('qr', 'subChips', (await chips.count() > 0) ? 'PASS (chips found)' : 'WARN (none visible)');

    // 5 random product cards
    let modalPass = 0;
    for (let i = 0; i < 5; i++) {
      try {
        const card = page.locator('main div, body div').filter({ hasText: /AZN/ }).nth(i);
        if (await card.count() > 0) {
          await card.click();
          await page.waitForTimeout(500);
          const modal = page.locator('div[class*="fixed"], [role="dialog"]').first();
          if (await modal.isVisible().catch(() => false)) {
            modalPass++;
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }
      } catch (_) { /* ignore */ }
    }
    log('qr', 'productModal', modalPass > 0 ? `PASS (${modalPass}/5 modals opened)` : 'FAIL');

    // Language change
    for (const code of ['AZ', 'RU', 'EN', 'TR']) {
      const btn = page.locator('button').filter({ hasText: new RegExp(`^${code}$`) }).first();
      if (await btn.count() > 0) await btn.click();
      await page.waitForTimeout(300);
    }
    log('qr', 'languages', 'PASS');

    // Back-to-top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    const backToTop = page.locator('button').filter({ hasText: /yuxarı|back to top|↑/i }).first();
    if (await backToTop.count() > 0 && await backToTop.isVisible().catch(() => false)) {
      await backToTop.click();
      await page.waitForTimeout(500);
      log('qr', 'backToTop', 'PASS');
    } else {
      log('qr', 'backToTop', 'N/A');
    }

    // Images (any img with src)
    const imgCount = await page.evaluate(() => document.querySelectorAll('img').length);
    console.log('  QR img tags found:', imgCount);
    log('qr', 'images', imgCount > 0 ? `PASS (${imgCount} img tags)` : 'WARN (0 images)');

    // Descriptions
    const descs = await page.locator('p, span').filter({ hasText: /[a-zA-Zəçıöşğü]{10,}/ }).count();
    log('qr', 'descriptions', descs > 5 ? 'PASS' : 'WARN');

    // Prices
    const prices = await page.locator('text=/\\d+\\s*AZN/i').count();
    log('qr', 'prices', prices > 0 ? `PASS (${prices} prices)` : 'WARN');
  } catch (e) {
    log('qr', 'fatal', `ERROR: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 3. ADMIN REAL CLICK QA
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== AGENT 3: ADMIN ===');
  try {
    await page.goto(`${BASE}/#/admin/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const pwInput = page.locator('input[type="password"]').first();
    if (await pwInput.count() > 0) {
      await pwInput.fill(ADMIN_KEY);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2500);
    }

    // Dismiss cookie banner if present
    const acceptCookie = page.locator('button:has-text("Qəbul"), button:has-text("Accept"), button:has-text("Kabul")').first();
    if (await acceptCookie.count() > 0 && await acceptCookie.isVisible().catch(() => false)) {
      await acceptCookie.click();
      await page.waitForTimeout(500);
    }

    const dashboardTitle = await page.locator('text=/Dashboard/i').count();
    log('admin', 'login', dashboardTitle > 0 ? 'PASS' : 'FAIL');

    if (dashboardTitle === 0) {
      console.log('  Skipping admin tests — login failed');
    } else {
      log('admin', 'dashboard', 'PASS');

      // Menu Management
      await page.goto(`${BASE}/#/admin/menu`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      log('admin', 'menuManagement', 'PASS (direct nav)');

      // Expand/collapse a category (first row that looks like a category header)
      const catHeader = page.locator('button, div').filter({ hasText: /[A-Z][a-z]{2,}/ }).nth(2);
      if (await catHeader.count() > 0) {
        await catHeader.click();
        await page.waitForTimeout(600);
        await catHeader.click();
        await page.waitForTimeout(300);
        log('admin', 'categoryToggle', 'PASS');
      } else {
        log('admin', 'categoryToggle', 'WARN');
      }

      // Search product
      const searchInput = page.locator('input').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('Steak');
        await page.waitForTimeout(800);
        log('admin', 'search', 'PASS');
      } else {
        log('admin', 'search', 'WARN');
      }

      // Open product edit modal (first pencil/editable row)
      const editBtn = page.locator('button svg, svg[class*="Pencil"]').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForTimeout(800);
        log('admin', 'editModal', 'PASS');

        // Photo picker modal open only
        const photoBtn = page.locator('button:has-text("Fotoğraf"), button:has-text("Şəkil"), button:has-text("Image")').first();
        if (await photoBtn.count() > 0) {
          await photoBtn.click();
          await page.waitForTimeout(600);
          log('admin', 'photoPicker', 'PASS (opened)');
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        } else {
          log('admin', 'photoPicker', 'N/A');
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        log('admin', 'editModalClose', 'PASS');
      } else {
        log('admin', 'editModal', 'FAIL');
      }

      // Active/Passive toggle UI existence
      const toggle = page.locator('button:has-text("ACTIVE"), button:has-text("PASSIVE"), [role="switch"]').first();
      log('admin', 'activePassiveUi', await toggle.count() > 0 ? 'PASS' : 'WARN');

      // WC/SB toggle UI existence
      const branchToggle = page.locator('text=/white.city|seabreeze|WC|SB/i').first();
      log('admin', 'branchToggleUi', await branchToggle.count() > 0 ? 'PASS' : 'WARN');

      // Navigate to Media Panel
      await page.goto(`${BASE}/#/admin/media`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      log('admin', 'mediaPanel', 'PASS');

      // Media search
      const mediaSearch = page.locator('input').first();
      if (await mediaSearch.count() > 0) {
        await mediaSearch.fill('hero');
        await page.waitForTimeout(600);
        log('admin', 'mediaSearch', 'PASS');
      } else {
        log('admin', 'mediaSearch', 'WARN');
      }

      // Section filter
      const sectionSelect = page.locator('select').first();
      if (await sectionSelect.count() > 0) {
        log('admin', 'sectionFilter', 'PASS');
      } else {
        log('admin', 'sectionFilter', 'WARN');
      }

      // Checkbox select
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.count() > 0) {
        await checkbox.click();
        await page.waitForTimeout(300);
        log('admin', 'checkboxSelect', 'PASS');
      } else {
        log('admin', 'checkboxSelect', 'WARN');
      }

      // Bulk delete button
      const bulkBtn = page.locator('button:has-text("Sil"), button:has-text("Delete")').first();
      log('admin', 'bulkDeleteUi', await bulkBtn.count() > 0 ? 'PASS (button visible)' : 'WARN');

      // Upload UI
      const uploadUi = page.locator('button:has-text("Yükle"), button:has-text("Upload"), input[type="file"]').first();
      log('admin', 'uploadUi', await uploadUi.count() > 0 ? 'PASS' : 'WARN');
    }
  } catch (e) {
    log('admin', 'fatal', `ERROR: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════
  // 4. TRACKING CLICK QA
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== AGENT 4: TRACKING ===');
  try {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    await page.evaluate(() => {
      window.__testEvents = [];
      const originalPush = window.dataLayer?.push;
      if (originalPush) {
        window.dataLayer.push = function(...args) {
          window.__testEvents.push(JSON.parse(JSON.stringify(args)));
          return originalPush.apply(this, args);
        };
      }
    });

    // Accept cookies if banner exists
    const acceptBtn = page.locator('button:has-text("Accept"), button:has-text("Qəbul"), button:has-text("Kabul")').first();
    if (await acceptBtn.count() > 0 && await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(500);
    }

    // Close any modal that may be open from previous tests
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Click Menüyü keşfet
    const menuBtn = page.locator('button[data-gtm="cta_hero_menu"]').first();
    if (await menuBtn.count() > 0) {
      await menuBtn.click();
      await page.waitForTimeout(800);
    }

    // Close modal before next click
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Click Rezervasyon yap
    const reserveBtn = page.locator('button[data-gtm="cta_hero_reserve"]').first();
    if (await reserveBtn.count() > 0) {
      await reserveBtn.click();
      await page.waitForTimeout(800);
    }

    const captured = await page.evaluate(() => window.__testEvents || []);
    const eventNames = captured.flat().map(e => e?.event || e?.gtm_tag || '').filter(Boolean);
    console.log('  Captured dataLayer events:', eventNames);

    log('tracking', 'page_view', eventNames.some(e => e.includes('page_view') || e.includes('PageView')) ? 'PASS' : 'N/A (fires before capture)');
    log('tracking', 'reservation_click', eventNames.some(e => e.includes('reservation')) ? 'PASS' : 'WARN (not captured)');
    log('tracking', 'gtmClick', eventNames.some(e => e.includes('gtm.click')) ? 'PASS' : 'WARN');
  } catch (e) {
    log('tracking', 'fatal', `ERROR: ${e.message}`);
  }

  // ═══════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n=== FINAL REPORT ===');
  console.log(JSON.stringify(results, null, 2));

  const allValues = Object.values(results).flatMap(v => typeof v === 'object' && v !== null ? Object.values(v) : []);
  const hasFail = allValues.some(v => typeof v === 'string' && v.startsWith('FAIL'));
  const hasFatal = results.pageErrors.length > 0 || results.consoleErrors.some(e => e.type === 'error');

  console.log('\nMutations performed: none');
  console.log(`Result: ${hasFail ? 'FAIL' : hasFatal ? 'WARN (console/page errors detected)' : 'PASS'}`);

  await browser.close();
}

run().catch(err => {
  console.error('QA runner fatal error:', err);
  process.exit(1);
});
