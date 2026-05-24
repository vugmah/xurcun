const { chromium } = require('playwright');

async function sniffAdminPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  const network404s = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', err => errors.push(err.message));
  page.on('response', resp => {
    if (resp.status() === 404 || resp.status() === 500) {
      network404s.push(`${resp.status()} ${resp.url()}`);
    }
  });
  
  console.log('\n=== Admin Login Page ===');
  try {
    await page.goto('https://thewoo.az/#/admin/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
  } catch (e) {}
  
  const loginCritical = errors.filter(e => e.includes('forceUpdate') || e.includes('qrUrl'));
  console.log(loginCritical.length ? '❌ CRITICAL: ' + loginCritical.join(', ') : '✅ No forceUpdate/qrUrl errors on login');
  
  await browser.close();
  
  console.log('\n=== Network 404/500 Summary ===');
  const img404s = network404s.filter(u => u.includes('.webp') || u.includes('.jpg') || u.includes('.png'));
  const api500s = network404s.filter(u => u.includes('/api/'));
  console.log(`Image 404s: ${img404s.length}`);
  console.log(`API 500s: ${api500s.length}`);
  img404s.slice(0, 3).forEach(u => console.log('  ', u));
  api500s.slice(0, 3).forEach(u => console.log('  ', u));
}

sniffAdminPages().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
