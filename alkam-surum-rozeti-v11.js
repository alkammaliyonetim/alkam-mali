(function(){
  'use strict';
  var VERSION='ALKAM Sürüm Rozeti v11.17';
  var BUILD='v11.17 - 05.05.2026';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-surum-rozeti-style'))return;
    var st=document.createElement('style');st.id='alkam-surum-rozeti-style';
    st.textContent='.alkam-version-badge{position:fixed;left:14px;bottom:14px;z-index:1000029;background:#0f172a;color:#fff;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 40px rgba(15,23,42,.25);border-radius:999px;padding:8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:950;letter-spacing:.1px}.alkam-version-badge small{opacity:.72;margin-left:6px;font-weight:850}@media(max-width:900px){.alkam-version-badge{left:10px;bottom:72px;font-size:10px;padding:7px 10px}}@media print{.alkam-version-badge{display:none!important}}';
    document.head.appendChild(st);
  }
  function render(){
    css();
    var el=q('#alkamVersionBadge');
    if(!el){el=document.createElement('div');el.id='alkamVersionBadge';el.className='alkam-version-badge';document.body.appendChild(el)}
    el.innerHTML='ALKAM Mali <small>'+BUILD+'</small>';
    window.__ALKAM_SURUM_ROZETI_LAST={version:VERSION,build:BUILD,visible:true,time:new Date().toISOString()};
    return window.__ALKAM_SURUM_ROZETI_LAST;
  }
  function boot(){setTimeout(render,2500)}
  window.ALKAM_SURUM_ROZETI_V11={version:VERSION,build:BUILD,render:render,run:boot,test:function(){return render()},last:function(){return window.__ALKAM_SURUM_ROZETI_LAST||render()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(render,30000);
})();
