(function(){
  'use strict';
  var VERSION='ALKAM v12 Final Test Runner v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function safe(name,fn){try{return {name:name,ok:true,result:fn()}}catch(error){return {name:name,ok:false,error:error.message}}}
  function run(){
    var results=[
      safe('Cache / Deploy',function(){return ALKAM_CACHE_DEPLOY_KONTROL_V11.test()}),
      safe('Dashboard',function(){return ALKAM_DASHBOARD_KURUMSAL_V11.test()}),
      safe('Preflight',function(){return ALKAM_V12_PREFLIGHT_V1.test()}),
      safe('Sonuç Export Test',function(){return ALKAM_V12_PREFLIGHT_EXPORT_V1.test()}),
      safe('Supabase Write Gate',function(){return ALKAM_SUPABASE_WRITE_GATE_V10.test()}),
      safe('Canlı Test Paketi',function(){return ALKAM_CANLI_TEST_PAKETI_V11.test()})
    ];
    var exportData=safe('Sonuç Export Collect',function(){return ALKAM_V12_PREFLIGHT_EXPORT_V1.collect()});
    var summary={
      version:VERSION,
      status:'ALKAM v12 Final Canlı Test',
      expectedBuild:'v11.32 - 05.05.2026',
      cacheOk:!!(results[0].result&&results[0].result.missing===0),
      preflightReady:!!(results[2].result&&results[2].result.ready===true),
      writeOpen:!!(results[2].result&&results[2].result.writeOpen===true),
      exportBad:!!(results[2].result&&results[2].result.exportBad===true),
      writeAllowed:!!(results[4].result&&results[4].result.writeAllowed===true),
      liveFailed:results[5].result&&results[5].result.failed,
      liveRisky:results[5].result&&results[5].result.risky,
      decision:(results[2].result&&results[2].result.ready===true)?'v12 stabilizasyonuna geçilebilir':'Önce eksikler düzeltilecek',
      security:'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',
      time:new Date().toISOString(),
      results:results,
      exportData:exportData
    };
    window.__ALKAM_V12_FINAL_TEST_LAST=summary;
    console.log('ALKAM FINAL TEST SUMMARY:',summary);
    return summary;
  }
  function css(){
    if(q('#alkam-v12-final-test-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-final-test-style';
    st.textContent='.alkam-final-modal{position:fixed;inset:0;z-index:1000034;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-final-modal.open{display:flex}.alkam-final-box{width:min(1080px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-final-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-final-head b{font-size:18px;color:#0f172a}.alkam-final-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-final-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-final-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-final-note{border-radius:12px;padding:10px;margin-bottom:12px;font-weight:950}.alkam-final-note.ok{background:#ecfdf5;border:1px solid #bbf7d0;color:#047857}.alkam-final-note.bad{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.alkam-final-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-final-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-final-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-final-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-final-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-final-card span{display:block;margin-top:6px;font-size:18px;font-weight:950}.alkam-final-pre{background:#0f172a;color:#e5e7eb;border-radius:14px;padding:12px;white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:420px;overflow:auto}@media(max-width:900px){.alkam-final-grid{grid-template-columns:1fr}.alkam-final-pre{font-size:11px}}';
    document.head.appendChild(st);
  }
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function modal(){
    var el=q('#alkamV12FinalTestModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamV12FinalTestModal'; el.className='alkam-final-modal';
    el.innerHTML='<div class="alkam-final-box"><div class="alkam-final-head"><div><b>v12 Final Canlı Test</b><small>Console gerekmeden final test özetini üretir. Veri yazmaz.</small></div><button class="alkam-final-close">×</button></div><div class="alkam-final-body" id="alkamFinalBody"></div></div>';
    document.body.appendChild(el); q('.alkam-final-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function copy(){var t=JSON.stringify(window.__ALKAM_V12_FINAL_TEST_LAST||run(),null,2); if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t); return {ok:true,chars:t.length,time:new Date().toISOString()}}
  function render(){
    css(); var el=modal(), body=q('#alkamFinalBody',el), r=run();
    var clean=r.cacheOk&&r.preflightReady&&!r.writeOpen&&!r.exportBad&&!r.writeAllowed&&Number(r.liveFailed||0)===0&&Number(r.liveRisky||0)===0;
    body.innerHTML='<div class="alkam-final-note '+(clean?'ok':'bad')+'">Karar: '+r.decision+'</div><div class="alkam-final-actions"><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.render()">Testi Yenile</button><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.copy()">Sonucu Kopyala</button><button onclick="window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.download&&ALKAM_V12_PREFLIGHT_EXPORT_V1.download()">JSON İndir</button></div><div class="alkam-final-grid"><div class="alkam-final-card"><b>Cache</b><span>'+(r.cacheOk?'OK':'Eksik')+'</span></div><div class="alkam-final-card"><b>Preflight</b><span>'+(r.preflightReady?'Ready':'Hayır')+'</span></div><div class="alkam-final-card"><b>Write</b><span>'+(r.writeAllowed||r.writeOpen?'Açık':'Kapalı')+'</span></div><div class="alkam-final-card"><b>Live Risk</b><span>'+((r.liveFailed||0)+(r.liveRisky||0))+'</span></div></div><pre class="alkam-final-pre">'+esc(JSON.stringify(r,null,2))+'</pre>';
    return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function boot(){setTimeout(function(){modal()},4300)}
  window.ALKAM_V12_FINAL_TEST_RUNNER_V1={version:VERSION,run:run,test:run,open:open,render:render,copy:copy,last:function(){return window.__ALKAM_V12_FINAL_TEST_LAST||run()},runBoot:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
