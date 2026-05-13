export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';

    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const scripts = [
      '/alkam-cari-core-v4.js?v=core120526',
      '/alkam-v12-wide-layout-fix-v1.js?v=layout120526',
      '/alkam-cari-self-test-v1.js?v=test120526'
    ].map((src) => '<script src="' + src + '"></script>').join('');

    if (!html.includes('alkam-cari-core-v4.js')) {
      html = html.replace('</body>', scripts + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');

    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
