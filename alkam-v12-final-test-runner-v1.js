(function(){
  'use strict';
  var VERSION='ALKAM v12 Final Test Runner v1.2 INSTANT';
  function q(s,r){return (r||document).querySelector(s)}
  function exists(name){return typeof window[name]!=='undefined'}
  function cached(name){try{return window[name]||null}catch(e){return null}}
  function instantRun(){
    var summary={
      version:VERSION,
      status:'ALKAM v12 Final Canlı Test - Anlık Güvenli Kontrol',
      expectedBuild:'v11.32 - 05.05.2026',
      modules:{
        cacheDeploy:exists('ALKAM_CACHE_DEPLOY_KONTROL_V11'),
        dashboard:exists('ALKAM_DASHBOARD_KURUMSAL_V11'),
        preflight:exists('ALKAM_V12_PREFLIGHT_V1'),
        export:exists('ALKAM_V12_PREFLIGHT_EXPORT_V1'),
        writeGate:exists('ALKAM_SUPABASE_WRITE_GATE_V10'),
        liveTest:exists('ALKAM_CANLI_TEST_PAKETI_V11'),
        layoutFix:exists('ALKAM_V12_WIDE_LAYOUT_FIX_V1'),
        modalFix:exists('ALKAM_V12_MODAL_LAYOUT_FIX_V1')
      },
      cached:{
        cache:window.__ALKAM_CACHE_DEPLOY_LAST||null,
        dashboard:window.__ALKAM_DASHBOARD_KURUMSAL_LAST||null,
        preflight:window.__ALKAM_V12_PREFLIGHT_LAST||null,
        export:window.__ALKAM_V12_PREFLIGHT_EXPORT_LAST||null,
        live:window.__ALKAM_CANLI_TEST_LAST||null,
        writeGate:window.__ALKAM_SUPABASE_WRITE_GATE_LAST||null
      },
      cacheOk:(window.__ALKAM_CACHE_DEPLOY_LAST&&window.__ALKAM_CACHE_DEPLOY_LAST.missing===0)||null,
      preflightReady:(window.__ALKAM_V12_PREFLIGHT_LAST&&window.__ALKAM_V12_PREFLIGHT_LAST.ready===true)||null,
      writeOpen:(window.__ALKAM_V12_PREFLIGHT_LAST&&window.__ALKAM_V12_PREFLIGHT_LAST.writeOpen===true)||false,
      exportBad:(window.__ALKAM_V12_PREFLIGHT_LAST&&window.__ALKAM_V12_PREFLIGHT_LAST.exportBad===true)||false,
      writeAllowed:(window.__ALKAM_SUPABASE_WRITE_GATE_LAST&&window.__ALKAM_SUPABASE_WRITE_GATE_LAST.writeAllowed===true)||false,
      liveFailed:(window.__ALKAM_CANLI_TEST_LAST&&typeof window.__ALKAM_CANLI_TEST_LAST.failed==='number')?window.__ALKAM_CANLI_TEST_LAST.failed:null,
      liveRisky:(window.__ALKAM_CANLI_TEST_LAST&&typeof window.__ALKAM_CANLI_TEST_LAST.risky==='number')?window.__ALKAM_CANLI_TEST_LAST.risky:null,
      decision:'Anlık kontrol tamamlandı. Kilitlenme olmadan modül var/yok ve son cache bilgileri gösterildi.',
      mode:'instant-no-test-calls',
      security:'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',
      time:new Date().toISOString()
    };
    window.__ALKAM_V12_FINAL_TEST_LAST=summary;
    console.log('ALKAM FINAL TEST SUMMARY:',summary);
    return summary;
  }
  function controlledRun(){
    var s=instantRun();
    try{if(window.ALKAM_V12_WIDE_LAYOUT_FIX_V1&&ALKAM_V12_WIDE_LAYOUT_FIX_V1.run)ALKAM_V12_WIDE_LAYOUT_FIX_V1.run()}catch(e){}
    try{if(window.ALKAM_V12_MODAL_LAYOUT_FIX_V1&&ALKAM_V12_MODAL_LAYOUT_FIX_V1.run)ALKAM_V12_MODAL_LAYOUT_FIX_V1.run()}catch(e){}
    s.controlled={layoutFix:true,modalFix:true,time:new Date().toISOString()};
    window.__ALKAM_V12_FINAL_TEST_LAST=s;
    return s;
  }
  function css(){
    if(q('#alkam-v12-final-test-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-final-test-style';
    st.textContent='.alkam-final-modal{position:fixed;inset:0;z-index:1000034;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-final-modal.open{display:flex}.alkam-final-box{width:min(1080px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-final-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-final-head b{font-size:18px;color:#0f172a}.alkam-final-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-final-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-final-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-final-note{border-radius:12px;padding:10px;margin-bottom:12px;font-weight:950;background:#ecfdf5;border:1px solid #bbf7d0;color:#047857}.alkam-final-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-final-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-final-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-final-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-final-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-final-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-final-card span{display:block;margin-top:6px;font-size:18px;font-weight:950}.alkam-final-pre{background:#0f172a;color:#e5e7eb;border-radius:14px;padding:12px;white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:420px;overflow:auto}@media(max-width:900px){.alkam-final-grid{grid-template-columns:1fr}.alkam-final-pre{font-size:11px}}';
    document.head.appendChild(st);
  }
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function modal(){var el=q('#alkamV12FinalTestModal');if(el)return el;el=document.createElement('div');el.id='alkamV12FinalTestModal';el.className='alkam-final-modal';el.innerHTML='<div class="alkam-final-box"><div class="alkam-final-head"><div><b>v12 Final Canlı Test</b><small>Anlık güvenli kontrol: ağır test çağırmaz, kilitlemez, veri yazmaz.</small></div><button class="alkam-final-close">×</button></div><div class="alkam-final-body" id="alkamFinalBody"></div></div>';document.body.appendChild(el);q('.alkam-final-close',el).onclick=function(){el.classList.remove('open')};return el}
  function copy(){var t=JSON.stringify(window.__ALKAM_V12_FINAL_TEST_LAST||instantRun(),null,2);if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t);return {ok:true,chars:t.length,time:new Date().toISOString()}}
  function paint(r){var body=q('#alkamFinalBody');if(!body)return r;var mod=r.modules||{};var okCount=Object.keys(mod).filter(function(k){return mod[k]}).length;body.innerHTML='<div class="alkam-final-note">Anlık kontrol tamamlandı. Ağır test çağrısı yok; sayfa kilitlenmez.</div><div class="alkam-final-actions"><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.render()">Anlık Kontrol</button><button class="secondary" onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.runControlled()">Sadece Layout Düzelt</button><button onclick="window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.copy()">Sonucu Kopyala</button></div><div class="alkam-final-grid"><div class="alkam-final-card"><b>Modül</b><span>'+okCount+'/8</span></div><div class="alkam-final-card"><b>Write</b><span>'+(r.writeAllowed||r.writeOpen?'Açık':'Kapalı')+'</span></div><div class="alkam-final-card"><b>Layout</b><span>'+(mod.layoutFix?'OK':'Eksik')+'</span></div><div class="alkam-final-card"><b>Modal</b><span>'+(mod.modalFix?'OK':'Eksik')+'</span></div></div><pre class="alkam-final-pre">'+esc(JSON.stringify(r,null,2))+'</pre>';return r}
  function render(){css();modal();return paint(instantRun())}
  function runControlled(){return paint(controlledRun())}
  function open(){css();modal().classList.add('open');return render()}
  function boot(){setTimeout(function(){css();modal()},4300)}
  window.ALKAM_V12_FINAL_TEST_RUNNER_V1={version:VERSION,run:instantRun,test:instantRun,runControlled:runControlled,open:open,render:render,copy:copy,last:function(){return window.__ALKAM_V12_FINAL_TEST_LAST||instantRun()},runBoot:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
