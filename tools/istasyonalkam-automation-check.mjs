import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-automation-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-automation-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.locator('[data-tab="otomasyon"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);

  let bodyText = await page.locator('body').innerText({ timeout: 15000 });
  const switchCount = await page.locator('[data-auto]').count();
  const flags = await page.evaluate(() => ({
    flagsExists: !!window.ALKAM_AUTOMATION_FLAGS,
    requireApproval: window.ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION === true,
    disableAccrual: window.ALKAM_DISABLE_AUTO_TAHAKKUK === true,
    disableBankMatch: window.ALKAM_DISABLE_AUTO_BANK_MATCH === true,
    disableBankPost: window.ALKAM_DISABLE_AUTO_BANK_POST === true,
    disableMoka: window.ALKAM_DISABLE_AUTO_MOKA === true,
    openCount: window.ALKAM_AUTOMATION_FLAGS ? Object.values(window.ALKAM_AUTOMATION_FLAGS).filter(Boolean).length : -1
  }));

  result.checks.automationTabVisible = bodyText.includes('Otomasyon Kontrol Merkezi');
  result.checks.panelVisible = await page.locator('#automationPanel').count() > 0;
  result.checks.ruleTextVisible = bodyText.includes('Riskli otomatik mutasyonlar') || bodyText.includes('Kırmızı çizgi');
  result.checks.switchCount = switchCount;
  result.checks.hasAtLeastTenRules = switchCount >= 10;
  result.checks.monthlyAccrualVisible = bodyText.includes('Aylık Muhasebe Ücreti Tahakkuku');
  result.checks.bankAutoPostVisible = bodyText.includes('Banka Hareketini Otomatik Cari İşleme');
  result.checks.mokaVisible = bodyText.includes('Moka United');
  result.checks.flagsExists = flags.flagsExists;
  result.checks.requireApproval = flags.requireApproval;
  result.checks.defaultMutationsDisabled = flags.disableAccrual && flags.disableBankMatch && flags.disableBankPost && flags.disableMoka;
  result.checks.openAutomationCount = flags.openCount;

  await page.locator('button:has-text("Tüm otomatik işleri kapat")').click({ timeout: 10000 });
  await page.waitForTimeout(1000);
  const afterFlags = await page.evaluate(() => window.ALKAM_AUTOMATION_FLAGS ? Object.values(window.ALKAM_AUTOMATION_FLAGS).filter(Boolean).length : -1);
  result.checks.disableAllWorks = afterFlags === 0;

  if (!result.checks.automationTabVisible) result.errors.push('Otomasyon sekmesi görünmedi.');
  if (!result.checks.panelVisible) result.errors.push('Otomasyon paneli görünmedi.');
  if (!result.checks.ruleTextVisible) result.errors.push('Koruma kuralı metni görünmedi.');
  if (!result.checks.hasAtLeastTenRules) result.errors.push('10 otomasyon kuralı görünmedi.');
  if (!result.checks.flagsExists) result.errors.push('Otomasyon bayrakları yayımlanmadı.');
  if (!result.checks.requireApproval) result.errors.push('Finansal mutasyon onay zorunlu bayrağı true değil.');
  if (!result.checks.defaultMutationsDisabled) result.errors.push('Riskli otomasyonlar varsayılan kapalı değil.');
  if (!result.checks.disableAllWorks) result.errors.push('Tüm otomatik işleri kapat çalışmadı.');

  await page.screenshot({ path: screenshotPath, fullPage: true });
  result.screenshot = screenshotPath;
  result.ok = result.checks.automationTabVisible && result.checks.panelVisible && result.checks.ruleTextVisible && result.checks.hasAtLeastTenRules && result.checks.flagsExists && result.checks.requireApproval && result.checks.defaultMutationsDisabled && result.checks.disableAllWorks;
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
