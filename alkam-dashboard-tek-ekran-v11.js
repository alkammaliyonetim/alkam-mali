(function(){
  'use strict';
  var VERSION='ALKAM Tek Ekran Dashboard v11.11';
  function q(s,r){return (r||document).querySelector(s)}
  var HIDE_SELECTORS=[
    '#alkamBusinessAuditPanel',
    '#alkamAuditTrailDashboardCard',
    '.alkam-business-audit-panel',
    '.business-audit-panel',
    '.audit-trail-dashboard-card'
  ];
  function css(){
    if(q('#alkam-dashboard-tek-ekran-style'))return;
    var st=document.createElement('style');
    st.id='alkam-dashboard-tek-ekran-style';
    st.textContent=HIDE_SELECTORS.join(',')+'{display:none!important;visibility:hidden!important}.alkam-tek-ekran-note{margin:8px 0 0;color:#64748b;font-size:12px;font-weight:850}.alkam-corp-wrap{max-width:1280px;margin-left:auto!important;margin-right:auto!important}.alkam-corp-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}.alkam-corp-card{min-height:68px!important}.alkam-corp-card span{font-size:18px!important}.alkam-corp-actions{padding-top:2px}@media(max-width:900px){.alkam-corp-grid{grid-template-columns:1fr!important}}';
    document.head.appendChild(st);
  }
  function annotate(){
    css();
    var dash=q('#alkamCorporateDashboard');
    if(!dash)return false;
    if(!q('#alkamTekEkranNote',dash)){
      var note=document.createElement('div');
      note.id='alkamTekEkranNote';
      note.className='alkam-tek-ekran-note';
      note.textContent='Tek ekran modu aktif: ayrıntılar menülerde, ana ekranda sadece yönetim özeti gösterilir.';
      var actions=q('.alkam-corp-actions',dash);
      if(actions)actions.insertAdjacentElement('afterend',note); else dash.appendChild(note);
    }
    window.__ALKAM_TEK_EKRAN_LAST={version:VERSION,dashboard:true,note:true,time:new Date().toISOString()};
    return true;
  }
  function hideNoise(){HIDE_SELECTORS.forEach(function(s){document.querySelectorAll(s).forEach(function(el){el.style.display='none'})})}
  function run(){css();hideNoise();annotate()}
  function boot(){setTimeout(run,2800)}
  window.ALKAM_DASHBOARD_TEK_EKRAN_V11={version:VERSION,run:run,annotate:annotate,test:function(){run();return {version:VERSION,dashboard:!!q('#alkamCorporateDashboard'),note:!!q('#alkamTekEkranNote'),time:new Date().toISOString()}},last:function(){return window.__ALKAM_TEK_EKRAN_LAST||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(run,7000);
})();
