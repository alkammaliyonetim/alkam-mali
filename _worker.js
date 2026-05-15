export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const scripts = [
      '<script src="/alkam-bank-import-v1.js?v=bank-import-20260515a"></script>',
      '<script src="/alkam-bank-onay-center-v1.js?v=bank-onay-20260515a"></script>'
    ];
    for (const script of scripts) {
      const marker = script.match(/\/([^\/\?]+)\?/)[1];
      if (!html.includes(marker)) html = html.replace('</body>', script + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
