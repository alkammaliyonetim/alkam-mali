(function(){
'use strict';
var VERSION='ALKAM UI Standart v1.0';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function css(){
  if(q('#alkam-ui-standart-style'))return;
  var st=document.createElement('style');st.id='alkam-ui-standart-style';
  st.textContent=[
    ':root{--alkam-sidebar-w:158px;--alkam-bottom-safe:88px}',
    'body{background:#f4f7fb!important;overflow-x:hidden!important}',
    '.sidebar{width:var(--alkam-sidebar-w)!important;min-width:var(--alkam-sidebar-w)!important;max-width:var(--alkam-sidebar-w)!important}',
    '.layout{grid-template-columns:var(--alkam-sidebar-w) minmax(0,1fr)!important}',
    '.main{min-width:0!important;width:100%!important;max-width:none!important}',
    '.brand-title,.sidebar .brand-title{white-space:normal!important;line-height:1.16!important;font-size:14px!important}',
    '.side-link,.nav-item,.sidebar button,.sidebar a{min-height:34px!important;white-space:normal!important;line-height:1.15!important;align-items:center!important}',
    '.side-link span,.nav-item span,.sidebar button span,.sidebar a span{white-space:normal!important;overflow:visible!important;text-overflow:clip!important}',
    '.sidebar .group-title,.side-section-title{font-size:10px!important;letter-spacing:.06em!important;line-height:1.15!important;margin-top:14px!important}',
    '.alkam-final-modal:not(.open),.alkam-v12-export-modal:not(.open),.alkam-cache-modal:not(.open),.alkam-live-test-modal:not(.open),.alkam-visual-modal:not(.open),.alkam-preflight-modal:not(.open),#alkamV12FinalTestModal:not(.open),#alkamV12PreflightExportModal:not(.open){display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important}',
    'body>div:not(.open)[id*="Final"],body>div:not(.open)[id*="Preflight"],body>div:not(.open)[id*="Cache"]{display:none!important}',
    '#alkamV12FinalTestButton,.alkam-v12-final-button,#alkamFinalTestButton{display:none!important}',
    '#alkamTahakkukPanel{left:auto!important;right:18px!important;bottom:calc(var(--alkam-bottom-safe) + 42px)!important;max-width:420px!important;display:none!important}',
    '#alkamTahakkukPanel.open{display:block!important}',
    '#alkamModuleButton,#alkamModulMenuButton,.alkam-module-button{right:18px!important;bottom:18px!important;z-index:999990!important}',
    '#alkamStatusBadge,#alkamTekKontrolRozeti,.alkam-status-badge,.alkam-control-badge{right:18px!important;bottom:58px!important;z-index:999989!important;max-width:360px!important}',
    '#alkamControlCenterButton,#alkamKontrolMerkeziButton{right:18px!important;bottom:98px!important;z-index:999988!important}',
    '.alkam-floating-stack{position:fixed!important;right:18px!important;bottom:18px!important;z-index:999990!important;display:flex!important;flex-direction:column!important;gap:8px!important;align-items:flex-end!important}',
    '.alkam-floating-stack>*{position:static!important;margin:0!important}',
    '#tab-cari-toplu-tahakkuk .section,#tab-toplu-tahakkuk .section{width:100%!important;max-width:none!important}',
    '#tab-cari-toplu-tahakkuk input[type="date"],#tab-toplu-tahakkuk input[type="date"]{border-color:#1769e8!important;box-shadow:0 0 0 3px rgba(23,105,232,.10)!important}',
    '.alkam-date-master-note{margin:8px 0 10px;padding:9px 11px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:12px;font-size:12px;font-weight:900}',
    '@media(max-width:1200px){:root{--alkam-sidebar-w:136px}.sidebar{font-size:12px!important}}'
  ].join('\n');
  document.head.appendChild(st)
}
function hideDebugTextNodes(){
  var bad=['Final Canlı Test','Dashboard Görsel Kontrol','Canlı Test Paketi','Cache / Deploy Kontrol','v12 Stabilizer','v12 Preflight Kontrol'];
  qa('body>div,body>section,body>aside').forEach(function(el){
    if(el.classList&&el.classList.contains('open'))return;
    var txt=(el.innerText||'').slice(0,240);
    if(bad.some(function(b){return txt.indexOf(b)>-1}) && !el.closest('.main') && !el.closest('.sidebar')){
      el.style.display='none';el.style.visibility='hidden';el.style.height='0';el.style.overflow='hidden';
    }
  })
}
function masterDate(){
  var root=q('#tab-cari-toplu-tahakkuk')||q('#tab-toplu-tahakkuk'); if(!root)return;
  var dates=qa('input[type="date"]',root); if(!dates.length)return;
  var master=dates[0]; master.dataset.alkamMasterDate='1';
  if(!q('.alkam-date-master-note',root)){
    var note=document.createElement('div');note.className='alkam-date-master-note';
    note.textContent='Tek tarih standardı aktif: üstte seçilen tarih toplu tahakkuk gridinin ana tarihidir. Satır tarihleri bu tarih üzerinden yürür.';
    var place=master.closest('.field')||master.parentElement||root.firstChild; place.insertAdjacentElement('afterend',note);
  }
  if(!master.dataset.alkamDateBound){master.dataset.alkamDateBound='1';master.addEventListener('change',function(){dates.forEach(function(d){if(d!==master&&!d.disabled){d.value=master.value;d.dispatchEvent(new Event('change',{bubbles:true}))}})})}
}
function run(){css();hideDebugTextNodes();masterDate();window.__ALKAM_UI_STANDART_LAST={version:VERSION,time:new Date().toISOString()};return window.__ALKAM_UI_STANDART_LAST}
function boot(){run();setInterval(run,2500);try{new MutationObserver(run).observe(document.body,{childList:true,subtree:true})}catch(e){}}
window.ALKAM_UI_STANDART_V1={version:VERSION,run:run,test:function(){return run()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();