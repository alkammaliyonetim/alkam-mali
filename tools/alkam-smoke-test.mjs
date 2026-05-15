import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const result = {
  url,
  startedAt: new Date().toISOString(),
  ok: false,
  checks: {},
  errors: []
};

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = path.join(outDir, `alkam-smoke-${stamp}.png`);
const jsonPath = path.join(outDir, `alkam-smoke-${stamp}.json`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);

  const bodyText = await page.locator('body').innerText({ timeout: 15000 });
  result.checks.bodyHasContent = bodyText.trim().length > 20;
  result.checks.dashboardTextVisible = bodyText.includes('ALKAM Mali') || bodyText.includes('Dashboard') || bodyText.includes('Cariler');

  const input = page.locator('#loginPassword');
  const inputCount = await input.count();
  result.checks.loginInputFound = inputCount > 0;

  if (inputCount > 0) {
    await input.first().click({ timeout: 10000 });
    await page.keyboard.type('1234');
    await page.waitForTimeout(300);
    const value = await input.first().inputValue();
    result.checks.loginInputWritable = value === '1234';
    result.checks.loginInputValueLength = value.length;
    if (!result.checks.loginInputWritable) result.errors.push('Şifre input alanına yazılamadı.');
  } else {
    result.checks.loginInputWritable = null;
  }

  result.checks.bankImportVisible = bodyText.includes('Banka Ekstresi İşleme Merkezi');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.checks.bodyHasContent && (result.checks.loginInputWritable === true || result.checks.dashboardTextVisible === true);
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
