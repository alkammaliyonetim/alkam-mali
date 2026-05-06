(function(){
'use strict';
var VERSION='ALKAM Banka History Export v8.9 stable';
var PROCESSED_KEY='alkam_banka_islenen';
var REJECTED_KEY='alkam_banka_reddedilen';
function q(s,r){return (r||document).querySelector(s)}
function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
function csvEscape(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
function download(name,rows){var header=['Durum','Tarih','Tutar','Açıklama','Önerilen Tip','Cari','Güven','Eşleşme Sebebi','İşlem Zamanı'];var csv=[header].concat(rows.map(function(r){var cari=r.onerilen_cari?(r.onerilen_cari.cari_unvan||''):'';return [r.durum||'',r.tarih||'',r.tutar||'',r.aciklama||'',r.onerilen_tip||'',cari,r.guven||'',r.eslesme_sebebi||'',r.processed_at||r.rejected_at||'']})).map(function(r){return r.map(csvEscape).join(';')}).join('\n');var blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},500);return {ok:true,file:name,count:rows.length}}
function exportProcessed(){return download('alkam_banka_islenen_gecmis.csv',readJson(PROCESSED_KEY))}
function exportRejected(){return download('alkam_banka_reddedilen_gecmis.csv',readJson(REJECTED_KEY))}
function exportAll(){return download('alkam_banka_tum_gecmis.csv',readJson(PROCESSED_KEY).concat(readJson(REJECTED_KEY)))}
function addButtons(){var modal=q('#alkamBankHistoryModal');if(modal&&!q('#alkamBankHistoryExportAll',modal)){var tabs=q('.alkam-bank-history-tabs',modal);if(tabs){var b=document.createElement('button');b.id='alkamBankHistoryExportAll';b.textContent='Tümünü CSV';b.onclick=exportAll;tabs.appendChild(b);var b2=document.createElement('button');b2.id='alkamBankHistoryExportProcessed';b2.textContent='İşlenen CSV';b2.onclick=exportProcessed;tabs.appendChild(b2);var b3=document.createElement('button');b3.id='alkamBankHistoryExportRejected';b3.textContent='Reddedilen CSV';b3.onclick=exportRejected;tabs.appendChild(b3)}}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamBankHistoryExportCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamBankHistoryExportCard"><b>Banka Geçmişi Dışa Aktarım</b><div class="line">İşlenen ve reddedilen banka onay geçmişini CSV olarak indir.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_BANKA_HISTORY_EXPORT_V8&&ALKAM_BANKA_HISTORY_EXPORT_V8.exportAll()">Tümünü CSV İndir</button></div></div>')}}
function run(){addButtons();return {version:VERSION,processed:readJson(PROCESSED_KEY).length,rejected:readJson(REJECTED_KEY).length,buttons:!!q('#alkamBankHistoryExportAll'),drawerCard:!!q('#alkamBankHistoryExportCard'),time:new Date().toISOString()}}
window.ALKAM_BANKA_HISTORY_EXPORT_V8={version:VERSION,exportProcessed:exportProcessed,exportRejected:exportRejected,exportAll:exportAll,run:run,test:run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
document.addEventListener('click',function(){setTimeout(run,250)},true);
})();
