export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const newestFirst = '<script src="/alkam-hotfix-newest-first.js?v=20260514b"></script>';
    if (!html.includes('alkam-hotfix-newest-first.js')) {
      html = html.replace('</body>', newestFirst + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    headers.delete('content-length');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
};
