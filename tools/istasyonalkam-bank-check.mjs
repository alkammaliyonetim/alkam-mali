import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-bank-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-bank-${stamp}.png`);

async function injectSimpleOps(page){
  const loaded = await page.evaluate(() => !!window.ALKAM_SIMPLE_OPS);
  result.checks.simpleOpsAlreadyLoaded = loaded;
  if(!loaded && fs.existsSync('alkam-daily-ops-simple-v1.js')){
    await page.addScriptTag({ path: path.resolve('alkam-daily-ops-simple-v1.js') });
    result.checks.simpleOpsInjectedFromPrBranch = true;
  }else result.checks.simpleOpsInjectedFromPrBranch = false;
  await page.waitForTimeout(1200);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await injectSimpleOps(page);
  await page.locator('[data-tab="hesaplar"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.bankImportVisible = bodyText.includes('Basit Banka Ekstre Yükleme');
  result.checks.bankTextAreaVisible = await page.locator('#simpleBankText').count() > 0;
  result.checks.bankPreviewButtonVisible = bodyText.includes('Ön İzle');
  result.checks.accountsVisible = bodyText.includes('Hesaplar') || bodyText.includes('Hesap Hareketleri');

  if(result.checks.bankTextAreaVisible){
    await page.locator('#simpleBankText').fill('18.05.2026 Gamze Eczanesi tahsilat 12500,00', { timeout: 10000 });
    await page.locator('#simpleBankBox button:has-text("Ön İzle")').click({ timeout: 10000 });
    await page.waitForTimeout(1000);
    bodyText = await page.locator('body').innerText({ timeout: 15000 });
  }
  result.checks.bankPreviewWorks = bodyText.includes('Ön izleme') && bodyText.includes('12.500,00 TL');

  if (!result.checks.bankImportVisible) result.errors.push('Basit Banka Ekstre Yükleme kutusu görünmedi.');
  if (!result.checks.bankTextAreaVisible) result.errors.push('Basit banka yapıştırma alanı görünmedi.');
  if (!result.checks.bankPreviewButtonVisible) result.errors.push('Basit banka ön izleme butonu görünmedi.');
  if (!result.checks.bankPreviewWorks) result.errors.push('Basit banka ön izlemesi çalışmadı.');

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