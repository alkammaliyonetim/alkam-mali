(function(){
  'use strict';

  function num(value){
    if(typeof value === 'number') return Number.isFinite(value) ? value : 0;
    var s = String(value == null ? '' : value).trim().replace(/\s/g,'').replace(/TL|₺/gi,'');
    if(!s) return 0;
    if(s.indexOf(',') >= 0 && s.indexOf('.') >= 0) s = s.replace(/\./g,'').replace(',','.');
    else if(s.indexOf(',') >= 0) s = s.replace(',','.');
    return Number(s) || 0;
  }

  function money(value){
    return num(value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
  }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>"']/g, function(s){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s];
    });
  }

  function readJson(key, fallback){
    try{
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(err){
      return fallback;
    }
  }

  function getCariler(){
    var external = window.ALKAM_CARILER_DATA || window.ALKAM_CARILER_77_DATA || window.ALKAM_CARILER || window.alkamCariler;
    if(Array.isArray(external) && external.length) return external;
    return readJson('ALKAM_FINAL_CARILER_V1', []);
  }

  function getManualTxns(){
    return readJson('ALKAM_FINAL_MANUAL_TXNS_V1', []);
  }

  function getAccountTxns(){
    return readJson('ALKAM_FINAL_ACCOUNT_TXNS_V1', []);
  }

  function normalizeTxn(t, cariId, cariName){
    var debit = num(t && (t.debit ?? t.borc ?? t.BORC ?? 0));
    var credit = num(t && (t.credit ?? t.alacak ?? t.ALACAK ?? 0));
    var type = String((t && (t.type || t.hareket_tipi || t.movement_type)) || (debit >= credit ? 'Tahakkuk' : 'Tahsilat')).toLocaleLowerCase('tr-TR');
    var source = String((t && (t.source || t.kaynak || t.source_module)) || '').toLocaleLowerCase('tr-TR');
    return {
      cariId: cariId || (t && t.cariId) || '',
      cariName: cariName || (t && t.cariName) || '',
      date: String((t && (t.date || t.tarih || t.line_date || t.entry_date)) || '').slice(0,10),
      description: String((t && (t.description || t.aciklama || t.desc || t.content_summary)) || ''),
      type: type,
      source: source,
      debit: debit,
      credit: credit
    };
  }

  function allCariTxns(){
    var rows = [];
    getCariler().forEach(function(c){
      if(c && c.deleted) return;
      var txns = Array.isArray(c.transactions) ? c.transactions : Array.isArray(c.hareketler) ? c.hareketler : [];
      txns.forEach(function(t){ rows.push(normalizeTxn(t, c.id || c.cari_id || '', c.name || c.cari_name || c.unvan || '')); });
    });
    getManualTxns().forEach(function(t){
      if(t && t.deleted) return;
      rows.push(normalizeTxn(t, t && t.cariId, t && t.cariName));
    });
    return rows;
  }

  function classify(){
    var tahakkuk = 0;
    var tahsilat = 0;
    var digerAlacak = 0;
    var rows = allCariTxns();

    rows.forEach(function(t){
      var isTahsilat = t.type.indexOf('tahsil') >= 0 || t.credit > 0;
      var isTahakkuk = t.type.indexOf('tahakkuk') >= 0 || t.debit > 0;
      if(isTahakkuk) tahakkuk += t.debit;
      if(isTahsilat) tahsilat += t.credit;
      if(!isTahsilat && t.credit > 0) digerAlacak += t.credit;
    });

    var gider = 0;
    getAccountTxns().forEach(function(t){
      if(!t) return;
      var dir = String(t.dir || t.direction || t.yon || '').toLocaleLowerCase('tr-TR');
      var amount = num(t.amount || t.tutar || t.debit || t.credit || 0);
      if(dir === 'cikis' || dir === 'çıkış' || dir === 'gider') gider += amount;
    });

    var netNakit = tahsilat - gider;
    var kalanAlacak = Math.max(tahakkuk - tahsilat, 0);
    var tahsilatOrani = tahakkuk > 0 ? (tahsilat / tahakkuk) * 100 : 0;

    return {
      tahakkuk: tahakkuk,
      tahsilat: tahsilat,
      gider: gider,
      netNakit: netNakit,
      kalanAlacak: kalanAlacak,
      tahsilatOrani: tahsilatOrani,
      rows: rows.length,
      updatedAt: new Date().toISOString()
    };
  }

  function row(label, value, note, tagClass){
    return '<tr>' +
      '<td><strong>'+esc(label)+'</strong><div style="font-size:11px;color:#64748b;margin-top:3px">'+esc(note)+'</div></td>' +
      '<td class="text-right money">'+esc(value)+'</td>' +
      '<td><span class="tag '+esc(tagClass || 'gray')+'">CANLI</span></td>' +
    '</tr>';
  }

  function buildHtml(summary){
    var ratio = summary.tahsilatOrani.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
    return '<div class="section" id="dynamicIncomeStatementSection" style="border:1px solid #bfdbfe;background:linear-gradient(180deg,#ffffff,#f8fbff)">' +
      '<div class="topbar" style="margin-bottom:10px">' +
        '<div class="page-head"><h2 class="section-title" style="margin:0">Dinamik Gelir Tablosu</h2><p>Gelir, tahsilat ve gider değiştikçe ana ekranda canlı güncellenir.</p></div>' +
        '<div class="btn-row"><button class="btn btn-soft" onclick="window.renderDynamicIncomeStatement && window.renderDynamicIncomeStatement()">Yenile</button></div>' +
      '</div>' +
      '<div class="grid-4" style="margin-bottom:12px">' +
        '<div class="metric-mini"><div class="k">Tahakkuk / Gelir</div><div class="v">'+money(summary.tahakkuk)+'</div></div>' +
        '<div class="metric-mini"><div class="k">Tahsilat</div><div class="v">'+money(summary.tahsilat)+'</div></div>' +
        '<div class="metric-mini"><div class="k">Gider</div><div class="v">'+money(summary.gider)+'</div></div>' +
        '<div class="metric-mini"><div class="k">Net Nakit</div><div class="v">'+money(summary.netNakit)+'</div></div>' +
      '</div>' +
      '<table><thead><tr><th>Kalem</th><th class="text-right">Tutar / Oran</th><th>Durum</th></tr></thead><tbody>' +
        row('Tahakkuk / Gelir', money(summary.tahakkuk), 'Cari borç/tahakkuk hareketlerinden hesaplanır.', 'green') +
        row('Tahsilat', money(summary.tahsilat), 'Cari alacak/tahsilat hareketlerinden hesaplanır.', 'green') +
        row('Gider', money(summary.gider), 'Hesap hareketlerinde çıkış yönlü işlemlerden hesaplanır.', 'red') +
        row('Net Nakit', money(summary.netNakit), 'Tahsilat - gider.', summary.netNakit >= 0 ? 'green' : 'red') +
        row('Açık Alacak / Kalan', money(summary.kalanAlacak), 'Tahakkuk - tahsilat farkı.', summary.kalanAlacak > 0 ? 'amber' : 'green') +
        row('Tahsilat Oranı', ratio, 'Tahsilat / tahakkuk oranı.', summary.tahsilatOrani >= 80 ? 'green' : 'amber') +
      '</tbody></table>' +
      '<div class="rule-box" style="margin-top:12px">Kaynak: cari hareketleri + manuel hareketler + hesap hareketleri. Bu modül sadece rapor gösterir, kayıt oluşturmaz.</div>' +
    '</div>';
  }

  function ensureMount(){
    var existing = document.getElementById('dynamicIncomeStatementMount');
    if(existing) return existing;
    var dashboard = document.getElementById('tab-dashboard');
    if(!dashboard) return null;
    var mount = document.createElement('div');
    mount.id = 'dynamicIncomeStatementMount';
    var cards = dashboard.querySelector('.cards');
    if(cards && cards.nextSibling) dashboard.insertBefore(mount, cards.nextSibling);
    else dashboard.appendChild(mount);
    return mount;
  }

  function render(){
    var mount = ensureMount();
    if(!mount) return false;
    var summary = classify();
    mount.innerHTML = buildHtml(summary);
    window.ALKAM_DYNAMIC_INCOME_STATEMENT = summary;
    window.ALKAM_DYNAMIC_INCOME_STATEMENT_READY = true;
    return true;
  }

  window.renderDynamicIncomeStatement = render;
  window.getDynamicIncomeStatementSummary = classify;

  function scheduleRender(){
    clearTimeout(window.__alkamIncomeStatementTimer);
    window.__alkamIncomeStatementTimer = setTimeout(render, 120);
  }

  document.addEventListener('DOMContentLoaded', scheduleRender);
  window.addEventListener('alkam:cariler-loaded', scheduleRender);
  document.addEventListener('alkamCarilerLoaded', scheduleRender);
  window.addEventListener('storage', scheduleRender);

  var oldRefresh = window.refreshAll;
  if(typeof oldRefresh === 'function'){
    window.refreshAll = function(){
      var out = oldRefresh.apply(this, arguments);
      scheduleRender();
      return out;
    };
  }
})();
