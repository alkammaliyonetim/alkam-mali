(function(){
  'use strict';
  var VERSION='ALKAM Dashboard Görünüm Tercihi v11.27';
  var KEY='alkam_dashboard_view_mode';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-dashboard-view-style'))return;
    var st=document.createElement('style');
    st.id='alkam-dashboard-view-style';
    st.textContent='.alkam-view-select{height:30px;border:0;border-radius:10px;background:#fff;color:#0f172a;font-weight:950;padding:0 8px;cursor:pointer;margin-left:6px;border:1px solid #cbd5e1}.alkam-view-note{font-size:11px;color:#64748b;font-weight:850;margin-top:4px}#alkamKompaktToggle,#alkamUltraToggle{display:none!important;visibility:hidden!important}@media(max-width:900px){.alkam-view-select{margin-left:0;margin-top:6px}}';
    document.head.appendChild(st);
  }
  function getMode(){return localStorage.getItem(KEY)||'compact'}
  function setMode(mode){
    if(['normal','compact','ultra'].indexOf(mode)===-1)mode='compact';
    localStorage.setItem(KEY,mode);
    localStorage.setItem('alkam_dashboard_kompakt',mode==='compact'||mode==='ultra'?'1':'0');
    localStorage.setItem('alkam_dashboard_ultra',mode==='ultra'?'1':'0');
    apply();
    return mode;
  }
  function hideOldToggles(){
    var a=q('#alkamKompaktToggle'); if(a)a.style.display='none';
    var b=q('#alkamUltraToggle'); if(b)b.style.display='none';
  }
  function apply(){
    css();
    var dash=q('#alkamCorporateDashboard');
    if(!dash)return false;
    var mode=getMode();
    dash.classList.toggle('compact',mode==='compact'||mode==='ultra');
    dash.classList.toggle('ultra',mode==='ultra');
    localStorage.setItem('alkam_dashboard_kompakt',mode==='compact'||mode==='ultra'?'1':'0');
    localStorage.setItem('alkam_dashboard_ultra',mode==='ultra'?'1':'0');
    var badges=q('.alkam-corp-badges',dash);
    if(badges&&!q('#alkamViewModeSelect',dash)){
      var sel=document.createElement('select');
      sel.id='alkamViewModeSelect';
      sel.className='alkam-view-select';
      sel.title='Dashboard görünüm modu';
      sel.innerHTML='<option value="normal">Normal</option><option value="compact">Kompakt</option><option value="ultra">Ultra</option>';
      sel.value=mode;
      sel.onchange=function(){setMode(sel.value)};
      badges.appendChild(sel);
    } else if(q('#alkamViewModeSelect',dash)){
      q('#alkamViewModeSelect',dash).value=mode;
    }
    hideOldToggles();
    window.__ALKAM_DASHBOARD_GORUNUM_LAST={version:VERSION,mode:mode,dashboard:true,selector:!!q('#alkamViewModeSelect'),oldTogglesHidden:true,time:new Date().toISOString()};
    return true;
  }
  function boot(){setTimeout(function(){if(!localStorage.getItem(KEY))setMode('compact');else apply();},3600)}
  window.ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11={version:VERSION,get:getMode,set:setMode,apply:apply,hideOldToggles:hideOldToggles,run:boot,test:function(){return {version:VERSION,applied:apply(),mode:getMode(),dashboard:!!q('#alkamCorporateDashboard'),selector:!!q('#alkamViewModeSelect'),oldTogglesHidden:true,time:new Date().toISOString()}},last:function(){return window.__ALKAM_DASHBOARD_GORUNUM_LAST||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(apply,7000);
})();
