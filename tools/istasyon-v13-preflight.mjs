import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const sourcePath = new URL('../alkam-cariler-73-istasyon-canli-15092026.json', import.meta.url);
const controlPath = new URL('../data/istasyon-v13-source-controls.json', import.meta.url);
const outputPath = new URL('../data/istasyon-v13-preflight-result.json', import.meta.url);

const [source, control] = await Promise.all([
  fs.readFile(sourcePath, 'utf8').then(JSON.parse),
  fs.readFile(controlPath, 'utf8').then(JSON.parse),
]);

const money = (n) => Math.round((Number(n) || 0) * 100) / 100;
const tr = (s) => String(s || '').toLocaleUpperCase('tr-TR').replace(/\s+/g, ' ').trim();
const names = new Map(source.map((c) => [tr(c.name), c]));

const checks = [];
const check = (name, ok, actual, expected, severity = 'error') => {
  checks.push({ name, ok: Boolean(ok), actual, expected, severity });
  return Boolean(ok);
};

check('active_count', source.length === control.expected_active_count, source.length, control.expected_active_count);

const legacyNet = money(source.reduce((sum, c) => sum + Number(c.signedBalance ?? c.balance ?? 0), 0));
check('legacy_json_net', legacyNet === money(control.legacy_json_net_expected), legacyNet, control.legacy_json_net_expected);

const expectedDiff = money(legacyNet - Number(control.canonical_opening_net));
check('legacy_vs_canonical_diff', expectedDiff === money(control.legacy_json_difference_expected), expectedDiff, control.legacy_json_difference_expected);

const missingIdentity = control.identity_review_names.filter((name) => !names.has(tr(name)));
check('identity_review_names_present', missingIdentity.length === 0, missingIdentity, [], 'error');

const missingPeriod = control.period_review_names.filter((name) => !names.has(tr(name)));
check('period_review_names_present', missingPeriod.length === 0, missingPeriod, [], 'error');

const futureCutoff = '2026-09-26';
const futureRows = [];
for (const cari of source) {
  for (const tx of Array.isArray(cari.transactions) ? cari.transactions : []) {
    const date = String(tx.date || '').slice(0, 10);
    if (!date || date <= futureCutoff) continue;
    const amount = money(Number(tx.debit || 0) - Number(tx.credit || 0));
    futureRows.push({
      cari: cari.name,
      date,
      type: tx.type || '',
      description: String(tx.description || ''),
      debit: money(tx.debit || 0),
      credit: money(tx.credit || 0),
      net: amount,
    });
  }
}
const expectedFutureNames = new Set(control.period_review_names.map(tr));
const futureOutsideKnown = futureRows.filter((row) => !expectedFutureNames.has(tr(row.cari)));
const futureAmount = money(futureRows.reduce((sum, row) => sum + Math.abs(row.net), 0));
check('future_rows_count', futureRows.length === control.future_period_expected_rows, futureRows.length, control.future_period_expected_rows, 'review');
check('future_rows_amount', futureAmount === money(control.future_period_expected_amount), futureAmount, control.future_period_expected_amount, 'review');
check('future_rows_known_cariler_only', futureOutsideKnown.length === 0, futureOutsideKnown, [], 'error');

const duplicateIds = [];
const idSet = new Set();
for (const cari of source) {
  if (idSet.has(cari.id)) duplicateIds.push(cari.id);
  idSet.add(cari.id);
}
check('unique_cari_ids', duplicateIds.length === 0, duplicateIds, [], 'error');

const invalidBalances = source.filter((c) => !Number.isFinite(Number(c.signedBalance ?? c.balance)));
check('numeric_balances', invalidBalances.length === 0, invalidBalances.map((c) => c.name), [], 'error');

const monthlyFeeIssues = source.filter((c) => Number(c.monthlyFee || 0) < 0);
check('monthly_fee_nonnegative', monthlyFeeIssues.length === 0, monthlyFeeIssues.map((c) => c.name), [], 'error');

const hardFailures = checks.filter((c) => !c.ok && c.severity === 'error');
const reviewItems = checks.filter((c) => !c.ok && c.severity !== 'error');

const result = {
  protocol: 'istasyon-v13-preflight-result-v1',
  generated_at: new Date().toISOString(),
  status: hardFailures.length ? 'BLOCKED' : reviewItems.length ? 'READY_WITH_REVIEW' : 'READY',
  write_mode: 'OFF',
  source: control.legacy_json_source,
  canonical_source: control.canonical_source,
  metrics: {
    active_count: source.length,
    legacy_json_net: legacyNet,
    canonical_opening_net: money(control.canonical_opening_net),
    legacy_vs_canonical_diff: expectedDiff,
    transaction_count: source.reduce((sum, c) => sum + (Array.isArray(c.transactions) ? c.transactions.length : 0), 0),
    future_row_count: futureRows.length,
    future_absolute_amount: futureAmount,
  },
  known_reviews: {
    identity: control.identity_review_names,
    period: control.period_review_names,
    future_rows: futureRows,
  },
  checks,
  hard_failures: hardFailures,
  review_items: reviewItems,
  safe_next_step: hardFailures.length
    ? 'Kaynak yapısı düzeltilmeden canlıya geçme.'
    : 'Cutover tarihi onaylanana kadar yalnız staging/read-only katmanında devam et.',
};

await fs.writeFile(outputPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(result, null, 2));

assert.equal(hardFailures.length, 0, 'İstasyON v13 preflight hard failure');
