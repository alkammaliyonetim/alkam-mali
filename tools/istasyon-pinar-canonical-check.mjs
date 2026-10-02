import { chromium } from 'playwright';

const url = process.env.ALKAM_TEST_URL || 'https://alkam-mali.pages.dev/';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();

await context.addInitScript(() => {
  localStorage.setItem('alkam_local_session_v2', 'ok');
  const stale = [
    {
      id: 'STALE-PINAR-1400',
      cariId: 'pinar-sevgi-kozmetik',
      date: '2026-09-15',
      type: 'TAHAKKUK',
      source: 'Eski Yerel Kayıt',
      description: 'CANONICAL TEST STALE 1400',
      debit: 1400,
      credit: 0
    },
    {
      id: 'STALE-PINAR-OCT',
      cariId: 'pinar-sevgi-kozmetik',
      date: '2026-10-01',
      type: 'TAHAKKUK',
      source: 'Otomasyon Tahakkuk',
      description: 'EKİM 2026 aylık hizmet ücreti',
      debit: 3500,
      credit: 0
    }
  ];
  localStorage.setItem('ALKAM_FINAL_MANUAL_TXNS_V1', JSON.stringify(stale));
});

const page = await context.newPage();
const result = { ok: false, url, checks: {}, errors: [] };

try {
  await page.goto(url + (url.includes('?') ? '&' : '?') + 'canonical_check=' + Date.now(), {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });

  await page.waitForFunction(() => document.body.innerText.includes('79 cari yüklü'), null, { timeout: 45000 });
  result.checks.active79 = true;

  const cariButton = page.locator('.erp-module-btn[data-tab="cariler"]').first();
  await cariButton.click();
  await page.locator('#cariSearch').fill('PINAR SEVGİ KOZMETİK');

  const item = page.locator('#cariList .list-item').filter({ hasText: 'PINAR SEVGİ KOZMETİK' }).first();
  await item.waitFor({ state: 'visible', timeout: 15000 });

  const listText = await item.innerText();
  result.checks.listBalance3500 = /3\.500,00\s*TL\s*Bakiye\s*B/i.test(listText);
  result.checks.listRejects4900 = !/4\.900,00\s*TL/i.test(listText);
  result.checks.listRejects7000 = !/7\.000,00\s*TL/i.test(listText);

  await item.click();
  const detail = page.locator('#selectedCariDetail');
  await detail.locator('h2.hero-name').waitFor({ state: 'visible', timeout: 15000 });
  const detailText = await detail.innerText();
  const metricTexts = await detail.locator('.metric-mini').allInnerTexts();
  const currentMetric = metricTexts.find((x) => /Güncel Bakiye/i.test(x)) || '';
  const compactDetail = detailText.replace(/\s+/g, ' ').trim();
  result.checks.detailBalance3500 = /Güncel Bakiye 3\.500,00 TL Bakiye B/i.test(compactDetail)
    || (/3\.500,00 TL Bakiye B/i.test(compactDetail) && !/4\.900,00 TL/i.test(compactDetail) && !/7\.000,00 TL/i.test(compactDetail));
  result.currentMetric = currentMetric;
  result.detailExcerpt = compactDetail.slice(0, 1800);
  result.checks.totalDebit46100 = /46\.100,00\s*TL/i.test(detailText);
  result.checks.totalCredit42600 = /42\.600,00\s*TL/i.test(detailText);
  result.checks.stale1400Ignored = !detailText.includes('CANONICAL TEST STALE 1400');
  result.checks.staleOctoberIgnored = !/EKİM 2026 aylık hizmet ücreti/i.test(detailText);

  result.ok = Object.values(result.checks).every(Boolean);
  if (!result.ok) {
    for (const [k,v] of Object.entries(result.checks)) if (!v) result.errors.push(k);
  }
} catch (err) {
  result.errors.push(String(err?.message || err));
}

console.log(JSON.stringify(result, null, 2));
await browser.close();
if (!result.ok) process.exit(1);
