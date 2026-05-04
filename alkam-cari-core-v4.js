(function(){
  'use strict';
  var VERSION='ALKAM Cari Core v4.0';
  function q(sel,root){return (root||document).querySelector(sel)}
  function qa(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel))}
  function trMoneyToNumber(v){
    if(v===undefined||v===null)return 0;
    var s=String(v).replace(/TL|₺|Bakiye|B|A/g,'').trim();
    if(!s)return 0;
    var neg=/^-/.test(s)||/\bA\b/.test(String(v));
    s=s.replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',', '.');
    var n=parseFloat(s); if(isNaN(n)) n=0;
    return neg?-Math.abs(n):n;
  }
  function fmt(n){
    return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL';
  }
  function balanceLabel(n){return Number(n||0)>0?'Bakiye B':(Number(n||0)<0?'Bakiye A':'Bakiye 0')}
  function shortDate(v){
    if(!v)return '-';
    var d=new Date(v); if(isNaN(d.getTime())) return String(v).slice(0,10)||'-';
    return d.toLocaleDateString('tr-TR');
  }
  function getCariRoot(){
    return q('#selectedCariDetail') || q('#tab-cariler') || document.body;
  }
  function findStatementTables(root){
    return qa('table',root).filter(function(t){
      var txt=(t.textContent||'').toLowerCase();
      return txt.indexOf('borç')>-1 && txt.indexOf('alacak')>-1 && (txt.indexOf('kaynak')>-1 || txt.indexOf('bakiye')>-1);
    });
  }
  function ensureSourceColumn(table){
    var heads=qa('thead th',table); if(!heads.length)return;
    var hasSource=heads.some(function(th){return (th.textContent||'').toLowerCase().indexOf('kaynak')>-1});
    if(!hasSource){
      var th=document.createElement('th'); th.textContent='Kaynak'; table.querySelector('thead tr').appendChild(th);
      qa('tbody tr',table).forEach(function(tr){var td=document.createElement('td');td.innerHTML='<span class="alkam-source-missing">Kaynak Eksik</span>';tr.appendChild(td);});
    }
  }
  function recalcVisibleStatement(table){
    var heads=qa('thead th',table).map(function(th){return (th.textContent||'').trim().toLowerCase();});
    var borcIdx=heads.findIndex(function(h){return h.indexOf('borç')>-1 || h.indexOf('borc')>-1});
    var alacakIdx=heads.findIndex(function(h){return h.indexOf('alacak')>-1});
    var bakiyeIdx=heads.findIndex(function(h){return h.indexOf('bakiye')>-1});
    if(borcIdx<0||alacakIdx<0)return;
    var running=0;
    qa('tbody tr',table).forEach(function(tr){
      var cells=qa('td',tr); if(!cells.length)return;
      var borc=trMoneyToNumber(cells[borcIdx] && cells[borcIdx].textContent);
      var alacak=trMoneyToNumber(cells[alacakIdx] && cells[alacakIdx].textContent);
      running += borc - alacak;
      tr.setAttribute('data-alkam-running-balance', String(running));
      if(bakiyeIdx>=0 && cells[bakiyeIdx]){
        var currentText=cells[bakiyeIdx].textContent||'';
        if(!currentText.trim() || currentText.indexOf('NaN')>-1){
          cells[bakiyeIdx].textContent=fmt(running)+' '+(running>0?'B':running<0?'A':'');
        }
      }
    });
    table.setAttribute('data-alkam-cari-core-checked','1');
    table.setAttribute('data-alkam-visible-balance', String(running));
  }
  function addStatementControl(root){
    if(q('#alkamCariCoreBanner',root))return;
    var target=q('.hero-name',root)||q('.section-title',root)||root.firstElementChild;
    if(!target)return;
    var div=document.createElement('div');
    div.id='alkamCariCoreBanner';
    div.className='alkam-cari-core-banner';
    div.innerHTML='<b>Cari Ekstre Çekirdeği Aktif</b><span>Cari ekstresi ana kayıt; Borç - Alacak = Bakiye. Kaynak kolonu kontrol ediliyor.</span>';
    target.parentNode.insertBefore(div,target.nextSibling);
  }
  function enhanceCariDetail(){
    var root=getCariRoot(); if(!root)return;
    var txt=(root.textContent||'').toLowerCase();
    if(txt.indexOf('cari')<0 && txt.indexOf('borç')<0 && txt.indexOf('alacak')<0)return;
    addStatementControl(root);
    findStatementTables(root).forEach(function(t){ensureSourceColumn(t);recalcVisibleStatement(t);});
    qa('.card-label,.metric-mini .k',root).forEach(function(el){
      var t=(el.textContent||'').trim().toLowerCase();
      if(t==='güncel bakiye'||t==='filtre kapanış'||t==='açılış bakiye'){
        var val=el.parentElement && (q('.card-value',el.parentElement)||q('.v',el.parentElement));
        if(val){var n=trMoneyToNumber(val.textContent); el.parentElement.setAttribute('data-alkam-bakiye-tip',balanceLabel(n));}
      }
    });
  }
  function exposeApi(){
    window.ALKAM_CARI_CORE_V4={
      version:VERSION,
      parseMoney:trMoneyToNumber,
      formatMoney:fmt,
      balanceLabel:balanceLabel,
      recalc:function(){enhanceCariDetail();return 'OK';},
      test:function(){
        var root=getCariRoot();
        return {version:VERSION,tables:findStatementTables(root).length,rootFound:!!root,time:new Date().toISOString()};
      }
    };
  }
  function injectCss(){
    if(q('#alkam-cari-core-v4-style'))return;
    var st=document.createElement('style'); st.id='alkam-cari-core-v4-style';
    st.textContent='.alkam-cari-core-banner{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0 14px;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e3a8a;border-radius:12px;font-size:12px;font-weight:800}.alkam-cari-core-banner b{font-weight:900}.alkam-source-missing{display:inline-flex;padding:4px 8px;border-radius:999px;background:#fef2f2;color:#b91c1c;font-size:11px;font-weight:900}.source-statement[data-alkam-cari-core-checked="1"],table[data-alkam-cari-core-checked="1"]{outline:1px solid rgba(37,99,235,.08);outline-offset:-1px}';
    document.head.appendChild(st);
  }
  function run(){try{injectCss();exposeApi();enhanceCariDetail();}catch(e){console.warn('ALKAM Cari Core v4 hata:',e)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(run,600); setTimeout(run,1800);
  var mo=new MutationObserver(function(){clearTimeout(window.__alkamCariCoreTimer);window.__alkamCariCoreTimer=setTimeout(run,250)});
  try{mo.observe(document.body,{subtree:true,childList:true});}catch(e){}
})();
