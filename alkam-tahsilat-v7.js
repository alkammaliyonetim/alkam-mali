(function(){
  'use strict';
  var VERSION='ALKAM Tahsilat v7.2 STABLE POSTING';
  var LEDGER_KEY='alkam_cari_hareketleri';
  var COLLECTION_KEY='alkam_tahsilatlar';
  var FIN_KEY='alkam_finans_hareketleri';
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function today(){return new Date().toISOString().slice(0,10)}
  function n(v){var x=Number(String(v||0).replace(/TL|₺/g,'').replace(/\./g,'').replace(',','.'));return isNaN(x)?0:x}
  function snap(reason){if(window.ALKAM_RELIABILITY_GUARD&&window.ALKAM_RELIABILITY_GUARD.snapshot)return window.ALKAM_RELIABILITY_GUARD.snapshot(reason);return null}
  function keyOf(cari,date,amount,hesap,desc){return ['TAH',String(cari||'').toLocaleUpperCase('tr-TR').trim(),date,Number(amount||0).toFixed(2),String(hesap||''),String(desc||'').toLocaleUpperCase('tr-TR').trim()].join('|')}
  function getSelectedCari(){
    var name=((document.querySelector('.hero-name')||document.querySelector('h1')||document.querySelector('h2')||{}).textContent||'').trim();
    if(window.ALKAM_TAHAKKUK_V5&&ALKAM_TAHAKKUK_V5.readCariler){
      var arr=ALKAM_TAHAKKUK_V5.readCariler();
      var f=arr.find(function(c){var u=c.unvan||c.unvan_tam||c.tam_unvan||c.name||c.ad||'';return name&&u&&name.indexOf(u)>-1});
      if(f)return {id:f.cari_id||f.id||f.kod||f.vergi_no||name,unvan:f.unvan||f.unvan_tam||f.tam_unvan||f.name||name};
    }
    return {id:name||'secili_cari',unvan:name||'Seçili Cari'};
  }
  function duplicate(list,key){return list.some(function(x){return String(x.posting_key||'')===String(key)&&x.iptal!==true})}
  function collect(opts){
    opts=opts||{};
    var amount=n(opts.tutar||opts.amount);
    if(amount<=0)return {ok:false,reason:'Tahsilat tutarı 0 olamaz'};
    var c=opts.cari||getSelectedCari();
    var hesap=opts.hesap||'banka';
    var kaynak=opts.kaynak||('Tahsilat - '+hesap);
    var date=opts.tarih||today();
    var desc=opts.aciklama||'Cari tahsilatı';
    var pkey=keyOf(c.id||c.unvan,date,amount,hesap,desc);
    var backup=snap('Tahsilat öncesi '+c.unvan+' '+amount);
    var led=readJson(LEDGER_KEY), col=readJson(COLLECTION_KEY), fin=readJson(FIN_KEY);
    if(duplicate(led,pkey)||duplicate(col,pkey)||duplicate(fin,pkey))return {ok:false,reason:'Mükerrer tahsilat engellendi'};
    var id='TAH-'+Date.now();
    var item={id:id,islem_id:id,posting_key:pkey,cari_id:c.id,cariId:c.id,cari_unvan:c.unvan,cari:c.unvan,tarih:date,date:date,islem_turu:'Tahsilat',type:'tahsilat',aciklama:desc,description:desc,borc:0,alacak:amount,tutar:amount,kaynak:kaynak,finans_hesap:hesap,created_at:now(),backup:backup&&backup.id};
    var fitem={id:id+'-FIN',islem_id:id,posting_key:pkey,hesap:hesap,tip:'Giriş',tutar:amount,tarih:date,aciklama:desc,kaynak:kaynak,cari_id:c.id,cari_unvan:c.unvan,moka_cari_tahsilati:hesap==='moka',created_at:now(),backup:backup&&backup.id};
    led.push(item); col.push(item); fin.push(fitem);
    writeJson(LEDGER_KEY,led); writeJson(COLLECTION_KEY,col); writeJson(FIN_KEY,fin);
    if(window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.addMovement){
      try{ALKAM_FINANS_FLOW_V6.addMovement({hesap:hesap,tip:'Giriş',tutar:amount,tarih:date,aciklama:desc,kaynak:kaynak,cari_id:c.id})}catch(e){}
    }
    if(window.ALKAM_DATA_QUALITY&&ALKAM_DATA_QUALITY.run)setTimeout(function(){ALKAM_DATA_QUALITY.run()},200);
    window.__ALKAM_TAHSILAT_LAST={ok:true,item:item,finance:fitem,posting_key:pkey};
    return window.__ALKAM_TAHSILAT_LAST;
  }
  function summary(){var list=readJson(COLLECTION_KEY);var total=list.reduce(function(t,x){return t+Number(x.tutar||x.alacak||0)},0);return {version:VERSION,count:list.length,total:total,last:list[list.length-1]||null,finance:readJson(FIN_KEY).length,time:now()}}
  window.ALKAM_TAHSILAT_V7={version:VERSION,collect:collect,summary:summary,test:summary,last:function(){return window.__ALKAM_TAHSILAT_LAST||null}};
  console.info('ALKAM Tahsilat aktif',summary());
})();
