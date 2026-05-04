export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;

    let html = await response.text();
    const patch = '<style id="alkam-hide-islem-izi-panel">#alkamBusinessAuditPanel,#alkamAuditTrailDashboardCard,.alkam-business-audit-panel,.business-audit-panel,.audit-trail-dashboard-card{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}</style>';
    html = html.replace('</head>', patch + '</head>');

    const headers = new Headers(response.headers);
    headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    return new Response(html, { status: response.status, headers });
  }
};
