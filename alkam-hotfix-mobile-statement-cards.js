// ALKAM Mali - Mobil Cari Hareket Kart Gorunumu
// Masaustunde tablo korunur; mobilde tablo satirlari kart gibi okunur hale gelir.
(function(){
  'use strict';
  if(window.__ALKAM_MOBILE_STATEMENT_CARDS_V1__) return;
  window.__ALKAM_MOBILE_STATEMENT_CARDS_V1__ = true;

  function ensureStyle(){
    if(document.getElementById('alkamMobileStatementCardsStyle')) return;
    var st = document.createElement('style');
    st.id = 'alkamMobileStatementCardsStyle';
    st.textContent = '@media(max-width:760px){' +
      'table.source-statement, #selectedCariDetail table{border-collapse:separate!important;border-spacing:0 8px!important;width:100%!important}' +
      'table.source-statement thead, #selectedCariDetail table thead{display:none!important}' +
      'table.source-statement tbody, #selectedCariDetail table tbody{display:block!important;width:100%!important}' +
      'table.source-statement tr, #selectedCariDetail table tr{display:block!important;background:#fff!important;border:1px solid #e2e8f0!important;border-radius:13px!important;margin:0 0 8px 0!important;padding:8px!important;box-shadow:0 8px 20px rgba(15,23,42,.04)!important}' +
      'table.source-statement td, #selectedCariDetail table td{display:flex!important;justify-content:space-between!important;gap:10px!important;border:0!important;padding:5px 2px!important;font-size:12px!important;line-height:1.25!important;white-space:normal!important;text-align:right!important}' +
      'table.source-statement td:before, #selectedCariDetail table td:before{content:attr(data-alkam-label);font-weight:950;color:#64748b;text-align:left!important;min-width:88px!important}' +
      'table.source-statement td:nth-child(1), #selectedCariDetail table td:nth-child(1){font-weight:950;color:#1d4ed8}' +
      'table.source-statement td:nth-child(5), #selectedCariDetail table td:nth-child(5){display:block!important;text-align:left!important;background:#f8fafc!important;border-radius:9px!important;padding:7px!important;margin:4px 0!important}' +
      'table.source-statement td:nth-child(5):before, #selectedCariDetail table td:nth-child(5):before{display:block!important;margin-bottom:3px!important}' +
      '}';
    document.head.appendChild(st);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
  function isCariStatementTable(table){
    var h = (table && table.tHead ? table.tHead.innerText : table && table.innerText || '').toLocaleLowerCase('tr-TR');
    return h.indexOf('işlem no') >= 0 && h.indexOf('tarih') >= 0 && h.indexOf('kaynak') >= 0 && h.indexOf('bakiye') >= 0;
  }
  function labelize(){
    ensureStyle();
    var root = document.getElementById('selectedCariDetail') || document;
    var tables = Array.prototype.slice.call(root.querySelectorAll('table.source-statement, table')).filter(isCariStatementTable);
    tables.forEach(function(table){
      var headers = [];
      if(table.tHead && table.tHead.rows[0]){
        headers = Array.prototype.slice.call(table.tHead.rows[0].cells || []).map(textOf);
      }
      if(!headers.length) headers = ['İşlem No','Tarih','Kaynak','Tür','Açıklama','Borç','Alacak','Bakiye','İşlem'];
      Array.prototype.slice.call(table.querySelectorAll('tbody tr')).forEach(function(row){
        Array.prototype.slice.call(row.cells || []).forEach(function(cell, idx){
          cell.setAttribute('data-alkam-label', headers[idx] || ('Alan ' + (idx+1)));
        });
      });
    });
  }
  var timer=null;
  function schedule(){ clearTimeout(timer); timer=setTimeout(labelize,120); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  var target = document.getElementById('selectedCariDetail') || document.body;
  if(target && window.MutationObserver) new MutationObserver(schedule).observe(target,{childList:true,subtree:true});
  document.addEventListener('click', function(){ setTimeout(schedule,180); }, true);
  document.addEventListener('change', function(){ setTimeout(schedule,180); }, true);
  var tries=0;
  var boot=setInterval(function(){ labelize(); tries += 1; if(tries >= 40) clearInterval(boot); },500);
})();
