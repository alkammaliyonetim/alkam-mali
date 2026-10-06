import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const files = {
  core: read('sql/istasyon-v13-durable-core.sql'),
  guards: read('sql/istasyon-v13-cutover-guards.sql'),
  worker: read('_worker.js'),
  ui: read('istasyon-v13-readiness.js'),
  index: read('index.html'),
  admin: read('admin.html'),
  gmail: read('google-apps-script/istasyon-alkam-gmail-v13.gs'),
  openingSource: read('data/istasyon-opening-source-20260926.json'),
  openingStage: read('sql/istasyon-v13-opening-source-stage.sql'),
  openingSeed: read('sql/istasyon-v13-opening-source-seed-20260926.sql'),
  openItemStage: read('sql/istasyon-v13-open-item-stage.sql'),
  openItemRebuild: read('tools/istasyon-v13-open-item-rebuild.mjs'),
  operations: read('sql/istasyon-v13-operational-services.sql'),
  security: read('sql/istasyon-v13-security.sql')
};

const stripSqlComments = s => s.replace(/--.*$/gm, '');
const coreSql = stripSqlComments(files.core);
const guardSql = stripSqlComments(files.guards);
const operationsSql = stripSqlComments(files.operations);
const securitySql = stripSqlComments(files.security);

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
const opening = JSON.parse(files.openingSource);
const openingSum = opening.rows.reduce((sum,row)=>sum+Number(row.source_list_amount||0),0);
ok('canonical opening package has 73 cards', opening.rows.length===73);
ok('canonical opening package total is 3,741,583.88', Math.abs(openingSum-3741583.88)<0.005);
ok('opening stage requires explicit cutover date', files.openingStage.includes('ISTASYON_CUTOVER_DATE_REQUIRED'));
ok('opening stage keeps expected 73-card invariant', files.openingStage.includes('expected_active_count') && files.openingStage.includes('3741583.88'));
ok('opening seed asserts source count', files.openingSeed.includes('ISTASYON_OPENING_SOURCE_COUNT_MISMATCH'));
ok('opening seed asserts source total', files.openingSeed.includes('ISTASYON_OPENING_SOURCE_BALANCE_MISMATCH'));
ok('durable core does not post cari ledger', !/insert\s+into\s+public\.cari_ekstre_lines/i.test(coreSql));
ok('durable core does not delete existing ledger', !/(delete\s+from|truncate\s+table)\s+public\.cari_ekstre_lines/i.test(coreSql));
ok('guard SQL has no invalid single-dollar quote', !/\bas\s+\$\s*$/m.test(guardSql));
ok('open-item stage is candidate-only', files.openItemStage.includes('istasyon_open_item_candidate_stage'));
ok('open-item stage never writes final open items', !/insert\s+into\s+(public\.)?istasyon_open_items/i.test(stripSqlComments(files.openItemStage)));
ok('open-item stage never writes cari ledger', !/insert\s+into\s+(public\.)?cari_ekstre_lines/i.test(stripSqlComments(files.openItemStage)));
ok('open-item reconstruction declares read-only mode', files.openItemRebuild.includes("mode:'read_only_reconstruction'"));
ok('open-item reconstruction final posting is zero', files.openItemRebuild.includes('final_posting:0'));

ok('cutover freeze requires reconciliation', files.guards.includes('ISTASYON_CUTOVER_NOT_RECONCILED'));
ok('cutover freeze requires approval', files.guards.includes('ISTASYON_CUTOVER_APPROVAL_REQUIRED'));
ok('frozen opening immutable', files.guards.includes('ISTASYON_FROZEN_OPENING_IMMUTABLE'));
ok('frozen opening blocks new inserts', files.guards.includes('trg_istasyon_opening_immutable_i'));
ok('frozen cutover run immutable', files.guards.includes('ISTASYON_FROZEN_CUTOVER_IMMUTABLE'));
ok('allocation requires approval', files.guards.includes('ISTASYON_ALLOCATION_APPROVAL_REQUIRED'));
ok('allocation protects over-allocation', files.guards.includes('ISTASYON_ALLOCATION_EXCEEDS_OPEN_AMOUNT'));
ok('bank post requires approval', files.guards.includes('ISTASYON_BANK_POST_APPROVAL_REQUIRED'));
ok('bank post requires readback ref', files.guards.includes('ISTASYON_BANK_POST_READBACK_REF_REQUIRED'));

