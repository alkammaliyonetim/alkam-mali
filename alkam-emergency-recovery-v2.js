(function(){
  'use strict';
  if(window.__ALKAM_EMERGENCY_RECOVERY_V2_BOOTED) return;
  window.__ALKAM_EMERGENCY_RECOVERY_V2_BOOTED = true;
  var VERSION = 'ALKAM Emergency Recovery v2.3';
  function q(sel, root){ return (root || document).querySelector(sel); }
  function qa(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function css(){
    if(q('#alkam-emergency-recovery-v2-style')) return;
    var st = document.createElement('style');
    st.id = 'alkam-emergency-recovery-v2-style';
    st.textContent = [
      ':root{--alkam-sidebar-w:232px!important;--alkam-nav-width:232px!important;--alkam-content-pad:18px!important}',
      'html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important;background:#f4f7fb!important}',
      'body{min-width:0!important}',
      '.layout{display:grid!important;grid-template-columns:232px minmax(0,1fr)!important;width:100%!important;max-width:100%!important;min-height:100vh!important;overflow-x:hidden!important}',
      '.sidebar{position:sticky!important;top:0!important;width:232px!important;min-width:232px!important;max-width:232px!important;height:100vh!important;padding:16px 14px!important;overflow-y:auto!important;overflow-x:hidden!important;box-sizing:border-box!important}',
      '.sidebar *{max-width:100%!important;box-sizing:border-box!important}',
      '.brand-title{font-size:18px!important;line-height:1.12!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important}',
      '.brand-sub{font-size:11px!important;line-height:1.35!important;white-space:normal!important;overflow:visible!important}',
      '.nav{gap:8px!important}.nav-btn,.sidebar button,.sidebar a{width:100%!important;min-height:42px!important;height:auto!important;padding:10px 12px!important;border-radius:12px!important;font-size:13px!important;line-height:1.18!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;justify-content:flex-start!important}',
      '.nav-ico{flex:0 0 18px!important;width:18px!important;min-width:18px!important}',
      '.sidebar-box{width:100%!important;margin-top:12px!important;padding:11px!important;overflow:hidden!important}.sidebar-box .big{font-size:12px!important;line-height:1.35!important;word-break:normal!important;overflow-wrap:anywhere!important}',
      '.main{min-width:0!important;width:100%!important;max-width:calc(100vw - 232px)!important;margin:0!important;padding:0 18px 88px!important;overflow-x:hidden!important;box-sizing:border-box!important}',
      '.erp-modulebar{margin:0 -18px 14px!important;padding:0 18px!important;height:54px!important;min-height:54px!important;overflow-x:auto!important;overflow-y:hidden!important;position:sticky!important;top:0!important;z-index:70!important}',
      '.topbar{align-items:center!important;margin:0 0 12px!important;gap:10px!important}.page-head h1{font-size:28px!important;line-height:1.08!important}.page-head p{font-size:12px!important;margin-top:6px!important}',
      '.topbar-right{gap:8px!important}.version-badge,.logout-btn{height:34px!important;min-height:34px!important;border-radius:8px!important;padding:0 12px!important}',
      '.cards{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;margin-bottom:14px!important}.card{min-width:0!important;padding:14px!important;border-radius:10px!important}.card-value{font-size:24px!important;line-height:1.1!important;white-space:normal!important;overflow-wrap:anywhere!important}',
      '.grid-2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:14px!important}.grid-3,.grid-4,.form-grid,.form-grid-3{gap:12px!important}.section{min-width:0!important;width:100%!important;max-width:100%!important;margin:0 0 14px!important;padding:16px!important;border-radius:12px!important;overflow:hidden!important}.section-title{font-size:22px!important;line-height:1.2!important}',
      '#tab-cariler>.grid-2{grid-template-columns:minmax(320px,380px) minmax(0,1fr)!important;gap:14px!important;align-items:start!important;height:calc(100vh - 86px)!important;min-height:0!important}',
      '#tab-cariler .section:first-child{position:sticky!important;top:68px!important;height:calc(100vh - 86px)!important;display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}',
      '#tab-cariler .detail-sticky{position:sticky!important;top:68px!important;height:calc(100vh - 86px)!important;display:flex!important;flex-direction:column!important;min-height:0!important;overflow:hidden!important}',
      '#tab-cariler .section:first-child .toolbar{flex:0 0 auto!important}',
      '#cariSummaryWrap{flex:0 0 auto!important;max-height:300px!important;overflow-y:auto!important;overflow-x:hidden!important;margin-bottom:10px!important;padding-right:4px!important;scrollbar-gutter:stable!important}',
      '#cariSummaryWrap .cari-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}',
      '@media(max-height:820px){#cariSummaryWrap{max-height:250px!important}#tab-cariler .section:first-child,#tab-cariler .detail-sticky,#tab-cariler>.grid-2{height:calc(100vh - 76px)!important}}',
      '#cariList,.cari-list-scroll{flex:1 1 auto!important;min-height:180px!important;max-height:none!important;height:auto!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:6px!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important}',
      '#cariList .list-item{min-height:auto!important}',
      '.cari-detail-scroll{flex:1 1 auto!important;min-height:0!important;height:auto!important;max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:8px!important;overscroll-behavior:contain!important;scrollbar-gutter:stable!important}',
      '.cari-detail-scroll::-webkit-scrollbar,.cari-list-scroll::-webkit-scrollbar,#cariList::-webkit-scrollbar,#cariSummaryWrap::-webkit-scrollbar{width:10px;height:10px}',
      '.cari-detail-scroll::-webkit-scrollbar-thumb,.cari-list-scroll::-webkit-scrollbar-thumb,#cariList::-webkit-scrollbar-thumb,#cariSummaryWrap::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:999px}',
      '.cari-detail-scroll::-webkit-scrollbar-track,.cari-list-scroll::-webkit-scrollbar-track,#cariList::-webkit-scrollbar-track,#cariSummaryWrap::-webkit-scrollbar-track{background:#eaf0f8;border-radius:999px}',
      '#selectedCariDetail .grid-4{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))!important;gap:10px!important}#selectedCariDetail .metric-mini{min-height:76px!important}',
      '.statement-shell,.statement-scroll,#selectedCariDetail .statement-scroll{width:100%!important;max-width:100%!important;overflow-x:auto!important}.statement-table,.source-statement,#selectedCariDetail table.source-statement{min-width:980px!important}',
      '#selectedCariDetail{display:block!important;min-width:0!important;max-width:100%!important;overflow:visible!important}',
      '#selectedCariDetail>.alkam-cari-toolbar{display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin:0 0 12px!important}',
      '#selectedCariDetail>.hero-name,#selectedCariDetail>.hero-sub{max-width:100%!important;text-align:left!important;margin-left:0!important}',
      '#selectedCariDetail>.grid-4{display:grid!important;width:100%!important;clear:both!important;margin:12px 0!important}',
      '#selectedCariDetail>.rule-box{clear:both!important;margin:12px 0!important}',
      '#selectedCariDetail>div[style*="overflow:auto"],#selectedCariDetail>.statement-shell{clear:both!important;display:block!important;width:100%!important;margin-top:12px!important;position:relative!important;z-index:1!important}',
      '#selectedCariDetail table{position:relative!important;z-index:1!important}',
      '#statementPrecheckModal{z-index:999999!important}',
      '#statementPrecheckModal[style*="display: flex"],#statementPrecheckModal[style*="display:flex"]{display:flex!important}',
      '#statementPrecheckModal:not([style*="display: flex"]):not([style*="display:flex"]){pointer-events:none!important}',
      'table{max-width:100%!important}th,td{overflow-wrap:anywhere!important}',
      '#alkamBusinessAuditPanel{right:18px!important;bottom:18px!important;width:330px!important;max-width:calc(100vw - 36px)!important;z-index:60!important;border-radius:14px!important}',
      '#alkamBusinessAuditPanel:not(.force-open) .audit-body{display:none!important}#alkamBusinessAuditPanel .audit-head{padding:10px 12px!important}#alkamBusinessAuditPanel .audit-title{font-size:13px!important}',
      '#alkamCariCoreBanner{position:static!important;display:block!important;float:none!important;clear:both!important;width:min(430px,calc(100% - 36px))!important;max-width:430px!important;margin:10px 18px 14px auto!important;z-index:1!important;box-shadow:0 8px 22px rgba(15,23,42,.08)!important;pointer-events:none!important}',
      '#alkamCariCoreBanner .alkam-cari-core-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}',
      '.control-center-floating,.floating-control-center,#controlCenterFloating,#alkamAutomationControlBtn{right:18px!important;bottom:74px!important;z-index:55!important}',
      '#alkamAutomationControlPanel{right:18px!important;bottom:126px!important;z-index:56!important;max-width:calc(100vw - 36px)!important}',
      '.toast{right:18px!important;bottom:18px!important;z-index:999999!important}',
      '.empty{min-height:54px!important;display:flex!important;align-items:center!important;justify-content:center!important}',
      '@media(max-width:1366px){:root{--alkam-sidebar-w:220px!important;--alkam-nav-width:220px!important}.layout{grid-template-columns:220px minmax(0,1fr)!important}.sidebar{width:220px!important;min-width:220px!important;max-width:220px!important;padding:14px 12px!important}.main{max-width:calc(100vw - 220px)!important;padding-left:14px!important;padding-right:14px!important}.erp-modulebar{margin-left:-14px!important;margin-right:-14px!important;padding-left:14px!important;padding-right:14px!important}.cards{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}.card{padding:12px!important}.card-value{font-size:22px!important}.section{padding:14px!important}.grid-2{grid-template-columns:1fr!important}#tab-cariler>.grid-2{grid-template-columns:minmax(300px,350px) minmax(0,1fr)!important}}',
      '@media(max-width:980px){.layout{grid-template-columns:1fr!important}.sidebar{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;display:block!important}.main{max-width:100vw!important;padding:0 12px 92px!important}.erp-modulebar{margin:0 -12px 12px!important;padding:0 12px!important}.cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.grid-2,#tab-cariler>.grid-2{grid-template-columns:1fr!important;height:auto!important}#tab-cariler .section:first-child,#tab-cariler .detail-sticky{position:relative!important;top:0!important;height:auto!important;max-height:none!important}.cari-list-scroll,.cari-detail-scroll{max-height:none!important;overflow:visible!important}#alkamBusinessAuditPanel{left:12px!important;right:12px!important;width:auto!important;bottom:12px!important}}',
      '@media(max-width:640px){.cards,.grid-3,.grid-4,.form-grid,.form-grid-3{grid-template-columns:1fr!important}.page-head h1{font-size:24px!important}.section-title{font-size:19px!important}.topbar{display:block!important}.topbar-right{margin-top:10px!important;justify-content:flex-start!important}.statement-table,.source-statement,#selectedCariDetail table.source-statement{min-width:820px!important}}'
    ].join('\n');
    document.head.appendChild(st);
  }
  function unstickLoading(){
    var map = [
      ['opsHealthWrap', 'Uretim kontrol raporu hazirlanamadi. Sayfayi yenileyin veya baglanti durumunu kontrol edin.'],
      ['prodHardeningWrap', 'Uretim sikilastirma raporu hazirlanamadi. Sayfayi yenileyin veya baglanti durumunu kontrol edin.'],
      ['globalAuditWrap', 'Islem izi henuz hazir degil. Yeni islem yapildiginda burada gorunecek.'],
      ['deleteArchiveWrap', 'Silme arsivi henuz hazir degil.']
    ];
    map.forEach(function(item){
      var el = q('#' + item[0]);
      if(!el) return;
      var txt = String(el.textContent || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR');
      if(!txt || txt.indexOf('yükleniyor') > -1 || txt.indexOf('yukleniyor') > -1){
        el.innerHTML = '<div class="empty">' + item[1] + '</div>';
      }
    });
  }
  function tameFloating(){
    var p = q('#alkamBusinessAuditPanel');
    if(p && !p.dataset.recoveryMinimized){
      p.classList.add('minimized');
      p.dataset.recoveryMinimized = '1';
      var b = q('#businessAuditMin', p);
      if(b) b.textContent = 'Ac';
      p.addEventListener('dblclick', function(){ p.classList.toggle('force-open'); }, false);
    }
  }
  function normalize(){
    css();
    document.body.classList.add('alkam-recovery-v2');
    tameFloating();
    setTimeout(unstickLoading, 600);
    setTimeout(tameFloating, 800);
    window.__ALKAM_EMERGENCY_RECOVERY_V2_LAST = {version:VERSION, time:new Date().toISOString()};
    return window.__ALKAM_EMERGENCY_RECOVERY_V2_LAST;
  }
  function layoutOnly(){
    css();
    if(document.body) document.body.classList.add('alkam-recovery-v2');
    tameFloating();
  }
  function boot(){
    normalize();
    setTimeout(layoutOnly, 500);
    setTimeout(layoutOnly, 1600);
    setTimeout(unstickLoading, 3600);
    document.addEventListener('click', function(){ setTimeout(layoutOnly, 180); }, true);
    document.addEventListener('input', function(){ setTimeout(layoutOnly, 180); }, true);
    try{ new MutationObserver(function(){ clearTimeout(window.__alkamRecoveryV2Timer); window.__alkamRecoveryV2Timer = setTimeout(layoutOnly, 220); }).observe(document.body, {childList:true, subtree:true}); }catch(e){}
  }
  window.ALKAM_EMERGENCY_RECOVERY_V2 = {version:VERSION, run:normalize, test:normalize, last:function(){return window.__ALKAM_EMERGENCY_RECOVERY_V2_LAST || normalize();}};
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
