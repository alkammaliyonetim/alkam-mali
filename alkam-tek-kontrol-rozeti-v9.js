(function(){
  'use strict';
  var VERSION='ALKAM Tek Kontrol Rozeti v9.5';
  function q(s,r){return (r||document).querySelector(s)}
  function safe(fn,fb){try{return fn()}catch(e){return fb}}
  function state(){
    var daily=safe(function(){return window.ALKAM_GUNLUK_KONTROL_V9&&ALKAM_GUNLUK_KONTROL_V9.last?ALKAM_GUNLUK_KONTROL_V9.last():null},null)||{};
    var health=safe(function(){return window.ALKAM_SAGLIK_KONTROL_V9&&ALKAM_SAGLIK_KONTROL_V9.last?ALKAM_SAGLIK_KONTROL_V9.last():null},null)||{};
    var critical=safe(function(){return window.ALKAM_KRITIK_UYARI_V9&&ALKAM_KRITIK_UYARI_V9.last?ALKAM_KRITIK_UYARI_V9.last():null},null)||{};
    var banka=safe(function(){return window.ALKAM_BANKA_ONAY_V8&&ALKAM_BANKA_ONAY_V8.summary?ALKAM_BANKA_ONAY_V8.summary():null},null)||{};
    var score=Number(daily.score||100);
    var status=score>=90&&critical.status!=='bad'&&(!health.fail)?'ok':(score>=70&&critical.status!=='bad'?'warn':'bad');
    var label=status==='ok'?'Sistem Güvenli':(status==='warn'?'Kontrol Gerekir':'Kritik Kontrol');
    var detail='Skor '+score+' · Sağlık '+(health.ok||0)+'/'+(health.total||0)+' · Banka onay '+(banka.onayBekleyen||0);
    return {version:VERSION,status:status,label:label,detail:detail,daily:daily,health:health,critical:critical,banka:banka,time:new Date().toISOString()};
  }
  function css(){
    if(q('#alkam-tek-kontrol-style'))return;
    var st=document.createElement('style');st.id='alkam-tek-kontrol-style';
    st.textContent='#alkamCriticalBadge,#alkamHealthBadge,#alkamDailyControlBadge{display:none!important;visibility:hidden!important}#alkamUnifiedControlBadge{position:fixed;right:22px;bottom:76px;z-index:1000000;border:0;border-radius:999px;min-height:44px;padding:0 16px;font-family:Arial,Helvetica,sans-serif;font-weight:950;box-shadow:0 18px 42px rgba(15,23,42,.24);cursor:pointer;display:flex;align-items:center;gap:10px}#alkamUnifiedControlBadge.ok{background:#dcfce7;color:#047857}#alkamUnifiedControlBadge.warn{background:#ffedd5;color:#9a3412}#alkamUnifiedControlBadge.bad{background:#fee2e2;color:#991b1b}#alkamUnifiedControlBadge span{font-size:13px;font-weight:950}#alkamUnifiedControlBadge small{font-size:11px;font-weight:900;opacity:.88}@media(max-width:900px){#alkamUnifiedControlBadge{left:12px;right:12px;bottom:78px;justify-content:center}}';
    document.head.appendChild(st);
  }
  function render(){
    css();
    var s=state();
    var b=q('#alkamUnifiedControlBadge');
    if(!b){b=document.createElement('button');b.id='alkamUnifiedControlBadge';b.type='button';document.body.appendChild(b)}
    b.className=s.status;
    b.innerHTML='<span>'+s.label+'</span><small>'+s.detail+'</small>';
    b.title=s.detail;
    b.onclick=function(){
      if(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.open)ALKAM_GUVENILIRLIK_RAPORU_V9.open();
      else if(window.ALKAM_PROFESSIONAL_UI_V1&&ALKAM_PROFESSIONAL_UI_V1.open)ALKAM_PROFESSIONAL_UI_V1.open();
    };
    window.__ALKAM_UNIFIED_CONTROL_LAST=s;
    return s;
  }
  function run(){render()}
  window.ALKAM_TEK_KONTROL_ROZETI_V9={version:VERSION,state:state,render:render,run:run,last:function(){return window.__ALKAM_UNIFIED_CONTROL_LAST||state()},test:function(){var s=render();return {version:VERSION,badge:!!q('#alkamUnifiedControlBadge'),status:s.status,detail:s.detail,oldBadgesHidden:true,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(render,5000);
})();
