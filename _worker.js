export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const scripts = [
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
      '/alkam-bank-prepared-list-v1.js?v=20260514a'
    ];

    for (const src of scripts) {
      const fileName = src.split('?')[0].slice(1);
      if (!html.includes(fileName)) {
        html = html.replace('</body>', '<script src="' + src + '"></script></body>');
      }
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
