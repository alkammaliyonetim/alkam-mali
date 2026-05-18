import fs from 'fs';

const bat = fs.readFileSync('ALKAM-PC-KURULUM.bat', 'utf8');
const ps1 = fs.readFileSync('tools/alkam-pc-setup.ps1', 'utf8');

const checks = {
  batCallsPowerShell: bat.includes('tools\\alkam-pc-setup.ps1'),
  checksGit: ps1.includes('git --version'),
  checksNode: ps1.includes('node --version'),
  runsNpmInstall: ps1.includes('npm install'),
  runsTgCloudTest: ps1.includes('npm run test:tg-cloud'),
  createsWranglerExampleCopy: ps1.includes('wrangler.tg-cloud.example.toml'),
  createsEnvExampleCopy: ps1.includes('tg-cloud.env.example'),
  warnsNoSecretsToChatgpt: ps1.includes("ChatGPT'ye gondermeyin"),
  doesNotDeploy: !ps1.includes('wrangler deploy'),
  doesNotSetWebhook: !ps1.includes('setWebhook'),
  doesNotPutSecrets: !ps1.includes('wrangler secret put'),
  doesNotContainRealToken: !/\d{6,}:[A-Za-z0-9_-]{20,}/.test(ps1 + bat)
};

const errors = Object.entries(checks).filter(([, ok]) => ok !== true).map(([key]) => key);
const result = { ok: errors.length === 0, checks, errors };
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
