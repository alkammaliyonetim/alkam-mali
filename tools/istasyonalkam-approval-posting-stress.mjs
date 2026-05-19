import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'https://alkam-mali.pages.dev/';
const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const result = { url, ok: false, startedAt: new Date().toISOString(), checks: {}, errors: [] };

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.setItem('alkam_local_session_v2', 'ok'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  const test = await page.evaluate(() => {
    const read = (k, f) => { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : f; } catch { return f; } };
    const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const cariler = read('ALKAM_FINAL_CARILER_V1', []);
    const cari = cariler.find(c => c && !c.deleted && c.id);
    if (!cari) return { ok: false, reason: 'Cari bulunamadı' };

    const approvalsKey = 'ALKAM_FINAL_APPROVALS_V1';
    const manualKey = 'ALKAM_FINAL_MANUAL_TXNS_V1';
    const approvals = read(approvalsKey, []);
    const manualBefore = read(manualKey, []);
    const approvalId = 'TEST-APPROVAL-STRESS-' + Date.now();

    approvals.unshift({
      id: approvalId,
      cariId: cari.id,
      amount: 12500,
      score: 99,
      type: 'Tahsilat',
      source: 'Stres Testi',
      date: '2026-05-19',
      reason: 'Onay merkezi çift kayıt stres testi',
      status: 'Bekliyor',
      createdAt: new Date().toLocaleString('tr-TR')
    });
    write(approvalsKey, approvals);

    if (typeof window.approveItem !== 'function') return { ok: false, reason: 'approveItem fonksiyonu yok' };
    window.approveItem(approvalId);
    window.approveItem(approvalId);

    const manualAfter = read(manualKey, []);
    const approvalsAfter = read(approvalsKey, []);
    const posted = manualAfter.filter(t => t.approvalId === approvalId);
    const approval = approvalsAfter.find(a => a.id === approvalId);
    return {
      ok: posted.length === 1 && approval && approval.status === 'Onaylandı' && !!approval.postedTxnId,
      postedCount: posted.length,
      beforeCount: manualBefore.length,
      afterCount: manualAfter.length,
      approvalStatus: approval && approval.status,
      postedTxnId: approval && approval.postedTxnId,
      cariName: cari.name
    };
  });

  result.checks = test;
  if (!test.ok) result.errors.push(test.reason || 'Onay merkezi çift kayıt stres testi başarısız.');
  result.ok = result.errors.length === 0;
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'approval-posting-stress-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (err) {
  result.errors.push(err.message);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'approval-posting-stress-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
