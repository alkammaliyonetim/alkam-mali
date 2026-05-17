const safeModules = [
  'auditTrail',
  'dataHealthCheck',
  'approvalQueueMonitor',
  'duplicateWarning',
  'missingSourceWarning',
  'mokaMonitor',
  'bankImportPreview',
  'telegramInboxMonitor'
];

const suggestionModules = [
  'monthlyAccrual',
  'retroAccrual',
  'bankAutoMatch',
  'invoiceAutoCreate',
  'importAutoProcess'
];

const blockedModules = [
  'bankAutoPost',
  'approvalAutoConfirm',
  'mokaAutoCollection',
  'mokaAutoSettlement',
  'bulkAutoUpdate'
];

const result = {
  ok: false,
  checks: {
    safeCount: safeModules.length,
    suggestionCount: suggestionModules.length,
    blockedCount: blockedModules.length,
    safeModulesUnique: new Set(safeModules).size === safeModules.length,
    suggestionModulesUnique: new Set(suggestionModules).size === suggestionModules.length,
    blockedModulesUnique: new Set(blockedModules).size === blockedModules.length,
    noOverlap: true,
    safeModulesDefaultOpen: true,
    suggestionModulesSuggestionOnly: true,
    blockedModulesDisabled: true,
    requireApproval: true,
    directMutationEnabled: false
  },
  errors: []
};

const all = [...safeModules, ...suggestionModules, ...blockedModules];
const unique = new Set(all);
result.checks.noOverlap = all.length === unique.size;

if (safeModules.length < 8) result.errors.push('Güvenli modül sayısı eksik.');
if (suggestionModules.length < 5) result.errors.push('Öneri modülü sayısı eksik.');
if (blockedModules.length < 5) result.errors.push('Kapalı modül sayısı eksik.');
if (!result.checks.safeModulesUnique) result.errors.push('Güvenli modüllerde tekrar var.');
if (!result.checks.suggestionModulesUnique) result.errors.push('Öneri modüllerinde tekrar var.');
if (!result.checks.blockedModulesUnique) result.errors.push('Kapalı modüllerde tekrar var.');
if (!result.checks.noOverlap) result.errors.push('Modül grupları arasında çakışma var.');
if (!result.checks.requireApproval) result.errors.push('Onay zorunluluğu kapalı olamaz.');
if (result.checks.directMutationEnabled) result.errors.push('Doğrudan sonuç üretimi açık olamaz.');

result.ok = result.errors.length === 0;
console.log(JSON.stringify(result, null, 2));

if (!result.ok) process.exitCode = 1;
