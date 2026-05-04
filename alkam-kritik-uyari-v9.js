(function(){
  'use strict';
  var VERSION='ALKAM Kritik Uyarı v9.2';
  function q(s,r){return (r||document).querySelector(s)}
  function build(){
    var r=(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.build)?ALKAM_GUVENILIRLIK_RAPORU_V9.build():{};
    var dq=r.dataQuality||{}, bank=r.banka||{}, backups=r.backups||[];
    var errors=(dq.errors||[]).length||0;
    var warnings=(dq.warnings||[]).length||0;
    var pending=Number(bank.onayBekleyen||0);
    var status=errors?'bad':((warnings||pending)?'warn':'ok');
    var text=status==='bad'?'Kritik hata':(status==='warn'?'Kontrol bekliyor':'Güvenli');
    var detail=[];
    if(errors)detail.push(errors+' veri hatası');
    if(warnings)detail.push(warnings+' uyarı');
    if(pending)detail.push(pending+' banka onayı');
    if(!backups.length)detail.push('yedek yok');
    return {version:VERSION,status:status,text:text,detail:detail.join(' · ')||'Sistem kontrolleri temiz',time:new Date().toISOString()};
  }
  function css(){
    if(q('#alkam-kritik-uyari-style'))return;
    var st=document.createElement('style');st.id='alkam-kritik-uyari-style';
    st.textContent='#alkamCriticalBadge{position:fixed;right:22px;bottom:76px;z-index:999999;border:0;border-radius:999px;height:40px;padding:0 14px;font-weight:950;font-family:Arial,Helvetica,sans-serif;box-shadow:0 14px 34px rgba(15,23,42,.22);cursor:pointer;display:flex;align-items:center;gap:8px}#alkamCriticalBadge.ok{background:#dcfce7;color:#047857}#alkamCriticalBadge.warn{background:#ffedd5;color:#9a3412}#alkamCriticalBadge.bad{background:#fee2e2;color:#991b1b}#alkamCriticalBadge small{font-size:11px;font-weight:900;opacity:.9}@media(max-width:900px){#alkamCriticalBadge{left:12px;right:auto;bottom:124px}}';
    document.head.appendChild(st);
  }
  function render(){
    css();
    var info=build();
    var b=q('#alkamCriticalBadge');
    if(!b){b=document.createElement('button');b.id='alkamCriticalBadge';b.type='button';document.body.appendChild(b)}
    b.className=info.status;
    b.innerHTML='<span>'+info.text+'</span><small>'+info.detail+'</small>';
    b.title=info.detail;
    b.onclick=function(){if(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.open)ALKAM_GUVENILIRLIK_RAPORU_V9.open();else if(window.ALKAM_PROFESSIONAL_UI_V1&&ALKAM_PROFESSIONAL_UI_V1.open)ALKAM_PROFESSIONAL_UI_V1.open()};
    window.__ALKAM_KRITIK_UYARI_LAST=info;
    return info;
  }
  function run(){render()}
  window.ALKAM_KRITIK_UYARI_V9={version:VERSION,build:build,render:render,run:run,last:function(){return window.__ALKAM_KRITIK_UYARI_LAST||build()},test:function(){var x=render();return {version:VERSION,badge:!!q('#alkamCriticalBadge'),status:x.status,detail:x.detail,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(render,5000);
})();
