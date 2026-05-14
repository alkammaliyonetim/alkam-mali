// ALKAM Mali - Mobil Cari Secince Detaya Kaydir + Mini Gezinme
// Mobilde cari kartina tiklandiginda kullaniciyi secili cari detayina otomatik indirir.
(function(){
  'use strict';
  if(window.__ALKAM_MOBILE_CARI_JUMP_V2__) return;
  window.__ALKAM_MOBILE_CARI_JUMP_V2__ = true;

  function isMobileWidth(){ return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }
  function findDetailTarget(){ return document.getElementById('selectedCariDetail') || document.querySelector('.cari-detail-scroll'); }
  function findDetailWrap(){ var detail=findDetailTarget(); return detail ? (detail.closest('.cari-detail-scroll,.section,#selectedCariDetail') || detail) : null; }
  function findFirstTable(){ var wrap=findDetailWrap() || document; return wrap.querySelector('table.source-statement, table'); }

  function scrollToEl(el){
    if(!el) return;
    try { el.scrollIntoView({ behavior:'smooth', block:'start' }); }
    catch(e) { el.scrollIntoView(true); }
  }

  function scrollToDetail(){
    if(!isMobileWidth()) return;
    var target = findDetailTarget();
    if(!target) return;
    setTimeout(function(){ scrollToEl(target); }, 220);
  }

  function scrollToList(){
    var list = document.getElementById('cariList');
    var section = list ? (list.closest('.section') || list) : document.querySelector('#tab-cariler .section');
    scrollToEl(section);
  }

  function scrollToMovements(){
    var filter = document.getElementById('alkamPeriodFilterBar');
    var table = findFirstTable();
    scrollToEl(filter || table || findDetailTarget());
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

  function ensureStyle(){
    if(document.getElementById('alkamMobileCariJumpStyle')) return;
    var st=document.createElement('style');
    st.id='alkamMobileCariJumpStyle';
    st.textContent = '#alkamMobileCariNav{display:none;gap:8px;margin:0 0 10px 0;position:sticky;top:0;z-index:50;background:rgba(248,251,255,.96);backdrop-filter:blur(6px);border:1px solid #dbeafe;border-radius:12px;padding:8px;box-shadow:0 8px 20px rgba(15,23,42,.06)}' +
      '#alkamMobileCariNav button{border:0;border-radius:10px;min-height:38px;padding:8px 10px;font-size:12px;font-weight:950;flex:1}' +
      '#alkamMobileCariNav .list{background:#eff6ff;color:#1d4ed8}' +
      '#alkamMobileCariNav .move{background:#1769e8;color:white}' +
      '@media(max-width:900px){#alkamMobileCariNav{display:flex}}';
    document.head.appendChild(st);
  }

  function addMobileNav(){
    ensureStyle();
    if(document.getElementById('alkamMobileCariNav')) return;
    var wrap = findDetailWrap();
    if(!wrap) return;
    var nav = document.createElement('div');
    nav.id = 'alkamMobileCariNav';
    nav.innerHTML = '<button type="button" class="list">← Cari listesi</button><button type="button" class="move">Hareketlere git ↓</button>';
    nav.querySelector('.list').addEventListener('click', scrollToList);
    nav.querySelector('.move').addEventListener('click', scrollToMovements);
    wrap.insertBefore(nav, wrap.firstChild);
  }

  function updateMobileButton(){
    var nav = document.getElementById('alkamMobileCariNav');
    if(nav) nav.style.display = isMobileWidth() ? 'flex' : 'none';
  }

  function run(){ markClickArea(); addMobileNav(); updateMobileButton(); }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', updateMobileButton);
  var observerTarget = document.getElementById('tab-cariler') || document.body;
  if(observerTarget && window.MutationObserver){ new MutationObserver(function(){ run(); }).observe(observerTarget, { childList:true, subtree:true }); }
  var tries = 0;
  var boot = setInterval(function(){ run(); tries += 1; if(tries >= 40) clearInterval(boot); }, 500);
})();
