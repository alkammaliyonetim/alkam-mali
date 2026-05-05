(function(){
  'use strict';
  var VERSION='ALKAM v12 Modal/Layout Fix v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function css(){
    if(q('#alkam-v12-modal-layout-fix-style'))return;
    var st=document.createElement('style');
    st.id='alkam-v12-modal-layout-fix-style';
    st.textContent=[
      '.alkam-preflight-modal,.alkam-v12-export-modal,.alkam-cache-modal,.alkam-final-modal,.alkam-live-test-modal,.alkam-visual-modal,.alkam-v12-stabilizer-modal,.alkam-view-pref-modal,.alkam-period-modal{display:none!important}',
      '.alkam-preflight-modal.open,.alkam-v12-export-modal.open,.alkam-cache-modal.open,.alkam-final-modal.open,.alkam-live-test-modal.open,.alkam-visual-modal.open,.alkam-v12-stabilizer-modal.open,.alkam-view-pref-modal.open,.alkam-period-modal.open{display:flex!important}',
      '#alkamV12FinalTestModal:not(.open),#alkamV12PreflightModal:not(.open),#alkamV12PreflightExportModal:not(.open),#alkamCacheDeployModal:not(.open){display:none!important}',
      '#alkamV12FinalTestButton{right:18px!important;bottom:18px!important}',
      '#tab-cari-toplu-tahakkuk input[type="date"],#tab-toplu-tahakkuk input[type="date"],.tab-page.active input[type="date"]{font-variant-numeric:tabular-nums}',
      '.alkam-bulk-date-note{margin:8px 0 10px;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:12px;font-size:12px;font-weight:900}',
      '.alkam-bulk-date-master{box-shadow:0 0 0 3px rgba(23,105,232,.12)!important;border-color:#1769e8!important;background:#fff!important}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function hideStrayModals(){
    qa('.alkam-preflight-modal,.alkam-v12-export-modal,.alkam-cache-modal,.alkam-final-modal,.alkam-live-test-modal,.alkam-visual-modal,.alkam-v12-stabilizer-modal,.alkam-view-pref-modal').forEach(function(el){
      if(!el.classList.contains('open')) el.style.display='none';
    });
  }
  function activeBulkPage(){
    var pages=qa('.tab-page.active, section.active, main, body');
    for(var i=0;i<pages.length;i++){
      var t=(pages[i].innerText||'').toLowerCase();
      if(t.indexOf('cari toplu tahakkuk')>-1||t.indexOf('toplu tahakkuk grid')>-1)return pages[i];
    }
    return null;
  }
  function findMasterDate(root){
    var dates=qa('input[type="date"]',root);
    if(!dates.length)return null;
    var labeled=dates.find(function(inp){
      var box=inp.closest('.field')||inp.parentElement;
      var txt=(box&&box.innerText||'').toLowerCase();
      return txt.indexOf('varsayılan tarih')>-1||txt.indexOf('varsayilan tarih')>-1||txt.indexOf('tarih')>-1;
    });
    return labeled||dates[0];
  }
  function applyDateToRows(root,master){
    if(!master||!master.value)return {applied:0};
    var all=qa('input[type="date"]',root).filter(function(x){return x!==master});
    var n=0;
    all.forEach(function(inp){
      if(!inp.disabled){inp.value=master.value;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.dispatchEvent(new Event('change',{bubbles:true}));n++}
    });
    return {applied:n,value:master.value};
  }
  function enhanceBulkDate(){
    var root=activeBulkPage(); if(!root)return {active:false};
    var master=findMasterDate(root); if(!master)return {active:false,reason:'date input yok'};
    master.classList.add('alkam-bulk-date-master');
    master.dataset.alkamMasterDate='1';
    var holder=master.closest('.section')||root;
    if(!q('#alkamBulkDateNote',holder)){
      var note=document.createElement('div');
      note.id='alkamBulkDateNote';
      note.className='alkam-bulk-date-note';
      note.textContent='Tek tarih modu aktif: üstteki tarih alanı toplu tahakkukta ana tarihtir. Tarih değişince satırlardaki tarih alanları aynı tarihe çekilir; ayrı ayrı tarih seçmek gerekmez.';
      var ref=master.closest('.field')||master.parentElement;
      if(ref&&ref.parentElement)ref.parentElement.insertAdjacentElement('afterend',note); else holder.insertBefore(note,holder.firstChild);
    }
    if(!master.dataset.alkamBound){
      master.dataset.alkamBound='1';
      master.addEventListener('change',function(){applyDateToRows(root,master)});
      master.addEventListener('input',function(){applyDateToRows(root,master)});
    }
    return {active:true,value:master.value,applied:applyDateToRows(root,master).applied};
  }
  function run(){css();hideStrayModals();return enhanceBulkDate()}
  function boot(){run();setInterval(run,2500);try{new MutationObserver(function(){run()}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
  window.ALKAM_V12_MODAL_LAYOUT_FIX_V1={version:VERSION,run:run,test:function(){return {version:VERSION,bulkDate:enhanceBulkDate(),strayHidden:true,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
