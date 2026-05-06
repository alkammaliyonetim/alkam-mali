(function(){
'use strict';
var VERSION='ALKAM Saha Fix v1';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function up(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
function n(v){var s=String(v||0).replace(/\s/g,'').replace(/TL|₺/gi,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');var x=Number(s);return isFinite(x)?x:0}
function tl(v){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(n(v)))+' TL'}
function dt(x){return String(x.tarih||x.date||x.islem_tarihi||x.created_at||'').slice(0,10)||'-'}
function nameOf(x){return up(x.cari||x.cari_adi||x.cari_unvan||x.unvan||x.mukellef||x.ad||x.name||'')}
function rows(){return [].concat(read('alkam_cari_hareketleri'),read('alkam_tahakkuklar'),read('alkam_tahsilatlar'))}
function isTh(x){var t=up([x.tip,x.type,x.islem_turu,x.aciklama].join(' '));return t.indexOf('TAHAKKUK')>-1||n(x.borc)>0}
function isTs(x){var t=up([x.tip,x.type,x.islem_turu,x.aciklama].join(' '));return t.indexOf('TAHSILAT')>-1||t.indexOf('TAHSİLAT')>-1||n(x.alacak)>0}
function last(name){var u=up(name);var r=rows().filter(function(x){var y=nameOf(x);return y&&(y===u||y.indexOf(u)>-1||u.indexOf(y)>-1)});return{th:r.filter(isTh).sort(function(a,b){return dt(b).localeCompare(dt(a))})[0],ts:r.filter(isTs).sort(function(a,b){return dt(b).localeCompare(dt(a))})[0]}}
function css(){if(q('#alkam-saha-fix-style'))return;var s=document.createElement('style');s.id='alkam-saha-fix-style';s.textContent='.alkamFixSticky{position:sticky!important;top:0!important;z-index:99999!important;background:#fff!important;border:1px solid #dbe4f0!important;border-radius:16px!important;padding:10px!important;box-shadow:0 12px 28px rgba(15,23,42,.10)!important}.alkamFixLast{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;margin-top:8px!important}.alkamFixLast div{background:#f8fbff!important;border:1px solid #dbeafe!important;border-radius:10px!important;padding:7px!important}.alkamFixLast b{display:block!important;font-size:10px!important;color:#64748b!important}.alkamFixLast span{display:block!important;font-size:12px!important;font-weight:950!important}.alkamFixLast em{display:block!important;font-style:normal!important;font-size:10px!important;color:#64748b!important}.alkamFixHide{display:none!important}';document.head.appendChild(s)}
function cardName(card){var h=q('.list-title',card)||q('strong',card)||q('b',card);return h?(h.innerText||'').split('\n')[0].trim():''}
function fixCards(){qa('#tab-cariler .list-item,#tab-cariler [class*=list-item]').forEach(function(card){var nm=cardName(card);if(!nm)return;qa('*',card).forEach(function(el){var t=(el.textContent||'').trim();if(/^Son tahakkuk\s*:/i.test(t)||/^Son tahsilat\s*:/i.test(t))el.classList.add('alkamFixHide')});var old=q('.alkamFixLast',card);if(old)old.remove();var l=last(nm),box=document.createElement('div');box.className='alkamFixLast';box.innerHTML='<div><b>Son Tahakkuk</b><span>'+(l.th?tl(l.th.tutar||l.th.borc):'-')+'</span><em>'+(l.th?dt(l.th):'-')+'</em></div><div><b>Son Tahsilat</b><span>'+(l.ts?tl(l.ts.tutar||l.ts.alacak):'-')+'</span><em>'+(l.ts?dt(l.ts):'-')+'</em></div>';card.appendChild(box)})}
function sticky(){var scope=q('#tab-cariler')||document;qa('button,.btn,.chip,a',scope).forEach(function(el){var t=(el.innerText||'').toLocaleLowerCase('tr-TR');if(t.indexOf('tahakkuk gir')>-1||t.indexOf('tahsilat gir')>-1||t.indexOf('müşteri ekstresi')>-1||t.indexOf('banka onay')>-1){var p=el.parentElement;if(p)p.classList.add('alkamFixSticky')}})}
function run(){css();fixCards();sticky();return{version:VERSION,time:new Date().toISOString()}}
window.ALKAM_SAHA_FIX_V1={run:run,last:last,test:run};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
document.addEventListener('click',function(){setTimeout(run,300)},true);
document.addEventListener('input',function(){setTimeout(run,300)},true);
})();