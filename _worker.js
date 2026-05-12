export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.set('cache-control', 'no-store');
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
