(function(){
  'use strict';
  var VERSION='ALKAM Güvenilirlik Export v9.1';
  function q(s,r){return (r||document).querySelector(s)}
  function csvEscape(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
  function buildRows(){
    var r=(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.build)?ALKAM_GUVENILIRLIK_RAPORU_V9.build():{};
    var dq=r.dataQuality||{}, bank=r.banka||{}, tah=r.tahakkuk||{}, fin=r.finans||{}, backups=r.backups||[];
    var rows=[
      ['Alan','Değer','Detay'],
      ['Genel Durum',r.status||'-','ok/warn/bad'],
      ['Yedek Sayısı',backups.length,'Reliability Guard yedek adedi'],
      ['Veri Kalite Hata',(dq.errors||[]).length,'Data Quality errors'],
      ['Veri Kalite Uyarı',(dq.warnings||[]).length,'Data Quality warnings'],
      ['Banka Onay Bekleyen',bank.onayBekleyen||0,'Onaylanmamış banka satırı'],
      ['Banka İşlenen',bank.islenen||0,'İşlenen banka satırı'],
      ['Banka Reddedilen',bank.reddedilen||0,'Reddedilen banka satırı'],
      ['Tahakkuk Kayıt',tah.count||0,'Dönem tahakkuk kayıt sayısı'],
      ['Tahakkuk Toplam',tah.total||0,'Dönem tahakkuk toplamı'],
      ['Finans Hareket',fin.count||0,'Finans hareket sayısı'],
      ['Rapor Zamanı',new Date().toISOString(),'']
    ];
    backups.slice(0,20).forEach(function(b,i){rows.push(['Yedek '+(i+1),b.id,(b.reason||'')+' | '+(b.time||'')])});
    return rows;
  }
  function downloadCsv(){
    var csv=buildRows().map(function(r){return r.map(csvEscape).join(';')}).join('\n');
    var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
    var url=URL.createObjectURL(blob); var a=document.createElement('a');
    a.href=url; a.download='alkam_genel_guvenilirlik_raporu.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},500);
    return {ok:true,file:'alkam_genel_guvenilirlik_raporu.csv',rows:buildRows().length};
  }
  function printReport(){
    if(window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.open){ALKAM_GUVENILIRLIK_RAPORU_V9.open();setTimeout(function(){window.print()},350);return {ok:true,mode:'print'}}
    return {ok:false,reason:'Rapor hazır değil'};
  }
  function addButtons(){
    var modal=q('#alkamGuvenilirlikModal');
    if(modal&&!q('#alkamGuvenExportCsv',modal)){
      var actions=q('.alkam-guven-actions',modal);
      if(actions){
        var b=document.createElement('button'); b.id='alkamGuvenExportCsv'; b.type='button'; b.className='secondary'; b.textContent='CSV İndir'; b.onclick=downloadCsv; actions.appendChild(b);
        var p=document.createElement('button'); p.id='alkamGuvenPrint'; p.type='button'; p.className='secondary'; p.textContent='Yazdır/PDF'; p.onclick=function(){window.print()}; actions.appendChild(p);
      }
    }
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body');
    if(body&&!q('#alkamGuvenExportCard',body)){
      body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamGuvenExportCard"><b>Güvenilirlik Raporu Dışa Aktarım</b><div class="line">Genel güvenilirlik özetini CSV olarak indir veya yazdır/PDF al.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_GUVENILIRLIK_EXPORT_V9&&ALKAM_GUVENILIRLIK_EXPORT_V9.downloadCsv()">CSV İndir</button><button class="secondary" onclick="window.ALKAM_GUVENILIRLIK_EXPORT_V9&&ALKAM_GUVENILIRLIK_EXPORT_V9.printReport()">Yazdır/PDF</button></div></div>');
    }
  }
  function run(){addButtons()}
  window.ALKAM_GUVENILIRLIK_EXPORT_V9={version:VERSION,buildRows:buildRows,downloadCsv:downloadCsv,printReport:printReport,run:run,test:function(){return {version:VERSION,modalButton:!!q('#alkamGuvenExportCsv'),drawerCard:!!q('#alkamGuvenExportCard'),rows:buildRows().length,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButtons,2000);
})();
