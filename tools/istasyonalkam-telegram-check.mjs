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
const sample = 'Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi';

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.setItem('alkam_local_session_v2', 'ok');
    localStorage.removeItem('alkam_telegram_inbox_v1');
    localStorage.removeItem('alkam_operation_suggestions_v1');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1800);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.telegramInboxVisible = bodyText.includes('Telegram Gelen Kutusu');
  result.checks.telegramInputVisible = await page.locator('#tgText').count() > 0;
  result.checks.telegramAddButtonVisible = bodyText.includes('Telegram Mesajı Ekle');

  await page.locator('#tgText').fill(sample, { timeout: 10000 });
  await page.locator('#tgAdd').click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.telegramMessageAdded = bodyText.includes('TG-') && bodyText.includes('Ungan Mobilya') && bodyText.includes('Gelen');
  result.checks.toSuggestionButtonVisible = bodyText.includes('Onay Merkezine Öneri Yap');

  await page.locator('[data-tg]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1800);
  bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.telegramSentStatusVisible = bodyText.includes('Onay Merkezi’ne gönderildi') || bodyText.includes('Onay Merkezine gönderildi');
  result.checks.operationSuggestionCreated = bodyText.includes('Ungan Mobilya') && bodyText.includes('100.000') && bodyText.includes('Ödeme sözü') && bodyText.includes('Onay bekliyor');

  if (!result.checks.telegramInboxVisible) result.errors.push('Telegram Gelen Kutusu görünmedi.');
  if (!result.checks.telegramInputVisible) result.errors.push('Telegram mesaj alanı görünmedi.');
  if (!result.checks.telegramAddButtonVisible) result.errors.push('Telegram Mesajı Ekle butonu görünmedi.');
  if (!result.checks.telegramMessageAdded) result.errors.push('Telegram mesajı gelen kutusuna eklenmedi.');
  if (!result.checks.toSuggestionButtonVisible) result.errors.push('Onay Merkezine Öneri Yap butonu görünmedi.');
  if (!result.checks.telegramSentStatusVisible) result.errors.push('Telegram gönderildi durumu görünmedi.');
  if (!result.checks.operationSuggestionCreated) result.errors.push('Telegram mesajından işlem önerisi oluşmadı.');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.checks.telegramInboxVisible && result.checks.telegramInputVisible && result.checks.telegramAddButtonVisible && result.checks.telegramMessageAdded && result.checks.toSuggestionButtonVisible && result.checks.telegramSentStatusVisible && result.checks.operationSuggestionCreated;
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
