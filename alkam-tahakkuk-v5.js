(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.4 json-fallback';
  var JSON_FILE='alkam-cariler-77-28-04-2026.json';
  var cache=[];
  var source='bekleniyor';
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function looks(a){return Array.isArray(a)&&a.length&&typeof a[0]==='object'}
  function scanKnown(){
    if(looks(window.ALKAM_CARILER_77_DATA))return {key:'window.ALKAM_CARILER_77_DATA',data:window.ALKAM_CARILER_77_DATA};
    if(looks(window.ALKAM_CARILER_DATA))return {key:'window.ALKAM_CARILER_DATA',data:window.ALKAM_CARILER_DATA};
    if(looks(cache))return {key:'fetch.'+JSON_FILE,data:cache};
    return null;
  }
  function scanLocal(){var keys=['alkam_cariler','cariler','ALKAM_CARILER'];for(var i=0;i<keys.length;i++){var a=readJson(keys[i]);if(looks(a))return {key:'localStorage.'+keys[i],data:a}}return null}
  function readCarilerWithSource(){return scanKnown()||scanLocal()||{key:source,data:[]}}
  function readCariler(){return readCarilerWithSource().data}
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function loadFallback(){
    if(looks(cache))return;
    fetch('/'+JSON_FILE,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(data){if(looks(data)){cache=data;source='fetch.'+JSON_FILE;panel();console.info('ALKAM_TAHAKKUK_V5: cari JSON fallback yüklendi',data.length)}}).catch(function(e){source='json yüklenemedi: '+(e&&e.message?e.message:e);panel()});
  }
  function candidates(){return {known:{ALKAM_CARILER_DATA:Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA.length:null,ALKAM_CARILER_77_DATA:Array.isArray(window.ALKAM_CARILER_77_DATA)?window.ALKAM_CARILER_77_DATA.length:null,fetchCache:cache.length,meta:window.ALKAM_CARILER_META||null},source:readCarilerWithSource().key}}
  function panel(){var src=readCarilerWithSource();var p=document.getElementById('alkamTahakkukPanel');if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5.4 cari kaynak: '+src.data.length+' · '+(src.key||'bulunamadı')+' · Dönem: '+periodNow()+'</span>'}
  function css(){if(document.getElementById('alkam-tahakkuk-style'))return;var st=document.createElement('style');st.id='alkam-tahakkuk-style';st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}';document.head.appendChild(st)}
  function init(){css();loadFallback();panel()}
  window.addEventListener('alkam:cariler-loaded',function(){setTimeout(panel,100)});
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readCarilerWithSource:readCarilerWithSource,readTahakkuk:readTahakkuk,candidates:candidates,reload:loadFallback,test:function(){var s=readCarilerWithSource();return {version:VERSION,cariler:s.data.length,source:s.key,tahakkuk:readTahakkuk().length,period:periodNow(),known:candidates(),time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setInterval(panel,2000);
})();
