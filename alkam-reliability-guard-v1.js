(function(){
  'use strict';
  var VERSION='ALKAM Reliability Guard v1.0';
  var BACKUP_KEY='ALKAM_RELIABILITY_BACKUPS_V1';
  var LOG_KEY='ALKAM_RELIABILITY_LOG_V1';
  var WATCH_KEYS=['alkam_tahakkuklar','alkam_cari_hareketleri'];
  function readJson(k,fb){try{var v=localStorage.getItem(k);return v?JSON.parse(v):fb}catch(e){return fb}}
  function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
  function snapshot(reason){
    var item={id:'RG-'+Date.now(),reason:reason||'manuel',time:new Date().toISOString(),data:{}};
    WATCH_KEYS.forEach(function(k){item.data[k]=localStorage.getItem(k)||'[]'});
    var list=readJson(BACKUP_KEY,[]); list.unshift(item); writeJson(BACKUP_KEY,list.slice(0,30));
    log('SNAPSHOT',reason||'manuel',item.id);
    return item;
  }
  function restore(id){
    var list=readJson(BACKUP_KEY,[]); var item=list.find(function(x){return x.id===id});
    if(!item)return {ok:false,reason:'Yedek bulunamadı',id:id};
    Object.keys(item.data||{}).forEach(function(k){localStorage.setItem(k,item.data[k])});
    log('RESTORE','Yedekten geri dönüldü',id);
    return {ok:true,restored:id,time:new Date().toISOString()};
  }
  function log(type,msg,ref){var l=readJson(LOG_KEY,[]);l.unshift({type:type,message:msg,ref:ref||'',time:new Date().toISOString()});writeJson(LOG_KEY,l.slice(0,200))}
  function status(){
    var backups=readJson(BACKUP_KEY,[]), logs=readJson(LOG_KEY,[]);
    return {version:VERSION,watchKeys:WATCH_KEYS,backupCount:backups.length,lastBackup:backups[0]||null,logCount:logs.length,time:new Date().toISOString()};
  }
  window.ALKAM_RELIABILITY_GUARD={version:VERSION,snapshot:snapshot,restore:restore,status:status,log:log,backups:function(){return readJson(BACKUP_KEY,[])},logs:function(){return readJson(LOG_KEY,[])}};
  console.info('ALKAM Reliability Guard aktif',status());
})();
