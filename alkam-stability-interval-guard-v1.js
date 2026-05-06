(function(){
'use strict';
var VERSION='ALKAM Stability Interval Guard v1.0';
var blockedKeywords=['alkamCariCoreBanner','alkamDataQualityPanel','alkamReadyDash','alkamCleanDashboard','alkamHealthBadge','alkamCriticalBadge'];
function shouldBlock(fn,delay){
  var s=String(fn||'');
  if(Number(delay||0)<1000)return false;
  return blockedKeywords.some(function(k){return s.indexOf(k)>-1});
}
function install(){
  if(window.__ALKAM_INTERVAL_GUARD_INSTALLED)return;
  window.__ALKAM_INTERVAL_GUARD_INSTALLED=true;
  var nativeSet=window.setInterval;
  var nativeClear=window.clearInterval;
  window.__ALKAM_BLOCKED_INTERVALS=[];
  window.setInterval=function(fn,delay){
    if(shouldBlock(fn,delay)){
      window.__ALKAM_BLOCKED_INTERVALS.push({delay:delay,code:String(fn).slice(0,160),time:new Date().toISOString()});
      return 0;
    }
    return nativeSet.apply(window,arguments);
  };
  window.ALKAM_STABILITY_INTERVAL_GUARD_V1={version:VERSION,blocked:function(){return window.__ALKAM_BLOCKED_INTERVALS||[]},nativeClear:nativeClear};
}
install();
})();
