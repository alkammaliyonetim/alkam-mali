import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-operation-flow-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-operation-flow-${stamp}.png`);
const sample = 'Ungan Mobilya haziranın son günü 100.000 TL ödeme sözü verdi';

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.locator('[data-tab="onay"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.locator('#opText').fill(sample, { timeout: 10000 });
  await page.locator('#opAdd').click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.sampleVisible = bodyText.includes('Ungan Mobilya');
  result.checks.amountVisible = bodyText.includes('100.000') || bodyText.includes('100.000,00') || bodyText.includes('100000');
  result.checks.typeVisible = bodyText.includes('Ödeme sözü') || bodyText.includes('Odeme');
  result.checks.waitingVisible = bodyText.includes('Onay bekliyor');
  result.checks.approveVisible = bodyText.includes('Onayla');
  result.checks.rejectVisible = bodyText.includes('Reddet');
  if (!result.checks.sampleVisible) result.errors.push('Cari adı görünmedi.');
  if (!result.checks.amountVisible) result.errors.push('Tutar görünmedi.');
  if (!result.checks.typeVisible) result.errors.push('İşlem türü görünmedi.');
  if (!result.checks.waitingVisible) result.errors.push('Onay bekliyor görünmedi.');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.checks.sampleVisible && result.checks.amountVisible && result.checks.typeVisible && result.checks.waitingVisible;
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
