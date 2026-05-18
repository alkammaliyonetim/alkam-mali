import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-telegram-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-telegram-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem('alkam_local_session_v2', 'ok');
    localStorage.removeItem('ALKAM_FINAL_APPROVALS_V1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  if (!(await page.evaluate(() => !!window.ALKAM_DAILY_OPS)) && fs.existsSync('alkam-daily-ops-v1.js')) {
    await page.addScriptTag({ path: path.resolve('alkam-daily-ops-v1.js') });
  }
  await page.waitForTimeout(1200);
  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1800);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.telegramBoxVisible = bodyText.includes('Telegram') && bodyText.includes('Veri Yükleme');
  result.checks.telegramInputVisible = await page.locator('#alkamTelegramText').count() > 0;
  result.checks.telegramPreviewButtonVisible = bodyText.includes('Ön İzle');

  if (result.checks.telegramInputVisible) {
    await page.locator('#alkamTelegramText').fill('18.05.2026 Test Cari tahsilat 12500,00 TL', { timeout: 10000 });
    await page.locator('button:has-text("Ön İzle")').first().click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    bodyText = await page.locator('body').innerText({ timeout: 15000 });
    result.checks.telegramPreviewWorks = bodyText.includes('Ön izleme') && bodyText.includes('12.500,00 TL');
  } else {
    result.checks.telegramPreviewWorks = false;
  }

  if (!result.checks.telegramBoxVisible) result.errors.push('Telegram veri yükleme kutusu görünmedi.');
  if (!result.checks.telegramInputVisible) result.errors.push('Telegram veri alanı görünmedi.');
  if (!result.checks.telegramPreviewButtonVisible) result.errors.push('Telegram ön izleme butonu görünmedi.');
  if (!result.checks.telegramPreviewWorks) result.errors.push('Telegram ön izleme çalışmadı.');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.errors.length === 0;
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