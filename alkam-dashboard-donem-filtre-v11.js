(function(){
  'use strict';
  var VERSION='ALKAM Dashboard Dönem Filtre v11.9';
  var KEY='alkam_dashboard_donem_filtre';
  function q(s,r){return (r||document).querySelector(s)}
  function read(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function getFilter(){try{return JSON.parse(localStorage.getItem(KEY)||'{"mode":"all","year":"2026","month":""}')}catch(e){return {mode:'all',year:'2026',month:''}}}
  function setFilter(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
  function dateOf(x){return String(x.tarih||x.date||x.created_at||x.createdAt||'')}
  function match(x,f){
    if(!f||f.mode==='all')return true;
    var d=dateOf(x);
    if(!d)return false;
    if(f.mode==='year')return d.indexOf(String(f.year||''))===0;
    if(f.mode==='month')return d.indexOf(String(f.year||'')+'-'+String(f.month||'').padStart(2,'0'))===0 || d.indexOf(String(f.month||'').padStart(2,'0')+'.'+String(f.year||''))>-1;
    return true;
  }
  function money(v){return Number(v||0)||0}
  function fmt(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function metrics(){
    var f=getFilter();
    var cari=read('alkam_cari_hareketleri').filter(function(x){return match(x,f)});
    var tah=read('alkam_tahakkuklar').filter(function(x){return match(x,f)});
    var tahsil=read('alkam_tahsilatlar').filter(function(x){return match(x,f)});
    var onay=read('alkam_onay_bekleyen_banka');
    var borc=0,alacak=0;
    cari.forEach(function(x){borc+=money(x.borc);alacak+=money(x.alacak)});
    return {version:VERSION,filter:f,cari:cari.length,tahakkuk:tah.length,tahsilat:tahsil.length,bankaOnay:onay.length,borc:borc,alacak:alacak,bakiye:borc-alacak,tahTop:tah.reduce(function(a,x){return a+money(x.tutar||x.borc)},0),tahsilTop:tahsil.reduce(function(a,x){return a+money(x.tutar||x.alacak)},0),time:new Date().toISOString()};
  }
  function css(){if(q('#alkam-dashboard-filter-style'))return;var st=document.createElement('style');st.id='alkam-dashboard-filter-style';st.textContent='.alkam-period-filter{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0 14px}.alkam-period-filter select,.alkam-period-filter input{height:34px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;font-weight:900;background:#fff;color:#0f172a}.alkam-period-filter button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-period-filter .ghost{background:#e8eef9;color:#0f172a}.alkam-period-note{font-size:12px;color:#64748b;font-weight:850}';document.head.appendChild(st)}
  function inject(){
    css();
    var host=q('#alkamCorporateDashboard');
    if(!host)return false;
    if(q('#alkamDashboardPeriodFilter',host))return true;
    var f=getFilter();
    var div=document.createElement('div');div.id='alkamDashboardPeriodFilter';div.className='alkam-period-filter';
    div.innerHTML='<select id="alkamDfMode"><option value="all">Tümü</option><option value="year">Yıl</option><option value="month">Ay</option></select><input id="alkamDfYear" value="'+(f.year||'2026')+'" placeholder="Yıl" style="width:80px"><select id="alkamDfMonth"><option value="">Ay</option>'+Array.from({length:12},function(_,i){var m=String(i+1).padStart(2,'0');return '<option value="'+m+'">'+m+'</option>'}).join('')+'</select><button id="alkamDfApply">Uygula</button><button class="ghost" id="alkamDfAll">Tümü</button><span class="alkam-period-note">Dönem filtresi sadece dashboard özetini etkiler; kayıt değiştirmez.</span>';
    var head=q('.alkam-corp-head',host);
    if(head&&head.nextSibling)host.insertBefore(div,head.nextSibling);else host.insertBefore(div,host.firstChild);
    q('#alkamDfMode',div).value=f.mode||'all';q('#alkamDfMonth',div).value=f.month||'';
    q('#alkamDfApply',div).onclick=function(){setFilter({mode:q('#alkamDfMode',div).value,year:q('#alkamDfYear',div).value||'2026',month:q('#alkamDfMonth',div).value});refreshDashboard()};
    q('#alkamDfAll',div).onclick=function(){setFilter({mode:'all',year:q('#alkamDfYear',div).value||'2026',month:''});refreshDashboard()};
    return true;
  }
  function refreshDashboard(){
    if(window.ALKAM_DASHBOARD_KURUMSAL_V11&&ALKAM_DASHBOARD_KURUMSAL_V11.render){ALKAM_DASHBOARD_KURUMSAL_V11.render();}
    setTimeout(inject,100);
    return metrics();
  }
  function boot(){setTimeout(function(){inject();},3000)}
  window.ALKAM_DASHBOARD_DONEM_FILTRE_V11={version:VERSION,getFilter:getFilter,setFilter:setFilter,metrics:metrics,inject:inject,refresh:refreshDashboard,test:function(){return {version:VERSION,filter:getFilter(),injected:inject(),metrics:metrics(),time:new Date().toISOString()}},run:boot};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  setInterval(inject,5000);
})();
