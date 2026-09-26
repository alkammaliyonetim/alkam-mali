(function(){
  'use strict';
  if (window.__ISTASYON_V13_CONTROL_TOWER__) return;
  window.__ISTASYON_V13_CONTROL_TOWER__ = true;

  var VERSION = 'İstasyON v13 Control Tower 1.0';
  var SOURCE_URL = '/alkam-cariler-73-istasyon-canli-15092026.json';
  var CONTROL_URL = '/data/istasyon-v13-source-controls.json';
  var STATUS_URL = '/api/istasyon/status';

  function q(s,r){ return (r||document).querySelector(s); }
  function n(v){ var x=Number(v||0); return isFinite(x)?x:0; }
  function money(v){ return n(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL'; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
  async function getJson(url){
    var res=await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error(url+' HTTP '+res.status);
    return res.json();
  }
  function css(){
    if(q('#istasyonV13Style')) return;
    var s=document.createElement('style');s.id='istasyonV13Style';
    s.textContent=
      '.istv13{border:1px solid #cbd5e1;background:linear-gradient(180deg,#f8fbff,#fff);border-radius:20px;padding:16px;margin:0 0 16px;box-shadow:0 12px 34px rgba(15,23,42,.06);font-family:Arial,Helvetica,sans-serif}' +
      '.istv13-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}.istv13-title{font-size:23px;font-weight:950;color:#0f172a}.istv13-sub{font-size:12px;color:#64748b;font-weight:800;margin-top:4px;line-height:1.5}.istv13-badge{border:1px solid #bbf7d0;background:#f0fdf4;color:#047857;border-radius:999px;padding:7px 10px;font-size:10px;font-weight:950;white-space:nowrap}' +
      '.istv13-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}.istv13-card{border:1px solid #e2e8f0;background:#fff;border-radius:14px;padding:11px;min-height:72px}.istv13-card b{display:block;color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:.05em}.istv13-card strong{display:block;color:#0f172a;font-size:18px;margin-top:6px;line-height:1.15}.istv13-card small{display:block;color:#64748b;font-size:10px;margin-top:4px;font-weight:800}' +
      '.istv13-alerts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.istv13-alert{border:1px solid #fde68a;background:#fffbeb;color:#92400e;border-radius:12px;padding:9px;font-size:11px;font-weight:850;line-height:1.4}.istv13-alert.ok{border-color:#bbf7d0;background:#f0fdf4;color:#047857}.istv13-alert.red{border-color:#fecaca;background:#fef2f2;color:#b91c1c}' +
      '.istv13-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}.istv13-actions button{border:0;border-radius:10px;padding:8px 11px;background:#1769e8;color:#fff;font-size:11px;font-weight:950;cursor:pointer}.istv13-actions button.secondary{background:#e8eef9;color:#0f172a}' +
      '@media(max-width:1100px){.istv13-grid{grid-template-columns:repeat(3,1fr)}.istv13-alerts{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.istv13-grid,.istv13-alerts{grid-template-columns:1fr 1fr}.istv13-head{display:block}.istv13-badge{display:inline-block;margin-top:8px}}';
    document.head.appendChild(s);
  }
  function host(){
    return q('#tab-dashboard') || q('.main') || q('main') || document.body;
  }
  function mount(){
    css();
    var root=host();
    if(!root || q('#istasyonV13',root)) return;
    var el=document.createElement('div');
    el.id='istasyonV13';el.className='istv13';
    el.innerHTML='<div class="istv13-head"><div><div class="istv13-title">İstasyON — ALKAM Kontrol Kulesi</div><div class="istv13-sub">73 aktif cari · Bizmu geçmişi · Halkbank/Gmail akışı · belge ve cari mutabakatı · kesin kayıtlar onay kontrollü</div></div><div class="istv13-badge">CANLI YAZMA KİLİTLİ</div></div><div id="istasyonV13Body">Yükleniyor…</div>';
    root.insertBefore(el,root.firstChild);
    refresh();
  }
  function findSwitch(tab){
    try{
      if(typeof window.switchTab==='function'){window.switchTab(tab);return true;}
      var b=q('[data-tab="'+tab+'"]');if(b){b.click();return true;}
    }catch(e){}
    return false;
  }
  function compute(cariler,ctl,status){
    var tx=0, legacy=0;
    (cariler||[]).forEach(function(c){ tx+=(Array.isArray(c.transactions)?c.transactions.length:0); legacy+=n(c.signedBalance!=null?c.signedBalance:c.balance); });
    legacy=Math.round(legacy*100)/100;
    return {
      cariler:(cariler||[]).length,
      transactions:tx,
      legacyNet:legacy,
      canonicalNet:n(ctl.canonical_opening_net),
      diff:Math.round((legacy-n(ctl.canonical_opening_net))*100)/100,
      identity:(ctl.identity_review_names||[]).length,
      period:(ctl.period_review_names||[]).length,
      bankCount:n(status&&status.inbox&&status.inbox.bank_statement_count),
      mailCount:n(status&&status.inbox&&status.inbox.mail_count),
      gmailReady:!!(status&&status.environment&&status.environment.gmail_ingest),
      queueReady:!!(status&&status.environment&&status.environment.mail_queue),
      latestBankAt:status&&status.inbox&&status.inbox.latest_bank_at||'',
      writeMode:status&&status.controls&&status.controls.write_mode||'APPROVAL_REQUIRED'
    };
  }
  function render(state){
    var body=q('#istasyonV13Body');if(!body)return;
    var lastBank=state.latestBankAt?new Date(state.latestBankAt).toLocaleString('tr-TR'):'Henüz yok';
    body.innerHTML=
      '<div class="istv13-grid">'+
        '<div class="istv13-card"><b>Aktif Cari</b><strong>'+state.cariler+'</strong><small>hedef: 73</small></div>'+
        '<div class="istv13-card"><b>Geçmiş Hareket</b><strong>'+state.transactions.toLocaleString('tr-TR')+'</strong><small>Bizmu/İstasyON geçmişi</small></div>'+
        '<div class="istv13-card"><b>Kanonik Açılış</b><strong>'+money(state.canonicalNet)+'</strong><small>PDF + liste mutabakat hedefi</small></div>'+
        '<div class="istv13-card"><b>Eski JSON Bakiye</b><strong>'+money(state.legacyNet)+'</strong><small>açılış kaynağı değildir</small></div>'+
        '<div class="istv13-card"><b>JSON Farkı</b><strong>'+money(state.diff)+'</strong><small>mutabakatta tutulur</small></div>'+
        '<div class="istv13-card"><b>Halkbank Ekstre</b><strong>'+state.bankCount+'</strong><small>kuyruktaki banka belgesi</small></div>'+
      '</div>'+
      '<div class="istv13-alerts">'+
        '<div class="istv13-alert '+(state.cariler===73?'ok':'red')+'">Cari master: <b>'+state.cariler+'/73</b></div>'+
        '<div class="istv13-alert '+(state.gmailReady&&state.queueReady?'ok':'red')+'">Gmail → kuyruk: <b>'+(state.gmailReady&&state.queueReady?'Hazır':'Kontrol gerekli')+'</b></div>'+
        '<div class="istv13-alert">Kimlik/dönem inceleme: <b>'+state.identity+'</b> cari</div>'+
        '<div class="istv13-alert">İleri dönem kontrolü: <b>'+state.period+'</b> cari</div>'+
        '<div class="istv13-alert ok">Finans yazma: <b>'+esc(state.writeMode)+'</b></div>'+
        '<div class="istv13-alert ok">Banka otomatik posting: <b>KAPALI</b></div>'+
        '<div class="istv13-alert">Toplam mail kuyruğu: <b>'+state.mailCount+'</b></div>'+
        '<div class="istv13-alert">Son banka belgesi: <b>'+esc(lastBank)+'</b></div>'+
      '</div>'+
      '<div class="istv13-actions">'+
        '<button type="button" id="istv13Refresh">Yenile</button>'+
        '<button type="button" class="secondary" id="istv13Cari">Carileri Aç</button>'+
        '<button type="button" class="secondary" id="istv13Bank">Banka / Hesaplar</button>'+
      '</div>';
    q('#istv13Refresh').onclick=refresh;
    q('#istv13Cari').onclick=function(){findSwitch('cariler');};
    q('#istv13Bank').onclick=function(){findSwitch('hesaplar')||findSwitch('finans');};
  }
  async function refresh(){
    var body=q('#istasyonV13Body');if(body)body.textContent='Canlı kaynaklar okunuyor…';
    try{
      var data=await Promise.all([getJson(SOURCE_URL),getJson(CONTROL_URL),getJson(STATUS_URL)]);
      var state=compute(data[0],data[1],data[2]);
      window.__ISTASYON_V13_STATE=state;
      render(state);
      return state;
    }catch(e){
      if(body) body.innerHTML='<div class="istv13-alert red">Kontrol Kulesi kaynak hatası: '+esc(e.message||e)+'</div>';
      return {ok:false,error:String(e.message||e)};
    }
  }
  function test(){
    var s=window.__ISTASYON_V13_STATE||{};
    return {
      version:VERSION,
      mounted:!!q('#istasyonV13'),
      activeCari:s.cariler||0,
      canonicalOpening:s.canonicalNet||0,
      bankQueue:s.bankCount||0,
      writeMode:s.writeMode||'UNKNOWN',
      financialWrites:0
    };
  }
  window.ISTASYON_V13_CONTROL_TOWER={version:VERSION,mount:mount,refresh:refresh,test:test,state:function(){return window.__ISTASYON_V13_STATE||null;}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(mount,300)});else setTimeout(mount,300);
  document.addEventListener('click',function(){setTimeout(mount,100)},true);
})();
