(function(){
'use strict';
var VERSION='ALKAM Kritik Uyari v9.3 unified';
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
function render(){var b=q('#alkamCriticalBadge');if(b)b.remove();var info=build();window.__ALKAM_KRITIK_UYARI_LAST=info;return info}
function run(){return render()}
window.ALKAM_KRITIK_UYARI_V9={version:VERSION,build:build,render:render,run:run,last:function(){return window.__ALKAM_KRITIK_UYARI_LAST||build()},test:function(){var x=render();return {version:VERSION,badge:false,status:x.status,detail:x.detail,time:new Date().toISOString()}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
