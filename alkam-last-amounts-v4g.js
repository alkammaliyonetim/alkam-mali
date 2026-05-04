(function(){
  'use strict';
  var VERSION='ALKAM Last Amounts v4G';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function root(){return q('#selectedCariDetail')||q('#tab-cariler')||document.body}
  function clean(x){return String(x||'').replace(/\s+/g,' ').trim()}
  function parseMoney(v){
    var s=String(v||'').replace(/TL|₺|Bakiye|B|A/g,'').replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(',', '.');
    var n=parseFloat(s); return isNaN(n)?0:n;
  }
  function money(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function dateKey(v){
    var s=String(v||'');
    var m=s.match(/(\d{2})\.(\d{2})\.(\d{4})/); if(m) return m[3]+'-'+m[2]+'-'+m[1];
    m=s.match(/(\d{4})-(\d{2})-(\d{2})/); if(m) return m[1]+'-'+m[2]+'-'+m[3];
    return s;
  }
  function table(){
    return qa('table',root()).find(function(t){var x=(t.textContent||'').toLowerCase();return x.indexOf('borç')>-1&&x.indexOf('alacak')>-1});
  }
  function scan(){
    var t=table(); var out={lastTahakkuk:null,lastTahsilat:null,rows:0,version:VERSION,time:new Date().toISOString()};
    if(!t) return out;
    var heads=qa('thead th',t).map(function(th){return clean(th.textContent).toLowerCase()});
    var borcIdx=heads.findIndex(function(h){return h.indexOf('borç')>-1||h.indexOf('borc')>-1});
    var alacakIdx=heads.findIndex(function(h){return h.indexOf('alacak')>-1});
    var tarihIdx=heads.findIndex(function(h){return h.indexOf('tarih')>-1});
    var acikIdx=heads.findIndex(function(h){return h.indexOf('açıklama')>-1||h.indexOf('aciklama')>-1});
    qa('tbody tr',t).forEach(function(tr){
      var c=qa('td',tr).map(function(td){return clean(td.textContent)}); if(!c.length) return; out.rows++;
      var borc=parseMoney(c[borcIdx]||''), alacak=parseMoney(c[alacakIdx]||'');
      var tarih=c[tarihIdx]||c[1]||c[0]||''; var acik=(c[acikIdx]||c[4]||c[3]||'').toLowerCase();
      if(borc>0 || acik.indexOf('tahakkuk')>-1 || acik.indexOf('muhasebe ücreti')>-1){
        var item={date:tarih,key:dateKey(tarih),amount:borc,desc:acik};
        if(!out.lastTahakkuk || item.key>=out.lastTahakkuk.key) out.lastTahakkuk=item;
      }
      if(alacak>0 || acik.indexOf('tahsil')>-1 || acik.indexOf('ödeme')>-1 || acik.indexOf('odeme')>-1){
        var item2={date:tarih,key:dateKey(tarih),amount:alacak,desc:acik};
        if(!out.lastTahsilat || item2.key>=out.lastTahsilat.key) out.lastTahsilat=item2;
      }
    });
    return out;
  }
  function ensurePanel(){
    var r=root(); if(!r) return;
    var data=scan();
    var p=document.getElementById('alkamLastAmountsPanel');
    if(!p){
      p=document.createElement('div'); p.id='alkamLastAmountsPanel';
      var anchor=document.getElementById('alkamCariDetailStandardPanel')||q('.hero-name',r)||r.firstElementChild;
      if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(p,anchor.nextSibling); else r.insertBefore(p,r.firstChild);
    }
    var th=data.lastTahakkuk, ts=data.lastTahsilat;
    p.innerHTML='<div class="alkam-last-title">Son İşlem Tutar Kontrolü</div><div class="alkam-last-grid"><div><b>Son Tahakkuk</b><span>'+(th?th.date:'-')+'</span><strong>'+(th?money(th.amount):'0,00 TL')+'</strong></div><div><b>Son Tahsilat</b><span>'+(ts?ts.date:'-')+'</span><strong>'+(ts?money(ts.amount):'0,00 TL')+'</strong></div></div>';
    window.__ALKAM_LAST_AMOUNTS=data;
  }
  function css(){
    if(q('#alkam-last-amounts-style')) return;
    var st=document.createElement('style'); st.id='alkam-last-amounts-style';
    st.textContent='#alkamLastAmountsPanel{margin:10px 0 12px!important;padding:12px!important;border:1px solid #bbf7d0!important;background:#f0fdf4!important;border-radius:14px!important}.alkam-last-title{font-size:14px;font-weight:900;color:#047857;margin-bottom:8px}.alkam-last-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.alkam-last-grid div{background:#fff;border:1px solid #dcfce7;border-radius:10px;padding:8px}.alkam-last-grid b{display:block;font-size:10px;color:#64748b;margin-bottom:4px}.alkam-last-grid span{display:block;font-size:12px;font-weight:800;color:#334155}.alkam-last-grid strong{display:block;margin-top:3px;font-size:14px;font-weight:900;color:#0f172a}@media(max-width:900px){.alkam-last-grid{grid-template-columns:1fr}}';
    document.head.appendChild(st);
  }
  function expose(){window.ALKAM_LAST_AMOUNTS_V4G={version:VERSION,scan:scan,run:function(){css();ensurePanel();return window.__ALKAM_LAST_AMOUNTS},test:function(){css();ensurePanel();return window.__ALKAM_LAST_AMOUNTS}}}
  function run(){try{css();expose();var txt=(root().textContent||'').toLowerCase();if(txt.indexOf('borç')>-1&&txt.indexOf('alacak')>-1) ensurePanel();}catch(e){console.warn('ALKAM Last Amounts hata:',e)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(run,1600);
})();
