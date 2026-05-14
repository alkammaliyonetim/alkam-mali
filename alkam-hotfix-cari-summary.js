// ALKAM Mali - Secili Cari Mini Ozet Kartlari ve Risk Uyari Bandi
// Tablo verisini okumaz/yazmaz; sadece gorunen cari ekstre tablosundan ozet uretir.
(function(){
  'use strict';
  if(window.__ALKAM_CARI_SUMMARY_V2__) return;
  window.__ALKAM_CARI_SUMMARY_V2__ = true;

  function ensureStyle(){
    if(document.getElementById('alkamCariSummaryStyle')) return;
    var st = document.createElement('style');
    st.id = 'alkamCariSummaryStyle';
    st.textContent = '#alkamCariMiniSummary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 10px 0}' +
      '.alkam-cari-mini-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:13px;padding:10px;box-shadow:0 8px 20px rgba(15,23,42,.04)}' +
      '.alkam-cari-mini-card .k{font-size:10px;font-weight:950;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px}' +
      '.alkam-cari-mini-card .v{font-size:15px;font-weight:950;color:#0f172a;line-height:1.2}' +
      '.alkam-cari-mini-card.risk{border-color:#fecaca;background:#fff7f7}.alkam-cari-mini-card.warn{border-color:#fed7aa;background:#fff7ed}.alkam-cari-mini-card.good{border-color:#bbf7d0;background:#f0fdf4}' +
      '#alkamCariRiskBanner{margin:0 0 10px 0;border-radius:13px;padding:10px 12px;font-size:12px;font-weight:900;line-height:1.45}' +
      '#alkamCariRiskBanner.risk{border:1px solid #fecaca;background:#fff7f7;color:#991b1b}' +
      '#alkamCariRiskBanner.warn{border:1px solid #fed7aa;background:#fff7ed;color:#9a3412}' +
      '#alkamCariRiskBanner.good{border:1px solid #bbf7d0;background:#f0fdf4;color:#166534}' +
      '@media(max-width:760px){#alkamCariMiniSummary{grid-template-columns:1fr 1fr}.alkam-cari-mini-card .v{font-size:13px}#alkamCariRiskBanner{font-size:11px}}';
    document.head.appendChild(st);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
  function parseDate(value){
    var s = String(value || '').replace(/\s+/g,' ').trim();
    var m = s.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if(m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})/);
    if(m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return null;
  }
  function fmtDate(d){ if(!d) return '-'; return String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear(); }
  function daysSince(d){ if(!d) return '-'; var today = new Date(); var a = new Date(today.getFullYear(), today.getMonth(), today.getDate()); var b = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return Math.max(0, Math.floor((a-b)/86400000)); }
  function isCariStatementTable(table){ var h=(table&&table.tHead?table.tHead.innerText:table&&table.innerText||'').toLocaleLowerCase('tr-TR'); return h.indexOf('işlem no')>=0&&h.indexOf('tarih')>=0&&h.indexOf('kaynak')>=0&&h.indexOf('bakiye')>=0; }
  function findTable(){ var root=document.getElementById('selectedCariDetail')||document; var tables=Array.prototype.slice.call(root.querySelectorAll('table.source-statement, table')); return tables.find(isCariStatementTable)||null; }
  function rowKind(row){ var t=textOf(row.cells[3]).toLocaleLowerCase('tr-TR'); var all=textOf(row).toLocaleLowerCase('tr-TR'); if(t.indexOf('tahakkuk')>=0||all.indexOf('tahakkuk')>=0) return 'tahakkuk'; if(t.indexOf('tahsilat')>=0||all.indexOf('tahsilat')>=0) return 'tahsilat'; return 'diger'; }
  function riskInfo(gap){
    if(typeof gap !== 'number') return {cls:'warn', text:'Tahsilat geçmişi bulunamadı. Cari geçmişi kontrol edilmeli.'};
    if(gap >= 90) return {cls:'risk', text:'Riskli cari: '+gap+' gündür tahsilat yok. Takip / arama / ödeme planı önerilir.'};
    if(gap >= 30) return {cls:'warn', text:'Takipte cari: '+gap+' gündür tahsilat yok. Yakın takipte tutulmalı.'};
    return {cls:'good', text:'Normal durum: son tahsilat '+gap+' gün önce.'};
  }

  function buildSummary(){
    ensureStyle();
    var table = findTable();
    if(!table || !table.tBodies || !table.tBodies[0]) return;
    var rows = Array.prototype.slice.call(table.tBodies[0].rows || []);
    if(!rows.length) return;
    var visibleRows = rows.filter(function(r){ return r.style.display !== 'none'; });
    var tahakkukDates = [], tahsilatDates = [];
    rows.forEach(function(row){
      var d = parseDate(textOf(row.cells[1]));
      if(!d) return;
      var k = rowKind(row);
      if(k === 'tahakkuk') tahakkukDates.push(d);
      if(k === 'tahsilat') tahsilatDates.push(d);
    });
    function maxDate(list){ return list.length ? new Date(Math.max.apply(null, list.map(function(d){ return d.getTime(); }))) : null; }
    var lastTahakkuk = maxDate(tahakkukDates);
    var lastTahsilat = maxDate(tahsilatDates);
    var gap = daysSince(lastTahsilat);
    var info = riskInfo(gap);
    var riskText = typeof gap === 'number' ? (gap + ' gün') : '-';
    var wrap = table.closest('.cari-detail-scroll,.section,#selectedCariDetail');

    var box = document.getElementById('alkamCariMiniSummary');
    if(!box){
      box = document.createElement('div');
      box.id = 'alkamCariMiniSummary';
      if(wrap) wrap.insertBefore(box, wrap.firstChild);
    }
    box.innerHTML = ''+
      '<div class="alkam-cari-mini-card"><div class="k">Son Tahakkuk</div><div class="v">'+fmtDate(lastTahakkuk)+'</div></div>'+
      '<div class="alkam-cari-mini-card"><div class="k">Son Tahsilat</div><div class="v">'+fmtDate(lastTahsilat)+'</div></div>'+
      '<div class="alkam-cari-mini-card '+info.cls+'"><div class="k">Tahsilatsız Gün</div><div class="v">'+riskText+'</div></div>'+
      '<div class="alkam-cari-mini-card"><div class="k">Görünen Kayıt</div><div class="v">'+visibleRows.length+' / '+rows.length+'</div></div>';

    var banner = document.getElementById('alkamCariRiskBanner');
    if(!banner){
      banner = document.createElement('div');
      banner.id = 'alkamCariRiskBanner';
      if(wrap && box.nextSibling) wrap.insertBefore(banner, box.nextSibling);
      else if(wrap) wrap.insertBefore(banner, table.parentElement || table);
    }
    banner.className = info.cls;
    banner.textContent = info.text;
  }

  var timer=null;
  function schedule(){ clearTimeout(timer); timer=setTimeout(buildSummary,120); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', schedule); else schedule();
  var target=document.getElementById('selectedCariDetail')||document.body;
  if(target&&window.MutationObserver) new MutationObserver(schedule).observe(target,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  document.addEventListener('click',function(){ setTimeout(schedule,180); },true);
  document.addEventListener('change',function(){ setTimeout(schedule,180); },true);
  var tries=0; var boot=setInterval(function(){ buildSummary(); tries+=1; if(tries>=40) clearInterval(boot); },500);
})();
