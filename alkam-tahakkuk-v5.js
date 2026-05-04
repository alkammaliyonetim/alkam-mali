(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.5 single-create';
  var JSON_FILE='alkam-cariler-77-28-04-2026.json';
  var cache=[]; var source='bekleniyor';
  var MONTHS=['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'];
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function periodText(p){var a=String(p||periodNow()).split('-');return a[0]+' '+(MONTHS[Number(a[1])-1]||a[1])+' AYI MUHASEBE ÜCRETİ'}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function looks(a){return Array.isArray(a)&&a.length&&typeof a[0]==='object'}
  function scanKnown(){if(looks(window.ALKAM_CARILER_77_DATA))return {key:'window.ALKAM_CARILER_77_DATA',data:window.ALKAM_CARILER_77_DATA};if(looks(window.ALKAM_CARILER_DATA))return {key:'window.ALKAM_CARILER_DATA',data:window.ALKAM_CARILER_DATA};if(looks(cache))return {key:'fetch.'+JSON_FILE,data:cache};return null}
  function scanLocal(){var keys=['alkam_cariler','cariler','ALKAM_CARILER'];for(var i=0;i<keys.length;i++){var a=readJson(keys[i]);if(looks(a))return {key:'localStorage.'+keys[i],data:a}}return null}
  function readCarilerWithSource(){return scanKnown()||scanLocal()||{key:source,data:[]}}
  function readCariler(){return readCarilerWithSource().data}
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function writeTahakkuk(a){writeJson('alkam_tahakkuklar',a)}
  function readLedger(){return readJson('alkam_cari_hareketleri')}
  function writeLedger(a){writeJson('alkam_cari_hareketleri',a)}
  function loadFallback(){if(looks(cache))return;fetch('/'+JSON_FILE,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(data){if(looks(data)){cache=data;source='fetch.'+JSON_FILE;panel();console.info('ALKAM_TAHAKKUK_V5: cari JSON fallback yüklendi',data.length)}}).catch(function(e){source='json yüklenemedi: '+(e&&e.message?e.message:e);panel()})}
  function text(v){return String(v||'').trim()}
  function num(v){var n=Number(String(v||'').replace(/TL|₺/g,'').replace(/\./g,'').replace(',','.'));return isNaN(n)?0:n}
  function cariId(c,i){return c.cari_id||c.cariId||c.id||c.ID||c.kod||c.code||c.vergi_no||c.vergiNo||('cari_'+i)}
  function cariName(c){return c.unvan||c.unvan_tam||c.tam_unvan||c.tamUnvan||c.cari_unvan||c.name||c.ad||c.title||c.cariAdi||'İsimsiz Cari'}
  function fee(c){var keys=['aktif_ucret','aylik_ucret','aylikMuhasebeUcreti','monthlyFee','ucret','defterUcreti','defter_ucreti','muhasebe_ucreti'];for(var i=0;i<keys.length;i++){if(c[keys[i]]!==undefined&&c[keys[i]]!==null&&c[keys[i]]!=='')return num(c[keys[i]])}return 0}
  function isActive(c){var d=String(c.durum||c.status||c.aktif||'aktif').toLowerCase();if(c.active===false)return false;return !(d.indexOf('pasif')>-1||d.indexOf('ayrıldı')>-1||d.indexOf('ayrildi')>-1||d.indexOf('beklemede')>-1)}
  function selectedName(){var r=document.querySelector('#selectedCariDetail')||document.querySelector('#tab-cariler')||document.body;var el=document.querySelector('.hero-name')||r.querySelector('h2')||r.querySelector('h1');return text(el&&el.textContent)}
  function selectedCari(){var name=selectedName();var arr=readCariler();var found=arr.find(function(c){return name&&text(cariName(c))&&name.indexOf(text(cariName(c)))>-1});return {cari:found||arr[0]||null,index:Math.max(0,arr.indexOf(found))}}
  function duplicate(list,cid,p){return list.some(function(x){return String(x.cari_id||x.cariId)===String(cid)&&String(x.donem||x.period)===String(p)&&String(x.islem_turu||x.type||'').toLowerCase().indexOf('tahakkuk')>-1&&x.iptal!==true})}
  function entry(c,i,p,amount,sourceName){var cid=cariId(c,i);var dt=String(p||periodNow())+'-01';var id='THK-'+cid+'-'+String(p||periodNow());return {id:id,islem_id:id,cari_id:cid,cariId:cid,cari_unvan:cariName(c),cari:cariName(c),tarih:dt,date:dt,donem:p||periodNow(),period:p||periodNow(),islem_turu:'Muhasebe Ücreti Tahakkuku',type:'tahakkuk',aciklama:periodText(p),description:periodText(p),borc:Number(amount||0),alacak:0,tutar:Number(amount||0),kaynak:sourceName||'Manuel Tahakkuk',created_at:now(),updated_at:now()}}
  function createSingle(period,overrideAmount){var s=selectedCari();var c=s.cari;if(!c)return saveLast({ok:false,reason:'Seçili cari bulunamadı'});var amount=overrideAmount?num(overrideAmount):fee(c);var p=period||periodNow();if(!isActive(c))return saveLast({ok:false,reason:'Pasif cari atlandı',cari:cariName(c)});if(amount<=0)return saveLast({ok:false,reason:'Aylık ücret yok veya 0',cari:cariName(c)});var tah=readTahakkuk();var led=readLedger();var cid=cariId(c,s.index);if(duplicate(tah,cid,p)||duplicate(led,cid,p))return saveLast({ok:false,reason:'Mükerrer tahakkuk engellendi',cari:cariName(c),period:p});var e=entry(c,s.index,p,amount,'Manuel Tahakkuk');tah.push(e);led.push(e);writeTahakkuk(tah);writeLedger(led);return saveLast({ok:true,entry:e,message:'Tahakkuk oluşturuldu'})}
  function saveLast(x){window.__ALKAM_TAHAKKUK_LAST=x;panel();return x}
  function candidates(){return {known:{ALKAM_CARILER_DATA:Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA.length:null,ALKAM_CARILER_77_DATA:Array.isArray(window.ALKAM_CARILER_77_DATA)?window.ALKAM_CARILER_77_DATA.length:null,fetchCache:cache.length,meta:window.ALKAM_CARILER_META||null},source:readCarilerWithSource().key}}
  function panel(){var src=readCarilerWithSource();var last=window.__ALKAM_TAHAKKUK_LAST;var p=document.getElementById('alkamTahakkukPanel');if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}var info=last?(last.ok?'Son: '+last.entry.cari_unvan+' / '+last.entry.donem+' / '+fmt(last.entry.borc):'Son: '+last.reason):'Hazır';p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5.5 cari: '+src.data.length+' · '+(src.key||'bulunamadı')+'</span><div style="margin-top:6px;display:flex;gap:6px"><input id="alkamThkPeriod" type="month" value="'+periodNow()+'"><button id="alkamThkSingle">Seçili Cari Tahakkuk</button></div><small>'+info+'</small>';var b=document.getElementById('alkamThkSingle');if(b)b.onclick=function(){createSingle(document.getElementById('alkamThkPeriod').value)}}
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function css(){if(document.getElementById('alkam-tahakkuk-style'))return;var st=document.createElement('style');st.id='alkam-tahakkuk-style';st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a;max-width:520px}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}#alkamTahakkukPanel input,#alkamTahakkukPanel button{height:32px;border-radius:9px;border:1px solid #cbd5e1;padding:0 8px;font-weight:900}#alkamTahakkukPanel button{background:#1769e8;color:#fff;cursor:pointer}#alkamTahakkukPanel small{display:block;margin-top:6px;color:#334155;font-weight:800}';document.head.appendChild(st)}
  function init(){css();loadFallback();panel()}
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readCarilerWithSource:readCarilerWithSource,readTahakkuk:readTahakkuk,createSingle:createSingle,single:createSingle,candidates:candidates,reload:loadFallback,last:function(){return window.__ALKAM_TAHAKKUK_LAST},test:function(){var s=readCarilerWithSource();return {version:VERSION,cariler:s.data.length,source:s.key,tahakkuk:readTahakkuk().length,period:periodNow(),known:candidates(),last:window.__ALKAM_TAHAKKUK_LAST,time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();setInterval(panel,3000);
})();
