(function(){
'use strict';
function list(){try{var a=JSON.parse(localStorage.getItem('ALKAM_FINAL_CARILER_V1')||'[]');if(Array.isArray(a)&&a.length)return a}catch(e){}return Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA:[]}
function nm(c){return c&&(c.name||c.cari||c.cari_adi||c.unvan||c.title||c.code||c.kod)}
function first(){var c=list().find(function(x){return x&&!x.deleted&&nm(x)});return nm(c)||'ALKAM CARI'}
function text(){return first()+' tahsilat 12.500,00 TL'}
function run(){var m=text();document.querySelectorAll('textarea').forEach(function(x){x.setAttribute('placeholder',m)});var b=document.getElementById('simpleBankText');if(b)b.setAttribute('placeholder','18.05.2026 '+m)}
window.ALKAM_CARI_PLACEHOLDER_GUARD_V2={run:run,sample:text};
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);setInterval(run,1200)});
window.addEventListener('alkam:cariler-loaded',function(){setTimeout(run,600)});
document.addEventListener('click',function(){setTimeout(run,60)},true);
})();
