export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();
    const cariCoreScript = '<script src="/alkam-cari-core-v4.js?v=cari-core-safe-120526"></script>';
    if (!html.includes('alkam-cari-core-v4.js')) {
      html = html.replace('</body>', cariCoreScript + '</body>');
    }

    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
