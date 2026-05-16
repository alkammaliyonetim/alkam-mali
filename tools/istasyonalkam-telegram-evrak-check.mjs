import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://telegram-evrak.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-telegram-evrak-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-telegram-evrak-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.on('dialog', async d => { result.lastDialog = d.message(); await d.accept(); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.panelVisible = bodyText.includes('Telegram Evrak / Ekran Görüntüsü / Excel Girişi');
  result.checks.cariField = await page.locator('#tgCari').count() > 0;
  result.checks.amountField = await page.locator('#tgAmount').count() > 0;
  result.checks.dateField = await page.locator('#tgDate').count() > 0;
  result.checks.docTypeField = await page.locator('#tgDocType').count() > 0;
  result.checks.fileField = await page.locator('#tgFile').count() > 0;
  result.checks.rawField = await page.locator('#tgRaw').count() > 0;
  result.checks.addButton = await page.locator('#tgEvrakAdd').count() > 0;

  await page.locator('#tgCari').fill('ÇAĞTES', { timeout: 10000 });
  await page.locator('#tgAmount').fill('100.000', { timeout: 10000 });
  await page.locator('#tgDate').fill('2026-05-16', { timeout: 10000 });
  await page.locator('#tgDocType').selectOption({ label: 'Dekont Görseli' });
  await page.locator('#tgFile').fill('cagtes-dekont-160526.jpg', { timeout: 10000 });
  await page.locator('#tgRaw').fill('Çağtes 100.000 TL dekont gönderdi. Onaya sun.', { timeout: 10000 });
  await page.locator('#tgEvrakAdd').click({ timeout: 10000 });
  await page.waitForTimeout(1200);

  bodyText = await page.locator('body').innerText({ timeout: 15000 });
  const storage = await page.evaluate(() => ({
    evrakCount: JSON.parse(localStorage.getItem('alkam_telegram_evrak_v1') || '[]').length,
    opCount: JSON.parse(localStorage.getItem('alkam_operation_suggestions_v1') || '[]').length,
    lastEvrak: JSON.parse(localStorage.getItem('alkam_telegram_evrak_v1') || '[]')[0] || null,
    lastOp: JSON.parse(localStorage.getItem('alkam_operation_suggestions_v1') || '[]')[0] || null
  }));
  result.checks.evrakSaved = storage.evrakCount > 0 && storage.lastEvrak?.fileName === 'cagtes-dekont-160526.jpg';
  result.checks.opSuggestionCreated = storage.opCount > 0 && storage.lastOp?.source === 'Telegram Evrak';
  result.checks.waitingStatus = storage.lastOp?.status === 'Onay bekliyor';
  result.checks.amountParsed = Number(storage.lastOp?.amount || 0) === 100000;
  result.checks.cariParsed = String(storage.lastOp?.cari || '').includes('ÇAĞTES');
  result.checks.visibleInPanel = bodyText.includes('cagtes-dekont-160526.jpg') && bodyText.includes('Telegram evrak önerisi');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;

  for (const [key, value] of Object.entries(result.checks)) {
    if (!value) result.errors.push(`${key} failed`);
  }

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
