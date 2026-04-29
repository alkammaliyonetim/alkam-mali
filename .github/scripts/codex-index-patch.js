const fs = require('fs');
const path = process.argv[2] || 'index.html';
let s = fs.readFileSync(path, 'utf8');

function once(oldText, newText, required = true) {
  if (!s.includes(oldText)) {
    if (required) throw new Error('Missing expected text: ' + oldText.slice(0, 160));
    return false;
  }
  s = s.replace(oldText, newText);
  return true;
}

function re(pattern, replacement, required = true) {
  const next = s.replace(pattern, replacement);
  if (next === s && required) throw new Error('Missing expected pattern: ' + pattern);
  s = next;
}

const cssMarker = '</style>\n\n<style>\n/* ALKAM FINAL STABLE SOURCE + NISAN DETAIL + BALANCE */';
const cssInsert = ' .source-badge.bank{background:#eef2ff!important;border-color:#c7d2fe!important;color:#3730a3!important}.source-badge.approved{background:#ecfdf5!important;border-color:#a7f3d0!important;color:#047857!important}.source-badge.moka{background:#f5f3ff!important;border-color:#ddd6fe!important;color:#6d28d9!important}\n';
if (!s.includes('.source-badge.moka')) once(cssMarker, cssInsert + cssMarker);

once(`      confidence_score:num(r.match_confidence||r.suggested_confidence||0),
      created_at:new Date().toISOString(),`, `      confidence_score:num(r.match_confidence||r.suggested_confidence||0),
      suggested_target_type:r.suggested_financial_account_type || (r.suggested_cari_name ? 'cari' : ''),
      suggested_movement_type:r.suggested_movement_type || '',
      suggested_cari_name:r.suggested_cari_name || '',
      suggested_expense_name:r.suggested_expense_name || '',
      suggested_financial_account_name:r.suggested_financial_account_name || '',
      match_reason:r.match_reason || r.eslesme_sebebi || '',
      created_at:new Date().toISOString(),`);

