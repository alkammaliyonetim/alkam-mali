// ALKAM Mali - Mobilde Secili Cari Sabit Baslik
// Cari detay alaninda secilen cari adini mobilde sabit gosterir.
(function(){
  'use strict';
  if(window.__ALKAM_SELECTED_CARI_STICKY_V1__) return;
  window.__ALKAM_SELECTED_CARI_STICKY_V1__ = true;

  var lastCariName = '';

  function isMobile(){
    return window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  }

  function ensureStyle(){
    if(document.getElementById('alkamSelectedCariStickyStyle')) return;
    var st = document.createElement('style');
    st.id = 'alkamSelectedCariStickyStyle';
    st.textContent = '#alkamSelectedCariSticky{display:none;position:sticky;top:0;z-index:60;margin:0 0 10px 0;border:1px solid #dbeafe;background:rgba(239,246,255,.97);backdrop-filter:blur(6px);color:#0f172a;border-radius:12px;padding:9px 11px;box-shadow:0 8px 20px rgba(15,23,42,.07)}' +
      '#alkamSelectedCariSticky .label{font-size:10px;font-weight:950;color:#1d4ed8;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}' +
      '#alkamSelectedCariSticky .name{font-size:13px;font-weight:950;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '@media(max-width:900px){#alkamSelectedCariSticky{display:block}}';
    document.head.appendChild(st);
  }

  function textOf(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
  function findDetail(){ return document.getElementById('selectedCariDetail') || document.querySelector('.cari-detail-scroll'); }
  function findWrap(){ var d = findDetail(); return d ? (d.closest('.cari-detail-scroll,.section,#selectedCariDetail') || d) : null; }

  function getCariNameFromClicked(item){
    if(!item) return '';
    var title = item.querySelector('.list-title');
    var raw = textOf(title || item);
    raw = raw.replace(/Riskli|Takip|Güncel|Kontrol/g,'').replace(/\s+/g,' ').trim();
    return raw;
  }

  function getCariNameFromDetail(){
    var detail = findDetail();
    if(!detail) return '';
    var candidates = detail.querySelectorAll('h1,h2,h3,.section-title,.detail-title,.selected-cari-title');
    for(var i=0;i<candidates.length;i++){
      var t = textOf(candidates[i]);
      if(t && t.length > 2 && t.length < 120) return t;
    }
    return '';
  }

  function install(){
    ensureStyle();
    var wrap = findWrap();
    if(!wrap) return;
    var box = document.getElementById('alkamSelectedCariSticky');
    if(!box){
      box = document.createElement('div');
      box.id = 'alkamSelectedCariSticky';
      box.innerHTML = '<div class="label">Seçili Cari</div><div class="name">Cari seçilmedi</div>';
      wrap.insertBefore(box, wrap.firstChild);
    }
    var name = lastCariName || getCariNameFromDetail() || 'Cari seçilmedi';
    var nameEl = box.querySelector('.name');
    if(nameEl) nameEl.textContent = name;
    box.style.display = isMobile() ? 'block' : 'none';
  }

  function bindList(){
    var list = document.getElementById('cariList');
    if(!list || list.dataset.alkamStickyNameBound === '1') return;
    list.dataset.alkamStickyNameBound = '1';
    list.addEventListener('click', function(e){
      var item = e.target && e.target.closest ? e.target.closest('.list-item') : null;
      if(!item) return;
      lastCariName = getCariNameFromClicked(item) || lastCariName;
      setTimeout(install, 120);
      setTimeout(install, 400);
    }, true);
  }

  function run(){ bindList(); install(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', install);
  var target = document.getElementById('tab-cariler') || document.body;
  if(target && window.MutationObserver) new MutationObserver(function(){ run(); }).observe(target,{childList:true,subtree:true});
  var tries = 0;
  var boot = setInterval(function(){ run(); tries += 1; if(tries >= 40) clearInterval(boot); }, 500);
})();
