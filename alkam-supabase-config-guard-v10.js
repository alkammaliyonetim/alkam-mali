(function(){
  'use strict';
  var VERSION='ALKAM Supabase Config Guard v10.11';
  function q(s,r){return (r||document).querySelector(s)}
  function cfg(){return window.ALKAM_SUPABASE_CONFIG||null}
  function check(){
    var c=cfg();
    var issues=[];
    var warnings=[];
    if(!c){issues.push('Config bulunamadı');}
    if(c){
      if(!c.url)issues.push('Supabase URL boş');
      if(!c.publishableKey)issues.push('Publishable key boş');
      if(c.url&&c.url.indexOf('YOUR_PROJECT_ID')>-1)warnings.push('URL hâlâ şablon');
      if(c.publishableKey&&c.publishableKey.indexOf('YOUR_PUBLIC')>-1)warnings.push('Key hâlâ şablon');
      var key=String(c.publishableKey||'');
      if(/service_role/i.test(key))issues.push('Service role ifadesi şüpheli');
      if(/secret/i.test(key))issues.push('Secret ifadesi şüpheli');
      if(c.mode!=='read_only_test')warnings.push('Mode read_only_test değil');
      if(c.enabled&&c.mode!=='read_only_test')issues.push('Enabled true ama mode güvenli değil');
    }
    return {version:VERSION,config:!!c,enabled:!!(c&&c.enabled),mode:c&&c.mode||'not_configured',issues:issues,warnings:warnings,ok:issues.length===0,time:new Date().toISOString()};
  }
  function css(){if(q('#alkam-supa-config-guard-style'))return;var st=document.createElement('style');st.id='alkam-supa-config-guard-style';st.textContent='.alkam-cfg-modal{position:fixed;inset:0;z-index:1000018;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-cfg-modal.open{display:flex}.alkam-cfg-box{width:min(760px,100%);max-height:88vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-cfg-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-cfg-head b{font-size:18px;color:#0f172a}.alkam-cfg-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-cfg-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-cfg-body{padding:16px 18px;overflow:auto;max-height:calc(88vh - 72px)}.alkam-cfg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.alkam-cfg-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-cfg-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-cfg-card span{display:block;margin-top:6px;font-size:16px;font-weight:950}.alkam-cfg-result{border:1px solid #e2e8f0;border-radius:14px;background:#fbfdff;padding:12px;font-size:12px;font-weight:800;white-space:pre-wrap}.alkam-cfg-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-cfg-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}@media(max-width:900px){.alkam-cfg-grid{grid-template-columns:1fr}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamSupabaseConfigGuardModal');if(el)return el;el=document.createElement('div');el.id='alkamSupabaseConfigGuardModal';el.className='alkam-cfg-modal';el.innerHTML='<div class="alkam-cfg-box"><div class="alkam-cfg-head"><div><b>Supabase Config Guard</b><small>Public config güvenlik kontrolü. Secret/service role avlar.</small></div><button class="alkam-cfg-close">×</button></div><div class="alkam-cfg-body" id="alkamCfgGuardBody"></div></div>';document.body.appendChild(el);q('.alkam-cfg-close',el).onclick=function(){el.classList.remove('open')};return el}
  function render(){css();var el=modal(),body=q('#alkamCfgGuardBody',el),s=check();body.innerHTML='<div class="alkam-cfg-actions"><button onclick="window.ALKAM_SUPABASE_CONFIG_GUARD_V10&&ALKAM_SUPABASE_CONFIG_GUARD_V10.render()">Yenile</button></div><div class="alkam-cfg-grid"><div class="alkam-cfg-card"><b>Config</b><span>'+(s.config?'Var':'Yok')+'</span></div><div class="alkam-cfg-card"><b>Enabled</b><span>'+s.enabled+'</span></div><div class="alkam-cfg-card"><b>Mode</b><span>'+s.mode+'</span></div><div class="alkam-cfg-card"><b>Durum</b><span>'+(s.ok?'Temiz':'Risk')+'</span></div></div><div class="alkam-cfg-result">'+JSON.stringify(s,null,2)+'</div>';window.__ALKAM_SUPABASE_CONFIG_GUARD_LAST=s;return s}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABSupabaseConfigGuard',bar)){var b=document.createElement('button');b.id='alkamABSupabaseConfigGuard';b.type='button';b.textContent='Config Guard';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamSupabaseConfigGuardCard',body)){var s=check();body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamSupabaseConfigGuardCard"><b>Supabase Config Guard</b><div class="line">Issue: '+s.issues.length+' · Warning: '+s.warnings.length+' · Mode: '+s.mode+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SUPABASE_CONFIG_GUARD_V10&&ALKAM_SUPABASE_CONFIG_GUARD_V10.open()">Config Kontrol</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_SUPABASE_CONFIG_GUARD_V10={version:VERSION,check:check,test:check,open:open,render:render,last:function(){return window.__ALKAM_SUPABASE_CONFIG_GUARD_LAST||check()},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
