(function(){
  'use strict';
  var VERSION='ALKAM Cari Core v4.2';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function parseMoney(v){
    if(v===undefined||v===null)return 0;
    var raw=String(v); var neg=/^-/.test(raw)||/\bA\b/.test(raw);
    var s=raw.replace(/TL|₺|Bakiye|B|A/g,'').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',', '.');
    var n=parseFloat(s); if(isNaN(n)) n=0; return neg?-Math.abs(n):n;
  }
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function label(n){return Number(n||0)>0?'Bakiye B':(Number(n||0)<0?'Bakiye A':'Bakiye 0')}
  function root(){return q('#selectedCariDetail')||q('#tab-cariler')||document.body}
  function tables(r){return qa('table',r).filter(function(t){var x=(t.textContent||'').toLowerCase();return x.indexOf('borç')>-1&&x.indexOf('alacak')>-1&&(x.indexOf('kaynak')>-1||x.indexOf('bakiye')>-1)})}
  function sourceCheck(t){
    var heads=qa('thead th',t); if(!heads.length)return;
    var has=heads.some(function(th){return (th.textContent||'').toLowerCase().indexOf('kaynak')>-1});
    if(has)return;
    var hr=q('thead tr',t); if(!hr)return;
    var th=document.createElement('th'); th.textContent='Kaynak'; hr.appendChild(th);
    qa('tbody tr',t).forEach(function(tr){var td=document.createElement('td');td.innerHTML='<span class="alkam-source-missing">Kaynak Eksik</span>';tr.appendChild(td)})
  }
  function recalc(t){
    var heads=qa('thead th',t).map(function(th){return (th.textContent||'').toLowerCase()});
    var b=heads.findIndex(function(h){return h.indexOf('borç')>-1||h.indexOf('borc')>-1});
    var a=heads.findIndex(function(h){return h.indexOf('alacak')>-1});
    var k=heads.findIndex(function(h){return h.indexOf('bakiye')>-1});
    if(b<0||a<0)return 0;
    var run=0;
    qa('tbody tr',t).forEach(function(tr){var c=qa('td',tr); if(!c.length)return; run+=parseMoney(c[b]&&c[b].textContent)-parseMoney(c[a]&&c[a].textContent); tr.setAttribute('data-alkam-running-balance',String(run)); if(k>=0&&c[k]){var txt=c[k].textContent||''; if(!txt.trim()||txt.indexOf('NaN')>-1)c[k].textContent=money(run)+' '+(run>0?'B':run<0?'A':'')}});
    t.setAttribute('data-alkam-cari-core-checked','1'); t.setAttribute('data-alkam-visible-balance',String(run)); return run;
  }
  function banner(count,balance){
    var el=document.getElementById('alkamCariCoreBanner');
    if(!el){el=document.createElement('div'); el.id='alkamCariCoreBanner'; document.body.appendChild(el)}
    el.className='alkam-cari-core-banner';
    el.innerHTML='<div class="alkam-cari-core-title">Ekstre Kontrolü: Aktif</div><div class="alkam-cari-core-sub">Borç - Alacak = Bakiye kontrolü çalışıyor. Tablo: '+count+' adet. Görünen kapanış: '+money(balance)+' '+(balance>0?'B':balance<0?'A':'')+'</div>';
  }
  function css(){
    if(q('#alkam-cari-core-v4-style'))return;
    var st=document.createElement('style'); st.id='alkam-cari-core-v4-style';
    st.textContent='#alkamCariCoreBanner{position:fixed!important;right:22px!important;top:92px!important;z-index:999998!important;display:block!important;max-width:390px!important;padding:12px 14px!important;border:1px solid #93c5fd!important;background:linear-gradient(180deg,#eff6ff,#fff)!important;color:#1e3a8a!important;border-radius:14px!important;box-shadow:0 18px 42px rgba(15,23,42,.18)!important;font-family:Arial,Helvetica,sans-serif!important}.alkam-cari-core-title{font-size:14px;font-weight:900;color:#1d4ed8;margin-bottom:4px}.alkam-cari-core-sub{font-size:12px;font-weight:800;color:#334155;line-height:1.45}.alkam-source-missing{display:inline-flex;padding:4px 8px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:11px;font-weight:900}table[data-alkam-cari-core-checked="1"]{outline:1px solid rgba(37,99,235,.08);outline-offset:-1px}@media(max-width:900px){#alkamCariCoreBanner{left:12px!important;right:12px!important;top:auto!important;bottom:16px!important;max-width:none!important}}';
    document.head.appendChild(st);
  }
  function enhance(){
    css(); expose();
    var r=root(); var text=(r.textContent||'').toLowerCase();
    if(text.indexOf('cari')<0&&text.indexOf('borç')<0&&text.indexOf('alacak')<0)return;
    var ts=tables(r); var bal=0; ts.forEach(function(t){sourceCheck(t); bal=recalc(t)}); banner(ts.length,bal);
  }
  function expose(){window.ALKAM_CARI_CORE_V4={version:VERSION,parseMoney:parseMoney,formatMoney:money,balanceLabel:label,recalc:function(){enhance();return 'OK'},test:function(){var r=root();return {version:VERSION,tables:tables(r).length,rootFound:!!r,bannerFound:!!document.getElementById('alkamCariCoreBanner'),time:new Date().toISOString()}}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
  setInterval(enhance,1500);
})();
