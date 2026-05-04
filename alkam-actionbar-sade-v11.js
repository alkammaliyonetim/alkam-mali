(function(){
  'use strict';
  var VERSION='ALKAM Action Bar Sade v11.7';
  var HIDE_IDS=['alkamABAiHata','alkamABBelgeOnizleme','alkamABAiRapor','alkamABVergiSavunma','alkamABBelgeOnayOneri','alkamABMukellefAi','alkamABSupabaseTest','alkamABSupabaseRO','alkamABSupabaseCompare','alkamABWriteGate','alkamABSupabaseConfigGuard','alkamABMigrationPrecheck','alkamABLoaderKontrol','alkamABModuleRegistry','alkamABManifest','alkamABLocalStorageExport'];
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-actionbar-sade-style'))return;
    var st=document.createElement('style');st.id='alkam-actionbar-sade-style';
    st.textContent=HIDE_IDS.map(function(id){return '#'+id}).join(',')+'{display:none!important;visibility:hidden!important}.alkam-sade-menu{position:fixed;right:22px;bottom:128px;z-index:1000026;font-family:Arial,Helvetica,sans-serif}.alkam-sade-menu>button{height:40px;border:0;border-radius:999px;background:#0f172a;color:#fff;font-weight:950;padding:0 14px;box-shadow:0 18px 42px rgba(15,23,42,.24);cursor:pointer}.alkam-sade-panel{display:none;position:absolute;right:0;bottom:48px;width:280px;background:#fff;border:1px solid #dbe4f0;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,.25);padding:10px}.alkam-sade-panel.open{display:block}.alkam-sade-panel b{display:block;color:#0f172a;font-size:13px;margin:4px 4px 8px}.alkam-sade-panel button{width:100%;height:34px;border:0;border-radius:10px;background:#f1f5f9;color:#0f172a;font-weight:950;margin:4px 0;cursor:pointer;text-align:left;padding:0 10px}@media(max-width:900px){.alkam-sade-menu{left:12px;right:auto;bottom:128px}.alkam-sade-panel{left:0;right:auto}}';
    document.head.appendChild(st);
  }
  function openModule(key){var obj=window[key]; if(obj&&obj.open)obj.open();}
  function render(){
    css();
    var el=q('#alkamSadeMenu');
    if(!el){
      el=document.createElement('div'); el.id='alkamSadeMenu'; el.className='alkam-sade-menu';
      el.innerHTML='<button id="alkamSadeMenuBtn">Modül Menüsü</button><div id="alkamSadePanel" class="alkam-sade-panel"><b>Toplu Modül Erişimi</b><button data-k="ALKAM_AI_ASISTAN_MERKEZI_V11">AI Asistan Merkezi</button><button data-k="ALKAM_PROFESSIONAL_UI_V1">Kontrol Merkezi</button><button data-k="ALKAM_GUVENILIRLIK_RAPORU_V9">Güvenilirlik Raporu</button><button data-k="ALKAM_MODUL_REGISTRY_V10">Modül Registry</button><button data-k="ALKAM_SUPABASE_COMPARE_UI_V10">Supabase Karşılaştırma</button><button data-k="ALKAM_SUPABASE_WRITE_GATE_V10">Yazma Kapısı</button></div>';
      document.body.appendChild(el);
      q('#alkamSadeMenuBtn',el).onclick=function(){q('#alkamSadePanel',el).classList.toggle('open')};
      Array.prototype.slice.call(el.querySelectorAll('button[data-k]')).forEach(function(b){b.onclick=function(){q('#alkamSadePanel',el).classList.remove('open');openModule(b.getAttribute('data-k'))}});
    }
    HIDE_IDS.forEach(function(id){var b=q('#'+id); if(b)b.style.display='none'});
    window.__ALKAM_ACTIONBAR_SADE_LAST={version:VERSION,hidden:HIDE_IDS.length,menu:!!q('#alkamSadeMenu'),time:new Date().toISOString()};
    return window.__ALKAM_ACTIONBAR_SADE_LAST;
  }
  function boot(){setTimeout(render,2200)}
  window.ALKAM_ACTIONBAR_SADE_V11={version:VERSION,render:render,run:boot,test:function(){return render()},last:function(){return window.__ALKAM_ACTIONBAR_SADE_LAST||render()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(render,4000);
})();
