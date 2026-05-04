(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.1 source-fix';
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function looksLikeCariArray(a){
    return Array.isArray(a)&&a.length&&typeof a[0]==='object'&&JSON.stringify(a[0]).toLowerCase().match(/cari|unvan|ünvan|vergi|telefon|muhasebe|ucret|ücret|defter/);
  }
  function readCarilerWithSource(){
    var fixed=['alkam_cariler','cariler','ALKAM_CARILER','ALKAM_SAFE_CARILER','alkam_safe_cariler','alkamCariler','cariList','cari_list','mukellefler','alkam_mukellefler'];
    for(var i=0;i<fixed.length;i++){var a=readJson(fixed[i]);if(looksLikeCariArray(a))return {key:fixed[i],data:a}}
    for(var j=0;j<localStorage.length;j++){
      var key=localStorage.key(j)||'';
      if(!/cari|cariler|mukellef|mükellef|alkam/i.test(key))continue;
      var b=readJson(key);
      if(looksLikeCariArray(b))return {key:key,data:b};
    }
    if(window.ALKAM_SAFE_CARI_AUTOMATION_PATCH_20260429&&Array.isArray(window.ALKAM_SAFE_CARI_AUTOMATION_PATCH_20260429.cariler)){
      return {key:'window.ALKAM_SAFE_CARI_AUTOMATION_PATCH_20260429.cariler',data:window.ALKAM_SAFE_CARI_AUTOMATION_PATCH_20260429.cariler};
    }
    return {key:null,data:[]};
  }
  function readCariler(){return readCarilerWithSource().data}
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function panel(){
    var src=readCarilerWithSource();
    var p=document.getElementById('alkamTahakkukPanel');
    if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}
    p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5 kaynak kontrol hazır. Cari: '+src.data.length+' · Kaynak: '+(src.key||'bulunamadı')+' · Dönem: '+periodNow()+'</span>';
  }
  function css(){
    if(document.getElementById('alkam-tahakkuk-style'))return;
    var st=document.createElement('style');st.id='alkam-tahakkuk-style';
    st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}';
    document.head.appendChild(st);
  }
  function init(){css();panel()}
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readCarilerWithSource:readCarilerWithSource,readTahakkuk:readTahakkuk,test:function(){var s=readCarilerWithSource();return {version:VERSION,cariler:s.data.length,source:s.key,tahakkuk:readTahakkuk().length,period:periodNow(),localStorageKeys:Array.from({length:localStorage.length},function(_,i){return localStorage.key(i)}).filter(function(k){return /cari|cariler|mukellef|mükellef|alkam/i.test(k||'')}),time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setInterval(panel,3000);
})();
