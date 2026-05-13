(function(){
  'use strict';
  var files=[
    '/alkam-cari-core-v4.js?v=core120526c',
    '/alkam-v12-wide-layout-fix-v1.js?v=layout120526c',
    '/alkam-cari-self-test-v1.js?v=test120526c',
    '/alkam-cari-history-fallback-v1.js?v=fallback120526c',
    '/alkam-cari-detail-render-lock-v1.js?v=renderlock120526c'
  ];
  function add(src,done){
    var old=document.querySelector('script[src*="'+src.split('?')[0]+'"]');
    if(old){ if(done) done(); return; }
    var s=document.createElement('script');
    s.src=src;
    s.onload=function(){ if(done) done(); };
    s.onerror=function(){ if(done) done(); };
    document.body.appendChild(s);
  }
  function after(){
    setTimeout(function(){
      if(window.ALKAM_CARI_DETAIL_RENDER_LOCK_V1){ window.ALKAM_CARI_DETAIL_RENDER_LOCK_V1.render(true); }
      if(window.ALKAM_CARI_HISTORY_FALLBACK_V1){ window.ALKAM_CARI_HISTORY_FALLBACK_V1.repair(); }
      if(window.ALKAM_CARI_SELF_TEST_V1){ window.ALKAM_CARI_SELF_TEST_V1.run(); }
    },1000);
  }
  function boot(){
    var i=0;
    function next(){
      if(i>=files.length){ after(); return; }
      add(files[i++],next);
    }
    next();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  document.addEventListener('click',function(e){
    var target=e.target;
    if(target && target.closest && target.closest('.list-item')) setTimeout(after,600);
  },true);
})();
