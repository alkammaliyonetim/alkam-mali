// ALKAM Mali - Cari Ekstre Donem ve Hareket Tipi Filtresi
// Guvenli DOM katmani: tablo verisine dokunmaz, sadece gorunen satirlari filtreler.
(function(){
  'use strict';
  if(window.__ALKAM_CARI_PERIOD_FILTER_V2__) return;
  window.__ALKAM_CARI_PERIOD_FILTER_V2__ = true;

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }

  function parseDate(value){
    var s = String(value || '').replace(/\s+/g,' ').trim();
    var m = s.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if(m) return new Date(Number(m[1]), Number(m[2])-1, Number(m[3]));
    m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
    if(m) return new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
    return null;
  }

  function fmt(d){
    if(!d) return '';
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }
  function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0); }
  function startOfYear(d){ return new Date(d.getFullYear(), 0, 1); }
  function endOfYear(d){ return new Date(d.getFullYear(), 11, 31); }

  function isCariStatementTable(table){
    var h = (table && table.tHead ? table.tHead.innerText : table && table.innerText || '').toLocaleLowerCase('tr-TR');
    return h.indexOf('işlem no') >= 0 && h.indexOf('tarih') >= 0 && h.indexOf('kaynak') >= 0 && h.indexOf('bakiye') >= 0;
  }

  function findTable(){
    var root = document.getElementById('selectedCariDetail') || document;
    var tables = Array.prototype.slice.call(root.querySelectorAll('table.source-statement, table'));
    return tables.find(isCariStatementTable) || null;
  }

  function getRange(mode){
    var now = new Date();
    var start = null, end = null;
    if(mode === 'thisMonth') { start = startOfMonth(now); end = endOfMonth(now); }
    if(mode === 'lastMonth') { var lm = new Date(now.getFullYear(), now.getMonth()-1, 1); start = startOfMonth(lm); end = endOfMonth(lm); }
    if(mode === 'thisYear') { start = startOfYear(now); end = endOfYear(now); }
    if(mode === 'custom') {
      start = parseDate(document.getElementById('alkamPeriodStart') && document.getElementById('alkamPeriodStart').value);
      end = parseDate(document.getElementById('alkamPeriodEnd') && document.getElementById('alkamPeriodEnd').value);
    }
    return {start:start, end:end};
  }

  function rowType(row){
    var t = textOf(row.cells[3]).toLocaleLowerCase('tr-TR');
    var all = textOf(row).toLocaleLowerCase('tr-TR');
    if(t.indexOf('tahakkuk') >= 0 || all.indexOf('tahakkuk') >= 0) return 'debit';
    if(t.indexOf('tahsilat') >= 0 || all.indexOf('tahsilat') >= 0) return 'credit';
    return 'other';
  }

  function applyFilter(){
    var table = findTable();
    if(!table || !table.tBodies || !table.tBodies[0]) return;
    var modeEl = document.getElementById('alkamPeriodMode');
    var typeEl = document.getElementById('alkamTxnTypeMode');
    var mode = modeEl ? modeEl.value : 'all';
    var typeMode = typeEl ? typeEl.value : 'all';
    var range = getRange(mode);
    var rows = Array.prototype.slice.call(table.tBodies[0].rows || []);
    var shown = 0;

    rows.forEach(function(row){
      var d = parseDate(textOf(row.cells[1]));
      var dateVisible = true;
      if(mode !== 'all') dateVisible = !!(d && range.start && range.end && d >= range.start && d <= range.end);
      var rt = rowType(row);
      var typeVisible = typeMode === 'all' || typeMode === rt;
      var visible = dateVisible && typeVisible;
      row.style.display = visible ? '' : 'none';
      if(visible) shown += 1;
    });

    var count = document.getElementById('alkamPeriodCount');
    if(count) count.textContent = shown + ' kayıt gösteriliyor';
  }

  function install(){
    var table = findTable();
    if(!table) return;
    if(document.getElementById('alkamPeriodFilterBar')) { applyFilter(); return; }

    var bar = document.createElement('div');
    bar.id = 'alkamPeriodFilterBar';
    bar.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px 0;padding:10px;border:1px solid #dbeafe;background:#f8fbff;border-radius:14px;font-size:12px;font-weight:900;color:#334155';
    bar.innerHTML = ''+
      '<span style="color:#1d4ed8">Dönem filtresi</span>'+
      '<select id="alkamPeriodMode" style="border:1px solid #cbd5e1;border-radius:9px;padding:7px 9px;font-weight:900;background:white">'+
        '<option value="all">Tüm kayıtlar</option>'+
        '<option value="thisMonth">Bu ay</option>'+
        '<option value="lastMonth">Geçen ay</option>'+
        '<option value="thisYear">Bu yıl</option>'+
        '<option value="custom">Özel tarih</option>'+
      '</select>'+
      '<select id="alkamTxnTypeMode" style="border:1px solid #cbd5e1;border-radius:9px;padding:7px 9px;font-weight:900;background:white">'+
        '<option value="all">Tüm tipler</option>'+
        '<option value="debit">Tahakkuk / Borç</option>'+
        '<option value="credit">Tahsilat / Alacak</option>'+
        '<option value="other">Düzeltme / Diğer</option>'+
      '</select>'+
      '<input id="alkamPeriodStart" type="date" style="border:1px solid #cbd5e1;border-radius:9px;padding:6px 8px;font-weight:900;background:white">'+
      '<input id="alkamPeriodEnd" type="date" style="border:1px solid #cbd5e1;border-radius:9px;padding:6px 8px;font-weight:900;background:white">'+
      '<button id="alkamPeriodApply" type="button" style="border:0;border-radius:9px;background:#1769e8;color:white;padding:8px 11px;font-weight:950">Uygula</button>'+
      '<span id="alkamPeriodCount" style="color:#64748b"></span>';

    var wrap = table.closest('.cari-detail-scroll,.section,#selectedCariDetail');
    if(wrap) wrap.insertBefore(bar, table.parentElement || table);

    var now = new Date();
    var s = document.getElementById('alkamPeriodStart');
    var e = document.getElementById('alkamPeriodEnd');
    if(s) s.value = fmt(startOfMonth(now));
    if(e) e.value = fmt(endOfMonth(now));

    var mode = document.getElementById('alkamPeriodMode');
    var type = document.getElementById('alkamTxnTypeMode');
    var btn = document.getElementById('alkamPeriodApply');
    if(mode) mode.addEventListener('change', applyFilter);
    if(type) type.addEventListener('change', applyFilter);
    if(btn) btn.addEventListener('click', applyFilter);
    if(s) s.addEventListener('change', function(){ if(mode) mode.value='custom'; applyFilter(); });
    if(e) e.addEventListener('change', function(){ if(mode) mode.value='custom'; applyFilter(); });
    applyFilter();
  }

  var timer = null;
  function schedule(){ clearTimeout(timer); timer = setTimeout(install, 100); }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();

  var target = document.getElementById('selectedCariDetail') || document.body;
  if(target && window.MutationObserver) new MutationObserver(schedule).observe(target, { childList:true, subtree:true });
  document.addEventListener('click', function(){ setTimeout(schedule, 140); }, true);
  var tries = 0;
  var boot = setInterval(function(){ install(); tries += 1; if(tries >= 40) clearInterval(boot); }, 500);
})();
