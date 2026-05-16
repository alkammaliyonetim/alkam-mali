import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-mobile-cari-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-mobile-cari-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('[data-tab="cariler"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  const navCount = await page.locator('#alkamMobileCariNav').count();
  const navVisible = navCount > 0 ? await page.locator('#alkamMobileCariNav').first().isVisible().catch(() => false) : false;
  result.checks.carilerVisible = bodyText.includes('Cari') || bodyText.includes('Cariler');
  result.checks.mobileCariNavFound = navCount > 0;
  result.checks.mobileCariNavVisible = navVisible;
  result.checks.listButtonVisible = bodyText.includes('Cari listesi');
  result.checks.moveButtonVisible = bodyText.includes('Hareketlere git');
  if (!result.checks.carilerVisible) result.errors.push('Cariler ekranı görünmedi.');
  if (!result.checks.mobileCariNavFound) result.errors.push('Mobil cari mini gezinme bulunamadı.');
  if (!result.checks.mobileCariNavVisible) result.errors.push('Mobil cari mini gezinme görünür değil.');
  if (!result.checks.listButtonVisible) result.errors.push('Cari listesi butonu görünmedi.');
  if (!result.checks.moveButtonVisible) result.errors.push('Hareketlere git butonu görünmedi.');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.checks.carilerVisible && result.checks.mobileCariNavFound && result.checks.mobileCariNavVisible && result.checks.listButtonVisible && result.checks.moveButtonVisible;
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (err) {
  result.errors.push(err.message);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
