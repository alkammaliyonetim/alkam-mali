(function(){
  'use strict';
  var VERSION='ALKAM Data Quality v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function root(){return q('#selectedCariDetail')||q('#tab-cariler')||document.body}
  function txt(el){return String((el&&el.textContent)||'').replace(/\s+/g,' ').trim()}
  function parseMoney(v){
    var raw=String(v||'');
    var isA=/\bA\b/.test(raw)||/^-/.test(raw);
    var s=raw.replace(/TL|₺|Bakiye|B|A/g,'').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',', '.');
    var n=parseFloat(s); if(isNaN(n)) n=0;
    return isA?-Math.abs(n):n;
  }
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function findStatementTable(){return qa('table',root()).find(function(t){var x=txt(t).toLowerCase();return x.indexOf('borç')>-1&&x.indexOf('alacak')>-1&&(x.indexOf('bakiye')>-1||x.indexOf('kaynak')>-1)})}
  function headers(t){return qa('thead th',t).map(function(th){return txt(th).toLowerCase()})}
  function idx(h,needle){return h.findIndex(function(x){return x.indexOf(needle)>-1})}
  function rowObj(tr,h){
    var c=qa('td',tr).map(txt);
    var borcIdx=h.findIndex(function(x){return x.indexOf('borç')>-1||x.indexOf('borc')>-1});
    var alacakIdx=idx(h,'alacak'), bakiyeIdx=idx(h,'bakiye'), kaynakIdx=idx(h,'kaynak'), tarihIdx=idx(h,'tarih'), acikIdx=h.findIndex(function(x){return x.indexOf('açıklama')>-1||x.indexOf('aciklama')>-1});
    return {cells:c,tarih:c[tarihIdx]||c[1]||c[0]||'',aciklama:c[acikIdx]||c[4]||c[3]||'',borc:parseMoney(c[borcIdx]||''),alacak:parseMoney(c[alacakIdx]||''),bakiye:parseMoney(c[bakiyeIdx]||''),kaynak:c[kaynakIdx]||'',raw:c.join(' | ')};
  }
  function scanRows(){var t=findStatementTable();if(!t)return {table:null,heads:[],rows:[]};var h=headers(t);return {table:t,heads:h,rows:qa('tbody tr',t).map(function(tr){return rowObj(tr,h)})}}
  function findLast(rows,type){
    var item=null;
    rows.forEach(function(r){
      var a=(r.aciklama||'').toLowerCase();
      var isTahakkuk= r.borc>0 || a.indexOf('tahakkuk')>-1 || a.indexOf('muhasebe ücreti')>-1;
      var isTahsilat= r.alacak>0 || a.indexOf('tahsil')>-1 || a.indexOf('ödeme')>-1 || a.indexOf('odeme')>-1;
      if((type==='tahakkuk'&&isTahakkuk)||(type==='tahsilat'&&isTahsilat)) item=r;
    });
    return item;
  }
  function runChecks(){
    var scan=scanRows();
    var errors=[], warnings=[], checks={};
    checks.statementTableFound=!!scan.table;
    if(!scan.table){errors.push('Cari ekstre tablosu bulunamadı.');return result(errors,warnings,checks)}
    checks.rowCount=scan.rows.length;
    checks.sourceColumnOk=scan.heads.some(function(h){return h.indexOf('kaynak')>-1});
    if(!checks.sourceColumnOk) warnings.push('Kaynak kolonu görünmüyor.');
    var sumB=0,sumA=0,running=0,emptySource=0,bothDebitCredit=0,emptyDebitCredit=0,nanBalance=0;
    scan.rows.forEach(function(r,i){
      sumB+=r.borc; sumA+=r.alacak; running+=r.borc-r.alacak;
      if(!r.kaynak) emptySource++;
      if(r.borc>0&&r.alacak>0){bothDebitCredit++; errors.push((i+1)+'. satırda hem Borç hem Alacak dolu.');}
      if(r.borc===0&&r.alacak===0){emptyDebitCredit++; warnings.push((i+1)+'. satırda Borç/Alacak tutarı okunamadı veya boş.');}
      if((r.raw||'').toLowerCase().indexOf('nan')>-1){nanBalance++; errors.push((i+1)+'. satırda NaN/bozuk bakiye var.');}
    });
    if(emptySource>0) warnings.push(emptySource+' satırda kaynak eksik.');
    checks.debitCreditBalanceOk=true;
    checks.totalDebit=sumB; checks.totalCredit=sumA; checks.netBalance=sumB-sumA; checks.emptySourceCount=emptySource; checks.bothDebitCreditCount=bothDebitCredit; checks.emptyDebitCreditCount=emptyDebitCredit; checks.nanBalanceCount=nanBalance;
    var lt=findLast(scan.rows,'tahakkuk'), ls=findLast(scan.rows,'tahsilat');
    checks.lastTahakkukAmountOk=!!(lt&&lt.borc>0); checks.lastTahsilatAmountOk=!!(ls&&ls.alacak>0);
    if(lt&&!lt.borc) warnings.push('Son Tahakkuk tarihi/satırı var ama tutar okunamadı.');
    if(ls&&!ls.alacak) warnings.push('Son Tahsilat tarihi/satırı var ama tutar okunamadı.');
    checks.customerStatementOk=!!(window.ALKAM_CARI_CORE_V4&&typeof window.ALKAM_CARI_CORE_V4.customerStatement==='function');
    if(!checks.customerStatementOk) warnings.push('Müşteri ekstresi fonksiyonu bulunamadı.');
    return result(errors,warnings,checks);
  }
  function result(errors,warnings,checks){return {version:VERSION,status:errors.length?'error':(warnings.length?'warning':'ok'),errors:errors,warnings:warnings,checks:checks,time:new Date().toISOString()}}
  function panel(res){
    var p=document.getElementById('alkamDataQualityPanel');
    if(!p){p=document.createElement('div');p.id='alkamDataQualityPanel';document.body.appendChild(p)}
    var cls=res.status==='ok'?'ok':(res.status==='warning'?'warning':'error');
    p.className='alkam-dq-panel '+cls;
    p.innerHTML='<div class="alkam-dq-title">Veri Tutarlılık Kontrolü</div><div class="alkam-dq-status">Durum: '+res.status.toUpperCase()+'</div><div class="alkam-dq-line">Borç: '+money(res.checks.totalDebit||0)+' · Alacak: '+money(res.checks.totalCredit||0)+' · Net: '+money(res.checks.netBalance||0)+'</div><div class="alkam-dq-line">Uyarı: '+res.warnings.length+' · Hata: '+res.errors.length+' · Kaynak eksik: '+(res.checks.emptySourceCount||0)+'</div>';
  }
  function css(){if(q('#alkam-data-quality-style'))return;var st=document.createElement('style');st.id='alkam-data-quality-style';st.textContent='#alkamDataQualityPanel{position:fixed!important;right:22px!important;bottom:22px!important;z-index:999997!important;max-width:430px!important;padding:12px 14px!important;border-radius:14px!important;background:#fff!important;border:1px solid #e2e8f0!important;box-shadow:0 18px 42px rgba(15,23,42,.18)!important;font-family:Arial,Helvetica,sans-serif!important}.alkam-dq-panel.ok{border-color:#86efac!important}.alkam-dq-panel.warning{border-color:#fdba74!important}.alkam-dq-panel.error{border-color:#fca5a5!important}.alkam-dq-title{font-size:14px;font-weight:900;color:#0f172a;margin-bottom:5px}.alkam-dq-status{font-size:12px;font-weight:900;margin-bottom:5px}.alkam-dq-panel.ok .alkam-dq-status{color:#047857}.alkam-dq-panel.warning .alkam-dq-status{color:#c2410c}.alkam-dq-panel.error .alkam-dq-status{color:#b91c1c}.alkam-dq-line{font-size:12px;font-weight:800;color:#334155;line-height:1.5}@media(max-width:900px){#alkamDataQualityPanel{left:12px!important;right:12px!important;bottom:92px!important;max-width:none!important}}';document.head.appendChild(st)}
  function run(){try{css();var r=runChecks();window.__ALKAM_DATA_QUALITY_LAST=r;panel(r);return r}catch(e){console.warn('ALKAM Data Quality hata:',e);return null}}
  window.ALKAM_DATA_QUALITY={version:VERSION,run:run,test:run,last:function(){return window.__ALKAM_DATA_QUALITY_LAST}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(run,2500);
})();
