/* ALKAM Mali - Cari Veri Yukleyici */
(function(){
'use strict';
const JSON_FILE='alkam-cariler-73-istasyon-canli-15092026.json';
function load(src,id){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=true;document.body.appendChild(s)}
function empty(reason){window.ALKAM_CARILER_DATA=[];window.ALKAM_CARILER_77_DATA=[];window.ALKAM_CARILER_META={firma:'ALKAM Mali Musavirlik',kaynak:JSON_FILE,cariSayisi:0,hareketSayisi:0,durum:'Yuklenemedi',hata:reason||'Bilinmeyen hata'};console.error('[ALKAM] Cari veri yuklenemedi:',reason)}
/* NOT (15.09.2026): alkam-monthly-accrual-engine-v1.js artik yuklenmiyor.
   O script, dondurulmus 28.04.2026 STATIK verisinin uzerine her ay bir
   "tahmini" tahakkuk ekleyip tahsilati hic dusmuyordu - butun bakiye
   sapmalarinin kok nedeni buydu. Bu dosya artik Istasyon'un canli
   CARI_HAREKETLERI defterinden birebir senkronize; veri zaten guncel
   (tahakkuk + tahsilat dahil), ustune bir daha "tahmini" ekleme YAPILMAZ. */
load('alkam-daily-ops-v1.js?v=gunluk-operasyon-1','alkamDailyOpsV1');
/* NOT (17.09.2026): alkam-print-selected-cari-v1.js dosyasi repoda hic
   yok - her sayfa yuklemesinde sessiz 404 veriyordu. Ekstre/fis yazdirma
   zaten index.html icindeki buildCariStatementPrintHtml(c) fonksiyonu
   ile calisiyor, bu yuzden bu satir kaldirildi. */
fetch(JSON_FILE,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(JSON_FILE+' okunamadi HTTP '+r.status);return r.json()}).then(function(data){if(!Array.isArray(data))throw new Error('Cari veri dosyasi liste formatinda degil.');const hareketSayisi=data.reduce(function(t,c){return t+((c&&Array.isArray(c.transactions))?c.transactions.length:0)},0);window.ALKAM_CARILER_DATA=data;window.ALKAM_CARILER_77_DATA=data;window.ALKAM_CARILER_META={firma:'ALKAM Mali Musavirlik',kaynak:'Istasyon CARI_HAREKETLERI canli senkron',dosya:JSON_FILE,cariSayisi:data.length,hareketSayisi:hareketSayisi,surum:'istasyon-canli-sync-15092026',durum:'Yuklendi'};window.dispatchEvent(new CustomEvent('alkam:cariler-loaded',{detail:window.ALKAM_CARILER_META}));console.info('[ALKAM] Cari veri katmani yuklendi:',window.ALKAM_CARILER_META)}).catch(function(err){empty(err&&err.message?err.message:String(err))});
})();