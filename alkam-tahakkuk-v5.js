(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk v5.2 window-source-scan';
  function now(){return new Date().toISOString()}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function readJson(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):[]}catch(e){return []}}
  function looksLikeCariArray(a){
    if(!Array.isArray(a)||!a.length||typeof a[0]!=='object')return false;
    var sample=JSON.stringify(a.slice(0,3)).toLowerCase();
    var score=0;
    ['cari','unvan','ünvan','vergi','telefon','muhasebe','ucret','ücret','defter','bakiye','tahakkuk','tahsilat'].forEach(function(w){if(sample.indexOf(w)>-1)score++});
    return score>=1;
  }
  function scanLocalStorage(){
    var fixed=['alkam_cariler','cariler','ALKAM_CARILER','ALKAM_SAFE_CARILER','alkam_safe_cariler','alkamCariler','cariList','cari_list','mukellefler','mükellefler','alkam_mukellefler','alkam-cariler-77-28-04-2026'];
    for(var i=0;i<fixed.length;i++){var a=readJson(fixed[i]);if(looksLikeCariArray(a))return {key:'localStorage.'+fixed[i],data:a}}
    for(var j=0;j<localStorage.length;j++){var key=localStorage.key(j)||'';var b=readJson(key);if(looksLikeCariArray(b))return {key:'localStorage.'+key,data:b}}
    return null;
  }
  function scanWindow(){
    var best=null;
    Object.keys(window).forEach(function(k){
      try{
        var v=window[k];
        if(looksLikeCariArray(v)){ if(!best||v.length>best.data.length) best={key:'window.'+k,data:v}; }
        else if(v&&typeof v==='object'){
          ['cariler','cariList','data','items','rows','mukellefler','mükellefler'].forEach(function(p){
            try{var a=v[p]; if(looksLikeCariArray(a)){ if(!best||a.length>best.data.length) best={key:'window.'+k+'.'+p,data:a}; }}catch(e){}
          });
        }
      }catch(e){}
    });
    return best;
  }
  function readCarilerWithSource(){return scanLocalStorage()||scanWindow()||{key:null,data:[]}}
  function readCariler(){return readCarilerWithSource().data}
  function readTahakkuk(){return readJson('alkam_tahakkuklar')}
  function candidateReport(){
    var out=[];
    for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||'';var a=readJson(k);if(Array.isArray(a))out.push({key:'localStorage.'+k,length:a.length,looksLikeCari:looksLikeCariArray(a)})}
    Object.keys(window).slice(0,500).forEach(function(k){try{var v=window[k];if(Array.isArray(v))out.push({key:'window.'+k,length:v.length,looksLikeCari:looksLikeCariArray(v)})}catch(e){}});
    return out.sort(function(a,b){return (b.looksLikeCari-a.looksLikeCari)||(b.length-a.length)}).slice(0,30);
  }
  function panel(){
    var src=readCarilerWithSource();
    var p=document.getElementById('alkamTahakkukPanel');
    if(!p){p=document.createElement('div');p.id='alkamTahakkukPanel';document.body.appendChild(p)}
    p.innerHTML='<b>Muhasebe Ücreti Tahakkuk</b><br><span>v5 kaynak tarama. Cari: '+src.data.length+' · Kaynak: '+(src.key||'bulunamadı')+' · Dönem: '+periodNow()+'</span>';
  }
  function css(){
    if(document.getElementById('alkam-tahakkuk-style'))return;
    var st=document.createElement('style');st.id='alkam-tahakkuk-style';
    st.textContent='#alkamTahakkukPanel{position:fixed;left:22px;bottom:22px;z-index:999996;background:#fff;border:1px solid #bfdbfe;border-radius:14px;padding:12px;box-shadow:0 18px 42px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#0f172a}#alkamTahakkukPanel b{color:#1d4ed8;font-size:14px}';
    document.head.appendChild(st);
  }
  function init(){css();panel()}
  window.ALKAM_TAHAKKUK_V5={version:VERSION,periodNow:periodNow,readCariler:readCariler,readCarilerWithSource:readCarilerWithSource,readTahakkuk:readTahakkuk,candidates:candidateReport,test:function(){var s=readCarilerWithSource();return {version:VERSION,cariler:s.data.length,source:s.key,tahakkuk:readTahakkuk().length,period:periodNow(),candidates:candidateReport(),time:now()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  setInterval(panel,3000);
})();
