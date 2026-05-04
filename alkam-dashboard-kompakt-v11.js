(function(){
  'use strict';
  var VERSION='ALKAM Dashboard Kompakt v11.21';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-dashboard-kompakt-style'))return;
    var st=document.createElement('style');
    st.id='alkam-dashboard-kompakt-style';
    st.textContent='.alkam-corp-wrap.compact .alkam-corp-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}.alkam-corp-wrap.compact .alkam-corp-card{min-height:58px!important;padding:10px!important}.alkam-corp-wrap.compact .alkam-corp-card span{font-size:17px!important;margin-top:5px!important}.alkam-corp-wrap.compact .alkam-corp-card small{font-size:11px!important}.alkam-corp-wrap.compact .alkam-corp-actions{margin-top:10px!important}.alkam-corp-wrap.compact .alkam-corp-head{margin-bottom:10px!important}.alkam-corp-wrap.compact .alkam-corp-head h2{font-size:20px!important}.alkam-corp-wrap.compact .alkam-corp-head p{font-size:11px!important}.alkam-kompakt-toggle{height:30px;border:0;border-radius:10px;background:#e8eef9;color:#0f172a;font-weight:950;padding:0 10px;cursor:pointer;margin-left:6px}@media(max-width:900px){.alkam-corp-wrap.compact .alkam-corp-grid{grid-template-columns:1fr!important}}';
    document.head.appendChild(st);
  }
  function state(){return localStorage.getItem('alkam_dashboard_kompakt')!=='0'}
  function setState(v){localStorage.setItem('alkam_dashboard_kompakt',v?'1':'0');apply();return v}
  function apply(){
    css();
    var dash=q('#alkamCorporateDashboard');
    if(!dash)return false;
    dash.classList.toggle('compact',state());
    if(!q('#alkamKompaktToggle',dash)){
      var btn=document.createElement('button');
      btn.id='alkamKompaktToggle';
      btn.className='alkam-kompakt-toggle';
      btn.type='button';
      btn.onclick=function(){setState(!state());btn.textContent=state()?'Kompakt Açık':'Kompakt Kapalı'};
      btn.textContent=state()?'Kompakt Açık':'Kompakt Kapalı';
      var badges=q('.alkam-corp-badges',dash);
      if(badges)badges.appendChild(btn); else dash.appendChild(btn);
    } else {
      q('#alkamKompaktToggle',dash).textContent=state()?'Kompakt Açık':'Kompakt Kapalı';
    }
    window.__ALKAM_DASHBOARD_KOMPAKT_LAST={version:VERSION,compact:state(),dashboard:true,time:new Date().toISOString()};
    return true;
  }
  function boot(){setTimeout(apply,3200)}
  window.ALKAM_DASHBOARD_KOMPAKT_V11={version:VERSION,apply:apply,run:boot,set:setState,get:state,test:function(){return {version:VERSION,applied:apply(),compact:state(),dashboard:!!q('#alkamCorporateDashboard'),time:new Date().toISOString()}},last:function(){return window.__ALKAM_DASHBOARD_KOMPAKT_LAST||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(apply,8000);
})();
