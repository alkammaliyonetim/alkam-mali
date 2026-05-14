(function(){
  'use strict';
  var files=[
    '/alkam-cari-core-v4.js?v=core140526d'
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
      if(window.ALKAM_CARI_CORE_V4){ window.ALKAM_CARI_CORE_V4.recalc(); }
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
