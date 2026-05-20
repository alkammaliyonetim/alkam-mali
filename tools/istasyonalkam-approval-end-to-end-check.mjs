import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const url = process.env.ALKAM_TEST_URL || 'http://127.0.0.1:4173/';
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
    const carilerKey = 'ALKAM_FINAL_CARILER_V1';
    const approvalsKey = 'ALKAM_FINAL_APPROVALS_V1';
    const manualKey = 'ALKAM_FINAL_MANUAL_TXNS_V1';
    const cariler = read(carilerKey, []);
    const cari = cariler.find(c => c && !c.deleted && c.id && c.name);
    if (!cari) return { ok: false, reason: 'Cari bulunamadı' };

    const beforeManual = read(manualKey, []);
    const approvalId = 'TEST-END-TO-END-' + Date.now();
    const approvals = read(approvalsKey, []);
    approvals.unshift({
      id: approvalId,
      cariId: cari.id,
      amount: 17500,
      score: 99,
      type: 'Tahsilat',
      source: 'Telegram',
      date: '2026-05-19',
      reason: cari.name + ' tahsilat 17.500 TL',
      status: 'Bekliyor',
      createdAt: new Date().toLocaleString('tr-TR')
    });
    write(approvalsKey, approvals);

    if (typeof window.approveItem !== 'function') return { ok: false, reason: 'approveItem yok' };
    window.approveItem(approvalId);
    window.approveItem(approvalId);

    const afterManual = read(manualKey, []);
    const afterApprovals = read(approvalsKey, []);
    const posted = afterManual.filter(t => t.approvalId === approvalId && String(t.cariId) === String(cari.id));
    const approval = afterApprovals.find(a => a.id === approvalId);
    const creditTotal = posted.reduce((s, t) => s + Number(t.credit || 0), 0);
    return {
      ok: posted.length === 1 && creditTotal === 17500 && approval && approval.status === 'Onaylandı' && !!approval.postedTxnId,
      cariName: cari.name,
      beforeManualCount: beforeManual.length,
      afterManualCount: afterManual.length,
      postedCount: posted.length,
      creditTotal,
      approvalStatus: approval && approval.status,
      postedTxnId: approval && approval.postedTxnId,
      source: approval && approval.source
    };
  });

  result.checks = test;
  if (!test.ok) result.errors.push(test.reason || 'Onay Merkezi uçtan uca cari işleme testi başarısız.');
  result.ok = result.errors.length === 0;
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'approval-end-to-end-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} catch (err) {
  result.errors.push(err.message);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'approval-end-to-end-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.error(JSON.stringify(result, null, 2));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
}
