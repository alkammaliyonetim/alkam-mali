import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const files = {
  core: read('sql/istasyon-v13-durable-core.sql'),
  guards: read('sql/istasyon-v13-cutover-guards.sql'),
  worker: read('_worker.js'),
  ui: read('istasyon-v13-readiness.js'),
  index: read('index.html'),
  admin: read('admin.html'),
  gmail: read('google-apps-script/istasyon-alkam-gmail-v13.gs')
};

const checks = [];
function ok(name, value) {
  checks.push({ name, ok: !!value });
  if (!value) console.error('FAIL', name);
  else console.log('OK', name);
}

ok('durable core has cutover', files.core.includes('istasyon_cutover_runs'));
ok('durable core has open items', files.core.includes('istasyon_open_items'));
ok('durable core has allocation table', files.core.includes('istasyon_allocations'));
ok('durable core has bank raw staging', files.core.includes('istasyon_bank_raw'));
ok('durable core has document links', files.core.includes('istasyon_document_links'));
ok('durable core has audit trail', files.core.includes('istasyon_audit_events'));
ok('durable core does not post cari ledger', !/insert\s+into\s+public\.cari_ekstre_lines/i.test(files.core));
ok('durable core does not delete existing ledger', !/(delete\s+from|truncate\s+table)\s+public\.cari_ekstre_lines/i.test(files.core));

ok('cutover freeze requires reconciliation', files.guards.includes('ISTASYON_CUTOVER_NOT_RECONCILED'));
ok('cutover freeze requires approval', files.guards.includes('ISTASYON_CUTOVER_APPROVAL_REQUIRED'));
ok('frozen opening immutable', files.guards.includes('ISTASYON_FROZEN_OPENING_IMMUTABLE'));
ok('allocation requires approval', files.guards.includes('ISTASYON_ALLOCATION_APPROVAL_REQUIRED'));
ok('allocation protects over-allocation', files.guards.includes('ISTASYON_ALLOCATION_EXCEEDS_OPEN_AMOUNT'));
ok('bank post requires approval', files.guards.includes('ISTASYON_BANK_POST_APPROVAL_REQUIRED'));
ok('bank post requires readback ref', files.guards.includes('ISTASYON_BANK_POST_READBACK_REF_REQUIRED'));

ok('worker has safe status endpoint', files.worker.includes('/api/istasyon/status'));
ok('worker preserves mail scope', files.worker.includes('classifyMailScope'));
ok('worker does not inject v13 UI dynamically', !files.worker.includes('<script src="/istasyon-v13-readiness.js'));
ok('index loads v13 explicitly', files.index.includes('istasyon-v13-readiness.js?v=13'));
ok('admin loads v13 explicitly', files.admin.includes('istasyon-v13-readiness.js?v=13'));
ok('UI declares 73 active canonical cards', files.ui.includes('EXPECTED_ACTIVE=73'));
ok('UI declares reconciled opening total', files.ui.includes('EXPECTED_OPENING=3741583.88'));
ok('UI shows financial write closed', files.ui.includes('Kesin Yazma'));

ok('Gmail secret comes from Script Properties', files.gmail.includes("getProperty('ALKAM_GMAIL_INGEST_KEY')"));
ok('Gmail does not contain placeholder secret', !files.gmail.includes('BURAYA_CLOUDFLARE'));
ok('Gmail is hourly', files.gmail.includes('.everyHours(1)'));
ok('Halkbank account prefix guarded', files.gmail.includes("ISTASYON_HALKBANK_ACCOUNT_PREFIX = 'TR78000120092790'"));
ok('Halkbank account suffix guarded', files.gmail.includes("ISTASYON_HALKBANK_ACCOUNT_SUFFIX = '9675'"));
ok('Gmail posts only to safe ingest queue', files.gmail.includes('/api/mail/gmail-import'));

const failed = checks.filter(x => !x.ok);
console.log(JSON.stringify({ ok: failed.length === 0, checks: checks.length, failed: failed.map(x => x.name) }, null, 2));
if (failed.length) process.exit(1);
