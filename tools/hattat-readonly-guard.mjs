import fs from 'fs';

const requiredFiles = [
  'docs/hattat-readonly-plan.md',
  'hattat.env.example',
  '.gitignore'
];

const result = {
  ok: false,
  checks: {},
  errors: []
};

function text(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const plan = text('docs/hattat-readonly-plan.md');
const envExample = text('hattat.env.example');
const gitignore = text('.gitignore');

for (const file of requiredFiles) {
  result.checks[`exists:${file}`] = fs.existsSync(file);
}

result.checks.exportFolderIgnored = gitignore.includes('hattat_exports/');
result.checks.sessionFolderIgnored = gitignore.includes('hattat_sessions/');
result.checks.envLocalIgnored = gitignore.includes('.env.local');
result.checks.envExampleHasEmptyUser = envExample.includes('HATTAT_USER=') && !/HATTAT_USER=\S/.test(envExample);
result.checks.envExampleHasEmptyPassword = envExample.includes('HATTAT_PASSWORD=') && !/HATTAT_PASSWORD=\S/.test(envExample);
result.checks.planMentionsReadOnly = plan.toLowerCase().includes('readonly') || plan.toLowerCase().includes('okuma');
result.checks.planMentionsApproval = plan.toLowerCase().includes('onay');

Object.entries(result.checks).forEach(([key, value]) => {
  if (value !== true) result.errors.push(key);
});

result.ok = result.errors.length === 0;
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
