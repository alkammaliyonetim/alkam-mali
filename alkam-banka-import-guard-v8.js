(function(){
  'use strict';
  var VERSION='ALKAM Banka Import Guard v8.4';
  function q(s,r){return (r||document).querySelector(s)}
  function n(v){var x=Number(String(v||0).replace(/TL|₺/g,'').replace(/\./g,'').replace(',','.'));return isNaN(x)?0:x}
  function validDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||''))||/^\d{2}\.\d{2}\.\d{4}$/.test(String(v||''))}
  function normalizeDate(v){var s=String(v||'').trim();var m=s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);if(m)return m[3]+'-'+m[2]+'-'+m[1];return s}
  function validateRows(rows){
    var ok=[], bad=[], seen={};
    (rows||[]).forEach(function(r,idx){
      var row={tarih:normalizeDate(r.tarih||r.date),aciklama:String(r.aciklama||r.description||r.detay||'').trim(),tutar:n(r.tutar||r.amount)};
      var errors=[];
      if(!validDate(row.tarih))errors.push('Tarih hatalı');
      if(!row.aciklama)errors.push('Açıklama boş');
      if(!row.tutar)errors.push('Tutar 0/boş');
      var fp=[row.tarih,row.tutar,row.aciklama.toLowerCase()].join('|');
      if(seen[fp])errors.push('Dosya içinde mükerrer');
      seen[fp]=true;
      if(errors.length)bad.push({index:idx+1,row:row,errors:errors}); else ok.push(row);
    });
    return {version:VERSION,ok:ok,bad:bad,okCount:ok.length,badCount:bad.length,time:new Date().toISOString()};
  }
  function patchSave(){
    var btn=q('#alkamBankImportSave'); if(!btn||btn.getAttribute('data-guarded')==='1')return;
    btn.setAttribute('data-guarded','1');
    btn.addEventListener('click',function(ev){
      var ta=q('#alkamBankImportText'), res=q('#alkamBankImportResult');
      if(!ta||!window.ALKAM_BANKA_IMPORT_UI_V8||!ALKAM_BANKA_IMPORT_UI_V8.parseLines)return;
      var rows=ALKAM_BANKA_IMPORT_UI_V8.parseLines(ta.value);
      var v=validateRows(rows);
      window.__ALKAM_BANKA_IMPORT_LAST_VALIDATION=v;
      if(v.badCount>0){
        ev.stopImmediatePropagation(); ev.preventDefault();
        if(res){res.className='alkam-bank-import-result err';res.textContent='İçe aktarım durduruldu: '+v.badCount+' hatalı satır var. Console: ALKAM_BANKA_IMPORT_GUARD_V8.last()'}
      }
    },true);
  }
  function addPreviewPatch(){
    var btn=q('#alkamBankImportPreview'); if(!btn||btn.getAttribute('data-guarded')==='1')return;
    btn.setAttribute('data-guarded','1');
    btn.addEventListener('click',function(){setTimeout(function(){
      var ta=q('#alkamBankImportText'), res=q('#alkamBankImportResult');
      if(!ta||!window.ALKAM_BANKA_IMPORT_UI_V8||!ALKAM_BANKA_IMPORT_UI_V8.parseLines)return;
      var v=validateRows(ALKAM_BANKA_IMPORT_UI_V8.parseLines(ta.value)); window.__ALKAM_BANKA_IMPORT_LAST_VALIDATION=v;
      if(res){res.className='alkam-bank-import-result'+(v.badCount?' err':'');res.textContent='Önizleme: '+v.okCount+' sağlam satır · '+v.badCount+' hatalı satır';}
    },50)},true);
  }
  function run(){patchSave();addPreviewPatch()}
  window.ALKAM_BANKA_IMPORT_GUARD_V8={version:VERSION,validateRows:validateRows,run:run,last:function(){return window.__ALKAM_BANKA_IMPORT_LAST_VALIDATION||null},test:function(){run();return {version:VERSION,saveGuard:!!q('#alkamBankImportSave'),previewGuard:!!q('#alkamBankImportPreview'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(run,1500);
})();
