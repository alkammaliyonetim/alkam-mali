(function(){
'use strict';
var VERSION='ALKAM Cari Sticky LastFix v1.0';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
function up(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
function n(v){var s=String(v||0).replace(/\s/g,'').replace(/TL|₺/gi,'');if(s.indexOf(',')>-1)s=s.replace(/\./g,'').replace(',','.');var x=Number(s);return isFinite(x)?x:0}
function tl(v){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(n(v)))+' TL'}
function dt(x){return String(x.tarih||x.date||x.islem_tarihi||x.created_at||'').slice(0,10)||'-'}
function nm(x){return up(x.cari||x.cari_adi||x.cari_unvan||x.unvan||x.mukellef||x.ad||x.name||'')}
function allRows(){return [].concat(read('alkam_cari_hareketleri'),read('alkam_tahsilatlar'),read('alkam_tahakkuklar'))}
function isTahakkuk(x){var t=up([x.tip,x.type,x.islem,x.islem_turu,x.aciklama,x.description].join(' '));return t.indexOf('TAHAKKUK')>-1||n(x.borc)>0}
function isTahsilat(x){var t=up([x.tip,x.type,x.islem,x.islem_turu,x.aciklama,x.description].join(' '));return t.indexOf('TAHSILAT')>-1||t.indexOf('TAHSİLAT')>-1||n(x.alacak)>0}
function amount(x,kind){if(kind==='tahakkuk')return n(x.tutar||x.borc||0);return n(x.tutar||x.alacak||0)}
function matchRows(name){var u=up(name);return allRows().filter(function(x){var y=nm(x);return y&&(y===u||y.indexOf(u)>-1||u.indexOf(y)>-1)})}
function lastFor(name){var rows=matchRows(name);var th=rows.filter(isTahakkuk).sort(function(a,b){return dt(b).localeCompare(dt(a))})[0];var ts=rows.filter(isTahsilat).sort(function(a,b){return dt(b).localeCompare(dt(a))})[0];return{tahakkuk:th,tahsilat:ts}}
function css(){if(q('#alkam-cari-sticky-lastfix-style'))return;var st=document.createElement('style');st.id='alkam-cari-sticky-lastfix-style';st.textContent=[
'.alkam-cari-stickybar{position:sticky!important;top:0!important;z-index:99950!important;background:rgba(255,255,255,.96)!important;backdrop-filter:blur(10px)!important;border:1px solid #dbe4f0!important;border-radius:16px!important;padding:10px!important;box-shadow:0 12px 28px rgba(15,23,42,.08)!important}',
'.alkam-cari-stickybar .metric-mini,.alkam-cari-stickybar .card{box-shadow:none!important}',
'.alkam-card-last-clean{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px!important}.alkam-card-last-clean div{background:#f8fbff;border:1px solid #dbeafe;border-radius:10px;padding:7px}.alkam-card-last-clean b{display:block;font-size:10px;color:#64748b;text-transform:uppercase}.alkam-card-last-clean span{display:block;font-size:12px;font-weight:950;color:#0f172a;margin-top:3px}.alkam-card-last-clean em{display:block;font-style:normal;font-size:10px;color:#64748b;font-weight:850;margin-top:2px}',
'.alkam-old-last-line{display:none!important}',
'@media(max-width:760px){.alkam-cari-stickybar{top:0!important;border-radius:12px!important}.alkam-card-last-clean{grid-template-columns:1fr}.alkam-card-last-clean span{font-size:13px}}'
].join('\n');document.head.appendChild(st)}
function fixCard(item){var title=q('.list-title',item)||q('b',item)||q('strong',item);if(!title)return;var name=title.innerText||title.textContent||'';if(!name.trim())return;var last=lastFor(name);var old=q('.alkam-card-last-clean',item);if(old)old.remove();
 // hide old misleading son tahakkuk/tahsilat text lines that end with 0,00 TL
 qa('*',item).forEach(function(el){var t=String(el.childNodes&&el.childNodes.length===1?el.textContent:'').trim();if(/^Son tahakkuk\s*:/i.test(t)||/^Son tahsilat\s*:/i.test(t)){el.classList.add('alkam-old-last-line')}});
 var box=document.createElement('div');box.className='alkam-card-last-clean';
 var th=last.tahakkuk,ts=last.tahsilat;
 box.innerHTML='<div><b>Son Tahakkuk</b><span>'+(th?tl(amount(th,'tahakkuk')):'-')+'</span><em>'+(th?dt(th):'-')+'</em></div><div><b>Son Tahsilat</b><span>'+(ts?tl(amount(ts,'tahsilat')):'-')+'</span><em>'+(ts?dt(ts):'-')+'</em></div>';
 item.appendChild(box)}
function fixCards(){qa('#tab-cariler .list-item, #tab-cariler [class*="list-item"], #tab-cariler .cari-card').forEach(fixCard)}
function makeSticky(){var scope=q('#tab-cariler');if(!scope)return;var selectedName=qa('h1,h2,h3,.section-title,.detail-title',scope).find(function(el){return /HUKUK|SEVİNÇ|OPTİK|TAMER|BAŞOL|BÜROSU|A\.Ş|LTD/i.test(el.innerText||'')});
 var btnRow=qa('button,.btn,.chip',scope).filter(function(el){var t=String(el.innerText||'').toLocaleLowerCase('tr-TR');return ['tahakkuk gir','tahsilat gir','müşteri ekstresi','kontrol et','onay merkezi','moka','banka onay','banka içe aktar','banka geçmiş','güven raporu','ai merkezi'].some(function(k){return t.indexOf(k)>-1})});
 if(!btnRow.length)return;var parent=btnRow[0].parentElement;if(parent&&!parent.classList.contains('alkam-cari-stickybar'))parent.classList.add('alkam-cari-stickybar')}
function run(){css();fixCards();makeSticky();window.__ALKAM_CARI_STICKY_LASTFIX_LAST={version:VERSION,time:new Date().toISOString()};return window.__ALKAM_CARI_STICKY_LASTFIX_LAST}
function boot(){run();setTimeout(run,600);setTimeout(run,1600);document.addEventListener('click',function(){setTimeout(run,250)},true);document.addEventListener('input',function(){setTimeout(run,250)},true)}
window.ALKAM_CARI_STICKY_LASTFIX_V1={version:VERSION,run:run,test:run,lastFor:lastFor};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();