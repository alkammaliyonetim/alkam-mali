(function(){
  'use strict';
  var VERSION='ALKAM Günlük Kontrol Export v9.6';
  var KEY='alkam_gunluk_kontrol_ozetleri';
  function q(s,r){return (r||document).querySelector(s)}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function csvEscape(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
  function rows(){
    var list=readJson(KEY);
    return [['Tarih','Saat','Skor','Durum','Sağlık','Banka Onay','Banka İşlenen','Banka Reddedilen','Veri Hata','Veri Uyarı','Tahakkuk Kayıt','Tahakkuk Toplam','Finans Hareket']].concat(list.map(function(x){
      return [x.date||'',x.time||'',x.score||0,x.status||'',((x.health&&x.health.ok)||0)+'/'+((x.health&&x.health.total)||0),(x.banka&&x.banka.onayBekleyen)||0,(x.banka&&x.banka.islenen)||0,(x.banka&&x.banka.reddedilen)||0,(x.dataQuality&&x.dataQuality.errors)||0,(x.dataQuality&&x.dataQuality.warnings)||0,(x.tahakkuk&&x.tahakkuk.count)||0,(x.tahakkuk&&x.tahakkuk.total)||0,(x.finans&&x.finans.count)||0];
    }));
  }
  function downloadCsv(){
    var csv=rows().map(function(r){return r.map(csvEscape).join(';')}).join('\n');
    var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url; a.download='alkam_gunluk_kontrol_ozeti.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},500);
    return {ok:true,file:'alkam_gunluk_kontrol_ozeti.csv',rows:rows().length-1};
  }
  function addButtons(){
    var modal=q('#alkamDailyControlModal');
    if(modal&&!q('#alkamDailyExportCsv',modal)){
      var actions=q('.alkam-daily-actions',modal);
      if(actions){
        var b=document.createElement('button'); b.id='alkamDailyExportCsv'; b.type='button'; b.textContent='CSV İndir'; b.onclick=downloadCsv; actions.appendChild(b);
      }
    }
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body');
    if(body&&!q('#alkamDailyExportCard',body)){
      body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamDailyExportCard"><b>Günlük Kontrol Dışa Aktarım</b><div class="line">Günlük kontrol skor geçmişini CSV olarak indir.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_GUNLUK_KONTROL_EXPORT_V9&&ALKAM_GUNLUK_KONTROL_EXPORT_V9.downloadCsv()">CSV İndir</button></div></div>');
    }
  }
  function run(){addButtons()}
  window.ALKAM_GUNLUK_KONTROL_EXPORT_V9={version:VERSION,rows:rows,downloadCsv:downloadCsv,run:run,test:function(){return {version:VERSION,modalButton:!!q('#alkamDailyExportCsv'),drawerCard:!!q('#alkamDailyExportCard'),history:readJson(KEY).length,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButtons,2000);
})();
