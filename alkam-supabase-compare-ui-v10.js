(function(){
  'use strict';
  var VERSION='ALKAM Supabase Compare UI v10.8';
  function q(s,r){return (r||document).querySelector(s)}
  function n(v){return Number(v||0)||0}
  function localPrecheck(){try{return window.ALKAM_MIGRATION_PRECHECK_V10&&ALKAM_MIGRATION_PRECHECK_V10.scan?ALKAM_MIGRATION_PRECHECK_V10.scan():null}catch(e){return null}}
  async function supabaseSummary(){
    var ro=window.ALKAM_SUPABASE_READONLY_V10;
    if(!ro||!ro.status||!ro.status().readReady)return {ok:false,reason:'Supabase read-only hazır değil',status:ro&&ro.status?ro.status():null};
    var finans=await ro.readFinanceAccounts();
    var cari=await ro.readCariBakiye();
    var banka=await ro.readBankaOzet();
    return {ok:true,finans:finans,cari:cari,banka:banka,time:new Date().toISOString()};
  }
  async function compare(){
    var local=localPrecheck();
    var supa=await supabaseSummary();
    var rows=[];
    function add(area,localVal,supaVal,status,detail){rows.push({area:area,local:localVal,supabase:supaVal,status:status,detail:detail||''})}
    if(!local){add('LocalStorage Ön Kontrol','Yok','-', 'Kritik','Migration precheck modülü yok')}
    else{add('LocalStorage JSON Hata',local.errors, '-', local.errors?'Kritik':'Temiz','JSON hata sayısı')}
    if(!supa.ok){add('Supabase Read-only','-', 'Hazır değil','Uyarı',supa.reason||'')}
    else{
      add('Supabase Finans Hesapları','-', (supa.finans.data||[]).length, supa.finans.ok?'Temiz':'Kritik', supa.finans.error?JSON.stringify(supa.finans.error):'');
      add('Supabase Cari Bakiye View','-', (supa.cari.data||[]).length, supa.cari.ok?'Temiz':'Kritik', supa.cari.error?JSON.stringify(supa.cari.error):'');
      add('Supabase Banka Onay View','-', (supa.banka.data||[]).length, supa.banka.ok?'Temiz':'Kritik', supa.banka.error?JSON.stringify(supa.banka.error):'');
    }
    if(local&&local.rows){
      var map={}; local.rows.forEach(function(r){map[r.key]=r.count});
      add('Local Cari Hareketleri',map.alkam_cari_hareketleri||0,'Karşılaştırma için import bekleniyor','Bilgi','Cari ana defter en son taşınacak');
      add('Local Tahakkuklar',map.alkam_tahakkuklar||0,'Karşılaştırma için import bekleniyor','Bilgi','');
      add('Local Tahsilatlar',map.alkam_tahsilatlar||0,'Karşılaştırma için import bekleniyor','Bilgi','');
      add('Local Banka Onay Bekleyen',map.alkam_onay_bekleyen_banka||0,'Supabase view ile kıyaslanacak','Bilgi','');
    }
    var critical=rows.filter(function(x){return x.status==='Kritik'}).length;
    var warning=rows.filter(function(x){return x.status==='Uyarı'}).length;
    var result={version:VERSION,status:critical?'Kritik':(warning?'Uyarı':'Temiz'),critical:critical,warning:warning,rows:rows,local:local,supabase:supa,time:new Date().toISOString()};
    window.__ALKAM_SUPABASE_COMPARE_LAST=result;
    return result;
  }
  function css(){if(q('#alkam-supa-compare-style'))return;var st=document.createElement('style');st.id='alkam-supa-compare-style';st.textContent='.alkam-supa-cmp-modal{position:fixed;inset:0;z-index:1000015;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-supa-cmp-modal.open{display:flex}.alkam-supa-cmp-box{width:min(980px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-supa-cmp-head{padding:16px 18px;background:#f8fbff;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between}.alkam-supa-cmp-head b{font-size:18px;color:#0f172a}.alkam-supa-cmp-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-supa-cmp-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-supa-cmp-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-supa-cmp-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-supa-cmp-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-supa-cmp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.alkam-supa-cmp-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-supa-cmp-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase}.alkam-supa-cmp-card span{display:block;margin-top:6px;font-size:20px;font-weight:950}.alkam-supa-cmp-table{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden}.alkam-supa-cmp-table table{width:100%;border-collapse:collapse}.alkam-supa-cmp-table th{background:#f8fafc;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:9px}.alkam-supa-cmp-table td{border-top:1px solid #eef2f7;padding:9px;font-size:12px;font-weight:800}.cmp-ok{color:#047857;font-weight:950}.cmp-warn{color:#c2410c;font-weight:950}.cmp-bad{color:#b91c1c;font-weight:950}@media(max-width:900px){.alkam-supa-cmp-grid{grid-template-columns:1fr}.alkam-supa-cmp-table{overflow:auto}.alkam-supa-cmp-table table{min-width:760px}}';document.head.appendChild(st)}
  function modal(){var el=q('#alkamSupabaseCompareModal');if(el)return el;el=document.createElement('div');el.id='alkamSupabaseCompareModal';el.className='alkam-supa-cmp-modal';el.innerHTML='<div class="alkam-supa-cmp-box"><div class="alkam-supa-cmp-head"><div><b>LocalStorage / Supabase Karşılaştırma</b><small>Canlı yazma açılmadan önce read-only fark kontrolü.</small></div><button class="alkam-supa-cmp-close">×</button></div><div class="alkam-supa-cmp-body" id="alkamSupaCompareBody"></div></div>';document.body.appendChild(el);q('.alkam-supa-cmp-close',el).onclick=function(){el.classList.remove('open')};return el}
  async function render(){css();var el=modal(),body=q('#alkamSupaCompareBody',el);body.innerHTML='<div class="alkam-supa-cmp-actions"><button>Karşılaştırılıyor...</button></div>';var r=await compare();body.innerHTML='<div class="alkam-supa-cmp-actions"><button onclick="window.ALKAM_SUPABASE_COMPARE_UI_V10&&ALKAM_SUPABASE_COMPARE_UI_V10.render()">Yenile</button></div><div class="alkam-supa-cmp-grid"><div class="alkam-supa-cmp-card"><b>Durum</b><span>'+r.status+'</span></div><div class="alkam-supa-cmp-card"><b>Kritik</b><span>'+r.critical+'</span></div><div class="alkam-supa-cmp-card"><b>Uyarı</b><span>'+r.warning+'</span></div></div><div class="alkam-supa-cmp-table"><table><thead><tr><th>Alan</th><th>Local</th><th>Supabase</th><th>Durum</th><th>Detay</th></tr></thead><tbody>'+r.rows.map(function(x){var cls=x.status==='Kritik'?'cmp-bad':(x.status==='Uyarı'?'cmp-warn':'cmp-ok');return '<tr><td>'+x.area+'</td><td>'+x.local+'</td><td>'+x.supabase+'</td><td class="'+cls+'">'+x.status+'</td><td>'+x.detail+'</td></tr>'}).join('')+'</tbody></table></div>';return r}
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){var bar=q('#alkamActionBar');if(bar&&!q('#alkamABSupabaseCompare',bar)){var b=document.createElement('button');b.id='alkamABSupabaseCompare';b.type='button';b.textContent='Supa Karşılaştır';b.onclick=open;bar.appendChild(b)}var body=q('#alkamProfessionalDrawer .alkam-drawer-body');if(body&&!q('#alkamSupabaseCompareCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamSupabaseCompareCard"><b>Supabase Karşılaştırma</b><div class="line">LocalStorage ön kontrol ile Supabase read-only özetini karşılaştırır.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_SUPABASE_COMPARE_UI_V10&&ALKAM_SUPABASE_COMPARE_UI_V10.open()">Karşılaştır</button></div></div>')}}
  function boot(){css();setTimeout(function(){modal();addButtons()},1800)}
  window.ALKAM_SUPABASE_COMPARE_UI_V10={version:VERSION,compare:compare,open:open,render:render,run:boot,last:function(){return window.__ALKAM_SUPABASE_COMPARE_LAST||null},test:function(){return {version:VERSION,modal:!!q('#alkamSupabaseCompareModal'),actionButton:!!q('#alkamABSupabaseCompare'),drawerCard:!!q('#alkamSupabaseCompareCard'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(addButtons,3000);
})();
