(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.0 skeleton';
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function readCariler(){
    var keys=['alkam_cariler','cariler','ALKAM_CARILER'];
    for(var i=0;i<keys.length;i++){var a=readJson(keys[i]);if(Array.isArray(a)&&a.length)return a}
    return [];
  }
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function panel(){
    var p=document.getElementById('alkamTahakkukPanel');
    if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}
    p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5 iskelet hazır. Cari: '+readCariler().length+' · Dönem: '+periodNow()+'</span>';
  }
  function css(){
    if(document.getElementById('alkam-tahakkuk-style'))return;
    var st=document.createElement('style');st.id='alkam-tahakkuk-style';
    st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}';
    document.head.appendChild(st);
  }
  function init(){css();panel()}
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readTahakkuk:readTahakkuk,test:function(){return {version:VERSION,cariler:readCariler().length,tahakkuk:readTahakkuk().length,period:periodNow(),time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
