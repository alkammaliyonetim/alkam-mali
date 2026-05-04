(function(){
  'use strict';
  var VERSION='ALKAM Professional UI v1.0';
  function q(s){return document.querySelector(s)}
  function css(){
    if(q('#alkam-professional-ui-style'))return;
    var st=document.createElement('style');
    st.id='alkam-professional-ui-style';
    st.textContent='body{background:#f4f7fb!important}#alkamCariCoreBanner,#alkamDataQualityPanel,#alkamTahakkukPanel,#alkamTahakkukControlPanel{display:none!important}.card,.metric-mini,[class*=card]{box-shadow:0 8px 24px rgba(15,23,42,.04)!important;border-color:#dbe4f0!important}#alkamProfessionalControlButton{position:fixed;right:22px;bottom:22px;z-index:999999;border:0;border-radius:999px;background:#071f49;color:#fff;height:46px;padding:0 17px;font-weight:950;box-shadow:0 18px 42px rgba(15,23,42,.28);cursor:pointer}#alkamProfessionalDrawer{position:fixed;right:22px;top:86px;bottom:78px;width:min(520px,calc(100vw - 44px));z-index:999998;background:#fff;border:1px solid #dbe4f0;border-radius:20px;box-shadow:0 26px 70px rgba(15,23,42,.26);display:none;overflow:auto;font-family:Arial,Helvetica,sans-serif}#alkamProfessionalDrawer.open{display:block}.alkam-drawer-head{padding:16px 18px;border-bottom:1px solid #dbe4f0;background:#f8fbff;display:flex;justify-content:space-between}.alkam-drawer-title{font-size:18px;font-weight:950;color:#0f172a;margin:0}.alkam-drawer-sub{font-size:12px;font-weight:800;color:#64748b;margin-top:5px}.alkam-drawer-close{width:34px;height:34px;border:0;border-radius:10px;background:#e8eef9;font-weight:950}.alkam-drawer-body{padding:14px 18px}.alkam-control-card{border:1px solid #e2e8f0;background:#fbfdff;border-radius:14px;padding:12px;margin-bottom:10px}.alkam-control-card b{display:block;font-size:13px;color:#0f172a;margin-bottom:7px}.alkam-control-card .line{font-size:12px;font-weight:800;color:#334155;line-height:1.55}';
    document.head.appendChild(st);
  }
  function m(n){return new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(Number(n||0)))+' TL'}
  function render(){
    var d=q('#alkamProfessionalDrawer'); if(!d)return;
    var core=window.__ALKAM_CARI_CORE_LAST_SUMMARY||{};
    var dq=(window.ALKAM_DATA_QUALITY&&window.ALKAM_DATA_QUALITY.last&&window.ALKAM_DATA_QUALITY.last())||{};
    var th=(window.ALKAM_TAHAKKUK_V5&&window.ALKAM_TAHAKKUK_V5.test&&window.ALKAM_TAHAKKUK_V5.test())||{};
    d.innerHTML='<div class="alkam-drawer-head"><div><h3 class="alkam-drawer-title">Kontrol Merkezi</h3><div class="alkam-drawer-sub">Teknik kontroller tek yerde toplandı.</div></div><button class="alkam-drawer-close" type="button">×</button></div><div class="alkam-drawer-body"><div class="alkam-control-card"><b>Ekstre Kontrolü</b><div class="line">Borç: '+m(core.borc)+' · Alacak: '+m(core.alacak)+' · Net: '+m(core.balance)+'</div><div class="line">Hareket: '+(core.count||0)+' · Kaynak eksik: '+(core.missing||0)+'</div></div><div class="alkam-control-card"><b>Veri Tutarlılık</b><div class="line">Durum: '+(dq.status||'bekliyor')+' · Uyarı: '+((dq.warnings||[]).length||0)+' · Hata: '+((dq.errors||[]).length||0)+'</div></div><div class="alkam-control-card"><b>Tahakkuk</b><div class="line">Cari: '+(th.cariler||0)+' · Dönem: '+(th.period||'-')+' · Kayıt: '+(th.tahakkuk||0)+'</div></div></div>';
    var close=q('.alkam-drawer-close'); if(close)close.onclick=function(){d.classList.remove('open')};
  }
  function run(){
    css();
    if(!q('#alkamProfessionalControlButton')){var b=document.createElement('button');b.id='alkamProfessionalControlButton';b.type='button';b.textContent='Kontrol Merkezi';b.onclick=function(){q('#alkamProfessionalDrawer').classList.toggle('open');render()};document.body.appendChild(b)}
    if(!q('#alkamProfessionalDrawer')){var d=document.createElement('div');d.id='alkamProfessionalDrawer';document.body.appendChild(d)}
    render();
  }
  window.ALKAM_PROFESSIONAL_UI_V1={version:VERSION,run:run,open:function(){run();q('#alkamProfessionalDrawer').classList.add('open');render()},test:function(){return {version:VERSION,button:!!q('#alkamProfessionalControlButton'),drawer:!!q('#alkamProfessionalDrawer'),time:new Date().toISOString()}}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(render,4000);
})();
