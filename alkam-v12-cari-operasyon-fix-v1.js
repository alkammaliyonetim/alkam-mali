(function(){
  'use strict';
  var VERSION='ALKAM v12 Cari Operasyon Fix v1.0';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function read(k){try{var x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}}
  function norm(s){return String(s||'').toLocaleUpperCase('tr-TR').replace(/\s+/g,' ').trim()}
  function n(v){var x=Number(String(v||0).replace(/\./g,'').replace(',','.'));return isFinite(x)?x:0}
  function fmt(v){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(n(v)))+' TL'}
  function dateOf(x){return String(x.tarih||x.date||x.created_at||x.createdAt||x.islem_tarihi||x.tahakkuk_tarihi||x.tahsilat_tarihi||'')}
  function nameOf(x){return norm(x.cari||x.cari_adi||x.cariAd||x.unvan||x.mukellef||x.ad||x.title||x.name||'')}
  function amountOf(x){return n(x.tutar||x.amount||x.borc||x.alacak||x.net||x.debit||x.credit)}
  function selectedName(){var h=q('#selectedCariDetail .hero-name')||q('#selectedCariDetail h2')||q('#selectedCariDetail h1');return h?String(h.innerText||'').trim():''}
  function allRows(){return [].concat(read('alkam_cari_hareketleri'),read('alkam_tahakkuklar'),read('alkam_tahsilatlar'))}
  function rowsFor(name){var nm=norm(name);return allRows().filter(function(x){var xn=nameOf(x);return xn&&(xn===nm||xn.indexOf(nm)>-1||nm.indexOf(xn)>-1)})}
  function isTah(x){var t=norm([x.tip,x.tur,x.type,x.islem_turu,x.aciklama,x.description].join(' '));return t.indexOf('TAHAKKUK')>-1||n(x.borc)>0}
  function isTahs(x){var t=norm([x.tip,x.tur,x.type,x.islem_turu,x.aciklama,x.description].join(' '));return t.indexOf('TAHSILAT')>-1||t.indexOf('TAHSİLAT')>-1||n(x.alacak)>0}
  function byDate(a,b){return dateOf(b).localeCompare(dateOf(a))}
  function summary(name){var rows=rowsFor(name),tah=rows.filter(isTah).sort(byDate)[0]||null,tahs=rows.filter(isTahs).sort(byDate)[0]||null,borc=0,alacak=0;rows.forEach(function(x){borc+=n(x.borc||x.debit);alacak+=n(x.alacak||x.credit)});return {name:name,rows:rows.length,tah:tah,tahs:tahs,bakiye:borc-alacak,borc:borc,alacak:alacak}}
  function css(){if(q('#alkam-v12-cari-operasyon-fix-style'))return;var st=document.createElement('style');st.id='alkam-v12-cari-operasyon-fix-style';st.textContent=[
    '#tab-cariler>.grid-2{grid-template-columns:minmax(360px,430px) minmax(0,1fr)!important;gap:14px!important;align-items:start!important}',
    '#tab-cariler .section:first-child{background:#fff!important;border:1px solid #dbe4f0!important;border-radius:16px!important;box-shadow:0 10px 28px rgba(15,23,42,.06)!important}',
    '#tab-cariler .toolbar{grid-template-columns:1fr 118px 108px!important;gap:8px!important}',
    '#tab-cariler .grid-4,#tab-cariler .expense-mini-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}',
    '#tab-cariler .metric-mini{min-height:72px!important;padding:10px!important;border-radius:12px!important;background:#fbfdff!important}',
    '#tab-cariler .metric-mini.alkam-empty-metric{display:none!important}',
    '.alkam-cari-lastline{margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:6px}',
    '.alkam-cari-lastbox{border:1px solid #e2e8f0;background:#f8fbff;border-radius:10px;padding:7px}',
    '.alkam-cari-lastbox b{display:block;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.04em}',
    '.alkam-cari-lastbox span{display:block;margin-top:3px;font-size:11px;font-weight:950;color:#0f172a}',
    '.alkam-cari-lastbox em{display:block;margin-top:2px;font-style:normal;font-size:10px;color:#64748b;font-weight:800}',
    '#alkamStickyCariOps{position:sticky;top:62px;z-index:80;margin:0 0 10px;padding:10px 12px;border:1px solid #bfdbfe;background:rgba(239,246,255,.96);backdrop-filter:blur(8px);border-radius:14px;box-shadow:0 12px 28px rgba(15,23,42,.08);display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '#alkamStickyCariOps .name{font-size:15px;font-weight:950;color:#0f172a}',
    '#alkamStickyCariOps .meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}',
    '#alkamStickyCariOps .pill{display:inline-flex;border-radius:999px;background:#fff;border:1px solid #dbe4f0;padding:5px 8px;font-size:11px;font-weight:900;color:#334155}',
    '#alkamStickyCariOps .ops{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}',
    '#alkamStickyCariOps button{height:30px;border:0;border-radius:8px;background:#1769e8;color:#fff;font-size:11px;font-weight:950;padding:0 9px;cursor:pointer}',
    '#alkamStickyCariOps button.soft{background:#e8eef9;color:#0f172a}',
    '#alkamStickyCariOps button.warn{background:#fff7ed;color:#9a3412;border:1px solid #fed7aa}',
    '.alkam-bank-priority{border-color:#fed7aa!important;background:#fff7ed!important;color:#9a3412!important}',
    '@media(max-width:1280px){#tab-cariler>.grid-2{grid-template-columns:1fr!important}#alkamStickyCariOps{top:8px;display:block}.alkam-cari-lastline{grid-template-columns:1fr}#alkamStickyCariOps .ops{justify-content:flex-start;margin-top:8px}}'
  ].join('\n');document.head.appendChild(st)}
  function cleanEmptyMetrics(){qa('#tab-cariler .metric-mini').forEach(function(el){var txt=norm(el.innerText),v=(q('.v',el)||el).innerText||'';if((txt.indexOf('İŞLETME')>-1||txt.indexOf('ISLETME')>-1||txt.indexOf('BİLANÇO')>-1||txt.indexOf('BILANCO')>-1||txt.indexOf('LTD')>-1||txt.indexOf('A.Ş')>-1||txt.indexOf('BU AY')>-1||txt.indexOf('BU YIL')>-1)&&/0\s*\/\s*0|0,00\s*TL/.test(v.replace(/\n/g,' ')))el.classList.add('alkam-empty-metric')})}
  function enrichList(){qa('#tab-cariler .list-item').forEach(function(item){var title=q('.list-title',item);if(!title)return;var old=q('.alkam-cari-lastline',item);if(old)old.remove();var s=summary(title.innerText),tah=s.tah?fmt(amountOf(s.tah)||n(s.tah.borc)):'-',tahD=s.tah?dateOf(s.tah).slice(0,10):'-',tahs=s.tahs?fmt(amountOf(s.tahs)||n(s.tahs.alacak)):'-',tahsD=s.tahs?dateOf(s.tahs).slice(0,10):'-';var line=document.createElement('div');line.className='alkam-cari-lastline';line.innerHTML='<div class="alkam-cari-lastbox"><b>Son Tahakkuk</b><span>'+tah+'</span><em>'+tahD+'</em></div><div class="alkam-cari-lastbox"><b>Son Tahsilat</b><span>'+tahs+'</span><em>'+tahsD+'</em></div>';item.appendChild(line);item.dataset.alkamEnriched='1'})}
  function clickByText(words){var w=words.map(norm),btn=qa('button,.btn,a').find(function(b){var t=norm(b.innerText);return w.some(function(x){return t.indexOf(x)>-1})});if(btn)btn.click()}
  window.ALKAM_CLICK_BY_TEXT=clickByText;
  function sticky(){var root=q('#selectedCariDetail');if(!root)return;var name=selectedName();if(!name)return;var s=summary(name),bar=q('#alkamStickyCariOps');if(!bar){bar=document.createElement('div');bar.id='alkamStickyCariOps';root.insertBefore(bar,root.firstChild)}var b=s.bakiye>0?'BAKİYE B':(s.bakiye<0?'BAKİYE A':'KAPALI'),tah=s.tah?fmt(amountOf(s.tah)||n(s.tah.borc))+' / '+dateOf(s.tah).slice(0,10):'-',tahs=s.tahs?fmt(amountOf(s.tahs)||n(s.tahs.alacak))+' / '+dateOf(s.tahs).slice(0,10):'-';bar.innerHTML='<div><div class="name">'+name+'</div><div class="meta"><span class="pill">'+fmt(s.bakiye)+' '+b+'</span><span class="pill">Son Tahakkuk: '+tah+'</span><span class="pill">Son Tahsilat: '+tahs+'</span></div></div><div class="ops"><button onclick="ALKAM_CLICK_BY_TEXT([\'Tahakkuk Gir\'])">Tahakkuk Gir</button><button onclick="ALKAM_CLICK_BY_TEXT([\'Tahsilat Gir\',\'Cari Tahsilat\'])">Tahsilat Gir</button><button class="soft" onclick="ALKAM_CLICK_BY_TEXT([\'Müşteri Ekstresi\',\'Musteri Ekstresi\'])">Ekstre</button><button class="soft" onclick="ALKAM_CLICK_BY_TEXT([\'Kontrol Et\'])">Kontrol</button><button class="warn" onclick="ALKAM_CLICK_BY_TEXT([\'Banka İçe Aktar\',\'Banka Ice Aktar\'])">Banka Aktar</button></div>'}
  function markBank(){qa('button,.btn,.nav-btn').forEach(function(b){var t=norm(b.innerText);if(t.indexOf('BANKA İÇE AKTAR')>-1||t.indexOf('BANKA ICE AKTAR')>-1)b.classList.add('alkam-bank-priority')})}
  function run(){css();cleanEmptyMetrics();enrichList();sticky();markBank();var name=selectedName();window.__ALKAM_V12_CARI_OPERASYON_LAST={version:VERSION,selected:name,enriched:qa('#tab-cariler .list-item[data-alkam-enriched="1"]').length,sticky:!!q('#alkamStickyCariOps'),time:new Date().toISOString()};return window.__ALKAM_V12_CARI_OPERASYON_LAST}
  function boot(){run();setInterval(run,3500);try{new MutationObserver(function(){run()}).observe(document.body,{childList:true,subtree:true})}catch(e){}}
  window.ALKAM_V12_CARI_OPERASYON_FIX_V1={version:VERSION,run:run,test:function(){return run()},summaryFor:summary};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();