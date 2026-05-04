(function(){
  'use strict';
  var VERSION='ALKAM Tahakkuk Control v5C';
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function periodNow(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function run(period){
    var p=period||periodNow();
    var list=readJson('alkam_tahakkuklar').filter(function(x){return String(x.donem||x.period||'')===p});
    var total=list.reduce(function(t,x){return t+Number(x.borc||x.tutar||0)},0);
    var res={version:VERSION,period:p,count:list.length,total:total,time:new Date().toISOString()};
    window.__ALKAM_TAHAKKUK_CONTROL_LAST=res;
    return res;
  }
  window.ALKAM_TAHAKKUK_CONTROL_V5C={version:VERSION,run:run,test:function(){return run(periodNow())},last:function(){return window.__ALKAM_TAHAKKUK_CONTROL_LAST}};
  run(periodNow());
})();
