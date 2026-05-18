import fs from 'fs';

const index = fs.readFileSync('index.html', 'utf8');
const inventory = fs.readFileSync('docs/otomasyon-denetim-envanteri.md', 'utf8');

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

const safetyChecks = {
  automationDefaultsClosed: index.includes('enabled:false'),
  publishesFlags: index.includes('ALKAM_AUTOMATION_FLAGS'),
  requiresApproval: index.includes('ALKAM_REQUIRE_APPROVAL_FOR_FINANCIAL_MUTATION = true'),
  canDisableAll: index.includes('disableAllAutomation'),
  hasInventoryFile: inventory.includes('Otomasyon Denetim Envanteri'),
  noExtraManualPanel: !inventory.includes('manualMayFinanceBox')
};

const all = { ...checks, ...safetyChecks };
const errors = Object.entries(all).filter(([, ok]) => ok !== true).map(([key]) => key);

console.log(JSON.stringify({ ok: errors.length === 0, checks: all, errors }, null, 2));
if (errors.length) process.exitCode = 1;
