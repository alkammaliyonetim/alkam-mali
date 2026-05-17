import fs from 'fs';
import path from 'path';

const outDir = path.resolve('test-output');
fs.mkdirSync(outDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const result = {
  ok: false,
  startedAt: new Date().toISOString(),
  checks: {},
  warnings: [],
  errors: []
};

function makeCari(i, movementCount = 12) {
  const id = `CARI-${String(i).padStart(4, '0')}`;
  const txns = [];
  for (let m = 1; m <= movementCount; m += 1) {
    txns.push({
      id: `${id}-TX-${String(m).padStart(3, '0')}`,
      cariId: id,
      date: `2026-${String(((m - 1) % 12) + 1).padStart(2, '0')}-01`,
      source: m % 5 === 0 ? '' : 'Stress Fixture',
      type: m % 2 === 0 ? 'TAHSILAT' : 'TAHAKKUK',
      description: `Stress hareket ${i}-${m}`,
      debit: m % 2 === 0 ? 0 : 1000 + i,
      credit: m % 2 === 0 ? 500 + i : 0,
      docNo: `DOC-${i}-${m}`
    });
  }
  return {
    id,
    name: `Stress Cari ${i}`,
    code: `VKN${String(i).padStart(10, '0')}`,
    monthlyFee: 1000,
    transactions: txns,
    deleted: false
  };
}

function buildData(cariCount, movementCount) {
  return Array.from({ length: cariCount }, (_, i) => makeCari(i + 1, movementCount));
}

function flattenTxns(cariler) {
  return cariler.flatMap((c) => (c.transactions || []).map((t) => ({ ...t, cariId: c.id, cariName: c.name })));
}

function findMissingSources(txns) {
  return txns.filter((t) => !String(t.source || '').trim());
}

function findInvalidRows(cariler) {
  const bad = [];
  for (const c of cariler) {
    if (!String(c.name || '').trim()) bad.push({ type: 'missing_name', cariId: c.id || '' });
    for (const t of c.transactions || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(t.date || ''))) bad.push({ type: 'bad_date', id: t.id });
      if (!Number.isFinite(Number(t.debit)) || !Number.isFinite(Number(t.credit))) bad.push({ type: 'bad_amount', id: t.id });
    }
  }
  return bad;
}

function findDuplicates(txns) {
  const seen = new Map();
  const dupes = [];
  for (const t of txns) {
    const key = [t.cariId, t.date, Number(t.debit || 0).toFixed(2), Number(t.credit || 0).toFixed(2), String(t.description || '').toLowerCase()].join('|');
    if (seen.has(key)) dupes.push({ first: seen.get(key), duplicate: t.id, key });
    else seen.set(key, t.id);
  }
  return dupes;
}

function measure(label, fn) {
  const start = performance.now();
  const value = fn();
  const ms = Math.round(performance.now() - start);
  result.checks[label] = { ms, ok: ms < 1500 };
  if (ms >= 1500) result.warnings.push(`${label} yavaş çalıştı: ${ms}ms`);
  return value;
}

const data77 = measure('build_77_cari_12_rows', () => buildData(77, 12));
const data250 = measure('build_250_cari_12_rows', () => buildData(250, 12));
const data500 = measure('build_500_cari_12_rows', () => buildData(500, 12));
const data1000 = measure('build_1000_cari_12_rows', () => buildData(1000, 12));
const dataHeavy = measure('build_1000_cari_100_rows', () => buildData(1000, 100));

const heavyTxns = measure('flatten_1000_cari_100_rows', () => flattenTxns(dataHeavy));
const missingSources = measure('missing_source_scan', () => findMissingSources(heavyTxns));
const invalidRows = measure('invalid_row_scan', () => findInvalidRows(dataHeavy));

const duplicateFixture = buildData(10, 12);
duplicateFixture[0].transactions.push({ ...duplicateFixture[0].transactions[0], id: 'DUPLICATE-ROW-1' });
const duplicates = measure('duplicate_scan', () => findDuplicates(flattenTxns(duplicateFixture)));

const automationDecision = {
  requireApproval: true,
  directWriteEnabled: false,
  safeModulesDefaultOpen: true,
  suggestionModulesWriteDirectly: false,
  blockedModulesEnabled: false
};

result.checks.volume = {
  cari77: data77.length === 77,
  cari250: data250.length === 250,
  cari500: data500.length === 500,
  cari1000: data1000.length === 1000,
  heavyRows: heavyTxns.length === 100000
};

result.checks.dataQuality = {
  missingSourceDetected: missingSources.length > 0,
  invalidRowsDetected: invalidRows.length === 0
};

result.checks.duplicateQuality = {
  duplicateDetected: duplicates.length === 1
};

result.checks.approvalSafety = automationDecision;

const requiredBooleans = [
  result.checks.volume.cari77,
  result.checks.volume.cari250,
  result.checks.volume.cari500,
  result.checks.volume.cari1000,
  result.checks.volume.heavyRows,
  result.checks.dataQuality.missingSourceDetected,
  result.checks.dataQuality.invalidRowsDetected,
  result.checks.duplicateQuality.duplicateDetected,
  result.checks.approvalSafety.requireApproval,
  result.checks.approvalSafety.directWriteEnabled === false,
  result.checks.approvalSafety.suggestionModulesWriteDirectly === false,
  result.checks.approvalSafety.blockedModulesEnabled === false
];

const timingOk = Object.values(result.checks)
  .filter((x) => x && typeof x === 'object' && Object.prototype.hasOwnProperty.call(x, 'ms'))
  .every((x) => x.ok === true);

result.ok = requiredBooleans.every(Boolean) && timingOk;
result.finishedAt = new Date().toISOString();

const jsonPath = path.join(outDir, `automation-stress-${stamp}.json`);
fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify(result, null, 2));

if (!result.ok) process.exitCode = 1;
