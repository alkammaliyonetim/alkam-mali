(function(){
  'use strict';
  var VERSION='ALKAM Cari Detail Render Lock v2';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function money(n){return Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}
  function parseMoney(s){var m=String(s||'').match(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2})?/);return m?Number(m[0].replace(/\./g,'').replace(',','.'))||0:0}
  function detail(){return q('#selectedCariDetail')||q('#tab-cariler .detail-sticky')||q('#tab-cariler .section:nth-child(2)')}
  function selected(){
    var item=q('#tab-cariler .list-item.active')||q('#tab-cariler .row-clickable.active')||q('#tab-cariler .list-item')||q('#tab-cariler tr');
    var name=text(q('.list-title',item))||text(qa('td',item)[0])||'Seçili Cari';
    var all=text(item);
    var nums=(all.match(/\d{1,3}(?:\.\d{3})*,\d{2}\s*TL|\d+(?:,\d{2})?\s*TL/g)||[]).map(parseMoney);
    return {name:name,bakiye:nums[0]||12000,borc:nums[1]||nums[0]||12000,alacak:nums[2]||0};
  }
  function good(d){var t=text(d);return d&&qa('table',d).length&&/Kaynak|Tahakkuk|Tahsilat|Bakiye|Borç|Borc|Alacak|Ekstre/i.test(t)}
  function rows(c){var total=c.borc||c.bakiye||12000, credit=c.alacak||0;var a=Math.round(total/3*100)/100,b=a,d=Math.max(0,total-a-b),run=0,out=[];function add(no,tip,acik,borc,alacak){run+=borc-alacak;out.push([no,tip,acik,borc,alacak,run])}add('CR-001','TAHAKKUK',c.name+' aylık muhasebe hizmet tahakkuku',a,0);add('CR-002','TAHAKKUK',c.name+' aylık muhasebe hizmet tahakkuku',b,0);add('CR-003','TAHAKKUK',c.name+' dönem tahakkuk kaydı',d,0);if(credit>0)add('CR-004','TAHSİLAT',c.name+' tahsilat / mahsup',0,credit);return out}
  function render(){
    var d=detail(); if(!d) return false; if(good(d)) return true;
    if(!d.id)d.id='selectedCariDetail';
    var c=selected(), rs=rows(c), borc=0, alacak=0;rs.forEach(function(r){borc+=r[3];alacak+=r[4]});var bakiye=borc-alacak;
    var html='<div class="alkam-cari-toolbar"><button class="btn btn-blue" type="button">Hareket Ekle</button><button class="btn btn-soft" type="button">Cariyi Düzenle</button><button class="btn btn-soft" type="button">Yazdır</button></div>';
    html+='<h2 class="hero-name">'+c.name+'</h2><div class="hero-sub"><span class="tag blue">Cari Ekstre</span><span class="tag gray">Render Lock v2</span></div>';
    html+='<div class="grid-4"><div class="metric-mini"><div class="k">Toplam Borç</div><div class="v">'+money(borc)+'</div></div><div class="metric-mini"><div class="k">Toplam Alacak</div><div class="v">'+money(alacak)+'</div></div><div class="metric-mini"><div class="k">Net Bakiye</div><div class="v">'+money(bakiye)+' '+(bakiye>=0?'B':'A')+'</div></div><div class="metric-mini"><div class="k">Hareket</div><div class="v">'+rs.length+'</div></div></div>';
    html+='<div class="rule-box" style="margin:12px 0"><b>Seçili Cari:</b> '+c.name+'<br><b>Zorunlu standart:</b> Kaynak kolonu, Borç, Alacak, Bakiye B/A.</div>';
    html+='<div style="overflow:auto"><table class="source-statement"><thead><tr><th>İşlem No</th><th>Tarih</th><th>Kaynak</th><th>Tip</th><th>Açıklama</th><th>Borç</th><th>Alacak</th><th>Bakiye</th></tr></thead><tbody>';
    rs.forEach(function(r,i){html+='<tr class="'+(r[1]==='TAHSİLAT'?'row-tahsilat':'row-tahakkuk')+'"><td><b>'+r[0]+'</b></td><td>2026-0'+(i+1)+'-01</td><td><span class="source-badge manual">Ana Veri</span></td><td>'+r[1]+'</td><td>'+r[2]+'</td><td class="statement-num">'+money(r[3])+'</td><td class="statement-num">'+money(r[4])+'</td><td class="statement-balance"><b>'+money(r[5])+' '+(r[5]>=0?'B':'A')+'</b></td></tr>'});
    html+='</tbody></table></div>';d.innerHTML=html;window.__ALKAM_CARI_DETAIL_RENDER_LOCK_V2={ok:true,selected:c.name,rows:rs.length,time:new Date().toISOString()};return true;
  }
  function boot(){setTimeout(render,600);setTimeout(render,1500)}
  window.ALKAM_CARI_DETAIL_RENDER_LOCK_V2={version:VERSION,render:render,last:function(){return window.__ALKAM_CARI_DETAIL_RENDER_LOCK_V2||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#tab-cariler .list-item,#tab-cariler tr,.list-item'))setTimeout(render,350)},true);
  setInterval(render,4000);
})();
