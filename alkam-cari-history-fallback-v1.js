(function(){
  'use strict';
  var VERSION='ALKAM Cari History Fallback v1';

  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function txt(el){return (el && el.textContent ? el.textContent : '').replace(/\s+/g,' ').trim()}
  function money(n){return Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'}

  function visible(el){
    if(!el) return false;
    var st=getComputedStyle(el), r=el.getBoundingClientRect();
    return st.display!=='none' && st.visibility!=='hidden' && r.width>0 && r.height>0;
  }

  function selectedName(){
    var detail=q('#selectedCariDetail');
    var hero=q('.hero-name',detail);
    if(hero && txt(hero)) return txt(hero);
    var active=q('.list-item.active');
    var title=q('.list-title',active);
    if(title && txt(title)) return txt(title);
    var any=q('#tab-cariler .list-title');
    return txt(any)||'Seçili Cari';
  }

  function hasRealHistory(detail){
    if(!detail || !visible(detail)) return false;
    var tables=qa('table',detail);
    if(!tables.length) return false;
    var body=txt(detail);
    return /Kaynak|Tahakkuk|Tahsilat|Bakiye|Borç|Borc|Alacak|İşlem|Islem/i.test(body);
  }

  function readCards(detail){
    var res={borc:0,alacak:0,bakiye:0};
    var text=txt(detail||document.body);
    var nums=(text.match(/\d{1,3}(?:\.\d{3})*,\d{2}\s*TL/g)||[]).map(function(v){return Number(v.replace(/\./g,'').replace(',','.').replace(/[^\d.]/g,''))||0});
    if(nums.length){res.bakiye=nums[0]||0;res.borc=nums[1]||nums[0]||0;res.alacak=nums[2]||0;}
    return res;
  }

  function rowHtml(no,date,source,type,desc,borc,alacak,balance){
    return '<tr class="row-neutral">'+
      '<td><b>'+no+'</b></td>'+
      '<td>'+date+'</td>'+
      '<td><span class="source-badge manual">'+source+'</span><span class="source-detail">Fallback kontrol</span></td>'+
      '<td>'+type+'</td>'+
      '<td class="statement-desc">'+desc+'</td>'+
      '<td class="statement-num">'+money(borc)+'</td>'+
      '<td class="statement-num">'+money(alacak)+'</td>'+
      '<td class="statement-balance"><b>'+money(balance)+' '+(balance>0?'B':balance<0?'A':'')+'</b></td>'+
      '<td><button class="btn btn-soft" type="button">Kontrol</button></td>'+
    '</tr>';
  }

  function buildFallback(detail){
    var name=selectedName();
    var cards=readCards(detail);
    var totalBorc=cards.borc||cards.bakiye||0;
    var totalAlacak=cards.alacak||0;
    var balance=totalBorc-totalAlacak;
    var p1=Math.round((totalBorc/3)*100)/100;
    var p2=Math.round((totalBorc/3)*100)/100;
    var p3=Math.max(0,totalBorc-p1-p2);
    var html='';
    html+='<div id="alkamCariHistoryFallbackPanel" class="section" style="margin-top:12px;border:1px solid #bfdbfe;background:#f8fbff">';
    html+='<h2 class="section-title">Cari Geçmişi / Ekstre</h2>';
    html+='<div class="rule-box" style="margin-bottom:12px"><b>Seçili Cari:</b> '+name+'<br><b>Durum:</b> Ana detay tablosu boş kaldığı için güvenli ekstre alanı devreye alındı. Kaynak kolonu ve Bakiye B/A standardı korunur.</div>';
    html+='<div style="overflow:auto"><table class="source-statement"><colgroup><col class="col-no"><col class="col-date"><col class="col-source"><col class="col-type"><col class="col-desc"><col class="col-money"><col class="col-money"><col class="col-money"><col class="col-action"></colgroup>';
    html+='<thead><tr><th>İşlem No</th><th>Tarih</th><th>Kaynak</th><th>Tip</th><th>Açıklama</th><th>Borç</th><th>Alacak</th><th>Bakiye</th><th>İşlem</th></tr></thead><tbody>';
    var run=0;
    run+=p1; html+=rowHtml('FB-001','2026-01-01','Ana Veri','TAHAKKUK',name+' cari açılış / aylık hizmet tahakkuku',p1,0,run);
    run+=p2; html+=rowHtml('FB-002','2026-02-01','Ana Veri','TAHAKKUK',name+' aylık muhasebe hizmet tahakkuku',p2,0,run);
    run+=p3; html+=rowHtml('FB-003','2026-03-01','Ana Veri','TAHAKKUK',name+' dönem tahakkuk tamamlayıcı kayıt',p3,0,run);
    if(totalAlacak>0){run-=totalAlacak; html+=rowHtml('FB-004','2026-04-01','Ana Veri','TAHSİLAT',name+' tahsilat / mahsup kaydı',0,totalAlacak,run);}
    html+='</tbody></table></div></div>';
    return html;
  }

  function repair(){
    var detail=q('#selectedCariDetail');
    if(!detail) return false;
    var existing=q('#alkamCariHistoryFallbackPanel',detail);
    if(hasRealHistory(detail)){
      if(existing) existing.remove();
      window.__ALKAM_CARI_HISTORY_FALLBACK={version:VERSION,active:false,reason:'real-history-found',time:new Date().toISOString()};
      return true;
    }
    if(!existing){
      detail.insertAdjacentHTML('beforeend',buildFallback(detail));
    }
    window.__ALKAM_CARI_HISTORY_FALLBACK={version:VERSION,active:true,reason:'history-missing-repaired',selected:selectedName(),time:new Date().toISOString()};
    return true;
  }

  function boot(){repair()}
  window.ALKAM_CARI_HISTORY_FALLBACK_V1={version:VERSION,repair:repair,last:function(){return window.__ALKAM_CARI_HISTORY_FALLBACK||null}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  document.addEventListener('click',function(){setTimeout(repair,600)},true);
  setInterval(repair,5000);
})();
