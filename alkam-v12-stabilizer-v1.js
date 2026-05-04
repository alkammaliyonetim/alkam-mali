(function(){
  'use strict';
  var VERSION='ALKAM v12 Stabilizer v1.0';
  var REQUIRED=[
    'ALKAM_DASHBOARD_KURUMSAL_V11',
    'ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11',
    'ALKAM_CACHE_DEPLOY_KONTROL_V11',
    'ALKAM_CANLI_TEST_PAKETI_V11',
    'ALKAM_AI_ASISTAN_MERKEZI_V11',
    'ALKAM_SUPABASE_WRITE_GATE_V10'
  ];
  function q(s,r){return (r||document).querySelector(s)}
  function safe(fn,fb){try{return fn()}catch(e){return fb}}
  function scan(){
    var mods=REQUIRED.map(function(k){return {key:k,active:!!window[k],version:window[k]&&window[k].version||'-'}});
    var dash=safe(function(){return window.ALKAM_DASHBOARD_KURUMSAL_V11.test()},null);
    var gate=safe(function(){return window.ALKAM_SUPABASE_WRITE_GATE_V10.test()},null);
    var live=safe(function(){return window.ALKAM_CANLI_TEST_PAKETI_V11.test()},null);
    var writeAllowed=!!(gate&&gate.writeAllowed===true);
    var missing=mods.filter(function(x){return !x.active}).length;
    var liveFailed=live&&typeof live.failed==='number'?live.failed:null;
    var status=writeAllowed?'ACİL: Yazma Açık':(missing?'Eksik Modül':(liveFailed&&liveFailed>0?'Canlı Test Eksik':'Stabil'));
    var result={version:VERSION,status:status,missing:missing,writeAllowed:writeAllowed,liveFailed:liveFailed,modules:mods,dashboard:dash,writeGate:gate,liveTest:live,time:new Date().toISOString()};
    window.__ALKAM_V12_STABILIZER_LAST=result;
    return result;
  }
  function css(){
    if(q('#alkam-v12-stabilizer-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-stabilizer-style';
    st.textContent='.alkam-v12-modal{position:fixed;inset:0;z-index:1000031;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-v12-modal.open{display:flex}.alkam-v12-box{width:min(980px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-v12-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-v12-head b{font-size:18px;color:#0f172a}.alkam-v12-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-v12-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-v12-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-v12-note{background:#ecfdf5;border:1px solid #bbf7d0;color:#047857;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:900}.alkam-v12-warn{background:#fff7ed;border-color:#fed7aa;color:#9a3412}.alkam-v12-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-v12-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-v12-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-v12-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-v12-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-v12-card span{display:block;margin-top:6px;font-size:18px;font-weight:950}.alkam-v12-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-v12-table table{width:100%;border-collapse:collapse}.alkam-v12-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-v12-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.alkam-v12-ok{color:#047857;font-weight:950}.alkam-v12-bad{color:#b91c1c;font-weight:950}@media(max-width:900px){.alkam-v12-grid{grid-template-columns:1fr}.alkam-v12-table{overflow:auto}.alkam-v12-table table{min-width:720px}}';
    document.head.appendChild(st);
  }
  function modal(){
    var el=q('#alkamV12StabilizerModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamV12StabilizerModal'; el.className='alkam-v12-modal';
    el.innerHTML='<div class="alkam-v12-box"><div class="alkam-v12-head"><div><b>v12 Stabilizer</b><small>v11 kapanışından v12 stabilizasyonuna geçiş kontrolü. Veri yazmaz.</small></div><button class="alkam-v12-close">×</button></div><div class="alkam-v12-body" id="alkamV12Body"></div></div>';
    document.body.appendChild(el); q('.alkam-v12-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(), body=q('#alkamV12Body',el), r=scan();
    var noteClass=r.writeAllowed?'alkam-v12-note alkam-v12-warn':'alkam-v12-note';
    body.innerHTML='<div class="'+noteClass+'">v12 stabilizasyon kontrolü: Bu ekran veri yazmaz. Supabase Write Gate kapalı kalmalıdır.</div><div class="alkam-v12-actions"><button onclick="window.ALKAM_V12_STABILIZER_V1&&ALKAM_V12_STABILIZER_V1.render()">Yenile</button><button onclick="window.ALKAM_CANLI_TEST_PAKETI_V11&&ALKAM_CANLI_TEST_PAKETI_V11.open&&ALKAM_CANLI_TEST_PAKETI_V11.open()">Canlı Test Aç</button><button onclick="window.ALKAM_CACHE_DEPLOY_KONTROL_V11&&ALKAM_CACHE_DEPLOY_KONTROL_V11.open&&ALKAM_CACHE_DEPLOY_KONTROL_V11.open()">Cache Kontrol Aç</button></div><div class="alkam-v12-grid"><div class="alkam-v12-card"><b>Durum</b><span>'+r.status+'</span></div><div class="alkam-v12-card"><b>Eksik</b><span>'+r.missing+'</span></div><div class="alkam-v12-card"><b>Write</b><span>'+(r.writeAllowed?'Açık':'Kapalı')+'</span></div><div class="alkam-v12-card"><b>Live Failed</b><span>'+(r.liveFailed==null?'-':r.liveFailed)+'</span></div></div><div class="alkam-v12-table"><table><thead><tr><th>Modül</th><th>Durum</th><th>Sürüm</th></tr></thead><tbody>'+r.modules.map(function(m){return '<tr><td>'+m.key+'</td><td class="'+(m.active?'alkam-v12-ok':'alkam-v12-bad')+'">'+(m.active?'OK':'Eksik')+'</td><td>'+m.version+'</td></tr>'}).join('')+'</tbody></table></div>';
    return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function boot(){setTimeout(function(){modal()},3800)}
  window.ALKAM_V12_STABILIZER_V1={version:VERSION,scan:scan,test:scan,open:open,render:render,run:boot,last:function(){return window.__ALKAM_V12_STABILIZER_LAST||scan()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
