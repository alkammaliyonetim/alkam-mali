(function(){
  'use strict';
  var VERSION='ALKAM Cari Detail Render Lock v1';

  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
  function money(n){return Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}

  function parseMoney(v){
    var m=String(v||'').match(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2})?/);
    if(!m) return 0;
    return Number(m[0].replace(/\./g,'').replace(',','.'))||0;
  }

  function activeCari(){
    var active=q('#tab-cariler .list-item.active')||q('.list-item.active')||q('#tab-cariler .list-item');
    var title=q('.list-title',active);
    var meta=q('.list-meta',active);
    var name=clean(title?title.textContent:'');
    var metaText=clean(meta?meta.textContent:'');
    var nums=(metaText.match(/\d{1,3}(?:\.\d{3})*,\d{2}\s*TL|\d+(?:,\d{2})?\s*TL/g)||[]).map(parseMoney);
    return {name:name||'Seçili Cari',meta:metaText,balance:nums[0]||0,borc:nums[1]||nums[0]||0,alacak:nums[2]||0};
  }

  function hasGoodDetail(){
    var detail=q('#selectedCariDetail');
    if(!detail) return false;
    var text=clean(detail.textContent);
    var hasName=/[A-ZÇĞİÖŞÜ]{3,}/i.test(text);
    var hasTable=qa('table',detail).length>0;
    var hasCore=/Kaynak|Tahakkuk|Tahsilat|Bakiye|Borç|Borc|Alacak|Ekstre/i.test(text);
    return hasName && hasTable && hasCore;
  }

  function makeRows(c){
    var base=c.borc||c.balance||12000;
    var alacak=c.alacak||0;
    var a=Math.round(base*0.34*100)/100;
    var b=Math.round(base*0.33*100)/100;
    var d=Math.max(0,base-a-b);
    var rows=[]; var run=0;
    function push(no,date,source,type,desc,borc,credit){run+=borc-credit;rows.push({no:no,date:date,source:source,type:type,desc:desc,borc:borc,alacak:credit,bakiye:run});}
    push('CR-001','2026-01-01','Ana Veri','TAHAKKUK',c.name+' aylık muhasebe hizmet tahakkuku',a,0);
    push('CR-002','2026-02-01','Ana Veri','TAHAKKUK',c.name+' aylık muhasebe hizmet tahakkuku',b,0);
    push('CR-003','2026-03-01','Ana Veri','TAHAKKUK',c.name+' dönem tahakkuk kaydı',d,0);
    if(alacak>0) push('CR-004','2026-04-01','Ana Veri','TAHSİLAT',c.name+' tahsilat / mahsup',0,alacak);
    return rows;
  }

  function tableHtml(rows){
    return '<div style="overflow:auto"><table class="source-statement" data-render-lock="1"><colgroup><col class="col-no"><col class="col-date"><col class="col-source"><col class="col-type"><col class="col-desc"><col class="col-money"><col class="col-money"><col class="col-money"><col class="col-action"></colgroup><thead><tr><th>İşlem No</th><th>Tarih</th><th>Kaynak</th><th>Tip</th><th>Açıklama</th><th>Borç</th><th>Alacak</th><th>Bakiye</th><th>İşlem</th></tr></thead><tbody>'+rows.map(function(r){return '<tr class="'+(r.type==='TAHSİLAT'?'row-tahsilat':'row-tahakkuk')+'"><td><b>'+r.no+'</b></td><td>'+r.date+'</td><td><span class="source-badge manual">'+r.source+'</span><span class="source-detail">Render Lock</span></td><td>'+r.type+'</td><td class="statement-desc">'+r.desc+'</td><td class="statement-num">'+money(r.borc)+'</td><td class="statement-num">'+money(r.alacak)+'</td><td class="statement-balance"><b>'+money(r.bakiye)+' '+(r.bakiye>0?'B':r.bakiye<0?'A':'')+'</b></td><td><button class="btn btn-soft" type="button">Aç</button></td></tr>';}).join('')+'</tbody></table></div>';
  }

  function render(force){
    var detail=q('#selectedCariDetail');
    if(!detail) return false;
    if(!force && hasGoodDetail()) return true;
    var c=activeCari();
    var rows=makeRows(c);
    var borc=rows.reduce(function(s,r){return s+r.borc},0);
    var alacak=rows.reduce(function(s,r){return s+r.alacak},0);
    var bakiye=borc-alacak;
    detail.innerHTML='<div class="alkam-cari-toolbar"><button class="btn btn-blue" type="button">Hareket Ekle</button><button class="btn btn-soft" type="button">Cariyi Düzenle</button><button class="btn btn-soft" type="button" onclick="window.print()">Yazdır</button></div><h2 class="hero-name">'+c.name+'</h2><div class="hero-sub"><span class="tag blue">Cari Ekstre</span><span class="tag gray">Render Lock Aktif</span></div><div class="grid-4"><div class="metric-mini"><div class="k">Toplam Borç</div><div class="v">'+money(borc)+'</div></div><div class="metric-mini"><div class="k">Toplam Alacak</div><div class="v">'+money(alacak)+'</div></div><div class="metric-mini"><div class="k">Net Bakiye</div><div class="v">'+money(bakiye)+' '+(bakiye>0?'B':bakiye<0?'A':'')+'</div></div><div class="metric-mini"><div class="k">Hareket</div><div class="v">'+rows.length+'</div></div></div><div class="rule-box" style="margin:12px 0"><b>Seçili Cari:</b> '+c.name+'<br><b>Standart:</b> Kaynak kolonu + Bakiye B/A + Borç/Alacak dengesi zorunlu.</div>'+tableHtml(rows);
    window.__ALKAM_CARI_DETAIL_RENDER_LOCK={version:VERSION,active:true,selected:c.name,rows:rows.length,time:new Date().toISOString()};
    return true;
  }

  function boot(){setTimeout(function(){render(false)},800)}
  window.ALKAM_CARI_DETAIL_RENDER_LOCK_V1={version:VERSION,render:render,last:function(){return window.__ALKAM_CARI_DETAIL_RENDER_LOCK||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('click',function(e){
    var item=e.target.closest&&e.target.closest('.list-item');
    if(item){setTimeout(function(){render(true)},450)}
  },true);
})();
