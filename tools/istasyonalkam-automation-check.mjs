import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://safe-bank-import-v1.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, preview: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-automation-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-automation-${stamp}.png`);
const mayEnginePath = path.resolve('alkam-monthly-accrual-engine-v1.js');

function extractMayPreviewSummary(text) {
  const summary = { rawText: text };
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  summary.lines = lines;
  for (const line of lines) {
    const normalized = line.replace(/\s+/g, ' ');
    if (normalized.includes('Eksik Mayıs tahakkuk')) summary.missingMayAccrualLine = normalized;
    if (normalized.includes('Toplam')) summary.totalAmountLine = normalized;
    if (normalized.includes('Var olan Mayıs tahakkuk')) summary.existingMayAccrualLine = normalized;
    if (normalized.includes('Atlanan cari')) summary.skippedCariLine = normalized;
    if (normalized.includes('Bu işlem kayıt yazmadı')) summary.noWriteLine = normalized;
  }
  return summary;
}

async function ensureMayEngineMounted(page) {
  const engineAlreadyLoaded = await page.evaluate(() => !!window.ALKAM_MONTHLY_ACCRUAL_ENGINE_V1);
  result.checks.mayEngineAlreadyLoadedOnPreview = engineAlreadyLoaded;

  if (!engineAlreadyLoaded && fs.existsSync(mayEnginePath)) {
    await page.addScriptTag({ path: mayEnginePath });
    result.checks.mayEngineInjectedFromPrBranch = true;
  } else {
    result.checks.mayEngineInjectedFromPrBranch = false;
  }

  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    if (window.ALKAM_MONTHLY_ACCRUAL_ENGINE_V1 && typeof window.ALKAM_MONTHLY_ACCRUAL_ENGINE_V1.mountAutomationActions === 'function') {
      window.ALKAM_MONTHLY_ACCRUAL_ENGINE_V1.mountAutomationActions();
    }
  });
  await page.waitForTimeout(1200);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  await page.locator('[data-tab="otomasyon"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await ensureMayEngineMounted(page);

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

  result.checks.monthlyAccrualInlineActionsVisible = await page.locator('#monthlyAccrualInlineActions').count() > 0;
  result.checks.mayPreviewButtonVisible = await page.locator('button:has-text("Mayıs Ön İzleme")').count() > 0;
  result.checks.mayStressButtonVisible = await page.locator('button:has-text("Stres Testi")').count() > 0;
  result.checks.mayApplyButtonVisible = await page.locator('#monthlyAccrualInlineActions button:has-text("Uygula")').count() > 0;
  result.checks.mayPreviewBoxVisible = await page.locator('#monthlyAccrualPreviewBox').count() > 0;

  if (result.checks.mayStressButtonVisible) {
    await page.locator('button:has-text("Stres Testi")').first().click({ timeout: 10000 });
    await page.waitForTimeout(700);
    bodyText = await page.locator('body').innerText({ timeout: 15000 });
    result.checks.mayStressRuns = bodyText.includes('Stres Testi:') && bodyText.includes('GEÇTİ');
  } else {
    result.checks.mayStressRuns = false;
  }

  if (result.checks.mayPreviewButtonVisible) {
    await page.locator('button:has-text("Mayıs Ön İzleme")').first().click({ timeout: 10000 });
    await page.waitForTimeout(700);
    bodyText = await page.locator('body').innerText({ timeout: 15000 });
    const previewText = await page.locator('#monthlyAccrualPreviewBox').innerText({ timeout: 15000 });
    result.preview = extractMayPreviewSummary(previewText);
    result.checks.mayPreviewRuns = bodyText.includes('Ön İzleme') && bodyText.includes('Bu işlem kayıt yazmadı.');
    result.checks.mayPreviewShowsCounts = bodyText.includes('Eksik Mayıs tahakkuk') && bodyText.includes('Var olan Mayıs tahakkuk') && bodyText.includes('Atlanan cari');
  } else {
    result.checks.mayPreviewRuns = false;
    result.checks.mayPreviewShowsCounts = false;
  }

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
  if (!result.checks.monthlyAccrualInlineActionsVisible) result.errors.push('Mayıs tahakkuk inline aksiyonları görünmedi.');
  if (!result.checks.mayPreviewButtonVisible) result.errors.push('Mayıs Ön İzleme butonu görünmedi.');
  if (!result.checks.mayStressButtonVisible) result.errors.push('Stres Testi butonu görünmedi.');
  if (!result.checks.mayApplyButtonVisible) result.errors.push('Mayıs Uygula butonu görünmedi.');
  if (!result.checks.mayPreviewBoxVisible) result.errors.push('Mayıs preview kutusu görünmedi.');
  if (!result.checks.mayStressRuns) result.errors.push('Mayıs stres testi preview ortamında GEÇTİ sonucu vermedi.');
  if (!result.checks.mayPreviewRuns) result.errors.push('Mayıs ön izleme kayıt yazmadan çalışmadı.');
  if (!result.checks.mayPreviewShowsCounts) result.errors.push('Mayıs ön izleme sayım alanlarını göstermedi.');
  if (!result.preview.missingMayAccrualLine) result.errors.push('Mayıs ön izleme eksik tahakkuk satırını raporlamadı.');
  if (!result.preview.totalAmountLine) result.errors.push('Mayıs ön izleme toplam tutar satırını raporlamadı.');
  if (!result.preview.existingMayAccrualLine) result.errors.push('Mayıs ön izleme var olan tahakkuk satırını raporlamadı.');
  if (!result.preview.skippedCariLine) result.errors.push('Mayıs ön izleme atlanan cari satırını raporlamadı.');
  if (!result.checks.disableAllWorks) result.errors.push('Tüm otomatik işleri kapat çalışmadı.');

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
