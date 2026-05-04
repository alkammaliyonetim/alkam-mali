(function(){
  'use strict';
  var VERSION='ALKAM v12 Preflight v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function safe(label,fn){try{return {label:label,ok:true,result:fn()}}catch(e){return {label:label,ok:false,error:e.message}}}
  function scan(){
    var items=[];
    items.push(safe('Cache Deploy',function(){return window.ALKAM_CACHE_DEPLOY_KONTROL_V11&&ALKAM_CACHE_DEPLOY_KONTROL_V11.test?ALKAM_CACHE_DEPLOY_KONTROL_V11.test():null}));
    items.push(safe('Dashboard',function(){return window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.test?ALKAM_DASHBOARD_KURUMSAL_V11.test():null}));
    items.push(safe('Canlı Test',function(){return window.ALKAM_CANLI_TEST_PAKETI_V11&&ALKAM_CANLI_TEST_PAKETI_V11.test?ALKAM_CANLI_TEST_PAKETI_V11.test():null}));
    items.push(safe('v12 Stabilizer',function(){return window.ALKAM_V12_STABILIZER_V1&&ALKAM_V12_STABILIZER_V1.test?ALKAM_V12_STABILIZER_V1.test():null}));
    items.push(safe('Supabase Write Gate',function(){return window.ALKAM_SUPABASE_WRITE_GATE_V10&&ALKAM_SUPABASE_WRITE_GATE_V10.test?ALKAM_SUPABASE_WRITE_GATE_V10.test():null}));
    var failed=items.filter(function(x){return !x.ok||!x.result}).length;
    var writeOpen=items.some(function(x){return x.result&&x.result.writeAllowed===true});
    var missing=items.some(function(x){return x.result&&typeof x.result.missing==='number'&&x.result.missing>0});
    var liveBad=items.some(function(x){return x.result&&((typeof x.result.failed==='number'&&x.result.failed>0)||(typeof x.result.risky==='number'&&x.result.risky>0))});
    var ready=!failed&&!writeOpen&&!missing&&!liveBad;
    var decision=ready?'v12 stabilizasyonuna geçilebilir':(writeOpen?'DUR: Supabase yazma açık':'Önce eksikler düzeltilecek');
    var result={version:VERSION,ready:ready,decision:decision,failed:failed,writeOpen:writeOpen,missing:missing,liveBad:liveBad,items:items,time:new Date().toISOString()};
    window.__ALKAM_V12_PREFLIGHT_LAST=result;
    return result;
  }
  function css(){
    if(q('#alkam-v12-preflight-style'))return;
    var st=document.createElement('style');st.id='alkam-v12-preflight-style';
    st.textContent='.alkam-preflight-modal{position:fixed;inset:0;z-index:1000032;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-preflight-modal.open{display:flex}.alkam-preflight-box{width:min(1040px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-preflight-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-preflight-head b{font-size:18px;color:#0f172a}.alkam-preflight-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-preflight-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-preflight-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-preflight-note{border-radius:12px;padding:10px;margin-bottom:12px;font-weight:950}.alkam-preflight-note.ok{background:#ecfdf5;border:1px solid #bbf7d0;color:#047857}.alkam-preflight-note.bad{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412}.alkam-preflight-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-preflight-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-preflight-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-preflight-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-preflight-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-preflight-card span{display:block;margin-top:6px;font-size:18px;font-weight:950}.alkam-preflight-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-preflight-table table{width:100%;border-collapse:collapse}.alkam-preflight-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-preflight-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800;vertical-align:top}.alkam-preflight-ok{color:#047857;font-weight:950}.alkam-preflight-bad{color:#b91c1c;font-weight:950}@media(max-width:900px){.alkam-preflight-grid{grid-template-columns:1fr}.alkam-preflight-table{overflow:auto}.alkam-preflight-table table{min-width:820px}}';
    document.head.appendChild(st);
  }
  function modal(){
    var el=q('#alkamV12PreflightModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamV12PreflightModal'; el.className='alkam-preflight-modal';
    el.innerHTML='<div class="alkam-preflight-box"><div class="alkam-preflight-head"><div><b>v12 Preflight Kontrol</b><small>v12 stabilizasyonuna geçmeden önce son karar kontrolü. Veri yazmaz.</small></div><button class="alkam-preflight-close">×</button></div><div class="alkam-preflight-body" id="alkamPreflightBody"></div></div>';
    document.body.appendChild(el); q('.alkam-preflight-close',el).onclick=function(){el.classList.remove('open')}; return el;
  }
  function render(){
    css(); var el=modal(), body=q('#alkamPreflightBody',el), r=scan();
    body.innerHTML='<div class="alkam-preflight-note '+(r.ready?'ok':'bad')+'">Karar: '+r.decision+'</div><div class="alkam-preflight-actions"><button onclick="window.ALKAM_V12_PREFLIGHT_V1&&ALKAM_V12_PREFLIGHT_V1.render()">Yenile</button><button onclick="window.ALKAM_CANLI_TEST_PAKETI_V11&&ALKAM_CANLI_TEST_PAKETI_V11.open&&ALKAM_CANLI_TEST_PAKETI_V11.open()">Canlı Test Aç</button><button onclick="window.ALKAM_V12_STABILIZER_V1&&ALKAM_V12_STABILIZER_V1.open&&ALKAM_V12_STABILIZER_V1.open()">v12 Stabil Aç</button></div><div class="alkam-preflight-grid"><div class="alkam-preflight-card"><b>Ready</b><span>'+(r.ready?'Evet':'Hayır')+'</span></div><div class="alkam-preflight-card"><b>Failed</b><span>'+r.failed+'</span></div><div class="alkam-preflight-card"><b>Write Open</b><span>'+(r.writeOpen?'Evet':'Hayır')+'</span></div><div class="alkam-preflight-card"><b>Live Bad</b><span>'+(r.liveBad?'Evet':'Hayır')+'</span></div></div><div class="alkam-preflight-table"><table><thead><tr><th>Kontrol</th><th>Durum</th><th>Özet</th></tr></thead><tbody>'+r.items.map(function(x){var ok=x.ok&&x.result;return '<tr><td>'+x.label+'</td><td class="'+(ok?'alkam-preflight-ok':'alkam-preflight-bad')+'">'+(ok?'OK':'Eksik')+'</td><td><pre style="white-space:pre-wrap;margin:0;font-family:inherit">'+JSON.stringify(x.result||x.error||null,null,2).slice(0,900)+'</pre></td></tr>'}).join('')+'</tbody></table></div>';
    return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function boot(){setTimeout(function(){modal()},4000)}
  window.ALKAM_V12_PREFLIGHT_V1={version:VERSION,scan:scan,test:scan,open:open,render:render,run:boot,last:function(){return window.__ALKAM_V12_PREFLIGHT_LAST||scan()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
