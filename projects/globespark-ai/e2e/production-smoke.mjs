import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.GLOBESPARK_BASE_URL || 'https://globespark-ai-v11dlz.v2.appdeploy.ai/';
const artifactsDir = new URL('./artifacts/', import.meta.url);
await mkdir(artifactsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function desktopJapan() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'en-US' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}?lang=en`, { waitUntil: 'domcontentloaded', timeout: 45_000 });

  const search = page.locator('.search-wrap input');
  await search.waitFor({ state: 'visible', timeout: 20_000 });
  await search.fill('Japan');
  await page.locator('.search-results button', { hasText: 'Japan' }).first().click();

  const canvas = page.locator('canvas.globe-canvas');
  await canvas.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('canvas.globe-canvas')?.getAttribute('data-selected-code') === 'JP', null, { timeout: 20_000 });

  const quickCard = page.locator('.map-quick-card[data-country-code="JP"]');
  await quickCard.waitFor({ state: 'visible', timeout: 20_000 });
  assert.match(await quickCard.innerText(), /Japan/i);

  await canvas.focus();
  await page.keyboard.press('+');
  await page.waitForTimeout(300);
  assert.equal(await canvas.getAttribute('data-selected-code'), 'JP');

  await page.screenshot({ path: new URL('desktop-japan.png', artifactsDir).pathname, fullPage: true });
  await context.close();
}

async function mobileArabicMalta() {
  const context = await browser.newContext({ viewport: { width: 375, height: 667 }, locale: 'ar' });
  const page = await context.newPage();
  await page.goto(`${baseUrl}?lang=ar&country=MT`, { waitUntil: 'domcontentloaded', timeout: 45_000 });

  await page.waitForFunction(() => document.documentElement.dir === 'rtl', null, { timeout: 20_000 });
  const canvas = page.locator('canvas.globe-canvas');
  await canvas.waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('canvas.globe-canvas')?.getAttribute('data-selected-code') === 'MT', null, { timeout: 20_000 });

  const quickCard = page.locator('.map-quick-card[data-country-code="MT"]');
  await quickCard.waitFor({ state: 'visible', timeout: 20_000 });
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await canvas.getAttribute('data-selected-code'), 'MT');

  await page.screenshot({ path: new URL('mobile-ar-malta.png', artifactsDir).pathname, fullPage: true });
  await context.close();
}

try {
  await desktopJapan();
  await mobileArabicMalta();
  console.log(JSON.stringify({ ok: true, target: baseUrl, checks: ['desktop-japan-selection', 'quick-data-card', 'selection-stability-after-zoom', 'mobile-arabic-rtl', 'malta-deep-link'] }, null, 2));
} finally {
  await browser.close();
}
