(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.3 alkam-data-layer';
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function looksLikeCariArray(a){return Array.isArray(a)&&a.length&&typeof a[0]==='object'}
  function scanKnownWindow(){
    if(looksLikeCariArray(window.ALKAM_CARILER_77_DATA))return {key:'window.ALKAM_CARILER_77_DATA',data:window.ALKAM_CARILER_77_DATA};
    if(looksLikeCariArray(window.ALKAM_CARILER_DATA))return {key:'window.ALKAM_CARILER_DATA',data:window.ALKAM_CARILER_DATA};
    if(window.ALKAM_CARILER_META&&window.ALKAM_CARILER_META.cariSayisi)return {key:'window.ALKAM_CARILER_META mevcut ama data geç yükleniyor',data:[]};
    return null;
  }
  function scanLocalStorage(){
    var fixed=['alkam_cariler','cariler','ALKAM_CARILER','ALKAM_SAFE_CARILER','alkam_safe_cariler','alkamCariler','cariList','cari_list','mukellefler','mükellefler','alkam_mukellefler'];
    for(var i=0;i<fixed.length;i++){var a=readJson(fixed[i]);if(looksLikeCariArray(a))return {key:'localStorage.'+fixed[i],data:a}}
    return null;
  }
  function scanWindow(){
    var known=scanKnownWindow(); if(known&&known.data.length)return known;
    var best=null;
    Object.keys(window).forEach(function(k){try{var v=window[k];if(looksLikeCariArray(v)){if(!best||v.length>best.data.length)best={key:'window.'+k,data:v}}}catch(e){}});
    return best||known;
  }
  function readCarilerWithSource(){return scanKnownWindow()||scanLocalStorage()||scanWindow()||{key:null,data:[]}}
  function readCariler(){return readCarilerWithSource().data}
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function candidates(){return {known:{ALKAM_CARILER_DATA:Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA.length:null,ALKAM_CARILER_77_DATA:Array.isArray(window.ALKAM_CARILER_77_DATA)?window.ALKAM_CARILER_77_DATA.length:null,ALKAM_CARILER_META:window.ALKAM_CARILER_META||null},source:readCarilerWithSource().key}}
  function panel(){var src=readCarilerWithSource();var p=document.getElementById('alkamTahakkukPanel');if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5.3 cari kaynak: '+src.data.length+' · '+(src.key||'bulunamadı')+' · Dönem: '+periodNow()+'</span>'}
  function css(){if(document.getElementById('alkam-tahakkuk-style'))return;var st=document.createElement('style');st.id='alkam-tahakkuk-style';st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}';document.head.appendChild(st)}
  function init(){css();panel()}
  window.addEventListener('alkam:cariler-loaded',function(){setTimeout(panel,100)});
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readCarilerWithSource:readCarilerWithSource,readTahakkuk:readTahakkuk,candidates:candidates,test:function(){var s=readCarilerWithSource();return {version:VERSION,cariler:s.data.length,source:s.key,tahakkuk:readTahakkuk().length,period:periodNow(),known:candidates(),time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setInterval(panel,2000);
})();
