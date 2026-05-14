export default {
  async fetch(request, env, ctx) {
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
