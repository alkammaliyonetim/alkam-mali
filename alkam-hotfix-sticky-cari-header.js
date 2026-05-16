// ALKAM Mali - Cari detay icin guncel sabit bilgi seridi
(function(){
  'use strict';
  if(window.__ALKAM_STICKY_CARI_HEADER_V2__) return;
  window.__ALKAM_STICKY_CARI_HEADER_V2__ = true;

  function txt(el){ return el ? String(el.textContent || '').replace(/\s+/g,' ').trim() : ''; }
  function panel(){ return document.querySelector('.cari-detail-scroll') || document.getElementById('selectedCariDetail'); }
  function activeName(){
    var names=[].slice.call(document.querySelectorAll('.hero-name'));
    for(var i=names.length-1;i>=0;i--){
      var t=txt(names[i]);
      if(t) return t;
    }
    return '';
  }
  function activeSub(){
    var subs=[].slice.call(document.querySelectorAll('.hero-sub'));
    for(var i=subs.length-1;i>=0;i--){
      var t=txt(subs[i]);
      if(t) return t;
    }
    return '';
  }
  function summaryText(){
    var p=panel(); if(!p) return '';
    var cards=[].slice.call(p.querySelectorAll('.summary-cards .card,.hero-cards .card,.summary-card'));
    var out=[];
    cards.slice(0,4).forEach(function(c){ var t=txt(c); if(t) out.push(t); });
    return out.join('  |  ');
  }
  function cleanOld(){
    document.querySelectorAll('.alkam-sticky-cari-head').forEach(function(x){ x.remove(); });
  }
  function css(){
    if(document.getElementById('alkamStickyCariHeaderCssV2')) return;
    var s=document.createElement('style');
    s.id='alkamStickyCariHeaderCssV2';
    s.textContent=[
      '.cari-detail-scroll{position:relative}',
      '#alkamCurrentCariStrip{position:sticky;top:0;z-index:45;background:rgba(248,251,255,.98);backdrop-filter:blur(6px);border:1px solid #dbeafe;border-radius:14px;padding:10px 12px;margin:0 0 10px;box-shadow:0 8px 18px rgba(15,23,42,.07)}',
      '#alkamCurrentCariStrip .acsName{font-size:18px;font-weight:950;color:#0f172a;line-height:1.2}',
      '#alkamCurrentCariStrip .acsSub{font-size:12px;font-weight:850;color:#475569;margin-top:3px}',
      '#alkamCurrentCariStrip .acsSum{font-size:12px;font-weight:950;color:#1d4ed8;margin-top:6px;white-space:normal}',
      '@media(max-width:900px){#alkamCurrentCariStrip{top:0;border-radius:12px;padding:8px;box-shadow:none}#alkamCurrentCariStrip .acsName{font-size:16px}}'
    ].join('');
    document.head.appendChild(s);
  }
  function render(){
    cleanOld();
    css();
    var p=panel(); if(!p) return;
    var name=activeName(); if(!name) return;
    var strip=document.getElementById('alkamCurrentCariStrip');
    if(!strip){
      strip=document.createElement('div');
      strip.id='alkamCurrentCariStrip';
      p.insertBefore(strip,p.firstChild);
    }
    var sub=activeSub();
    var sum=summaryText();
    strip.innerHTML='<div class="acsName"></div><div class="acsSub"></div><div class="acsSum"></div>';
    strip.querySelector('.acsName').textContent=name;
    strip.querySelector('.acsSub').textContent=sub;
    strip.querySelector('.acsSum').textContent=sum;
  }
  function boot(){ setTimeout(render,120); setTimeout(render,450); setTimeout(render,900); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  document.addEventListener('click',boot);
  var root=document.getElementById('tab-cariler') || document.body;
  if(root && window.MutationObserver){
    var timer=null;
    new MutationObserver(function(){ clearTimeout(timer); timer=setTimeout(render,250); }).observe(root,{childList:true,subtree:true,characterData:true});
  }
})();