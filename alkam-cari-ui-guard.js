(function(){
function e(i){return document.getElementById(i)}
function c(){return Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA.length:0}
function r(){var s=e('cariSearch'),l=e('cariList');if(!s||!l)return;var t=(l.textContent||'').toLowerCase();if(c()>0&&s.value&&t.indexOf('cari')>-1&&t.indexOf('bul')>-1){s.value='';if(window.renderCariList)window.renderCariList();}}
document.addEventListener('DOMContentLoaded',function(){setTimeout(r,800);setInterval(r,1500)});
window.addEventListener('alkam:cariler-loaded',function(){setTimeout(r,800)});
document.addEventListener('click',function(){setTimeout(r,120)},true);
})();