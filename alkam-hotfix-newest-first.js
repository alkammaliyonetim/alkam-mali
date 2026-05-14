// ALKAM Mali - Cari Ekstre En Yeni Kayit Uste Siralama
(function(){
  'use strict';
  if(window.__ALKAM_CARI_NEWEST_FIRST__) return;
  window.__ALKAM_CARI_NEWEST_FIRST__ = true;

  function textOf(el){
    return (el && el.textContent || '').replace(/\s+/g,' ').trim();
  }

  function parseDate(value){
    var s = String(value || '').replace(/\s+/g,' ').trim();
    var m = s.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if(m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
    if(m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();
    return 0;
  }

  function isCariStatementTable(table){
    var h = (table && table.tHead ? table.tHead.innerText : table && table.innerText || '').toLocaleLowerCase('tr-TR');
    return h.indexOf('işlem no') >= 0 && h.indexOf('tarih') >= 0 && h.indexOf('kaynak') >= 0 && h.indexOf('bakiye') >= 0;
  }

  function addSortNote(table){
    if(document.getElementById('alkamNewestFirstNote')) return;
    var note = document.createElement('div');
    note.id = 'alkamNewestFirstNote';
    note.textContent = 'Sıralama: En yeni kayıt en üstte';
    note.style.cssText = 'display:inline-flex;margin:0 0 10px 0;border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900';
    var wrap = table.closest('.cari-detail-scroll,.section,#selectedCariDetail');
    if(wrap) wrap.insertBefore(note, table.parentElement || table);
  }

  function sortTable(table){
    if(!isCariStatementTable(table)) return;
    var tbody = table.tBodies && table.tBodies[0];
    if(!tbody) return;
    var rows = Array.prototype.slice.call(tbody.rows || []);
    if(rows.length < 2) return;

    rows.forEach(function(row, index){
      if(!row.dataset.alkamOriginalOrder) row.dataset.alkamOriginalOrder = String(index);
    });

    var before = rows.map(function(row){
      return textOf(row.cells[0]) + '|' + textOf(row.cells[1]);
    }).join('~');

    if(tbody.dataset.alkamNewestFirstSignature === before) return;

    rows.sort(function(a,b){
      var da = parseDate(textOf(a.cells[1]));
      var db = parseDate(textOf(b.cells[1]));
      if(db !== da) return db - da;
      return Number(b.dataset.alkamOriginalOrder || 0) - Number(a.dataset.alkamOriginalOrder || 0);
    });

    rows.forEach(function(row){ tbody.appendChild(row); });
    tbody.dataset.alkamNewestFirstSignature = rows.map(function(row){
      return textOf(row.cells[0]) + '|' + textOf(row.cells[1]);
    }).join('~');
    addSortNote(table);
  }

  function run(){
    var root = document.getElementById('selectedCariDetail') || document;
    var tables = root.querySelectorAll('table.source-statement, table');
    Array.prototype.slice.call(tables).forEach(sortTable);
  }

  var timer = null;
  function schedule(){
    clearTimeout(timer);
    timer = setTimeout(run, 80);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();

  var target = document.getElementById('selectedCariDetail') || document.body;
  if(target && window.MutationObserver){
    new MutationObserver(schedule).observe(target, { childList:true, subtree:true });
  }
  document.addEventListener('click', function(){ setTimeout(schedule, 120); }, true);

  var tries = 0;
  var boot = setInterval(function(){
    run();
    tries += 1;
    if(tries >= 40) clearInterval(boot);
  }, 500);
})();
