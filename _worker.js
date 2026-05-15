export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    let html = await response.text();
    const list = [
      'alkam-hotfix-newest-first.js?v=20260514b',
      'alkam-hotfix-period-filter.js?v=20260514a',
      'alkam-hotfix-cari-summary.js?v=20260514a',
      'alkam-hotfix-cari-list-risk.js?v=20260514a',
      'alkam-hotfix-mobile-cari-jump.js?v=20260514a',
      'alkam-bank-import-v1.js?v=safe-bank-import-20260515a',
      'alkam-bank-onay-center-v1.js?v=safe-bank-onay-20260515a',
      'alkam-bank-cari-suggest-v1.js?v=safe-bank-cari-suggest-20260515a'
    ];
    for (const item of list) {
      const file = item.split('?')[0];
      if (!html.includes(file)) html = html.replace('</body>', '<script src="/' + item + '"></script></body>');
    }
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
