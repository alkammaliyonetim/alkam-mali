(function(){
  'use strict';
  var VERSION='ALKAM Dashboard Ultra Kompakt v11.23';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-dashboard-ultra-style'))return;
    var st=document.createElement('style');
    st.id='alkam-dashboard-ultra-style';
    st.textContent='.alkam-corp-wrap.ultra .alkam-corp-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important}.alkam-corp-wrap.ultra .alkam-corp-card{min-height:48px!important;padding:8px 10px!important;border-radius:13px!important}.alkam-corp-wrap.ultra .alkam-corp-card b{font-size:10px!important}.alkam-corp-wrap.ultra .alkam-corp-card span{font-size:15px!important;margin-top:4px!important}.alkam-corp-wrap.ultra .alkam-corp-card small{font-size:10px!important;margin-top:2px!important}.alkam-corp-wrap.ultra .alkam-corp-head{margin-bottom:8px!important}.alkam-corp-wrap.ultra .alkam-corp-head h2{font-size:18px!important}.alkam-corp-wrap.ultra .alkam-corp-head p{font-size:10px!important}.alkam-corp-wrap.ultra .alkam-corp-actions{margin-top:8px!important}.alkam-corp-wrap.ultra .alkam-corp-actions button{height:30px!important;font-size:11px!important}.alkam-ultra-toggle{height:30px;border:0;border-radius:10px;background:#0f172a;color:#fff;font-weight:950;padding:0 10px;cursor:pointer;margin-left:6px}@media(max-width:900px){.alkam-corp-wrap.ultra .alkam-corp-grid{grid-template-columns:1fr!important}}';
    document.head.appendChild(st);
  }
  function state(){return localStorage.getItem('alkam_dashboard_ultra')==='1'}
  function setState(v){localStorage.setItem('alkam_dashboard_ultra',v?'1':'0');apply();return v}
  function apply(){
    css();
    var dash=q('#alkamCorporateDashboard');
    if(!dash)return false;
    dash.classList.toggle('ultra',state());
    if(!q('#alkamUltraToggle',dash)){
      var btn=document.createElement('button');
      btn.id='alkamUltraToggle';
      btn.className='alkam-ultra-toggle';
      btn.type='button';
      btn.onclick=function(){setState(!state());btn.textContent=state()?'Ultra Açık':'Ultra Kapalı'};
      btn.textContent=state()?'Ultra Açık':'Ultra Kapalı';
      var badges=q('.alkam-corp-badges',dash);
      if(badges)badges.appendChild(btn); else dash.appendChild(btn);
    } else {
      q('#alkamUltraToggle',dash).textContent=state()?'Ultra Açık':'Ultra Kapalı';
    }
    window.__ALKAM_DASHBOARD_ULTRA_LAST={version:VERSION,ultra:state(),dashboard:true,time:new Date().toISOString()};
    return true;
  }
  function boot(){setTimeout(apply,3400)}
  window.ALKAM_DASHBOARD_ULTRA_KOMPAKT_V11={version:VERSION,apply:apply,run:boot,set:setState,get:state,test:function(){return {version:VERSION,applied:apply(),ultra:state(),dashboard:!!q('#alkamCorporateDashboard'),time:new Date().toISOString()}},last:function(){return window.__ALKAM_DASHBOARD_ULTRA_LAST||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(apply,9000);
})();
