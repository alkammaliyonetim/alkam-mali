(function(){
  'use strict';
  var VERSION='ALKAM v12 Preflight Export v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function safe(fn,fb){try{return fn()}catch(e){return fb}}
  function collect(){
    var pre=safe(function(){return window.ALKAM_V12_PREFLIGHT_V1.test()},null);
    var dash=safe(function(){return window.ALKAM_DASHBOARD_KURUMSAL_V11.test()},null);
    var live=safe(function(){return window.ALKAM_CANLI_TEST_PAKETI_V11.test()},null);
    var cache=safe(function(){return window.ALKAM_CACHE_DEPLOY_KONTROL_V11.test()},null);
    var gate=safe(function(){return window.ALKAM_SUPABASE_WRITE_GATE_V10.test()},null);
    var result={version:VERSION,preflight:pre,dashboard:dash,liveTest:live,cacheDeploy:cache,writeGate:gate,security:'AI kayıt yapmaz, Supabase yazma kapalıdır, cari ekstresi ana defterdir, Moka United banka aktarımı cari tahsilatı sayılmaz.',time:new Date().toISOString()};
    window.__ALKAM_V12_PREFLIGHT_EXPORT_LAST=result;
    return result;
  }
  function text(){return JSON.stringify(collect(),null,2)}
  function copy(){
    var t=text();
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t)}
    window.__ALKAM_V12_PREFLIGHT_EXPORT_TEXT=t;
    return {ok:true,chars:t.length,time:new Date().toISOString()};
  }
  function download(){
    var t=text();
    var blob=new Blob([t],{type:'application/json;charset=utf-8'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='alkam-v12-preflight-sonuc-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.json';
    document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
    return {ok:true,download:a.download,time:new Date().toISOString()};
  }
  function css(){
    if(q('#alkam-v12-export-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-export-style';
    st.textContent='.alkam-v12-export-modal{position:fixed;inset:0;z-index:1000033;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-v12-export-modal.open{display:flex}.alkam-v12-export-box{width:min(980px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-v12-export-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-v12-export-head b{font-size:18px;color:#0f172a}.alkam-v12-export-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-v12-export-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-v12-export-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-v12-export-note{background:#ecfdf5;border:1px solid #bbf7d0;color:#047857;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:950}.alkam-v12-export-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-v12-export-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-v12-export-pre{background:#0f172a;color:#e5e7eb;border-radius:14px;padding:12px;white-space:pre-wrap;font-size:12px;line-height:1.45;max-height:520px;overflow:auto}@media(max-width:900px){.alkam-v12-export-pre{font-size:11px}}';
    document.head.appendChild(st);
  }
  function modal(){
    var el=q('#alkamV12PreflightExportModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamV12PreflightExportModal'; el.className='alkam-v12-export-modal';
    el.innerHTML='<div class="alkam-v12-export-box"><div class="alkam-v12-export-head"><div><b>v12 Preflight Sonuç Export</b><small>Preflight, canlı test, cache ve yazma kapısı sonucunu tek JSON olarak verir. Veri yazmaz.</small></div><button class="alkam-v12-export-close">×</button></div><div class="alkam-v12-export-body" id="alkamV12ExportBody"></div></div>';
    document.body.appendChild(el); q('.alkam-v12-export-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(), body=q('#alkamV12ExportBody',el), t=text();
    body.innerHTML='<div class="alkam-v12-export-note">Bu çıktı canlı test sonucunu kayıt altına almak için kullanılabilir. Veri yazmaz.</div><div class="alkam-v12-export-actions"><button onclick="window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.copy()">Kopyala</button><button onclick="window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.download()">JSON İndir</button><button onclick="window.ALKAM_V12_PREFLIGHT_EXPORT_V1&&ALKAM_V12_PREFLIGHT_EXPORT_V1.render()">Yenile</button></div><pre class="alkam-v12-export-pre">'+t.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</pre>';
    return collect();
  }
  function open(){css();modal().classList.add('open');render()}
  function boot(){setTimeout(function(){modal()},4200)}
  window.ALKAM_V12_PREFLIGHT_EXPORT_V1={version:VERSION,collect:collect,text:text,copy:copy,download:download,open:open,render:render,test:function(){var r=collect();return {version:VERSION,ready:!!(r.preflight&&r.preflight.ready),hasPreflight:!!r.preflight,hasLiveTest:!!r.liveTest,hasWriteGate:!!r.writeGate,time:new Date().toISOString()}},last:function(){return window.__ALKAM_V12_PREFLIGHT_EXPORT_LAST||collect()},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
