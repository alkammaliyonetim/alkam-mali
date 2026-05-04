(function(){
  'use strict';
  var VERSION='ALKAM Professional UI v1.1 hierarchy-cleanup';
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function css(){
    if(q('#alkam-professional-ui-style'))return;
    var st=document.createElement('style');
    st.id='alkam-professional-ui-style';
    st.textContent='body{background:#f4f7fb!important;color:#0f172a!important}#alkamCariCoreBanner,#alkamDataQualityPanel,#alkamTahakkukPanel,#alkamTahakkukControlPanel{display:none!important}.topbar,.top-nav,[class*=topbar],[class*=top-nav]{min-height:46px!important;height:46px!important;overflow:hidden!important;box-shadow:0 8px 22px rgba(15,23,42,.06)!important;border-bottom:1px solid #dbe4f0!important}.topbar button,.top-nav button,[class*=topbar] button,[class*=top-nav] button{height:30px!important;font-size:12px!important;padding:0 10px!important}.sidebar,[class*=sidebar]{box-shadow:8px 0 26px rgba(15,23,42,.10)!important}.nav-btn,.menu-item,.sidebar button{border-radius:12px!important;font-weight:900!important}.card,.metric-mini,[class*=card]{box-shadow:0 8px 24px rgba(15,23,42,.04)!important;border-color:#dbe4f0!important}#selectedCariDetail,[id*=selectedCari],.cari-detail,.detail-panel{background:#fff!important;border:1px solid #dbe4f0!important;border-radius:20px!important;box-shadow:0 14px 34px rgba(15,23,42,.06)!important}.alkam-ux-compact #alkamLastAmountsPanel{margin:10px 0 14px!important}.alkam-ux-compact #alkamCariDetailStandardPanel{display:none!important}.alkam-ux-compact .alkam-son-bakiye-card{min-height:180px!important;border-width:2px!important}#alkamProfessionalControlButton{position:fixed;right:22px;bottom:22px;z-index:999999;border:0;border-radius:999px;background:#071f49;color:#fff;height:46px;padding:0 17px;font-weight:950;box-shadow:0 18px 42px rgba(15,23,42,.28);cursor:pointer}#alkamProfessionalDrawer{position:fixed;right:22px;top:86px;bottom:78px;width:min(560px,calc(100vw - 44px));z-index:999998;background:#fff;border:1px solid #dbe4f0;border-radius:20px;box-shadow:0 26px 70px rgba(15,23,42,.26);display:none;overflow:auto;font-family:Arial,Helvetica,sans-serif}#alkamProfessionalDrawer.open{display:block}.alkam-drawer-head{padding:16px 18px;border-bottom:1px solid #dbe4f0;background:#f8fbff;display:flex;justify-content:space-between}.alkam-drawer-title{font-size:18px;font-weight:950;color:#0f172a;margin:0}.alkam-drawer-sub{font-size:12px;font-weight:800;color:#64748b;margin-top:5px}.alkam-drawer-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950}.alkam-drawer-body{padding:14px 18px}.alkam-control-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px;margin-bottom:10px}.alkam-control-card b{display:block;font-size:13px;color:#0f172a;margin-bottom:7px}.alkam-control-card .line{font-size:12px;font-weight:800;color:#334155;line-height:1.55}.alkam-drawer-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.alkam-drawer-actions button{height:32px;border:0;border-radius:10px;background:#1769e8;color:#fff;font-weight:950;padding:0 10px;cursor:pointer}.alkam-drawer-actions button.secondary{background:#e8eef9;color:#0f172a}.alkam-ui-section-label{font-size:11px!important;font-weight:950!important;color:#8aa0bd!important;text-transform:uppercase!important;letter-spacing:.08em!important;margin:12px 10px 6px!important;padding-top:8px!important;border-top:1px solid rgba(255,255,255,.10)!important}@media(max-width:900px){#alkamProfessionalDrawer{left:12px;right:12px;top:70px;bottom:72px;width:auto}.topbar,.top-nav,[class*=topbar],[class*=top-nav]{height:auto!important;min-height:42px!important}}';
    document.head.appendChild(st);
  }
  function m(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function groupSidebar(){
    var side=q('.sidebar')||q('[class*=sidebar]'); if(!side||side.getAttribute('data-alkam-grouped')==='1')return;
    side.setAttribute('data-alkam-grouped','1');
    var buttons=qa('button,a,.nav-btn,.menu-item',side).filter(function(x){return (x.textContent||'').trim().length>1});
    var first=buttons[0];
    function label(txt,before){if(!before||!before.parentNode)return;var d=document.createElement('div');d.className='alkam-ui-section-label';d.textContent=txt;before.parentNode.insertBefore(d,before)}
    var finans=buttons.find(function(b){return /dashboard|cariler|tahakkuk|hesap|finans/i.test(b.textContent||'')});
    var ofis=buttons.find(function(b){return /çalışan|belge|onay|yedekleme/i.test(b.textContent||'')});
    var sistem=buttons.find(function(b){return /otomasyon|düzeltme|ayar|rapor/i.test(b.textContent||'')});
    label('Ön Muhasebe & Finans',finans||first);
    if(ofis)label('Ofis Operasyonları',ofis);
    if(sistem)label('Sistem & Kontrol',sistem);
  }
  function compactTopNav(){
    var top=q('.topbar')||q('.top-nav')||q('[class*=topbar]')||q('[class*=top-nav]');
    if(!top||top.getAttribute('data-alkam-top-compact')==='1')return;
    top.setAttribute('data-alkam-top-compact','1');
    var items=qa('button,a',top);
    items.forEach(function(x){
      var t=(x.textContent||'').trim();
      if(/stok|fatura|çek|senet|muhasebe|araçlar|ayarlar|otomasyon/i.test(t))x.style.opacity='.55';
    });
  }
  function render(){
    var d=q('#alkamProfessionalDrawer'); if(!d)return;
    var core=window.__ALKAM_CARI_CORE_LAST_SUMMARY||{};
    var dq=(window.ALKAM_DATA_QUALITY&&window.ALKAM_DATA_QUALITY.last&&window.ALKAM_DATA_QUALITY.last())||{};
    var th=(window.ALKAM_TAHAKKUK_V5&&window.ALKAM_TAHAKKUK_V5.test&&window.ALKAM_TAHAKKUK_V5.test())||{};
    var rel=(window.ALKAM_RELIABILITY_GUARD&&window.ALKAM_RELIABILITY_GUARD.status&&window.ALKAM_RELIABILITY_GUARD.status())||{};
    d.innerHTML='<div class="alkam-drawer-head"><div><h3 class="alkam-drawer-title">Kontrol Merkezi</h3><div class="alkam-drawer-sub">Güvenilirlik, kalite ve tahakkuk kontrolleri tek yerde.</div></div><button class="alkam-drawer-close" type="button">×</button></div><div class="alkam-drawer-body"><div class="alkam-control-card"><b>Ekstre Kontrolü</b><div class="line">Borç: '+m(core.borc)+' · Alacak: '+m(core.alacak)+' · Net: '+m(core.balance)+'</div><div class="line">Hareket: '+(core.count||0)+' · Kaynak eksik: '+(core.missing||0)+'</div></div><div class="alkam-control-card"><b>Veri Tutarlılık</b><div class="line">Durum: '+(dq.status||'bekliyor')+' · Uyarı: '+((dq.warnings||[]).length||0)+' · Hata: '+((dq.errors||[]).length||0)+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_DATA_QUALITY&&ALKAM_DATA_QUALITY.run()">Şimdi Kontrol Et</button></div></div><div class="alkam-control-card"><b>Tahakkuk</b><div class="line">Cari: '+(th.cariler||0)+' · Dönem: '+(th.period||'-')+' · Kayıt: '+(th.tahakkuk||0)+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_TAHAKKUK_V5&&ALKAM_TAHAKKUK_V5.previewBulk&&ALKAM_TAHAKKUK_V5.previewBulk()">Toplu Önizle</button><button class="secondary" onclick="window.ALKAM_TAHAKKUK_CONTROL_V5C&&ALKAM_TAHAKKUK_CONTROL_V5C.test&&ALKAM_TAHAKKUK_CONTROL_V5C.test()">Tahakkuk Kontrol</button></div></div><div class="alkam-control-card"><b>Güvenilirlik Yedeği</b><div class="line">Yedek: '+(rel.backupCount||0)+' · Son yedek: '+((rel.lastBackup&&rel.lastBackup.time)||'-')+'</div><div class="alkam-drawer-actions"><button onclick="window.ALKAM_RELIABILITY_GUARD&&ALKAM_RELIABILITY_GUARD.snapshot&&ALKAM_RELIABILITY_GUARD.snapshot(\'manuel kontrol merkezi\')">Manuel Yedek Al</button></div></div></div>';
    var close=q('.alkam-drawer-close',d); if(close)close.onclick=function(){d.classList.remove('open')};
  }
  function run(){
    css(); document.body.classList.add('alkam-ux-compact'); groupSidebar(); compactTopNav();
    if(!q('#alkamProfessionalControlButton')){var b=document.createElement('button');b.id='alkamProfessionalControlButton';b.type='button';b.textContent='Kontrol Merkezi';b.onclick=function(){q('#alkamProfessionalDrawer').classList.toggle('open');render()};document.body.appendChild(b)}
    if(!q('#alkamProfessionalDrawer')){var d=document.createElement('div');d.id='alkamProfessionalDrawer';document.body.appendChild(d)}
    render();
  }
  window.ALKAM_PROFESSIONAL_UI_V1={version:VERSION,run:run,open:function(){run();q('#alkamProfessionalDrawer').classList.add('open');render()},test:function(){return {version:VERSION,button:!!q('#alkamProfessionalControlButton'),drawer:!!q('#alkamProfessionalDrawer'),compact:document.body.classList.contains('alkam-ux-compact'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(function(){groupSidebar();compactTopNav();render()},4000);
})();
