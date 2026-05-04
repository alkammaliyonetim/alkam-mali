(function(){
  'use strict';
  var VERSION='ALKAM Banka Import Errors v8.5';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-banka-import-errors-style'))return;
    var st=document.createElement('style');st.id='alkam-banka-import-errors-style';
    st.textContent='.alkam-bank-error-table{margin-top:10px;border:1px solid #fecaca;border-radius:12px;overflow:hidden;background:#fff}.alkam-bank-error-table table{width:100%;border-collapse:collapse}.alkam-bank-error-table th{background:#fef2f2;color:#991b1b;font-size:11px;text-transform:uppercase;padding:8px;text-align:left}.alkam-bank-error-table td{border-top:1px solid #fee2e2;padding:8px;font-size:12px;font-weight:800;color:#0f172a}.alkam-bank-error-table .err{color:#b91c1c;font-weight:950}.alkam-bank-error-summary{margin-top:10px;padding:9px 10px;border:1px solid #fecaca;border-radius:12px;background:#fef2f2;color:#991b1b;font-size:12px;font-weight:950}';
    document.head.appendChild(st);
  }
  function renderErrors(){
    var modal=q('#alkamBankImportModal'); if(!modal)return;
    var old=q('#alkamBankImportErrors',modal); if(old)old.remove();
    var v=window.ALKAM_BANKA_IMPORT_GUARD_V8&&ALKAM_BANKA_IMPORT_GUARD_V8.last?ALKAM_BANKA_IMPORT_GUARD_V8.last():null;
    if(!v||!v.badCount)return;
    var host=q('#alkamBankImportResult',modal); if(!host)return;
    var div=document.createElement('div'); div.id='alkamBankImportErrors';
    div.innerHTML='<div class="alkam-bank-error-summary">'+v.badCount+' hatalı satır bulundu. Hatalar düzeltilmeden onaya gönderilmez.</div><div class="alkam-bank-error-table"><table><thead><tr><th>Satır</th><th>Tarih</th><th>Açıklama</th><th>Tutar</th><th>Hata</th></tr></thead><tbody>'+v.bad.slice(0,20).map(function(x){return '<tr><td>'+x.index+'</td><td>'+x.row.tarih+'</td><td>'+x.row.aciklama+'</td><td>'+x.row.tutar+'</td><td class="err">'+x.errors.join(', ')+'</td></tr>'}).join('')+'</tbody></table></div>';
    host.parentNode.insertBefore(div,host.nextSibling);
  }
  function patch(){
    var modal=q('#alkamBankImportModal'); if(!modal)return;
    ['alkamBankImportPreview','alkamBankImportSave'].forEach(function(id){var btn=q('#'+id,modal); if(btn&&btn.getAttribute('data-error-render')!=='1'){btn.setAttribute('data-error-render','1');btn.addEventListener('click',function(){setTimeout(renderErrors,120)},true)}});
  }
  function run(){css();patch();renderErrors()}
  window.ALKAM_BANKA_IMPORT_ERRORS_V8={version:VERSION,run:run,render:renderErrors,test:function(){return {version:VERSION,modal:!!q('#alkamBankImportModal'),last:window.ALKAM_BANKA_IMPORT_GUARD_V8&&ALKAM_BANKA_IMPORT_GUARD_V8.last?ALKAM_BANKA_IMPORT_GUARD_V8.last():null,table:!!q('#alkamBankImportErrors'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(patch,1500);
})();
