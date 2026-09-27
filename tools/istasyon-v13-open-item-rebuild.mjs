import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const sourcePath = new URL('../alkam-cariler-73-istasyon-canli-15092026.json', import.meta.url);
const outputPath = new URL('../data/istasyon-open-item-preflight.json', import.meta.url);

const asOf = String(process.env.ISTASYON_AS_OF_DATE || '').trim();
if (!/^20\d{2}-\d{2}-\d{2}$/.test(asOf)) {
  console.error('ISTASYON_AS_OF_DATE gerekli (YYYY-MM-DD). Bu araç sadece staging/preflight üretir.');
  process.exit(2);
}

const cariler = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
const money = n => Math.round((Number(n) || 0) * 100) / 100;
const sha = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const norm = value => String(value ?? '').toLocaleUpperCase('tr-TR').replace(/\s+/g, ' ').trim();

function txKey(cari, tx, index) {
  return [
    'BIZMU',
    cari.id || norm(cari.name),
    String(index + 1).padStart(5, '0'),
    tx.date || '',
    money(tx.debit || 0).toFixed(2),
    money(tx.credit || 0).toFixed(2),
    norm(tx.description || ''),
    String(tx.docNo || ''),
  ].join('|');
}

function allocate(queue, amount, settlementKey, settlementDate, cariKey, allocations) {
  let remaining = money(amount);
  for (const item of queue) {
    if (remaining <= 0) break;
    if (item.open_amount <= 0) continue;
    const applied = money(Math.min(item.open_amount, remaining));
    if (applied <= 0) continue;
    item.open_amount = money(item.open_amount - applied);
    remaining = money(remaining - applied);
    allocations.push({
      allocation_key: 'alloc:' + sha([cariKey,item.source_row_key,settlementKey,applied,settlementDate].join('|')).slice(0,40),
      cari_source_key: cariKey,
      open_source_row_key: item.source_row_key,
      settlement_source_row_key: settlementKey,
      allocation_date: settlementDate,
      amount: applied,
      method: 'fifo_reconstruction',
    });
  }
  return remaining;
}

const candidates = [];
const allocations = [];
const controls = [];
const futureRows = [];
let transactionCount = 0;
let includedCount = 0;

for (const cari of cariler) {
  const cariKey = String(cari.id || norm(cari.name));
  const ordered = (Array.isArray(cari.transactions) ? cari.transactions : [])
    .map((tx,index) => ({ ...tx, __index:index }))
    .sort((a,b) => String(a.date || '').localeCompare(String(b.date || '')) || a.__index - b.__index);

  const debitQueue = [];
  const creditQueue = [];
  let ledgerNet = 0;
  let futureNet = 0;

  for (const tx of ordered) {
    transactionCount++;
    const date = String(tx.date || '').slice(0,10);
    const debit = money(tx.debit || 0);
    const credit = money(tx.credit || 0);
    const key = txKey(cari, tx, tx.__index);

    if (!date || date > asOf) {
      futureNet = money(futureNet + debit - credit);
      futureRows.push({
        cari_source_key:cariKey,
        cari_name:cari.name,
        source_row_key:key,
        date,
        debit,
        credit,
        net:money(debit-credit),
        type:String(tx.type || ''),
        description:String(tx.description || ''),
        doc_no:String(tx.docNo || ''),
      });
      continue;
    }
    includedCount++;
    ledgerNet = money(ledgerNet + debit - credit);

    if (debit > 0) {
      const remainingDebit = allocate(creditQueue, debit, key, date, cariKey, allocations);
      if (remainingDebit > 0) {
        debitQueue.push({
          candidate_key:'item:' + sha(key + '|debit').slice(0,40),
          cari_source_key:cariKey,
          cari_name:cari.name,
          source_row_key:key,
          source_row_index:tx.__index + 1,
          item_date:date,
          document_no:String(tx.docNo || ''),
          description:String(tx.description || ''),
          side:'debit',
          original_amount:remainingDebit,
          open_amount:remainingDebit,
          source_type:'legacy_bizmu_json',
          source_ref:'alkam-cariler-73-istasyon-canli-15092026.json',
          row_hash:sha([asOf,key,'debit',remainingDebit].join('|')),
          raw_payload:{ type:tx.type || '', source:tx.source || '', source_balance:tx.balance ?? null },
        });
      }
    }

    if (credit > 0) {
      const remainingCredit = allocate(debitQueue, credit, key, date, cariKey, allocations);
      if (remainingCredit > 0) {
        creditQueue.push({
          candidate_key:'item:' + sha(key + '|credit').slice(0,40),
          cari_source_key:cariKey,
          cari_name:cari.name,
          source_row_key:key,
          source_row_index:tx.__index + 1,
          item_date:date,
          document_no:String(tx.docNo || ''),
          description:String(tx.description || ''),
          side:'credit',
          original_amount:remainingCredit,
          open_amount:remainingCredit,
          source_type:'legacy_bizmu_json',
          source_ref:'alkam-cariler-73-istasyon-canli-15092026.json',
          row_hash:sha([asOf,key,'credit',remainingCredit].join('|')),
          raw_payload:{ type:tx.type || '', source:tx.source || '', source_balance:tx.balance ?? null },
        });
      }
    }
  }

  const openDebit = money(debitQueue.reduce((s,x)=>s+x.open_amount,0));
  const openCredit = money(creditQueue.reduce((s,x)=>s+x.open_amount,0));
  const residualNet = money(openDebit - openCredit);
  const reconciliationDiff = money(ledgerNet - residualNet);
  const declaredBalance = money(cari.signedBalance ?? cari.balance ?? 0);
  const declaredAsOfExpected = futureNet === 0 ? declaredBalance : money(declaredBalance - futureNet);
  const sourceBalanceDiff = money(ledgerNet - declaredAsOfExpected);

  const rows = debitQueue.concat(creditQueue).filter(x=>x.open_amount>0);
  candidates.push(...rows);
  controls.push({
    cari_source_key:cariKey,
    cari_name:cari.name,
    as_of_date:asOf,
    ledger_net:ledgerNet,
    reconstructed_net:residualNet,
    reconciliation_diff:reconciliationDiff,
    open_debit:openDebit,
    open_credit:openCredit,
    open_item_count:rows.length,
    source_declared_balance:declaredBalance,
    excluded_future_net:futureNet,
    source_declared_as_of_expected:declaredAsOfExpected,
    source_balance_diff:sourceBalanceDiff,
    status:Math.abs(reconciliationDiff)<0.005 ? 'matched' : 'difference',
  });
}