re(/function balanceLabel\(v\)\{\s*const n=num\(v\);\s*if\(n>0\) return `\$\{money\(n\)\} B`;\s*if\(n<0\) return `\$\{money\(Math\.abs\(n\)\)\} A`;\s*return `\$\{money\(0\)\}`;\s*\}\s*function balanceColumns\(v\)\{/, `function balanceLabel(v){
  const n=num(v);
  if(n>0) return \`${money(n)} Bakiye B\`;
  if(n<0) return \`${money(Math.abs(n))} Bakiye A\`;
  return \`${money(0)}\`;
}
function balanceSideLabel(v){
  const n=num(v);
  if(n>0) return 'Bakiye B';
  if(n<0) return 'Bakiye A';
  return 'Bakiye';
}
function balanceColumns(v){`);

re(/function alkamStatementSourceInfo\(row\)\{[\s\S]*?\n\}/, `function alkamStatementSourceInfo(row){
  const sm = String(row?.source_module || row?.source_type || row?.source || "");
  const desc = String(row?.description || row?.content_summary || "").toLocaleLowerCase("tr-TR");
  const id = String(row?.id || row?.operation_no || row?.txn_id || row?.document_no || "");
  if(sm === "moka_panel" || sm === "moka_united" || row?.target_type === "moka_united") return {kind:"moka", label:"Moka United", detail:"Moka United kasa/hesap akışı"};
  if(sm === "approval_center" || row?.is_local_bank_queue || row?.final_target_type || row?.decision_ref) return {kind:"approved", label:"Onaylı Eşleşme", detail:"Onay merkezi kararıyla eşleşen kayıt"};
  if(sm === "bank_panel" || sm === "movement_test" || sm === "movement_import" || sm.includes("bank") || sm.includes("banka")) return {kind:"bank", label:"Hesap Hareketi", detail:"Hesap hareketi doğrulama/eşleştirme katmanı"};
  if(sm === "manual_contract_2026") return {kind:"manual", label:"Manuel", detail:"2026 sözleşme listesinden oluşturulan tahakkuk"};
  const correction = row?.is_universal_local_edit || row?._alkam_override_status === "edited" || row?._alkam_override_status === "edited_orphan";
  if(correction) return {kind:"manual", label:"Manuel", detail:"Düzenlenmiş/override kayıt"};
  if(sm === "fee_auto" || (id.startsWith("LGR-") && (desc.includes("muhasebe ücreti") || desc.includes("muhasebe ucreti")))) return {kind:"manual", label:"Manuel", detail:"Programın ürettiği muhasebe ücret tahakkuku"};
  if(sm === "fee_bulk_manual") return {kind:"manual", label:"Manuel", detail:"Cari Toplu Tahakkuk ekranından gelen kayıt"};
  if(sm === "local_cari_collection") return {kind:"manual", label:"Manuel", detail:"Cari Tahsilat Gir ekranından elle girilen kayıt"};
  if(sm.includes("manual")) return {kind:"manual", label:"Manuel", detail:sm};
  if(desc.includes("satış faturası") || desc.includes("satis faturasi") || desc.includes("muhasebe ücreti") || desc.includes("muhasebe ucreti")) return {kind:"supabase", label:"Ana Veri", detail:"Yüklenen cari ekstresi / Supabase"};
  return {kind:"supabase", label:"Ana Veri", detail:sm || "Yüklenen cari ekstresi / Supabase"};
}`);

once(`    ['İşlem No','Tarih','İşlem','Açıklama','Borç','Alacak','Bakiye B','Bakiye A']`, `    ['İşlem No','Tarih','Kaynak','İşlem','Açıklama','Borç','Alacak','Bakiye B','Bakiye A']`);
once(`    const b = balanceColumns(r.running_balance);
    csvRows.push([
      displayTxnNo(r,'HRK'),
      shortDate(r.line_date),
      r.movement_type || '',`, `    const b = balanceColumns(r.running_balance);
    const src = alkamStatementSourceInfo(r);
    csvRows.push([
      displayTxnNo(r,'HRK'),
      shortDate(r.line_date),
      src.label,
      r.movement_type || '',`);

[
  [`<div class="metric-mini"><div class="k">Açılış Bakiye</div><div class="v">${balanceLabel(meta.openingBalance)}</div></div>`, `<div class="metric-mini"><div class="k">${balanceSideLabel(meta.openingBalance)}</div><div class="v">${balanceLabel(meta.openingBalance)}</div></div>`],
  [`<div class="metric-mini"><div class="k">Extre Kapanış</div><div class="v">${balanceLabel(meta.closingBalance)}</div></div>`, `<div class="metric-mini"><div class="k">${balanceSideLabel(meta.closingBalance)}</div><div class="v">${balanceLabel(meta.closingBalance)}</div></div>`],
  [`<div class="metric-mini"><div class="k">Sistem Bakiye</div><div class="v">${balanceLabel(meta.systemBalance)}</div></div>`, `<div class="metric-mini"><div class="k">${balanceSideLabel(meta.systemBalance)}</div><div class="v">${balanceLabel(meta.systemBalance)}</div></div>`],
  [`<div class="box"><div class="k">Açılış Bakiye</div><div class="v">${balanceLabel(meta.openingBalance)}</div></div>`, `<div class="box"><div class="k">${balanceSideLabel(meta.openingBalance)}</div><div class="v">${balanceLabel(meta.openingBalance)}</div></div>`],
  [`<div class="box"><div class="k">Kapanış Bakiye</div><div class="v">${balanceLabel(meta.closingBalance)}</div></div>`, `<div class="box"><div class="k">${balanceSideLabel(meta.closingBalance)}</div><div class="v">${balanceLabel(meta.closingBalance)}</div></div>`],
  [`<div class="metric-mini"><div class="k">Extre Kapanış</div><div class="v">${balanceLabel(closingBalance)}<br>Fark: ${money(diff)}</div></div>`, `<div class="metric-mini"><div class="k">${balanceSideLabel(closingBalance)}</div><div class="v">${balanceLabel(closingBalance)}<br>Fark: ${money(diff)}</div></div>`],
  [`<div class="card"><div class="card-label">Güncel Bakiye</div><div class="card-value" style="font-size:24px">${balanceLabel(c.bakiye||0)}</div></div>`, `<div class="card"><div class="card-label">${balanceSideLabel(c.bakiye||0)}</div><div class="card-value" style="font-size:24px">${balanceLabel(c.bakiye||0)}</div></div>`],
  [`<div class="card"><div class="card-label">Açılış Bakiye</div><div class="card-value" style="font-size:20px">${balanceLabel(meta.openingBalance)}</div></div>`, `<div class="card"><div class="card-label">${balanceSideLabel(meta.openingBalance)}</div><div class="card-value" style="font-size:20px">${balanceLabel(meta.openingBalance)}</div></div>`],
  [`<div class="card"><div class="card-label">Filtre Kapanış</div><div class="card-value" style="font-size:20px">${balanceLabel(meta.closingBalance)}</div></div>`, `<div class="card"><div class="card-label">${balanceSideLabel(meta.closingBalance)}</div><div class="card-value" style="font-size:20px">${balanceLabel(meta.closingBalance)}</div></div>`],
].forEach(([a,b]) => once(a,b,false));

once(`    suggested_financial_account_name: targetType==='hesap' || targetType==='moka_united' ? targetName : null,
    suggested_amount: amount,`, `    suggested_financial_account_name: targetType==='hesap' || targetType==='moka_united' ? targetName : null,
    suggested_target_type: targetType,
    suggested_amount: amount,`);

once(`  if(bankDuplicateCandidate(r,bucket)){ notify('Bu satır mükerrer adayı. Tek tık işlenmez.'); return; }
  if(bankNeedsApproval(r) || bucket==='moka'){ openBankActionModal(bucket,key); notify('Bu satır tek tık için yeterince güvenli değil; detay ekranından kontrol et.'); return; }`, `  if(bankDuplicateCandidate(r,bucket)){ notify('Bu satır mükerrer adayı. Tek tık işlenmez.'); return; }
  if((bankRowConfidence(r)||0) < 100){ openBankActionModal(bucket,key); notify('Yalnızca %100 emin olunan eşleşmeler tek tık işlenir; bu satır onay/detail kontrolü ister.'); return; }
  if(bankNeedsApproval(r) || bucket==='moka'){ openBankActionModal(bucket,key); notify('Bu satır tek tık için yeterince güvenli değil; detay ekranından kontrol et.'); return; }`);

once(`function sd(v){try{return typeof shortDate==='function'?shortDate(v)}catch(e){return String(v||'-').slice(0,10)||'-'}}`, `function sd(v){try{return typeof shortDate==='function'?shortDate(v):(String(v||'-').slice(0,10)||'-')}catch(e){return String(v||'-').slice(0,10)||'-'}}`);

re(/function srcInfo\(r\)\{const sm=String\(r\?\.source_module\|\|r\?\.source_type\|\|r\?\.source\|\|''\);[\s\S]*?return\{kind:'supabase',label:'Ana Veri',detail:sm\|\|'Yüklenen cari ekstresi \/ Supabase'\}\}/, `function srcInfo(r){const sm=String(r?.source_module||r?.source_type||r?.source||'');const d=String(r?.description||r?.content_summary||'').toLocaleLowerCase('tr-TR');const corr=r?.is_universal_local_edit||r?._alkam_override_status==='edited'||r?._alkam_override_status==='edited_orphan';if(sm==='moka_panel'||sm==='moka_united'||r?.target_type==='moka_united')return{kind:'moka',label:'Moka United',detail:'Moka United kasa/hesap akışı'};if(sm==='approval_center'||r?.is_local_bank_queue||r?.final_target_type||r?.decision_ref)return{kind:'approved',label:'Onaylı Eşleşme',detail:'Onay merkezi kararıyla eşleşen kayıt'};if(sm==='bank_panel'||sm==='movement_test'||sm==='movement_import'||sm.includes('bank')||sm.includes('banka'))return{kind:'bank',label:'Hesap Hareketi',detail:'Hesap hareketi doğrulama/eşleştirme katmanı'};if(corr)return{kind:'manual',label:'Manuel',detail:'Yerel/Kalıcı düzeltme'};if(sm==='fee_auto')return{kind:'manual',label:'Manuel',detail:'Programın ürettiği otomatik muhasebe ücret tahakkuku'};if(sm==='fee_bulk_manual')return{kind:'manual',label:'Manuel',detail:'Cari Toplu Tahakkuk ekranı'};if(sm==='local_cari_collection')return{kind:'manual',label:'Manuel',detail:'Cari Tahsilat Gir ekranından'};if(sm.includes('manual'))return{kind:'manual',label:'Manuel',detail:sm};if(d.includes('satış faturası')||d.includes('satis faturasi')||d.includes('muhasebe ücreti')||d.includes('muhasebe ucreti'))return{kind:'supabase',label:'Ana Veri',detail:'Yüklenen cari ekstresi / Supabase'};return{kind:'supabase',label:'Ana Veri',detail:sm||'Yüklenen cari ekstresi / Supabase'}}`);

s = s.replace('Kaynak kolonu açık: otomatik, manuel, banka/ana veri ve düzeltme kayıtları ayrı görünür.', 'Kaynak kolonu açık: Ana Veri, Hesap Hareketi, Onaylı Eşleşme, Moka United ve Manuel ayrı görünür.');
s = s.replace(`${escapeHtml(r.suggested_cari_name||r.suggested_expense_name||"-")} · ${escapeHtml(r.suggested_movement_type||"-")}<br><span style="font-size:12px;color:#64748b">Güven: ${approvalConfidence(r) ? approvalConfidence(r).toFixed(0) : '-'}</span>`, `${escapeHtml(r.suggested_cari_name||r.suggested_expense_name||r.suggested_financial_account_name||"-")} · ${escapeHtml(r.suggested_movement_type||"-")}<br><span style="font-size:12px;color:#64748b">Tip: ${escapeHtml(r.suggested_target_type||r.suggested_financial_account_type||(r.suggested_cari_name?'cari':'-'))} · Güven: ${approvalConfidence(r) ? approvalConfidence(r).toFixed(0) : '-'}</span><br><span class="muted-note">${escapeHtml(r.match_reason || r.eslesme_sebebi || 'Eşleşme sebebi yok')}</span>`);

fs.writeFileSync(path, s.charCodeAt(0) === 0xfeff ? s : '\ufeff' + s, 'utf8');
