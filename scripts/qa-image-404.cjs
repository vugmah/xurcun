/**
 * Quick QA: verify no broken /uploads/ or //uploads/ image 404s remain.
 */
const { chromium } = require('playwright');

const BASE = 'https://thewoo.az';
const badPatterns = ['/uploads/', '//uploads/'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('Failed to load resource')) {
        errors.push(text);
      }
    }
  });

  // 1. Homepage
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 2. QR Menu (all tabs)
  await page.goto(`${BASE}/#/menu/white-city`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const tabs = ['Yemək', 'İçki', 'Qəlyan'];
  for (const t of tabs) {
    const btn = page.locator('button', { hasText: new RegExp(t, 'i') }).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(800);
    }
  }

  // Scroll to trigger lazy images
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const imgSrcs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(i => i.src)
  );

  const badUrls = imgSrcs.filter(src =>
    badPatterns.some(p => src.includes(p))
  );

  const broken404 = errors.filter(e =>
    badPatterns.some(p => e.includes(p))
  );

  console.log('=== QA Image 404 ===');
  console.log('Total console errors:', errors.length);
  console.log('Broken URL patterns in img src:', badUrls.length);
  console.log('Broken 404 console errors:', broken404.length);

  if (badUrls.length > 0) {
    console.log('Bad img srcs:', badUrls);
  }
  if (broken404.length > 0) {
    console.log('Bad console errors:', broken404);
  }

  console.log('Result:', (badUrls.length === 0 && broken404.length === 0) ? 'PASS' : 'FAIL');

  await browser.close();
})();
