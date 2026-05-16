import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://lab-pr15.alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };
const jsonPath = path.join(outDir, `istasyonalkam-lab-stress-${stamp}.json`);
const screenshotPath = path.join(outDir, `istasyonalkam-lab-stress-${stamp}.png`);

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const stress = await page.evaluate(() => {
    const get = k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
    const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const now = new Date().toISOString();
    const cariler = get('alkam_cariler_final_v1');
    const manual = get('alkam_manual_txns_final_v1');
    const approvals = get('alkam_approvals_final_v1');
    const accounts = get('alkam_accounts_final_v1');
    const accountTxns = get('alkam_account_txns_final_v1');
    const tg = get('alkam_telegram_inbox_v1');
    const ops = get('alkam_operation_suggestions_v1');
    const sampleCari = cariler[0] || { id: 'LAB-CARI', name: 'LAB TEST CARİ' };
    if (!cariler.length) cariler.push(sampleCari);

    for (let i = 0; i < 100; i++) {
      manual.push({
        id: 'LAB-MAN-' + i,
        cariId: sampleCari.id,
        date: '2026-05-' + String((i % 28) + 1).padStart(2, '0'),
        type: i % 2 === 0 ? 'TAHAKKUK' : 'TAHSILAT',
        debit: i % 2 === 0 ? 1000 + i : 0,
        credit: i % 2 !== 0 ? 800 + i : 0,
        source: 'LAB_STRESS',
        description: 'Lab stres hareketi ' + i,
        docNo: 'LAB'
      });
    }
    for (let i = 0; i < 25; i++) {
      tg.unshift({ id: 'TG-LAB-' + i, raw: 'LAB CARİ haziranın son günü ' + (10000 + i * 1000).toLocaleString('tr-TR') + ' TL ödeme sözü verdi', from: 'Lab Telegram', status: 'Gelen', createdAt: now });
      ops.unshift({ id: 'OP-LAB-' + i, raw: 'LAB CARİ haziranın son günü ödeme sözü verdi', cari: 'LAB CARİ', type: 'Ödeme sözü', amount: 10000 + i * 1000, status: 'Onay bekliyor', source: 'LAB_STRESS', sourceId: 'TG-LAB-' + i });
    }
    for (let i = 0; i < 20; i++) {
      approvals.unshift({ id: 'APR-LAB-' + i, cariId: sampleCari.id, amount: 500 + i, score: 90, type: i % 2 === 0 ? 'Tahakkuk' : 'Tahsilat', source: 'LAB_STRESS', date: '2026-05-16', reason: 'Lab onay testi ' + i, status: 'Bekliyor', createdAt: now });
    }
    if (!accounts.some(a => a.id === 'moka-united')) accounts.push({ id: 'moka-united', name: 'Moka United', type: 'moka_united' });
    for (let i = 0; i < 20; i++) {
      accountTxns.push({ id: 'ACC-LAB-' + i, accountId: i % 2 === 0 ? 'moka-united' : 'banka', date: '2026-05-16', dir: i % 2 === 0 ? 'giris' : 'cikis', amount: 1000 + i * 50, source: 'LAB_STRESS', desc: 'Lab hesap hareketi ' + i });
    }
    set('alkam_cariler_final_v1', cariler);
    set('alkam_manual_txns_final_v1', manual);
    set('alkam_approvals_final_v1', approvals);
    set('alkam_accounts_final_v1', accounts);
    set('alkam_account_txns_final_v1', accountTxns);
    set('alkam_telegram_inbox_v1', tg);
    set('alkam_operation_suggestions_v1', ops);
    return { cariler: cariler.length, manual: manual.length, approvals: approvals.length, accounts: accounts.length, accountTxns: accountTxns.length, tg: tg.length, ops: ops.length };
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const bodyText = await page.locator('body').innerText({ timeout: 20000 });
  result.checks.stressCounts = stress;
  result.checks.dashboardOk = bodyText.includes('ALKAM Mali Yönetim Paneli');
  result.checks.carilerOk = bodyText.includes('Cariler');
  result.checks.onayOk = bodyText.includes('Onay Merkezi');
  result.checks.telegramOk = bodyText.includes('Telegram Gelen Kutusu');
  result.checks.automationOk = bodyText.includes('Otomasyon Kontrol Merkezi');
  result.checks.noVisibleCrash = !/TypeError|ReferenceError|Cannot read|undefined is not/i.test(bodyText);

  await page.locator('[data-tab="otomasyon"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(1000);
  const flags = await page.evaluate(() => ({
    requireApproval: window.ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION === true,
    openCount: window.ALKAM_AUTOMATION_FLAGS ? Object.values(window.ALKAM_AUTOMATION_FLAGS).filter(Boolean).length : -1
  }));
  result.checks.requireApproval = flags.requireApproval;
  result.checks.openAutomationCount = flags.openCount;

  if (!result.checks.dashboardOk) result.errors.push('Dashboard görünmedi.');
  if (!result.checks.carilerOk) result.errors.push('Cariler görünmedi.');
  if (!result.checks.onayOk) result.errors.push('Onay Merkezi görünmedi.');
  if (!result.checks.telegramOk) result.errors.push('Telegram Gelen Kutusu görünmedi.');
  if (!result.checks.automationOk) result.errors.push('Otomasyon Kontrol Merkezi görünmedi.');
  if (!result.checks.noVisibleCrash) result.errors.push('Ekranda JS hata metni göründü.');
  if (!result.checks.requireApproval) result.errors.push('Finansal mutasyon onay zorunlu değil.');
  if (result.checks.openAutomationCount !== 0) result.errors.push('Otomasyonlar kapalı başlamadı.');

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
