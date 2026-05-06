(function(){
'use strict';
var VERSION='ALKAM Data Quality v1.1 passive';
function q(s,r){return (r||document).querySelector(s)}
function run(){var p=q('#alkamDataQualityPanel');if(p)p.remove();var r={version:VERSION,status:'passive',time:new Date().toISOString()};window.__ALKAM_DATA_QUALITY_LAST=r;return r}
window.ALKAM_DATA_QUALITY={version:VERSION,run:run,test:run,last:function(){return window.__ALKAM_DATA_QUALITY_LAST||run()}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
