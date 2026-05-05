(function(){
'use strict';
var VERSION='ALKAM Gider Onay Köprü v1.0';
function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
function n(v){var s=String(v||0).replace(/\s/g,'').replace(/TL|₺/gi,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');var x=Number(s);return isFinite(x)?Number(x.toFixed(2)):0}
function sourceKey(x,source){return [source,x.id||'',x.fp||'',x.tarih||'',n(x.tutar).toFixed(2),norm(x.aciklama||'')].join('|')}
function isCandidate(x){var t=norm([x.aciklama,x.onerilen_tip,x.eslesme_sebebi].join(' '));if(n(x.tutar)<0)return true;return ['masraf','sgk','mosip','bagkur','bağkur','gib','vergi','kira','kredi kart','kmh','ek hesap','pos aidat'].some(function(k){return t.indexOf(norm(k))>-1})}
function bridge(){var sent=read('alkam_gider_onay_kopru_sent');var sentMap={};sent.forEach(function(k){sentMap[k]=1});var rows=[];
 read('alkam_onay_bekleyen_banka').forEach(function(x){var k=sourceKey(x,'BANKA');if(!sentMap[k]&&isCandidate(x)){rows.push({tarih:x.tarih,tutar:Math.abs(n(x.tutar)),aciklama:x.aciklama,hesap:'banka',kaynak:'Banka Onay Köprü'});sent.push(k);sentMap[k]=1}});
 read('alkam_kasa_onay_bekleyen').forEach(function(x){var k=sourceKey(x,'KASA');if(!sentMap[k]&&isCandidate(x)){rows.push({tarih:x.tarih,tutar:Math.abs(n(x.tutar)),aciklama:x.aciklama,hesap:'kasa',kaynak:'Kasa Onay Köprü'});sent.push(k);sentMap[k]=1}});
 var res={ok:true,version:VERSION,added:0,scanned:rows.length,time:new Date().toISOString()};
 if(rows.length&&window.ALKAM_GIDER_ONAY_V1&&ALKAM_GIDER_ONAY_V1.importRows){res=ALKAM_GIDER_ONAY_V1.importRows(rows,'Banka/Kasa Gider Köprüsü');write('alkam_gider_onay_kopru_sent',sent.slice(-5000))}
 window.__ALKAM_GIDER_ONAY_KOPRU_LAST=res;return res}
function boot(){setTimeout(bridge,800);setTimeout(bridge,2400);document.addEventListener('click',function(){setTimeout(bridge,300)},true);document.addEventListener('input',function(){setTimeout(bridge,500)},true)}
window.ALKAM_GIDER_ONAY_KOPRU_V1={version:VERSION,bridge:bridge,test:bridge};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();