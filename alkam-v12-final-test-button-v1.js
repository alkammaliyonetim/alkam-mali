(function(){
  'use strict';
  var VERSION='ALKAM v12 Final Test Button v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function css(){
    if(q('#alkam-v12-final-button-style'))return;
    var st=document.createElement('style');
    st.id='alkam-v12-final-button-style';
    st.textContent='.alkam-v12-final-btn{position:fixed;right:14px;bottom:14px;z-index:1000035;height:38px;border:0;border-radius:999px;background:#1769e8;color:#fff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:950;padding:0 14px;box-shadow:0 18px 40px rgba(15,23,42,.24);cursor:pointer}.alkam-v12-final-btn small{opacity:.82;margin-left:5px;font-weight:850}@media(max-width:900px){.alkam-v12-final-btn{right:10px;bottom:118px;height:36px;font-size:11px;padding:0 12px}}@media print{.alkam-v12-final-btn{display:none!important}}';
    document.head.appendChild(st);
  }
  function run(){
    if(window.ALKAM_V12_FINAL_TEST_RUNNER_V1&&ALKAM_V12_FINAL_TEST_RUNNER_V1.open){
      ALKAM_V12_FINAL_TEST_RUNNER_V1.open();
      return true;
    }
    alert('Final Test Runner henüz yüklenmedi. Sayfayı sert yenileyip tekrar deneyin.');
    return false;
  }
  function render(){
    css();
    var btn=q('#alkamV12FinalTestButton');
    if(!btn){btn=document.createElement('button');btn.id='alkamV12FinalTestButton';btn.className='alkam-v12-final-btn';btn.type='button';document.body.appendChild(btn)}
    btn.innerHTML='Final Test <small>v12</small>';
    btn.onclick=run;
    window.__ALKAM_V12_FINAL_TEST_BUTTON_LAST={version:VERSION,visible:true,runner:!!window.ALKAM_V12_FINAL_TEST_RUNNER_V1,time:new Date().toISOString()};
    return window.__ALKAM_V12_FINAL_TEST_BUTTON_LAST;
  }
  function boot(){setTimeout(render,4800);setInterval(render,30000)}
  window.ALKAM_V12_FINAL_TEST_BUTTON_V1={version:VERSION,render:render,run:run,test:function(){return render()},last:function(){return window.__ALKAM_V12_FINAL_TEST_BUTTON_LAST||render()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
