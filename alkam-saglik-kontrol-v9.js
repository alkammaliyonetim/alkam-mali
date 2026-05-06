(function(){
'use strict';
var VERSION='ALKAM Saglik Kontrol v9.4 unified';
var KEY='alkam_saglik_kontrol_log';
function q(s,r){return (r||document).querySelector(s)}
function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
function writeJson(k,v){localStorage.setItem(k,JSON.stringify(v))}
function now(){return new Date().toISOString()}
function check(){
  var checks=[];
  function add(name,ok,detail){checks.push({name:name,ok:!!ok,detail:detail||'',time:now()})}
  add('Reliability Guard',!!window.ALKAM_RELIABILITY_GUARD,'Yedek katmanı');
  add('Cari Core',!!window.ALKAM_CARI_CORE_V4,'Cari ekstre çekirdeği');
  add('Data Quality',!!window.ALKAM_DATA_QUALITY,'Veri kalite kontrolü');
  add('Tahakkuk',!!window.ALKAM_TAHAKKUK_V5,'Tahakkuk modülü');
  add('Tahsilat',!!window.ALKAM_TAHSILAT_V7,'Tahsilat modülü');
  add('Finans Flow',!!window.ALKAM_FINANS_FLOW_V6,'Finans hesapları');
  add('Banka Onay',!!window.ALKAM_BANKA_ONAY_V8,'Banka onay çekirdeği');
  add('Güvenilirlik Raporu',!!window.ALKAM_GUVENILIRLIK_RAPORU_V9,'Genel rapor');
  var fail=checks.filter(function(x){return !x.ok});
  var result={version:VERSION,status:fail.length?'warning':'ok',total:checks.length,ok:checks.length-fail.length,fail:fail.length,checks:checks,time:now()};
  window.__ALKAM_SAGLIK_LAST=result;
  var logs=readJson(KEY);logs.unshift(result);writeJson(KEY,logs.slice(0,100));
  var badge=q('#alkamHealthBadge');if(badge)badge.remove();
  return result;
}
function open(){return window.__ALKAM_SAGLIK_LAST||check()}
function run(){setTimeout(check,600)}
window.ALKAM_SAGLIK_KONTROL_V9={version:VERSION,check:check,open:open,logs:function(){return readJson(KEY)},last:function(){return window.__ALKAM_SAGLIK_LAST||check()},test:function(){var r=check();return {version:VERSION,badge:false,status:r.status,ok:r.ok,total:r.total,time:now()}}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
