// ALKAM Mali - Cari detay ust bilgisini hareket kaydirmada sabit tut
(function(){
  'use strict';
  if(window.__ALKAM_STICKY_CARI_HEADER_V1__) return;
  window.__ALKAM_STICKY_CARI_HEADER_V1__ = true;

  function css(){
    if(document.getElementById('alkamStickyCariHeaderCss')) return;
    var s=document.createElement('style');
    s.id='alkamStickyCariHeaderCss';
    s.textContent = [
      '.cari-detail-scroll{position:relative}',
      '.alkam-sticky-cari-head{position:sticky;top:0;z-index:40;background:rgba(248,251,255,.98);backdrop-filter:blur(6px);border:1px solid #dbeafe;border-radius:16px;padding:10px 10px 12px;margin:0 0 10px;box-shadow:0 8px 20px rgba(15,23,42,.07)}',
      '.alkam-sticky-cari-head .summary-cards,.alkam-sticky-cari-head .hero-cards{margin-bottom:0}',
      '.alkam-sticky-cari-head .hero-name{margin-top:4px}',
      '@media(max-width:900px){.alkam-sticky-cari-head{top:0;border-radius:12px;padding:8px;box-shadow:none}.alkam-sticky-cari-head .hero-name{font-size:18px!important}}'
    ].join('');
    document.head.appendChild(s);
  }

  function findPanel(){
    return document.querySelector('.cari-detail-scroll') || document.getElementById('selectedCariDetail');
  }

  function moveIntoSticky(panel){
    if(!panel) return;
    var sticky = panel.querySelector('.alkam-sticky-cari-head');
    if(!sticky){
      sticky=document.createElement('div');
      sticky.className='alkam-sticky-cari-head';
      panel.insertBefore(sticky,panel.firstChild);
    }

    var selectors=['.hero-name','.hero-sub','.hero-actions','.summary-cards','.hero-cards','.legend'];
    selectors.forEach(function(sel){
      var el=panel.querySelector(sel);
      if(el && !sticky.contains(el)) sticky.appendChild(el);
    });

    var buttons=[];
    panel.querySelectorAll('button').forEach(function(b){
      var t=(b.textContent||'').trim();
      if(['Hareket Ekle','Cariyi Düzenle','Cariyi Sil','Yazdır','Excel'].indexOf(t)>=0) buttons.push(b);
    });
    if(buttons.length && !sticky.querySelector('.alkam-sticky-actions')){
      var wrap=document.createElement('div');
      wrap.className='alkam-sticky-actions';
      wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px';
      buttons.forEach(function(b){wrap.appendChild(b)});
      sticky.insertBefore(wrap,sticky.firstChild);
    }
  }

  function run(){
    css();
    var panel=findPanel();
    if(panel) moveIntoSticky(panel);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  document.addEventListener('click',function(){setTimeout(run,250)});
  var root=document.getElementById('tab-cariler') || document.body;
  if(root && window.MutationObserver){
    var timer=null;
    new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(run,180)}).observe(root,{childList:true,subtree:true});
  }
  setTimeout(run,800);
  setTimeout(run,1600);
})();