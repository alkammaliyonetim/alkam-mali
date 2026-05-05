(function(){
  'use strict';
  var VERSION='ALKAM v12 Final Test Runner v1.1 SAFE';
  var running=false;
  function q(s,r){return (r||document).querySelector(s)}
  function safe(name,fn){try{return {name:name,ok:true,result:fn()}}catch(error){return {name:name,ok:false,error:error.message}}}
  function lightRun(){
    var results=[
      safe('Cache / Deploy',function(){return window.ALKAM_CACHE_DEPLOY_KONTROL_V11&&ALKAM_CACHE_DEPLOY_KONTROL_V11.last?ALKAM_CACHE_DEPLOY_KONTROL_V11.last():null}),
      safe('Dashboard',function(){return window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.last?ALKAM_DASHBOARD_KURUMSAL_V11.last():null}),
      safe('Preflight',function(){return window.ALKAM_V12_PREFLIGHT_V1&&ALKAM_V12_PREFLIGHT_V1.last?ALKAM_V12_PREFLIGHT_V1.last():null}),
      safe('Sonuç Export Test',function(){return window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.test?ALKAM_V12_PREFLIGHT_EXPORT_V1.test():null}),
      safe('Supabase Write Gate',function(){return window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.test?ALKAM_SUPABASE_WRITE_GATE_V10.test():null}),
      safe('Canlı Test Paketi',function(){return window.ALKAM_CANLI_TEST_PAKETI_V11&&ALKAM_CANLI_TEST_PAKETI_V11.last?ALKAM_CANLI_TEST_PAKETI_V11.last():null})
    ];
    var pre=results[2].result||{};
    var cache=results[0].result||{};
    var gate=results[4].result||{};
    var live=results[5].result||{};
    var summary={
      version:VERSION,
      status:'ALKAM v12 Final Canlı Test - Güvenli Mod',
      expectedBuild:'v11.32 - 05.05.2026',
      cacheOk:cache.missing===0,
      preflightReady:pre.ready===true,
      writeOpen:pre.writeOpen===true,
      exportBad:pre.exportBad===true,
      writeAllowed:gate.writeAllowed===true,
      liveFailed:typeof live.failed==='number'?live.failed:null,
      liveRisky:typeof live.risky==='number'?live.risky:null,
      decision:(pre.ready===true)?'v12 stabilizasyonuna geçilebilir':'Önce eksikler düzeltilecek veya testler henüz çalışmadı',
      mode:'safe-light-last-state',
      security:'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',
      time:new Date().toISOString(),
      results:results
    };
    window.__ALKAM_V12_FINAL_TEST_LAST=summary;
    console.log('ALKAM FINAL TEST SUMMARY:',summary);
    return summary;
  }
  function fullRun(){
    if(running)return window.__ALKAM_V12_FINAL_TEST_LAST||{version:VERSION,blocked:true,time:new Date().toISOString()};
    running=true;
    try{
      var results=[
        safe('Cache / Deploy',function(){return window.ALKAM_CACHE_DEPLOY_KONTROL_V11&&ALKAM_CACHE_DEPLOY_KONTROL_V11.test?ALKAM_CACHE_DEPLOY_KONTROL_V11.test():null}),
        safe('Dashboard Last',function(){return window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.last?ALKAM_DASHBOARD_KURUMSAL_V11.last():null}),
        safe('Preflight Last',function(){return window.ALKAM_V12_PREFLIGHT_V1&&ALKAM_V12_PREFLIGHT_V1.last?ALKAM_V12_PREFLIGHT_V1.last():null}),
        safe('Sonuç Export Light',function(){return window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.test?ALKAM_V12_PREFLIGHT_EXPORT_V1.test():null}),
        safe('Supabase Write Gate',function(){return window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.test?ALKAM_SUPABASE_WRITE_GATE_V10.test():null}),
        safe('Canlı Test Last',function(){return window.ALKAM_CANLI_TEST_PAKETI_V11&&ALKAM_CANLI_TEST_PAKETI_V11.last?ALKAM_CANLI_TEST_PAKETI_V11.last():null})
      ];
      var cache=results[0].result||{}, pre=results[2].result||{}, gate=results[4].result||{}, live=results[5].result||{};
      var summary={version:VERSION,status:'ALKAM v12 Final Canlı Test - Güvenli Full',expectedBuild:'v11.32 - 05.05.2026',cacheOk:cache.missing===0,preflightReady:pre.ready===true,writeOpen:pre.writeOpen===true,exportBad:pre.exportBad===true,writeAllowed:gate.writeAllowed===true,liveFailed:typeof live.failed==='number'?live.failed:null,liveRisky:typeof live.risky==='number'?live.risky:null,decision:(pre.ready===true)?'v12 stabilizasyonuna geçilebilir':'Önce eksikler düzeltilecek veya testler henüz çalışmadı',mode:'safe-full-no-recursive-export',security:'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',time:new Date().toISOString(),results:results};
      window.__ALKAM_V12_FINAL_TEST_LAST=summary;
      console.log('ALKAM FINAL TEST SUMMARY:',summary);
      return summary;
    }finally{running=false}
  }
  function css(){
    if(q('#alkam-v12-final-test-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-final-test-style';
    st.textContent='.alkam-final-modal{position:fixed;inset:0;z-index:1000034;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-final-modal.open{display:flex}.alkam-final-box{width:min(1080px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-final-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-final-head b{font-size:18px;color:#0f172a}.alkam-final-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-final-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-final-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-final-note{border-radius:12px;padding:10px;margin-bottom:12px;font-weight:950}.alkam-final-note.ok{background:#ecfdf5;border:1px solid #bbf7d0;color:#047857}.alkam-final-note.bad{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.alkam-final-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-final-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-final-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-final-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-final-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-final-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-final-card span{display:block;margin-top:6px;font-size:18px;font-weight:950}.alkam-final-pre{background:#0f172a;color:#e5e7eb;border-radius:14px;padding:12px;white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:420px;overflow:auto}@media(max-width:900px){.alkam-final-grid{grid-template-columns:1fr}.alkam-final-pre{font-size:11px}}';
    document.head.appendChild(st);
  }
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function modal(){var el=q('#alkamV12FinalTestModal');if(el)return el;el=document.createElement('div');el.id='alkamV12FinalTestModal';el.className='alkam-final-modal';el.innerHTML='<div class="alkam-final-box"><div class="alkam-final-head"><div><b>v12 Final Canlı Test</b><small>Güvenli mod: açılırken otomatik ağır test çalıştırmaz. Veri yazmaz.</small></div><button class="alkam-final-close">×</button></div><div class="alkam-final-body" id="alkamFinalBody"></div></div>';document.body.appendChild(el);q('.alkam-final-close',el).onclick=function(){el.classList.remove('open')};return el}
  function copy(){var t=JSON.stringify(window.__ALKAM_V12_FINAL_TEST_LAST||lightRun(),null,2);if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t);return {ok:true,chars:t.length,time:new Date().toISOString()}}
  function paint(r){var body=q('#alkamFinalBody');if(!body)return r;var clean=r.cacheOk&&r.preflightReady&&!r.writeOpen&&!r.exportBad&&!r.writeAllowed&&Number(r.liveFailed||0)===0&&Number(r.liveRisky||0)===0;body.innerHTML='<div class="alkam-final-note '+(clean?'ok':'bad')+'">Karar: '+r.decision+'</div><div class="alkam-final-actions"><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.render()">Hafif Test</button><button class="secondary" onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.runFull()">Güvenli Full Test</button><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.copy()">Sonucu Kopyala</button></div><div class="alkam-final-grid"><div class="alkam-final-card"><b>Cache</b><span>'+(r.cacheOk?'OK':'Eksik')+'</span></div><div class="alkam-final-card"><b>Preflight</b><span>'+(r.preflightReady?'Ready':'Bekliyor')+'</span></div><div class="alkam-final-card"><b>Write</b><span>'+(r.writeAllowed||r.writeOpen?'Açık':'Kapalı')+'</span></div><div class="alkam-final-card"><b>Live Risk</b><span>'+((r.liveFailed||0)+(r.liveRisky||0))+'</span></div></div><pre class="alkam-final-pre">'+esc(JSON.stringify(r,null,2))+'</pre>';return r}
  function render(){css();modal();return paint(lightRun())}
  function runFull(){return paint(fullRun())}
  function open(){css();modal().classList.add('open');var body=q('#alkamFinalBody');if(body&&!window.__ALKAM_V12_FINAL_TEST_LAST){body.innerHTML='<div class="alkam-final-note bad">Güvenli mod aktif. Panel açıldı; test otomatik çalışmadı. Önce Hafif Test butonuna bas.</div><div class="alkam-final-actions"><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.render()">Hafif Test</button><button class="secondary" onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.runFull()">Güvenli Full Test</button></div>'}else render()}
  function boot(){setTimeout(function(){css();modal()},4300)}
  window.ALKAM_V12_FINAL_TEST_RUNNER_V1={version:VERSION,run:lightRun,test:lightRun,runFull:runFull,open:open,render:render,copy:copy,last:function(){return window.__ALKAM_V12_FINAL_TEST_LAST||lightRun()},runBoot:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
