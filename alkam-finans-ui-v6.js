(function(){
'use strict';
var VERSION='ALKAM Finans UI v6.2 passive';
function q(s,r){return (r||document).querySelector(s)}
function finance(){try{return window.ALKAM_FINANS_FLOW_V6&&window.ALKAM_FINANS_FLOW_V6.summary?window.ALKAM_FINANS_FLOW_V6.summary():null}catch(e){return null}}
function run(){
  var r={version:VERSION,financeReady:!!finance(),status:'passive',time:new Date().toISOString()};
  window.__ALKAM_FINANS_UI_LAST=r;
  return r;
}
window.ALKAM_FINANS_UI_V6={version:VERSION,run:run,test:run,last:function(){return window.__ALKAM_FINANS_UI_LAST||run()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
