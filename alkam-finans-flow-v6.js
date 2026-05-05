(function(){
  'use strict';
  var VERSION='ALKAM Finans Flow v6.1 HESAP STANDARDI';
  var ACC_KEY='alkam_finans_hesaplari';
  var TX_KEY='alkam_finans_hareketleri';
  var LOG_KEY='alkam_finans_loglari';
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function defaultAccounts(){return [
    {id:'banka',ad:'Banka',tip:'Banka',bakiye:0},
    {id:'kasa',ad:'Kasa',tip:'Kasa',bakiye:0},
    {id:'moka',ad:'Moka United',tip:'Ara Hesap',bakiye:0},
    {id:'kredi_karti',ad:'Kredi Kartı',tip:'Kredi Kartı Borç Hesabı',bakiye:0,ozel:true,gider_degildir:true},
    {id:'kmh_ek_hesap',ad:'KMH / Ek Hesap',tip:'Kredili Mevduat / Ek Hesap',bakiye:0,ozel:true,gider_degildir:true},
    {id:'cek',ad:'Çek',tip:'Çek',bakiye:0},
    {id:'senet',ad:'Senet',tip:'Senet',bakiye:0}
  ]}
  function mergeDefaults(list){
    var base=Array.isArray(list)?list:[];
    defaultAccounts().forEach(function(a){
      var ex=base.find(function(x){return String(x.id||'')===a.id});
      if(!ex)base.push(a); else {Object.keys(a).forEach(function(k){if(ex[k]===undefined||ex[k]===null||ex[k]==='')ex[k]=a[k]})}
    });
    return base;
  }
  function accounts(){var list=mergeDefaults(readJson(ACC_KEY));writeJson(ACC_KEY,list);return list}
  function tx(){return readJson(TX_KEY)}
  function log(type,msg,obj){var l=readJson(LOG_KEY);l.unshift({type:type,message:msg,data:obj||null,time:now()});writeJson(LOG_KEY,l.slice(0,300))}
  function snapshot(reason){if(window.ALKAM_RELIABILITY_GUARD&&window.ALKAM_RELIABILITY_GUARD.snapshot)return window.ALKAM_RELIABILITY_GUARD.snapshot(reason);return null}
  function addMovement(m){
    if(!m||!m.hesap||!m.tutar)return {ok:false,reason:'Eksik hesap veya tutar'};
    accounts();
    var snap=snapshot('Finans hareketi öncesi '+(m.hesap||''));
    var list=tx();
    var item={id:'FIN-'+Date.now(),hesap:m.hesap,tip:m.tip||'Giriş',tutar:Number(m.tutar||0),tarih:m.tarih||new Date().toISOString().slice(0,10),aciklama:m.aciklama||'',kaynak:m.kaynak||'Manuel Finans',cari_id:m.cari_id||'',moka_cari_tahsilati:false,gider_degildir:!!m.gider_degildir,created_at:now(),backup:snap&&snap.id};
    list.push(item); writeJson(TX_KEY,list); log('ADD','Finans hareketi eklendi',item);
    return {ok:true,item:item};
  }
  function transfer(from,to,tutar,aciklama,kaynak,tarih){
    var amount=Number(tutar||0); if(amount<=0)return {ok:false,reason:'Tutar 0 olamaz'};
    accounts();
    var snap=snapshot('Finans hesap aktarımı öncesi '+from+' -> '+to);
    var list=tx(); var date=tarih||new Date().toISOString().slice(0,10); var stamp=Date.now();
    var out={id:'FIN-'+stamp+'-CIKIS',hesap:from,tip:'Çıkış',tutar:amount,tarih:date,aciklama:aciklama||'Hesap aktarımı',kaynak:kaynak||'Hesap Aktarımı',cari_tahsilati_sayma:false,gider_degildir:true,created_at:now(),backup:snap&&snap.id};
    var inn={id:'FIN-'+stamp+'-GIRIS',hesap:to,tip:'Giriş',tutar:amount,tarih:date,aciklama:aciklama||'Hesap aktarımı',kaynak:kaynak||'Hesap Aktarımı',cari_tahsilati_sayma:false,gider_degildir:true,created_at:now(),backup:snap&&snap.id};
    list.push(out); list.push(inn); writeJson(TX_KEY,list); log('TRANSFER','Hesap aktarımı',{from:from,to:to,tutar:amount});
    return {ok:true,items:[out,inn],note:'Gider değildir. Hesaplar arası aktarım.'};
  }
  function creditCardPayment(tutar,aciklama,tarih){return transfer('banka','kredi_karti',tutar,aciklama||'Kredi kartı borç ödemesi','Kredi Kartı Borç Ödemesi',tarih)}
  function kmhPayment(tutar,aciklama,tarih){return transfer('banka','kmh_ek_hesap',tutar,aciklama||'KMH / Ek hesap ödemesi','KMH Ek Hesap Ödemesi',tarih)}
  function mokaSettlement(tutar,aciklama){return transfer('moka','banka',tutar,aciklama||'Moka United banka aktarımı','Moka Banka Aktarım')}
  function summary(){
    var base=accounts(); var moves=tx(); var out={};
    base.forEach(function(a){out[a.id]={ad:a.ad,tip:a.tip,bakiye:Number(a.bakiye||0),giris:0,cikis:0,ozel:!!a.ozel,gider_degildir:!!a.gider_degildir}});
    moves.forEach(function(x){var h=x.hesap||''; if(!out[h])out[h]={ad:h,tip:'Diğer',bakiye:0,giris:0,cikis:0}; if(String(x.tip).toLowerCase().indexOf('çık')>-1||String(x.tip).toLowerCase().indexOf('cik')>-1){out[h].cikis+=Number(x.tutar||0);out[h].bakiye-=Number(x.tutar||0)}else{out[h].giris+=Number(x.tutar||0);out[h].bakiye+=Number(x.tutar||0)}});
    return {version:VERSION,accounts:out,count:moves.length,time:now()};
  }
  window.ALKAM_FINANS_FLOW_V6={version:VERSION,accounts:accounts,tx:tx,summary:summary,addMovement:addMovement,transfer:transfer,creditCardPayment:creditCardPayment,kmhPayment:kmhPayment,mokaSettlement:mokaSettlement,test:function(){return summary()}};
  console.info('ALKAM Finans Flow aktif',summary());
})();
