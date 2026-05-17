import fs from 'fs';

const source = fs.readFileSync('automation-safe-ui.js', 'utf8');
const loader = fs.readFileSync('alkam-cariler-data.js', 'utf8');

const checks = {
  hasSafeTitle: source.includes('Güvenli Modüller'),
  hasSuggestionTitle: source.includes('Öneri Modülleri'),
  hasBlockedTitle: source.includes('Kapalı Riskli Modüller'),
  hasNoApprovalBypassText: source.includes('Onaysız sonuç işlemi yoktur'),
  hasReadyFlag: source.includes('ALKAM_AUTOMATION_SAFE_UI_READY'),
  hasCountsFlag: source.includes('ALKAM_AUTOMATION_SAFE_UI_COUNTS'),
  safeCountLiteral: source.includes('safe: 8'),
  suggestionCountLiteral: source.includes('suggestion: 5'),
  blockedCountLiteral: source.includes('blocked: 5'),
  exposesRenderer: source.includes('window.renderSafeAutomationModules'),
  doesNotUseFetch: !source.includes('fetch('),
  doesNotUseLocalStorageSet: !source.includes('localStorage.setItem'),
  doesNotUseDirectApproval: !source.includes('approveItem('),
  loaderHasGuard: loader.includes('ALKAM_SAFE_AUTOMATION_UI_LOADER_READY'),
  loaderMountsSafeUi: loader.includes('automation-safe-ui.js?v=safe-v1'),
  loaderCallsRenderer: loader.includes('window.renderSafeAutomationModules'),
  loaderUsesScriptTag: loader.includes('document.createElement("script")')
};

const errors = Object.entries(checks)
  .filter(([, ok]) => ok !== true)
  .map(([key]) => key);

const result = { ok: errors.length === 0, checks, errors };
console.log(JSON.stringify(result, null, 2));

if (!result.ok) process.exitCode = 1;
