(function(){
  'use strict';
  var VERSION='ALKAM v12 Wide Layout Fix v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function css(){
    if(q('#alkam-v12-wide-layout-fix-style'))return;
    var st=document.createElement('style');
    st.id='alkam-v12-wide-layout-fix-style';
    st.textContent=[
      ':root{--alkam-sidebar-w:108px;--alkam-content-pad:14px;--alkam-section-radius:14px}',
      'html,body{width:100%!important;max-width:none!important;overflow-x:hidden!important;background:#f4f7fb!important}',
      '.layout{width:100%!important;max-width:none!important;grid-template-columns:var(--alkam-sidebar-w) minmax(0,1fr)!important}',
      '.sidebar{width:var(--alkam-sidebar-w)!important;min-width:var(--alkam-sidebar-w)!important}',
      '.main{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding:0 var(--alkam-content-pad) 18px!important;box-sizing:border-box!important;overflow-x:hidden!important}',
      '.erp-modulebar{margin-left:calc(var(--alkam-content-pad) * -1)!important;margin-right:calc(var(--alkam-content-pad) * -1)!important;width:auto!important;max-width:none!important}',
      '.topbar,.tab-page,.tab-page.active,#alkamCorporateDashboard,.alkam-corp-wrap,.section,.card{max-width:none!important;box-sizing:border-box!important}',
      '#alkamCorporateDashboard,.alkam-corp-wrap{width:100%!important;margin:10px 0 12px!important}',
      '.tab-page.active{width:100%!important;margin:0!important;padding:0!important}',
      '.section{width:100%!important;margin-left:0!important;margin-right:0!important;border-radius:var(--alkam-section-radius)!important}',
      '#tab-cariler>.grid-2{grid-template-columns:minmax(260px,320px) minmax(0,1fr)!important;gap:12px!important;width:100%!important}',
      '#tab-cari-toplu-tahakkuk,#tab-toplu-tahakkuk,.tab-page.active:has(.section-title){width:100%!important}',
      '#selectedCariDetail,.cari-detail-scroll{width:100%!important;max-width:none!important}',
      '.cards,.grid-4,.alkam-corp-grid{width:100%!important;max-width:none!important}',
      '.alkam-corp-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}',
      '.toolbar{width:100%!important}',
      '.cari-list-scroll{max-height:calc(100vh - 318px)!important}',
      '.cari-detail-scroll{max-height:calc(100vh - 206px)!important}',
      '@media(min-width:1500px){#tab-cariler>.grid-2{grid-template-columns:minmax(270px,340px) minmax(0,1fr)!important}.main{--alkam-content-pad:16px}}',
      '@media(max-width:1280px){.layout{grid-template-columns:1fr!important}.sidebar{width:auto!important;min-width:0!important}.main{padding:0 12px 18px!important}.erp-modulebar{margin-left:-12px!important;margin-right:-12px!important}#tab-cariler>.grid-2{grid-template-columns:1fr!important}.alkam-corp-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}',
      '@media(max-width:760px){.alkam-corp-grid,.cards,.grid-4{grid-template-columns:1fr!important}.main{padding:0 10px 16px!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function normalize(){
    css();
    var corp=q('#alkamCorporateDashboard');
    if(corp){corp.style.width='100%';corp.style.maxWidth='none';corp.style.marginLeft='0';corp.style.marginRight='0'}
    qa('.tab-page.active,.section').forEach(function(el){el.style.maxWidth='none'});
    window.__ALKAM_V12_WIDE_LAYOUT_LAST={version:VERSION,corp:!!corp,activeTab:!!q('.tab-page.active'),time:new Date().toISOString()};
    return window.__ALKAM_V12_WIDE_LAYOUT_LAST;
  }
  function boot(){normalize();setInterval(normalize,3000);try{new MutationObserver(function(){normalize()}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']})}catch(e){}}
  window.ALKAM_V12_WIDE_LAYOUT_FIX_V1={version:VERSION,run:normalize,test:function(){return normalize()},last:function(){return window.__ALKAM_V12_WIDE_LAYOUT_LAST||normalize()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
