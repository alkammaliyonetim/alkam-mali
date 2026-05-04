(function(){
  'use strict';
  var VERSION='ALKAM Banka Onay v8.0';
  var RAW_KEY='alkam_banka_ice_aktarim_raw';
  var APPROVAL_KEY='alkam_onay_bekleyen_banka';
  var PROCESSED_KEY='alkam_banka_islenen';
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function now(){return new Date().toISOString()}
  function n(v){var x=Number(String(v||0).replace(/TL|₺/g,'').replace(/\./g,'').replace(',','.'));return isNaN(x)?0:x}
  function norm(s){return String(s||'').toLowerCase().replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim()}
  function fingerprint(x){return [x.tarih||x.date||'',n(x.tutar||x.amount||0),norm(x.aciklama||x.description||x.detay||'')].join('|')}
  function getCariler(){try{return window.ALKAM_TAHAKKUK_V5&&ALKAM_TAHAKKUK_V5.readCariler?ALKAM_TAHAKKUK_V5.readCariler():[]}catch(e){return []}}
  function suggestCari(desc){
    var d=norm(desc), best=null, score=0;
    getCariler().forEach(function(c){var name=norm(c.unvan||c.unvan_tam||c.tam_unvan||c.name||c.ad||''); if(!name)return; var parts=name.split(' ').filter(function(p){return p.length>2}); var s=0; parts.forEach(function(p){if(d.indexOf(p)>-1)s+=15}); if(name&&d.indexOf(name)>-1)s+=60; if(s>score){score=s;best=c}});
    if(!best)return null;
    return {cari_id:best.cari_id||best.id||best.kod||best.vergi_no||best.unvan,cari_unvan:best.unvan||best.unvan_tam||best.tam_unvan||best.name||best.ad,confidence:Math.min(100,score),reason:'Açıklama içinden cari adı benzerliği'};
  }
  function classify(row){
    var desc=row.aciklama||row.description||row.detay||''; var d=norm(desc); var amount=n(row.tutar||row.amount||0);
    var type=amount>=0?'Tahsilat Adayı':'Ödeme Adayı';
    if(d.indexOf('moka')>-1||d.indexOf('united')>-1)type='Moka Banka Aktarım Adayı';
    if(d.indexOf('pos')>-1)type='POS/Moka Adayı';
    var cari=suggestCari(desc);
    return {type:type,cari:cari,confidence:cari?cari.confidence:(type.indexOf('Moka')>-1?80:30),reason:cari?cari.reason:(type.indexOf('Moka')>-1?'Moka/United ifadesi bulundu':'Cari eşleşmesi düşük')};
  }
  function importRows(rows,source){
    if(!Array.isArray(rows))return {ok:false,reason:'Satır listesi bekleniyor'};
    var raw=readJson(RAW_KEY), approvals=readJson(APPROVAL_KEY), processed=readJson(PROCESSED_KEY);
    var known={}; raw.concat(approvals).concat(processed).forEach(function(x){known[x.fp||fingerprint(x)]=true});
    var added=0, duplicate=0, items=[];
    rows.forEach(function(r){var row={id:'BNK-'+Date.now()+'-'+Math.random().toString(16).slice(2),tarih:r.tarih||r.date||new Date().toISOString().slice(0,10),tutar:n(r.tutar||r.amount),aciklama:r.aciklama||r.description||r.detay||'',kaynak:source||'Banka İçe Aktarım',created_at:now()}; row.fp=fingerprint(row); if(known[row.fp]){duplicate++; return} var c=classify(row); row.onerilen_tip=c.type; row.onerilen_cari=c.cari; row.guven=c.confidence; row.eslesme_sebebi=c.reason; row.durum='Onay Bekliyor'; raw.push(row); approvals.push(row); known[row.fp]=true; added++; items.push(row)});
    writeJson(RAW_KEY,raw); writeJson(APPROVAL_KEY,approvals);
    return {ok:true,version:VERSION,added:added,duplicate:duplicate,totalApproval:approvals.length,items:items,time:now()};
  }
  function approve(id){
    var approvals=readJson(APPROVAL_KEY), processed=readJson(PROCESSED_KEY); var i=approvals.findIndex(function(x){return x.id===id});
    if(i<0)return {ok:false,reason:'Onay kaydı bulunamadı'};
    var row=approvals[i]; if(window.ALKAM_RELIABILITY_GUARD&&ALKAM_RELIABILITY_GUARD.snapshot)ALKAM_RELIABILITY_GUARD.snapshot('Banka onay öncesi '+id);
    row.durum='İşlendi'; row.processed_at=now(); processed.push(row); approvals.splice(i,1); writeJson(APPROVAL_KEY,approvals); writeJson(PROCESSED_KEY,processed);
    if(row.onerilen_tip&&row.onerilen_tip.indexOf('Moka')>-1&&window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.mokaSettlement){ALKAM_FINANS_FLOW_V6.mokaSettlement(Math.abs(row.tutar),row.aciklama)}
    else if(row.tutar>0&&window.ALKAM_TAHSILAT_V7&&ALKAM_TAHSILAT_V7.collect){ALKAM_TAHSILAT_V7.collect({tutar:row.tutar,hesap:'banka',tarih:row.tarih,kaynak:'Banka Onay',aciklama:row.aciklama,cari:row.onerilen_cari?{id:row.onerilen_cari.cari_id,unvan:row.onerilen_cari.cari_unvan}:null})}
    else if(window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.addMovement){ALKAM_FINANS_FLOW_V6.addMovement({hesap:'banka',tip:row.tutar>=0?'Giriş':'Çıkış',tutar:Math.abs(row.tutar),tarih:row.tarih,kaynak:'Banka Onay',aciklama:row.aciklama})}
    return {ok:true,item:row,remaining:approvals.length};
  }
  function reject(id,reason){var approvals=readJson(APPROVAL_KEY); var i=approvals.findIndex(function(x){return x.id===id}); if(i<0)return {ok:false,reason:'Kayıt bulunamadı'}; var row=approvals[i]; row.durum='Reddedildi'; row.red_sebebi=reason||''; approvals.splice(i,1); writeJson(APPROVAL_KEY,approvals); return {ok:true,item:row,remaining:approvals.length}}
  function list(){return readJson(APPROVAL_KEY)}
  function summary(){var a=readJson(APPROVAL_KEY), p=readJson(PROCESSED_KEY);return {version:VERSION,onayBekleyen:a.length,islenen:p.length,totalAmount:a.reduce(function(t,x){return t+n(x.tutar)},0),time:now()}}
  window.ALKAM_BANKA_ONAY_V8={version:VERSION,importRows:importRows,approve:approve,reject:reject,list:list,summary:summary,test:summary};
  console.info('ALKAM Banka Onay aktif',summary());
})();
