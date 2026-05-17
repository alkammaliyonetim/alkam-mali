import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-safe-automation-visual-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-safe-automation-visual-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.locator('[data-tab="otomasyon"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1800);

  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  const counts = await page.evaluate(() => window.ALKAM_AUTOMATION_SAFE_UI_COUNTS || null);
  const ready = await page.evaluate(() => window.ALKAM_AUTOMATION_SAFE_UI_READY === true);
  const moduleCards = await page.locator('[data-safe-auto-module]').count();

  result.checks.safeUiReady = ready;
  result.checks.countsExists = !!counts;
  result.checks.safeCount = counts ? counts.safe : null;
  result.checks.suggestionCount = counts ? counts.suggestion : null;
  result.checks.blockedCount = counts ? counts.blocked : null;
  result.checks.moduleCards = moduleCards;
  result.checks.safeTitleVisible = bodyText.includes('Güvenli Modüller');
  result.checks.suggestionTitleVisible = bodyText.includes('Öneri Modülleri');
  result.checks.blockedTitleVisible = bodyText.includes('Kapalı Riskli Modüller');
  result.checks.noApprovalBypassTextVisible = bodyText.includes('Onaysız sonuç işlemi yoktur');
  result.checks.mobileWidth = await page.evaluate(() => window.innerWidth);
  result.checks.mobileNoHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 2);

  if (!result.checks.safeUiReady) result.errors.push('Güvenli otomasyon UI hazır bayrağı yok.');
  if (!result.checks.countsExists) result.errors.push('Güvenli otomasyon sayaçları yok.');
  if (result.checks.safeCount !== 8) result.errors.push('Güvenli modül sayısı 8 değil.');
  if (result.checks.suggestionCount !== 5) result.errors.push('Öneri modül sayısı 5 değil.');
  if (result.checks.blockedCount !== 5) result.errors.push('Kapalı riskli modül sayısı 5 değil.');
  if (result.checks.moduleCards !== 18) result.errors.push('Toplam modül kartı 18 değil.');
  if (!result.checks.safeTitleVisible) result.errors.push('Güvenli Modüller başlığı görünmedi.');
  if (!result.checks.suggestionTitleVisible) result.errors.push('Öneri Modülleri başlığı görünmedi.');
  if (!result.checks.blockedTitleVisible) result.errors.push('Kapalı Riskli Modüller başlığı görünmedi.');
  if (!result.checks.noApprovalBypassTextVisible) result.errors.push('Onaysız sonuç uyarısı görünmedi.');
  if (!result.checks.mobileNoHorizontalOverflow) result.errors.push('Mobil görünümde yatay taşma var.');

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
