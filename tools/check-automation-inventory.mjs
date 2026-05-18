import fs from 'fs';

const index = fs.readFileSync('index.html', 'utf8');
const inventory = fs.readFileSync('docs/otomasyon-denetim-envanteri.md', 'utf8');
const dataLayer = fs.readFileSync('alkam-cariler-data.js', 'utf8');
const accrualEngine = fs.readFileSync('alkam-monthly-accrual-engine-v1.js', 'utf8');

const expectedKeys = [
  'monthlyAccrual',
  'retroAccrual',
  'bankAutoMatch',
  'bankAutoPost',
  'approvalAutoConfirm',
  'mokaAutoCollection',
  'mokaAutoSettlement',
  'invoiceAutoCreate',
  'importAutoProcess',
  'bulkAutoUpdate'
];

const checks = Object.fromEntries(expectedKeys.map((key) => [
  key,
  index.includes(`key:"${key}"`) && inventory.includes(key)
]));

const domReadyHandlerMatch = accrualEngine.match(/document\.addEventListener\('DOMContentLoaded',[\s\S]*?\}\);/);
const carilerLoadedHandlerMatch = accrualEngine.match(/window\.addEventListener\('alkam:cariler-loaded',[\s\S]*?\}\);/);
const loadHandlers = [
  domReadyHandlerMatch ? domReadyHandlerMatch[0] : '',
  carilerLoadedHandlerMatch ? carilerLoadedHandlerMatch[0] : ''
].join('\n');

const safetyChecks = {
  automationDefaultsClosed: index.includes('enabled:false'),
  publishesFlags: index.includes('ALKAM_AUTOMATION_FLAGS'),
  requiresApproval: index.includes('ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION = true'),
  canDisableAll: index.includes('disableAllAutomation'),
  hasInventoryFile: inventory.includes('Otomasyon Denetim Envanteri'),
  noDuplicateManualPanel: !accrualEngine.includes('manualMayFinanceBox'),
  noSecondAutomationPanel: !accrualEngine.includes('automationPanel') || accrualEngine.includes('querySelector'),
  loadsMayEngineFromDataLayer: dataLayer.includes('alkam-monthly-accrual-engine-v1.js'),
  monthlyEngineExists: accrualEngine.includes('ALKAM_MONTHLY_ACCRUAL_ENGINE_V1'),
  monthlyEngineTargetsExistingRow: accrualEngine.includes('[data-auto="monthlyAccrual"]'),
  monthlyEngineHasPreview: accrualEngine.includes('previewMay2026'),
  monthlyEngineHasStressTest: accrualEngine.includes('stressTestMay2026'),
  monthlyEngineRequiresConfirm: accrualEngine.includes('confirm(message)'),
  monthlyEngineBlocksWhenToggleClosed: accrualEngine.includes('monthlyAccrual kapalı'),
  monthlyEngineNoAutoApplyOnLoad: !loadHandlers.includes('applyMay2026') && !loadHandlers.includes('runFromAutomationButton'),
  mayDateCorrect: accrualEngine.includes("var LINE_DATE = '2026-05-01'"),
  mayDescriptionCorrect: accrualEngine.includes('MAYIS 2026 YILI AYLIK MUHASEBE ÜCRETİ')
};

const all = { ...checks, ...safetyChecks };
const errors = Object.entries(all).filter(([, ok]) => ok !== true).map(([key]) => key);

console.log(JSON.stringify({ ok: errors.length === 0, checks: all, errors }, null, 2));
if (errors.length) process.exitCode = 1;
