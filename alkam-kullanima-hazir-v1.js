(function(){
'use strict';
var VERSION='ALKAM Kullanıma Hazır v1.1 - duplicate render disabled';
function run(){
  window.__ALKAM_KULLANIMA_HAZIR_LAST={version:VERSION,status:'duplicate dashboard render disabled to prevent visual flicker',time:new Date().toISOString()};
  return window.__ALKAM_KULLANIMA_HAZIR_LAST;
}
window.ALKAM_KULLANIMA_HAZIR_V1={version:VERSION,run:run,test:run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
