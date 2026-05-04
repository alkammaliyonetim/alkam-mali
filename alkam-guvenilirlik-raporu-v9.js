(function(){
  'use strict';
  var VERSION='ALKAM Güvenilirlik Raporu v9.0';
  function q(s,r){return (r||document).querySelector(s)}
  function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return []}}
  function m(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function css(){
    if(q('#alkam-guvenilirlik-style'))return;
    var st=document.createElement('style');st.id='alkam-guvenilirlik-style';
    st.textContent='.alkam-guven-modal{position:fixed;inset:0;z-index:1000005;background:rgba(15,23,42,.42);display:none;align-items:center;justify-content:center;padding:18px}.alkam-guven-modal.open{display:flex}.alkam-guven-box{width:min(1100px,100%);max-height:90vh;background:#fff;border-radius:20px;border:1px solid #dbe4f0;box-shadow:0 30px 80px rgba(15,23,42,.32);font-family:Arial,Helvetica,sans-serif;overflow:hidden}.alkam-guven-head{padding:16px 18px;background:linear-gradient(180deg,#f8fbff,#fff);border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:10px}.alkam-guven-head b{font-size:18px;color:#0f172a}.alkam-guven-head small{display:block;margin-top:4px;color:#64748b;font-weight:800}.alkam-guven-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950;cursor:pointer}.alkam-guven-body{padding:16px 18px;overflow:auto;max-height:calc(90vh - 72px)}.alkam-guven-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.alkam-guven-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px}.alkam-guven-card b{display:block;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.04em}.alkam-guven-card span{display:block;margin-top:6px;font-size:20px;font-weight:950;color:#0f172a}.alkam-guven-card.ok span{color:#047857}.alkam-guven-card.warn span{color:#c2410c}.alkam-guven-card.bad span{color:#b91c1c}.alkam-guven-section{border:1px solid #e2e8f0;background:#fff;border-radius:14px;margin-bottom:12px;overflow:hidden}.alkam-guven-section h4{margin:0;padding:11px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#0f172a}.alkam-guven-section table{width:100%;border-collapse:collapse}.alkam-guven-section th{background:#fbfdff;color:#64748b;font-size:11px;text-transform:uppercase;text-align:left;padding:8px}.alkam-guven-section td{border-top:1px solid #eef2f7;padding:8px;font-size:12px;font-weight:800;color:#0f172a}.alkam-guven-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.alkam-guven-actions button{height:34px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-guven-actions button.secondary{background:#e8eef9;color:#0f172a}@media(max-width:900px){.alkam-guven-grid{grid-template-columns:1fr}.alkam-guven-section{overflow:auto}.alkam-guven-section table{min-width:720px}}';
    document.head.appendChild(st);
  }
  function build(){
    var backups=(window.ALKAM_RELIABILITY_GUARD&&ALKAM_RELIABILITY_GUARD.backups&&ALKAM_RELIABILITY_GUARD.backups())||[];
    var dataQuality=(window.ALKAM_DATA_QUALITY&&ALKAM_DATA_QUALITY.last&&ALKAM_DATA_QUALITY.last())||{};
    var banka=(window.ALKAM_BANKA_ONAY_V8&&ALKAM_BANKA_ONAY_V8.summary&&ALKAM_BANKA_ONAY_V8.summary())||{};
    var tah=(window.ALKAM_TAHAKKUK_CONTROL_V5C&&ALKAM_TAHAKKUK_CONTROL_V5C.last&&ALKAM_TAHAKKUK_CONTROL_V5C.last())||(window.ALKAM_TAHAKKUK_CONTROL_V5C&&ALKAM_TAHAKKUK_CONTROL_V5C.test&&ALKAM_TAHAKKUK_CONTROL_V5C.test())||{};
    var finans=(window.ALKAM_FINANS_FLOW_V6&&ALKAM_FINANS_FLOW_V6.summary&&ALKAM_FINANS_FLOW_V6.summary())||{};
    var bankPending=Number(banka.onayBekleyen||0), dqErr=((dataQuality.errors||[]).length||0), dqWarn=((dataQuality.warnings||[]).length||0);
    var status=dqErr?'bad':(dqWarn||bankPending?'warn':'ok');
    return {version:VERSION,status:status,backups:backups,dataQuality:dataQuality,banka:banka,tahakkuk:tah,finans:finans,time:new Date().toISOString()};
  }
  function modal(){
    var el=q('#alkamGuvenilirlikModal'); if(el)return el;
    el=document.createElement('div'); el.id='alkamGuvenilirlikModal'; el.className='alkam-guven-modal';
    el.innerHTML='<div class="alkam-guven-box"><div class="alkam-guven-head"><div><b>Genel Güvenilirlik Raporu</b><small>Yedek, veri kalite, banka onay, tahakkuk ve finans kontrolleri.</small></div><button class="alkam-guven-close">×</button></div><div class="alkam-guven-body" id="alkamGuvenBody"></div></div>';
    document.body.appendChild(el);
    q('.alkam-guven-close',el).onclick=function(){el.classList.remove('open')};
    return el;
  }
  function render(){
    var el=modal(); var body=q('#alkamGuvenBody',el); var r=build();
    var backups=r.backups||[], dq=r.dataQuality||{}, bank=r.banka||{}, tah=r.tahakkuk||{}, fin=r.finans||{};
    var badge=r.status==='ok'?'GÜVENLİ':(r.status==='warn'?'UYARI':'KRİTİK');
    body.innerHTML='<div class="alkam-guven-actions"><button onclick="window.ALKAM_RELIABILITY_GUARD&&ALKAM_RELIABILITY_GUARD.snapshot&&ALKAM_RELIABILITY_GUARD.snapshot(\'genel güvenilirlik raporu\')">Manuel Yedek Al</button><button class="secondary" onclick="window.ALKAM_DATA_QUALITY&&ALKAM_DATA_QUALITY.run&&ALKAM_DATA_QUALITY.run(); setTimeout(function(){window.ALKAM_GUVENILIRLIK_RAPORU_V9.render()},300)">Veri Kontrol Et</button></div>'+
      '<div class="alkam-guven-grid"><div class="alkam-guven-card '+r.status+'"><b>Genel Durum</b><span>'+badge+'</span></div><div class="alkam-guven-card"><b>Yedek Sayısı</b><span>'+backups.length+'</span></div><div class="alkam-guven-card '+((dq.errors||[]).length?'bad':((dq.warnings||[]).length?'warn':'ok'))+'"><b>Veri Kalite</b><span>'+((dq.errors||[]).length||0)+' H / '+((dq.warnings||[]).length||0)+' U</span></div><div class="alkam-guven-card '+(bank.onayBekleyen?'warn':'ok')+'"><b>Banka Onay</b><span>'+(bank.onayBekleyen||0)+'</span></div></div>'+
      '<div class="alkam-guven-section"><h4>Operasyon Özeti</h4><table><thead><tr><th>Alan</th><th>Durum</th><th>Detay</th></tr></thead><tbody><tr><td>Tahakkuk</td><td>'+(tah.status||'ok')+'</td><td>Kayıt: '+(tah.count||0)+' · Toplam: '+m(tah.total||0)+'</td></tr><tr><td>Banka</td><td>'+(bank.onayBekleyen?'Onay Bekliyor':'Temiz')+'</td><td>Bekleyen: '+(bank.onayBekleyen||0)+' · İşlenen: '+(bank.islenen||0)+' · Reddedilen: '+(bank.reddedilen||0)+'</td></tr><tr><td>Finans</td><td>Aktif</td><td>Hareket: '+(fin.count||0)+'</td></tr></tbody></table></div>'+
      '<div class="alkam-guven-section"><h4>Son Yedekler</h4><table><thead><tr><th>ID</th><th>Sebep</th><th>Zaman</th></tr></thead><tbody>'+(backups.slice(0,10).map(function(b){return '<tr><td>'+b.id+'</td><td>'+b.reason+'</td><td>'+b.time+'</td></tr>'}).join('')||'<tr><td colspan="3">Yedek yok</td></tr>')+'</tbody></table></div>';
    window.__ALKAM_GUVENILIRLIK_LAST=r; return r;
  }
  function open(){css();modal().classList.add('open');render()}
  function addButtons(){
    var bar=q('#alkamActionBar'); if(bar&&!q('#alkamABGuven',bar)){var b=document.createElement('button');b.id='alkamABGuven';b.type='button';b.textContent='Güven Raporu';b.onclick=open;bar.appendChild(b)}
    var body=q('#alkamProfessionalDrawer .alkam-drawer-body'); if(body&&!q('#alkamGuvenCard',body)){body.insertAdjacentHTML('beforeend','<div class="alkam-control-card" id="alkamGuvenCard"><b>Genel Güvenilirlik Raporu</b><div class="line">Yedek, banka, tahakkuk, finans ve veri kalite özetini tek ekranda gösterir.</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_GUVENILIRLIK_RAPORU_V9&&ALKAM_GUVENILIRLIK_RAPORU_V9.open()">Raporu Aç</button></div></div>')}
  }
  function run(){css();modal();addButtons()}
  window.ALKAM_GUVENILIRLIK_RAPORU_V9={version:VERSION,open:open,render:render,build:build,run:run,last:function(){return window.__ALKAM_GUVENILIRLIK_LAST||build()},test:function(){return {version:VERSION,modal:!!q('#alkamGuvenilirlikModal'),actionButton:!!q('#alkamABGuven'),drawerCard:!!q('#alkamGuvenCard'),status:build().status,time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(addButtons,2500);
})();