ok('operations has idempotent bank raw ingest', files.operations.includes('istasyon_ingest_bank_raw') && files.operations.includes('source_hash'));
ok('operations bank ingest never posts cari ledger', !/insert\s+into\s+public\.cari_ekstre_lines/i.test(operationsSql));
ok('operations bank match approval required', files.operations.includes('ISTASYON_BANK_MATCH_APPROVAL_REQUIRED'));
ok('operations document archive ref required', files.operations.includes('ISTASYON_DOCUMENT_ARCHIVE_REF_REQUIRED'));
ok('operations exposes aging view', files.operations.includes('v_istasyon_receivables_aging'));
ok('operations exposes document search view', files.operations.includes('v_istasyon_document_search'));
ok('operations exposes control center view', files.operations.includes('v_istasyon_control_center'));
ok('security enables RLS for bank raw', files.security.includes('alter table public.istasyon_bank_raw enable row level security'));
ok('security blocks anonymous bank raw', files.security.includes('revoke all on public.istasyon_bank_raw from anon'));
ok('security requires base finance role function', files.security.includes('ISTASYON_RLS_BASE_ROLE_FUNCTIONS_REQUIRED'));
ok('security does not grant anon execute', !/grant\s+execute[\s\S]{0,200}\bto\s+anon\b/i.test(securitySql));

ok('worker has safe status endpoint', files.worker.includes('/api/istasyon/status'));
ok('worker preserves mail scope', files.worker.includes('classifyMailScope'));
ok('worker does not inject v13 UI dynamically', !files.worker.includes('istasyon-v13-readiness.js') && !files.worker.includes('istasyon-v13-control-tower.js'));
ok('index loads v13 explicitly', /istasyon-v13-readiness\.js\?v=/.test(files.index));
ok('admin loads v13 explicitly', /istasyon-v13-readiness\.js\?v=/.test(files.admin));
ok('single v13 UI contract', !files.index.includes('istasyon-v13-control-tower.js') && !files.admin.includes('istasyon-v13-control-tower.js'));
ok('UI declares 79 active current cards', files.ui.includes('EXPECTED_ACTIVE=79'));
ok('UI declares reconciled opening total', files.ui.includes('EXPECTED_OPENING=3741583.88'));
ok('UI shows financial write closed', files.ui.includes('Kesin Yazma'));

ok('Gmail secret comes from Script Properties', files.gmail.includes("getProperty('ALKAM_GMAIL_INGEST_KEY')"));
ok('Gmail does not contain placeholder secret', !files.gmail.includes('BURAYA_CLOUDFLARE'));
ok('Gmail is hourly', files.gmail.includes('.everyHours(1)'));
ok('Halkbank account prefix guarded', files.gmail.includes("ISTASYON_HALKBANK_ACCOUNT_PREFIX = 'TR78000120092790'"));
ok('Halkbank account suffix guarded', files.gmail.includes("ISTASYON_HALKBANK_ACCOUNT_SUFFIX = '9675'"));
ok('Gmail posts only to safe ingest queue', files.gmail.includes('/api/mail/gmail-import'));
ok('Moka sender is exact allowlist', files.gmail.includes("senderEmail !== ISTASYON_MOKA_SENDER"));
ok('Moka payload carries structured payment', files.gmail.includes("mokaPayment: identity.docType === 'moka' ? parseMokaPaymentV14_"));
ok('Moka dedupe key uses payment id', files.gmail.includes("dedupeKey: paymentId ? 'MOKA:' + paymentId"));
ok('Gmail bridge uses script lock', files.gmail.includes("LockService.getScriptLock()"));
ok('Gmail evidence hash is SHA256', files.gmail.includes("Utilities.DigestAlgorithm.SHA_256"));


const failed = checks.filter(x => !x.ok);
console.log(JSON.stringify({ ok: failed.length === 0, checks: checks.length, failed: failed.map(x => x.name) }, null, 2));
if (failed.length) process.exit(1);
