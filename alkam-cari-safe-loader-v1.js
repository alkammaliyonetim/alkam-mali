(function(){
  'use strict';
  var files=[
    '/alkam-cari-core-v4.js?v=core120526',
    '/alkam-v12-wide-layout-fix-v1.js?v=layout120526',
    '/alkam-cari-self-test-v1.js?v=test120526',
    '/alkam-cari-history-fallback-v1.js?v=fallback120526',
    '/alkam-cari-detail-render-lock-v1.js?v=renderlock120526'
  ];
  function load(src){
    if(document.querySelector('script[src*="'+src.split('?')[0]+'"]')) return;
    var s=document.createElement('script');
    s.src=src;
    s.defer=true;
    document.body.appendChild(s);
  }
  function boot(){files.forEach(load)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
