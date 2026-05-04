(function(){
  'use strict';
  var VERSION='ALKAM Cari Core v4.1';
  function q(sel,root){return (root||document).querySelector(sel)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  function trMoneyToNumber(v){
    if(v===undefined||v===null)return 0;
    var raw=String(v);
    var neg=/^-/.test(raw)||/\bA\b/.test(raw);
    var s=raw.replace(/TL|₺|Bakiye|B|A/g,'').trim();
    if(!s)return 0;
    s=s.replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',', '.');
    var n=parseFloat(s); if(isNaN(n)) n=0;
    return neg?-Math.abs(n):n;
  }
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function balanceLabel(n){return Number(n||0)>0?'Bakiye B':(Number(n||0)<0?'Bakiye A':'Bakiye 0')}
  function getCariRoot(){return q('#selectedCariDetail') || q('#tab-cariler') || document.body}
  function findStatementTables(root){return qa('table',root).filter(function(t){var txt=(t.textContent||'').toLowerCase();return txt.indexOf('borç')>-1 && txt.indexOf('alacak')>-1 && (txt.indexOf('kaynak')>-1 || txt.indexOf('bakiye')>-1)})}
  function ensureSourceColumn(table){
    var heads=qa('thead th',table); if(!heads.length)return;
    var hasSource=heads.some(function(th){return (th.textContent||'').toLowerCase().indexOf('kaynak')>-1});
    if(!hasSource){
      var th=document.createElement('th'); th.textContent='Kaynak'; table.querySelector('thead tr').appendChild(th);
      qa('tbody tr',table).forEach(function(tr){var td=document.createElement('td');td.innerHTML='<span class="alkam-source-missing">Kaynak Eksik</span>';tr.appendChild(td)});
    }
  }
  function recalcVisibleStatement(table){
    var heads=qa('thead th',table).map(function(th){return (th.textContent||'').trim().toLowerCase()});
    var borcIdx=heads.findIndex(function(h){return h.indexOf('borç')>-1 || h.indexOf('borc')>-1});
    var alacakIdx=heads.findIndex(function(h){return h.indexOf('alacak')>-1});
    var bakiyeIdx=heads.findIndex(function(h){return h.indexOf('bakiye')>-1});
    if(borcIdx<0||alacakIdx<0)return 0;
    var running=0;
    qa('tbody tr',table).forEach(function(tr){
      var cells=qa('td',tr); if(!cells.length)return;
      var borc=trMoneyToNumber(cells[borcIdx] && cells[borcIdx].textContent);
      var alacak=trMoneyToNumber(cells[alacakIdx] && cells[alacakIdx].textContent);
      running += borc - alacak;
      tr.setAttribute('data-alkam-running-balance', String(running));
      if(bakiyeIdx>=0 && cells[bakiyeIdx]){
        var currentText=cells[bakiyeIdx].textContent||'';
        if(!currentText.trim() || currentText.indexOf('NaN')>-1){cells[bakiyeIdx].textContent=fmt(running)+' '+(running>0?'B':running<0?'A':'')}
      }
    });
    table.setAttribute('data-alkam-cari-core-checked','1');
    table.setAttribute('data-alkam-visible-balance', String(running));
    return running;
  }
  function findSafeBannerContainer(root){
    return q('[style*="overflow"]', root) || q('.cari-detail-scroll', root) || q('.section', root) || root;
  }
  function addStatementControl(root){
    var old=document.getElementById('alkamCariCoreBanner');
    var tables=findStatementTables(root);
    var balance=0;
    tables.forEach(function(t){balance=recalcVisibleStatement(t)});
    var html='<div class="alkam-cari-core-title">Ekstre Kontrolü: Aktif</div><div class="alkam-cari-core-sub">Cari ekstresi ana kayıt olarak izleniyor. Borç - Alacak = Bakiye kontrolü çalışıyor. Görünen tablo: '+tables.length+' adet. Kapanış: '+fmt(balance)+' '+(balance>0?'B':balance<0?'A':'')+'</div>';
    if(old){old.innerHTML=html;return;}
    var div=document.createElement('div');
    div.id='alkamCariCoreBanner';
    div.className='alkam-cari-core-banner';
    div.innerHTML=html;
    var container=findSafeBannerContainer(root);
    if(container && container.firstChild){container.insertBefore(div,container.firstChild)}
    else if(container){container.appendChild(div)}
    else {document.body.insertBefore(div,document.body.firstChild)}
  }
  function enhanceCariDetail(){
    var root=getCariRoot(); if(!root)return;
    var txt=(root.textContent||'').toLowerCase();
    if(txt.indexOf('cari')<0 && txt.indexOf('borç')<0 && txt.indexOf('alacak')<0)return;
    findStatementTables(root).forEach(function(t){ensureSourceColumn(t);recalcVisibleStatement(t)});
    addStatementControl(root);
    qa('.card-label,.metric-mini .k',root).forEach(function(el){
      var t=(el.textContent||'').trim().toLowerCase();
      if(t==='güncel bakiye'||t==='filtre kapanış'||t==='açılış bakiye'){
        var val=el.parentElement && (q('.card-value',el.parentElement)||q('.v',el.parentElement));
        if(val){var n=trMoneyToNumber(val.textContent); el.parentElement.setAttribute('data-alkam-bakiye-tip',balanceLabel(n))}
      }
    });
  }
  function exposeApi(){
    window.ALKAM_CARI_CORE_V4={version:VERSION,parseMoney:trMoneyToNumber,formatMoney:fmt,balanceLabel:balanceLabel,recalc:function(){enhanceCariDetail();return 'OK'},test:function(){var root=getCariRoot();return {version:VERSION,tables:findStatementTables(root).length,rootFound:!!root,bannerFound:!!document.getElementById('alkamCariCoreBanner'),time:new Date().toISOString()}}};
  }
  function injectCss(){
    if(q('#alkam-cari-core-v4-style'))return;
    var st=document.createElement('style'); st.id='alkam-cari-core-v4-style';
    st.textContent='#alkamCariCoreBanner{position:relative;z-index:50;display:block!important;margin:0 0 14px!important;padding:12px 14px!important;border:1px solid #93c5fd!important;background:linear-gradient(180deg,#eff6ff,#fff)!important;color:#1e3a8a!important;border-radius:14px!important;font-size:12px!important;font-weight:800!important;box-shadow:0 8px 22px rgba(37,99,235,.08)!important}.alkam-cari-core-title{font-size:14px;font-weight:900;color:#1d4ed8;margin-bottom:4px}.alkam-cari-core-sub{font-size:12px;font-weight:800;color:#334155;line-height:1.45}.alkam-source-missing{display:inline-flex;padding:4px 8px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:11px;font-weight:900}.source-statement[data-alkam-cari-core-checked="1"],table[data-alkam-cari-core-checked="1"]{outline:1px solid rgba(37,99,235,.08);outline-offset:-1px}';
    document.head.appendChild(st);
  }
  function run(){try{injectCss();exposeApi();enhanceCariDetail()}catch(e){console.warn('ALKAM Cari Core v4 hata:',e)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(run,600); setTimeout(run,1800); setTimeout(run,3500);
  var mo=new MutationObserver(function(){clearTimeout(window.__alkamCariCoreTimer);window.__alkamCariCoreTimer=setTimeout(run,250)});
  try{mo.observe(document.body,{subtree:true,childList:true})}catch(e){}
})();
