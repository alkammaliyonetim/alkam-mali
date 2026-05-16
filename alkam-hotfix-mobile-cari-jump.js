// ALKAM Mali - Mobil Cari Secince Detaya Kontrollu Kaydir
(function(){
  'use strict';
  if(window.__ALKAM_MOBILE_CARI_JUMP_V3__) return;
  window.__ALKAM_MOBILE_CARI_JUMP_V3__ = true;

  var pendingJump = false;
  var lastJumpAt = 0;

  function isMobile(){ return window.matchMedia && window.matchMedia('(max-width: 900px)').matches; }
  function detailTarget(){ return document.querySelector('.hero-name') || document.getElementById('selectedCariDetail') || document.querySelector('.cari-detail-scroll'); }
  function detailWrap(){ var t=detailTarget(); return t ? (t.closest('.section,.cari-detail-scroll,#selectedCariDetail') || t) : null; }
  function listSection(){ var list=document.getElementById('cariList'); return list ? (list.closest('.section') || list) : document.querySelector('#tab-cariler .section'); }

  function go(el){
    if(!el || !isMobile()) return;
    try { el.scrollIntoView({behavior:'auto', block:'start'}); }
    catch(e){ el.scrollIntoView(true); }
  }

  function jumpToDetail(){
    if(!isMobile()) return;
    pendingJump = true;
    lastJumpAt = Date.now();
    [180, 520, 950].forEach(function(ms){
      setTimeout(function(){
        if(!pendingJump) return;
        var t = detailTarget();
        if(t){ go(t); if(Date.now()-lastJumpAt > 850) pendingJump=false; }
      }, ms);
    });
  }

  function jumpToList(){ go(listSection()); }
  function jumpToMoves(){
    var filter=document.getElementById('alkamPeriodFilterBar');
    var table=(detailWrap()||document).querySelector('table.source-statement, table');
    go(filter || table || detailTarget());
  }

  function bindList(){
    var list=document.getElementById('cariList');
    if(!list || list.dataset.alkamMobileJumpV3==='1') return;
    list.dataset.alkamMobileJumpV3='1';
    list.addEventListener('click', function(e){
      var item=e.target && e.target.closest ? e.target.closest('.list-item') : null;
      if(item) jumpToDetail();
    }, true);
  }

  function style(){
    if(document.getElementById('alkamMobileCariJumpStyleV3')) return;
    var st=document.createElement('style');
    st.id='alkamMobileCariJumpStyleV3';
    st.textContent='#alkamMobileCariNav{display:none;gap:8px;margin:8px 0 12px 0;position:relative;z-index:5;background:#f8fbff;border:1px solid #dbeafe;border-radius:12px;padding:8px;box-shadow:none}#alkamMobileCariNav button{border:0;border-radius:10px;min-height:38px;padding:8px 10px;font-size:12px;font-weight:950;flex:1}#alkamMobileCariNav .list{background:#eff6ff;color:#1d4ed8}#alkamMobileCariNav .move{background:#1769e8;color:white}@media(max-width:900px){#alkamMobileCariNav{display:flex}}';
    document.head.appendChild(st);
  }

  function nav(){
    style();
    var wrap=detailWrap();
    if(!wrap) return;
    var old=document.getElementById('alkamMobileCariNav');
    if(old){ old.style.display=isMobile()?'flex':'none'; return; }
    var n=document.createElement('div');
    n.id='alkamMobileCariNav';
    n.innerHTML='<button type="button" class="list">← Cari listesi</button><button type="button" class="move">Hareketlere git ↓</button>';
    n.querySelector('.list').onclick=jumpToList;
    n.querySelector('.move').onclick=jumpToMoves;
    wrap.insertBefore(n, wrap.firstChild);
  }

  function run(){ bindList(); nav(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('resize', run);
  var root=document.getElementById('tab-cariler') || document.body;
  if(root && window.MutationObserver){
    var timer=null;
    new MutationObserver(function(){ clearTimeout(timer); timer=setTimeout(run,180); }).observe(root,{childList:true,subtree:true});
  }
  var tries=0;
  var boot=setInterval(function(){ run(); tries++; if(tries>=12) clearInterval(boot); },500);
})();
