(function(){
'use strict';
var VERSION='ALKAM UI Debug Clean v1.1 stable';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function css(){if(q('#alkam-ui-debug-clean-style'))return;var st=document.createElement('style');st.id='alkam-ui-debug-clean-style';st.textContent='.alkam-debug-clean{display:none!important}.alkam-live-only{display:none!important}';document.head.appendChild(st)}
function clean(){css();var keys=['v12 preflight','sonuç export','sonuc export','final test','cache','deploy','canlı test','canli test','görsel kontrol','gorsel kontrol','preflight'];qa('button,a,.btn,.chip').forEach(function(el){var txt=String(el.innerText||el.textContent||'').toLocaleLowerCase('tr-TR');if(keys.some(function(k){return txt.indexOf(k)>-1}))el.classList.add('alkam-debug-clean')});qa('body>div,body>section,body>aside').forEach(function(el){var txt=String(el.innerText||'').slice(0,260).toLocaleLowerCase('tr-TR');if(keys.some(function(k){return txt.indexOf(k)>-1})&&!el.closest('.main')&&!el.closest('.sidebar'))el.classList.add('alkam-debug-clean')});window.__ALKAM_UI_DEBUG_CLEAN_LAST={version:VERSION,time:new Date().toISOString()};return window.__ALKAM_UI_DEBUG_CLEAN_LAST}
function boot(){clean();try{new MutationObserver(function(){clearTimeout(window.__ALKAM_UI_DEBUG_CLEAN_TIMER);window.__ALKAM_UI_DEBUG_CLEAN_TIMER=setTimeout(clean,350)}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
window.ALKAM_UI_DEBUG_CLEAN_V1={version:VERSION,run:clean,test:clean};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
