export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const disabledLegacyScripts = new Map([
      ['/alkam-cari-detail-render-lock-v1.js', 'ALKAM_CARI_DETAIL_RENDER_LOCK_V1'],
      ['/alkam-cari-detail-render-lock-v2.js', 'ALKAM_CARI_DETAIL_RENDER_LOCK_V2'],
      ['/alkam-cari-history-fallback-v1.js', 'ALKAM_CARI_HISTORY_FALLBACK_V1'],
      ['/alkam-v12-wide-layout-fix-v1.js', 'ALKAM_V12_WIDE_LAYOUT_FIX_V1']
    ]);
    if (disabledLegacyScripts.has(url.pathname)) {
      const apiName = disabledLegacyScripts.get(url.pathname);
      const body = `(function(){window.${apiName}={version:'disabled-by-worker',render:function(){return false},repair:function(){return false},run:function(){return false},test:function(){return {disabled:true}},last:function(){return {disabled:true}}};})();`;
      const headers = new Headers({
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-store'
      });
      return new Response(body, { status: 200, headers });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';

    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const loader = '<script src="/alkam-cari-safe-loader-v1.js?v=loader140526d"></script>';
    const recovery = '<script src="/alkam-emergency-recovery-v2.js?v=recovery140526d"></script>';

    if (!html.includes('alkam-cari-safe-loader-v1.js')) {
      html = html.replace('</body>', loader + '</body>');
    }

    if (!html.includes('alkam-emergency-recovery-v2.js')) {
      html = html.replace('</body>', recovery + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');

    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
