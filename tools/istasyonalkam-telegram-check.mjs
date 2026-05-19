import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://alkam-mali.pages.dev/';
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
  await page.waitForTimeout(3500);

  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.liveTelegramBoxVisible = bodyText.includes('Telegram Canlı Mesaj Alma');
  result.checks.liveTelegramKeyInputVisible = await page.locator('#tgBotKey').count() > 0;
  result.checks.liveTelegramPullButtonVisible = await page.locator('#tgLiveBox button:has-text("Mesajları Çek")').count() > 0;
  result.checks.liveTelegramPullPreviewButtonVisible = await page.locator('#tgLiveBox button:has-text("Çek ve Ön İzle")').count() > 0;

  result.checks.simpleTelegramBoxVisible = bodyText.includes('Basit Telegram') && bodyText.includes('Veri Yükleme');
  result.checks.simpleTelegramInputVisible = await page.locator('#simpleTelegramText').count() > 0;
  result.checks.simpleTelegramPreviewButtonVisible = await page.locator('#simpleTelegramBox button:has-text("Ön İzle")').count() > 0;
  result.checks.gamzeExampleRemoved = !(await page.locator('#simpleTelegramText').getAttribute('placeholder').catch(() => '') || '').includes('Gamze');

  if (result.checks.simpleTelegramInputVisible) {
    await page.locator('#simpleTelegramText').fill('18.05.2026 ORNEK CARI tahsilat 12500,00 TL', { timeout: 10000 });
    await page.locator('#simpleTelegramBox button:has-text("Ön İzle")').click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    bodyText = await page.locator('body').innerText({ timeout: 15000 });
    result.checks.simpleTelegramPreviewWorks = bodyText.includes('Ön izleme') && bodyText.includes('12.500,00 TL');
  } else {
    result.checks.simpleTelegramPreviewWorks = false;
  }

  if (!result.checks.liveTelegramBoxVisible) result.errors.push('Telegram Canlı Mesaj Alma kutusu görünmedi.');
  if (!result.checks.liveTelegramKeyInputVisible) result.errors.push('Telegram canlı bot anahtarı alanı görünmedi.');
  if (!result.checks.liveTelegramPullButtonVisible) result.errors.push('Mesajları Çek butonu görünmedi.');
  if (!result.checks.liveTelegramPullPreviewButtonVisible) result.errors.push('Çek ve Ön İzle butonu görünmedi.');
  if (!result.checks.simpleTelegramBoxVisible) result.errors.push('Basit Telegram veri yükleme kutusu görünmedi.');
  if (!result.checks.simpleTelegramInputVisible) result.errors.push('Basit Telegram veri alanı görünmedi.');
  if (!result.checks.simpleTelegramPreviewButtonVisible) result.errors.push('Basit Telegram ön izleme butonu görünmedi.');
  if (!result.checks.gamzeExampleRemoved) result.errors.push('Gamze Eczanesi örneği ALKAM ekranında kalmış.');
  if (!result.checks.simpleTelegramPreviewWorks) result.errors.push('Basit Telegram ön izleme çalışmadı.');

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