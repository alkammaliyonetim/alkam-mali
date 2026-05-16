import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://luca-sync.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-luca-sync-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-luca-sync-${stamp}.png`);
const sample = `Kısa Adı\tUzun Adı\tVergi Dairesi\tVergi No\tTC Kimlik No\tAçıklama\tKuruluş Tarihi\tKapanış Tarihi\nTESTLUCA\tTEST LUCA CARİ LİMİTED ŞİRKETİ\tİNEGÖL VERGİ DAİRESİ\t1234567890\t\t\t01/01/2026\t\nADEM KAMAC\tADEM KAMACI-AVUKAT\tİNEGÖL VERGİ DAİRESİ\t4940622092\t18334667110\t\t05/03/2025\t`;

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('[data-tab="yedek"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.panelVisible = bodyText.includes('Luca Müşteri / Cari Senkronizasyonu');
  result.checks.textareaVisible = await page.locator('#lucaSyncText').count() > 0;
  result.checks.buttonsVisible = bodyText.includes('Ön İzle') && bodyText.includes('Eksikleri Ekle');

  await page.locator('#lucaSyncText').fill(sample, { timeout: 10000 });
  await page.locator('#lucaPreviewBtn').click({ timeout: 10000 });
  await page.waitForTimeout(800);
  bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.previewReadsRows = bodyText.includes('Luca Okunan') && bodyText.includes('2');
  result.checks.missingShowsTest = bodyText.includes('TESTLUCA') || bodyText.includes('TEST LUCA');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;

  if (!result.checks.panelVisible) result.errors.push('Luca senkron paneli görünmedi.');
  if (!result.checks.textareaVisible) result.errors.push('Luca liste yapıştırma alanı görünmedi.');
  if (!result.checks.buttonsVisible) result.errors.push('Luca ön izleme/güncelleme butonları görünmedi.');
  if (!result.checks.previewReadsRows) result.errors.push('Luca ön izleme satırları okumadı.');
  if (!result.checks.missingShowsTest) result.errors.push('Eksik test müşterisi listede görünmedi.');

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
