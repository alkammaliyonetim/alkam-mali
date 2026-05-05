(function(){
'use strict';
var VERSION='ALKAM v12 Defter Posting Core v1.0';
function r(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function w(k,a){localStorage.setItem(k,JSON.stringify(a));window.dispatchEvent(new CustomEvent('alkam:defter',{detail:{key:k,count:a.length}}))}
function u(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
function m(v){var s=String(v||0).replace(/\s/g,'').replace(/TL/gi,'').replace(/₺/g,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');var n=Number(s);return isFinite(n)?Number(n.toFixed(2)):0}
function d(v){v=String(v||'').trim();var a=v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);return a?a[3]+'-'+a[2]+'-'+a[1]:(v?v.slice(0,10):new Date().toISOString().slice(0,10))}
function key(t,c,dt,am,ac){return ['ALKAM',t,u(c),d(dt),m(am),u(ac)].join('|')}
function has(a,id){return a.some(function(x){return x.kayit_no===id||x.id===id})}
function nm(x){return x.cari||x.cari_adi||x.unvan||x.mukellef||x.ad||x.name||''}
function refresh(){setTimeout(function(){try{window.ALKAM_V12_CARI_OPERASYON_FIX_V1&&ALKAM_V12_CARI_OPERASYON_FIX_V1.run()}catch(e){}try{window.renderCariler&&window.renderCariler()}catch(e){}try{window.renderDashboard&&window.renderDashboard()}catch(e){}},50)}
function tahsilat(x){var c=nm(x),am=m(x.tutar||x.alacak),dt=d(x.tarih||x.date),ac=x.aciklama||'Tahsilat',hp=x.hesap||'Banka';if(!c||am<=0)return {ok:false,reason:'eksik'};var id=key('TAHSILAT',c,dt,am,ac),ta=r('alkam_tahsilatlar'),ha=r('alkam_cari_hareketleri'),fi=r('alkam_finans_hareketleri');var row={id:id,kayit_no:id,tarih:dt,cari:c,cari_adi:c,tutar:am,borc:0,alacak:am,tip:'TAHSILAT',kaynak:'Tahsilat',hesap:hp,aciklama:ac,created_at:new Date().toISOString()};if(!has(ta,id))ta.push(row);if(!has(ha,id))ha.push(Object.assign({},row,{defter:'cari'}));if(!has(fi,id))fi.push(Object.assign({},row,{defter:'finans',giris:am,cikis:0}));w('alkam_tahsilatlar',ta);w('alkam_cari_hareketleri',ha);w('alkam_finans_hareketleri',fi);refresh();return {ok:true,id:id}}
function tahakkuk(x){var c=nm(x),am=m(x.tutar||x.borc),dt=d(x.tarih||x.date),ac=x.aciklama||'Tahakkuk';if(!c||am<=0)return {ok:false,reason:'eksik'};var id=key('TAHAKKUK',c,dt,am,ac),ta=r('alkam_tahakkuklar'),ha=r('alkam_cari_hareketleri');var row={id:id,kayit_no:id,tarih:dt,cari:c,cari_adi:c,tutar:am,borc:am,alacak:0,tip:'TAHAKKUK',kaynak:'Tahakkuk',aciklama:ac,created_at:new Date().toISOString()};if(!has(ta,id))ta.push(row);if(!has(ha,id))ha.push(Object.assign({},row,{defter:'cari'}));w('alkam_tahakkuklar',ta);w('alkam_cari_hareketleri',ha);refresh();return {ok:true,id:id}}
function reconcile(){r('alkam_tahsilatlar').forEach(tahsilat);r('alkam_tahakkuklar').forEach(tahakkuk);return test()}
function test(){return {version:VERSION,ready:true,cari:r('alkam_cari_hareketleri').length,tahsilat:r('alkam_tahsilatlar').length,tahakkuk:r('alkam_tahakkuklar').length,finans:r('alkam_finans_hareketleri').length,time:new Date().toISOString()}}
window.ALKAM_V12_DEFTER_POSTING_CORE_V1={version:VERSION,tahsilat:tahsilat,tahakkuk:tahakkuk,reconcile:reconcile,test:test};
reconcile();
})();