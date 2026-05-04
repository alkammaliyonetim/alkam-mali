(function(){
  'use strict';
  var VERSION='ALKAM Cache Deploy Kontrol v11.30';
  var EXPECTED='v11.17 - 05.05.2026';
  function q(s,r){return (r||document).querySelector(s)}
  function scan(){
    var badge=window.ALKAM_SURUM_ROZETI_V11&&ALKAM_SURUM_ROZETI_V11.last?ALKAM_SURUM_ROZETI_V11.last():null;
    var corp=window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.test?ALKAM_DASHBOARD_KURUMSAL_V11.test():null;
    var stabil=window.ALKAM_V12_STABILIZER_V1&&ALKAM_V12_STABILIZER_V1.test?ALKAM_V12_STABILIZER_V1.test():null;
    var checks=[
      {name:'Sürüm rozeti yüklü',ok:!!window.ALKAM_SURUM_ROZETI_V11,detail:badge&&badge.build||'-'},
      {name:'Beklenen build',ok:!!(badge&&badge.build===EXPECTED),detail:'Beklenen: '+EXPECTED},
      {name:'Kurumsal dashboard',ok:!!q('#alkamCorporateDashboard'),detail:corp&&corp.version||'-'},
      {name:'Dönem filtre loader',ok:!!q('script[data-alkam-period-filter]'),detail:'script kontrol'},
      {name:'Tek ekran loader',ok:!!q('script[data-alkam-tek-ekran]'),detail:'script kontrol'},
      {name:'Görsel kontrol loader',ok:!!q('script[data-alkam-gorsel-kontrol]'),detail:'script kontrol'},
      {name:'Canlı test loader',ok:!!q('script[data-alkam-canli-test]'),detail:'script kontrol'},
      {name:'Sürüm rozeti loader',ok:!!q('script[data-alkam-surum-rozeti]'),detail:'script kontrol'},
      {name:'Cache kontrol loader',ok:!!q('script[data-alkam-cache-deploy]'),detail:'script kontrol'},
      {name:'Görünüm tercihi loader',ok:!!q('script[data-alkam-view-pref]'),detail:'Normal / Kompakt / Ultra'},
      {name:'Kompakt loader',ok:!!q('script[data-alkam-kompakt]'),detail:'kompakt css'},
      {name:'Ultra kompakt loader',ok:!!q('script[data-alkam-ultra-kompakt]'),detail:'ultra css'},
      {name:'v12 stabilizer loader',ok:!!q('script[data-alkam-v12-stabilizer]'),detail:stabil&&stabil.status||'script kontrol'},
      {name:'Supabase yazma kapısı kapalı',ok:!(stabil&&stabil.writeAllowed===true),detail:'writeAllowed false olmalı'}
    ];
    var missing=checks.filter(function(x){return !x.ok}).length;
    var result={version:VERSION,expected:EXPECTED,status:missing?'Cache/Deploy Kontrol':'Güncel',missing:missing,checks:checks,stabilizer:stabil,time:new Date().toISOString()};
    window.__ALKAM_CACHE_DEPLOY_LAST=result;
    return result;
  }
  function css(){
    if(q('#alkam-cache-deploy-style'))return;
    var st=document.createElement('style');st.id='alkam-cache-deploy-style';
    st.textContent='.alkam-cache-modal{position:fixed;inset:0;z-index:1000030;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-cache-modal.open{display:flex}.alkam-cache-box{width:min(920px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-cache-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-cache-head b{font-size:18px;color:#0f172a}.alkam-cache-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-cache-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-cache-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-cache-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-cache-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-cache-note{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:900}.alkam-cache-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-cache-table table{width:100%;border-collapse:collapse}.alkam-cache-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-cache-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-cache-ok{color:#047857;font-weight:950}.alkam-cache-bad{color:#b91c1c;font-weight:950}@media(max-width:900px){.alkam-cache-table{overflow:auto}.alkam-cache-table table{min-width:780px}}';
    document.head.appendChild(st);
  }
  function modal(){
    var el=q('#alkamCacheDeployModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamCacheDeployModal'; el.className='alkam-cache-modal';
    el.innerHTML='<div class="alkam-cache-box"><div class="alkam-cache-head"><div><b>Cache / Deploy Kontrol</b><small>Canlı sayfada yeni sürüm ve v12 hazırlık modülleri gerçekten geldi mi kontrol eder.</small></div><button class="alkam-cache-close">×</button></div><div class="alkam-cache-body" id="alkamCacheBody"></div></div>';
    document.body.appendChild(el); q('.alkam-cache-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(), body=q('#alkamCacheBody',el), r=scan();
    body.innerHTML='<div class="alkam-cache-note">Eksik görünürse önce Ctrl+F5 / sert yenileme yap. Bu panel veri yazmaz.</div><div class="alkam-cache-actions"><button onclick="window.ALKAM_CACHE_DEPLOY_KONTROL_V11&&ALKAM_CACHE_DEPLOY_KONTROL_V11.render()">Yenile</button><button onclick="location.reload()">Sayfayı Yenile</button><button onclick="window.ALKAM_V12_STABILIZER_V1&&ALKAM_V12_STABILIZER_V1.open&&ALKAM_V12_STABILIZER_V1.open()">v12 Stabil Aç</button></div><div class="alkam-cache-table"><table><thead><tr><th>Kontrol</th><th>Durum</th><th>Detay</th></tr></thead><tbody>'+r.checks.map(function(x){return '<tr><td>'+x.name+'</td><td class="'+(x.ok?'alkam-cache-ok':'alkam-cache-bad')+'">'+(x.ok?'OK':'Eksik')+'</td><td>'+x.detail+'</td></tr>'}).join('')+'</tbody></table></div>';
    return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function boot(){setTimeout(function(){modal()},3600)}
  window.ALKAM_CACHE_DEPLOY_KONTROL_V11={version:VERSION,expected:EXPECTED,scan:scan,test:scan,open:open,render:render,run:boot,last:function(){return window.__ALKAM_CACHE_DEPLOY_LAST||scan()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
