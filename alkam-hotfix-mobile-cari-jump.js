// ALKAM Mali - Mobil Cari Secince Detaya Kaydir
// Mobilde cari kartina tiklandiginda kullaniciyi secili cari detayina otomatik indirir.
(function(){
  'use strict';
  if(window.__ALKAM_MOBILE_CARI_JUMP_V1__) return;
  window.__ALKAM_MOBILE_CARI_JUMP_V1__ = true;

  function isMobileWidth(){
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  }

  function findDetailTarget(){
    return document.getElementById('selectedCariDetail') || document.querySelector('.cari-detail-scroll');
  }

  function scrollToDetail(){
    if(!isMobileWidth()) return;
    var target = findDetailTarget();
    if(!target) return;
    setTimeout(function(){
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch(e) {
        target.scrollIntoView(true);
      }
    }, 220);
  }

  function markClickArea(){
    var list = document.getElementById('cariList');
    if(!list || list.dataset.alkamMobileJumpBound === '1') return;
    list.dataset.alkamMobileJumpBound = '1';
    list.addEventListener('click', function(e){
      var item = e.target && e.target.closest ? e.target.closest('.list-item') : null;
      if(!item) return;
      scrollToDetail();
    }, true);
  }

  function addBackButton(){
    if(document.getElementById('alkamBackToCariListBtn')) return;
    var detail = findDetailTarget();
    var list = document.getElementById('cariList');
    if(!detail || !list) return;
    var btn = document.createElement('button');
    btn.id = 'alkamBackToCariListBtn';
    btn.type = 'button';
    btn.textContent = '← Cari listesine dön';
    btn.style.cssText = 'display:none;margin:0 0 10px 0;border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:950;width:100%';
    btn.addEventListener('click', function(){
      var section = document.querySelector('#tab-cariler .section') || list;
      try { section.scrollIntoView({ behavior:'smooth', block:'start' }); }
      catch(e) { section.scrollIntoView(true); }
    });
    var wrap = detail.closest('.cari-detail-scroll,.section,#selectedCariDetail') || detail;
    wrap.insertBefore(btn, wrap.firstChild);
  }

  function updateMobileButton(){
    var btn = document.getElementById('alkamBackToCariListBtn');
    if(btn) btn.style.display = isMobileWidth() ? 'block' : 'none';
  }

  function run(){
    markClickArea();
    addBackButton();
    updateMobileButton();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', updateMobileButton);
  var observerTarget = document.getElementById('tab-cariler') || document.body;
  if(observerTarget && window.MutationObserver){
    new MutationObserver(function(){ run(); }).observe(observerTarget, { childList:true, subtree:true });
  }
  var tries = 0;
  var boot = setInterval(function(){ run(); tries += 1; if(tries >= 40) clearInterval(boot); }, 500);
})();
