(function(){
  'use strict';
  var VERSION='ALKAM Cari Self Test v1';

  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}

  function visible(el){
    if(!el) return false;
    var st=getComputedStyle(el);
    var r=el.getBoundingClientRect();
    return st.display!=='none' && st.visibility!=='hidden' && r.width>0 && r.height>0;
  }

  function test(){
    var detail=q('#selectedCariDetail');
    var cariTab=q('#tab-cariler');
    var tables=detail?qa('table',detail):[];
    var text=detail?(detail.textContent||''):'';
    var result={
      version:VERSION,
      time:new Date().toISOString(),
      cariTabFound:!!cariTab,
      selectedCariDetailFound:!!detail,
      selectedCariDetailVisible:visible(detail),
      tableCount:tables.length,
      hasBakiye:/Bakiye|Borc|Borç|Alacak/i.test(text),
      hasHistory:/Kaynak|Tahakkuk|Tahsilat|Islem|İşlem|Hareket|Ekstre/i.test(text),
      hasCariCore:!!window.ALKAM_CARI_CORE_V4,
      hasLayoutFix:!!window.ALKAM_V12_WIDE_LAYOUT_FIX_V1
    };
    result.ok=result.cariTabFound && result.selectedCariDetailFound && result.selectedCariDetailVisible && result.tableCount>0 && result.hasBakiye && result.hasHistory;
    window.__ALKAM_CARI_SELF_TEST_LAST=result;
    return result;
  }

  function badge(){
    var r=test();
    var el=document.getElementById('alkamCariSelfTestBadge');
    if(!el){
      el=document.createElement('div');
      el.id='alkamCariSelfTestBadge';
      document.body.appendChild(el);
    }
    el.style.cssText='position:fixed;right:16px;bottom:16px;z-index:999999;padding:12px 14px;border-radius:14px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:900;box-shadow:0 16px 38px rgba(15,23,42,.20);border:1px solid '+(r.ok?'#86efac':'#fecaca')+';background:'+(r.ok?'#f0fdf4':'#fef2f2')+';color:'+(r.ok?'#166534':'#991b1b')+';max-width:420px;line-height:1.45';
    el.innerHTML=(r.ok?'CARİ GEÇMİŞİ: ÇALIŞIYOR':'CARİ GEÇMİŞİ: KONTROL GEREKİYOR')+'<br><span style="font-weight:700">Detay: '+r.selectedCariDetailFound+' · Görünür: '+r.selectedCariDetailVisible+' · Tablo: '+r.tableCount+' · Core: '+r.hasCariCore+' · Layout: '+r.hasLayoutFix+'</span>';
  }

  function run(){badge()}
  window.ALKAM_CARI_SELF_TEST_V1={version:VERSION,test:test,run:run,last:function(){return window.__ALKAM_CARI_SELF_TEST_LAST||test()}};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  document.addEventListener('click',function(){setTimeout(run,500)},true);
  setInterval(run,4000);
})();
