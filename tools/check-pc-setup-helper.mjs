import fs from 'fs';

const read = (path) => fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';

const bat = read('ALKAM-KUR.bat');
const check = read('tools/alkam-check.ps1');
const test = read('tools/alkam-test.ps1');
const report = read('tools/alkam-report.ps1');
const legacyBat = read('ALKAM-PC-KURULUM.bat');
const legacyPs1 = read('tools/alkam-pc-setup.ps1');

const allSetupText = [bat, check, test, report, legacyBat, legacyPs1].join('\n');
const activeSetupText = [bat, check, test, report].join('\n');

const forbiddenPatterns = {
  wranglerDeploy: /\bwrangler\s+deploy\b/i,
  telegramSetWebhook: /\bsetWebhook\b/i,
  wranglerSecretPut: /\bwrangler\s+secret\s+put\b/i,
  realTelegramToken: /\d{6,}:[A-Za-z0-9_-]{20,}/,
  cloudflareApiTokenName: /CLOUDFLARE_API_TOKEN\s*=/i
};

const checks = {
  batCallsCheckStep: bat.includes('tools\\alkam-check.ps1'),
  batCallsTestStep: bat.includes('tools\\alkam-test.ps1'),
  batCallsReportStep: bat.includes('tools\\alkam-report.ps1'),
  checkStepChecksGit: check.includes('git') && check.includes('--version'),
  checkStepChecksNode: check.includes('node') && check.includes('--version'),
  checkStepChecksNpm: check.includes('npm') && check.includes('--version'),
  checkStepMentionsWrangler: check.includes('wrangler'),
  testStepRunsNpmInstall: test.includes('npm install'),
  testStepRunsTgCloudTest: test.includes('npm run test:tg-cloud'),
  testStepRunsSetupSafetyTest: test.includes('npm run test:pc-setup'),
  testStepCreatesWranglerExampleCopy: test.includes('wrangler.tg-cloud.example.toml'),
  testStepCreatesEnvExampleCopy: test.includes('tg-cloud.env.example'),
  reportStepHasDoneRemainingChecked: report.includes('YAPILANLAR') && report.includes('KALANLAR') && report.includes('KONTROL ETTIKLERIM'),
  warnsNoSecretsToChatgpt: allSetupText.includes("ChatGPT'ye gondermeyin"),
  activeSetupDoesNotDeploy: !forbiddenPatterns.wranglerDeploy.test(activeSetupText),
  activeSetupDoesNotSetWebhook: !forbiddenPatterns.telegramSetWebhook.test(activeSetupText),
  activeSetupDoesNotPutSecrets: !forbiddenPatterns.wranglerSecretPut.test(activeSetupText),
  setupDoesNotContainRealToken: !forbiddenPatterns.realTelegramToken.test(allSetupText),
  setupDoesNotContainCloudflareApiTokenAssignment: !forbiddenPatterns.cloudflareApiTokenName.test(allSetupText)
};

const errors = Object.entries(checks).filter(([, ok]) => ok !== true).map(([key]) => key);
const result = { ok: errors.length === 0, checks, errors };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
