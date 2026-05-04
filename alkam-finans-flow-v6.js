(function(){
  'use strict';
  var VERSION='ALKAM Finans Flow v6.0';
  var ACC_KEY='alkam_finans_hesaplari';
  var TX_KEY='alkam_finans_hareketleri';
  var LOG_KEY='alkam_finans_loglari';
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function accounts(){
    var list=readJson(ACC_KEY);
    if(!Array.isArray(list)||!list.length){
      list=[
        {id:'banka',ad:'Banka',tip:'Banka',bakiye:0},
        {id:'kasa',ad:'Kasa',tip:'Kasa',bakiye:0},
        {id:'moka',ad:'Moka United',tip:'Ara Hesap',bakiye:0},
        {id:'cek',ad:'Çek',tip:'Çek',bakiye:0},
        {id:'senet',ad:'Senet',tip:'Senet',bakiye:0}
      ];
      writeJson(ACC_KEY,list);
    }
    return list;
  }
  function tx(){return readJson(TX_KEY)}
  function log(type,msg,obj){var l=readJson(LOG_KEY);l.unshift({type:type,message:msg,data:obj||null,time:now()});writeJson(LOG_KEY,l.slice(0,300))}
  function snapshot(reason){if(window.ALKAM_RELIABILITY_GUARD&&window.ALKAM_RELIABILITY_GUARD.snapshot)return window.ALKAM_RELIABILITY_GUARD.snapshot(reason);return null}
  function addMovement(m){
    if(!m||!m.hesap||!m.tutar)return {ok:false,reason:'Eksik hesap veya tutar'};
    var snap=snapshot('Finans hareketi öncesi '+(m.hesap||''));
    var list=tx();
    var item={id:'FIN-'+Date.now(),hesap:m.hesap,tip:m.tip||'Giriş',tutar:Number(m.tutar||0),tarih:m.tarih||new Date().toISOString().slice(0,10),aciklama:m.aciklama||'',kaynak:m.kaynak||'Manuel Finans',cari_id:m.cari_id||'',moka_cari_tahsilati:false,created_at:now(),backup:snap&&snap.id};
    list.push(item); writeJson(TX_KEY,list); log('ADD','Finans hareketi eklendi',item);
    return {ok:true,item:item};
  }
  function mokaSettlement(tutar,aciklama){
    var amount=Number(tutar||0); if(amount<=0)return {ok:false,reason:'Tutar 0 olamaz'};
    var snap=snapshot('Moka banka aktarımı öncesi');
    var list=tx();
    var date=new Date().toISOString().slice(0,10);
    var out={id:'FIN-'+Date.now()+'-MOKA-CIKIS',hesap:'moka',tip:'Çıkış',tutar:amount,tarih:date,aciklama:aciklama||'Moka United banka aktarımı',kaynak:'Moka Banka Aktarım',cari_tahsilati_sayma:false,created_at:now(),backup:snap&&snap.id};
    var inn={id:'FIN-'+Date.now()+'-BANKA-GIRIS',hesap:'banka',tip:'Giriş',tutar:amount,tarih:date,aciklama:aciklama||'Moka United banka aktarımı',kaynak:'Moka Banka Aktarım',cari_tahsilati_sayma:false,created_at:now(),backup:snap&&snap.id};
    list.push(out); list.push(inn); writeJson(TX_KEY,list); log('MOKA_SETTLEMENT','Moka bankaya aktarıldı',{tutar:amount});
    return {ok:true,items:[out,inn],note:'Cari tahsilatı sayılmadı. Sadece Moka -> Banka aktarımı.'};
  }
  function summary(){
    var base=accounts(); var moves=tx(); var out={};
    base.forEach(function(a){out[a.id]={ad:a.ad,tip:a.tip,bakiye:Number(a.bakiye||0),giris:0,cikis:0}});
    moves.forEach(function(x){var h=x.hesap||''; if(!out[h])out[h]={ad:h,tip:'Diğer',bakiye:0,giris:0,cikis:0}; if(String(x.tip).toLowerCase().indexOf('çık')>-1||String(x.tip).toLowerCase().indexOf('cik')>-1){out[h].cikis+=Number(x.tutar||0);out[h].bakiye-=Number(x.tutar||0)}else{out[h].giris+=Number(x.tutar||0);out[h].bakiye+=Number(x.tutar||0)}});
    return {version:VERSION,accounts:out,count:moves.length,time:now()};
  }
  window.ALKAM_FINANS_FLOW_V6={version:VERSION,accounts:accounts,tx:tx,summary:summary,addMovement:addMovement,mokaSettlement:mokaSettlement,test:function(){return summary()}};
  console.info('ALKAM Finans Flow aktif',summary());
})();
