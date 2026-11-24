// Drives the running app (npm run dev) through every screen state and saves phone screenshots.
// Usage: node scripts/capture-screens.mjs [baseUrl]   → docs/flows/screens/*.png
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://localhost:5179/';
const OUT = new URL('../docs/flows/screens/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || join(homedir(), '.cache/ms-playwright/chromium-1254/chrome-linux64/chrome');

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const done = [];

async function shot(name, { full = false } = {}) {
  await wait(750);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: full });
  done.push(name);
  console.log('✓', name);
}
async function fresh() {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE);
  await wait(500);
}
const btn = (name, exact = false) => page.getByRole('button', { name, exact }).filter({ visible: true }).first();
const tap = async (name, exact = false) => { await btn(name, exact).click(); await wait(350); };
const nav = async (label) => { await page.locator('nav[aria-label="Main"] button').filter({ hasText: label }).first().click(); await wait(400); };
const demo = async (who) => { await fresh(); await tap('Try a demo account', true); await page.getByRole('button', { name: who }).click(); await wait(600); };
const back = async () => { await page.getByRole('button', { name: 'Back', exact: true }).filter({ visible: true }).first().click(); await wait(400); };
const top = () => page.evaluate(() => window.scrollTo(0, 0));

// ───── Onboarding ─────
await fresh(); await shot('01-welcome');
await tap('Try a demo account', true); await shot('02-demo-sheet');
await fresh(); await tap('Shop and sell'); await shot('03-signup-phone');
await tap('Continue', true); await shot('04-signup-phone-error');
await page.getByLabel('Mobile number').fill('9845024190'); await tap('Continue', true); await shot('05-signup-otp');
await page.getByLabel('Verification code').fill('1111'); await tap('Continue', true); await shot('06-signup-otp-error');
await page.getByLabel('Verification code').fill('1234'); await tap('Continue', true); await shot('07-signup-profile');
await fresh(); await tap('I run a local business'); await page.getByLabel('Mobile number').fill('9900155230'); await tap('Continue', true);
await page.getByLabel('Verification code').fill('1234'); await tap('Continue', true); await shot('08-business-profile');

// ───── Shopper · Local brands ─────
await demo('Kabir · Shopper'); await shot('10-shop-home');
await page.evaluate(() => window.scrollTo(0, 560)); await shot('11-shop-home-products'); await top();
await page.getByLabel('Search products').fill('xyz'); await shot('12-shop-search-empty');
await page.getByLabel('Search products').fill(''); await tap('Plants', true); await shot('13-shop-category'); await tap('All', true);
await page.locator('main .rail button').filter({ hasText: 'Crumb & Co.' }).first().click(); await wait(500); await shot('14-brand-store');
await page.getByRole('button', { name: /Masala Peanut Chikki/ }).first().click(); await wait(500); await shot('15-product-sold-out');
await back(); await page.getByRole('button', { name: /^Classic Sourdough Loaf/ }).first().click(); await wait(500); await shot('16-product-detail');
await tap('Add ·'); await shot('17-cart');
await page.getByRole('tab', { name: 'Pickup' }).click(); await shot('18-cart-pickup'); await page.getByRole('tab', { name: 'Delivery' }).click();
await tap('Pay ₹'); await wait(1900); await shot('19-order-placed');
await tap('Track my order'); await shot('20-orders');
await page.getByRole('button', { name: 'Cancel', exact: true }).first().click(); await shot('21-cancel-sheet');
await tap('Keep order'); await nav('Cart'); await shot('22-cart-empty');

// ───── Shopper · Secondhand ─────
await nav('Secondhand'); await shot('30-sh-browse');
await page.getByRole('button', { name: /Prestige 25 L/ }).first().click(); await wait(500); await shot('31-listing-meet');
await tap('Message'); await tap('Is it still available?'); await wait(1800); await shot('32-chat');
await back(); await back();
await page.getByRole('button', { name: /Sony wireless/ }).first().click(); await wait(500); await shot('33-listing-ship');
await back();
await page.getByRole('button', { name: /Prestige 25 L/ }).first().click(); await wait(400); await tap('Request to buy'); await shot('34-deal-requested');
await wait(2600); await shot('35-deal-accepted-code');
await page.getByRole('tab', { name: /Browse/ }).click(); await wait(300);
await tap('Sell', true); await shot('40-sell-step1');
await tap('Continue', true); await shot('41-sell-photo-error');
await tap('Add photo'); await tap('Add photo'); await shot('42-sell-photos');
await tap('Continue', true); await wait(200); await shot('43-sell-reading');
await wait(1800); await shot('44-sell-questions');
for (const o of ['6–18 months', 'None', 'Bill + box']) await tap(o, true);
await tap('Write my listing'); await shot('45-sell-review');
await tap('Next: how to sell'); await shot('46-sell-mode');
await tap('Publish listing'); await wait(900); await shot('47-sell-published');
await tap('See my listings'); await shot('48-my-listings');
await page.getByRole('tab', { name: /Deals/ }).click(); await wait(300); await tap('Selling'); await shot('49-deals-selling-request');
await tap('Accept request'); await shot('50-deals-selling-code');
await tap('Buying'); await page.evaluate(() => window.scrollTo(0, 99999)); await shot('51-deals-buying-shipped');

// ───── Business ─────
await demo('Ananya · Crumb & Co.'); await shot('60-biz-home');
await nav('Orders'); await shot('61-biz-orders');
await tap('Decline', true); await shot('62-biz-decline-sheet'); await tap('Keep it');
await tap('Accept order'); await top(); await shot('63-biz-order-accepted');
await nav('Products'); await shot('64-biz-products');
await page.getByRole('button', { name: /More options for Classic/ }).click(); await shot('65-biz-product-menu');
await tap('Delete product'); await shot('66-biz-delete-confirm'); await tap('Cancel', true);
await tap('Add product'); await shot('67-biz-product-form');
await back(); await nav('Store'); await shot('68-biz-store');

// ───── Admin ─────
await demo('Admin'); await shot('70-admin-overview');
await nav('Sellers'); await shot('71-admin-sellers');
await nav('Orders'); await shot('72-admin-orders');
await nav('Listings'); await shot('73-admin-listings');

await browser.close();
console.log(`\n${done.length} screens saved to ${OUT}`);
