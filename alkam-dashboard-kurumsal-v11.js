(function(){
  'use strict';
  var VERSION='ALKAM Kurumsal Dashboard v11.10';
  function q(s,r){return (r||document).querySelector(s)}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function money(v){return Number(v||0)||0}
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function loadPeriodFilter(){
    if(window.ALKAM_DASHBOARD_DONEM_FILTRE_V11||q('script[data-alkam-period-filter]'))return;
    var s=document.createElement('script');
    s.src='/alkam-dashboard-donem-filtre-v11.js';
    s.setAttribute('data-alkam-period-filter','1');
    document.head.appendChild(s);
  }
  function getFilter(){
    if(window.ALKAM_DASHBOARD_DONEM_FILTRE_V11&&ALKAM_DASHBOARD_DONEM_FILTRE_V11.getFilter)return ALKAM_DASHBOARD_DONEM_FILTRE_V11.getFilter();
    try{return JSON.parse(localStorage.getItem('alkam_dashboard_donem_filtre')||'{"mode":"all","year":"2026","month":""}')}catch(e){return {mode:'all',year:'2026',month:''}}
  }
  function dateOf(x){return String(x.tarih||x.date||x.created_at||x.createdAt||'')}
  function matchPeriod(x,f){
    if(!f||f.mode==='all')return true;
    var d=dateOf(x); if(!d)return false;
    var y=String(f.year||''); var m=String(f.month||'').padStart(2,'0');
    if(f.mode==='year')return d.indexOf(y)===0 || d.indexOf('.'+y)>-1 || d.indexOf('/'+y)>-1;
    if(f.mode==='month')return d.indexOf(y+'-'+m)===0 || d.indexOf(m+'.'+y)>-1 || d.indexOf(m+'/'+y)>-1;
    return true;
  }
  function filterLabel(f){
    if(!f||f.mode==='all')return 'Tümü';
    if(f.mode==='year')return String(f.year||'Yıl');
    if(f.mode==='month')return String(f.year||'')+' / '+String(f.month||'').padStart(2,'0');
    return 'Tümü';
  }
  function metrics(){
    var f=getFilter();
    var cari=read('alkam_cari_hareketleri').filter(function(x){return matchPeriod(x,f)});
    var tah=read('alkam_tahakkuklar').filter(function(x){return matchPeriod(x,f)});
    var tahsil=read('alkam_tahsilatlar').filter(function(x){return matchPeriod(x,f)});
    var onay=read('alkam_onay_bekleyen_banka');
    var ai=(window.ALKAM_AI_HATA_TESPIT_V11&&ALKAM_AI_HATA_TESPIT_V11.scan)?ALKAM_AI_HATA_TESPIT_V11.scan():null;
    var borc=0, alacak=0;
    cari.forEach(function(x){borc+=money(x.borc);alacak+=money(x.alacak)});
    var tahTop=tah.reduce(function(a,x){return a+money(x.tutar||x.borc)},0);
    var tahsilTop=tahsil.reduce(function(a,x){return a+money(x.tutar||x.alacak)},0);
    return {version:VERSION,filter:f,filterLabel:filterLabel(f),cari:cari.length,tahakkuk:tah.length,tahsilat:tahsil.length,bankaOnay:onay.length,borc:borc,alacak:alacak,bakiye:borc-alacak,tahTop:tahTop,tahsilTop:tahsilTop,aiCritical:(ai&&ai.critical)||0,aiWarning:(ai&&ai.warning)||0,time:new Date().toISOString()};
  }
  function css(){
    if(q('#alkam-dashboard-kurumsal-style'))return;
    var st=document.createElement('style');st.id='alkam-dashboard-kurumsal-style';
    st.textContent='.alkam-corp-wrap{margin:14px 0 18px;padding:16px;border:1px solid #dbe4f0;border-radius:22px;background:linear-gradient(180deg,#f8fbff,#ffffff);box-shadow:0 18px 50px rgba(15,23,42,.08);font-family:Arial,Helvetica,sans-serif}.alkam-corp-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.alkam-corp-head h2{margin:0;color:#0f172a;font-size:22px;letter-spacing:-.3px}.alkam-corp-head p{margin:5px 0 0;color:#64748b;font-weight:800;font-size:12px}.alkam-corp-badges{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.alkam-corp-badge{border-radius:999px;background:#0f172a;color:#fff;padding:8px 12px;font-weight:950;font-size:12px}.alkam-corp-badge.light{background:#e8eef9;color:#0f172a}.alkam-corp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.alkam-corp-card{border:1px solid #e2e8f0;border-radius:16px;background:#fff;padding:13px;min-height:76px}.alkam-corp-card b{display:block;font-size:11px;text-transform:uppercase;color:#64748b}.alkam-corp-card span{display:block;margin-top:8px;font-size:20px;font-weight:950;color:#0f172a}.alkam-corp-card small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-corp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.alkam-corp-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-corp-actions button.secondary{background:#e8eef9;color:#0f172a}@media(max-width:900px){.alkam-corp-grid{grid-template-columns:1fr}.alkam-corp-head{display:block}.alkam-corp-badges{justify-content:flex-start;margin-top:10px}}';
    document.head.appendChild(st);
  }
  function findMount(){return q('#app')||q('main')||q('.container')||document.body}
  function render(){
    loadPeriodFilter();
    css(); var m=metrics(); var host=q('#alkamCorporateDashboard');
    if(!host){host=document.createElement('section');host.id='alkamCorporateDashboard';host.className='alkam-corp-wrap';var mount=findMount();mount.insertBefore(host,mount.firstChild)}
    var durum=m.aiCritical?'Kritik Kontrol':(m.bankaOnay||m.aiWarning?'Kontrol Gerekir':'Sistem Normal');
    host.innerHTML='<div class="alkam-corp-head"><div><h2>ALKAM Mali Yönetim Özeti</h2><p>Cari ana defter, tahakkuk, tahsilat, banka onay ve AI risk görünümü.</p></div><div class="alkam-corp-badges"><div class="alkam-corp-badge light">Dönem: '+m.filterLabel+'</div><div class="alkam-corp-badge">'+durum+'</div></div></div><div class="alkam-corp-grid"><div class="alkam-corp-card"><b>Net Cari Bakiye</b><span>'+fmt(m.bakiye)+'</span><small>'+(m.bakiye>0?'BAKİYE B':(m.bakiye<0?'BAKİYE A':'KAPALI'))+'</small></div><div class="alkam-corp-card"><b>Tahakkuk</b><span>'+fmt(m.tahTop)+'</span><small>'+m.tahakkuk+' kayıt</small></div><div class="alkam-corp-card"><b>Tahsilat</b><span>'+fmt(m.tahsilTop)+'</span><small>'+m.tahsilat+' kayıt</small></div><div class="alkam-corp-card"><b>Banka Onay</b><span>'+m.bankaOnay+'</span><small>bekleyen kayıt</small></div><div class="alkam-corp-card"><b>Cari Hareket</b><span>'+m.cari+'</span><small>ana defter satırı</small></div><div class="alkam-corp-card"><b>AI Kritik</b><span>'+m.aiCritical+'</span><small>önce incelenecek</small></div><div class="alkam-corp-card"><b>AI Uyarı</b><span>'+m.aiWarning+'</span><small>kontrol önerisi</small></div><div class="alkam-corp-card"><b>Sistem Zamanı</b><span style="font-size:13px">'+m.time.slice(0,19).replace('T',' ')+'</span><small>son yenileme</small></div></div><div class="alkam-corp-actions"><button onclick="window.ALKAM_AI_ASISTAN_MERKEZI_V11&&ALKAM_AI_ASISTAN_MERKEZI_V11.open()">AI Merkezi</button><button onclick="window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.open()">Güvenilirlik</button><button onclick="window.ALKAM_AI_RAPOR_OZETI_V11&&ALKAM_AI_RAPOR_OZETI_V11.open()" class="secondary">AI Rapor</button><button onclick="window.ALKAM_BANKA_ONAY_UI_V8&&ALKAM_BANKA_ONAY_UI_V8.open&&ALKAM_BANKA_ONAY_UI_V8.open()" class="secondary">Banka Onay</button></div>';
    setTimeout(function(){if(window.ALKAM_DASHBOARD_DONEM_FILTRE_V11&&ALKAM_DASHBOARD_DONEM_FILTRE_V11.inject)ALKAM_DASHBOARD_DONEM_FILTRE_V11.inject()},100);
    window.__ALKAM_DASHBOARD_KURUMSAL_LAST=m; return m;
  }
  function boot(){setTimeout(function(){loadPeriodFilter();render()},2400)}
  window.ALKAM_DASHBOARD_KURUMSAL_V11={version:VERSION,metrics:metrics,render:render,run:boot,test:function(){var m=render();return {version:VERSION,card:!!q('#alkamCorporateDashboard'),periodFilterLoader:!!q('script[data-alkam-period-filter]'),filter:m.filter,filterLabel:m.filterLabel,metrics:m,time:new Date().toISOString()}},last:function(){return window.__ALKAM_DASHBOARD_KURUMSAL_LAST||metrics()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(render,15000);
})();
