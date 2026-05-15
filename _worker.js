export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const loginFocus = '/alkam-login-focus-only-v1.js?v=20260515b';
    const deferredScripts = [
      '/alkam-hotfix-newest-first.js?v=20260514b',
      '/alkam-hotfix-period-filter.js?v=20260514a',
      '/alkam-hotfix-cari-summary.js?v=20260514a',
      '/alkam-hotfix-cari-list-risk.js?v=20260514a',
      '/alkam-hotfix-mobile-cari-jump.js?v=20260514a',
      '/alkam-hotfix-selected-cari-sticky.js?v=20260514a',
      '/alkam-hotfix-mobile-statement-cards.js?v=20260514a',
      '/alkam-bank-import-v1.js?v=20260514a',
      '/alkam-bank-approval-v1.js?v=20260514a',
      '/alkam-bank-onay-center-v1.js?v=20260514a',
      '/alkam-bank-cari-suggest-v1.js?v=20260514a',
      '/alkam-bank-cari-prepare-v1.js?v=20260514a',
      '/alkam-bank-prepared-list-v1.js?v=20260514a',
      '/alkam-bank-post-ledger-v1.js?v=20260514a'
    ];

    if (!html.includes('alkam-login-focus-only-v1.js')) {
      html = html.replace('</body>', '<script src="' + loginFocus + '"></script></body>');
    }

    if (!html.includes('ALKAM_DEFERRED_LOADER_V1')) {
      const loader = `
<script>
(function(){
  if(window.ALKAM_DEFERRED_LOADER_V1) return;
  window.ALKAM_DEFERRED_LOADER_V1=true;
  var scripts=${JSON.stringify(deferredScripts)};
  function loggedIn(){
    try{return document.body.classList.contains('alkam-unlocked') || localStorage.getItem('alkam_local_session_v2')==='ok';}
    catch(e){return document.body.classList.contains('alkam-unlocked');}
  }
  function load(){
    if(window.ALKAM_DEFERRED_LOADER_DONE || !loggedIn()) return;
    window.ALKAM_DEFERRED_LOADER_DONE=true;
    scripts.forEach(function(src){
      var file=src.split('?')[0].slice(1);
      if(document.querySelector('script[src*="'+file+'"]')) return;
      var s=document.createElement('script');
      s.src=src;
      s.defer=true;
      document.body.appendChild(s);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
  document.addEventListener('submit',function(){setTimeout(load,250);},true);
  document.addEventListener('click',function(){setTimeout(load,250);},true);
  var n=0,t=setInterval(function(){load(); if(window.ALKAM_DEFERRED_LOADER_DONE || ++n>80) clearInterval(t);},250);
})();
</script>`;
      html = html.replace('</body>', loader + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
