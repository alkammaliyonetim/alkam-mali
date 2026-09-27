import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-operation-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-operation-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const onayNav = page.locator('[data-tab="onay"]').first();
  const onaySection = page.locator('#tab-onay').first();
  const navCount = await onayNav.count();
  const sectionCount = await onaySection.count();
  result.checks.onayNavigationPresent = navCount > 0 || sectionCount > 0;
  if (navCount > 0) {
    await onayNav.click({ timeout: 10000 });
  } else if (sectionCount > 0) {
    await page.evaluate(() => {
      if (typeof window.switchTab === 'function') window.switchTab('onay');
      else document.getElementById('tab-onay')?.classList.add('active');
    });
  }
  await page.waitForTimeout(1500);
  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.operationCenterVisible = bodyText.includes('Onay Merkezi');
  result.checks.onayVisible = bodyText.includes('Onay Merkezi');
  result.checks.suggestButtonVisible =
    bodyText.includes('Onay Kaydı Ekle') ||
    bodyText.includes('Mailden Oku + Onaya Hazırla') ||
    bodyText.includes('Onaya Ekle');
  result.checks.writeGuardVisible =
    bodyText.includes('Emin olunmayan kayıt cariye yazılmaz') ||
    bodyText.includes('Kesin kayıt') ||
    bodyText.includes('onay');
  if (!result.checks.operationCenterVisible) result.errors.push('Onay Merkezi görünmedi.');
  if (!result.checks.suggestButtonVisible) result.errors.push('Onay/öneri aksiyonu görünmedi.');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok =
    result.checks.onayNavigationPresent === true &&
    result.checks.operationCenterVisible === true &&
    result.checks.suggestButtonVisible === true &&
    result.checks.writeGuardVisible === true;
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
