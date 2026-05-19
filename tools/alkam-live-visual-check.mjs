import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://alkam-mali.pages.dev/';
const outDir = path.resolve('test-output/live-visual');
fs.mkdirSync(outDir, { recursive: true });

const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [], screenshots: [] };

async function shot(page, name){
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  result.screenshots.push(file);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);

  await shot(page, '01-home');

  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await shot(page, '02-onay-merkezi');

  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.telegramLiveVisible = bodyText.includes('Telegram Canlı Mesaj Alma');
  result.checks.telegramLivePullVisible = bodyText.includes('Mesajları Çek');
  result.checks.telegramLivePreviewVisible = bodyText.includes('Çek ve Ön İzle');
  result.checks.simpleTelegramVisible = bodyText.includes('Basit Telegram') && bodyText.includes('Veri Yükleme');
  result.checks.noWrongExternalExample = !bodyText.includes('Gamze Eczanesi');

  const placeholder = await page.locator('#simpleTelegramText').getAttribute('placeholder').catch(() => '');
  result.checks.simpleTelegramPlaceholder = placeholder || '';
  result.checks.placeholderUsesAlkamCari = !!placeholder && !placeholder.includes('Gamze');

  await page.locator('[data-tab="hesaplar"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await shot(page, '03-hesaplar');
  const hesapText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.bankImportVisible = hesapText.includes('Basit Banka Ekstre Yükleme');

  if (!result.checks.telegramLiveVisible) result.errors.push('Canlı Telegram mesaj alma kutusu görünmedi.');
  if (!result.checks.telegramLivePullVisible) result.errors.push('Mesajları Çek butonu görünmedi.');
  if (!result.checks.telegramLivePreviewVisible) result.errors.push('Çek ve Ön İzle butonu görünmedi.');
  if (!result.checks.simpleTelegramVisible) result.errors.push('Basit Telegram veri yükleme kutusu görünmedi.');
  if (!result.checks.noWrongExternalExample) result.errors.push('ALKAM ekranında harici cari örneği göründü.');
  if (!result.checks.placeholderUsesAlkamCari) result.errors.push('Telegram örnek alanı ALKAM cari tabanlı görünmüyor.');
  if (!result.checks.bankImportVisible) result.errors.push('Banka ekstre yükleme kutusu görünmedi.');

  result.ok = result.errors.length === 0;
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'live-visual-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (err) {
  result.errors.push(err.message);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'live-visual-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
