(function(){
'use strict';
function el(id){return document.getElementById(id)}
function cariler(){
 try{var a=JSON.parse(localStorage.getItem('ALKAM_FINAL_CARILER_V1')||'[]');if(Array.isArray(a)&&a.length)return a}catch(e){}
 return Array.isArray(window.ALKAM_CARILER_DATA)?window.ALKAM_CARILER_DATA:[];
}
function nameOf(c){return c&&(c.name||c.cari||c.cari_adi||c.unvan||c.title||c.code||c.kod)}
function sampleName(){
 var c=cariler().find(function(x){return x&&!x.deleted&&nameOf(x)});
 return nameOf(c)||'ALKAM CARI';
}
function apply(){
 var msg=sampleName()+' tahsilat 12.500,00 TL';
 var t=el('simpleTelegramText');
 if(t) t.placeholder=msg;
 var b=el('simpleBankText');
 if(b) b.placeholder='18.05.2026 '+msg;
}
window.ALKAM_CARI_TEST_GUARD={apply:apply,sample:function(){return sampleName()+' tahsilat 12.500,00 TL'}};
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,700);setInterval(apply,1500)});
window.addEventListener('alkam:cariler-loaded',function(){setTimeout(apply,700)});
document.addEventListener('click',function(){setTimeout(apply,80)},true);
})();
