(function(){
'use strict';
var VERSION='ALKAM Dashboard Gorunum Tercihi v11.28 stable noop';
var KEY='alkam_dashboard_view_mode';
function getMode(){return localStorage.getItem(KEY)||'compact'}
function setMode(mode){if(['normal','compact','ultra'].indexOf(mode)===-1)mode='compact';localStorage.setItem(KEY,mode);window.__ALKAM_DASHBOARD_GORUNUM_LAST={version:VERSION,mode:mode,status:'periodic loop disabled',time:new Date().toISOString()};return mode}
function apply(){var mode=getMode();window.__ALKAM_DASHBOARD_GORUNUM_LAST={version:VERSION,mode:mode,status:'periodic loop disabled',time:new Date().toISOString()};return true}
window.ALKAM_DASHBOARD_GORUNUM_TERCIHI_V11={version:VERSION,get:getMode,set:setMode,apply:apply,hideOldToggles:function(){return true},run:apply,test:function(){return {version:VERSION,applied:apply(),mode:getMode(),time:new Date().toISOString()}},last:function(){return window.__ALKAM_DASHBOARD_GORUNUM_LAST||null}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
})();