const reconstructedNet = money(controls.reduce((s,x)=>s+x.reconstructed_net,0));
const ledgerNet = money(controls.reduce((s,x)=>s+x.ledger_net,0));
const residualDiff = money(ledgerNet-reconstructedNet);
const sourceDiffCount = controls.filter(x=>Math.abs(x.source_balance_diff)>=0.005).length;
const hardDiffCount = controls.filter(x=>Math.abs(x.reconciliation_diff)>=0.005).length;
const futureAbsolute = money(futureRows.reduce((s,x)=>s+Math.abs(x.net),0));

const result = {
  protocol:'istasyon-v13-open-item-preflight-v1',
  generated_at:new Date().toISOString(),
  as_of_date:asOf,
  mode:'read_only_reconstruction',
  final_posting:0,
  metrics:{
    cari_count:cariler.length,
    source_transaction_count:transactionCount,
    included_transaction_count:includedCount,
    excluded_future_count:futureRows.length,
    excluded_future_absolute:futureAbsolute,
    ledger_net:ledgerNet,
    reconstructed_net:reconstructedNet,
    reconstruction_diff:residualDiff,
    open_item_count:candidates.length,
    allocation_count:allocations.length,
    source_balance_difference_count:sourceDiffCount,
    hard_reconstruction_difference_count:hardDiffCount,
  },
  controls,
  open_item_candidates:candidates,
  reconstructed_allocations:allocations,
  excluded_future_rows:futureRows,
  acceptance:{
    all_73_cariler:cariler.length===73,
    fifo_reconstruction_balances:hardDiffCount===0 && Math.abs(residualDiff)<0.005,
    known_future_rows_on_2026_09_26:asOf==='2026-09-26'
      ? futureRows.length===6 && Math.abs(futureAbsolute-60000)<0.005
      : null,
  },
  next_step:'Cutover tarihi kesinleşince bu araç aynı tarih için yeniden çalıştırılır. Sonuç staging üzerinden incelenir; otomatik ledger posting yapılmaz.'
};

await fs.writeFile(outputPath, JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({
  protocol:result.protocol,
  as_of_date:asOf,
  metrics:result.metrics,
  acceptance:result.acceptance,
},null,2));

if (!result.acceptance.all_73_cariler || !result.acceptance.fifo_reconstruction_balances) process.exit(1);
if (result.acceptance.known_future_rows_on_2026_09_26 === false) process.exit(1);
